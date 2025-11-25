
import React, { useState, useEffect } from "react";
import { Tarefa } from "@/entities/Tarefa";
import { EtiquetaProblema } from "@/entities/EtiquetaProblema";
import { Responsavel } from "@/entities/Responsavel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckSquare } from "lucide-react";

import TarefaKanban from "../components/tarefas/TarefaKanban";
import TarefaFormModal from "../components/tarefas/TarefaFormModal";
import TarefaStats from "../components/tarefas/TarefaStats";

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [filteredTarefas, setFilteredTarefas] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tarefas;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTarefas(filtered);
  }, [tarefas, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    const [tarefasData, etiquetasData, responsaveisData] = await Promise.all([
      Tarefa.list("-created_date"),
      EtiquetaProblema.list(),
      Responsavel.filter({ ativo: true })
    ]);
    setTarefas(tarefasData);
    setEtiquetas(etiquetasData);
    setResponsaveis(responsaveisData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (selectedTarefa) {
      await Tarefa.update(selectedTarefa.id, data);
    } else {
      await Tarefa.create(data);
    }
    setShowForm(false);
    setSelectedTarefa(null);
    loadData();
  };

  const handleStatusChange = async (tarefaId, newStatus) => {
    const tarefaToUpdate = tarefas.find(t => t.id === tarefaId);
    if (tarefaToUpdate) {
      const updateData = { ...tarefaToUpdate, status: newStatus };
      
      // Se mudou para "Concluído", adicionar data de conclusão
      if (newStatus === "Concluído" && !tarefaToUpdate.data_conclusao) {
        updateData.data_conclusao = new Date().toISOString().split('T')[0];
      }
      
      await Tarefa.update(tarefaId, updateData);
      loadData();
    }
  };

  const handleEdit = (tarefa) => {
    setSelectedTarefa(tarefa);
    setShowForm(true);
  };

  const handleDelete = async (tarefaId) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await Tarefa.delete(tarefaId);
      loadData();
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
              <CheckSquare className="w-8 h-8" />
              Quadro de Tarefas
            </h1>
            <p className="text-[#8B7355]">
              Organize e gerencie as demandas da equipe
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedTarefa(null);
              setShowForm(true);
            }}
            className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <TarefaStats tarefas={tarefas} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-[#E5DCC8] shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
            <Input
              placeholder="Buscar por título, descrição, responsável ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#E5DCC8] focus:border-[#6B4423]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : (
          <TarefaKanban
            tarefas={filteredTarefas}
            etiquetas={etiquetas}
            responsaveis={responsaveis}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <TarefaFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedTarefa(null);
          }}
          onSave={handleSave}
          tarefa={selectedTarefa}
          etiquetasDisponiveis={etiquetas}
          responsaveisDisponiveis={responsaveis}
        />
      </div>
    </div>
  );
}
