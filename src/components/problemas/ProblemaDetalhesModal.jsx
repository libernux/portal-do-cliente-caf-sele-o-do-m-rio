import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Calendar, User, AlertCircle, Tag, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import AtualizacoesTimeline from "./AtualizacoesTimeline";

const statusConfig = {
  "Aberto": { color: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]", dot: "bg-[#D97706]" },
  "Em Andamento": { color: "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]", dot: "bg-[#C9A961]" },
  "Aguardando": { color: "bg-blue-100 text-blue-800 border-blue-300", dot: "bg-blue-600" },
  "Resolvido": { color: "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]", dot: "bg-[#2D5016]" },
  "Cancelado": { color: "bg-gray-100 text-gray-800 border-gray-300", dot: "bg-gray-600" }
};

const prioridadeConfig = {
  "Baixa": "bg-blue-100 text-blue-800",
  "Média": "bg-[#C9A961]/20 text-[#8B7355]",
  "Alta": "bg-orange-100 text-orange-800",
  "Urgente": "bg-red-100 text-red-800"
};

export default function ProblemaDetalhesModal({ open, onClose, problema, etiquetas, onEdit, onUpdate }) {
  if (!problema) return null;

  const statusStyle = statusConfig[problema.status] || statusConfig["Aberto"];
  const prioridadeStyle = prioridadeConfig[problema.prioridade] || prioridadeConfig["Média"];

  const getEtiqueta = (etiquetaId) => {
    return etiquetas?.find(e => e.id === etiquetaId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Detalhes do Problema
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(problema)}
              className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#6B4423] mb-3">{problema.nome_cliente}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`${statusStyle.color} border`}>
                      <div className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`}></div>
                      {problema.status}
                    </Badge>
                    <Badge className={prioridadeStyle}>
                      {problema.prioridade}
                    </Badge>
                    <Badge variant="outline" className="bg-[#6B4423]/5 text-[#6B4423] border-[#6B4423]/20">
                      {problema.tipo}
                    </Badge>
                    
                    {problema.etiquetas && problema.etiquetas.map(etiquetaId => {
                      const etiqueta = getEtiqueta(etiquetaId);
                      if (!etiqueta) return null;
                      
                      return (
                        <Badge 
                          key={etiquetaId}
                          style={{ 
                            backgroundColor: `${etiqueta.cor}15`,
                            color: etiqueta.cor,
                            borderColor: `${etiqueta.cor}30`
                          }}
                          variant="outline"
                          className="border"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {etiqueta.nome}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#E5DCC8]">
                  {problema.email_cliente && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-[#8B7355]" />
                      <a href={`mailto:${problema.email_cliente}`} className="text-[#6B4423] hover:underline">
                        {problema.email_cliente}
                      </a>
                    </div>
                  )}
                  {problema.telefone_cliente && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-[#8B7355]" />
                      <a href={`tel:${problema.telefone_cliente}`} className="text-[#6B4423] hover:underline">
                        {problema.telefone_cliente}
                      </a>
                    </div>
                  )}
                  {problema.responsavel && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-[#8B7355]" />
                      <span className="text-[#6B4423]">Responsável: {problema.responsavel}</span>
                    </div>
                  )}
                  {problema.data_abertura && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#8B7355]" />
                      <span className="text-[#8B7355]">
                        Aberto em {format(new Date(problema.data_abertura), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5DCC8]">
                  <h4 className="font-semibold text-[#6B4423] mb-2">Descrição do Problema:</h4>
                  <p className="text-[#8B7355] whitespace-pre-wrap">{problema.descricao}</p>
                </div>

                {problema.solucao && (
                  <div className="bg-[#2D5016]/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#2D5016] mb-2">✅ Solução Aplicada:</h4>
                    <p className="text-[#8B7355] whitespace-pre-wrap">{problema.solucao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Atualizações */}
          <AtualizacoesTimeline 
            problemaId={problema.id} 
            problema={problema}
            onUpdate={onUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}