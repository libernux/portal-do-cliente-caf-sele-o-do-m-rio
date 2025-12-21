import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coffee, Search, MapPin, Award, Star } from "lucide-react";

export default function CafesPublico() {
  const [cafes, setCafes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('getCafesPublicos', {});
      if (response.data.success) {
        setCafes(response.data.cafes);
      }
    } catch (error) {
      console.error("Erro ao carregar cafés:", error);
    }
    setIsLoading(false);
  };

  const cafesFiltrados = cafes.filter(cafe =>
    cafe.nome_cafe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.origem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.variedade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.notas_degustacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-white to-[#E5DCC8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Coffee className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Nossos Cafés Especiais</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Conheça nossa seleção de cafés premium, cuidadosamente avaliados e aprovados
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Busca */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
            <Input
              placeholder="Buscar por nome, origem, variedade ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg border-[#C9A961] focus:border-[#6B4423] shadow-lg"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6B4423] mx-auto mb-4"></div>
            <p className="text-[#8B7355] text-lg">Carregando cafés especiais...</p>
          </div>
        ) : cafesFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="w-20 h-20 text-[#8B7355] mx-auto mb-4 opacity-30" />
            <p className="text-[#8B7355] text-xl">Nenhum café encontrado</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-[#8B7355] text-lg">
                <strong>{cafesFiltrados.length}</strong> {cafesFiltrados.length === 1 ? 'café especial' : 'cafés especiais'} encontrado{cafesFiltrados.length !== 1 && 's'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cafesFiltrados.map((cafe) => (
                <Card 
                  key={cafe.id} 
                  className="border-[#E5DCC8] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] p-6 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold flex-1">{cafe.nome_cafe}</h3>
                      {cafe.pontuacao && (
                        <div className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                          <Star className="w-4 h-4 fill-amber-900" />
                          {cafe.pontuacao}
                        </div>
                      )}
                    </div>
                    {cafe.origem && (
                      <div className="flex items-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span>{cafe.origem}</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-3">
                    {/* Lista completa de informações */}
                    <div className="space-y-2 text-sm">
                      {cafe.tipo_grao && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Tipo do Grão:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.tipo_grao}</span>
                        </div>
                      )}
                      {cafe.variedade && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Variedade:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.variedade}</span>
                        </div>
                      )}
                      {cafe.processamento && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Processamento:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.processamento}</span>
                        </div>
                      )}
                      {cafe.bebida && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Bebida:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.bebida}</span>
                        </div>
                      )}
                      {cafe.altitude && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Altitude:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.altitude}m</span>
                        </div>
                      )}
                      {cafe.torra && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Torra:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.torra}</span>
                        </div>
                      )}
                      {cafe.moagem && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Moagem:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.moagem}</span>
                        </div>
                      )}
                      {cafe.docura && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Doçura:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.docura}</span>
                        </div>
                      )}
                      {cafe.aroma && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Aroma:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.aroma}</span>
                        </div>
                      )}
                      {cafe.corpo && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Corpo:</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.corpo}</span>
                        </div>
                      )}
                      {cafe.acidez_tipo && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Acidez (Tipo):</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.acidez_tipo}</span>
                        </div>
                      )}
                      {cafe.acidez_intensidade && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Acidez (Intensidade):</span>
                          <span className="font-medium text-[#6B4423] text-right max-w-[60%]">{cafe.acidez_intensidade}</span>
                        </div>
                      )}
                      {cafe.escala_intensidade && (
                        <div className="flex justify-between border-b border-[#E5DCC8] pb-1">
                          <span className="text-[#8B7355]">Intensidade:</span>
                          <span className="font-medium text-[#6B4423]">{cafe.escala_intensidade}/10</span>
                        </div>
                      )}
                    </div>

                    {/* Sabor e Notas Sensoriais */}
                    {cafe.sabor_notas_sensoriais && (
                      <div className="bg-[#F5F1E8] border border-[#E5DCC8] rounded-lg p-3">
                        <p className="text-xs text-[#8B7355] font-semibold mb-1">Sabor / Notas Sensoriais</p>
                        <p className="text-sm text-[#5A4A3A]">{cafe.sabor_notas_sensoriais}</p>
                      </div>
                    )}

                    {/* Notas de Degustação */}
                    {cafe.notas_degustacao && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-700 font-semibold mb-1 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Notas de Degustação
                        </p>
                        <p className="text-sm text-amber-900">{cafe.notas_degustacao}</p>
                      </div>
                    )}

                    {/* Métodos de Preparo */}
                    {cafe.metodos_preparo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-semibold mb-1">Métodos de Preparo</p>
                        <p className="text-sm text-blue-900">{cafe.metodos_preparo}</p>
                      </div>
                    )}

                    {/* Modo de Conservação */}
                    {cafe.modo_conservacao && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Conservação</p>
                        <p className="text-sm text-gray-800">{cafe.modo_conservacao}</p>
                      </div>
                    )}

                    {/* Observações */}
                    {cafe.observacoes && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700 font-semibold mb-1">Observações</p>
                        <p className="text-sm text-purple-900">{cafe.observacoes}</p>
                      </div>
                    )}

                    {/* Certificações */}
                    {cafe.certificacoes && (
                      <div className="pt-2">
                        <p className="text-xs text-[#8B7355] font-semibold mb-2">Certificações</p>
                        <div className="flex flex-wrap gap-2">
                          {cafe.certificacoes.split(',').map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-800 border-green-300">
                              {cert.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center px-6">
          <p className="text-lg">Café Seleção do Mário</p>
          <p className="text-white/80 text-sm mt-2">Cafés Especiais Premium</p>
        </div>
      </div>
    </div>
  );
}