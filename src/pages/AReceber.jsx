import React, { useState, useEffect } from "react";
import { ReservaCafe } from "@/entities/ReservaCafe";
import { ItemChecklist } from "@/entities/ItemChecklist";
import { ClienteChecklistItem } from "@/entities/ClienteChecklistItem";
import { DemandaExterna } from "@/entities/DemandaExterna";
import { User as UserEntity } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Search,
  Plus,
  Settings,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Package,
  Coffee,
  Filter,
  FileText
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

import GerenciarItensChecklistModal from "../components/areceber/GerenciarItensChecklistModal";
import ReservaChecklistCard from "../components/areceber/ReservaChecklistCard";
import DemandaExternaFormModal from "../components/areceber/DemandaExternaFormModal";
import DemandaExternaCard from "../components/areceber/DemandaExternaCard";
import HistoricoDemandaModal from "../components/areceber/HistoricoDemandaModal";

export default function AReceber() {
  const [reservas, setReservas] = useState([]);
  const [itensChecklist, setItensChecklist] = useState([]);
  const [reservaChecklistItems, setReservaChecklistItems] = useState([]);
  const [demandas, setDemandas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGerenciarItens, setShowGerenciarItens] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [activeTab, setActiveTab] = useState("reservas");
  
  // Demandas modals
  const [showDemandaForm, setShowDemandaForm] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedDemandaHistorico, setSelectedDemandaHistorico] = useState(null);
  const [filtroDemandaStatus, setFiltroDemandaStatus] = useState("todos");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [reservasData, itensChecklistData, reservaChecklistItemsData, demandasData, userData] = await Promise.all([
      ReservaCafe.filter({ status: "Ativa" }, "-created_date"),
      ItemChecklist.list("ordem"),
      ClienteChecklistItem.list("-created_date"),
      DemandaExterna.list("-created_date"),
      UserEntity.me()
    ]);
    setReservas(reservasData);
    setItensChecklist(itensChecklistData.filter(i => i.ativo));
    setReservaChecklistItems(reservaChecklistItemsData);
    setDemandas(demandasData);
    setCurrentUser(userData);
    setIsLoading(false);
  };

  const handleEditDemanda = (demanda) => {
    setEditingDemanda(demanda);
    setShowDemandaForm(true);
  };

  const handleViewHistory = (demanda) => {
    setSelectedDemandaHistorico(demanda);
    setShowHistorico(true);
  };

  const handleDeleteDemanda = async (demanda) => {
    if (confirm(`Tem certeza que deseja excluir a demanda de ${demanda.cliente_nome}?`)) {
      await DemandaExterna.delete(demanda.id);
      loadData();
    }
  };

  const demandasFiltradas = demandas.filter(d => {
    const matchSearch = d.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       d.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchStatus = true;
    if (filtroDemandaStatus === "pendente") {
      matchStatus = d.status === "Pendente";
    } else if (filtroDemandaStatus === "pago") {
      matchStatus = d.status === "Pago";
    } else if (filtroDemandaStatus === "vencido") {
      matchStatus = d.status === "Vencido" || (d.status === "Pendente" && d.data_vencimento && isPast(new Date(d.data_vencimento)) && !isToday(new Date(d.data_vencimento)));
    } else if (filtroDemandaStatus === "renegociado") {
      matchStatus = d.status === "Renegociado";
    }
    
    return matchSearch && matchStatus;
  });

  const demandaStats = {
    total: demandas.length,
    pendente: demandas.filter(d => d.status === "Pendente").length,
    pago: demandas.filter(d => d.status === "Pago").length,
    vencido: demandas.filter(d => d.status === "Vencido" || (d.status === "Pendente" && d.data_vencimento && isPast(new Date(d.data_vencimento)) && !isToday(new Date(d.data_vencimento)))).length,
    valorTotal: demandas.filter(d => d.status === "Pendente").reduce((acc, d) => acc + (d.valor || 0), 0)
  };

  const reservasComStatus = reservas.map(reserva => {
    const checklistReserva = reservaChecklistItems.filter(c => c.reserva_id === reserva.id);
    const totalItens = itensChecklist.length;
    const itensConcluidos = checklistReserva.filter(c => c.concluido).length;
    const percentualConcluido = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;
    
    const pesos = { "10g": 0.01, "18g": 0.018, "100g": 0.1, "250g": 0.25, "500g": 0.5, "1kg": 1 };
    const peso = pesos[reserva.embalagem] || 0.25;
    const totalKg = (reserva.quantidade_pacotes * peso).toFixed(2);

    return {
      ...reserva,
      checklistItems: checklistReserva,
      totalItens,
      itensConcluidos,
      percentualConcluido,
      totalKg
    };
  });

  const reservasFiltradas = reservasComStatus.filter(r => {
    const matchSearch = r.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.cafe_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchStatus = true;
    if (filtroStatus === "completo") {
      matchStatus = r.percentualConcluido === 100;
    } else if (filtroStatus === "pendente") {
      matchStatus = r.percentualConcluido < 100;
    } else if (filtroStatus === "em_andamento") {
      matchStatus = r.percentualConcluido > 0 && r.percentualConcluido < 100;
    }
    
    return matchSearch && matchStatus;
  });

  const handleToggleItem = async (reservaId, itemChecklistId, concluido, reservaChecklistItemId) => {
    const reserva = reservas.find(r => r.id === reservaId);
    const itemChecklist = itensChecklist.find(i => i.id === itemChecklistId);

    if (reservaChecklistItemId) {
      await ClienteChecklistItem.update(reservaChecklistItemId, {
        concluido: !concluido,
        data_conclusao: !concluido ? new Date().toISOString() : null,
        usuario_conclusao: !concluido ? "Usuário Atual" : null
      });
    } else {
      await ClienteChecklistItem.create({
        cliente_id: reserva.cliente_id,
        cliente_nome: reserva.cliente_nome,
        reserva_id: reservaId,
        item_checklist_id: itemChecklistId,
        item_checklist_nome: itemChecklist.nome,
        concluido: true,
        data_conclusao: new Date().toISOString(),
        usuario_conclusao: "Usuário Atual"
      });
    }
    
    loadData();
  };

  const stats = {
    totalReservas: reservasComStatus.length,
    reservasCompletas: reservasComStatus.filter(r => r.percentualConcluido === 100).length,
    reservasPendentes: reservasComStatus.filter(r => r.percentualConcluido === 0).length,
    reservasEmAndamento: reservasComStatus.filter(r => r.percentualConcluido > 0 && r.percentualConcluido < 100).length,
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              A Receber
            </h1>
            <p className="text-[#8B7355]">
              Acompanhamento de processos e demandas
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[#E5DCC8]">
            <TabsTrigger value="reservas" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="demandas" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Demandas Externas
            </TabsTrigger>
          </TabsList>

          {/* Tab Reservas */}
          <TabsContent value="reservas" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowGerenciarItens(true)}
                variant="outline"
                className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
              >
                <Settings className="w-5 h-5 mr-2" />
                Gerenciar Checklist
              </Button>
            </div>

            {/* Stats Cards Reservas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                      <Package className="w-5 h-5 text-[#6B4423]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#6B4423]">{stats.totalReservas}</p>
                      <p className="text-xs text-[#8B7355]">Total de Reservas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-[#2D5016]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#2D5016]">{stats.reservasCompletas}</p>
                      <p className="text-xs text-[#8B7355]">Completos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#D97706]/10 rounded-lg">
                      <Circle className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#D97706]">{stats.reservasEmAndamento}</p>
                      <p className="text-xs text-[#8B7355]">Em Andamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#C9A961]/10 rounded-lg">
                      <Coffee className="w-5 h-5 text-[#8B7355]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#6B4423]">{stats.reservasPendentes}</p>
                      <p className="text-xs text-[#8B7355]">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Reservas */}
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                      <Input
                        placeholder="Buscar por cliente ou café..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#E5DCC8]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filtroStatus === "todos" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("todos")}
                      className={filtroStatus === "todos" ? "bg-[#6B4423]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroStatus === "pendente" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("pendente")}
                      className={filtroStatus === "pendente" ? "bg-[#C9A961]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Pendentes
                    </Button>
                    <Button
                      variant={filtroStatus === "em_andamento" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("em_andamento")}
                      className={filtroStatus === "em_andamento" ? "bg-[#D97706]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Em Andamento
                    </Button>
                    <Button
                      variant={filtroStatus === "completo" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("completo")}
                      className={filtroStatus === "completo" ? "bg-[#2D5016]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Completos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Reservas */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : reservasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservasFiltradas.map((reserva, index) => (
                  <ReservaChecklistCard
                    key={reserva.id}
                    reserva={reserva}
                    itensChecklist={itensChecklist}
                    onToggleItem={handleToggleItem}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
                <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355] text-lg">Nenhuma reserva encontrada</p>
              </div>
            )}
          </TabsContent>

          {/* Tab Demandas Externas */}
          <TabsContent value="demandas" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingDemanda(null);
                  setShowDemandaForm(true);
                }}
                className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Demanda
              </Button>
            </div>

            {/* Stats Cards Demandas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                      <FileText className="w-5 h-5 text-[#6B4423]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#6B4423]">{demandaStats.total}</p>
                      <p className="text-xs text-[#8B7355]">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Circle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{demandaStats.pendente}</p>
                      <p className="text-xs text-[#8B7355]">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{demandaStats.vencido}</p>
                      <p className="text-xs text-[#8B7355]">Vencidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{demandaStats.pago}</p>
                      <p className="text-xs text-[#8B7355]">Pagos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5DCC8] bg-[#2D5016]/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-[#2D5016]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#2D5016]">
                        R$ {demandaStats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-[#8B7355]">A Receber</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Demandas */}
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                      <Input
                        placeholder="Buscar por cliente ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#E5DCC8]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filtroDemandaStatus === "todos" ? "default" : "outline"}
                      onClick={() => setFiltroDemandaStatus("todos")}
                      className={filtroDemandaStatus === "todos" ? "bg-[#6B4423]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroDemandaStatus === "pendente" ? "default" : "outline"}
                      onClick={() => setFiltroDemandaStatus("pendente")}
                      className={filtroDemandaStatus === "pendente" ? "bg-yellow-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Pendentes
                    </Button>
                    <Button
                      variant={filtroDemandaStatus === "vencido" ? "default" : "outline"}
                      onClick={() => setFiltroDemandaStatus("vencido")}
                      className={filtroDemandaStatus === "vencido" ? "bg-red-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Vencidos
                    </Button>
                    <Button
                      variant={filtroDemandaStatus === "pago" ? "default" : "outline"}
                      onClick={() => setFiltroDemandaStatus("pago")}
                      className={filtroDemandaStatus === "pago" ? "bg-green-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Pagos
                    </Button>
                    <Button
                      variant={filtroDemandaStatus === "renegociado" ? "default" : "outline"}
                      onClick={() => setFiltroDemandaStatus("renegociado")}
                      className={filtroDemandaStatus === "renegociado" ? "bg-blue-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Renegociados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Demandas */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : demandasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandasFiltradas.map((demanda, index) => (
                  <DemandaExternaCard
                    key={demanda.id}
                    demanda={demanda}
                    onEdit={handleEditDemanda}
                    onViewHistory={handleViewHistory}
                    onDelete={handleDeleteDemanda}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
                <FileText className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355] text-lg">Nenhuma demanda encontrada</p>
                <Button
                  onClick={() => {
                    setEditingDemanda(null);
                    setShowDemandaForm(true);
                  }}
                  className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Demanda
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <GerenciarItensChecklistModal
          open={showGerenciarItens}
          onClose={() => {
            setShowGerenciarItens(false);
            loadData();
          }}
          itensChecklist={itensChecklist}
        />

        <DemandaExternaFormModal
          open={showDemandaForm}
          onClose={() => {
            setShowDemandaForm(false);
            setEditingDemanda(null);
            loadData();
          }}
          demanda={editingDemanda}
          userName={currentUser?.full_name}
        />

        <HistoricoDemandaModal
          open={showHistorico}
          onClose={() => {
            setShowHistorico(false);
            setSelectedDemandaHistorico(null);
          }}
          demanda={selectedDemandaHistorico}
        />
      </div>
    </div>
  );
}