import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Package, Edit, Trash2, Copy, Plus, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function AssinanteCard({ assinante, entregas, onEdit, onDelete, onNovaEntrega, onCopyLink, index }) {
  const statusConfig = {
    "Ativo": "bg-green-100 text-green-800 border-green-300",
    "Pausado": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Cancelado": "bg-red-100 text-red-800 border-red-300"
  };

  const entregasRealizadas = entregas.filter(e => e.status === "Entregue").length;
  const entregasPendentes = entregas.filter(e => e.status !== "Entregue" && e.status !== "Cancelada").length;

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
              <span className="font-semibold text-[#6B4423]">{assinante.nome}</span>
            </div>
            <Badge variant="outline" className={statusConfig[assinante.status]}>
              {assinante.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-[#8B7355]">
              <Mail className="w-3 h-3" />
              {assinante.email}
            </div>
            {assinante.telefone && (
              <div className="flex items-center gap-2 text-[#8B7355]">
                <Phone className="w-3 h-3" />
                {assinante.telefone}
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-3">
            <Badge variant="outline" className="bg-[#F5F1E8] text-[#6B4423] border-[#E5DCC8]">
              {assinante.plano}
            </Badge>
            <Badge variant="outline" className="bg-[#F5F1E8] text-[#6B4423] border-[#E5DCC8]">
              {assinante.quantidade_pacotes} pacote(s)
            </Badge>
          </div>

          {assinante.moagem_preferida && (
            <p className="text-xs text-[#8B7355] mb-2">
              Moagem: {assinante.moagem_preferida}
            </p>
          )}

          <div className="flex gap-4 text-xs text-[#8B7355] mb-3 py-2 border-t border-[#E5DCC8]">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-green-600" />
              <span>{entregasRealizadas} entregues</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>{entregasPendentes} pendentes</span>
            </div>
          </div>

          {assinante.data_proxima_entrega && (
            <p className="text-xs text-blue-600 mb-3">
              Próxima: {format(new Date(assinante.data_proxima_entrega), "dd/MM/yyyy")}
            </p>
          )}

          <div className="flex gap-2 pt-2 border-t border-[#E5DCC8]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNovaEntrega(assinante)}
              className="flex-1 text-[#2D5016]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Entrega
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyLink(assinante.slug_acesso)}
              className="text-[#8B7355]"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(assinante)}
              className="text-[#6B4423]"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(assinante)}
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