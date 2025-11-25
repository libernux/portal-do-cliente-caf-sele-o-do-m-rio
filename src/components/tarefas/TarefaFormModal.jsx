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
import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";

export default function TarefaFormModal({ open, onClose, onSave, tarefa, etiquetasDisponiveis, responsaveisDisponiveis }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "A Fazer",
    prioridade: "Média",
    responsavel: "",
    tipo: "Outro",
    prazo: "",
    data_inicio: "",
    data_conclusao: "",
    tempo_estimado: "",
    etiquetas: [],
    observacoes: ""
  });

  useEffect(() => {
    if (tarefa) {
      setFormData(tarefa);
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        status: "A Fazer",
        prioridade: "Média",
        responsavel: "",
        tipo: "Outro",
        prazo: "",
        data_inicio: "",
        data_conclusao: "",
        tempo_estimado: "",
        etiquetas: [],
        observacoes: ""
      });
    }
  }, [tarefa, open]);

  const toggleEtiqueta = (etiquetaId) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas?.includes(etiquetaId)
        ? prev.etiquetas.filter(id => id !== etiquetaId)
        : [...(prev.etiquetas || []), etiquetaId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {tarefa ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              className="border-[#E5DCC8]"
              placeholder="Ex: Implementar novo recurso no sistema"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="border-[#E5DCC8]"
              rows={4}
              placeholder="Descreva detalhadamente a tarefa..."
            />
          </div>

          {/* Tipo e Prioridade */}
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
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Logística">Logística</SelectItem>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
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

          {/* Status e Responsável */}
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="A Fazer">A Fazer</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select
                value={formData.responsavel}
                onValueChange={(value) => setFormData({ ...formData, responsavel: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveisDisponiveis.map(resp => (
                    <SelectItem key={resp.id} value={resp.nome}>
                      {resp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prazo e Tempo Estimado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempo_estimado">Tempo Estimado (horas)</Label>
              <Input
                id="tempo_estimado"
                type="number"
                value={formData.tempo_estimado}
                onChange={(e) => setFormData({ ...formData, tempo_estimado: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Ex: 8"
              />
            </div>
          </div>

          {/* Etiquetas */}
          {etiquetasDisponiveis.length > 0 && (
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-2">
                {etiquetasDisponiveis.map(etiqueta => {
                  const isSelected = formData.etiquetas?.includes(etiqueta.id);
                  
                  return (
                    <Badge
                      key={etiqueta.id}
                      onClick={() => toggleEtiqueta(etiqueta.id)}
                      style={{
                        backgroundColor: isSelected ? etiqueta.cor : `${etiqueta.cor}15`,
                        color: isSelected ? 'white' : etiqueta.cor,
                        borderColor: etiqueta.cor,
                        cursor: 'pointer'
                      }}
                      variant="outline"
                      className="border hover:scale-105 transition-transform"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {etiqueta.nome}
                      {isSelected && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
              placeholder="Adicione observações ou notas sobre a tarefa..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {tarefa ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}