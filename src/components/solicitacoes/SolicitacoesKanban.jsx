import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Package, Eye, Briefcase, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function SolicitacoesKanban({ solicitacoes, onVerDetalhes, onMudarStatus }) {
  const colunas = [
    { id: "Pendente", titulo: "📋 Pendente", cor: "bg-yellow-50 border-yellow-200" },
    { id: "Em Análise", titulo: "👁️ Em Análise", cor: "bg-blue-50 border-blue-200" },
    { id: "Aprovada", titulo: "✅ Aprovada", cor: "bg-green-50 border-green-200" },
    { id: "Cancelada", titulo: "❌ Cancelada", cor: "bg-red-50 border-red-200" }
  ];

  const getSolicitacoesPorStatus = (status) => {
    return solicitacoes.filter(s => s.status === status);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const solicitacaoId = result.draggableId;
    const novoStatus = result.destination.droppableId;
    const solicitacao = solicitacoes.find(s => s.id === solicitacaoId);
    
    if (solicitacao && solicitacao.status !== novoStatus) {
      onMudarStatus(solicitacao, novoStatus);
    }
  };

  const statusColors = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Cancelada": "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colunas.map((coluna) => {
          const solicitacoesColuna = getSolicitacoesPorStatus(coluna.id);
          
          return (
            <div key={coluna.id} className="flex flex-col">
              <div className={`${coluna.cor} border-2 rounded-t-lg p-4 font-semibold text-[#6B4423] flex items-center justify-between`}>
                <span>{coluna.titulo}</span>
                <Badge variant="outline" className="bg-white">
                  {solicitacoesColuna.length}
                </Badge>
              </div>

              <Droppable droppableId={coluna.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 border-2 border-t-0 rounded-b-lg min-h-[500px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } ${coluna.cor}`}
                  >
                    {solicitacoesColuna.map((solicitacao, index) => (
                      <Draggable
                        key={solicitacao.id}
                        draggableId={solicitacao.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
                            >
                              <Card className="border-[#E5DCC8] bg-white hover:shadow-lg transition-all cursor-move">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {solicitacao.tipo_solicitacao === "Evento" ? (
                                        <Briefcase className="w-4 h-4 text-[#6B4423]" />
                                      ) : (
                                        <Building2 className="w-4 h-4 text-[#2D5016]" />
                                      )}
                                      <h4 className="font-bold text-[#6B4423] text-sm leading-tight">
                                        {solicitacao.cliente_nome}
                                      </h4>
                                    </div>
                                    <Badge variant="outline" className={
                                      solicitacao.tipo_solicitacao === "Evento"
                                        ? "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961] text-xs"
                                        : "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016] text-xs"
                                    }>
                                      {solicitacao.tipo_solicitacao}
                                    </Badge>
                                  </div>

                                  <div className="space-y-1.5 text-xs text-[#8B7355]">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>{format(new Date(solicitacao.data_evento), "dd/MM/yyyy", { locale: ptBR })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5" />
                                      <span className="truncate">{solicitacao.local_evento}</span>
                                    </div>
                                    {solicitacao.tipo_solicitacao === "Evento" && solicitacao.publico_total && (
                                      <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{solicitacao.publico_total} pessoas</span>
                                      </div>
                                    )}
                                    {solicitacao.tipo_solicitacao === "Interno" && solicitacao.quantidade_funcionarios && (
                                      <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{solicitacao.quantidade_funcionarios} funcionários</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-[#E5DCC8] flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Package className="w-4 h-4 text-[#2D5016]" />
                                      <span className="text-sm font-bold text-[#6B4423]">
                                        {solicitacao.kg_total_calculado} kg
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onVerDetalhes(solicitacao)}
                                      className="h-7 px-2 hover:bg-[#F5F1E8]"
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1" />
                                      Ver
                                    </Button>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {solicitacao.cafes_selecionados?.slice(0, 2).map((cafe, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs bg-[#F5F1E8]">
                                        {cafe.cafe_nome}
                                      </Badge>
                                    ))}
                                    {solicitacao.cafes_selecionados?.length > 2 && (
                                      <Badge variant="outline" className="text-xs bg-[#F5F1E8]">
                                        +{solicitacao.cafes_selecionados.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {solicitacoesColuna.length === 0 && (
                      <div className="flex items-center justify-center h-40 text-[#8B7355] text-sm opacity-50">
                        Nenhuma solicitação
                      </div>
                    )}
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