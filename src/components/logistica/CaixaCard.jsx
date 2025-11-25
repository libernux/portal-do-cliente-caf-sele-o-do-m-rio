import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, User, Calendar, Truck, Edit, Trash2, Tag } from "lucide-react";
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

export default function CaixaCard({ caixa, onEdit, onDelete }) {
  const statusStyle = statusConfig[caixa.status] || statusConfig["Aguardando Envio"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-lg shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#6B4423]">{caixa.numero_identificacao}</h3>
                <Badge variant="outline" className={`${statusStyle.color} border mt-1`}>
                  <div className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`}></div>
                  {caixa.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(caixa)}
                className="hover:bg-[#6B4423]/10"
              >
                <Edit className="w-4 h-4 text-[#6B4423]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(caixa.id)}
                className="hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#8B7355] mt-0.5" />
            <div className="flex-1">
              <span className="text-[#6B4423] font-medium">{caixa.origem}</span>
              <span className="text-[#8B7355] mx-2">→</span>
              <span className="text-[#6B4423] font-medium">{caixa.destino}</span>
            </div>
          </div>

          {caixa.responsavel && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-[#8B7355]" />
              <span className="text-[#8B7355]">Responsável:</span>
              <span className="text-[#6B4423] font-medium">{caixa.responsavel}</span>
            </div>
          )}

          {caixa.meio_transporte && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-[#8B7355]" />
              <span className="text-[#8B7355]">{caixa.meio_transporte}</span>
            </div>
          )}

          {caixa.tem_etiqueta && caixa.codigo_etiqueta && (
            <div className="flex items-center gap-2 text-sm bg-[#F5F1E8] p-2 rounded-lg">
              <Tag className="w-4 h-4 text-[#6B4423]" />
              <span className="text-[#6B4423] font-mono text-xs">{caixa.codigo_etiqueta}</span>
            </div>
          )}

          {caixa.conteudo && (
            <p className="text-sm text-[#8B7355] pt-2 border-t border-[#E5DCC8]">
              {caixa.conteudo}
            </p>
          )}

          {caixa.data_envio && (
            <div className="flex items-center gap-2 text-xs text-[#8B7355] pt-2">
              <Calendar className="w-3.5 h-3.5" />
              Envio: {format(new Date(caixa.data_envio), "dd/MM/yyyy")}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}