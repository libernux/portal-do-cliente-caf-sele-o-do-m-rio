import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Package, Edit, Trash2, Truck } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function EntregaCard({ entrega, onEdit, onDelete, index }) {
  const statusConfig = {
    "Programada": "bg-blue-100 text-blue-800 border-blue-300",
    "Em Preparação": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Enviada": "bg-purple-100 text-purple-800 border-purple-300",
    "Entregue": "bg-green-100 text-green-800 border-green-300",
    "Cancelada": "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-[#E5DCC8] hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B7355]" />
              <span className="font-semibold text-[#6B4423]">{entrega.assinante_nome}</span>
            </div>
            <Badge variant="outline" className={statusConfig[entrega.status]}>
              {entrega.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-[#8B7355]">
              <Calendar className="w-3 h-3" />
              Programada: {format(new Date(entrega.data_programada), "dd/MM/yyyy")}
            </div>
            {entrega.data_entrega && (
              <div className="flex items-center gap-2 text-green-600">
                <Package className="w-3 h-3" />
                Entregue: {format(new Date(entrega.data_entrega), "dd/MM/yyyy")}
              </div>
            )}
          </div>

          {entrega.cafes_entregues && entrega.cafes_entregues.length > 0 && (
            <div className="bg-[#F5F1E8] p-2 rounded-lg mb-3">
              <p className="text-xs font-medium text-[#6B4423] mb-1">Cafés:</p>
              {entrega.cafes_entregues.map((cafe, idx) => (
                <p key={idx} className="text-xs text-[#8B7355]">
                  • {cafe.cafe_nome} - {cafe.quantidade}x ({cafe.moagem || "N/A"})
                </p>
              ))}
            </div>
          )}

          {entrega.codigo_rastreamento && (
            <div className="flex items-center gap-2 text-xs text-purple-600 mb-3">
              <Truck className="w-3 h-3" />
              {entrega.codigo_rastreamento}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-[#E5DCC8]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entrega)}
              className="flex-1 text-[#6B4423]"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entrega)}
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