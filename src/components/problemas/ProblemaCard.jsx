import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, Calendar, Edit, Trash2, Clock, Mail, Phone, Tag, Eye, MessageSquare } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusConfig = {
  "Aberto": {
    color: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]",
    dot: "bg-[#D97706]"
  },
  "Em Andamento": {
    color: "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    dot: "bg-[#C9A961]"
  },
  "Aguardando": {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-600"
  },
  "Resolvido": {
    color: "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    dot: "bg-[#2D5016]"
  },
  "Cancelado": {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    dot: "bg-gray-600"
  }
};

const prioridadeConfig = {
  "Baixa": "bg-blue-100 text-blue-800",
  "Média": "bg-[#C9A961]/20 text-[#8B7355]",
  "Alta": "bg-orange-100 text-orange-800",
  "Urgente": "bg-red-100 text-red-800"
};

export default function ProblemaCard({ problema, etiquetas, onEdit, onDelete, onViewDetails }) {
  const statusStyle = statusConfig[problema.status] || statusConfig["Aberto"];
  const prioridadeStyle = prioridadeConfig[problema.prioridade] || prioridadeConfig["Média"];

  const diasAberto = problema.data_abertura 
    ? differenceInDays(new Date(), new Date(problema.data_abertura))
    : 0;

  const getEtiqueta = (etiquetaId) => {
    return etiquetas?.find(e => e.id === etiquetaId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-[#E5DCC8] bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group relative ${
        problema.tem_novas_atualizacoes ? 'ring-2 ring-[#2D5016] ring-offset-2' : ''
      }`}>
        {/* Indicador de Nova Interação */}
        {problema.tem_novas_atualizacoes && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="relative">
              <div className="w-6 h-6 bg-[#2D5016] rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <div className="absolute inset-0 bg-[#2D5016] rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-[#D97706] to-[#EA580C] rounded-lg shadow-md mt-1">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-[#6B4423]">{problema.nome_cliente}</h3>
                  {problema.tem_novas_atualizacoes && (
                    <Badge className="bg-[#2D5016] text-white text-xs animate-pulse">
                      Nova Interação
                    </Badge>
                  )}
                </div>
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
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(problema)}
                  className="hover:bg-[#6B4423]/10"
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4 text-[#6B4423]" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(problema)}
                className="hover:bg-[#6B4423]/10"
              >
                <Edit className="w-4 h-4 text-[#6B4423]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(problema.id)}
                className="hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Informações de Contato */}
          <div className="space-y-2 pb-3 border-b border-[#E5DCC8]">
            {problema.email_cliente && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#8B7355]" />
                <a 
                  href={`mailto:${problema.email_cliente}`}
                  className="text-[#6B4423] hover:underline"
                >
                  {problema.email_cliente}
                </a>
              </div>
            )}
            {problema.telefone_cliente && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#8B7355]" />
                <a 
                  href={`tel:${problema.telefone_cliente}`}
                  className="text-[#6B4423] hover:underline"
                >
                  {problema.telefone_cliente}
                </a>
              </div>
            )}
          </div>

          {/* Descrição do Chamado */}
          <div>
            <p className="text-sm font-medium text-[#6B4423] mb-1">Chamado:</p>
            <p className="text-[#8B7355]">{problema.descricao}</p>
          </div>

          {/* Última Interação da Equipe */}
          {problema.ultima_interacao_equipe && (
            <div className="bg-[#2D5016]/5 p-2 rounded-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2D5016]" />
              <span className="text-sm text-[#2D5016] font-medium">
                Última interação: {format(new Date(problema.ultima_interacao_equipe), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E5DCC8]">
            {problema.responsavel && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[#8B7355]" />
                <span className="text-[#8B7355]">Responsável:</span>
                <span className="text-[#6B4423] font-medium">{problema.responsavel}</span>
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

            {diasAberto > 0 && problema.status !== "Resolvido" && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span className="text-[#D97706] font-medium">
                  {diasAberto} {diasAberto === 1 ? 'dia' : 'dias'} em aberto
                </span>
              </div>
            )}
          </div>

          {/* Solução */}
          {problema.solucao && (
            <div className="bg-[#2D5016]/5 p-3 rounded-lg mt-3">
              <p className="text-sm font-medium text-[#2D5016] mb-1">Solução:</p>
              <p className="text-sm text-[#8B7355]">{problema.solucao}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}