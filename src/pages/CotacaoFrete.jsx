import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ConfiguracaoFrete } from "@/entities/ConfiguracaoFrete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Package, DollarSign, Clock, Settings, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CotacaoForm from "../components/frete/CotacaoForm";
import ResultadoCotacao from "../components/frete/ResultadoCotacao";
import ConfiguracaoFreteForm from "../components/frete/ConfiguracaoFreteForm";

export default function CotacaoFrete() {
  const [configuracoes, setConfiguracoes] = useState([]);
  const [configAtiva, setConfigAtiva] = useState(null);
  const [cotacoes, setCotacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parametros, setParametros] = useState(null);

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const loadConfiguracoes = async () => {
    const configs = await ConfiguracaoFrete.list("-created_date");
    setConfiguracoes(configs);
    
    const ativa = configs.find(c => c.ativo);
    if (ativa) {
      setConfigAtiva(ativa);
    }
  };

  const handleCotar = async (dados) => {
    setIsLoading(true);
    setError(null);
    setCotacoes([]);

    try {
      const response = await base44.functions.invoke('cotarFrete', dados);
      
      if (response.data.success) {
        setCotacoes(response.data.cotacoes);
        setParametros(response.data.parametros_utilizados);
      } else {
        setError(response.data.error || 'Erro ao cotar frete');
      }
    } catch (err) {
      console.error('Erro ao cotar:', err);
      setError(err.response?.data?.error || 'Erro ao processar cotação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#6B4423] mb-2">
            Cotação de Frete
          </h1>
          <p className="text-[#8B7355]">
            Consulte opções de frete com a Melhor Envio
          </p>
        </div>

        <Tabs defaultValue="cotacao" className="space-y-6">
          <TabsList className="bg-white border border-[#E5DCC8]">
            <TabsTrigger 
              value="cotacao" 
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4 mr-2" />
              Cotar Frete
            </TabsTrigger>
            <TabsTrigger 
              value="configuracoes"
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab Cotação */}
          <TabsContent value="cotacao" className="space-y-6">
            <CotacaoForm 
              configAtiva={configAtiva}
              onCotar={handleCotar}
              isLoading={isLoading}
            />

            {/* Loading */}
            {isLoading && (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-[#6B4423] animate-spin mx-auto mb-4" />
                  <p className="text-[#8B7355]">Consultando transportadoras...</p>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-800">Erro ao consultar frete</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resultados */}
            {!isLoading && cotacoes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#6B4423]">
                    Opções Disponíveis ({cotacoes.length})
                  </h2>
                  {parametros && (
                    <div className="text-sm text-[#8B7355]">
                      {parametros.cep_origem} → {parametros.cep_destino}
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  {cotacoes.map((cotacao, index) => (
                    <ResultadoCotacao key={cotacao.id || index} cotacao={cotacao} />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !error && cotacoes.length === 0 && parametros && (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355] text-lg">Nenhuma opção de frete disponível</p>
                  <p className="text-sm text-[#A69483] mt-2">
                    Tente ajustar os parâmetros ou verifique os CEPs informados
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes">
            <ConfiguracaoFreteForm 
              configuracoes={configuracoes}
              onSave={loadConfiguracoes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}