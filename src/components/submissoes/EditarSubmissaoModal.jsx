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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save } from "lucide-react";

export default function EditarSubmissaoModal({ open, onClose, submissao, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (submissao) {
      setFormData(submissao);
    }
  }, [submissao]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            Editar Submissão
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#6B4423] text-lg">Informações Básicas</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Café *</Label>
                  <Input
                    value={formData.nome_cafe || ""}
                    onChange={(e) => setFormData({...formData, nome_cafe: e.target.value})}
                    required
                    className="border-[#E5DCC8]"
                  />
                </div>
                
                <div>
                  <Label>Origem</Label>
                  <Input
                    value={formData.origem || ""}
                    onChange={(e) => setFormData({...formData, origem: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Tipo do Grão</Label>
                  <Input
                    value={formData.tipo_grao || ""}
                    onChange={(e) => setFormData({...formData, tipo_grao: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Variedade</Label>
                  <Input
                    value={formData.variedade || ""}
                    onChange={(e) => setFormData({...formData, variedade: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Processamento</Label>
                  <Input
                    value={formData.processamento || ""}
                    onChange={(e) => setFormData({...formData, processamento: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Altitude</Label>
                  <Input
                    value={formData.altitude || ""}
                    onChange={(e) => setFormData({...formData, altitude: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>

              <div>
                <Label>Bebida</Label>
                <Input
                  value={formData.bebida || ""}
                  onChange={(e) => setFormData({...formData, bebida: e.target.value})}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div>
                <Label>Certificações</Label>
                <Input
                  value={formData.certificacoes || ""}
                  onChange={(e) => setFormData({...formData, certificacoes: e.target.value})}
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>

            {/* Características Sensoriais */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#6B4423] text-lg">Características Sensoriais</h3>
              
              <div>
                <Label>Sabor / Notas Sensoriais</Label>
                <Textarea
                  value={formData.sabor_notas_sensoriais || ""}
                  onChange={(e) => setFormData({...formData, sabor_notas_sensoriais: e.target.value})}
                  rows={3}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Doçura</Label>
                  <Input
                    value={formData.docura || ""}
                    onChange={(e) => setFormData({...formData, docura: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Aroma</Label>
                  <Input
                    value={formData.aroma || ""}
                    onChange={(e) => setFormData({...formData, aroma: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Corpo</Label>
                  <Input
                    value={formData.corpo || ""}
                    onChange={(e) => setFormData({...formData, corpo: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Acidez (Tipo)</Label>
                  <Input
                    value={formData.acidez_tipo || ""}
                    onChange={(e) => setFormData({...formData, acidez_tipo: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Acidez (Intensidade)</Label>
                  <Input
                    value={formData.acidez_intensidade || ""}
                    onChange={(e) => setFormData({...formData, acidez_intensidade: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>
            </div>

            {/* Preparo e Características */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#6B4423] text-lg">Preparo e Características</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Torra</Label>
                  <Input
                    value={formData.torra || ""}
                    onChange={(e) => setFormData({...formData, torra: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Moagem</Label>
                  <Input
                    value={formData.moagem || ""}
                    onChange={(e) => setFormData({...formData, moagem: e.target.value})}
                    className="border-[#E5DCC8]"
                  />
                </div>

                <div>
                  <Label>Intensidade (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.escala_intensidade || ""}
                    onChange={(e) => setFormData({...formData, escala_intensidade: parseFloat(e.target.value)})}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>

              <div>
                <Label>Pontuação (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.pontuacao || ""}
                  onChange={(e) => setFormData({...formData, pontuacao: parseFloat(e.target.value)})}
                  className="border-[#E5DCC8]"
                  placeholder="Ex: 85.5"
                />
              </div>

              <div>
                <Label>Modo de Conservação</Label>
                <Textarea
                  value={formData.modo_conservacao || ""}
                  onChange={(e) => setFormData({...formData, modo_conservacao: e.target.value})}
                  rows={2}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div>
                <Label>Métodos de Preparo</Label>
                <Textarea
                  value={formData.metodos_preparo || ""}
                  onChange={(e) => setFormData({...formData, metodos_preparo: e.target.value})}
                  rows={3}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div>
                <Label>Notas de Degustação</Label>
                <Textarea
                  value={formData.notas_degustacao || ""}
                  onChange={(e) => setFormData({...formData, notas_degustacao: e.target.value})}
                  rows={3}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  rows={3}
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-[#6B4423]">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}