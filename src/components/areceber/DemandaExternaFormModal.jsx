import React, { useState, useEffect } from "react";
import { DemandaExterna } from "@/entities/DemandaExterna";
import { HistoricoDemanda } from "@/entities/HistoricoDemanda";
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

export default function DemandaExternaFormModal({ open, onClose, demanda, userName }) {
  const [formData, setFormData] = useState({
    cliente_nome: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "Pendente",
    forma_pagamento: "",
    observacoes: ""
  });
  const [motivoAlteracao, setMotivoAlteracao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (demanda) {
      setFormData({
        cliente_nome: demanda.cliente_nome || "",
        descricao: demanda.descricao || "",
        valor: demanda.valor || "",
        data_vencimento: demanda.data_vencimento || "",
        data_pagamento: demanda.data_pagamento || "",
        status: demanda.status || "Pendente",
        forma_pagamento: demanda.forma_pagamento || "",
        observacoes: demanda.observacoes || ""
      });
    } else {
      setFormData({
        cliente_nome: "",
        descricao: "",
        valor: "",
        data_vencimento: "",
        data_pagamento: "",
        status: "Pendente",
        forma_pagamento: "",
        observacoes: ""
      });
    }
    setMotivoAlteracao("");
  }, [demanda, open]);

  const handleSave = async () => {
    if (!formData.cliente_nome || !formData.descricao || !formData.valor || !formData.data_vencimento) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSaving(true);

    const dataToSave = {
      ...formData,
      valor: parseFloat(formData.valor)
    };

    if (demanda) {
      // Verificar alterações e criar histórico
      const alteracoes = [];
      
      if (demanda.valor !== parseFloat(formData.valor)) {
        alteracoes.push({
          tipo: "Renegociação",
          campo: "valor",
          anterior: demanda.valor,
          novo: parseFloat(formData.valor)
        });
      }
      
      if (demanda.data_vencimento !== formData.data_vencimento) {
        alteracoes.push({
          tipo: "Alteração Data",
          campo: "data_vencimento",
          anterior: demanda.data_vencimento,
          novo: formData.data_vencimento
        });
      }
      
      if (demanda.status !== formData.status) {
        const tipoAlteracao = formData.status === "Pago" ? "Pagamento" : 
                             formData.status === "Cancelado" ? "Cancelamento" :
                             formData.status === "Renegociado" ? "Renegociação" : "Observação";
        alteracoes.push({
          tipo: tipoAlteracao,
          campo: "status",
          anterior: demanda.status,
          novo: formData.status
        });
      }

      // Criar histórico para cada alteração
      for (const alt of alteracoes) {
        await HistoricoDemanda.create({
          demanda_id: demanda.id,
          tipo_alteracao: alt.tipo,
          valor_anterior: alt.campo === "valor" ? alt.anterior : null,
          valor_novo: alt.campo === "valor" ? alt.novo : null,
          data_anterior: alt.campo === "data_vencimento" ? alt.anterior : null,
          data_nova: alt.campo === "data_vencimento" ? alt.novo : null,
          status_anterior: alt.campo === "status" ? alt.anterior : null,
          status_novo: alt.campo === "status" ? alt.novo : null,
          descricao: motivoAlteracao || `Alteração de ${alt.campo}`,
          autor: userName || "Sistema"
        });
      }

      await DemandaExterna.update(demanda.id, dataToSave);
    } else {
      const novaDemanda = await DemandaExterna.create(dataToSave);
      
      // Criar histórico de criação
      await HistoricoDemanda.create({
        demanda_id: novaDemanda.id,
        tipo_alteracao: "Criação",
        valor_novo: parseFloat(formData.valor),
        data_nova: formData.data_vencimento,
        status_novo: "Pendente",
        descricao: "Demanda criada",
        autor: userName || "Sistema"
      });
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#6B4423]">
            {demanda ? "Editar Demanda" : "Nova Demanda Externa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Input
              value={formData.cliente_nome}
              onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
              className="border-[#E5DCC8]"
              placeholder="Nome do cliente"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="border-[#E5DCC8]"
              placeholder="Descreva a demanda..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Vencimento *</Label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Renegociado">Renegociado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Input
                value={formData.forma_pagamento}
                onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Ex: Boleto, Pix"
              />
            </div>
          </div>

          {formData.status === "Pago" && (
            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>

          {demanda && (
            <div className="space-y-2 bg-[#F5F1E8] p-3 rounded-lg">
              <Label>Motivo da Alteração</Label>
              <Textarea
                value={motivoAlteracao}
                onChange={(e) => setMotivoAlteracao(e.target.value)}
                className="border-[#E5DCC8] bg-white"
                rows={2}
                placeholder="Descreva o motivo da alteração para o histórico..."
              />
            </div>
          )}

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