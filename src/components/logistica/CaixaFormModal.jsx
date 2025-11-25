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
import { Switch } from "@/components/ui/switch";

export default function CaixaFormModal({ open, onClose, onSave, caixa }) {
  const [formData, setFormData] = useState({
    numero_identificacao: "",
    origem: "Venda Nova",
    destino: "Vila Velha",
    status: "Aguardando Envio",
    responsavel: "",
    tem_etiqueta: false,
    codigo_etiqueta: "",
    meio_transporte: "Transportadora",
    codigo_rastreamento: "",
    conteudo: "",
    data_envio: "",
    data_entrega_prevista: "",
    observacoes: "",
  });

  useEffect(() => {
    if (caixa) {
      setFormData(caixa);
    } else {
      setFormData({
        numero_identificacao: "",
        origem: "Venda Nova",
        destino: "Vila Velha",
        status: "Aguardando Envio",
        responsavel: "",
        tem_etiqueta: false,
        codigo_etiqueta: "",
        meio_transporte: "Transportadora",
        codigo_rastreamento: "",
        conteudo: "",
        data_envio: "",
        data_entrega_prevista: "",
        observacoes: "",
      });
    }
  }, [caixa, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {caixa ? "Editar Caixa" : "Nova Caixa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Identificação *</Label>
              <Input
                id="numero"
                value={formData.numero_identificacao}
                onChange={(e) => setFormData({ ...formData, numero_identificacao: e.target.value })}
                required
                className="border-[#E5DCC8]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Select
                value={formData.origem}
                onValueChange={(value) => setFormData({ ...formData, origem: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venda Nova">Venda Nova</SelectItem>
                  <SelectItem value="Vila Velha">Vila Velha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Select
                value={formData.destino}
                onValueChange={(value) => setFormData({ ...formData, destino: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venda Nova">Venda Nova</SelectItem>
                  <SelectItem value="Vila Velha">Vila Velha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                  <SelectItem value="Aguardando Envio">Aguardando Envio</SelectItem>
                  <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                  <SelectItem value="Problema">Problema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transporte">Meio de Transporte</Label>
              <Select
                value={formData.meio_transporte}
                onValueChange={(value) => setFormData({ ...formData, meio_transporte: value })}
              >
                <SelectTrigger className="border-[#E5DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transportadora">Transportadora</SelectItem>
                  <SelectItem value="Correios">Correios</SelectItem>
                  <SelectItem value="Entrega Direta">Entrega Direta</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#F5F1E8] p-3 rounded-lg">
            <Switch
              id="etiqueta"
              checked={formData.tem_etiqueta}
              onCheckedChange={(checked) => setFormData({ ...formData, tem_etiqueta: checked })}
            />
            <Label htmlFor="etiqueta" className="cursor-pointer">
              Possui etiqueta
            </Label>
          </div>

          {formData.tem_etiqueta && (
            <div className="space-y-2">
              <Label htmlFor="codigo_etiqueta">Código da Etiqueta</Label>
              <Input
                id="codigo_etiqueta"
                value={formData.codigo_etiqueta}
                onChange={(e) => setFormData({ ...formData, codigo_etiqueta: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Código de barras ou QR code"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="codigo_rastreamento">Código de Rastreamento (opcional)</Label>
            <Input
              id="codigo_rastreamento"
              value={formData.codigo_rastreamento}
              onChange={(e) => setFormData({ ...formData, codigo_rastreamento: e.target.value })}
              className="border-[#E5DCC8]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              className="border-[#E5DCC8]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_envio">Data de Envio</Label>
              <Input
                id="data_envio"
                type="date"
                value={formData.data_envio}
                onChange={(e) => setFormData({ ...formData, data_envio: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_entrega">Previsão de Entrega</Label>
              <Input
                id="data_entrega"
                type="date"
                value={formData.data_entrega_prevista}
                onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border-[#E5DCC8]"
              rows={2}
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
              {caixa ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}