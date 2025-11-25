import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, DollarSign, Ruler } from "lucide-react";
import { motion } from "framer-motion";

export default function CalculadoraFornecedores() {
  const [tipoFornecedor, setTipoFornecedor] = useState("adesivos");
  
  // Estado para Adesivos (agora em centímetros)
  const [adesivosData, setAdesivosData] = useState({
    altura: 0,
    largura: 0,
    quantidade: 0
  });

  const [resultadoAdesivos, setResultadoAdesivos] = useState({
    valor_unitario: 0,
    valor_total: 0,
    area_m2: 0
  });

  const calcularAdesivos = () => {
    const { altura, largura, quantidade } = adesivosData;
    
    if (altura <= 0 || largura <= 0 || quantidade <= 0) {
      alert("Por favor, preencha todos os campos com valores válidos");
      return;
    }

    // Converter centímetros para metros
    const alturaMetros = altura / 100;
    const larguraMetros = largura / 100;

    // Fórmula: altura (em metros) x largura (em metros) x R$ 55,00 = valor unitário
    const valorUnitario = alturaMetros * larguraMetros * 55;
    
    // Valor total = valor unitário x quantidade
    const valorTotal = valorUnitario * quantidade;
    
    // Área total em m²
    const areaM2 = alturaMetros * larguraMetros * quantidade;

    setResultadoAdesivos({
      valor_unitario: valorUnitario.toFixed(2),
      valor_total: valorTotal.toFixed(2),
      area_m2: areaM2.toFixed(4)
    });
  };

  const limparAdesivos = () => {
    setAdesivosData({
      altura: 0,
      largura: 0,
      quantidade: 0
    });
    setResultadoAdesivos({
      valor_unitario: 0,
      valor_total: 0,
      area_m2: 0
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <Calculator className="w-8 h-8" />
            Calculadora de Fornecedores
          </h1>
          <p className="text-[#8B7355]">
            Calcule custos de materiais de diferentes fornecedores
          </p>
        </div>

        {/* Seleção de Tipo */}
        <Card className="border-[#E5DCC8] shadow-xl mb-6">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="text-xl text-[#6B4423]">
              Tipo de Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={tipoFornecedor} onValueChange={setTipoFornecedor} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-[#F5F1E8]">
                <TabsTrigger value="adesivos" className="gap-2">
                  <Package className="w-4 h-4" />
                  Adesivos
                </TabsTrigger>
                <TabsTrigger value="outros" className="gap-2" disabled>
                  <Package className="w-4 h-4" />
                  Outros (Em breve)
                </TabsTrigger>
                <TabsTrigger value="mais" className="gap-2" disabled>
                  <Package className="w-4 h-4" />
                  Mais (Em breve)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Calculadora de Adesivos */}
        {tipoFornecedor === "adesivos" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda: Inputs */}
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
                  <Ruler className="w-6 h-6" />
                  Dimensões do Adesivo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="altura" className="flex items-center gap-2 text-[#6B4423]">
                    Altura (centímetros) *
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    min="0"
                    step="1"
                    value={adesivosData.altura || ""}
                    onChange={(e) => setAdesivosData({ ...adesivosData, altura: parseFloat(e.target.value) || 0 })}
                    className="border-[#E5DCC8] text-lg"
                    placeholder="Ex: 50"
                  />
                  <p className="text-xs text-[#8B7355]">
                    Altura do adesivo em centímetros
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="largura" className="flex items-center gap-2 text-[#6B4423]">
                    Largura (centímetros) *
                  </Label>
                  <Input
                    id="largura"
                    type="number"
                    min="0"
                    step="1"
                    value={adesivosData.largura || ""}
                    onChange={(e) => setAdesivosData({ ...adesivosData, largura: parseFloat(e.target.value) || 0 })}
                    className="border-[#E5DCC8] text-lg"
                    placeholder="Ex: 120"
                  />
                  <p className="text-xs text-[#8B7355]">
                    Largura do adesivo em centímetros
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade" className="flex items-center gap-2 text-[#6B4423]">
                    Quantidade *
                  </Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    step="1"
                    value={adesivosData.quantidade || ""}
                    onChange={(e) => setAdesivosData({ ...adesivosData, quantidade: parseInt(e.target.value) || 0 })}
                    className="border-[#E5DCC8] text-lg"
                    placeholder="Ex: 10"
                  />
                  <p className="text-xs text-[#8B7355]">
                    Quantos adesivos você precisa
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={limparAdesivos}
                    variant="outline"
                    className="flex-1 border-[#E5DCC8]"
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={calcularAdesivos}
                    className="flex-1 bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular
                  </Button>
                </div>

                {/* Info da Fórmula */}
                <div className="bg-[#F5F1E8] p-4 rounded-lg border-l-4 border-[#C9A961]">
                  <p className="text-sm font-semibold text-[#6B4423] mb-2">
                    📐 Fórmula Utilizada:
                  </p>
                  <div className="text-xs text-[#8B7355] space-y-1 font-mono">
                    <p>1. Converter cm para metros: altura ÷ 100, largura ÷ 100</p>
                    <p>2. Valor Unitário = Altura(m) × Largura(m) × R$ 55,00</p>
                    <p>3. Valor Total = Valor Unitário × Quantidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coluna Direita: Resultados */}
            <div className="space-y-6">
              {/* Card Principal - Valor Total */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-white/80 text-sm uppercase tracking-wide mb-2">
                        Valor Total
                      </p>
                      <p className="text-6xl font-bold mb-2">
                        R$ {resultadoAdesivos.valor_total}
                      </p>
                      <p className="text-white/80 text-lg">
                        Para {adesivosData.quantidade} adesivo(s)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card Valor Unitário */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/10 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#2D5016]/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#2D5016]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#8B7355]">Valor Unitário</p>
                        <p className="text-2xl font-bold text-[#6B4423]">
                          R$ {resultadoAdesivos.valor_unitario}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B7355]">
                      Por adesivo de {adesivosData.altura}cm × {adesivosData.largura}cm
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card Área Total */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/10 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#C9A961]/10 rounded-lg flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-[#8B7355]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#8B7355]">Área Total</p>
                        <p className="text-2xl font-bold text-[#6B4423]">
                          {resultadoAdesivos.area_m2} m²
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B7355]">
                      Total de área dos adesivos
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Detalhamento */}
              <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-[#E5DCC8]">
                  <CardTitle className="text-lg text-[#6B4423] flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Detalhamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                    <span className="text-sm text-[#8B7355]">Altura</span>
                    <Badge variant="outline" className="bg-[#F5F1E8]">
                      {adesivosData.altura} cm ({(adesivosData.altura / 100).toFixed(2)}m)
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                    <span className="text-sm text-[#8B7355]">Largura</span>
                    <Badge variant="outline" className="bg-[#F5F1E8]">
                      {adesivosData.largura} cm ({(adesivosData.largura / 100).toFixed(2)}m)
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                    <span className="text-sm text-[#8B7355]">Área Unitária</span>
                    <Badge variant="outline" className="bg-[#F5F1E8]">
                      {((adesivosData.altura / 100) * (adesivosData.largura / 100)).toFixed(4)} m²
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                    <span className="text-sm text-[#8B7355]">Preço por m²</span>
                    <Badge variant="outline" className="bg-[#F5F1E8]">
                      R$ 55,00
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                    <span className="text-sm text-[#8B7355]">Quantidade</span>
                    <Badge variant="outline" className="bg-[#2D5016]/10 text-[#2D5016]">
                      {adesivosData.quantidade} unidade(s)
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[#8B7355]">Custo por Unidade</span>
                    <Badge variant="outline" className="bg-[#F5F1E8]">
                      R$ {resultadoAdesivos.valor_unitario}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Exemplo */}
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#F5F1E8] to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-[#6B4423] flex items-center gap-2">
                    💡 Exemplo de Cálculo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-[#8B7355] space-y-1 bg-white p-3 rounded border border-[#E5DCC8]">
                    <p className="font-semibold text-[#6B4423]">Adesivo de 50cm × 120cm (10 unidades):</p>
                    <p>• Conversão: 50cm = 0.5m, 120cm = 1.2m</p>
                    <p>• Área unitária = 0.5 × 1.2 = 0.6 m²</p>
                    <p>• Valor unitário = 0.6 × R$ 55 = R$ 33,00</p>
                    <p>• Valor total = R$ 33,00 × 10 = R$ 330,00</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}