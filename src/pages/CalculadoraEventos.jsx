
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Users, Calendar, Clock, TrendingUp, Package, AlertCircle, Percent } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function CalculadoraEventos() {
  const [tipoCalculo, setTipoCalculo] = useState("Evento");
  
  const [formData, setFormData] = useState({
    data_evento: "",
    local_evento: "",
    observacoes: ""
  });

  // Dados da calculadora para EVENTOS
  const [calcDataEvento, setCalcDataEvento] = useState({
    pessoas_por_dia: 100,
    dias_evento: 1,
    taxa_adesao: 60,
    horas_por_dia: 8,
    ml_por_copo: 70,
    fator_perdas: 10
  });

  // Dados da calculadora para USO INTERNO
  const [calcDataInterno, setCalcDataInterno] = useState({
    quantidade_funcionarios: 10,
    dias_uso: 30,
    xicaras_por_dia: 3,
    tamanho_xicara: 100,
    fator_perdas: 10
  });

  const [resultados, setResultados] = useState({
    publico_total: 0,
    consumidores_esperados: 0,
    kg_total: 0,
    pacotes_250g: 0, // Keep this for the main display, new selector will handle others
    kg_por_dia: 0,
    kg_por_hora: 0
  });

  const [embalagemSelecionada, setEmbalagemSelecionada] = useState("250g");

  useEffect(() => {
    if (tipoCalculo === "Evento") {
      calcularEvento();
    } else {
      calcularInterno();
    }
  }, [calcDataEvento, calcDataInterno, tipoCalculo]);

  const calcularEvento = () => {
    const { pessoas_por_dia, dias_evento, taxa_adesao, horas_por_dia, ml_por_copo, fator_perdas } = calcDataEvento;

    const publico_total = pessoas_por_dia * dias_evento;
    const consumidores_esperados = Math.round(publico_total * (taxa_adesao / 100));
    const gramas_por_copo = ml_por_copo / 10;
    const gramas_totais = consumidores_esperados * gramas_por_copo * (1 + fator_perdas / 100);
    const kg_total = gramas_totais / 1000;
    const kg_por_dia = kg_total / dias_evento;
    const kg_por_hora = kg_por_dia / horas_por_dia;
    const pacotes_250g = Math.ceil(kg_total / 0.25);

    setResultados({
      publico_total,
      consumidores_esperados,
      kg_total: parseFloat(kg_total.toFixed(2)),
      pacotes_250g,
      kg_por_dia: parseFloat(kg_por_dia.toFixed(2)),
      kg_por_hora: parseFloat(kg_por_hora.toFixed(3))
    });
  };

  const calcularInterno = () => {
    const { quantidade_funcionarios, dias_uso, xicaras_por_dia, tamanho_xicara, fator_perdas } = calcDataInterno;

    const ml_diarios_por_funcionario = xicaras_por_dia * tamanho_xicara;
    const ml_totais = quantidade_funcionarios * dias_uso * ml_diarios_por_funcionario;
    const gramas_totais = (ml_totais / 10) * (1 + fator_perdas / 100);
    const kg_total = gramas_totais / 1000;
    const kg_por_dia = kg_total / dias_uso;
    const pacotes_250g = Math.ceil(kg_total / 0.25);

    setResultados({
      publico_total: quantidade_funcionarios * dias_uso,
      consumidores_esperados: quantidade_funcionarios,
      kg_total: parseFloat(kg_total.toFixed(2)),
      pacotes_250g,
      kg_por_dia: parseFloat(kg_por_dia.toFixed(2)),
      kg_por_hora: 0
    });
  };

  const handleCalcChangeEvento = (field, value) => {
    setCalcDataEvento(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleCalcChangeInterno = (field, value) => {
    setCalcDataInterno(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const calcularPacotesPorEmbalagem = () => {
    const { kg_total } = resultados;
    
    const pesoEmbalagens = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };

    const resultadosPorEmbalagem = {};
    Object.keys(pesoEmbalagens).forEach(embalagem => {
      resultadosPorEmbalagem[embalagem] = Math.ceil(kg_total / pesoEmbalagens[embalagem]);
    });

    return resultadosPorEmbalagem;
  };

  const pacotesPorEmbalagem = calcularPacotesPorEmbalagem();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <Coffee className="w-8 h-8" />
            Calculadora de Café para Eventos
          </h1>
          <p className="text-[#8B7355]">
            Calcule a quantidade exata de café necessária para seu evento
          </p>
        </div>

        {/* Seleção de Tipo */}
        <Card className="border-[#E5DCC8] shadow-xl mb-6">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="text-xl text-[#6B4423]">
              Tipo de Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={tipoCalculo} onValueChange={setTipoCalculo} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#F5F1E8]">
                <TabsTrigger value="Evento" className="gap-2">
                  <Users className="w-4 h-4" />
                  Evento
                </TabsTrigger>
                <TabsTrigger value="Interno" className="gap-2">
                  <Package className="w-4 h-4" />
                  Uso Interno/Empresa
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-[#8B7355] mt-3">
              {tipoCalculo === "Evento" 
                ? "Para feiras, congressos, degustações e eventos em geral"
                : "Para consumo diário na empresa, escritório ou estabelecimento"}
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda: Inputs */}
          <Card className="border-[#E5DCC8] shadow-xl">
            <CardHeader className="border-b border-[#E5DCC8]">
              <CardTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
                <Users className="w-6 h-6" />
                Parâmetros do Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {tipoCalculo === "Evento" ? (
                <>
                  {/* Calculadora de Evento */}
                  <div className="space-y-2">
                    <Label htmlFor="pessoas_dia" className="flex items-center gap-2 text-[#6B4423]">
                      <Users className="w-4 h-4" />
                      Expectativa de Pessoas por Dia *
                    </Label>
                    <Input
                      id="pessoas_dia"
                      type="number"
                      min="1"
                      value={calcDataEvento.pessoas_por_dia}
                      onChange={(e) => handleCalcChangeEvento('pessoas_por_dia', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">Quantas pessoas devem passar pelo estande por dia</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dias" className="flex items-center gap-2 text-[#6B4423]">
                      <Calendar className="w-4 h-4" />
                      Quantidade de Dias *
                    </Label>
                    <Input
                      id="dias"
                      type="number"
                      min="1"
                      value={calcDataEvento.dias_evento}
                      onChange={(e) => handleCalcChangeEvento('dias_evento', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxa" className="flex items-center gap-2 text-[#6B4423]">
                      <Percent className="w-4 h-4" />
                      Taxa de Adesão (%)
                    </Label>
                    <Input
                      id="taxa"
                      type="number"
                      min="1"
                      max="100"
                      value={calcDataEvento.taxa_adesao}
                      onChange={(e) => handleCalcChangeEvento('taxa_adesao', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <div className="bg-[#C9A961]/10 p-3 rounded-lg border border-[#C9A961]/20">
                      <p className="text-xs text-[#6B4423]">
                        <strong>💡 Dica:</strong> Estimativa do público que irá consumir café:
                      </p>
                      <ul className="text-xs text-[#8B7355] mt-1 space-y-0.5 ml-4">
                        <li>• 60-70%: Eventos gerais</li>
                        <li>• 75-85%: Eventos matutinos ou corporativos</li>
                        <li>• 40-50%: Eventos com múltiplas bebidas</li>
                      </ul>
                    </div>
                    <div className="bg-[#F5F1E8] p-2 rounded text-center">
                      <p className="text-sm text-[#6B4423]">
                        <strong>{resultados.consumidores_esperados}</strong> consumidores esperados
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horas" className="flex items-center gap-2 text-[#6B4423]">
                      <Clock className="w-4 h-4" />
                      Horas de Atendimento/Dia
                    </Label>
                    <Input
                      id="horas"
                      type="number"
                      min="1"
                      max="24"
                      value={calcDataEvento.horas_por_dia}
                      onChange={(e) => handleCalcChangeEvento('horas_por_dia', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ml" className="flex items-center gap-2 text-[#6B4423]">
                      <Coffee className="w-4 h-4" />
                      ML por Copo
                    </Label>
                    <Input
                      id="ml"
                      type="number"
                      min="30"
                      max="300"
                      value={calcDataEvento.ml_por_copo}
                      onChange={(e) => handleCalcChangeEvento('ml_por_copo', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">
                      Volume médio por copo (padrão: 70ml = 7g de pó)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perdas" className="flex items-center gap-2 text-[#6B4423]">
                      <TrendingUp className="w-4 h-4" />
                      Fator de Perdas (%)
                    </Label>
                    <Input
                      id="perdas"
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={calcDataEvento.fator_perdas}
                      onChange={(e) => handleCalcChangeEvento('fator_perdas', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">
                      Sobra, moagem e desperdício (padrão: 10%)
                    </p>
                  </div>

                  <div className="bg-[#F5F1E8] p-4 rounded-lg border-l-4 border-[#C9A961]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-[#6B4423]">
                        <strong>Regra base:</strong> 10ml de café pronto = 1g de pó de café. 
                        Com {calcDataEvento.ml_por_copo}ml por copo, cada pessoa consome {(calcDataEvento.ml_por_copo / 10).toFixed(1)}g de pó.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Calculadora de Uso Interno */}
                  <div className="space-y-2">
                    <Label htmlFor="funcionarios" className="flex items-center gap-2 text-[#6B4423]">
                      <Users className="w-4 h-4" />
                      Quantidade de Funcionários *
                    </Label>
                    <Input
                      id="funcionarios"
                      type="number"
                      min="1"
                      value={calcDataInterno.quantidade_funcionarios}
                      onChange={(e) => handleCalcChangeInterno('quantidade_funcionarios', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">Número de pessoas que consomem café regularmente</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dias_uso" className="flex items-center gap-2 text-[#6B4423]">
                      <Calendar className="w-4 h-4" />
                      Período (dias) *
                    </Label>
                    <Input
                      id="dias_uso"
                      type="number"
                      min="1"
                      value={calcDataInterno.dias_uso}
                      onChange={(e) => handleCalcChangeInterno('dias_uso', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">Por quantos dias você precisa de café?</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="xicaras_por_dia" className="flex items-center gap-2 text-[#6B4423]">
                      <Coffee className="w-4 h-4" />
                      Xícaras por Dia (por pessoa) *
                    </Label>
                    <Input
                      id="xicaras_por_dia"
                      type="number"
                      min="1"
                      step="0.5"
                      value={calcDataInterno.xicaras_por_dia}
                      onChange={(e) => handleCalcChangeInterno('xicaras_por_dia', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <div className="bg-[#C9A961]/10 p-3 rounded-lg border border-[#C9A961]/20">
                      <p className="text-xs text-[#6B4423]">
                        <strong>💡 Sugestões:</strong>
                      </p>
                      <ul className="text-xs text-[#8B7355] mt-1 space-y-0.5 ml-4">
                        <li>• 2-3 xícaras: Consumo moderado</li>
                        <li>• 4-5 xícaras: Alto consumo</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tamanho_xicara" className="flex items-center gap-2 text-[#6B4423]">
                      <Coffee className="w-4 h-4" />
                      Tamanho da Xícara
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={calcDataInterno.tamanho_xicara === 100 ? "default" : "outline"}
                        onClick={() => handleCalcChangeInterno('tamanho_xicara', 100)}
                        className={calcDataInterno.tamanho_xicara === 100 ? "bg-[#6B4423] hover:bg-[#6B4423]/90 text-white" : "border-[#E5DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"}
                      >
                        100ml (Pequena)
                      </Button>
                      <Button
                        type="button"
                        variant={calcDataInterno.tamanho_xicara === 200 ? "default" : "outline"}
                        onClick={() => handleCalcChangeInterno('tamanho_xicara', 200)}
                        className={calcDataInterno.tamanho_xicara === 200 ? "bg-[#6B4423] hover:bg-[#6B4423]/90 text-white" : "border-[#E5DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"}
                      >
                        200ml (Média)
                      </Button>
                    </div>
                    <p className="text-xs text-[#8B7355]">
                      {calcDataInterno.xicaras_por_dia} xícara(s) × {calcDataInterno.tamanho_xicara}ml = <strong>{calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara}ml/dia</strong> por pessoa
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perdas_interno" className="flex items-center gap-2 text-[#6B4423]">
                      <TrendingUp className="w-4 h-4" />
                      Fator de Perdas (%)
                    </Label>
                    <Input
                      id="perdas_interno"
                      type="number"
                      min="0"
                      max="50"
                      value={calcDataInterno.fator_perdas}
                      onChange={(e) => handleCalcChangeInterno('fator_perdas', e.target.value)}
                      className="border-[#E5DCC8] text-lg"
                    />
                    <p className="text-xs text-[#8B7355]">
                      Sobra, moagem e desperdício (padrão: 10%)
                    </p>
                  </div>

                  <div className="bg-[#F5F1E8] p-4 rounded-lg border-l-4 border-[#C9A961]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-[#6B4423]">
                        <strong>Regra base:</strong> 10ml de café pronto = 1g de pó de café.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Coluna Direita: Resultados */}
          <div className="space-y-6">
            {/* Card Principal - KG Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Coffee className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-white/80 text-sm uppercase tracking-wide mb-2">
                      Total Necessário
                    </p>
                    <p className="text-6xl font-bold mb-2">
                      {resultados.kg_total} kg
                    </p>
                    <p className="text-white/80 text-lg">
                      {resultados.pacotes_250g} pacotes de 250g
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Seletor de Embalagem */}
            <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-[#E5DCC8] pb-3">
                <CardTitle className="text-lg text-[#6B4423] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Calculadora de Embalagens
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(pacotesPorEmbalagem).map((embalagem) => (
                    <Button
                      key={embalagem}
                      type="button"
                      variant={embalagemSelecionada === embalagem ? "default" : "outline"}
                      onClick={() => setEmbalagemSelecionada(embalagem)}
                      className={`h-auto py-3 flex flex-col ${
                        embalagemSelecionada === embalagem 
                          ? "bg-[#6B4423] hover:bg-[#5A3A1E] text-white" 
                          : "border-[#E5DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"
                      }`}
                    >
                      <span className="text-lg font-bold">{embalagem}</span>
                      <span className="text-xs mt-1">
                        {embalagem === "10g" || embalagem === "18g" ? "Drip" : "Pacote"}
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-[#6B4423]/10 to-[#C9A961]/10 p-4 rounded-lg border border-[#E5DCC8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B7355]">Embalagem de {embalagemSelecionada}</p>
                      <p className="text-xs text-[#8B7355] mt-0.5">
                        {embalagemSelecionada === "10g" && "Drip coffee individual"}
                        {embalagemSelecionada === "18g" && "Drip coffee premium"}
                        {embalagemSelecionada === "100g" && "Pacote pequeno"}
                        {embalagemSelecionada === "250g" && "Pacote padrão"}
                        {embalagemSelecionada === "500g" && "Pacote médio"}
                        {embalagemSelecionada === "1kg" && "Pacote grande"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#6B4423]">
                        {pacotesPorEmbalagem[embalagemSelecionada]}
                      </p>
                      <p className="text-xs text-[#8B7355]">
                        {embalagemSelecionada === "10g" || embalagemSelecionada === "18g" ? "drips" : "pacotes"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F1E8] p-3 rounded-lg">
                  <p className="text-xs text-[#6B4423] font-semibold mb-2">
                    📦 Todas as opções de embalagem:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#8B7355]">
                    {Object.entries(pacotesPorEmbalagem).map(([embalagem, quantidade]) => (
                      <div key={embalagem} className="flex justify-between">
                        <span>{embalagem}:</span>
                        <span className="font-semibold text-[#6B4423]">{quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards Secundários */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/10 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#2D5016]/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#2D5016]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#8B7355]">Por Dia</p>
                        <p className="text-2xl font-bold text-[#6B4423]">
                          {resultados.kg_por_dia} kg
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8B7355]">
                      {tipoCalculo === "Evento" 
                        ? `${Math.round(resultados.consumidores_esperados / (tipoCalculo === "Evento" ? calcDataEvento.dias_evento : calcDataInterno.dias_uso))} pessoas/dia`
                        : `${calcDataInterno.quantidade_funcionarios} funcionários/dia`
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {tipoCalculo === "Evento" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/10 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#C9A961]/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#8B7355]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[#8B7355]">Por Hora</p>
                          <p className="text-2xl font-bold text-[#6B4423]">
                            {resultados.kg_por_hora} kg
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#8B7355]">
                        Fluxo estimado
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Detalhamento */}
            <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-lg text-[#6B4423] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detalhamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {tipoCalculo === "Evento" ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Público Total</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {resultados.publico_total} pessoas
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Taxa de Adesão</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataEvento.taxa_adesao}%
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Consumidores Esperados</span>
                      <Badge variant="outline" className="bg-[#2D5016]/10 text-[#2D5016]">
                        {resultados.consumidores_esperados} pessoas
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Consumo por Pessoa</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {(calcDataEvento.ml_por_copo / 10).toFixed(1)}g/pessoa
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">ML por Copo</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataEvento.ml_por_copo}ml
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-[#8B7355]">Fator de Perdas</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataEvento.fator_perdas}%
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Funcionários</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataInterno.quantidade_funcionarios} pessoas
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Período</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataInterno.dias_uso} dias
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Xícaras por Dia</span>
                      <Badge variant="outline" className="bg-[#2D5016]/10 text-[#2D5016]">
                        {calcDataInterno.xicaras_por_dia} xícara(s)
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Tamanho da Xícara</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataInterno.tamanho_xicara}ml
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-[#E5DCC8]">
                      <span className="text-sm text-[#8B7355]">Consumo Diário Total</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara * calcDataInterno.quantidade_funcionarios}ml/dia
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-[#8B7355]">Fator de Perdas</span>
                      <Badge variant="outline" className="bg-[#F5F1E8]">
                        {calcDataInterno.fator_perdas}%
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Fórmula */}
            <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#F5F1E8] to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#6B4423] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Fórmula Utilizada
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {tipoCalculo === "Evento" ? (
                  <div className="text-xs text-[#8B7355] space-y-1 font-mono bg-white p-3 rounded border border-[#E5DCC8]">
                    <p>Público_total = {calcDataEvento.pessoas_por_dia} × {calcDataEvento.dias_evento} = {resultados.publico_total}</p>
                    <p>Consumidores = {resultados.publico_total} × {calcDataEvento.taxa_adesao}% = {resultados.consumidores_esperados}</p>
                    <p>Kg_total = ({resultados.consumidores_esperados} × {(calcDataEvento.ml_por_copo / 10).toFixed(1)}g × 1.{calcDataEvento.fator_perdas}) ÷ 1000</p>
                    <p>Kg_dia = {resultados.kg_total} ÷ {calcDataEvento.dias_evento} = {resultados.kg_por_dia}</p>
                    <p>Kg_hora = {resultados.kg_por_dia} ÷ {calcDataEvento.horas_por_dia} = {resultados.kg_por_hora}</p>
                  </div>
                ) : (
                  <div className="text-xs text-[#8B7355] space-y-1 font-mono bg-white p-3 rounded border border-[#E5DCC8]">
                    <p>ML_diário = {calcDataInterno.xicaras_por_dia} × {calcDataInterno.tamanho_xicara}ml = {calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara}ml/pessoa</p>
                    <p>ML_total = {calcDataInterno.quantidade_funcionarios} × {calcDataInterno.dias_uso} × {calcDataInterno.xicaras_por_dia * calcDataInterno.tamanho_xicara}ml</p>
                    <p>Gramas = (ML_total ÷ 10) × 1.{calcDataInterno.fator_perdas}</p>
                    <p>Kg_total = Gramas ÷ 1000 = {resultados.kg_total}kg</p>
                    <p>Pacotes_250g = ⌈{resultados.kg_total} ÷ 0.25⌉ = {resultados.pacotes_250g}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-8 border-[#E5DCC8] bg-gradient-to-br from-[#F5F1E8]/50 to-white">
          <CardHeader>
            <CardTitle className="text-lg text-[#6B4423]">
              💡 Dicas para Cálculos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#6B4423]">Eventos</h4>
                <ul className="text-sm text-[#8B7355] space-y-1">
                  <li>• Considere picos de horário (manhã e após almoço)</li>
                  <li>• Tenha sempre 10-15% de margem de segurança</li>
                  <li>• Verifique a capacidade dos equipamentos</li>
                  <li>• Taxa de adesão varia conforme o tipo de evento</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-[#6B4423]">Uso Interno</h4>
                <ul className="text-sm text-[#8B7355] space-y-1">
                  <li>• Considere variações sazonais no consumo</li>
                  <li>• Xícara pequena (100ml) é padrão para café expresso</li>
                  <li>• Xícara média (200ml) para café americano ou coado</li>
                  <li>• Ajuste o número de xícaras conforme perfil da equipe</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
