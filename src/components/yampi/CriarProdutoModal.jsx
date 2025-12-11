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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function CriarProdutoModal({ open, onClose, onSave, categorias }) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    sku: "",
    preco: 0,
    preco_promocional: 0,
    estoque: 0,
    peso: 0,
    altura: 0,
    largura: 0,
    comprimento: 0,
    categoria_id: "",
    ativo: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setFormData({
        nome: "",
        descricao: "",
        sku: "",
        preco: 0,
        preco_promocional: 0,
        estoque: 0,
        peso: 0,
        altura: 0,
        largura: 0,
        comprimento: 0,
        categoria_id: "",
        ativo: true
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Produto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome do Produto *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.yampi_id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Preço Promocional (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco_promocional}
                onChange={(e) => setFormData({ ...formData, preco_promocional: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Estoque *</Label>
              <Input
                type="number"
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.altura}
                onChange={(e) => setFormData({ ...formData, altura: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Largura (cm)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.largura}
                onChange={(e) => setFormData({ ...formData, largura: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Comprimento (cm)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.comprimento}
                onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label>Produto Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#6B4423]" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Produto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}