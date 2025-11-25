
import React, { useState, useEffect } from "react";
import { Cafe } from "@/entities/Cafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Mail, Phone, MapPin, ShoppingCart, ArrowLeft, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TabelaPrivateLabel() {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    setIsLoading(true);
    try {
      const allCafes = await Cafe.list();
      const privateLabelCafes = allCafes.filter(c => {
        if (!c.is_private_label) return false;
        const precos = c.precos_private_label || {};
        return Object.values(precos).some(preco => preco > 0);
      });
      setCafes(privateLabelCafes);
    } catch (error) {
      console.error("Erro ao carregar cafés:", error);
    }
    setIsLoading(false);
  };

  const formaColors = {
    "Grão": "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    "Moído": "bg-[#6B4423]/10 text-[#6B4423] border-[#6B4423]"
  };

  const torraColors = {
    "Clara": "bg-amber-100 text-amber-800 border-amber-300",
    "Média": "bg-[#8B5A2B]/10 text-[#8B5A2B] border-[#8B5A2B]",
    "Escura": "bg-[#3D2817]/10 text-[#3D2817] border-[#3D2817]"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header Público */}
      <header className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Café Seleção do Mário</h1>
              <p className="text-white/90 text-base sm:text-lg md:text-xl">Linha Private Label</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm sm:text-base">
              ☕ Cafés especiais selecionados com os melhores grãos, torrados artesanalmente e prontos para sua marca.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Descrição */}
        <Card className="border-[#E5DCC8] shadow-xl mb-8 sm:mb-12">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#6B4423] mb-4 text-center">
              Nossa Linha Private Label
            </h2>
            <p className="text-[#8B7355] text-center text-base sm:text-lg leading-relaxed">
              Oferecemos cafés de alta qualidade prontos para personalizarem com sua marca. 
              Perfeitos para empresas, eventos corporativos, hotéis, restaurantes e muito mais.
            </p>
          </CardContent>
        </Card>

        {/* Tabela de Preços */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto mb-4"></div>
            <p className="text-[#8B7355]">Carregando cafés...</p>
          </div>
        ) : cafes.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#6B4423] mb-6">
              💰 Tabela de Preços
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {cafes.map((cafe, index) => {
                const precos = cafe.precos_private_label || {};
                const embalagensCemPreco = (cafe.embalagens_disponiveis || []).filter(emb => precos[emb] > 0);
                
                const menorPreco = Math.min(...embalagensCemPreco.map(emb => precos[emb]));
                const embalagemMenorPreco = embalagensCemPreco.find(emb => precos[emb] === menorPreco);

                return (
                  <motion.div
                    key={cafe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-[#E5DCC8] bg-white hover:shadow-xl transition-all duration-300 h-full">
                      <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#F5F1E8] to-white">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl sm:text-2xl text-[#6B4423] mb-2">
                              {cafe.nome}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={formaColors[cafe.forma]}>
                                {cafe.forma}
                              </Badge>
                              {cafe.torra && (
                                <Badge variant="outline" className={torraColors[cafe.torra]}>
                                  Torra {cafe.torra}
                                </Badge>
                              )}
                              {cafe.origem && (
                                <Badge variant="outline" className="bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {cafe.origem}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {embalagemMenorPreco && (
                            <div className="text-right sm:ml-4">
                              <p className="text-xs sm:text-sm text-[#8B7355]">A partir de</p>
                              <p className="text-3xl sm:text-4xl font-bold text-[#2D5016]">
                                R$ {menorPreco.toFixed(2)}
                              </p>
                              <p className="text-xs text-[#8B7355]">{embalagemMenorPreco}</p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        {cafe.descricao_private_label && (
                          <p className="text-sm sm:text-base text-[#8B7355] leading-relaxed">
                            {cafe.descricao_private_label}
                          </p>
                        )}

                        {cafe.notas_degustacao && (
                          <div className="bg-[#F5F1E8] p-3 sm:p-4 rounded-lg">
                            <p className="text-xs font-semibold text-[#6B4423] mb-2">
                              🎯 Notas de Degustação:
                            </p>
                            <p className="text-xs sm:text-sm text-[#8B7355]">
                              {cafe.notas_degustacao}
                            </p>
                          </div>
                        )}

                        {embalagensCemPreco.length > 0 && (
                          <div className="bg-gradient-to-br from-[#2D5016]/5 to-[#3D6B1F]/5 p-3 sm:p-4 rounded-lg border border-[#2D5016]/20">
                            <p className="text-xs sm:text-sm font-semibold text-[#6B4423] mb-3">
                              💰 Preços por Embalagem:
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              {embalagensCemPreco.map((embalagem) => (
                                <div key={embalagem} className="bg-white p-2 sm:p-3 rounded-lg flex items-center justify-between">
                                  <span className="text-xs sm:text-sm font-medium text-[#6B4423]">
                                    {embalagem}
                                    {(embalagem === "10g" || embalagem === "18g") && <span className="block text-[10px] text-[#8B7355]">(Drip)</span>}
                                  </span>
                                  <span className="text-base sm:text-lg font-bold text-[#2D5016]">
                                    R$ {precos[embalagem].toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="border-[#E5DCC8] shadow-lg">
            <CardContent className="p-8 sm:p-12 text-center">
              <Coffee className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
              <p className="text-[#8B7355] text-base sm:text-lg">
                Nenhum café Private Label disponível no momento
              </p>
            </CardContent>
          </Card>
        )}

        {/* Vantagens */}
        <Card className="border-[#E5DCC8] shadow-xl mt-8 sm:mt-12">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="text-xl sm:text-2xl text-[#6B4423]">
              ✨ Vantagens do Private Label
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[#F5F1E8] p-4 sm:p-6 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2D5016] rounded-full flex items-center justify-center mb-4">
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-[#6B4423] mb-2 text-sm sm:text-base">Qualidade Garantida</h4>
                <p className="text-xs sm:text-sm text-[#8B7355]">
                  Cafés selecionados e torrados artesanalmente com os melhores grãos
                </p>
              </div>

              <div className="bg-[#F5F1E8] p-4 sm:p-6 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#6B4423] rounded-full flex items-center justify-center mb-4">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-[#6B4423] mb-2 text-sm sm:text-base">Múltiplas Embalagens</h4>
                <p className="text-xs sm:text-sm text-[#8B7355]">
                  Diversas opções de tamanho para atender suas necessidades
                </p>
              </div>

              <div className="bg-[#F5F1E8] p-4 sm:p-6 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C9A961] rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-[#6B4423] mb-2 text-sm sm:text-base">Personalização</h4>
                <p className="text-xs sm:text-sm text-[#8B7355]">
                  Coloque sua marca em produtos de alta qualidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-[#E5DCC8] shadow-xl mt-8 sm:mt-12 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white">
          <CardContent className="p-6 sm:p-10 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Interessado em nossos cafés?
            </h3>
            <p className="text-base sm:text-lg mb-6 text-white/90">
              Entre em contato conosco para mais informações e pedidos personalizados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:contato@cafeselecaodomario.com.br"
                className="inline-flex items-center gap-2 bg-white text-[#6B4423] px-6 py-3 rounded-lg font-semibold hover:bg-[#F5F1E8] transition-colors w-full sm:w-auto justify-center"
              >
                <Mail className="w-5 h-5" />
                contato@cafeselecaodomario.com.br
              </a>
              <a 
                href="tel:+5527999999999"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors w-full sm:w-auto justify-center"
              >
                <Phone className="w-5 h-5" />
                (27) 99999-9999
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer com Links Obrigatórios */}
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
