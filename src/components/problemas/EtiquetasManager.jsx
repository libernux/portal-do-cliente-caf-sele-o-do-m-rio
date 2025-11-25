import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EtiquetaProblema } from "@/entities/EtiquetaProblema";
import { Plus, Trash2, Tag } from "lucide-react";

const coresPredefinidas = [
  "#D97706", "#EA580C", "#DC2626", "#C026D3", "#7C3AED",
  "#2563EB", "#0891B2", "#059669", "#65A30D", "#CA8A04"
];

export default function EtiquetasManager({ open, onClose }) {
  const [etiquetas, setEtiquetas] = useState([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState({
    nome: "",
    cor: coresPredefinidas[0],
    descricao: ""
  });

  useEffect(() => {
    if (open) {
      loadEtiquetas();
    }
  }, [open]);

  const loadEtiquetas = async () => {
    const data = await EtiquetaProblema.list();
    setEtiquetas(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await EtiquetaProblema.create(novaEtiqueta);
    setNovaEtiqueta({ nome: "", cor: coresPredefinidas[0], descricao: "" });
    loadEtiquetas();
  };

  const handleDelete = async (id) => {
    if (confirm("Deseja excluir esta etiqueta?")) {
      await EtiquetaProblema.delete(id);
      loadEtiquetas();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Gerenciar Etiquetas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar nova etiqueta */}
          <form onSubmit={handleCreate} className="bg-[#F5F1E8] p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-[#6B4423]">Nova Etiqueta</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={novaEtiqueta.nome}
                onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, nome: e.target.value })}
                required
                className="border-[#E5DCC8]"
                placeholder="Ex: Atendimento VIP"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor *</Label>
              <div className="flex gap-2 flex-wrap">
                {coresPredefinidas.map(cor => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovaEtiqueta({ ...novaEtiqueta, cor })}
                    className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${
                      novaEtiqueta.cor === cor ? 'ring-2 ring-[#6B4423] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={novaEtiqueta.descricao}
                onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, descricao: e.target.value })}
                className="border-[#E5DCC8]"
                placeholder="Descrição opcional"
              />
            </div>

            <Button type="submit" className="bg-[#6B4423] hover:bg-[#5A3A1E] w-full">
              <Plus className="w-4 h-4 mr-2" />
              Criar Etiqueta
            </Button>
          </form>

          {/* Lista de etiquetas existentes */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#6B4423]">Etiquetas Existentes</h3>
            {etiquetas.length === 0 ? (
              <p className="text-[#8B7355] text-center py-8">
                Nenhuma etiqueta criada ainda
              </p>
            ) : (
              <div className="space-y-2">
                {etiquetas.map(etiqueta => (
                  <div
                    key={etiqueta.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5DCC8] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-6 h-6 rounded-md"
                        style={{ backgroundColor: etiqueta.cor }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#6B4423]">{etiqueta.nome}</p>
                        {etiqueta.descricao && (
                          <p className="text-sm text-[#8B7355]">{etiqueta.descricao}</p>
                        )}
                      </div>
                      <Badge
                        style={{
                          backgroundColor: `${etiqueta.cor}15`,
                          color: etiqueta.cor,
                          borderColor: `${etiqueta.cor}30`
                        }}
                        variant="outline"
                        className="border"
                      >
                        {etiqueta.nome}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(etiqueta.id)}
                      className="hover:bg-red-50 ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}