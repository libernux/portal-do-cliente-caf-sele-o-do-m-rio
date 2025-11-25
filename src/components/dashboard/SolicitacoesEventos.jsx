
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Package, Eye, CheckCircle, X, Briefcase, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";

export default function SolicitacoesEventos({ solicitacoes, onUpdate }) {
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [respostaAdmin, setRespostaAdmin] = useState("");

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === "Pendente" || s.status === "Em Análise");

  const statusColors = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Cancelada": "bg-red-100 text-red-800 border-red-300"
  };

  const handleVerDetalhes = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setRespostaAdmin(solicitacao.resposta_admin || "");
    setShowDetalhes(true);
  };

  const handleAtualizarStatus = async (status) => {
    if (!selectedSolicitacao) return;

    try {
      await SolicitacaoEvento.update(selectedSolicitacao.id, {
        ...selectedSolicitacao,
        status: status,
        resposta_admin: respostaAdmin
      });

      setShowDetalhes(false);
      setSelectedSolicitacao(null);
      setRespostaAdmin("");
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error);
      alert("Erro ao atualizar solicitação");
    }
  };

  if (solicitacoesPendentes.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-[#E5DCC8]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-[#6B4423]">
              📋 Solicitações ({solicitacoesPendentes.length})
            </CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">
              {solicitacoesPendentes.filter(s => s.status === "Pendente").length} Pendentes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {solicitacoesPendentes.slice(0, 5).map((solicitacao) => (
              <div
                key={solicitacao.id}
                className="bg-[#F5F1E8] p-4 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {solicitacao.tipo_solicitacao === "Evento" ? (
                        <Briefcase className="w-5 h-5 text-[#6B4423]" />
                      ) : (
                        <Building2 className="w-5 h-5 text-[#2D5016]" />
                      )}
                      <h4 className="font-semibold text-[#6B4423] text-lg">
                        {solicitacao.cliente_nome}
                      </h4>
                      <Badge variant="outline" className={statusColors[solicitacao.status]}>
                        {solicitacao.status}
                      </Badge>
                      <Badge variant="outline" className={
                        solicitacao.tipo_solicitacao === "Evento"
                          ? "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]"
                          : "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]"
                      }>
                        {solicitacao.tipo_solicitacao}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-[#8B7355] mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(solicitacao.data_evento), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{solicitacao.local_evento}</span>
                      </div>
                      {solicitacao.tipo_solicitacao === "Evento" && solicitacao.publico_total && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{solicitacao.publico_total} pessoas</span>
                        </div>
                      )}
                      {solicitacao.tipo_solicitacao === "Interno" && solicitacao.quantidade_funcionarios && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{solicitacao.quantidade_funcionarios} funcionários</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="font-semibold text-[#6B4423]">
                          {solicitacao.kg_total_calculado} kg ({solicitacao.pacotes_totais_calculados} pacotes)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {solicitacao.cafes_selecionados?.map((cafe, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {cafe.cafe_nome} ({cafe.quantidade_pacotes}x {cafe.embalagem || "250g"})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerDetalhes(solicitacao)}
                    className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}

            {solicitacoesPendentes.length > 5 && (
              <p className="text-center text-sm text-[#8B7355] pt-2">
                +{solicitacoesPendentes.length - 5} solicitações adicionais
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
              {selectedSolicitacao?.tipo_solicitacao === "Evento" ? (
                <Briefcase className="w-6 h-6" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
              Detalhes da Solicitação - {selectedSolicitacao?.tipo_solicitacao}
            </DialogTitle>
          </DialogHeader>

          {selectedSolicitacao && (
            <div className="space-y-6">
              {/* Cliente */}
              <Card className="border-[#E5DCC8]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Nome:</span>
                    <span className="font-semibold text-[#6B4423]">{selectedSolicitacao.cliente_nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Email:</span>
                    <span className="text-[#6B4423]">{selectedSolicitacao.email_cliente}</span>
                  </div>
                  {selectedSolicitacao.telefone_cliente && (
                    <div className="flex justify-between">
                      <span className="text-[#8B7355]">Telefone:</span>
                      <span className="text-[#6B4423]">{selectedSolicitacao.telefone_cliente}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dados Específicos */}
              <Card className="border-[#E5DCC8]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {selectedSolicitacao.tipo_solicitacao === "Evento" ? "Dados do Evento" : "Dados do Uso Interno"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Data:</span>
                    <span className="font-semibold text-[#6B4423]">
                      {format(new Date(selectedSolicitacao.data_evento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Local:</span>
                    <span className="text-[#6B4423]">{selectedSolicitacao.local_evento}</span>
                  </div>

                  {selectedSolicitacao.tipo_solicitacao === "Evento" ? (
                    <>
                      {selectedSolicitacao.publico_total && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Público Total:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.publico_total} pessoas</span>
                        </div>
                      )}
                      {selectedSolicitacao.taxa_adesao && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Taxa de Adesão:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.taxa_adesao}%</span>
                        </div>
                      )}
                      {selectedSolicitacao.consumidores_esperados && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Consumidores Esperados:</span>
                          <span className="font-semibold text-[#6B4423]">{selectedSolicitacao.consumidores_esperados} pessoas</span>
                        </div>
                      )}
                      {selectedSolicitacao.dias_evento && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Duração:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.dias_evento} {selectedSolicitacao.dias_evento === 1 ? 'dia' : 'dias'} × {selectedSolicitacao.horas_por_dia}h/dia</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedSolicitacao.quantidade_funcionarios && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Funcionários:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.quantidade_funcionarios} pessoas</span>
                        </div>
                      )}
                      {selectedSolicitacao.dias_evento && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Período:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.dias_evento} dias</span>
                        </div>
                      )}
                      {selectedSolicitacao.consumo_diario_ml && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Consumo/Dia por Pessoa:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.consumo_diario_ml}ml</span>
                        </div>
                      )}
                      {selectedSolicitacao.tamanho_xicara && (
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Tamanho da Xícara:</span>
                          <span className="text-[#6B4423]">{selectedSolicitacao.tamanho_xicara}ml</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cálculo */}
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423]/5 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Café Calculado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-lg text-white">
                    <p className="text-sm opacity-80 mb-1">Total Necessário</p>
                    <p className="text-4xl font-bold mb-1">{selectedSolicitacao.kg_total_calculado} kg</p>
                    <p className="text-sm opacity-90">{selectedSolicitacao.pacotes_totais_calculados} pacotes de 250g</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cafés Selecionados */}
              <Card className="border-[#E5DCC8]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Cafés Selecionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedSolicitacao.cafes_selecionados?.map((cafe, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                        <div>
                          <p className="font-semibold text-[#6B4423]">{cafe.cafe_nome}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[#8B7355]">{cafe.cafe_forma}</p>
                            {cafe.embalagem && (
                              <Badge variant="outline" className="bg-white text-xs">
                                {cafe.embalagem}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#6B4423]">{cafe.quantidade_pacotes}x {cafe.embalagem || "250g"}</p>
                          <p className="text-sm text-[#8B7355]">
                            {(cafe.quantidade_pacotes * (
                                cafe.embalagem === "10g" ? 0.01 :
                                cafe.embalagem === "18g" ? 0.018 :
                                cafe.embalagem === "100g" ? 0.1 :
                                cafe.embalagem === "250g" ? 0.25 :
                                cafe.embalagem === "500g" ? 0.5 :
                                0.25 // Default to 250g if embalagem is unknown or null
                              )).toFixed(3)
                            } kg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Observações do Cliente */}
              {selectedSolicitacao.observacoes && (
                <Card className="border-[#E5DCC8]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Observações do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6B4423]">{selectedSolicitacao.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Resposta do Admin */}
              <div className="space-y-2">
                <Label htmlFor="resposta">Resposta / Observações (Admin)</Label>
                <Textarea
                  id="resposta"
                  value={respostaAdmin}
                  onChange={(e) => setRespostaAdmin(e.target.value)}
                  className="border-[#E5DCC8]"
                  rows={3}
                  placeholder="Adicione observações ou resposta para o cliente..."
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetalhes(false)}
                >
                  Fechar
                </Button>
                {selectedSolicitacao.status !== "Cancelada" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleAtualizarStatus("Cancelada")}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                {selectedSolicitacao.status !== "Aprovada" && (
                  <Button
                    type="button"
                    className="bg-[#2D5016] hover:bg-[#1F3810]"
                    onClick={() => handleAtualizarStatus("Aprovada")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                )}
                {selectedSolicitacao.status === "Pendente" && (
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAtualizarStatus("Em Análise")}
                  >
                    Marcar Em Análise
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
