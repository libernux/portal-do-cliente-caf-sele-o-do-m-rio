import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusConfig = {
  "Agendado": "bg-[#D97706]/10 text-[#D97706] border-[#D97706]",
  "Confirmado": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
  "Em Andamento": "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
  "Concluído": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
  "Cancelado": "bg-gray-100 text-gray-800 border-gray-300"
};

const tipoConfig = {
  "Reunião": "bg-blue-100 text-blue-800",
  "Visita Cliente": "bg-purple-100 text-purple-800",
  "Fornecedor": "bg-green-100 text-green-800",
  "Evento": "bg-pink-100 text-pink-800",
  "Degustação": "bg-[#6B4423]/10 text-[#6B4423]",
  "Treinamento": "bg-orange-100 text-orange-800",
  "Outro": "bg-gray-100 text-gray-800"
};

export default function AgendamentoCard({ agendamento, onEdit, onDelete, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="font-bold text-[#6B4423] flex-1">{agendamento.titulo}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(agendamento)}
                  >
                    <Edit className="w-3.5 h-3.5 text-[#6B4423]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDelete(agendamento.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={`${statusConfig[agendamento.status]} border`}>
                  {agendamento.status}
                </Badge>
                {agendamento.tipo && (
                  <Badge className={tipoConfig[agendamento.tipo]}>
                    {agendamento.tipo}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#8B7355]">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(agendamento.data_inicio), "HH:mm")} - {format(new Date(agendamento.data_fim), "HH:mm")}
                  </span>
                </div>

                {!compact && (
                  <>
                    {agendamento.local && (
                      <div className="flex items-center gap-2 text-[#8B7355]">
                        <MapPin className="w-4 h-4" />
                        <span>{agendamento.local}</span>
                      </div>
                    )}

                    {agendamento.participantes && agendamento.participantes.length > 0 && (
                      <div className="flex items-center gap-2 text-[#8B7355]">
                        <Users className="w-4 h-4" />
                        <span>{agendamento.participantes.join(", ")}</span>
                      </div>
                    )}

                    {agendamento.descricao && (
                      <p className="text-[#8B7355] pt-2 border-t border-[#E5DCC8]">
                        {agendamento.descricao}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}