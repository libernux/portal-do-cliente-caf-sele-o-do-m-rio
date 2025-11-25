import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function ProblemaStats({ problemas }) {
  const abertos = problemas.filter(p => p.status === "Aberto" || p.status === "Em Andamento" || p.status === "Aguardando").length;
  const resolvidos = problemas.filter(p => p.status === "Resolvido").length;
  const urgentes = problemas.filter(p => p.prioridade === "Urgente" && p.status !== "Resolvido").length;

  const problemasResolvidos = problemas.filter(p => p.status === "Resolvido" && p.data_abertura && p.data_resolucao);
  const tempoMedio = problemasResolvidos.length > 0
    ? problemasResolvidos.reduce((sum, p) => {
        return sum + differenceInDays(new Date(p.data_resolucao), new Date(p.data_abertura));
      }, 0) / problemasResolvidos.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#D97706]/5 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D97706]/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{abertos}</p>
              <p className="text-xs text-[#8B7355]">Problemas Abertos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5DCC8] bg-gradient-to-br from-red-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{urgentes}</p>
              <p className="text-xs text-[#8B7355]">Urgentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#2D5016]/5 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2D5016]/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#2D5016]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{resolvidos}</p>
              <p className="text-xs text-[#8B7355]">Resolvidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/5 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C9A961]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#8B7355]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{tempoMedio.toFixed(0)}</p>
              <p className="text-xs text-[#8B7355]">Dias (média resolução)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}