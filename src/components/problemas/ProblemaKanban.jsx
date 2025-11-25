import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Edit, Tag, MessageSquare } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const statusColumns = [
  { id: "Aberto", title: "Aberto", color: "bg-[#D97706]" },
  { id: "Em Andamento", title: "Em Andamento", color: "bg-[#C9A961]" },
  { id: "Aguardando", title: "Aguardando", color: "bg-blue-600" },
  { id: "Resolvido", title: "Resolvido", color: "bg-[#2D5016]" }
];

const prioridadeConfig = {
  "Baixa": "bg-blue-100 text-blue-800",
  "Média": "bg-[#C9A961]/20 text-[#8B7355]",
  "Alta": "bg-orange-100 text-orange-800",
  "Urgente": "bg-red-100 text-red-800"
};

export default function ProblemaKanban({ problemas, etiquetas, onStatusChange, onEdit }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const problema = problemas.find(p => p.id === draggableId);
    
    if (problema && problema.status !== destination.droppableId) {
      onStatusChange(problema, destination.droppableId);
    }
  };

  const getEtiqueta = (etiquetaId) => {
    return etiquetas.find(e => e.id === etiquetaId);
  };

  const getProblemasPorStatus = (status) => {
    return problemas.filter(p => p.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnProblemas = getProblemasPorStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} text-white rounded-t-xl p-4 shadow-sm`}>
                <h3 className="font-bold text-lg">{column.title}</h3>
                <p className="text-sm opacity-90">{columnProblemas.length} {columnProblemas.length === 1 ? 'item' : 'itens'}</p>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-[#F5F1E8] rounded-b-xl p-3 space-y-3 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-[#E5DCC8]' : ''
                    }`}
                  >
                    {columnProblemas.map((problema, index) => {
                      const diasAberto = problema.data_abertura 
                        ? differenceInDays(new Date(), new Date(problema.data_abertura))
                        : 0;

                      return (
                        <Draggable key={problema.id} draggableId={problema.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white border-[#E5DCC8] cursor-grab active:cursor-grabbing hover:shadow-lg transition-all relative ${
                                snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                              } ${
                                problema.tem_novas_atualizacoes ? 'ring-2 ring-[#2D5016]' : ''
                              }`}
                            >
                              {/* Indicador de Nova Interação */}
                              {problema.tem_novas_atualizacoes && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2D5016] rounded-full flex items-center justify-center shadow-md">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}

                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-[#6B4423] flex-1 leading-tight">
                                    {problema.nome_cliente}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 hover:opacity-100 transition-opacity"
                                    onClick={() => onEdit(problema)}
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#6B4423]" />
                                  </Button>
                                </div>

                                {problema.email_cliente && (
                                  <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{problema.email_cliente}</span>
                                  </div>
                                )}

                                <p className="text-sm text-[#8B7355] line-clamp-2">
                                  {problema.descricao}
                                </p>

                                {problema.tem_novas_atualizacoes && (
                                  <div className="bg-[#2D5016]/10 px-2 py-1 rounded flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3 text-[#2D5016]" />
                                    <span className="text-xs text-[#2D5016] font-medium">Nova interação!</span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1.5">
                                  <Badge className={prioridadeConfig[problema.prioridade]} size="sm">
                                    {problema.prioridade}
                                  </Badge>
                                  
                                  {problema.etiquetas && problema.etiquetas.map(etiquetaId => {
                                    const etiqueta = getEtiqueta(etiquetaId);
                                    if (!etiqueta) return null;
                                    
                                    return (
                                      <Badge 
                                        key={etiquetaId}
                                        style={{ 
                                          backgroundColor: `${etiqueta.cor}15`,
                                          color: etiqueta.cor,
                                          borderColor: `${etiqueta.cor}30`
                                        }}
                                        variant="outline"
                                        className="border text-xs"
                                      >
                                        <Tag className="w-2.5 h-2.5 mr-1" />
                                        {etiqueta.nome}
                                      </Badge>
                                    );
                                  })}
                                </div>

                                {problema.data_abertura && (
                                  <div className="pt-2 border-t border-[#E5DCC8] text-xs text-[#8B7355]">
                                    {format(new Date(problema.data_abertura), "dd/MM/yyyy")}
                                    {diasAberto > 0 && problema.status !== "Resolvido" && (
                                      <span className="ml-2 text-[#D97706] font-medium">
                                        • {diasAberto}d
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}