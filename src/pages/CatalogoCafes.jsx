import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Coffee, MapPin, Award, Star } from "lucide-react";

export default function CatalogoCafes() {
  const [cafes, setCafes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    setIsLoading(true);
    try {
      const data = await base44.asServiceRole.entities.SubmissaoProdutor.filter({
        status: "Aprovado"
      }, "-pontuacao");
      setCafes(data);
    } catch (error) {
      console.error("Erro ao carregar cafés:", error);
    }
    setIsLoading(false);
  };

  const filteredCafes = cafes.filter(cafe => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cafe.nome_cafe?.toLowerCase().includes(searchLower) ||
      cafe.origem?.toLowerCase().includes(searchLower) ||
      cafe.variedade?.toLowerCase().includes(searchLower) ||
      cafe.sabor_notas_sensoriais?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Catálogo de Cafés Especiais
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore nossa seleção de cafés especiais de produtores brasileiros
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Busca */}
        <Card className="border-[#E5DCC8] mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
              <Input
                placeholder="Buscar por nome, origem, variedade ou notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5DCC8] text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8 text-center">
          <p className="text-[#8B7355] text-lg">
            {filteredCafes.length} {filteredCafes.length === 1 ? "café disponível" : "cafés disponíveis"}
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto mb-4"></div>
            <p className="text-[#8B7355]">Carregando cafés...</p>
          </div>
        ) : filteredCafes.length === 0 ? (
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-12 text-center">
              <Coffee className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
              <p className="text-[#8B7355] text-lg">
                {searchTerm ? "Nenhum café encontrado com esse filtro" : "Nenhum café disponível no momento"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => (
              <Card key={cafe.id} className="border-[#E5DCC8] hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] h-3 group-hover:h-4 transition-all"></div>
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl text-[#6B4423] flex-1">
                      {cafe.nome_cafe}
                    </CardTitle>
                    {cafe.pontuacao && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {cafe.pontuacao}
                      </Badge>
                    )}
                  </div>
                  
                  {cafe.origem && (
                    <div className="flex items-center gap-2 text-[#8B7355]">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{cafe.origem}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Características Principais */}
                  <div className="flex flex-wrap gap-2">
                    {cafe.variedade && (
                      <Badge variant="outline" className="border-[#E5DCC8] text-[#6B4423]">
                        {cafe.variedade}
                      </Badge>
                    )}
                    {cafe.processamento && (
                      <Badge variant="outline" className="border-[#E5DCC8] text-[#6B4423]">
                        {cafe.processamento}
                      </Badge>
                    )}
                    {cafe.torra && (
                      <Badge variant="outline" className="border-[#E5DCC8] text-[#6B4423]">
                        Torra {cafe.torra}
                      </Badge>
                    )}
                  </div>

                  {/* Notas Sensoriais */}
                  {cafe.sabor_notas_sensoriais && (
                    <div className="bg-[#F5F1E8] rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#6B4423] mb-1">
                        Notas Sensoriais
                      </p>
                      <p className="text-sm text-[#5A4A3A] line-clamp-2">
                        {cafe.sabor_notas_sensoriais}
                      </p>
                    </div>
                  )}

                  {/* Características */}
                  {(cafe.docura || cafe.aroma || cafe.corpo) && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {cafe.docura && (
                        <div className="bg-amber-50 rounded p-2">
                          <p className="text-xs text-amber-800 font-medium">Doçura</p>
                          <p className="text-xs text-amber-600">{cafe.docura}</p>
                        </div>
                      )}
                      {cafe.aroma && (
                        <div className="bg-purple-50 rounded p-2">
                          <p className="text-xs text-purple-800 font-medium">Aroma</p>
                          <p className="text-xs text-purple-600">{cafe.aroma}</p>
                        </div>
                      )}
                      {cafe.corpo && (
                        <div className="bg-orange-50 rounded p-2">
                          <p className="text-xs text-orange-800 font-medium">Corpo</p>
                          <p className="text-xs text-orange-600">{cafe.corpo}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Altitude e Certificações */}
                  <div className="flex flex-wrap gap-2 text-xs text-[#8B7355]">
                    {cafe.altitude && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{cafe.altitude}</span>
                      </div>
                    )}
                    {cafe.certificacoes && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{cafe.certificacoes}</span>
                      </div>
                    )}
                  </div>

                  {/* Notas de Degustação */}
                  {cafe.notas_degustacao && (
                    <div className="border-t border-[#E5DCC8] pt-3">
                      <p className="text-xs font-semibold text-[#6B4423] mb-1">
                        Notas de Degustação
                      </p>
                      <p className="text-xs text-[#5A4A3A] line-clamp-3">
                        {cafe.notas_degustacao}
                      </p>
                    </div>
                  )}

                  {/* Intensidade */}
                  {cafe.escala_intensidade && (
                    <div className="bg-gradient-to-r from-[#6B4423]/10 to-[#8B5A2B]/10 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#6B4423]">Intensidade</span>
                        <span className="text-sm font-bold text-[#6B4423]">
                          {cafe.escala_intensidade}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] h-2 rounded-full transition-all"
                          style={{ width: `${(cafe.escala_intensidade / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Coffee className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <p className="text-white/90 mb-4">
            Café Seleção do Mário - Cafés Especiais
          </p>
          <p className="text-white/70 text-sm">
            Descubra a origem e a história por trás de cada xícara
          </p>
        </div>
      </div>
    </div>
  );
}