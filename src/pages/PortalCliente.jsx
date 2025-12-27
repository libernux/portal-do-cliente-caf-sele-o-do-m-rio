import React, { useState } from "react";
import { Problema } from "@/entities/Problema";
import { AtualizacaoProblema } from "@/entities/AtualizacaoProblema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Mail, Clock, MessageSquare, Coffee, Plus, X, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function PortalCliente() {
  const [email, setEmail] = useState("");
  const [problemas, setProblemas] = useState([]);
  const [atualizacoes, setAtualizacoes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedProblema, setSelectedProblema] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [novaResposta, setNovaResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [formData, setFormData] = useState({
    nome_cliente: "",
    email_cliente: "",
    telefone_cliente: "",
    descricao: "",
    tipo: "Outro",
    prioridade: "Média"
  });

  const handleBuscar = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setSearched(true);
    
    try {
      const problemasData = await Problema.filter({ email_cliente: email }, "-created_date");
      setProblemas(problemasData);

      // Buscar atualizações para cada problema
      const atualizacoesMap = {};
      for (const problema of problemasData) {
        const atualiz = await AtualizacaoProblema.filter({
          problema_id: problema.id,
          visivel_cliente: true
        }, "-created_date");
        atualizacoesMap[problema.id] = atualiz;
      }
      setAtualizacoes(atualizacoesMap);
    } catch (error) {
      console.error("Erro ao buscar problemas:", error);
      alert("Erro ao buscar problemas. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  const handleSubmitChamado = async (e) => {
    e.preventDefault();
    
    if (!formData.nome_cliente || !formData.email_cliente || !formData.descricao) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSending(true);
    try {
      await Problema.create({
        ...formData,
        status: "Aberto",
        data_abertura: new Date().toISOString().split('T')[0]
      });

      alert("Chamado aberto com sucesso! Você receberá atualizações por email.");
      
      // Limpar formulário
      setFormData({
        nome_cliente: "",
        email_cliente: "",
        telefone_cliente: "",
        descricao: "",
        tipo: "Outro",
        prioridade: "Média"
      });
      setShowForm(false);

      // Se estava buscando, atualizar a lista
      if (searched && email === formData.email_cliente) {
        handleBuscar();
      }
    } catch (error) {
      console.error("Erro ao criar chamado:", error);
      alert("Erro ao criar chamado. Tente novamente.");
    }
    setIsSending(false);
  };

  const handleVerDetalhes = async (problema) => {
    setSelectedProblema(problema);
    setShowDetalhes(true);
    setNovaResposta("");

    // Marcar como lido se tiver novas atualizações
    if (problema.tem_novas_atualizacoes) {
      try {
        await Problema.update(problema.id, {
          ...problema,
          tem_novas_atualizacoes: false
        });
        // Atualizar lista local
        setProblemas(prev => prev.map(p => 
          p.id === problema.id ? { ...p, tem_novas_atualizacoes: false } : p
        ));
      } catch (error) {
        console.error("Erro ao marcar como lido:", error);
      }
    }
  };

  const handleEnviarResposta = async () => {
    if (!novaResposta.trim() || !selectedProblema) return;

    setEnviandoResposta(true);
    try {
      await AtualizacaoProblema.create({
        problema_id: selectedProblema.id,
        tipo: "Comentário",
        mensagem: novaResposta,
        autor: selectedProblema.nome_cliente,
        visivel_cliente: true,
        notificar_cliente: false
      });

      // Atualizar atualizações
      const atualiz = await AtualizacaoProblema.filter({
        problema_id: selectedProblema.id,
        visivel_cliente: true
      }, "-created_date");
      
      setAtualizacoes(prev => ({
        ...prev,
        [selectedProblema.id]: atualiz
      }));

      setNovaResposta("");
      alert("Sua resposta foi enviada! Nossa equipe será notificada.");
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      alert("Erro ao enviar resposta. Tente novamente.");
    }
    setEnviandoResposta(false);
  };

  const statusConfig = {
    "Aberto": "bg-[#D97706]/10 text-[#D97706] border-[#D97706]",
    "Em Andamento": "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    "Aguardando": "bg-blue-100 text-blue-800 border-blue-300",
    "Resolvido": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Cancelado": "bg-gray-100 text-gray-800 border-gray-300"
  };

  const prioridadeConfig = {
    "Baixa": "bg-blue-100 text-blue-800",
    "Média": "bg-[#C9A961]/20 text-[#8B7355]",
    "Alta": "bg-orange-100 text-orange-800",
    "Urgente": "bg-red-100 text-red-800"
  };

  const podeInteragir = (status) => {
    return status === "Aberto" || status === "Em Andamento" || status === "Aguardando";
  };

  // Contar chamados com novas atualizações
  const novasInteracoesCount = problemas.filter(p => p.tem_novas_atualizacoes).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header Público */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E5DCC8] px-6 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#6B4423]">Café Seleção do Mário</h2>
              <p className="text-xs text-[#8B7355]">Portal do Cliente</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
            Acompanhe Seus Chamados
          </h1>
          <p className="text-[#8B7355]">
            Abra novos chamados ou acompanhe os existentes
          </p>
        </div>

        {/* Botão Abrir Chamado */}
        <div className="mb-6 flex justify-center">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2D5016] hover:bg-[#234012] text-white shadow-lg"
          >
            {showForm ? (
              <>
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Abrir Novo Chamado
              </>
            )}
          </Button>
        </div>

        {/* Formulário de Novo Chamado */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="border-[#E5DCC8] shadow-lg">
                <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#2D5016]/5 to-white">
                  <CardTitle className="text-xl text-[#6B4423]">
                    Abrir Novo Chamado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmitChamado} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome_cliente">Seu Nome *</Label>
                        <Input
                          id="nome_cliente"
                          value={formData.nome_cliente}
                          onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                          required
                          className="border-[#E5DCC8]"
                          placeholder="João Silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_cliente">Seu Email *</Label>
                        <Input
                          id="email_cliente"
                          type="email"
                          value={formData.email_cliente}
                          onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
                          required
                          className="border-[#E5DCC8]"
                          placeholder="seuemail@exemplo.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone_cliente">Telefone (Opcional)</Label>
                      <Input
                        id="telefone_cliente"
                        type="tel"
                        value={formData.telefone_cliente}
                        onChange={(e) => setFormData({ ...formData, telefone_cliente: e.target.value })}
                        className="border-[#E5DCC8]"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo do Problema *</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                        >
                          <SelectTrigger className="border-[#E5DCC8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Logística">Logística / Entrega</SelectItem>
                            <SelectItem value="Estoque">Produto / Estoque</SelectItem>
                            <SelectItem value="Cliente">Atendimento</SelectItem>
                            <SelectItem value="Qualidade">Qualidade do Café</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prioridade">Urgência *</Label>
                        <Select
                          value={formData.prioridade}
                          onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                        >
                          <SelectTrigger className="border-[#E5DCC8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baixa">Baixa</SelectItem>
                            <SelectItem value="Média">Média</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição do Problema *</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                        className="border-[#E5DCC8] min-h-[120px]"
                        placeholder="Descreva detalhadamente o problema que você está enfrentando. Não há limite de caracteres, sinta-se à vontade para fornecer todos os detalhes necessários..."
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        disabled={isSending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#2D5016] hover:bg-[#234012]"
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>Enviando...</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Abrir Chamado
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Busca */}
        <Card className="border-[#E5DCC8] mb-8 shadow-lg">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="text-lg text-[#6B4423]">
              Consultar Meus Chamados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Digite seu email para ver seus chamados"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                  className="pl-10 border-[#E5DCC8] focus:border-[#6B4423] text-base"
                />
              </div>
              <Button
                onClick={handleBuscar}
                disabled={isLoading || !email}
                className="bg-[#6B4423] hover:bg-[#5A3A1E] px-6"
              >
                {isLoading ? (
                  <>Buscando...</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
            <p className="text-[#8B7355] mt-4">Buscando seus chamados...</p>
          </div>
        ) : searched && problemas.length === 0 ? (
          <Card className="border-[#E5DCC8] shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#8B7355]" />
              </div>
              <p className="text-[#8B7355] text-lg mb-2">
                Nenhum chamado encontrado
              </p>
              <p className="text-sm text-[#A69483]">
                Verifique se digitou o email correto usado ao abrir o chamado
              </p>
            </CardContent>
          </Card>
        ) : problemas.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[#8B7355]">
                Encontramos <strong className="text-[#6B4423]">{problemas.length}</strong> {problemas.length === 1 ? 'chamado' : 'chamados'} em seu nome
              </p>
              {novasInteracoesCount > 0 && (
                <Badge className="bg-[#2D5016] text-white animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {novasInteracoesCount} {novasInteracoesCount === 1 ? 'nova atualização' : 'novas atualizações'}
                </Badge>
              )}
            </div>

            {/* Lista Compacta de Chamados */}
            <Card className="border-[#E5DCC8] shadow-lg overflow-hidden">
              <div className="divide-y divide-[#E5DCC8]">
                {problemas.map((problema, index) => (
                  <motion.div
                    key={problema.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleVerDetalhes(problema)}
                    className={`p-4 hover:bg-[#F5F1E8]/50 cursor-pointer transition-colors flex items-center gap-4 ${
                      problema.tem_novas_atualizacoes ? 'bg-[#2D5016]/5 border-l-4 border-l-[#2D5016]' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D97706] to-[#EA580C] rounded-lg flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      {/* Indicador de Nova Interação */}
                      {problema.tem_novas_atualizacoes && (
                        <div className="absolute -top-1 -right-1">
                          <div className="relative">
                            <div className="w-4 h-4 bg-[#2D5016] rounded-full flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                            <div className="absolute inset-0 bg-[#2D5016] rounded-full animate-ping opacity-75"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#6B4423] truncate">
                          {problema.tipo} - #{problema.id.slice(0, 8)}
                        </h3>
                        <Badge variant="outline" className={`${statusConfig[problema.status]} text-xs`}>
                          {problema.status}
                        </Badge>
                        <Badge className={`${prioridadeConfig[problema.prioridade]} text-xs`}>
                          {problema.prioridade}
                        </Badge>
                        {problema.tem_novas_atualizacoes && (
                          <Badge className="bg-[#2D5016] text-white text-xs animate-pulse">
                            <Sparkles className="w-2.5 h-2.5 mr-1" />
                            Nova
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#8B7355] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(problema.created_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {atualizacoes[problema.id] && atualizacoes[problema.id].length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {atualizacoes[problema.id].length} {atualizacoes[problema.id].length === 1 ? 'atualização' : 'atualizações'}
                          </span>
                        )}
                        {problema.ultima_interacao_equipe && (
                          <span className="flex items-center gap-1 text-[#2D5016] font-medium">
                            <Sparkles className="w-3 h-3" />
                            Última resposta: {format(new Date(problema.ultima_interacao_equipe), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {/* Modal de Detalhes */}
        <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#6B4423]">
                Detalhes do Chamado
              </DialogTitle>
            </DialogHeader>

            {selectedProblema && (
              <div className="space-y-6">
                {/* Informações do Chamado */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`${statusConfig[selectedProblema.status]} border`}>
                      {selectedProblema.status}
                    </Badge>
                    <Badge className={prioridadeConfig[selectedProblema.prioridade]}>
                      {selectedProblema.prioridade}
                    </Badge>
                    <Badge variant="outline" className="bg-[#6B4423]/5 text-[#6B4423]">
                      {selectedProblema.tipo}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#6B4423] mb-1">Descrição:</p>
                    <p className="text-[#8B7355] whitespace-pre-wrap">{selectedProblema.descricao}</p>
                  </div>

                  {selectedProblema.responsavel && (
                    <div className="bg-[#F5F1E8] p-3 rounded-lg">
                      <p className="text-sm text-[#8B7355]">
                        <strong className="text-[#6B4423]">Responsável:</strong> {selectedProblema.responsavel}
                      </p>
                    </div>
                  )}

                  {selectedProblema.solucao && (
                    <div className="bg-[#2D5016]/5 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-[#2D5016] mb-1">✅ Solução:</p>
                      <p className="text-[#8B7355] whitespace-pre-wrap">{selectedProblema.solucao}</p>
                    </div>
                  )}
                </div>

                {/* Atualizações */}
                {atualizacoes[selectedProblema.id] && atualizacoes[selectedProblema.id].length > 0 && (
                  <div className="pt-4 border-t border-[#E5DCC8]">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-[#6B4423]" />
                      <h4 className="font-semibold text-[#6B4423]">
                        Atualizações ({atualizacoes[selectedProblema.id].length})
                      </h4>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {atualizacoes[selectedProblema.id].map((atualizacao) => (
                        <div
                          key={atualizacao.id}
                          className="bg-white border border-[#E5DCC8] p-4 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-[#6B4423]">{atualizacao.autor}</p>
                            <p className="text-xs text-[#8B7355]">
                              {format(new Date(atualizacao.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <p className="text-sm text-[#8B7355] whitespace-pre-wrap">{atualizacao.mensagem}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulário de Resposta - Apenas para chamados em aberto */}
                {podeInteragir(selectedProblema.status) ? (
                  <div className="pt-4 border-t border-[#E5DCC8]">
                    <h4 className="font-semibold text-[#6B4423] mb-3">Adicionar Comentário</h4>
                    <div className="space-y-3">
                      <Textarea
                        value={novaResposta}
                        onChange={(e) => setNovaResposta(e.target.value)}
                        placeholder="Digite sua resposta ou comentário..."
                        className="border-[#E5DCC8]"
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleEnviarResposta}
                          disabled={enviandoResposta || !novaResposta.trim()}
                          className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                        >
                          {enviandoResposta ? (
                            <>Enviando...</>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Enviar Resposta
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-[#E5DCC8]">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        Este chamado está <strong>{selectedProblema.status.toLowerCase()}</strong> e não aceita mais interações.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Info */}
        <Card className="border-[#E5DCC8] mt-8 bg-[#F5F1E8]/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#6B4423] mb-3">
              💡 Como funciona?
            </h3>
            <ul className="space-y-2 text-sm text-[#8B7355]">
              <li>• <strong>Abra um novo chamado:</strong> Clique no botão "Abrir Novo Chamado" e preencha o formulário</li>
              <li>• <strong>Acompanhe seus chamados:</strong> Digite seu email para ver todos os chamados abertos com esse email</li>
              <li>• <strong>Interaja:</strong> Clique em um chamado para ver detalhes e adicionar comentários (apenas em chamados em aberto)</li>
              <li>• <strong>Receba atualizações:</strong> Você receberá emails sempre que houver novidades nos seus chamados</li>
              <li>• <strong className="text-[#2D5016]">✨ Novas atualizações:</strong> Chamados com o badge "Nova" foram atualizados pela nossa equipe</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer com Links Obrigatórios */}
      <footer className="bg-white border-t border-[#E5DCC8] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#8B7355]">
            <a href="/Privacy" className="hover:text-[#6B4423] hover:underline font-medium">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="/Support" className="hover:text-[#6B4423] hover:underline font-medium">
              Suporte
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Café Seleção do Mário</span>
          </div>
        </div>
      </footer>
    </div>
  );
}