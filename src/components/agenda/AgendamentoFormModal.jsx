import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notificarAgendamento } from "@/functions/notificarAgendamento";

export default function AgendamentoFormModal({ open, onClose, onSave, agendamento }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    tipo: "Reunião",
    participantes: [],
    status: "Agendado",
    notificar_participantes: false,
  });

  const [participanteInput, setParticipanteInput] = useState("");

  useEffect(() => {
    if (agendamento) {
      setFormData({
        ...agendamento,
        data_inicio: agendamento.data_inicio?.substring(0, 16) || "",
        data_fim: agendamento.data_fim?.substring(0, 16) || "",
        notificar_participantes: agendamento.notificar_participantes || false,
      });
    } else {
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      setFormData({
        titulo: "",
        descricao: "",
        data_inicio: start.toISOString().substring(0, 16),
        data_fim: end.toISOString().substring(0, 16),
        local: "",
        tipo: "Reunião",
        participantes: [],
        status: "Agendado",
        notificar_participantes: false,
      });
    }
  }, [agendamento, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isNew = !agendamento;
    const statusAnterior = agendamento?.status;
    
    const savedData = {
      ...formData,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: new Date(formData.data_fim).toISOString(),
    };
    
    const agendamentoSalvo = await onSave(savedData);

    // Enviar notificações
    if (agendamentoSalvo && agendamentoSalvo.id) {
      try {
        // Notificação para novos agendamentos
        if (isNew && formData.notificar_participantes && formData.participantes && formData.participantes.length > 0) {
          const emails = formData.participantes.filter(p => p.includes('@'));
          
          if (emails.length > 0) {
            await notificarAgendamento({
              agendamentoId: agendamentoSalvo.id,
              tipo: 'criado',
              emails: emails
            });
          }
        }
        
        // Notificação se status mudou para 'Cancelado'
        if (agendamento && formData.status === 'Cancelado' && statusAnterior !== 'Cancelado') {
          const emails = formData.participantes?.filter(p => p.includes('@')) || [];
          
          if (emails.length > 0) {
            await notificarAgendamento({
              agendamentoId: agendamento.id,
              tipo: 'cancelado',
              emails: emails
            });
          }
        }
      } catch (error) {
        console.error('Erro ao enviar notificações:', error);
      }
    }
  };

  const addParticipante = () => {
    if (participanteInput.trim()) {
      setFormData({
        ...formData,
        participantes: [...(formData.participantes || []), participanteInput.trim()]
      });
      setParticipanteInput("");
    }
  };

  const removeParticipante = (index) => {
    setFormData({
      ...formData,
      participantes: formData.participantes.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              className="border-[#E5DCC8]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data/Hora Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
                className="border-[#E5DCC8]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data/Hora Fim *</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                required
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reunião">Reunião</SelectItem>
                  <SelectItem value="Visita Cliente">Visita Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Degustação">Degustação</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
              className="border-[#E5DCC8]"
            />
          </div>

          <div className="space-y-2">
            <Label>Participantes (Emails)</Label>
            <div className="flex gap-2">
              <Input
                value={participanteInput}
                onChange={(e) => setParticipanteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipante())}
                placeholder="email@example.com"
                className="border-[#E5DCC8]"
              />
              <Button type="button" onClick={addParticipante} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.participantes && formData.participantes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.participantes.map((p, index) => (
                  <div key={index} className="bg-[#F5F1E8] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => removeParticipante(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notificar_participantes"
              checked={formData.notificar_participantes}
              onChange={(e) => setFormData({ ...formData, notificar_participantes: e.target.checked })}
              className="h-4 w-4 text-[#6B4423] focus:ring-[#6B4423] border-gray-300 rounded"
            />
            <Label htmlFor="notificar_participantes">Notificar participantes por e-mail</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {agendamento ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}