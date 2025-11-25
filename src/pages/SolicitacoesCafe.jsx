
import React, { useState, useEffect } from "react";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";
import { AtualizacaoSolicitacao } from "@/entities/AtualizacaoSolicitacao";
import { Cliente } from "@/entities/Cliente";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter,
  FileText,
  Clock,
  Eye,
  CheckCircle,
  X,
  LayoutGrid,
  List,
  Heart, // Added Heart icon for sponsorships
  Package // Added Package icon for cafe requests
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Ensure TabsContent is imported

import SolicitacoesKanban from "../components/solicitacoes/SolicitacoesKanban";
import SolicitacaoDetalhesModal from "../components/solicitacoes/SolicitacaoDetalhesModal";

// New imports for Patrocinio
import PatrocinioKanban from "../components/patrocinio/PatrocinioKanban";
import PatrocinioDetalhesModal from "../components/patrocinio/PatrocinioDetalhesModal";
import { SolicitacaoPatrocinio } from "@/entities/SolicitacaoPatrocinio";
import { AtualizacaoPatrocinio } from "@/entities/AtualizacaoPatrocinio";


export default function SolicitacoesCafe() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [clienteFilter, setClienteFilter] = useState("all");
  const [visualizacao, setVisualizacao] = useState("kanban");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null); // For cafe requests details
  const [showDetalhes, setShowDetalhes] = useState(false); // For cafe requests details
  const [showMudarStatus, setShowMudarStatus] = useState(false);
  const [solicitacaoParaMudar, setSolicitacaoParaMudar] = useState(null); // For cafe requests status change
  const [novoStatusTemp, setNovoStatusTemp] = useState("");
  const [comentarioMudanca, setComentarioMudanca] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // New state variables for Patrocinios
  const [patrocinios, setPatrocinios] = useState([]);
  const [filteredPatrocinios, setFilteredPatrocinios] = useState([]);
  const [selectedPatrocinio, setSelectedPatrocinio] = useState(null); // For sponsorship details AND status change
  const [showDetalhesPatrocinio, setShowDetalhesPatrocinio] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("solicitacoes"); // To switch between Cafe and Patrocinio tabs

  useEffect(() => {
    loadCurrentUser();
    loadAllData(); // Replaced loadData with loadAllData
  }, []);

  // Effect for filtering Solicitacoes de Cafe
  useEffect(() => {
    if (activeMainTab === "solicitacoes") {
      let filtered = solicitacoes;

      if (statusFilter !== "all") {
        filtered = filtered.filter(s => s.status === statusFilter);
      }

      if (tipoFilter !== "all") {
        filtered = filtered.filter(s => s.tipo_solicitacao === tipoFilter);
      }

      if (clienteFilter !== "all") {
        filtered = filtered.filter(s => s.cliente_id === clienteFilter);
      }

      if (searchTerm) {
        filtered = filtered.filter(s =>
          s.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.local_evento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredSolicitacoes(filtered);
    }
  }, [solicitacoes, searchTerm, statusFilter, tipoFilter, clienteFilter, activeMainTab]);

  // Effect for filtering Patrocinios (new)
  useEffect(() => {
    if (activeMainTab === "patrocinios") {
      let filtered = patrocinios;

      if (searchTerm) {
        filtered = filtered.filter(p =>
          p.nome_organizador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nome_evento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email_contato?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setFilteredPatrocinios(filtered);
    }
  }, [patrocinios, searchTerm, activeMainTab]);


  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  // New function loadAllData to fetch both solicitacoes and patrocinios
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [solicitacoesData, clientesData, patrociniosData] = await Promise.all([
        SolicitacaoEvento.list("-created_date"),
        Cliente.list(),
        SolicitacaoPatrocinio.list("-created_date") // Fetch sponsorships
      ]);
      setSolicitacoes(solicitacoesData);
      setClientes(clientesData);
      setPatrocinios(patrociniosData); // Set sponsorships data
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerDetalhes = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setShowDetalhes(true);
  };

  const handleMudarStatusKanban = (solicitacao, novoStatus) => {
    setSolicitacaoParaMudar(solicitacao); // Set for cafe request
    setSelectedPatrocinio(null); // Clear patrocinio context to ensure correct modal content
    setNovoStatusTemp(novoStatus);
    setComentarioMudanca("");
    setShowMudarStatus(true);
  };

  // New function for viewing Patrocinio details
  const handleVerDetalhesPatrocinio = (patrocinio) => {
    setSelectedPatrocinio(patrocinio);
    setShowDetalhesPatrocinio(true);
  };

  // New function for changing Patrocinio status
  const handleMudarStatusPatrocinio = (patrocinio, novoStatus) => {
    setSelectedPatrocinio(patrocinio); // Set for sponsorship
    setSolicitacaoParaMudar(null); // Clear cafe request context to ensure correct modal content
    setNovoStatusTemp(novoStatus);
    setComentarioMudanca("");
    setShowMudarStatus(true);
  };

  // Unified function to handle status change for both SolicitacaoEvento and SolicitacaoPatrocinio
  const handleConfirmarMudanca = async () => {
    if (!comentarioMudanca.trim()) {
      alert("Por favor, adicione um comentário sobre a mudança");
      return;
    }

    if (!currentUser) return;

    try {
      if (solicitacaoParaMudar) { // Logic for SolicitacaoEvento
        await SolicitacaoEvento.update(solicitacaoParaMudar.id, {
          ...solicitacaoParaMudar,
          status: novoStatusTemp
        });

        await AtualizacaoSolicitacao.create({
          solicitacao_id: solicitacaoParaMudar.id,
          tipo: "Mudança Status",
          status_anterior: solicitacaoParaMudar.status,
          status_novo: novoStatusTemp,
          comentario: comentarioMudanca,
          autor: currentUser.full_name,
          autor_email: currentUser.email
        });
      } else if (selectedPatrocinio) { // Logic for SolicitacaoPatrocinio
        await SolicitacaoPatrocinio.update(selectedPatrocinio.id, {
          status: novoStatusTemp
        });

        await AtualizacaoPatrocinio.create({
          patrocinio_id: selectedPatrocinio.id,
          tipo: "Mudança Status",
          status_anterior: selectedPatrocinio.status,
          status_novo: novoStatusTemp,
          comentario: comentarioMudanca,
          autor: currentUser.full_name,
          autor_email: currentUser.email,
          visivel_solicitante: false
        });
      } else {
        console.error("Nenhuma solicitação ou patrocínio para mudar o status.");
        alert("Erro: Nenhuma entidade selecionada para mudança de status.");
        return;
      }

      setShowMudarStatus(false);
      setSolicitacaoParaMudar(null); // Clear cafe request context
      setSelectedPatrocinio(null); // Clear sponsorship context
      setNovoStatusTemp("");
      setComentarioMudanca("");
      loadAllData(); // Reload all data
    } catch (error) {
      console.error("Erro ao mudar status:", error);
      alert("Erro ao mudar status");
    }
  };

  const getStatCount = (status) => {
    return solicitacoes.filter(s => s.status === status).length;
  };

  // New function for getting Patrocinio stat count
  const getPatrocinioStatCount = (status) => {
    return patrocinios.filter(p => p.status === status).length;
  };

  const statusColors = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Aprovada": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Cancelada": "bg-red-100 text-red-800 border-red-300",
    // Patrocinio specific statuses
    "Nova": "bg-purple-100 text-purple-800 border-purple-300",
    "Aguardando Informações": "bg-orange-100 text-orange-800 border-orange-300",
    "Recusada": "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Solicitações
          </h1>
          <p className="text-[#8B7355]">
            Gerencie solicitações de café e patrocínios de eventos
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
          <TabsList className="bg-[#F5F1E8]">
            <TabsTrigger value="solicitacoes" className="gap-2">
              <Package className="w-4 h-4" />
              Solicitações de Café
            </TabsTrigger>
            <TabsTrigger value="patrocinios" className="gap-2">
              <Heart className="w-4 h-4" />
              Patrocínios e Eventos
            </TabsTrigger>
          </TabsList>

          {/* Solicitações de Café Tab */}
          <TabsContent value="solicitacoes" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-yellow-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Pendentes</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getStatCount("Pendente")}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Em Análise</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getStatCount("Em Análise")}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Aprovadas</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getStatCount("Aprovada")}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#2D5016]/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[#2D5016]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Canceladas</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getStatCount("Cancelada")}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e Toggle de Visualização */}
            <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Busca e Toggle */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                      <Input
                        placeholder="Buscar por cliente, local ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#E5DCC8]"
                      />
                    </div>

                    <Tabs value={visualizacao} onValueChange={setVisualizacao}>
                      <TabsList className="bg-[#F5F1E8]">
                        <TabsTrigger value="kanban" className="gap-2">
                          <LayoutGrid className="w-4 h-4" />
                          Kanban
                        </TabsTrigger>
                        <TabsTrigger value="lista" className="gap-2">
                          <List className="w-4 h-4" />
                          Lista
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Filtros Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-[#8B7355] mb-2 block flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        Status
                      </Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="Pendente">Pendentes</SelectItem>
                          <SelectItem value="Em Análise">Em Análise</SelectItem>
                          <SelectItem value="Aprovada">Aprovadas</SelectItem>
                          <SelectItem value="Cancelada">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-[#8B7355] mb-2 block">Tipo</Label>
                      <Select value={tipoFilter} onValueChange={setTipoFilter}>
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="Evento">Eventos</SelectItem>
                          <SelectItem value="Interno">Uso Interno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-[#8B7355] mb-2 block">Cliente</Label>
                      <Select value={clienteFilter} onValueChange={setClienteFilter}>
                        <SelectTrigger className="border-[#E5DCC8]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Clientes</SelectItem>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conteúdo Principal (Solicitações de Café) */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : visualizacao === "kanban" ? (
              <SolicitacoesKanban
                solicitacoes={filteredSolicitacoes}
                onVerDetalhes={handleVerDetalhes}
                onMudarStatus={handleMudarStatusKanban}
              />
            ) : (
              <div className="text-center py-12 text-[#8B7355]">
                <List className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Visualização em lista será implementada em breve</p>
              </div>
            )}
          </TabsContent>

          {/* Patrocínios Tab */}
          <TabsContent value="patrocinios" className="space-y-6">
            {/* Stats Cards Patrocínios */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Novas</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getPatrocinioStatCount("Nova")}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Em Análise</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getPatrocinioStatCount("Em Análise")}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-yellow-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Aguardando</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getPatrocinioStatCount("Aguardando Informações")}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Aprovadas</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getPatrocinioStatCount("Aprovada")}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#2D5016]/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-[#2D5016]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355] mb-1">Recusadas</p>
                      <p className="text-3xl font-bold text-[#6B4423]">{getPatrocinioStatCount("Recusada")}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Busca para Patrocínios */}
            <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                  <Input
                    placeholder="Buscar por organizador, evento ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#E5DCC8]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kanban de Patrocínios */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : (
              <PatrocinioKanban
                solicitacoes={filteredPatrocinios} // The prop name is 'solicitacoes' but it receives patrocinios
                onVerDetalhes={handleVerDetalhesPatrocinio}
                onMudarStatus={handleMudarStatusPatrocinio}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Mudança de Status (generic for both types) */}
      <Dialog open={showMudarStatus} onOpenChange={setShowMudarStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-[#6B4423]">
              Confirmar Mudança de Status
            </DialogTitle>
          </DialogHeader>

          {/* Conditional content for SolicitacaoEvento */}
          {solicitacaoParaMudar && (
            <div className="space-y-4">
              <div className="bg-[#F5F1E8] p-4 rounded-lg">
                <p className="text-sm text-[#6B4423] mb-2">
                  <strong>Cliente:</strong> {solicitacaoParaMudar.cliente_nome}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[solicitacaoParaMudar.status]}>
                    {solicitacaoParaMudar.status}
                  </Badge>
                  <span className="text-[#8B7355]">→</span>
                  <Badge variant="outline" className={statusColors[novoStatusTemp]}>
                    {novoStatusTemp}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comentário sobre a mudança *</Label>
                <Textarea
                  value={comentarioMudanca}
                  onChange={(e) => setComentarioMudanca(e.target.value)}
                  className="border-[#E5DCC8]"
                  rows={3}
                  placeholder="Explique o motivo da mudança de status..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMudarStatus(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarMudanca}
                  disabled={!comentarioMudanca.trim()}
                  className="bg-[#2D5016] hover:bg-[#1F3810]"
                >
                  Confirmar Mudança
                </Button>
              </div>
            </div>
          )}

          {/* Conditional content for SolicitacaoPatrocinio */}
          {selectedPatrocinio && (
            <div className="space-y-4">
              <div className="bg-[#F5F1E8] p-4 rounded-lg">
                <p className="text-sm text-[#6B4423] mb-2">
                  <strong>Evento:</strong> {selectedPatrocinio.nome_evento}
                </p>
                <p className="text-sm text-[#6B4423] mb-2">
                  <strong>Organizador:</strong> {selectedPatrocinio.nome_organizador}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[selectedPatrocinio.status]}>
                    {selectedPatrocinio.status}
                  </Badge>
                  <span className="text-[#8B7355]">→</span>
                  <Badge variant="outline" className={statusColors[novoStatusTemp]}>
                    {novoStatusTemp}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comentário sobre a mudança *</Label>
                <Textarea
                  value={comentarioMudanca}
                  onChange={(e) => setComentarioMudanca(e.target.value)}
                  className="border-[#E5DCC8]"
                  rows={3}
                  placeholder="Explique o motivo da mudança de status..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMudarStatus(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarMudanca} // Calls the unified handler
                  disabled={!comentarioMudanca.trim()}
                  className="bg-[#2D5016] hover:bg-[#1F3810]"
                >
                  Confirmar Mudança
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes (SolicitacaoEvento) */}
      <SolicitacaoDetalhesModal
        open={showDetalhes}
        onClose={() => {
          setShowDetalhes(false);
          setSelectedSolicitacao(null);
        }}
        solicitacao={selectedSolicitacao}
        onUpdate={loadAllData} // Changed to loadAllData
      />

      {/* Modal de Detalhes de Patrocínio (new) */}
      <PatrocinioDetalhesModal
        open={showDetalhesPatrocinio}
        onClose={() => {
          setShowDetalhesPatrocinio(false);
          setSelectedPatrocinio(null);
        }}
        solicitacao={selectedPatrocinio} // The prop name is 'solicitacao' but it receives selectedPatrocinio
        onUpdate={loadAllData} // Changed to loadAllData
      />
    </div>
  );
}
