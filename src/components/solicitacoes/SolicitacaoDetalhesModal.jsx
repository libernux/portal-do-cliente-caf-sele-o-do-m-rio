
import React, { useState, useEffect } from "react";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";
import { AtualizacaoSolicitacao } from "@/entities/AtualizacaoSolicitacao";
import { User } from "@/entities/User";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Package, 
  Coffee,
  CheckCircle, 
  X, 
  MessageSquare,
  Clock,
  User as UserIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function SolicitacaoDetalhesModal({ open, onClose, solicitacao, onUpdate }) {
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (open && solicitacao) {
      setNovoStatus(solicitacao.status);
      loadAtualizacoes();
    }
  }, [open, solicitacao]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadAtualizacoes = async () => {
    setIsLoading(true);
    try {
      const atualizacoesData = await AtualizacaoSolicitacao.filter({
        solicitacao_id: solicitacao.id
      });
      setAtualizacoes(atualizacoesData.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ));
    } catch (error) {
      console.error("Erro ao carregar atualizações:", error);
    }
    setIsLoading(false);
  };

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim() || !currentUser) return;

    setIsSaving(true);
    try {
      await AtualizacaoSolicitacao.create({
        solicitacao_id: solicitacao.id,
        tipo: "Comentário",
        comentario: novoComentario,
        autor: currentUser.full_name,
        autor_email: currentUser.email
      });

      setNovoComentario("");
      loadAtualizacoes();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Erro ao adicionar comentário");
    }
    setIsSaving(false);
  };

  const handleMudarStatus = async () => {
    if (!novoComentario.trim()) {
      alert("Por favor, adicione um comentário sobre a mudança de status");
      return;
    }

    if (novoStatus === solicitacao.status) {
      alert("O status não foi alterado");
      return;
    }

    if (!currentUser) return;

    setIsSaving(true);
    try {
      // Atualizar status da solicitação
      await SolicitacaoEvento.update(solicitacao.id, {
        ...solicitacao,
        status: novoStatus
      });

      // Criar atualização
      await AtualizacaoSolicitacao.create({
        solicitacao_id: solicitacao.id,
        tipo: "Mudança Status",
        status_anterior: solicitacao.status,
        status_novo: novoStatus,
        comentario: novoComentario,
        autor: currentUser.full_name,
        autor_email: currentUser.email
      });

      setNovoComentario("");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao mudar status:", error);
      alert("Erro ao mudar status");
    }
    setIsSaving(false);
  };

  if (!solicitacao) return null;

  const statusColors = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Cancelada": "bg-red-100 text-red-800 border-red-300"
  };

  const tipoIcons = {
    "Comentário": MessageSquare,
    "Mudança Status": CheckCircle,
    "Aprovação": CheckCircle,
    "Cancelamento": X,
    "Observação": MessageSquare
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Detalhes da Solicitação
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Informações */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cliente */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Nome:</span>
                  <span className="font-semibold text-[#6B4423]">{solicitacao.cliente_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Email:</span>
                  <span className="text-[#6B4423]">{solicitacao.email_cliente}</span>
                </div>
                {solicitacao.telefone_cliente && (
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Telefone:</span>
                    <span className="text-[#6B4423]">{solicitacao.telefone_cliente}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Tipo:</span>
                  <Badge variant="outline" className={
                    solicitacao.tipo_solicitacao === "Evento"
                      ? "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]"
                      : "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]"
                  }>
                    {solicitacao.tipo_solicitacao}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Evento/Uso */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {solicitacao.tipo_solicitacao === "Evento" ? "Dados do Evento" : "Dados do Uso Interno"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Data:</span>
                  <span className="font-semibold text-[#6B4423]">
                    {format(new Date(solicitacao.data_evento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Local:</span>
                  <span className="text-[#6B4423]">{solicitacao.local_evento}</span>
                </div>

                {solicitacao.tipo_solicitacao === "Evento" ? (
                  <>
                    {solicitacao.publico_total && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Público Total:</span>
                        <span className="text-[#6B4423]">{solicitacao.publico_total} pessoas</span>
                      </div>
                    )}
                    {solicitacao.taxa_adesao && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Taxa de Adesão:</span>
                        <span className="text-[#6B4423]">{solicitacao.taxa_adesao}%</span>
                      </div>
                    )}
                    {solicitacao.consumidores_esperados && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Consumidores Esperados:</span>
                        <span className="font-semibold text-[#6B4423]">{solicitacao.consumidores_esperados} pessoas</span>
                      </div>
                    )}
                    {solicitacao.dias_evento && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Duração:</span>
                        <span className="text-[#6B4423]">{solicitacao.dias_evento} {solicitacao.dias_evento === 1 ? 'dia' : 'dias'}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {solicitacao.quantidade_funcionarios && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Funcionários:</span>
                        <span className="text-[#6B4423]">{solicitacao.quantidade_funcionarios} pessoas</span>
                      </div>
                    )}
                    {solicitacao.dias_evento && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Período:</span>
                        <span className="text-[#6B4423]">{solicitacao.dias_evento} dias</span>
                      </div>
                    )}
                    {solicitacao.consumo_diario_ml && (
                      <div className="flex justify-between">
                        <span className="text-[#8B7355]">Consumo Diário:</span>
                        <span className="text-[#6B4423]">{solicitacao.consumo_diario_ml}ml por pessoa</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Café Calculado */}
            <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423]/5 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Café Necessário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-lg text-white">
                  <p className="text-sm opacity-80 mb-1">Total Calculado</p>
                  <p className="text-4xl font-bold mb-1">{solicitacao.kg_total_calculado} kg</p>
                  <p className="text-sm opacity-90">{solicitacao.pacotes_totais_calculados} pacotes de 250g</p>
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
                  {solicitacao.cafes_selecionados?.map((cafe, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg">
                      <div>
                        <p className="font-semibold text-[#6B4423]">{cafe.cafe_nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-[#8B7355]">{cafe.cafe_forma}</p>
                          {cafe.embalagem && (
                            <Badge variant="outline" className="bg-white text-xs">
                              {cafe.embalagem}
                              {(cafe.embalagem === "10g" || cafe.embalagem === "18g") && " (Drip)"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#6B4423]">{cafe.quantidade_pacotes}x</p>
                        <p className="text-sm text-[#8B7355]">
                          {cafe.embalagem 
                            ? (cafe.quantidade_pacotes * (
                                cafe.embalagem === "10g" ? 0.01 :
                                cafe.embalagem === "18g" ? 0.018 :
                                cafe.embalagem === "100g" ? 0.1 :
                                cafe.embalagem === "250g" ? 0.25 :
                                cafe.embalagem === "500g" ? 0.5 :
                                1 // Default to 1kg if packaging is unknown, though current options are exhaustive.
                              )).toFixed(3) // Using toFixed(3) for more precision with smaller packages
                            : (cafe.quantidade_pacotes * 0.25).toFixed(2)
                          } kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            {solicitacao.observacoes && (
              <Card className="border-[#E5DCC8]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Observações do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B4423]">{solicitacao.observacoes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Direita: Status e Timeline */}
          <div className="space-y-4">
            {/* Status Atual */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger className="border-[#E5DCC8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">📋 Pendente</SelectItem>
                    <SelectItem value="Em Análise">👁️ Em Análise</SelectItem>
                    <SelectItem value="Aprovada">✅ Aprovada</SelectItem>
                    <SelectItem value="Cancelada">❌ Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>Comentário {novoStatus !== solicitacao.status && "(Obrigatório)"}</Label>
                  <Textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    className="border-[#E5DCC8]"
                    rows={3}
                    placeholder="Adicione um comentário ou observação..."
                  />
                </div>

                {novoStatus !== solicitacao.status ? (
                  <Button
                    onClick={handleMudarStatus}
                    disabled={isSaving || !novoComentario.trim()}
                    className="w-full bg-[#2D5016] hover:bg-[#1F3810]"
                  >
                    {isSaving ? "Salvando..." : "Alterar Status"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleAdicionarComentario}
                    disabled={isSaving || !novoComentario.trim()}
                    variant="outline"
                    className="w-full border-[#6B4423] text-[#6B4423]"
                  >
                    {isSaving ? "Salvando..." : "Adicionar Comentário"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
                  </div>
                ) : atualizacoes.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {atualizacoes.map((atualizacao, index) => {
                      const Icon = tipoIcons[atualizacao.tipo] || MessageSquare;
                      
                      return (
                        <motion.div
                          key={atualizacao.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-l-2 border-[#E5DCC8] pl-4 pb-3 relative"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6B4423] rounded-full"></div>
                          
                          <div className="flex items-start gap-2 mb-1">
                            <Icon className="w-4 h-4 text-[#6B4423] mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-[#8B7355]">
                                {atualizacao.autor} • {format(new Date(atualizacao.created_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                              </p>
                              {atualizacao.tipo === "Mudança Status" && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Badge variant="outline" className={statusColors[atualizacao.status_anterior] + " text-xs"}>
                                    {atualizacao.status_anterior}
                                  </Badge>
                                  <span className="text-xs text-[#8B7355]">→</span>
                                  <Badge variant="outline" className={statusColors[atualizacao.status_novo] + " text-xs"}>
                                    {atualizacao.status_novo}
                                  </Badge>
                                </div>
                              )}
                              <p className="text-sm text-[#6B4423] mt-1">{atualizacao.comentario}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#8B7355] text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma atualização ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
