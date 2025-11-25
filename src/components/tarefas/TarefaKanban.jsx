import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, Tag, User, Clock, AlertTriangle } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColumns = [
  { id: "A Fazer", title: "A Fazer", color: "bg-gray-600", icon: "📋" },
  { id: "Em Andamento", title: "Em Andamento", color: "bg-[#C9A961]", icon: "🔄" },
  { id: "Em Revisão", title: "Em Revisão", color: "bg-blue-600", icon: "👀" },
  { id: "Concluído", title: "Concluído", color: "bg-[#2D5016]", icon: "✅" }
];

const prioridadeConfig = {
  "Baixa": { color: "bg-blue-100 text-blue-800", border: "border-blue-300" },
  "Média": { color: "bg-[#C9A961]/20 text-[#8B7355]", border: "border-[#C9A961]/30" },
  "Alta": { color: "bg-orange-100 text-orange-800", border: "border-orange-300" },
  "Urgente": { color: "bg-red-100 text-red-800", border: "border-red-300" }
};

const tipoConfig = {
  "Desenvolvimento": "bg-purple-100 text-purple-800",
  "Logística": "bg-[#6B4423]/10 text-[#6B4423]",
  "Estoque": "bg-[#2D5016]/10 text-[#2D5016]",
  "Atendimento": "bg-[#C9A961]/20 text-[#8B7355]",
  "Administrativo": "bg-blue-100 text-blue-800",
  "Outro": "bg-gray-100 text-gray-800"
};

export default function TarefaKanban({ tarefas, etiquetas, responsaveis, onStatusChange, onEdit, onDelete }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination, source } = result;
    
    // Se soltou na mesma coluna, não fazer nada
    if (destination.droppableId === source.droppableId) return;
    
    const tarefa = tarefas.find(t => t.id === draggableId);
    
    if (tarefa && tarefa.status !== destination.droppableId) {
      onStatusChange(tarefa.id, destination.droppableId);
    }
  };

  const getEtiqueta = (etiquetaId) => {
    return etiquetas.find(e => e.id === etiquetaId);
  };

  const getTarefasPorStatus = (status) => {
    return tarefas.filter(t => t.status === status);
  };

  const isPrazoVencido = (prazo, status) => {
    if (!prazo || status === "Concluído") return false;
    return isPast(new Date(prazo));
  };

  const getDiasRestantes = (prazo) => {
    if (!prazo) return null;
    const dias = differenceInDays(new Date(prazo), new Date());
    return dias;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnTarefas = getTarefasPorStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} text-white rounded-t-xl p-4 shadow-sm`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>{column.icon}</span>
                  {column.title}
                </h3>
                <p className="text-sm opacity-90">{columnTarefas.length} {columnTarefas.length === 1 ? 'tarefa' : 'tarefas'}</p>
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
                    {columnTarefas.map((tarefa, index) => {
                      const prazoVencido = isPrazoVencido(tarefa.prazo, tarefa.status);
                      const diasRestantes = getDiasRestantes(tarefa.prazo);
                      const prioridadeStyle = prioridadeConfig[tarefa.prioridade] || prioridadeConfig["Média"];

                      return (
                        <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group p-4 bg-white border-[#E5DCC8] cursor-grab active:cursor-grabbing hover:shadow-lg transition-all ${
                                snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                              } ${prazoVencido ? 'ring-2 ring-red-500' : ''}`}
                            >
                              <div className="space-y-3">
                                {/* Header com Título e Ações */}
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-[#6B4423] flex-1 leading-tight">
                                    {tarefa.titulo}
                                  </h4>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-[#6B4423]/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(tarefa);
                                      }}
                                      title="Editar tarefa"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-[#6B4423]" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(tarefa.id);
                                      }}
                                      title="Excluir tarefa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Descrição */}
                                {tarefa.descricao && (
                                  <p className="text-sm text-[#8B7355] line-clamp-2">
                                    {tarefa.descricao}
                                  </p>
                                )}

                                {/* Badges de Prioridade e Tipo */}
                                <div className="flex flex-wrap gap-1.5">
                                  <Badge className={`${prioridadeStyle.color} text-xs`}>
                                    {tarefa.prioridade}
                                  </Badge>
                                  
                                  {tarefa.tipo && (
                                    <Badge className={`${tipoConfig[tarefa.tipo]} text-xs`}>
                                      {tarefa.tipo}
                                    </Badge>
                                  )}

                                  {/* Etiquetas */}
                                  {tarefa.etiquetas && tarefa.etiquetas.map(etiquetaId => {
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

                                {/* Informações Adicionais */}
                                <div className="space-y-2 pt-2 border-t border-[#E5DCC8]">
                                  {/* Responsável */}
                                  {tarefa.responsavel && (
                                    <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                                      <User className="w-3.5 h-3.5" />
                                      <span>{tarefa.responsavel}</span>
                                    </div>
                                  )}

                                  {/* Prazo */}
                                  {tarefa.prazo && (
                                    <div className={`flex items-center justify-between gap-2 text-xs ${
                                      prazoVencido ? 'text-red-600 font-semibold' : 'text-[#8B7355]'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{format(new Date(tarefa.prazo), "dd/MM/yyyy", { locale: ptBR })}</span>
                                      </div>
                                      {diasRestantes !== null && tarefa.status !== "Concluído" && (
                                        <div className="flex items-center gap-1">
                                          {prazoVencido ? (
                                            <>
                                              <AlertTriangle className="w-3 h-3" />
                                              <span>Vencido</span>
                                            </>
                                          ) : diasRestantes <= 2 ? (
                                            <>
                                              <Clock className="w-3 h-3 text-orange-600" />
                                              <span className="text-orange-600 font-medium">{diasRestantes}d</span>
                                            </>
                                          ) : (
                                            <>
                                              <Clock className="w-3 h-3" />
                                              <span>{diasRestantes}d</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Tempo Estimado */}
                                  {tarefa.tempo_estimado && (
                                    <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{tarefa.tempo_estimado}h estimadas</span>
                                    </div>
                                  )}
                                </div>
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