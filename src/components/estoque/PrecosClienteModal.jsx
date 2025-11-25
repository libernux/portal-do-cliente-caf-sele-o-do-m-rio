import React, { useState, useEffect } from "react";
import { PrecoCafe } from "@/entities/PrecoCafe";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Coffee, Plus, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function PrecosClienteModal({ open, onClose, cliente, cafes, onUpdate }) {
  const [precos, setPrecos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && cliente) {
      loadPrecos();
    }
  }, [open, cliente]);

  const loadPrecos = async () => {
    setIsLoading(true);
    try {
      const precosData = await PrecoCafe.filter({ cliente_id: cliente.id, ativo: true });
      
      // Criar um mapa de preços existentes
      const precosMap = {};
      precosData.forEach(p => {
        precosMap[p.cafe_id] = p;
      });

      // Criar array com todos os cafés, preenchendo com preços existentes ou vazios
      const precosCompletos = cafes.map(cafe => ({
        id: precosMap[cafe.id]?.id || null,
        cafe_id: cafe.id,
        cafe_nome: cafe.nome,
        cafe_forma: cafe.forma,
        preco_por_pacote: precosMap[cafe.id]?.preco_por_pacote || 0,
        isExisting: !!precosMap[cafe.id]
      }));

      setPrecos(precosCompletos);
    } catch (error) {
      console.error("Erro ao carregar preços:", error);
    }
    setIsLoading(false);
  };

  const handlePrecoChange = (index, valor) => {
    const newPrecos = [...precos];
    newPrecos[index].preco_por_pacote = parseFloat(valor) || 0;
    setPrecos(newPrecos);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const preco of precos) {
        if (preco.preco_por_pacote > 0) {
          if (preco.isExisting && preco.id) {
            // Atualizar existente
            await PrecoCafe.update(preco.id, {
              preco_por_pacote: preco.preco_por_pacote,
              ativo: true
            });
          } else {
            // Criar novo
            await PrecoCafe.create({
              cliente_id: cliente.id,
              cliente_nome: cliente.nome,
              cafe_id: preco.cafe_id,
              cafe_nome: preco.cafe_nome,
              preco_por_pacote: preco.preco_por_pacote,
              ativo: true
            });
          }
        } else if (preco.isExisting && preco.id) {
          // Se zerou o preço, desativar
          await PrecoCafe.update(preco.id, { ativo: false });
        }
      }

      alert("Preços salvos com sucesso!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar preços:", error);
      alert("Erro ao salvar preços");
    }
    setIsSaving(false);
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Preços para {cliente.nome}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#F5F1E8] p-4 rounded-lg">
              <p className="text-sm text-[#6B4423]">
                <strong>📝 Instruções:</strong> Defina o preço por pacote de 250g para cada café. 
                Deixe em R$ 0,00 se não quiser definir preço para aquele café.
              </p>
            </div>

            <div className="grid gap-3">
              {precos.map((preco, index) => (
                <motion.div
                  key={preco.cafe_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="border-[#E5DCC8]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#2D5016] to-[#3D6B1F] rounded-lg flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#6B4423]">{preco.cafe_nome}</p>
                            <Badge variant="outline" className="text-xs">
                              {preco.cafe_forma}
                            </Badge>
                          </div>
                        </div>

                        <div className="w-40">
                          <Label className="text-xs text-[#8B7355] mb-1 block">
                            Preço/Pacote (250g)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355]">
                              R$
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={preco.preco_por_pacote || ""}
                              onChange={(e) => handlePrecoChange(index, e.target.value)}
                              className="pl-10 border-[#E5DCC8]"
                              placeholder="0,00"
                            />
                          </div>
                        </div>

                        {preco.preco_por_pacote > 0 && (
                          <div className="text-right min-w-[100px]">
                            <p className="text-xs text-[#8B7355]">por KG:</p>
                            <p className="text-lg font-bold text-[#2D5016]">
                              R$ {(preco.preco_por_pacote * 4).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {precos.filter(p => p.preco_por_pacote > 0).length > 0 && (
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B4423] font-semibold">
                      Cafés com preço definido:
                    </span>
                    <Badge className="bg-[#2D5016] text-white">
                      {precos.filter(p => p.preco_por_pacote > 0).length} de {precos.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#2D5016] hover:bg-[#1F3810]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preços
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}