import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, User, Edit, History, Trash2 } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function DemandaExternaCard({ demanda, onEdit, onViewHistory, onDelete, index }) {
  const statusConfig = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Pago": "bg-green-100 text-green-800 border-green-300",
    "Vencido": "bg-red-100 text-red-800 border-red-300",
    "Renegociado": "bg-blue-100 text-blue-800 border-blue-300",
    "Cancelado": "bg-gray-100 text-gray-800 border-gray-300"
  };

  const isVencido = demanda.status === "Pendente" && 
                    demanda.data_vencimento && 
                    isPast(new Date(demanda.data_vencimento)) && 
                    !isToday(new Date(demanda.data_vencimento));

  const venceHoje = demanda.data_vencimento && isToday(new Date(demanda.data_vencimento));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border-[#E5DCC8] hover:shadow-lg transition-shadow ${isVencido ? 'border-red-300 bg-red-50/30' : ''} ${venceHoje ? 'border-orange-300 bg-orange-50/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B7355]" />
              <span className="font-semibold text-[#6B4423]">{demanda.cliente_nome}</span>
            </div>
            <Badge variant="outline" className={statusConfig[demanda.status]}>
              {isVencido ? "Vencido" : demanda.status}
            </Badge>
          </div>

          <p className="text-sm text-[#5A4A3A] mb-3 line-clamp-2">{demanda.descricao}</p>

          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-[#2D5016] font-semibold">
              <DollarSign className="w-4 h-4" />
              R$ {demanda.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 ${isVencido ? 'text-red-600' : venceHoje ? 'text-orange-600' : 'text-[#8B7355]'}`}>
              <Calendar className="w-4 h-4" />
              {demanda.data_vencimento ? format(new Date(demanda.data_vencimento), "dd/MM/yyyy") : "-"}
            </div>
          </div>

          {demanda.forma_pagamento && (
            <p className="text-xs text-[#8B7355] mb-3">
              Pagamento: {demanda.forma_pagamento}
            </p>
          )}

          {demanda.status === "Pago" && demanda.data_pagamento && (
            <p className="text-xs text-green-600 mb-3">
              Pago em: {format(new Date(demanda.data_pagamento), "dd/MM/yyyy")}
            </p>
          )}

          <div className="flex gap-2 pt-2 border-t border-[#E5DCC8]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(demanda)}
              className="flex-1 text-[#6B4423]"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewHistory(demanda)}
              className="flex-1 text-[#8B7355]"
            >
              <History className="w-4 h-4 mr-1" />
              Histórico
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(demanda)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}