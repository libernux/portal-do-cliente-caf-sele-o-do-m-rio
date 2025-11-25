import React, { useState, useEffect } from "react";
import { InfoCafe } from "@/entities/InfoCafe";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export default function InfoCafeFormModal({ open, onClose, infoCafe, cafes, onSave }) {
  const [formData, setFormData] = useState({
    cafe_id: "",
    cafe_nome: "",
    slug: "",
    ativo: true,
    infos_sensoriais: {},
    ingredientes: "",
    metodos_preparo: [""],
    infos_adicionais: {
      modo_conservacao: "",
      embalagens_disponiveis: [],
      registro: ""
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && infoCafe) {
      setFormData({
        ...infoCafe,
        metodos_preparo: infoCafe.metodos_preparo || [""],
        infos_adicionais: {
          modo_conservacao: infoCafe.infos_adicionais?.modo_conservacao || "",
          embalagens_disponiveis: infoCafe.infos_adicionais?.embalagens_disponiveis || [],
          registro: infoCafe.infos_adicionais?.registro || ""
        }
      });
    } else if (open) {
      setFormData({
        cafe_id: "",
        cafe_nome: "",
        slug: "",
        ativo: true,
        infos_sensoriais: {},
        ingredientes: "",
        metodos_preparo: [""],
        infos_adicionais: {
          modo_conservacao: "",
          embalagens_disponiveis: [],
          registro: ""
        }
      });
    }
  }, [open, infoCafe]);

  const handleCafeSelect = (cafeId) => {
    const cafe = cafes.find(c => c.id === cafeId);
    if (cafe) {
      const slug = cafe.nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      setFormData({
        ...formData,
        cafe_id: cafeId,
        cafe_nome: cafe.nome,
        slug
      });
    }
  };

  const handleInfoSensorialChange = (field, value) => {
    setFormData({
      ...formData,
      infos_sensoriais: {
        ...formData.infos_sensoriais,
        [field]: value
      }
    });
  };

  const handleMetodoChange = (index, value) => {
    const newMetodos = [...formData.metodos_preparo];
    newMetodos[index] = value;
    setFormData({ ...formData, metodos_preparo: newMetodos });
  };

  const addMetodo = () => {
    setFormData({ ...formData, metodos_preparo: [...formData.metodos_preparo, ""] });
  };

  const removeMetodo = (index) => {
    const newMetodos = formData.metodos_preparo.filter((_, i) => i !== index);
    setFormData({ ...formData, metodos_preparo: newMetodos });
  };

  const addEmbalagem = () => {
    setFormData({
      ...formData,
      infos_adicionais: {
        ...formData.infos_adicionais,
        embalagens_disponiveis: [
          ...formData.infos_adicionais.embalagens_disponiveis,
          { tamanho: "", imagem_url: "" }
        ]
      }
    });
  };

  const removeEmbalagem = (index) => {
    const newEmbalagens = formData.infos_adicionais.embalagens_disponiveis.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      infos_adicionais: {
        ...formData.infos_adicionais,
        embalagens_disponiveis: newEmbalagens
      }
    });
  };

  const handleEmbalagemChange = (index, field, value) => {
    const newEmbalagens = [...formData.infos_adicionais.embalagens_disponiveis];
    newEmbalagens[index] = { ...newEmbalagens[index], [field]: value };
    setFormData({
      ...formData,
      infos_adicionais: {
        ...formData.infos_adicionais,
        embalagens_disponiveis: newEmbalagens
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cafe_nome || !formData.slug) {
      alert("Selecione um café");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        metodos_preparo: formData.metodos_preparo.filter(m => m.trim() !== "")
      };

      if (infoCafe) {
        await InfoCafe.update(infoCafe.id, dataToSave);
      } else {
        await InfoCafe.create(dataToSave);
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar informações. Tente novamente.");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423]">
            {infoCafe ? "Editar" : "Adicionar"} Informações do Café
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção do Café */}
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Café *</Label>
                  <Select value={formData.cafe_id} onValueChange={handleCafeSelect}>
                    <SelectTrigger className="border-[#E5DCC8]">
                      <SelectValue placeholder="Selecione o café" />
                    </SelectTrigger>
                    <SelectContent>
                      {cafes.map(cafe => (
                        <SelectItem key={cafe.id} value={cafe.id}>
                          {cafe.nome} ({cafe.forma})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL) *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="nome-do-cafe"
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abas de Informações */}
          <Tabs defaultValue="sensoriais" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sensoriais">Sensoriais</TabsTrigger>
              <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
              <TabsTrigger value="preparo">Preparo</TabsTrigger>
              <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
            </TabsList>

            {/* Infos Sensoriais */}
            <TabsContent value="sensoriais" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "origem", label: "Origem" },
                  { key: "tipo_grao", label: "Tipo do Grão" },
                  { key: "variedade", label: "Variedade" },
                  { key: "processamento", label: "Processamento" },
                  { key: "bebida", label: "Bebida" },
                  { key: "sabor", label: "Sabor" },
                  { key: "docura", label: "Doçura" },
                  { key: "aroma", label: "Aroma" },
                  { key: "acidez", label: "Acidez" },
                  { key: "corpo", label: "Corpo" },
                  { key: "torra", label: "Torra" },
                  { key: "moagem", label: "Moagem" },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      value={formData.infos_sensoriais[field.key] || ""}
                      onChange={(e) => handleInfoSensorialChange(field.key, e.target.value)}
                      className="border-[#E5DCC8]"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Escala de Intensidade (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.infos_sensoriais.escala_intensidade || ""}
                    onChange={(e) => handleInfoSensorialChange("escala_intensidade", e.target.value)}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Ingredientes */}
            <TabsContent value="ingredientes" className="space-y-4">
              <div className="space-y-2">
                <Label>Ingredientes</Label>
                <Textarea
                  value={formData.ingredientes}
                  onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                  rows={6}
                  className="border-[#E5DCC8]"
                  placeholder="Liste os ingredientes..."
                />
              </div>
            </TabsContent>

            {/* Métodos de Preparo */}
            <TabsContent value="preparo" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Métodos de Preparo (Passos)</Label>
                  <Button type="button" onClick={addMetodo} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Passo
                  </Button>
                </div>
                {formData.metodos_preparo.map((metodo, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-bold text-[#6B4423] mt-2">{index + 1}.</span>
                    <Textarea
                      value={metodo}
                      onChange={(e) => handleMetodoChange(index, e.target.value)}
                      rows={2}
                      className="flex-1 border-[#E5DCC8]"
                      placeholder={`Passo ${index + 1}`}
                    />
                    {formData.metodos_preparo.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMetodo(index)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Infos Adicionais */}
            <TabsContent value="adicionais" className="space-y-4">
              <div className="space-y-2">
                <Label>Modo de Conservação / Armazenamento</Label>
                <Textarea
                  value={formData.infos_adicionais.modo_conservacao}
                  onChange={(e) => setFormData({
                    ...formData,
                    infos_adicionais: { ...formData.infos_adicionais, modo_conservacao: e.target.value }
                  })}
                  rows={3}
                  className="border-[#E5DCC8]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Embalagens Disponíveis</Label>
                  <Button type="button" onClick={addEmbalagem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Embalagem
                  </Button>
                </div>
                {formData.infos_adicionais.embalagens_disponiveis.map((emb, index) => (
                  <Card key={index} className="border-[#E5DCC8]">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#6B4423]">Embalagem {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEmbalagem(index)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Tamanho (ex: 250G)"
                          value={emb.tamanho || ""}
                          onChange={(e) => handleEmbalagemChange(index, "tamanho", e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <Input
                          placeholder="URL da imagem"
                          value={emb.imagem_url || ""}
                          onChange={(e) => handleEmbalagemChange(index, "imagem_url", e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <Input
                          placeholder="Peso bruto"
                          value={emb.peso_bruto || ""}
                          onChange={(e) => handleEmbalagemChange(index, "peso_bruto", e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <Input
                          placeholder="Dimensões"
                          value={emb.dimensoes_embalagem || ""}
                          onChange={(e) => handleEmbalagemChange(index, "dimensoes_embalagem", e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                        <Input
                          placeholder="Materiais"
                          value={emb.materiais || ""}
                          onChange={(e) => handleEmbalagemChange(index, "materiais", e.target.value)}
                          className="border-[#E5DCC8]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Registro</Label>
                <Textarea
                  value={formData.infos_adicionais.registro}
                  onChange={(e) => setFormData({
                    ...formData,
                    infos_adicionais: { ...formData.infos_adicionais, registro: e.target.value }
                  })}
                  rows={2}
                  className="border-[#E5DCC8]"
                  placeholder="Resolução RDC nº 240/2018..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#6B4423] hover:bg-[#5A3A1E]" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}