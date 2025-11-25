import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { InfoCafe } from "@/entities/InfoCafe";
import { Coffee, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InfoCafePublico() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const [infoCafe, setInfoCafe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInfoCafe();
  }, [slug]);

  const loadInfoCafe = async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      const dados = await InfoCafe.filter({ slug, ativo: true });
      if (dados.length > 0) {
        setInfoCafe(dados[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar informações:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#6B4423] mx-auto mb-4" />
          <p className="text-[#8B7355]">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (!infoCafe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
        <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Café Seleção do Mário</h1>
                <p className="text-white/80">Informações do Café</p>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <p className="text-[#8B7355] text-lg">Informações não encontradas ou café inativo.</p>
        </div>
      </div>
    );
  }

  const infos = infoCafe.infos_sensoriais || {};
  const adicionais = infoCafe.infos_adicionais || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 shadow-lg">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Café Seleção do Mário</h1>
              <p className="text-white/80">Informações do Café</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4">{infoCafe.cafe_nome}</h2>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="sensoriais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#E5DCC8]">
            <TabsTrigger 
              value="sensoriais" 
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              INFOS SENSORIAIS
            </TabsTrigger>
            <TabsTrigger 
              value="ingredientes" 
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              INGREDIENTES
            </TabsTrigger>
            <TabsTrigger 
              value="preparo" 
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              MÉTODOS DE PREPARO
            </TabsTrigger>
            <TabsTrigger 
              value="adicionais" 
              className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white"
            >
              INFOS ADICIONAIS
            </TabsTrigger>
          </TabsList>

          {/* Infos Sensoriais */}
          <TabsContent value="sensoriais">
            <Card className="border-[#E5DCC8] shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#6B4423] mb-6">INFOS SENSORIAIS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Origem", value: infos.origem },
                    { label: "Tipo do Grão", value: infos.tipo_grao },
                    { label: "Variedade", value: infos.variedade },
                    { label: "Processamento", value: infos.processamento },
                    { label: "Bebida", value: infos.bebida },
                    { label: "Sabor", value: infos.sabor },
                    { label: "Doçura", value: infos.docura },
                    { label: "Aroma", value: infos.aroma },
                    { label: "Acidez", value: infos.acidez },
                    { label: "Corpo", value: infos.corpo },
                    { label: "Torra", value: infos.torra },
                    { label: "Moagem", value: infos.moagem },
                    { label: "Escala de intensidade (Range 1 a 10)", value: infos.escala_intensidade }
                  ].map((item, index) => (
                    item.value && (
                      <div key={index} className="border-b border-[#E5DCC8] pb-3">
                        <p className="text-sm text-[#8B7355] mb-1">{item.label}</p>
                        <p className="font-semibold text-[#6B4423]">{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredientes */}
          <TabsContent value="ingredientes">
            <Card className="border-[#E5DCC8] shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#6B4423] mb-6">INGREDIENTES</h3>
                <p className="text-[#5A4A3A] leading-relaxed whitespace-pre-wrap">
                  {infoCafe.ingredientes || "Informações de ingredientes não disponíveis."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Métodos de Preparo */}
          <TabsContent value="preparo">
            <Card className="border-[#E5DCC8] shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#6B4423] mb-6">MÉTODOS DE PREPARO</h3>
                {infoCafe.metodos_preparo && infoCafe.metodos_preparo.length > 0 ? (
                  <div className="space-y-4">
                    {infoCafe.metodos_preparo.map((metodo, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="font-bold text-[#C9A961] text-lg">{index + 1}.</span>
                        <p className="text-[#5A4A3A] leading-relaxed flex-1">{metodo}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8B7355]">Métodos de preparo não disponíveis.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infos Adicionais */}
          <TabsContent value="adicionais">
            <Card className="border-[#E5DCC8] shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#6B4423] mb-4">INFOS ADICIONAIS</h3>
                </div>

                {/* Modo de Conservação */}
                {adicionais.modo_conservacao && (
                  <div>
                    <h4 className="text-lg font-bold text-[#C9A961] mb-2">MODO DE CONSERVAÇÃO / ARMAZENAMENTO</h4>
                    <p className="text-[#5A4A3A] leading-relaxed">{adicionais.modo_conservacao}</p>
                  </div>
                )}

                {/* Embalagens Disponíveis */}
                {adicionais.embalagens_disponiveis && adicionais.embalagens_disponiveis.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-[#C9A961] mb-4">DISPONÍVEL NAS EMBALAGENS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {adicionais.embalagens_disponiveis.map((embalagem, index) => (
                        <Card key={index} className="border-[#E5DCC8]">
                          <CardContent className="p-4 space-y-3">
                            {embalagem.imagem_url && (
                              <div className="flex justify-center mb-4">
                                <img 
                                  src={embalagem.imagem_url} 
                                  alt={embalagem.tamanho}
                                  className="max-h-48 object-contain"
                                />
                              </div>
                            )}
                            <h5 className="font-bold text-[#6B4423] text-center text-lg">
                              Conteúdo líquido: {embalagem.tamanho}
                            </h5>
                            <div className="text-xs text-[#5A4A3A] space-y-1 text-center">
                              {embalagem.peso_bruto && <p>Peso bruto: {embalagem.peso_bruto}</p>}
                              {embalagem.dimensoes_embalagem && <p>Dimensões: {embalagem.dimensoes_embalagem}</p>}
                              {embalagem.peso_bruto_embalagem && <p>Peso bruto embalagem: {embalagem.peso_bruto_embalagem}</p>}
                              {embalagem.fracionamento_emb_secundaria && <p>Fracionamento EMB Secundária: {embalagem.fracionamento_emb_secundaria}</p>}
                              {embalagem.dimensoes_emb_secundaria && <p>Dimensões EMB Secundária: {embalagem.dimensoes_emb_secundaria}</p>}
                              {embalagem.tipo_empacotamento && <p>Tipo de Empacotamento: {embalagem.tipo_empacotamento}</p>}
                              {embalagem.materiais && <p>Materiais: {embalagem.materiais}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registro */}
                {adicionais.registro && (
                  <div>
                    <h4 className="text-lg font-bold text-[#C9A961] mb-2">REGISTRO</h4>
                    <p className="text-[#5A4A3A]">{adicionais.registro}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5DCC8] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#8B7355]">
            <a href="/Privacy" className="hover:text-[#6B4423] hover:underline font-medium">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="/Support" className="hover:text-[#6B4423] hover:underline font-medium">
              Suporte
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Café Seleção do Mário</span>
          </div>
        </div>
      </footer>
    </div>
  );
}