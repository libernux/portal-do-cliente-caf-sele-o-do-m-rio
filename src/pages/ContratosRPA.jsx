import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileSignature
} from "lucide-react";

import ContratoRPAFormModal from "../components/contratos/ContratoRPAFormModal";
import ContratoRPACard from "../components/contratos/ContratoRPACard";
import EnviarAssinaturaModal from "../components/contratos/EnviarAssinaturaModal";

export default function ContratosRPA() {
  const [contratos, setContratos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEnviarModal, setShowEnviarModal] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [selectedContrato, setSelectedContrato] = useState(null);

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    setIsLoading(true);
    const data = await base44.entities.ContratoRPA.list("-created_date");
    setContratos(data);
    setIsLoading(false);
  };

  const handleEdit = (contrato) => {
    setEditingContrato(contrato);
    setShowFormModal(true);
  };

  const handleDelete = async (contrato) => {
    if (confirm(`Tem certeza que deseja excluir o contrato ${contrato.numero_contrato}?`)) {
      await base44.entities.ContratoRPA.delete(contrato.id);
      await loadContratos();
    }
  };

  const handleEnviarAssinatura = (contrato) => {
    setSelectedContrato(contrato);
    setShowEnviarModal(true);
  };

  const handleConfirmarEnvio = async (signatarios) => {
    try {
      const response = await base44.functions.invoke('criarContratoAutentique', {
        contratoId: selectedContrato.id,
        signatarios
      });

      console.log('Resposta completa:', response);

      if (response.data.success) {
        alert('Contrato enviado para assinatura com sucesso!');
        setShowEnviarModal(false);
        await loadContratos();
        return response.data;
      } else {
        const errorMsg = response.data.error || 'Erro desconhecido';
        const errorDetails = response.data.details || '';
        throw new Error(`${errorMsg}\n\nDetalhes: ${JSON.stringify(errorDetails, null, 2)}`);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  };

  const handleConsultarStatus = async (contrato) => {
    try {
      const response = await base44.functions.invoke('consultarStatusContrato', {
        documentId: contrato.autentique_document_id
      });

      if (response.data.success) {
        const doc = response.data.document;
        alert(`Status do Contrato:\n\nDocumento: ${doc.name}\n\nAssinaturas:\n${doc.signatures.map(s => 
          `- ${s.name} (${s.email}): ${s.signed ? 'Assinado' : s.viewed ? 'Visualizado' : 'Pendente'}`
        ).join('\n')}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao consultar status');
    }
  };

  const handleVerDetalhes = (contrato) => {
    if (contrato.autentique_document_url) {
      window.open(contrato.autentique_document_url, '_blank');
    } else {
      alert('Link do documento não disponível');
    }
  };

  const filteredContratos = contratos.filter(c => {
    const matchSearch = c.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.contratante_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: contratos.length,
    rascunho: contratos.filter(c => c.status === "Rascunho").length,
    aguardando: contratos.filter(c => c.status === "Aguardando Assinatura").length,
    assinado: contratos.filter(c => c.status === "Assinado").length,
    valorTotal: contratos.filter(c => c.status === "Assinado").reduce((acc, c) => acc + (c.valor_contrato || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#6B4423]">Contratos RPA</h1>
            <p className="text-[#8B7355]">Gestão de contratos digitais com assinatura eletrônica</p>
          </div>
          <Button
            onClick={() => {
              setEditingContrato(null);
              setShowFormModal(true);
            }}
            className="bg-[#6B4423] hover:bg-[#5A3A1E]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#6B4423]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#6B4423]">{stats.total}</p>
                  <p className="text-xs text-[#8B7355]">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats.rascunho}</p>
                  <p className="text-xs text-[#8B7355]">Rascunhos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.aguardando}</p>
                  <p className="text-xs text-[#8B7355]">Aguardando</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.assinado}</p>
                  <p className="text-xs text-[#8B7355]">Assinados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8] bg-[#2D5016]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                  <FileSignature className="w-5 h-5 text-[#2D5016]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#2D5016]">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[#8B7355]">Total Assinado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-[#E5DCC8]">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                <Input
                  placeholder="Buscar por número ou contratante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#E5DCC8]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className={filterStatus === "all" ? "bg-[#6B4423]" : "border-[#E5DCC8]"}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "Rascunho" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Rascunho")}
                  className={filterStatus === "Rascunho" ? "bg-gray-500" : "border-[#E5DCC8]"}
                  size="sm"
                >
                  Rascunhos
                </Button>
                <Button
                  variant={filterStatus === "Aguardando Assinatura" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Aguardando Assinatura")}
                  className={filterStatus === "Aguardando Assinatura" ? "bg-yellow-500" : "border-[#E5DCC8]"}
                  size="sm"
                >
                  Aguardando
                </Button>
                <Button
                  variant={filterStatus === "Assinado" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Assinado")}
                  className={filterStatus === "Assinado" ? "bg-green-500" : "border-[#E5DCC8]"}
                  size="sm"
                >
                  Assinados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
            <p className="text-[#8B7355] mt-4">Carregando...</p>
          </div>
        ) : filteredContratos.length === 0 ? (
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-12 text-center">
              <FileSignature className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
              <p className="text-[#8B7355] text-lg mb-4">Nenhum contrato encontrado</p>
              <Button
                onClick={() => {
                  setEditingContrato(null);
                  setShowFormModal(true);
                }}
                className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Contrato
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContratos.map((contrato, index) => (
              <ContratoRPACard
                key={contrato.id}
                contrato={contrato}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onEnviarAssinatura={handleEnviarAssinatura}
                onVerDetalhes={handleVerDetalhes}
                onConsultarStatus={handleConsultarStatus}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ContratoRPAFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingContrato(null);
          loadContratos();
        }}
        contrato={editingContrato}
      />

      <EnviarAssinaturaModal
        open={showEnviarModal}
        onClose={() => {
          setShowEnviarModal(false);
          setSelectedContrato(null);
        }}
        contrato={selectedContrato}
        onEnviar={handleConfirmarEnvio}
      />
    </div>
  );
}