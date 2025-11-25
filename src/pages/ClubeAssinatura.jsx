import React, { useState, useEffect } from "react";
import { AssinanteClube } from "@/entities/AssinanteClube";
import { EntregaClube } from "@/entities/EntregaClube";
import { Cafe } from "@/entities/Cafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Plus,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Pause,
  XCircle,
  Copy,
  ExternalLink,
  Truck
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import AssinanteFormModal from "@/components/clube/AssinanteFormModal";
import AssinanteCard from "@/components/clube/AssinanteCard";
import EntregaFormModal from "@/components/clube/EntregaFormModal";
import EntregaCard from "@/components/clube/EntregaCard";

export default function ClubeAssinatura() {
  const [assinantes, setAssinantes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("assinantes");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  const [showAssinanteForm, setShowAssinanteForm] = useState(false);
  const [editingAssinante, setEditingAssinante] = useState(null);
  const [showEntregaForm, setShowEntregaForm] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState(null);
  const [selectedAssinanteEntrega, setSelectedAssinanteEntrega] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [assinantesData, entregasData, cafesData] = await Promise.all([
      AssinanteClube.list("-created_date"),
      EntregaClube.list("-data_programada"),
      Cafe.list("nome")
    ]);
    setAssinantes(assinantesData);
    setEntregas(entregasData);
    setCafes(cafesData);
    setIsLoading(false);
  };

  const handleEditAssinante = (assinante) => {
    setEditingAssinante(assinante);
    setShowAssinanteForm(true);
  };

  const handleDeleteAssinante = async (assinante) => {
    if (confirm(`Excluir assinante ${assinante.nome}?`)) {
      await AssinanteClube.delete(assinante.id);
      loadData();
    }
  };

  const handleNovaEntrega = (assinante) => {
    setSelectedAssinanteEntrega(assinante);
    setEditingEntrega(null);
    setShowEntregaForm(true);
  };

  const handleEditEntrega = (entrega) => {
    setEditingEntrega(entrega);
    setSelectedAssinanteEntrega(assinantes.find(a => a.id === entrega.assinante_id));
    setShowEntregaForm(true);
  };

  const handleDeleteEntrega = async (entrega) => {
    if (confirm("Excluir esta entrega?")) {
      await EntregaClube.delete(entrega.id);
      loadData();
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/MinhaAssinatura?slug=${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };

  const assinantesFiltrados = assinantes.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const entregasFiltradas = entregas.filter(e => {
    const matchSearch = e.assinante_nome.toLowerCase().includes(searchTerm.toLowerCase());
    let matchStatus = true;
    if (filtroStatus !== "todos") {
      matchStatus = e.status === filtroStatus;
    }
    return matchSearch && matchStatus;
  });

  const stats = {
    totalAssinantes: assinantes.length,
    ativos: assinantes.filter(a => a.status === "Ativo").length,
    pausados: assinantes.filter(a => a.status === "Pausado").length,
    entregasPendentes: entregas.filter(e => e.status === "Programada" || e.status === "Em Preparação").length
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              Clube de Assinatura
            </h1>
            <p className="text-[#8B7355]">
              Gerencie assinantes e entregas do clube
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                  <Users className="w-5 h-5 text-[#6B4423]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#6B4423]">{stats.totalAssinantes}</p>
                  <p className="text-xs text-[#8B7355]">Total Assinantes</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
                  <p className="text-xs text-[#8B7355]">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Pause className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pausados}</p>
                  <p className="text-xs text-[#8B7355]">Pausados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.entregasPendentes}</p>
                  <p className="text-xs text-[#8B7355]">Entregas Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[#E5DCC8]">
            <TabsTrigger value="assinantes" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Assinantes
            </TabsTrigger>
            <TabsTrigger value="entregas" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Entregas
            </TabsTrigger>
          </TabsList>

          {/* Tab Assinantes */}
          <TabsContent value="assinantes" className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingAssinante(null);
                  setShowAssinanteForm(true);
                }}
                className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Assinante
              </Button>
            </div>

            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar assinante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filtroStatus === "todos" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("todos")}
                      className={filtroStatus === "todos" ? "bg-[#6B4423]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroStatus === "Ativo" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("Ativo")}
                      className={filtroStatus === "Ativo" ? "bg-green-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Ativos
                    </Button>
                    <Button
                      variant={filtroStatus === "Pausado" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("Pausado")}
                      className={filtroStatus === "Pausado" ? "bg-yellow-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Pausados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : assinantesFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assinantesFiltrados.map((assinante, index) => (
                  <AssinanteCard
                    key={assinante.id}
                    assinante={assinante}
                    entregas={entregas.filter(e => e.assinante_id === assinante.id)}
                    onEdit={handleEditAssinante}
                    onDelete={handleDeleteAssinante}
                    onNovaEntrega={handleNovaEntrega}
                    onCopyLink={copyLink}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-xl border border-[#E5DCC8]">
                <Users className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355] text-lg">Nenhum assinante encontrado</p>
              </div>
            )}
          </TabsContent>

          {/* Tab Entregas */}
          <TabsContent value="entregas" className="space-y-6">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar por assinante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8]"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filtroStatus === "todos" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("todos")}
                      className={filtroStatus === "todos" ? "bg-[#6B4423]" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filtroStatus === "Programada" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("Programada")}
                      className={filtroStatus === "Programada" ? "bg-blue-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Programadas
                    </Button>
                    <Button
                      variant={filtroStatus === "Enviada" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("Enviada")}
                      className={filtroStatus === "Enviada" ? "bg-purple-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Enviadas
                    </Button>
                    <Button
                      variant={filtroStatus === "Entregue" ? "default" : "outline"}
                      onClick={() => setFiltroStatus("Entregue")}
                      className={filtroStatus === "Entregue" ? "bg-green-500" : "border-[#E5DCC8]"}
                      size="sm"
                    >
                      Entregues
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
              </div>
            ) : entregasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entregasFiltradas.map((entrega, index) => (
                  <EntregaCard
                    key={entrega.id}
                    entrega={entrega}
                    onEdit={handleEditEntrega}
                    onDelete={handleDeleteEntrega}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-xl border border-[#E5DCC8]">
                <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355] text-lg">Nenhuma entrega encontrada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AssinanteFormModal
          open={showAssinanteForm}
          onClose={() => {
            setShowAssinanteForm(false);
            setEditingAssinante(null);
            loadData();
          }}
          assinante={editingAssinante}
        />

        <EntregaFormModal
          open={showEntregaForm}
          onClose={() => {
            setShowEntregaForm(false);
            setEditingEntrega(null);
            setSelectedAssinanteEntrega(null);
            loadData();
          }}
          entrega={editingEntrega}
          assinante={selectedAssinanteEntrega}
          cafes={cafes}
        />
      </div>
    </div>
  );
}