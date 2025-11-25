import React, { useState, useEffect } from "react";
import { HistoricoDemanda } from "@/entities/HistoricoDemanda";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, DollarSign, Calendar, User, FileText, ArrowRight } from "lucide-react";

export default function HistoricoDemandaModal({ open, onClose, demanda }) {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && demanda) {
      loadHistorico();
    }
  }, [open, demanda]);

  const loadHistorico = async () => {
    setIsLoading(true);
    const data = await HistoricoDemanda.filter({ demanda_id: demanda.id }, "-created_date");
    setHistorico(data);
    setIsLoading(false);
  };

  const tipoConfig = {
    "Criação": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    "Alteração Data": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    "Renegociação": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
    "Pagamento": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
    "Cancelamento": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    "Observação": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#6B4423]">
            Histórico de Alterações
          </DialogTitle>
          {demanda && (
            <p className="text-sm text-[#8B7355]">
              {demanda.cliente_nome} - {demanda.descricao}
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : historico.length === 0 ? (
          <div className="text-center py-8 text-[#8B7355]">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum histórico encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historico.map((item, index) => {
              const config = tipoConfig[item.tipo_alteracao] || tipoConfig["Observação"];
              
              return (
                <div key={item.id} className="relative">
                  {index < historico.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[#E5DCC8]" />
                  )}
                  
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Clock className={`w-4 h-4 ${config.text}`} />
                    </div>
                    
                    <div className="flex-1 bg-white border border-[#E5DCC8] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border}`}>
                          {item.tipo_alteracao}
                        </Badge>
                        <span className="text-xs text-[#8B7355]">
                          {format(new Date(item.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      <p className="text-sm text-[#5A4A3A] mb-2">{item.descricao}</p>

                      {item.valor_anterior !== null && item.valor_novo !== null && (
                        <div className="flex items-center gap-2 text-xs bg-[#F5F1E8] p-2 rounded mb-2">
                          <DollarSign className="w-3 h-3 text-[#8B7355]" />
                          <span className="text-red-600 line-through">
                            R$ {item.valor_anterior?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#8B7355]" />
                          <span className="text-green-600 font-medium">
                            R$ {item.valor_novo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      {item.data_anterior && item.data_nova && (
                        <div className="flex items-center gap-2 text-xs bg-[#F5F1E8] p-2 rounded mb-2">
                          <Calendar className="w-3 h-3 text-[#8B7355]" />
                          <span className="text-red-600 line-through">
                            {format(new Date(item.data_anterior), "dd/MM/yyyy")}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#8B7355]" />
                          <span className="text-green-600 font-medium">
                            {format(new Date(item.data_nova), "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}

                      {item.status_anterior && item.status_novo && (
                        <div className="flex items-center gap-2 text-xs bg-[#F5F1E8] p-2 rounded mb-2">
                          <span className="text-[#8B7355]">Status:</span>
                          <span className="text-red-600">{item.status_anterior}</span>
                          <ArrowRight className="w-3 h-3 text-[#8B7355]" />
                          <span className="text-green-600 font-medium">{item.status_novo}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-[#8B7355]">
                        <User className="w-3 h-3" />
                        {item.autor}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}