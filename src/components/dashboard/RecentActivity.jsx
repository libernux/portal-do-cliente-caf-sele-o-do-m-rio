import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

export default function RecentActivity({ items, title }) {
  return (
    <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-[#E5DCC8] pb-4">
        <CardTitle className="text-lg font-semibold text-[#6B4423] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#E5DCC8]">
          {items && items.length > 0 ? (
            items.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 hover:bg-[#F5F1E8]/50 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-[#6B4423] mb-1">
                      {item.titulo || item.numero_identificacao || item.nome}
                    </p>
                    <p className="text-sm text-[#8B7355]">
                      {item.descricao || item.conteudo || item.origem}
                    </p>
                  </div>
                  {item.status && (
                    <Badge 
                      variant="outline"
                      className={`
                        ${item.status === 'Entregue' || item.status === 'Resolvido' || item.status === 'Concluído' 
                          ? 'bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]' 
                          : item.status === 'Em Trânsito' || item.status === 'Em Andamento'
                          ? 'bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]'
                          : 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]'}
                      `}
                    >
                      {item.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#A69483] mt-2">
                  {format(new Date(item.created_date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#8B7355]">
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}