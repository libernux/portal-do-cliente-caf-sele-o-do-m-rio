import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, MapPin, Ruler, Weight } from "lucide-react";

export default function CotacaoForm({ configAtiva, onCotar, isLoading }) {
  const [formData, setFormData] = useState({
    cep_origem: "",
    cep_destino: "",
    peso: "",
    altura: "",
    largura: "",
    comprimento: "",
    valor_declarado: ""
  });

  // Preencher com dados da configuração ativa
  useEffect(() => {
    if (configAtiva) {
      setFormData(prev => ({
        ...prev,
        cep_origem: configAtiva.cep_origem || "",
        peso: configAtiva.peso_padrao || "",
        altura: configAtiva.altura_padrao || "",
        largura: configAtiva.largura_padrao || "",
        comprimento: configAtiva.comprimento_padrao || "",
        valor_declarado: configAtiva.valor_declarado_padrao || ""
      }));
    }
  }, [configAtiva]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCotar(formData);
  };

  const handleCepBlur = (field) => {
    // Formatar CEP automaticamente
    const cep = formData[field].replace(/\D/g, '');
    if (cep.length === 8) {
      setFormData(prev => ({
        ...prev,
        [field]: cep.replace(/(\d{5})(\d{3})/, '$1-$2')
      }));
    }
  };

  return (
    <Card className="border-[#E5DCC8]">
      <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/5 to-white">
        <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-3">
          <Package className="w-6 h-6" />
          Dados para Cotação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CEPs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep_origem" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B4423]" />
                CEP de Origem *
              </Label>
              <Input
                id="cep_origem"
                value={formData.cep_origem}
                onChange={(e) => setFormData({...formData, cep_origem: e.target.value})}
                onBlur={() => handleCepBlur('cep_origem')}
                placeholder="00000-000"
                required
                className="border-[#E5DCC8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep_destino" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B4423]" />
                CEP de Destino *
              </Label>
              <Input
                id="cep_destino"
                value={formData.cep_destino}
                onChange={(e) => setFormData({...formData, cep_destino: e.target.value})}
                onBlur={() => handleCepBlur('cep_destino')}
                placeholder="00000-000"
                required
                className="border-[#E5DCC8]"
              />
            </div>
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="peso" className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-[#6B4423]" />
              Peso (kg) *
            </Label>
            <Input
              id="peso"
              type="number"
              step="0.01"
              value={formData.peso}
              onChange={(e) => setFormData({...formData, peso: e.target.value})}
              placeholder="0.5"
              required
              className="border-[#E5DCC8]"
            />
          </div>

          {/* Dimensões */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-[#6B4423]" />
              Dimensões (cm) *
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="altura" className="text-xs text-[#8B7355]">Altura</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  value={formData.altura}
                  onChange={(e) => setFormData({...formData, altura: e.target.value})}
                  placeholder="10"
                  required
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura" className="text-xs text-[#8B7355]">Largura</Label>
                <Input
                  id="largura"
                  type="number"
                  step="0.1"
                  value={formData.largura}
                  onChange={(e) => setFormData({...formData, largura: e.target.value})}
                  placeholder="15"
                  required
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento" className="text-xs text-[#8B7355]">Comprimento</Label>
                <Input
                  id="comprimento"
                  type="number"
                  step="0.1"
                  value={formData.comprimento}
                  onChange={(e) => setFormData({...formData, comprimento: e.target.value})}
                  placeholder="20"
                  required
                  className="border-[#E5DCC8]"
                />
              </div>
            </div>
          </div>

          {/* Valor Declarado */}
          <div className="space-y-2">
            <Label htmlFor="valor_declarado">Valor Declarado (R$)</Label>
            <Input
              id="valor_declarado"
              type="number"
              step="0.01"
              value={formData.valor_declarado}
              onChange={(e) => setFormData({...formData, valor_declarado: e.target.value})}
              placeholder="50.00"
              className="border-[#E5DCC8]"
            />
            <p className="text-xs text-[#A69483]">
              Opcional - usado para seguro da encomenda
            </p>
          </div>

          {/* Botão */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6B4423] hover:bg-[#5A3A1E] text-white"
          >
            {isLoading ? "Consultando..." : "Consultar Fretes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}