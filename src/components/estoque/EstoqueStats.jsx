
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Package, Bookmark, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EstoqueStats({ cafes, reservas }) {
  const [showDetalhes, setShowDetalhes] = React.useState(false);

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25;
  };

  // Calcular estoque total real em kg baseado no estoque_por_embalagem
  const totalKgReal = cafes.reduce((sum, cafe) => {
    const estoqueDetalhado = cafe.estoque_por_embalagem || {};
    
    // Verificar se tem estoque detalhado preenchido com alguma quantidade > 0
    const temEstoqueDetalhado = Object.values(estoqueDetalhado).some(qtd => qtd > 0);
    
    if (temEstoqueDetalhado) {
      // Usar estoque por embalagem
      const kgCafe = Object.entries(estoqueDetalhado).reduce((sumCafe, [emb, qtd]) => {
        const pesoEmbalagem = getPesoEmbalagem(emb);
        return sumCafe + (qtd * pesoEmbalagem);
      }, 0);
      return sum + kgCafe;
    } else {
      // Fallback: usar quantidade_pacotes (considerando como 250g)
      const kgCafe = (cafe.quantidade_pacotes || 0) * 0.25;
      return sum + kgCafe;
    }
  }, 0);

  const totalKg = totalKgReal.toFixed(2);
  const totalPacotes = Math.ceil(totalKgReal / 0.25);
  
  const graos = cafes.filter(c => c.forma === "Grão").length;
  const moidos = cafes.filter(c => c.forma === "Moído").length;
  
  const reservasAtivas = reservas.filter(r => r.status === "Ativa");
  
  // Calcular total reservado considerando as diferentes embalagens
  const totalReservadoKg = reservasAtivas.reduce((sum, r) => {
    const peso = getPesoEmbalagem(r.embalagem || "250g");
    return sum + ((r.quantidade_pacotes || 0) * peso);
  }, 0);
  
  const totalReservadoPacotes250g = Math.ceil(totalReservadoKg / 0.25);
  
  const disponivelKg = Math.max(0, totalKgReal - totalReservadoKg);
  const disponivel = Math.floor(disponivelKg / 0.25);
  const disponivelKgFormatado = disponivelKg.toFixed(2);
  
  const clientesComReserva = [...new Set(reservasAtivas.map(r => r.cliente_id))].length;

  // Detalhamento por café
  const detalhamentoCafes = cafes.map(cafe => {
    const reservasDoCafe = reservasAtivas.filter(r => r.cafe_id === cafe.id);
    const reservadoKgCafe = reservasDoCafe.reduce((sum, r) => {
      const peso = getPesoEmbalagem(r.embalagem || "250g");
      return sum + ((r.quantidade_pacotes || 0) * peso);
    }, 0);
    const reservadoPacotesCafe = Math.ceil(reservadoKgCafe / 0.25);
    
    // Calcular estoque total deste café em kg
    const estoqueDetalhado = cafe.estoque_por_embalagem || {};
    const temEstoqueDetalhado = Object.values(estoqueDetalhado).some(qtd => qtd > 0);
    
    let totalKgCafe = 0;
    if (temEstoqueDetalhado) {
      totalKgCafe = Object.entries(estoqueDetalhado).reduce((sum, [emb, qtd]) => {
        return sum + (qtd * getPesoEmbalagem(emb));
      }, 0);
    } else {
      // Fallback
      totalKgCafe = (cafe.quantidade_pacotes || 0) * 0.25;
    }
    
    const totalPacotesCafe = Math.ceil(totalKgCafe / 0.25);
    
    const disponivelKgCafe = Math.max(0, totalKgCafe - reservadoKgCafe);
    const disponivelCafe = Math.floor(disponivelKgCafe / 0.25);

    return {
      ...cafe,
      total_kg: totalKgCafe.toFixed(3),
      total_pacotes: totalPacotesCafe,
      reservado_pacotes: reservadoPacotesCafe,
      reservado_kg: reservadoKgCafe.toFixed(3),
      disponivel_pacotes: disponivelCafe,
      disponivel_kg: disponivelKgCafe.toFixed(3)
    };
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#6B4423]/5 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                <Package className="w-5 h-5 text-[#6B4423]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#6B4423]">{totalPacotes}</p>
                <p className="text-xs text-[#8B7355]">Estoque Total (pacotes 250g)</p>
                <p className="text-xs font-semibold text-[#6B4423]">{totalKg} kg</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5DCC8] flex gap-2">
              <Badge variant="outline" className="text-xs">
                {graos} Grão
              </Badge>
              <Badge variant="outline" className="text-xs">
                {moidos} Moído
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                <Coffee className="w-5 h-5 text-[#2D5016]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2D5016]">{disponivel}</p>
                <p className="text-xs text-[#8B7355]">Disponível (pacotes 250g)</p>
                <p className="text-xs font-semibold text-[#2D5016]">{disponivelKgFormatado} kg</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5DCC8]">
              <p className="text-xs text-[#8B7355]">
                Livre para reservas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#D97706]/5 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#D97706]/10 rounded-lg">
                <Bookmark className="w-5 h-5 text-[#D97706]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#D97706]">{totalReservadoPacotes250g}</p>
                <p className="text-xs text-[#8B7355]">Reservado (pacotes 250g)</p>
                <p className="text-xs font-semibold text-[#D97706]">{totalReservadoKg.toFixed(2)} kg</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5DCC8]">
              <p className="text-xs text-[#8B7355]">
                {reservasAtivas.length} {reservasAtivas.length === 1 ? 'reserva ativa' : 'reservas ativas'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/5 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C9A961]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#8B7355]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#6B4423]">{clientesComReserva}</p>
                <p className="text-xs text-[#8B7355]">Clientes c/ Reserva</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5DCC8]">
              <p className="text-xs text-[#8B7355]">
                {cafes.length} {cafes.length === 1 ? 'tipo de café' : 'tipos de café'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por café */}
      <Card className="border-[#E5DCC8] bg-white/80">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setShowDetalhes(!showDetalhes)}
            className="w-full flex items-center justify-between hover:bg-[#F5F1E8]"
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#6B4423]" />
              <span className="font-semibold text-[#6B4423]">
                Detalhamento por Café ({cafes.length})
              </span>
            </div>
            {showDetalhes ? (
              <ChevronUp className="w-4 h-4 text-[#8B7355]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8B7355]" />
            )}
          </Button>
          
          {showDetalhes && (
            <div className="mt-4 space-y-2">
              {detalhamentoCafes.map((cafe) => (
                <div
                  key={cafe.id}
                  className="bg-[#F5F1E8] p-3 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[#6B4423]">{cafe.nome}</h4>
                        <Badge variant="outline" className="text-xs">
                          {cafe.forma}
                        </Badge>
                        {cafe.localizacao && (
                          <Badge variant="outline" className="text-xs bg-white">
                            {cafe.localizacao}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2 rounded">
                      <p className="text-[#8B7355] mb-1">Estoque Total</p>
                      <p className="font-bold text-[#6B4423]">
                        {cafe.total_pacotes} pct
                      </p>
                      <p className="text-[#8B7355]">
                        {cafe.total_kg} kg
                      </p>
                    </div>
                    
                    <div className="bg-white p-2 rounded">
                      <p className="text-[#8B7355] mb-1">Disponível</p>
                      <p className="font-bold text-[#2D5016]">
                        {cafe.disponivel_pacotes} pct
                      </p>
                      <p className="text-[#8B7355]">
                        {cafe.disponivel_kg} kg
                      </p>
                    </div>
                    
                    <div className="bg-white p-2 rounded">
                      <p className="text-[#8B7355] mb-1">Reservado</p>
                      <p className="font-bold text-[#D97706]">
                        {cafe.reservado_pacotes} pct
                      </p>
                      <p className="text-[#8B7355]">
                        {cafe.reservado_kg} kg
                      </p>
                    </div>
                  </div>

                  {cafe.disponivel_pacotes <= 0 && (
                    <div className="mt-2 bg-red-50 border border-red-200 p-2 rounded">
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ Sem estoque disponível
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda explicativa */}
      <Card className="border-[#E5DCC8] bg-gradient-to-r from-blue-50 to-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <Coffee className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xs text-blue-900">
              <p className="font-semibold mb-1">💡 Como funciona o estoque:</p>
              <ul className="space-y-1 text-blue-800">
                <li><strong>Estoque Total:</strong> Quantidade física real em armazém (calculado baseado em todas as embalagens)</li>
                <li><strong>Disponível:</strong> Total - Reservado (livre para novas reservas)</li>
                <li><strong>Reservado:</strong> Comprometido com clientes (ainda não entregue)</li>
                <li><strong>⚠️ Importante:</strong> Quando mudar uma reserva para "Entregue", o estoque total diminui automaticamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
