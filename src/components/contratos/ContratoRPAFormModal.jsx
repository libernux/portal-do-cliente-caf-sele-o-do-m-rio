import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2 } from "lucide-react";

export default function ContratoRPAFormModal({ open, onClose, contrato }) {
  const [formData, setFormData] = useState({
    numero_contrato: "",
    tipo_servico: "Consultoria",
    contratante_nome: "",
    contratante_cpf: "",
    contratante_email: "",
    contratante_telefone: "",
    contratante_endereco: "",
    contratada_nome: "Café Seleção do Mário",
    contratada_cnpj: "",
    contratada_representante: "",
    descricao_servico: "",
    valor_contrato: 0,
    forma_pagamento: "",
    data_inicio: "",
    data_termino: "",
    prazo_meses: 0,
    observacoes: "",
    status: "Rascunho"
  });

  const [signatarios, setSignatarios] = useState([
    { nome: "", email: "", cpf: "", tipo: "Contratante" }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contrato) {
      setFormData(contrato);
    } else {
      // Gerar número de contrato automático
      const numeroContrato = `RPA-${Date.now()}`;
      setFormData(prev => ({ ...prev, numero_contrato: numeroContrato }));
    }
  }, [contrato, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (contrato) {
        await base44.entities.ContratoRPA.update(contrato.id, formData);
      } else {
        await base44.entities.ContratoRPA.create(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar contrato");
    }
    setIsSaving(false);
  };

  const addSignatario = () => {
    setSignatarios([...signatarios, { nome: "", email: "", cpf: "", tipo: "Contratante" }]);
  };

  const removeSignatario = (index) => {
    setSignatarios(signatarios.filter((_, i) => i !== index));
  };

  const updateSignatario = (index, field, value) => {
    const updated = [...signatarios];
    updated[index][field] = value;
    setSignatarios(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {contrato ? "Editar Contrato RPA" : "Novo Contrato RPA"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Número do Contrato *</Label>
              <Input
                value={formData.numero_contrato}
                onChange={(e) => setFormData({ ...formData, numero_contrato: e.target.value })}
                className="border-[#E5DCC8]"
                disabled
              />
            </div>
            <div>
              <Label>Tipo de Serviço *</Label>
              <Select
                value={formData.tipo_servico}
                onValueChange={(value) => setFormData({ ...formData, tipo_servico: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultoria">Consultoria</SelectItem>
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dados do Contratante */}
          <div className="bg-[#F5F1E8] p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-[#6B4423]">Dados do Contratante</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.contratante_nome}
                  onChange={(e) => setFormData({ ...formData, contratante_nome: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData.contratante_cpf}
                  onChange={(e) => setFormData({ ...formData, contratante_cpf: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.contratante_email}
                  onChange={(e) => setFormData({ ...formData, contratante_email: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.contratante_telefone}
                  onChange={(e) => setFormData({ ...formData, contratante_telefone: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>
            <div>
              <Label>Endereço Completo</Label>
              <Input
                value={formData.contratante_endereco}
                onChange={(e) => setFormData({ ...formData, contratante_endereco: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          {/* Dados da Contratada */}
          <div className="bg-[#F5F1E8] p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-[#6B4423]">Dados da Contratada</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input
                  value={formData.contratada_nome}
                  onChange={(e) => setFormData({ ...formData, contratada_nome: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={formData.contratada_cnpj}
                  onChange={(e) => setFormData({ ...formData, contratada_cnpj: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>Representante Legal</Label>
                <Input
                  value={formData.contratada_representante}
                  onChange={(e) => setFormData({ ...formData, contratada_representante: e.target.value })}
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>
          </div>

          {/* Serviço e Valores */}
          <div className="space-y-3">
            <div>
              <Label>Descrição do Serviço *</Label>
              <Textarea
                value={formData.descricao_servico}
                onChange={(e) => setFormData({ ...formData, descricao_servico: e.target.value })}
                className="border-[#E5DCC8]"
                rows={4}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Valor do Contrato (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_contrato}
                  onChange={(e) => setFormData({ ...formData, valor_contrato: parseFloat(e.target.value) })}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Input
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                  className="border-[#E5DCC8]"
                  placeholder="Ex: PIX, Boleto, Transferência..."
                />
              </div>
            </div>
          </div>

          {/* Prazo */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
            <div>
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={formData.data_termino}
                onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
            <div>
              <Label>Prazo (meses)</Label>
              <Input
                type="number"
                value={formData.prazo_meses}
                onChange={(e) => setFormData({ ...formData, prazo_meses: parseInt(e.target.value) })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCC8]">
            <Button variant="outline" onClick={onClose} className="border-[#E5DCC8]">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#6B4423] hover:bg-[#5A3A1E]"
            >
              {isSaving ? "Salvando..." : contrato ? "Atualizar" : "Criar Contrato"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}