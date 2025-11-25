
import React, { useState, useEffect } from "react";
import { Agendamento } from "@/entities/Agendamento";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format, isSameDay } from "date-fns";

import AgendamentoCard from "../components/agenda/AgendamentoCard";
import AgendamentoFormModal from "../components/agenda/AgendamentoFormModal";

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadAgendamentos();
  }, []);

  const loadAgendamentos = async () => {
    setIsLoading(true);
    const data = await Agendamento.list("-data_inicio");
    setAgendamentos(data);
    setIsLoading(false);
  };

  const agendamentosDoDia = agendamentos.filter(a => 
    isSameDay(new Date(a.data_inicio), selectedDate)
  );

  const proximosAgendamentos = agendamentos.filter(a => 
    new Date(a.data_inicio) > new Date() && 
    a.status !== "Cancelado" &&
    !isSameDay(new Date(a.data_inicio), selectedDate)
  ).slice(0, 5);

  const handleSave = async (data) => {
    if (selectedAgendamento) {
      await Agendamento.update(selectedAgendamento.id, data);
    } else {
      await Agendamento.create(data);
    }
    setShowForm(false);
    setSelectedAgendamento(null);
    loadAgendamentos();
  };

  const handleEdit = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowForm(true);
  };

  const handleDelete = async (agendamentoId) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      await Agendamento.delete(agendamentoId);
      loadAgendamentos();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} ${selectedIds.length === 1 ? 'agendamento' : 'agendamentos'}?`)) {
      for (const id of selectedIds) {
        await Agendamento.delete(id);
      }
      setSelectedIds([]);
      loadAgendamentos();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === agendamentosDoDia.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(agendamentosDoDia.map(a => a.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const datesWithEvents = agendamentos.map(a => new Date(a.data_inicio));

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
              Agenda de Compromissos
            </h1>
            <p className="text-[#8B7355]">
              Gerencie reuniões, visitas e eventos
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedAgendamento(null);
              setShowForm(true);
            }}
            className="bg-[#6B4423] hover:bg-[#5A3A1E] text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E5DCC8] shadow-sm">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md"
                modifiers={{
                  hasEvent: datesWithEvents
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: 'bold',
                    backgroundColor: '#6B4423',
                    color: 'white',
                    borderRadius: '50%'
                  }
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E5DCC8] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-[#6B4423]" />
                <h2 className="text-xl font-bold text-[#6B4423]">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h2>
              </div>

              {/* Bulk Actions for selected date */}
              {agendamentosDoDia.length > 0 && (
                <div className="mb-4 pb-4 border-b border-[#E5DCC8]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === agendamentosDoDia.length && agendamentosDoDia.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-[#6B4423] rounded focus:ring-[#6B4423]"
                        />
                        <span className="text-sm text-[#6B4423] font-medium">
                          Selecionar todos ({agendamentosDoDia.length})
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
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
                </div>
              ) : agendamentosDoDia.length > 0 ? (
                <div className="space-y-3">
                  {agendamentosDoDia.map((agendamento) => (
                    <div key={agendamento.id} className="relative">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(agendamento.id)}
                        onChange={() => toggleSelect(agendamento.id)}
                        className="absolute top-4 left-4 z-10 w-4 h-4 text-[#6B4423] rounded focus:ring-[#6B4423]"
                      />
                      <div className="pl-8">
                        <AgendamentoCard
                          agendamento={agendamento}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#8B7355] py-8">
                  Nenhum agendamento para este dia
                </p>
              )}
            </div>

            {proximosAgendamentos.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E5DCC8] shadow-sm">
                <h2 className="text-xl font-bold text-[#6B4423] mb-4">
                  Próximos Agendamentos
                </h2>
                <div className="space-y-3">
                  {proximosAgendamentos.map((agendamento) => (
                    <AgendamentoCard
                      key={agendamento.id}
                      agendamento={agendamento}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <AgendamentoFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedAgendamento(null);
          }}
          onSave={handleSave}
          agendamento={selectedAgendamento}
        />
      </div>
    </div>
  );
}
