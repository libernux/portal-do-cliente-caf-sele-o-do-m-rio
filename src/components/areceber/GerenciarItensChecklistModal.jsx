import React, { useState, useEffect } from "react";
import { ItemChecklist } from "@/entities/ItemChecklist";
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
import { Plus, Trash2, GripVertical, Save, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function GerenciarItensChecklistModal({ open, onClose, itensChecklist }) {
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({ nome: "", descricao: "", cor: "#6B4423" });
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadItens();
    }
  }, [open]);

  const loadItens = async () => {
    const itensData = await ItemChecklist.list("ordem");
    setItens(itensData.filter(i => i.ativo));
  };

  const handleAdicionarItem = async () => {
    if (!novoItem.nome.trim()) {
      alert("Digite o nome do item");
      return;
    }

    setIsAdding(true);
    try {
      const novaOrdem = itens.length > 0 ? Math.max(...itens.map(i => i.ordem || 0)) + 1 : 1;

      await ItemChecklist.create({
        nome: novoItem.nome,
        descricao: novoItem.descricao,
        ordem: novaOrdem,
        cor: novoItem.cor,
        ativo: true
      });

      setNovoItem({ nome: "", descricao: "", cor: "#6B4423" });
      await loadItens();
      alert("Item adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao adicionar item. Tente novamente.");
    }
    setIsAdding(false);
  };

  const handleRemoverItem = async (itemId) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      try {
        await ItemChecklist.delete(itemId);
        await loadItens();
        alert("Item removido com sucesso!");
      } catch (error) {
        console.error("Erro ao remover item:", error);
        alert("Erro ao remover item. Tente novamente.");
      }
    }
  };

  const handleAtualizarOrdem = async () => {
    setIsSaving(true);
    try {
      for (let i = 0; i < itens.length; i++) {
        await ItemChecklist.update(itens[i].id, { ...itens[i], ordem: i + 1 });
      }
      alert("Ordem atualizada com sucesso!");
      await loadItens();
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      alert("Erro ao atualizar ordem. Tente novamente.");
    }
    setIsSaving(false);
  };

  const moverItem = (index, direction) => {
    const newItens = [...itens];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItens.length) return;
    
    [newItens[index], newItens[targetIndex]] = [newItens[targetIndex], newItens[index]];
    setItens(newItens);
  };

  const handleFechar = () => {
    loadItens();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Gerenciar Itens do Checklist
          </DialogTitle>
          <p className="text-sm text-[#8B7355]">
            Os itens adicionados aparecerão automaticamente em todas as reservas
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar Novo Item */}
          <Card className="border-[#E5DCC8] bg-[#F5F1E8]">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-[#6B4423]">Adicionar Novo Item</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Item *</Label>
                <Input
                  id="nome"
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                  placeholder="Ex: NF Gerada, Boleto Enviado, Produto Separado"
                  className="border-[#E5DCC8] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={novoItem.descricao}
                  onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                  placeholder="Detalhes sobre este item"
                  className="border-[#E5DCC8] bg-white"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor do Badge</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={novoItem.cor}
                    onChange={(e) => setNovoItem({ ...novoItem, cor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={novoItem.cor}
                    onChange={(e) => setNovoItem({ ...novoItem, cor: e.target.value })}
                    placeholder="#6B4423"
                    className="flex-1 border-[#E5DCC8] bg-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleAdicionarItem}
                disabled={isAdding}
                className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                {isAdding ? (
                  <>Adicionando...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#6B4423]">
                Itens Existentes ({itens.length})
              </h3>
              {itens.length > 0 && (
                <Button
                  onClick={handleAtualizarOrdem}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                  className="border-[#2D5016] text-[#2D5016]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar Ordem"}
                </Button>
              )}
            </div>

            {itens.length === 0 ? (
              <div className="text-center py-8 text-[#8B7355] bg-[#F5F1E8] rounded-lg">
                <p>Nenhum item cadastrado</p>
                <p className="text-sm">Adicione o primeiro item acima</p>
              </div>
            ) : (
              <div className="space-y-2">
                {itens.map((item, index) => (
                  <Card key={item.id} className="border-[#E5DCC8]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moverItem(index, "up")}
                            disabled={index === 0}
                            className="h-6 w-6"
                          >
                            <GripVertical className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moverItem(index, "down")}
                            disabled={index === itens.length - 1}
                            className="h-6 w-6"
                          >
                            <GripVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.cor }}
                        />

                        <div className="flex-1">
                          <p className="font-semibold text-[#6B4423]">{item.nome}</p>
                          {item.descricao && (
                            <p className="text-xs text-[#8B7355]">{item.descricao}</p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoverItem(item.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleFechar}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}