import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Coffee,
  Package,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function ReservaChecklistCard({ reserva, itensChecklist, onToggleItem, index }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (percentual) => {
    if (percentual === 100) return "bg-[#2D5016] text-white";
    if (percentual > 0) return "bg-[#D97706] text-white";
    return "bg-[#8B7355] text-white";
  };

  const getStatusText = (percentual) => {
    if (percentual === 100) return "Completo";
    if (percentual > 0) return "Em Andamento";
    return "Pendente";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-[#E5DCC8] hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-[#6B4423] mb-2">
                {reserva.cliente_nome}
              </CardTitle>
              <div className="space-y-1 text-sm text-[#8B7355]">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{reserva.cafe_nome} ({reserva.cafe_forma})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span>{reserva.quantidade_pacotes} × {reserva.embalagem} = {reserva.totalKg} kg</span>
                </div>
                {reserva.data_reserva && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(reserva.data_reserva), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(reserva.percentualConcluido)}>
              {getStatusText(reserva.percentualConcluido)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progresso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#6B4423]">
                Progresso: {reserva.itensConcluidos}/{reserva.totalItens}
              </span>
              <span className="text-sm font-bold text-[#6B4423]">
                {reserva.percentualConcluido}%
              </span>
            </div>
            <Progress 
              value={reserva.percentualConcluido} 
              className="h-2"
            />
          </div>

          {/* Toggle Checklist */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-[#6B4423] hover:bg-[#F5F1E8]"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ocultar Checklist
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver Checklist ({reserva.itensConcluidos}/{reserva.totalItens})
              </>
            )}
          </Button>

          {/* Checklist Items */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2 border-t border-[#E5DCC8]"
            >
              {itensChecklist.map((item) => {
                const checklistItem = reserva.checklistItems.find(
                  c => c.item_checklist_id === item.id
                );
                const concluido = checklistItem?.concluido || false;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F5F1E8] transition-colors"
                  >
                    <Checkbox
                      checked={concluido}
                      onCheckedChange={() =>
                        onToggleItem(
                          reserva.id,
                          item.id,
                          concluido,
                          checklistItem?.id
                        )
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          concluido
                            ? "line-through text-[#8B7355]"
                            : "text-[#6B4423]"
                        }`}
                      >
                        {item.nome}
                      </p>
                      {item.descricao && (
                        <p className="text-xs text-[#8B7355] mt-1">
                          {item.descricao}
                        </p>
                      )}
                      {checklistItem?.data_conclusao && (
                        <p className="text-xs text-[#2D5016] mt-1">
                          ✓ Concluído em{" "}
                          {format(
                            new Date(checklistItem.data_conclusao),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Observações */}
          {reserva.observacoes && (
            <div className="bg-[#F5F1E8] p-3 rounded-lg text-sm text-[#8B7355]">
              <p className="font-medium text-[#6B4423] mb-1">Observações:</p>
              <p>{reserva.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}