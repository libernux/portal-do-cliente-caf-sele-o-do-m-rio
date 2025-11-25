import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Coffee, Calendar, Edit, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReservasTab({ reservas, clientes, cafes, onEditReserva, onDeleteReserva, onMarcarComoEntregue }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1,
    };
    return pesos[embalagem] || 0.25;
  };

  // Agrupar reservas por cliente e data
  const reservasAgrupadas = reservas.reduce((acc, reserva) => {
    const key = `${reserva.cliente_id}_${reserva.data_reserva}`;
    if (!acc[key]) {
      acc[key] = {
        cliente_id: reserva.cliente_id,
        cliente_nome: reserva.cliente_nome,
        data_reserva: reserva.data_reserva,
        status: reserva.status,
        observacoes: reserva.observacoes,
        data_entrega: reserva.data_entrega,
        cafes: []
      };
    }
    acc[key].cafes.push({
      id: reserva.id,
      cafe_id: reserva.cafe_id,
      cafe_nome: reserva.cafe_nome,
      cafe_forma: reserva.cafe_forma,
      quantidade_pacotes: reserva.quantidade_pacotes,
      embalagem: reserva.embalagem || "250g"
    });
    return acc;
  }, {});

  const grupos = Object.values(reservasAgrupadas);

  // Filtrar grupos
  const filteredGrupos = grupos.filter(grupo => {
    const statusMatch = statusFilter === "all" || grupo.status === statusFilter;
    const searchMatch = !searchTerm ||
      grupo.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo.cafes.some(c => c.cafe_nome.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const statusColors = {
    "Ativa": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Entregue": "bg-blue-100 text-blue-800 border-blue-300",
    "Cancelada": "bg-red-100 text-red-800 border-red-300"
  };

  const getTotalPacotes = (cafes) => {
    return cafes.reduce((sum, c) => sum + c.quantidade_pacotes, 0);
  };

  const getTotalKg = (cafes) => {
    return cafes.reduce((sum, c) => {
      const peso = getPesoEmbalagem(c.embalagem || "250g");
      return sum + (c.quantidade_pacotes * peso);
    }, 0).toFixed(3);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E5DCC8] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
              <Input
                placeholder="Buscar por cliente ou café..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5DCC8]"
              />
            </div>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-[#E5DCC8]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativa">Ativas</SelectItem>
                <SelectItem value="Entregue">Entregues</SelectItem>
                <SelectItem value="Cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredGrupos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGrupos.map((grupo, index) => {
            const totalPacotes = getTotalPacotes(grupo.cafes);
            const totalKg = getTotalKg(grupo.cafes);

            return (
              <motion.div
                key={`${grupo.cliente_id}_${grupo.data_reserva}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#B8935A] rounded-full flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[#6B4423]">
                            {grupo.cliente_nome}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-[#8B7355] mt-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(grupo.data_reserva), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[grupo.status]}>
                        {grupo.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="bg-gradient-to-r from-[#F5F1E8] to-[#F5F1E8]/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8B7355]">Total Reservado:</span>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#6B4423]">
                            {totalKg} kg
                          </p>
                          <p className="text-xs text-[#8B7355]">{totalPacotes} pacotes</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#6B4423] flex items-center gap-1">
                        <Coffee className="w-3 h-3" />
                        Cafés ({grupo.cafes.length})
                      </p>
                      {grupo.cafes.map((cafe) => {
                        const kgCafe = (cafe.quantidade_pacotes * getPesoEmbalagem(cafe.embalagem || "250g")).toFixed(3);
                        return (
                          <div key={cafe.id} className="flex items-center justify-between text-xs bg-[#F5F1E8] p-2 rounded">
                            <div className="flex-1">
                              <span className="text-[#6B4423] font-medium">
                                {cafe.cafe_nome} ({cafe.cafe_forma})
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-white text-[10px] px-1.5 py-0.5">
                                  {cafe.embalagem || "250g"}
                                  {(cafe.embalagem === "10g" || cafe.embalagem === "18g") && " (Drip)"}
                                </Badge>
                                <span className="text-[#8B7355]">
                                  {cafe.quantidade_pacotes} {cafe.quantidade_pacotes === 1 ? 'pacote' : 'pacotes'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#6B4423] font-bold">
                                {kgCafe} kg
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {grupo.observacoes && (
                      <div className="text-xs text-[#8B7355] bg-[#F5F1E8] p-2 rounded">
                        <strong>Obs:</strong> {grupo.observacoes}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2 border-t border-[#E5DCC8]">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditReserva(grupo)}
                          className="flex-1 border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        {grupo.status === "Ativa" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteReserva(grupo)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {grupo.status === "Ativa" && (
                        <Button
                          onClick={() => onMarcarComoEntregue(grupo)}
                          className="w-full bg-[#2D5016] hover:bg-[#1F3A0F] text-white"
                          size="sm"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Marcar como Entregue
                        </Button>
                      )}

                      {grupo.status === "Entregue" && grupo.data_entrega && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                          <p className="text-xs text-green-800">
                            ✅ Entregue em {new Date(grupo.data_entrega).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E5DCC8]">
          <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
          <p className="text-[#8B7355] text-lg">Nenhuma reserva encontrada</p>
        </div>
      )}
    </div>
  );
}