import React, { useState, useEffect, useCallback } from "react";
import { Problema } from "@/entities/Problema";
import { EtiquetaProblema } from "@/entities/EtiquetaProblema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, LayoutGrid, List, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProblemaCard from "../components/problemas/ProblemaCard";
import ProblemaFormModal from "../components/problemas/ProblemaFormModal";
import ProblemaStats from "../components/problemas/ProblemaStats";
import ProblemaKanban from "../components/problemas/ProblemaKanban";
import EtiquetasManager from "../components/problemas/EtiquetasManager";
import ProblemaDetalhesModal from "../components/problemas/ProblemaDetalhesModal";
import PullToRefresh from "../components/layout/PullToRefresh";

export default function Problemas() {
  const [problemas, setProblemas] = useState([]);
  const [filteredProblemas, setFilteredProblemas] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEtiquetasManager, setShowEtiquetasManager] = useState(false);
  const [selectedProblema, setSelectedProblema] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [problemaDetalhes, setProblemaDetalhes] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [problemasData, etiquetasData] = await Promise.all([
      Problema.list("-created_date"),
      EtiquetaProblema.list()
    ]);
    setProblemas(problemasData);
    setEtiquetas(etiquetasData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    
    // Listener para tab-refresh
    const handleTabRefresh = (e) => {
      if (e.detail === "Chamados") {
        loadData();
      }
    };
    window.addEventListener('tab-refresh', handleTabRefresh);
    return () => window.removeEventListener('tab-refresh', handleTabRefresh);
  }, [loadData]);

  useEffect(() => {
    let filtered = problemas;

    if (viewMode === "list" && statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (viewMode === "list" && searchTerm) {
      filtered = filtered.filter(p =>
        p.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.etiquetas?.some(e => etiquetas.find(et => et.id === e)?.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (viewMode === "kanban" && searchTerm) {
        filtered = filtered.filter(p =>
          p.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.etiquetas?.some(e => etiquetas.find(et => et.id === e)?.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    setFilteredProblemas(filtered);
  }, [problemas, searchTerm, statusFilter, viewMode, etiquetas]);

  const handleSave = async (data) => {
    let problemaSalvo;
    
    // Optimistic UI update
    if (selectedProblema) {
      setProblemas(prev => prev.map(p => p.id === selectedProblema.id ? { ...p, ...data } : p));
      await Problema.update(selectedProblema.id, data);
      problemaSalvo = { ...selectedProblema, ...data };
    } else {
      const tempId = `temp-${Date.now()}`;
      const tempProblema = { id: tempId, ...data, created_date: new Date().toISOString() };
      setProblemas(prev => [tempProblema, ...prev]);
      problemaSalvo = await Problema.create(data);
    }
    
    setShowForm(false);
    setSelectedProblema(null);
    loadData();
    
    return problemaSalvo;
  };

  const handleStatusChange = async (problemaId, newStatus) => {
    const problemaToUpdate = problemas.find(p => p.id === problemaId);
    if (problemaToUpdate) {
      await Problema.update(problemaId, { ...problemaToUpdate, status: newStatus });
      loadData();
    }
  };

  const handleEdit = (problema) => {
    setSelectedProblema(problema);
    setShowForm(true);
  };

  const handleDelete = async (problemaId) => {
    if (confirm("Tem certeza que deseja excluir este chamado?")) {
      await Problema.delete(problemaId);
      loadData();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} ${selectedIds.length === 1 ? 'chamado' : 'chamados'}?`)) {
      for (const id of selectedIds) {
        await Problema.delete(id);
      }
      setSelectedIds([]);
      loadData();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProblemas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProblemas.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (problema) => {
    setProblemaDetalhes(problema);
    setShowDetalhes(true);
  };

  const handleCloseDetalhes = () => {
    setShowDetalhes(false);
    setProblemaDetalhes(null);
    loadData();
  };

  return (
    <PullToRefresh onRefresh={loadData} className="min-h-screen">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              Gestão de Chamados
            </h1>
            <p className="text-[#8B7355]">
              Registro e acompanhamento de chamados de clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEtiquetasManager(true)}
              variant="outline"
              className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
            >
              <Tag className="w-5 h-5 mr-2" />
              Etiquetas
            </Button>
            <Button
              onClick={() => {
                setSelectedProblema(null);
                setShowForm(true);
              }}
              className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Chamado
            </Button>
          </div>
        </div>

        <ProblemaStats problemas={problemas} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-[#E5DCC8] shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-[#6B4423] text-white hover:bg-[#5A3A1E]" : "border-[#E5DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"}
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={viewMode === "kanban" ? "bg-[#6B4423] text-white hover:bg-[#5A3A1E]" : "border-[#E5DCC8] hover:bg-[#F5F1E8] text-[#6B4423]"}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
            </div>

            {viewMode === "list" && (
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-[#F5F1E8]">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="Aberto">Abertos</TabsTrigger>
                  <TabsTrigger value="Em Andamento">Em Andamento</TabsTrigger>
                  <TabsTrigger value="Resolvido">Resolvidos</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {(viewMode === "list" || viewMode === "kanban") && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
              <Input
                placeholder="Buscar por nome, email, descrição, responsável ou etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5DCC8] focus:border-[#6B4423]"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : (
          <>
            {viewMode === "kanban" ? (
              <ProblemaKanban
                problemas={filteredProblemas}
                etiquetas={etiquetas}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
              />
            ) : (
              <>
                {filteredProblemas.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#E5DCC8] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === filteredProblemas.length && filteredProblemas.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-[#6B4423] rounded focus:ring-[#6B4423]"
                          />
                          <span className="text-sm text-[#6B4423] font-medium">
                            Selecionar todos ({filteredProblemas.length})
                          </span>
                        </label>
                        {selectedIds.length > 0 && (
                          <span className="text-sm text-[#8B7355]">
                            {selectedIds.length} {selectedIds.length === 1 ? 'selecionado' : 'selecionados'}
                          </span>
                        )}
                      </div>
                      {selectedIds.length > 0 && (
                        <Button
                          onClick={handleBulkDelete}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Selecionados
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {filteredProblemas.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProblemas.map((problema) => (
                      <div key={problema.id} className="relative">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(problema.id)}
                          onChange={() => toggleSelect(problema.id)}
                          className="absolute top-6 left-6 z-10 w-5 h-5 text-[#6B4423] rounded focus:ring-[#6B4423]"
                        />
                        <div className="pl-8">
                          <ProblemaCard
                            problema={problema}
                            etiquetas={etiquetas}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
                    <p className="text-[#8B7355] text-lg">Nenhum chamado encontrado</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <EtiquetasManager
          open={showEtiquetasManager}
          onClose={() => {
            setShowEtiquetasManager(false);
            loadData();
          }}
        />

        <ProblemaFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedProblema(null);
          }}
          onSave={handleSave}
          problema={selectedProblema}
          etiquetasDisponiveis={etiquetas}
        />

        <ProblemaDetalhesModal
          open={showDetalhes}
          onClose={handleCloseDetalhes}
          problema={problemaDetalhes}
          etiquetas={etiquetas}
          onEdit={(problema) => {
            setShowDetalhes(false);
            handleEdit(problema);
          }}
          onUpdate={loadData}
        />
        </div>
      </div>
    </PullToRefresh>
  );
}