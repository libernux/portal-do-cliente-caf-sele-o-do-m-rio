import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Package, CheckCircle2, Circle, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function ClienteChecklistCard({ cliente, itensChecklist, onToggleItem, index }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (percentual) => {
    if (percentual === 100) return "bg-[#2D5016] text-white";
    if (percentual >= 50) return "bg-[#D97706] text-white";
    return "bg-red-500 text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#B8935A] rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#6B4423]">{cliente.nome}</h3>
                {cliente.email && (
                  <p className="text-xs text-[#8B7355]">{cliente.email}</p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(cliente.percentualConcluido)}>
              {cliente.percentualConcluido}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progresso Visual */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#8B7355]">
              <span>{cliente.itensConcluidos} de {cliente.totalItens} concluídos</span>
            </div>
            <div className="w-full bg-[#F5F1E8] rounded-full h-2">
              <div
                className="bg-[#2D5016] h-2 rounded-full transition-all duration-300"
                style={{ width: `${cliente.percentualConcluido}%` }}
              />
            </div>
          </div>

          {/* Info de Reservas */}
          {cliente.numReservas > 0 && (
            <div className="bg-[#F5F1E8] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D97706]" />
                  <span className="text-sm font-medium text-[#6B4423]">
                    {cliente.numReservas} {cliente.numReservas === 1 ? 'reserva ativa' : 'reservas ativas'}
                  </span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {cliente.totalKgReservado} kg
                </Badge>
              </div>
            </div>
          )}

          {/* Checklist Items */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between hover:bg-[#F5F1E8] text-[#6B4423]"
            >
              <span className="font-semibold">Checklist</span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expanded && (
              <div className="space-y-2 pt-2">
                {itensChecklist.map(item => {
                  const checklistItem = cliente.checklistItems.find(
                    c => c.item_checklist_id === item.id
                  );
                  const concluido = checklistItem?.concluido || false;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        concluido ? 'bg-[#2D5016]/10' : 'bg-[#F5F1E8]'
                      }`}
                    >
                      <Checkbox
                        checked={concluido}
                        onCheckedChange={() =>
                          onToggleItem(
                            cliente.id,
                            item.id,
                            concluido,
                            checklistItem?.id
                          )
                        }
                        className="border-[#6B4423]"
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            concluido
                              ? 'text-[#2D5016] line-through'
                              : 'text-[#6B4423]'
                          }`}
                        >
                          {item.nome}
                        </p>
                        {concluido && checklistItem?.data_conclusao && (
                          <p className="text-xs text-[#8B7355]">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {format(new Date(checklistItem.data_conclusao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      {concluido && (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5016]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}