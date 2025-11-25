import React, { useState, useEffect } from "react";
import { EntregaClube } from "@/entities/EntregaClube";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Save, Plus, Trash2 } from "lucide-react";

export default function EntregaFormModal({ open, onClose, entrega, assinante, cafes }) {
  const [formData, setFormData] = useState({
    data_programada: "",
    data_entrega: "",
    cafes_entregues: [],
    status: "Programada",
    codigo_rastreamento: "",
    observacoes: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entrega) {
      setFormData({
        data_programada: entrega.data_programada || "",
        data_entrega: entrega.data_entrega || "",
        cafes_entregues: entrega.cafes_entregues || [],
        status: entrega.status || "Programada",
        codigo_rastreamento: entrega.codigo_rastreamento || "",
        observacoes: entrega.observacoes || ""
      });
    } else {
      setFormData({
        data_programada: assinante?.data_proxima_entrega || "",
        data_entrega: "",
        cafes_entregues: [{ cafe_nome: "", quantidade: assinante?.quantidade_pacotes || 1, moagem: assinante?.moagem_preferida || "" }],
        status: "Programada",
        codigo_rastreamento: "",
        observacoes: ""
      });
    }
  }, [entrega, assinante, open]);

  const addCafe = () => {
    setFormData({
      ...formData,
      cafes_entregues: [...formData.cafes_entregues, { cafe_nome: "", quantidade: 1, moagem: "" }]
    });
  };

  const removeCafe = (index) => {
    const newCafes = formData.cafes_entregues.filter((_, i) => i !== index);
    setFormData({ ...formData, cafes_entregues: newCafes });
  };

  const updateCafe = (index, field, value) => {
    const newCafes = [...formData.cafes_entregues];
    newCafes[index] = { ...newCafes[index], [field]: value };
    setFormData({ ...formData, cafes_entregues: newCafes });
  };

  const handleSave = async () => {
    if (!formData.data_programada) {
      alert("Informe a data programada");
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      ...formData,
      assinante_id: entrega?.assinante_id || assinante?.id,
      assinante_nome: entrega?.assinante_nome || assinante?.nome,
      assinante_email: entrega?.assinante_email || assinante?.email
    };

    if (entrega) {
      await EntregaClube.update(entrega.id, dataToSave);
    } else {
      await EntregaClube.create(dataToSave);
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#6B4423]">
            {entrega ? "Editar Entrega" : "Nova Entrega"}
          </DialogTitle>
          {assinante && (
            <p className="text-sm text-[#8B7355]">
              Assinante: {assinante.nome}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Programada *</Label>
              <Input
                type="date"
                value={formData.data_programada}
                onChange={(e) => setFormData({ ...formData, data_programada: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="space-y-2">
              <Label>Data Entrega</Label>
              <Input
                type="date"
                value={formData.data_entrega}
                onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="border-[#E5DCC8]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="Em Preparação">Em Preparação</SelectItem>
                <SelectItem value="Enviada">Enviada</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Código de Rastreamento</Label>
            <Input
              value={formData.codigo_rastreamento}
              onChange={(e) => setFormData({ ...formData, codigo_rastreamento: e.target.value })}
              className="border-[#E5DCC8]"
              placeholder="Código de rastreio..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cafés da Entrega</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCafe}
                className="text-[#6B4423]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {formData.cafes_entregues.map((cafe, index) => (
              <div key={index} className="flex gap-2 items-start bg-[#F5F1E8] p-3 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Select
                    value={cafe.cafe_nome}
                    onValueChange={(value) => updateCafe(index, 'cafe_nome', value)}
                  >
                    <SelectTrigger className="border-[#E5DCC8] bg-white">
                      <SelectValue placeholder="Selecione o café" />
                    </SelectTrigger>
                    <SelectContent>
                      {cafes.map(c => (
                        <SelectItem key={c.id} value={c.nome}>
                          {c.nome} ({c.forma})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={cafe.quantidade}
                      onChange={(e) => updateCafe(index, 'quantidade', parseInt(e.target.value))}
                      className="border-[#E5DCC8] bg-white w-20"
                      placeholder="Qtd"
                    />
                    <Select
                      value={cafe.moagem}
                      onValueChange={(value) => updateCafe(index, 'moagem', value)}
                    >
                      <SelectTrigger className="border-[#E5DCC8] bg-white flex-1">
                        <SelectValue placeholder="Moagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grão">Grão</SelectItem>
                        <SelectItem value="Moído Grosso">Moído Grosso</SelectItem>
                        <SelectItem value="Moído Médio">Moído Médio</SelectItem>
                        <SelectItem value="Moído Fino">Moído Fino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.cafes_entregues.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCafe(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={2}
              placeholder="Observações da entrega..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}