import React, { useState, useEffect, useCallback } from "react";
import { Caixa } from "@/entities/Caixa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Scan, Images, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CaixaCard from "../components/logistica/CaixaCard";
import CaixaFormModal from "../components/logistica/CaixaFormModal";
import ScanLabelModal from "../components/logistica/ScanLabelModal";
import BatchImageUploadModal from "../components/logistica/BatchImageUploadModal";
import PullToRefresh from "../components/layout/PullToRefresh";

export default function Logistica() {
  const [caixas, setCaixas] = useState([]);
  const [filteredCaixas, setFilteredCaixas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [selectedCaixa, setSelectedCaixa] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const loadCaixas = useCallback(async () => {
    setIsLoading(true);
    const data = await Caixa.list("-created_date");
    setCaixas(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCaixas();
    
    // Listener para tab-refresh
    const handleTabRefresh = (e) => {
      if (e.detail === "Logística") {
        loadCaixas();
      }
    };
    window.addEventListener('tab-refresh', handleTabRefresh);
    return () => window.removeEventListener('tab-refresh', handleTabRefresh);
  }, [loadCaixas]);

  useEffect(() => {
    let filtered = caixas;

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.numero_identificacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCaixas(filtered);
  }, [caixas, searchTerm, statusFilter]);

  const handleSave = async (data) => {
    // Optimistic UI update
    if (selectedCaixa) {
      setCaixas(prev => prev.map(c => c.id === selectedCaixa.id ? { ...c, ...data } : c));
    } else {
      const tempId = `temp-${Date.now()}`;
      setCaixas(prev => [{ id: tempId, ...data }, ...prev]);
    }
    setShowForm(false);
    setSelectedCaixa(null);
    setScannedData(null);
    
    // Persistir no backend
    if (selectedCaixa) {
      await Caixa.update(selectedCaixa.id, data);
    } else {
      await Caixa.create(data);
    }
    loadCaixas();
  };

  const handleEdit = (caixa) => {
    setSelectedCaixa(caixa);
    setShowForm(true);
  };

  const handleDelete = async (caixaId) => {
    if (confirm("Tem certeza que deseja excluir esta caixa?")) {
      await Caixa.delete(caixaId);
      loadCaixas();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} ${selectedIds.length === 1 ? 'caixa' : 'caixas'}?`)) {
      for (const id of selectedIds) {
        await Caixa.delete(id);
      }
      setSelectedIds([]);
      loadCaixas();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCaixas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCaixas.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDataExtracted = (data) => {
    setScannedData(data);
    setShowForm(true);
  };

  const statusCounts = {
    all: caixas.length,
    "Aguardando Envio": caixas.filter(c => c.status === "Aguardando Envio").length,
    "Em Trânsito": caixas.filter(c => c.status === "Em Trânsito").length,
    "Entregue": caixas.filter(c => c.status === "Entregue").length,
    "Problema": caixas.filter(c => c.status === "Problema").length,
  };

  return (
    <PullToRefresh onRefresh={loadCaixas} className="min-h-screen">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              Controle Logístico
            </h1>
            <p className="text-[#8B7355]">
              Acompanhamento de movimentação de caixas
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setShowBatchUpload(true)}
              variant="outline"
              className="border-[#D97706] text-[#D97706] hover:bg-[#D97706]/10"
            >
              <Images className="w-5 h-5 mr-2" />
              Processar Lote
            </Button>
            <Button
              onClick={() => setShowScanModal(true)}
              variant="outline"
              className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
            >
              <Scan className="w-5 h-5 mr-2" />
              Escanear Etiqueta
            </Button>
            <Button
              onClick={() => {
                setSelectedCaixa(null);
                setScannedData(null);
                setShowForm(true);
              }}
              className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Caixa
            </Button>
          </div>
        </div>

        {filteredCaixas.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#E5DCC8] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCaixas.length && filteredCaixas.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#6B4423] rounded focus:ring-[#6B4423]"
                  />
                  <span className="text-sm text-[#6B4423] font-medium">
                    Selecionar todas ({filteredCaixas.length})
                  </span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-[#8B7355]">
                    {selectedIds.length} {selectedIds.length === 1 ? 'selecionada' : 'selecionadas'}
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
                  Excluir Selecionadas
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-[#E5DCC8] shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                <Input
                  placeholder="Buscar por número, conteúdo ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#E5DCC8] focus:border-[#6B4423]"
                />
              </div>
            </div>
            <div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-[#F5F1E8]">
                  <TabsTrigger value="all">
                    Todas ({statusCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="Aguardando Envio">
                    Aguardando ({statusCounts["Aguardando Envio"]})
                  </TabsTrigger>
                  <TabsTrigger value="Em Trânsito">
                    Em Trânsito ({statusCounts["Em Trânsito"]})
                  </TabsTrigger>
                  <TabsTrigger value="Entregue">
                    Entregues ({statusCounts["Entregue"]})
                  </TabsTrigger>
                  <TabsTrigger value="Problema">
                    Problemas ({statusCounts["Problema"]})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : filteredCaixas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaixas.map((caixa) => (
              <div key={caixa.id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(caixa.id)}
                  onChange={() => toggleSelect(caixa.id)}
                  className="absolute top-4 left-4 z-10 w-5 h-5 text-[#6B4423] rounded focus:ring-[#6B4423]"
                />
                <CaixaCard
                  caixa={caixa}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
            <p className="text-[#8B7355] text-lg">Nenhuma caixa encontrada</p>
          </div>
        )}

        <ScanLabelModal
          open={showScanModal}
          onClose={() => setShowScanModal(false)}
          onDataExtracted={handleDataExtracted}
        />

        <BatchImageUploadModal
          open={showBatchUpload}
          onClose={() => setShowBatchUpload(false)}
          onComplete={loadCaixas}
        />

        <CaixaFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedCaixa(null);
            setScannedData(null);
          }}
          onSave={handleSave}
          caixa={selectedCaixa || scannedData}
        />
        </div>
      </div>
    </PullToRefresh>
  );
}