import React, { useState, useEffect } from "react";
import { ConfiguracaoFrete } from "@/entities/ConfiguracaoFrete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Plus, Trash2 } from "lucide-react";

export default function ConfiguracaoFreteForm({ configuracoes, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    cep_origem: "",
    peso_padrao: "",
    altura_padrao: "",
    largura_padrao: "",
    comprimento_padrao: "",
    valor_declarado_padrao: "",
    ativo: true
  });
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (config) => {
    setFormData(config);
    setEditingId(config.id);
    setIsEditing(true);
  };

  const handleNew = () => {
    setFormData({
      cep_origem: "",
      peso_padrao: "",
      altura_padrao: "",
      largura_padrao: "",
      comprimento_padrao: "",
      valor_declarado_padrao: "",
      ativo: true
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await ConfiguracaoFrete.update(editingId, formData);
      } else {
        // Desativar outras configurações se esta for ativa
        if (formData.ativo) {
          for (const config of configuracoes) {
            if (config.ativo) {
              await ConfiguracaoFrete.update(config.id, { ativo: false });
            }
          }
        }
        await ConfiguracaoFrete.create(formData);
      }
      setIsEditing(false);
      onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta configuração?")) {
      await ConfiguracaoFrete.delete(id);
      onSave();
    }
  };

  const handleToggleAtivo = async (config) => {
    // Desativar todas as outras
    if (!config.ativo) {
      for (const c of configuracoes) {
        if (c.ativo && c.id !== config.id) {
          await ConfiguracaoFrete.update(c.id, { ativo: false });
        }
      }
    }
    
    await ConfiguracaoFrete.update(config.id, { ativo: !config.ativo });
    onSave();
  };

  return (
    <div className="space-y-6">
      {/* Lista de Configurações */}
      {!isEditing && (
        <Card className="border-[#E5DCC8]">
          <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-3">
                <Settings className="w-6 h-6" />
                Configurações Salvas
              </CardTitle>
              <Button
                onClick={handleNew}
                className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Configuração
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {configuracoes.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355]">Nenhuma configuração cadastrada</p>
                <Button
                  onClick={handleNew}
                  variant="outline"
                  className="mt-4 border-[#6B4423] text-[#6B4423]"
                >
                  Criar Primeira Configuração
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {configuracoes.map((config) => (
                  <Card key={config.id} className="border-[#E5DCC8]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-[#6B4423]">
                              CEP: {config.cep_origem}
                            </h4>
                            {config.ativo && (
                              <Badge className="bg-[#2D5016]">Ativa</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[#8B7355]">
                            <p>Peso: {config.peso_padrao} kg</p>
                            <p>Altura: {config.altura_padrao} cm</p>
                            <p>Largura: {config.largura_padrao} cm</p>
                            <p>Comprimento: {config.comprimento_padrao} cm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.ativo}
                            onCheckedChange={() => handleToggleAtivo(config)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulário de Edição */}
      {isEditing && (
        <Card className="border-[#E5DCC8]">
          <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
            <CardTitle className="text-2xl text-[#6B4423]">
              {editingId ? "Editar" : "Nova"} Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cep_origem">CEP de Origem Padrão *</Label>
              <Input
                id="cep_origem"
                value={formData.cep_origem}
                onChange={(e) => setFormData({...formData, cep_origem: e.target.value})}
                placeholder="00000-000"
                required
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso_padrao">Peso Padrão (kg)</Label>
              <Input
                id="peso_padrao"
                type="number"
                step="0.01"
                value={formData.peso_padrao}
                onChange={(e) => setFormData({...formData, peso_padrao: e.target.value})}
                placeholder="0.5"
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="altura_padrao">Altura (cm)</Label>
                <Input
                  id="altura_padrao"
                  type="number"
                  step="0.1"
                  value={formData.altura_padrao}
                  onChange={(e) => setFormData({...formData, altura_padrao: e.target.value})}
                  placeholder="10"
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura_padrao">Largura (cm)</Label>
                <Input
                  id="largura_padrao"
                  type="number"
                  step="0.1"
                  value={formData.largura_padrao}
                  onChange={(e) => setFormData({...formData, largura_padrao: e.target.value})}
                  placeholder="15"
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento_padrao">Comprimento (cm)</Label>
                <Input
                  id="comprimento_padrao"
                  type="number"
                  step="0.1"
                  value={formData.comprimento_padrao}
                  onChange={(e) => setFormData({...formData, comprimento_padrao: e.target.value})}
                  placeholder="20"
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_declarado_padrao">Valor Declarado Padrão (R$)</Label>
              <Input
                id="valor_declarado_padrao"
                type="number"
                step="0.01"
                value={formData.valor_declarado_padrao}
                onChange={(e) => setFormData({...formData, valor_declarado_padrao: e.target.value})}
                placeholder="50.00"
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
              />
              <Label>Configuração Ativa</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-[#E5DCC8]"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}