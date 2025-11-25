import React, { useState, useEffect } from "react";
import { SolicitacaoPatrocinio } from "@/entities/SolicitacaoPatrocinio";
import { AtualizacaoPatrocinio } from "@/entities/AtualizacaoPatrocinio";
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
import { Input } from "@/components/ui/input";
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
  Heart,
  CheckCircle, 
  X, 
  MessageSquare,
  Clock,
  Mail,
  Phone,
  TrendingUp,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function PatrocinioDetalhesModal({ open, onClose, solicitacao, onUpdate }) {
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Avaliação
  const [pontuacaoAlinhamento, setPontuacaoAlinhamento] = useState(0);
  const [pontuacaoVisibilidade, setPontuacaoVisibilidade] = useState(0);
  const [pontuacaoROI, setPontuacaoROI] = useState(0);

  // Decisão
  const [decisaoFinal, setDecisaoFinal] = useState("Pendente");
  const [nivelPatrocinio, setNivelPatrocinio] = useState("Não se aplica");
  const [quantidadeCafeAprovada, setQuantidadeCafeAprovada] = useState("");
  const [outrosRecursos, setOutrosRecursos] = useState("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (open && solicitacao) {
      setNovoStatus(solicitacao.status);
      setPontuacaoAlinhamento(solicitacao.pontuacao_alinhamento || 0);
      setPontuacaoVisibilidade(solicitacao.pontuacao_visibilidade || 0);
      setPontuacaoROI(solicitacao.pontuacao_roi || 0);
      setDecisaoFinal(solicitacao.decisao_final || "Pendente");
      setNivelPatrocinio(solicitacao.nivel_patrocinio || "Não se aplica");
      setQuantidadeCafeAprovada(solicitacao.quantidade_cafe_aprovada || "");
      setOutrosRecursos(solicitacao.outros_recursos || "");
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
      const atualizacoesData = await AtualizacaoPatrocinio.filter({
        patrocinio_id: solicitacao.id
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
      await AtualizacaoPatrocinio.create({
        patrocinio_id: solicitacao.id,
        tipo: "Comentário",
        comentario: novoComentario,
        autor: currentUser.full_name,
        autor_email: currentUser.email,
        visivel_solicitante: false
      });

      setNovoComentario("");
      loadAtualizacoes();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Erro ao adicionar comentário");
    }
    setIsSaving(false);
  };

  const handleSalvarAvaliacao = async () => {
    setIsSaving(true);
    try {
      const pontuacaoTotal = pontuacaoAlinhamento + pontuacaoVisibilidade + pontuacaoROI;

      await SolicitacaoPatrocinio.update(solicitacao.id, {
        pontuacao_alinhamento: pontuacaoAlinhamento,
        pontuacao_visibilidade: pontuacaoVisibilidade,
        pontuacao_roi: pontuacaoROI,
        pontuacao_total: pontuacaoTotal,
        decisao_final: decisaoFinal,
        nivel_patrocinio: nivelPatrocinio,
        quantidade_cafe_aprovada: parseFloat(quantidadeCafeAprovada) || 0,
        outros_recursos: outrosRecursos,
        responsavel_analise: currentUser?.full_name || ""
      });

      await AtualizacaoPatrocinio.create({
        patrocinio_id: solicitacao.id,
        tipo: "Avaliação",
        comentario: `Avaliação registrada: Score ${pontuacaoTotal}/30 (Alinhamento: ${pontuacaoAlinhamento}, Visibilidade: ${pontuacaoVisibilidade}, ROI: ${pontuacaoROI})`,
        autor: currentUser.full_name,
        autor_email: currentUser.email,
        visivel_solicitante: false
      });

      alert("Avaliação salva com sucesso!");
      onUpdate();
      loadAtualizacoes();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      alert("Erro ao salvar avaliação");
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
      await SolicitacaoPatrocinio.update(solicitacao.id, {
        status: novoStatus
      });

      await AtualizacaoPatrocinio.create({
        patrocinio_id: solicitacao.id,
        tipo: "Mudança Status",
        status_anterior: solicitacao.status,
        status_novo: novoStatus,
        comentario: novoComentario,
        autor: currentUser.full_name,
        autor_email: currentUser.email,
        visivel_solicitante: false
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
    "Nova": "bg-purple-100 text-purple-800 border-purple-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aguardando Informações": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Recusada": "bg-red-100 text-red-800 border-red-300"
  };

  const tipoIcons = {
    "Comentário": MessageSquare,
    "Mudança Status": CheckCircle,
    "Avaliação": Star,
    "Decisão": CheckCircle,
    "Comunicação": Mail
  };

  const pontuacaoTotal = pontuacaoAlinhamento + pontuacaoVisibilidade + pontuacaoROI;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Detalhes da Solicitação de Patrocínio
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda e Centro: Informações */}
          <div className="lg:col-span-2 space-y-4">
            {/* Dados do Solicitante */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dados do Solicitante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Organizador:</span>
                  <span className="font-semibold text-[#6B4423]">{solicitacao.nome_organizador}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8B7355] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email:
                  </span>
                  <a href={`mailto:${solicitacao.email_contato}`} className="text-[#6B4423] hover:underline">
                    {solicitacao.email_contato}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8B7355] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Telefone:
                  </span>
                  <a href={`tel:${solicitacao.telefone_contato}`} className="text-[#6B4423] hover:underline">
                    {solicitacao.telefone_contato}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Evento */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Dados do Evento
                  <Badge variant="outline" className={
                    solicitacao.tipo_solicitacao === "Patrocínio" 
                      ? "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]"
                      : solicitacao.tipo_solicitacao === "Doação"
                      ? "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }>
                    {solicitacao.tipo_solicitacao}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Nome:</span>
                  <span className="font-semibold text-[#6B4423]">{solicitacao.nome_evento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Tipo:</span>
                  <span className="text-[#6B4423]">{solicitacao.tipo_evento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Data:</span>
                  <span className="font-semibold text-[#6B4423]">
                    {format(new Date(solicitacao.data_evento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Duração:</span>
                  <span className="text-[#6B4423]">{solicitacao.duracao_dias} {solicitacao.duracao_dias === 1 ? 'dia' : 'dias'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Local:</span>
                  <span className="text-[#6B4423]">{solicitacao.local_evento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Público Esperado:</span>
                  <span className="font-semibold text-[#6B4423]">{solicitacao.publico_esperado} pessoas</span>
                </div>
                {solicitacao.cafe_necessario_kg > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#8B7355]">Café Estimado:</span>
                    <span className="font-semibold text-[#6B4423]">{solicitacao.cafe_necessario_kg} kg</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descrição e Proposta */}
            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Descrição do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B4423] whitespace-pre-wrap">{solicitacao.descricao_evento}</p>
              </CardContent>
            </Card>

            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Proposta de Patrocínio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B4423] whitespace-pre-wrap">{solicitacao.proposta_patrocinio}</p>
              </CardContent>
            </Card>

            <Card className="border-[#E5DCC8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Benefícios de Visibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B4423] whitespace-pre-wrap">{solicitacao.beneficios_visibilidade}</p>
              </CardContent>
            </Card>

            {solicitacao.midia_redes_sociais && (
              <Card className="border-[#E5DCC8]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Redes Sociais / Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B4423]">{solicitacao.midia_redes_sociais}</p>
                </CardContent>
              </Card>
            )}

            {/* Avaliação e Decisão */}
            <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#F5F1E8] to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                  Avaliação e Decisão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Visual */}
                <div className="bg-white p-4 rounded-lg border border-[#E5DCC8]">
                  <div className="text-center mb-4">
                    <p className="text-sm text-[#8B7355] mb-1">Score Total</p>
                    <p className="text-4xl font-bold text-[#6B4423]">
                      {pontuacaoTotal}<span className="text-xl">/30</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Alinhamento</p>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={pontuacaoAlinhamento}
                        onChange={(e) => setPontuacaoAlinhamento(parseInt(e.target.value) || 0)}
                        className="text-center font-bold text-[#6B4423]"
                      />
                      <p className="text-xs text-[#8B7355] mt-1">/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">Visibilidade</p>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={pontuacaoVisibilidade}
                        onChange={(e) => setPontuacaoVisibilidade(parseInt(e.target.value) || 0)}
                        className="text-center font-bold text-[#6B4423]"
                      />
                      <p className="text-xs text-[#8B7355] mt-1">/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">ROI</p>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={pontuacaoROI}
                        onChange={(e) => setPontuacaoROI(parseInt(e.target.value) || 0)}
                        className="text-center font-bold text-[#6B4423]"
                      />
                      <p className="text-xs text-[#8B7355] mt-1">/10</p>
                    </div>
                  </div>
                </div>

                {/* Decisão */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Decisão Final</Label>
                      <Select value={decisaoFinal} onValueChange={setDecisaoFinal}>
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Aprovado Total">Aprovado Total</SelectItem>
                          <SelectItem value="Aprovado Parcial">Aprovado Parcial</SelectItem>
                          <SelectItem value="Recusado">Recusado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Nível de Patrocínio</Label>
                      <Select value={nivelPatrocinio} onValueChange={setNivelPatrocinio}>
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Não se aplica">Não se aplica</SelectItem>
                          <SelectItem value="Bronze">Bronze</SelectItem>
                          <SelectItem value="Prata">Prata</SelectItem>
                          <SelectItem value="Ouro">Ouro</SelectItem>
                          <SelectItem value="Diamante">Diamante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Quantidade de Café Aprovada (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={quantidadeCafeAprovada}
                      onChange={(e) => setQuantidadeCafeAprovada(e.target.value)}
                      className="border-[#E5DCC8]"
                      placeholder="Ex: 50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Outros Recursos Aprovados</Label>
                    <Textarea
                      value={outrosRecursos}
                      onChange={(e) => setOutrosRecursos(e.target.value)}
                      className="border-[#E5DCC8]"
                      rows={2}
                      placeholder="Ex: Stand, equipe, equipamentos..."
                    />
                  </div>

                  <Button
                    onClick={handleSalvarAvaliacao}
                    disabled={isSaving}
                    className="w-full bg-[#C9A961] hover:bg-[#B8935A]"
                  >
                    {isSaving ? "Salvando..." : "Salvar Avaliação"}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                    <SelectItem value="Nova">🆕 Nova</SelectItem>
                    <SelectItem value="Em Análise">🔍 Em Análise</SelectItem>
                    <SelectItem value="Aguardando Informações">⏳ Aguardando Info</SelectItem>
                    <SelectItem value="Aprovada">✅ Aprovada</SelectItem>
                    <SelectItem value="Recusada">❌ Recusada</SelectItem>
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