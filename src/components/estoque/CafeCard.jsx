import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, MapPin, User, Calendar, Truck, Edit, Trash2, Tag, Package, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusConfig = {
  "Aguardando Envio": {
    color: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]",
    dot: "bg-[#D97706]"
  },
  "Em Trânsito": {
    color: "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    dot: "bg-[#C9A961]"
  },
  "Entregue": {
    color: "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    dot: "bg-[#2D5016]"
  },
  "Problema": {
    color: "bg-red-100 text-red-800 border-red-300",
    dot: "bg-red-600"
  }
};

// Helper function to get package weight in kg
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

export default function CafeCard({ cafe, disponivel, reservas, onEdit, onDelete, onReservar, onEditReserva, onAdicionarEstoque }) {
  // Calcular estoque total baseado no estoque_por_embalagem
  const estoqueDetalhado = cafe.estoque_por_embalagem || {};
  const temEstoqueDetalhado = Object.values(estoqueDetalhado).some(qtd => qtd > 0);
  
  // Calcular o peso total real em kg baseado em todas as embalagens
  const totalKgReal = Object.entries(estoqueDetalhado).reduce((sum, [emb, qtd]) => {
    const pesoEmbalagem = getPesoEmbalagem(emb);
    return sum + (qtd * pesoEmbalagem);
  }, 0);
  
  const totalKg = totalKgReal.toFixed(3);
  const totalPacotes = cafe.quantidade_pacotes || 0; // Este é calculado automaticamente em pacotes equivalentes de 250g
  
  // Calcular total reservado em kg somando todas as embalagens
  const totalReservadoKg = (reservas || []).reduce((sum, r) => {
    const peso = getPesoEmbalagem(r.embalagem || "250g");
    return sum + ((r.quantidade_pacotes || 0) * peso);
  }, 0);
  
  // Calcular disponível em kg
  const disponivelKg = Math.max(0, totalKgReal - totalReservadoKg).toFixed(3);
  const disponivelPacotes = Math.floor(parseFloat(disponivelKg) / 0.25);
  
  const reservadoKg = totalReservadoKg.toFixed(3);
  const reservadoPacotes = Math.ceil(totalReservadoKg / 0.25);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-gradient-to-br from-[#2D5016] to-[#3D6B1F] rounded-xl shadow-md">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-[#6B4423] leading-tight mb-2">{cafe.nome}</h3>
                <Badge
                  variant="outline"
                  className={`${
                    cafe.forma === "Grão"
                      ? 'bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]'
                      : 'bg-[#6B4423]/10 text-[#6B4423] border-[#6B4423]'
                  }`}
                >
                  {cafe.forma}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(cafe)}
                className="hover:bg-[#6B4423]/10"
                title="Editar café"
              >
                <Edit className="w-4 h-4 text-[#6B4423]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(cafe.id)}
                className="hover:bg-red-50"
                title="Excluir café"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cafe.localizacao && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#8B7355] mt-0.5" />
              <div className="flex-1">
                <span className="text-[#6B4423] font-medium">{cafe.localizacao}</span>
              </div>
            </div>
          )}

          {/* Estoque por Embalagem */}
          {temEstoqueDetalhado && (
            <div className="bg-[#F5F1E8] p-3 rounded-lg">
              <p className="text-xs font-semibold text-[#6B4423] mb-2">Estoque por Embalagem:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(estoqueDetalhado).map(([emb, qtd]) => {
                  if (qtd === 0) return null;
                  const pesoEmbalagem = getPesoEmbalagem(emb);
                  const kgEmbalagem = (qtd * pesoEmbalagem).toFixed(3);
                  return (
                    <div key={emb} className="bg-white p-2 rounded text-center">
                      <p className="text-[10px] text-[#8B7355]">{emb}</p>
                      <p className="text-sm font-bold text-[#6B4423]">{qtd}</p>
                      <p className="text-[9px] text-[#8B7355]">{kgEmbalagem}kg</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estoque Total */}
          <div className="bg-gradient-to-r from-[#F5F1E8] to-[#F5F1E8]/50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-[#8B7355] mb-1">Estoque Total</p>
              <p className="text-3xl font-bold text-[#6B4423]">
                {totalKg} <span className="text-base">kg</span>
              </p>
              <p className="text-sm text-[#8B7355] mt-1">≈ {totalPacotes} pacotes de 250g</p>
            </div>
          </div>

          {/* Disponível e Reservado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2D5016]/5 p-3 rounded-lg text-center">
              <p className="text-xs text-[#8B7355] mb-1">Disponível</p>
              <p className="text-xl font-bold text-[#2D5016]">
                {disponivelKg} <span className="text-xs">kg</span>
              </p>
              <p className="text-xs text-[#8B7355]">≈ {disponivelPacotes} pct 250g</p>
            </div>
            <div className="bg-[#D97706]/5 p-3 rounded-lg text-center">
              <p className="text-xs text-[#8B7355] mb-1">Reservado</p>
              <p className="text-xl font-bold text-[#D97706]">
                {reservadoKg} <span className="text-xs">kg</span>
              </p>
              <p className="text-xs text-[#8B7355]">≈ {reservadoPacotes} pct 250g</p>
            </div>
          </div>

          {/* Reservas Ativas */}
          {reservas && reservas.length > 0 && (
            <div className="border-t border-[#E5DCC8] pt-3 space-y-2">
              <p className="text-xs font-semibold text-[#6B4423] flex items-center gap-1">
                <Package className="w-3 h-3" />
                Reservas Ativas ({reservas.length})
              </p>
              {reservas.slice(0, 2).map((reserva) => {
                const kgReserva = (reserva.quantidade_pacotes * getPesoEmbalagem(reserva.embalagem || "250g")).toFixed(3);
                return (
                  <div key={reserva.id} className="flex items-center justify-between text-xs bg-[#F5F1E8] p-2 rounded group/reserva">
                    <div className="flex-1">
                      <span className="text-[#6B4423] font-medium">{reserva.cliente_nome}</span>
                      <span className="text-[#8B7355] ml-1">• {reserva.embalagem || "250g"} • {reserva.quantidade_pacotes} pct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B7355]">{kgReserva} kg</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/reserva:opacity-100 transition-opacity"
                        onClick={() => onEditReserva(reserva)}
                        title="Editar reserva"
                      >
                        <Edit className="w-3 h-3 text-[#6B4423]" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {reservas.length > 2 && (
                <p className="text-xs text-[#8B7355] text-center">
                  +{reservas.length - 2} {reservas.length - 2 === 1 ? 'reserva' : 'reservas'}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => onAdicionarEstoque(cafe)}
              variant="outline"
              className="w-full border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/10"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Estoque
            </Button>
            <Button
              onClick={() => onReservar(cafe)}
              className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
              size="sm"
            >
              <Package className="w-4 h-4 mr-2" />
              Reservar
            </Button>
          </div>

          {cafe.data_entrada && (
            <div className="flex items-center gap-2 text-xs text-[#8B7355] pt-2 border-t border-[#E5DCC8]">
              <Calendar className="w-3.5 h-3.5" />
              Entrada: {format(new Date(cafe.data_entrada), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}