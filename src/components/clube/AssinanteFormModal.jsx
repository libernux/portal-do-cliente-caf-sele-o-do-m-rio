import React, { useState, useEffect } from "react";
import { AssinanteClube } from "@/entities/AssinanteClube";
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
import { Save } from "lucide-react";

export default function AssinanteFormModal({ open, onClose, assinante }) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "Mensal",
    quantidade_pacotes: 1,
    tipo_cafe_preferido: "",
    moagem_preferida: "",
    data_inicio: "",
    data_proxima_entrega: "",
    status: "Ativo",
    observacoes: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (assinante) {
      setFormData({
        nome: assinante.nome || "",
        email: assinante.email || "",
        telefone: assinante.telefone || "",
        endereco: assinante.endereco || "",
        plano: assinante.plano || "Mensal",
        quantidade_pacotes: assinante.quantidade_pacotes || 1,
        tipo_cafe_preferido: assinante.tipo_cafe_preferido || "",
        moagem_preferida: assinante.moagem_preferida || "",
        data_inicio: assinante.data_inicio || "",
        data_proxima_entrega: assinante.data_proxima_entrega || "",
        status: assinante.status || "Ativo",
        observacoes: assinante.observacoes || ""
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        plano: "Mensal",
        quantidade_pacotes: 1,
        tipo_cafe_preferido: "",
        moagem_preferida: "",
        data_inicio: new Date().toISOString().split('T')[0],
        data_proxima_entrega: "",
        status: "Ativo",
        observacoes: ""
      });
    }
  }, [assinante, open]);

  const generateSlug = (nome) => {
    return nome.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.plano) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      ...formData,
      quantidade_pacotes: parseInt(formData.quantidade_pacotes)
    };

    if (assinante) {
      await AssinanteClube.update(assinante.id, dataToSave);
    } else {
      dataToSave.slug_acesso = generateSlug(formData.nome);
      await AssinanteClube.create(dataToSave);
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#6B4423]">
            {assinante ? "Editar Assinante" : "Novo Assinante"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="(27) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Endereço de Entrega</Label>
            <Textarea
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="border-[#E5DCC8]"
              rows={2}
              placeholder="Endereço completo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plano *</Label>
              <Select
                value={formData.plano}
                onValueChange={(value) => setFormData({ ...formData, plano: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Qtd. Pacotes/Entrega *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantidade_pacotes}
                onChange={(e) => setFormData({ ...formData, quantidade_pacotes: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferência de Café</Label>
              <Input
                value={formData.tipo_cafe_preferido}
                onChange={(e) => setFormData({ ...formData, tipo_cafe_preferido: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Ex: Bourbon, Especial"
              />
            </div>

            <div className="space-y-2">
              <Label>Moagem Preferida</Label>
              <Select
                value={formData.moagem_preferida}
                onValueChange={(value) => setFormData({ ...formData, moagem_preferida: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue placeholder="Selecione..." />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="space-y-2">
              <Label>Próxima Entrega</Label>
              <Input
                type="date"
                value={formData.data_proxima_entrega}
                onChange={(e) => setFormData({ ...formData, data_proxima_entrega: e.target.value })}
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
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={2}
              placeholder="Observações sobre o assinante..."
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