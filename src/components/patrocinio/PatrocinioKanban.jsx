import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye, Heart, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function PatrocinioKanban({ solicitacoes, onVerDetalhes, onMudarStatus }) {
  const colunas = [
    { id: "Nova", titulo: "🆕 Novas", cor: "bg-purple-50 border-purple-200" },
    { id: "Em Análise", titulo: "🔍 Em Análise", cor: "bg-blue-50 border-blue-200" },
    { id: "Aguardando Informações", titulo: "⏳ Aguardando Info", cor: "bg-yellow-50 border-yellow-200" },
    { id: "Aprovada", titulo: "✅ Aprovadas", cor: "bg-green-50 border-green-200" },
    { id: "Recusada", titulo: "❌ Recusadas", cor: "bg-red-50 border-red-200" }
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
    "Nova": "bg-purple-100 text-purple-800 border-purple-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aguardando Informações": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Recusada": "bg-red-100 text-red-800 border-red-300"
  };

  const tipoColors = {
    "Patrocínio": "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    "Doação": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Participação/Stand": "bg-blue-100 text-blue-800 border-blue-300"
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                      <Heart className="w-4 h-4 text-[#C9A961]" />
                                      <h4 className="font-bold text-[#6B4423] text-sm leading-tight">
                                        {solicitacao.nome_evento}
                                      </h4>
                                    </div>
                                    <Badge variant="outline" className={tipoColors[solicitacao.tipo_solicitacao]}>
                                      {solicitacao.tipo_solicitacao}
                                    </Badge>
                                  </div>

                                  <p className="text-xs text-[#8B7355] font-medium">
                                    {solicitacao.nome_organizador}
                                  </p>

                                  <div className="space-y-1.5 text-xs text-[#8B7355]">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>{format(new Date(solicitacao.data_evento), "dd/MM/yyyy", { locale: ptBR })}</span>
                                      {solicitacao.duracao_dias > 1 && (
                                        <Badge variant="outline" className="text-xs">
                                          {solicitacao.duracao_dias}d
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5" />
                                      <span className="truncate">{solicitacao.local_evento}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5" />
                                      <span>{solicitacao.publico_esperado} pessoas</span>
                                    </div>
                                  </div>

                                  {solicitacao.pontuacao_total > 0 && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-[#E5DCC8]">
                                      <TrendingUp className="w-4 h-4 text-[#C9A961]" />
                                      <span className="text-sm font-bold text-[#6B4423]">
                                        Score: {solicitacao.pontuacao_total}/30
                                      </span>
                                    </div>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onVerDetalhes(solicitacao)}
                                    className="w-full h-7 px-2 hover:bg-[#F5F1E8] text-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Ver Detalhes
                                  </Button>
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