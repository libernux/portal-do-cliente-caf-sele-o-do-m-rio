import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ListChecks, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { isPast } from "date-fns";

export default function TarefaStats({ tarefas }) {
  const aFazer = tarefas.filter(t => t.status === "A Fazer").length;
  const emAndamento = tarefas.filter(t => t.status === "Em Andamento").length;
  const concluidas = tarefas.filter(t => t.status === "Concluído").length;
  const atrasadas = tarefas.filter(t => 
    t.prazo && isPast(new Date(t.prazo)) && t.status !== "Concluído"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-[#E5DCC8] bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ListChecks className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{aFazer}</p>
              <p className="text-xs text-[#8B7355]">A Fazer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#C9A961]/5 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C9A961]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{emAndamento}</p>
              <p className="text-xs text-[#8B7355]">Em Andamento</p>
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
              <p className="text-2xl font-bold text-[#6B4423]">{concluidas}</p>
              <p className="text-xs text-[#8B7355]">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E5DCC8] bg-gradient-to-br from-red-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#6B4423]">{atrasadas}</p>
              <p className="text-xs text-[#8B7355]">Atrasadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}