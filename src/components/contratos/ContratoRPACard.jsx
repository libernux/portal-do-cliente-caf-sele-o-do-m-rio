import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function ContratoRPACard({ 
  contrato, 
  onEdit, 
  onDelete, 
  onEnviarAssinatura,
  onVerDetalhes,
  onConsultarStatus,
  index 
}) {
  const statusConfig = {
    "Rascunho": {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: FileText
    },
    "Aguardando Assinatura": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock
    },
    "Assinado": {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircle2
    },
    "Cancelado": {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle
    },
    "Expirado": {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: XCircle
    }
  };

  const config = statusConfig[contrato.status] || statusConfig["Rascunho"];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-[#E5DCC8] hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-[#6B4423]">
                  {contrato.numero_contrato}
                </h3>
                <Badge variant="outline" className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {contrato.status}
                </Badge>
              </div>
              <p className="text-sm text-[#8B7355] mb-1">
                <strong>Contratante:</strong> {contrato.contratante_nome}
              </p>
              <p className="text-sm text-[#8B7355]">
                <strong>Tipo:</strong> {contrato.tipo_servico}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#2D5016]">
                R$ {contrato.valor_contrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#8B7355]">
                {format(new Date(contrato.created_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="bg-[#F5F1E8] p-3 rounded-lg mb-4">
            <p className="text-sm text-[#5A4A3A] line-clamp-2">
              {contrato.descricao_servico}
            </p>
          </div>

          {contrato.data_inicio && (
            <div className="flex items-center gap-4 text-sm text-[#8B7355] mb-4">
              <span><strong>Início:</strong> {format(new Date(contrato.data_inicio), "dd/MM/yyyy")}</span>
              {contrato.data_termino && (
                <span><strong>Término:</strong> {format(new Date(contrato.data_termino), "dd/MM/yyyy")}</span>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {contrato.status === "Rascunho" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(contrato)}
                  className="border-[#E5DCC8]"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onEnviarAssinatura(contrato)}
                  className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar p/ Assinatura
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(contrato)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {contrato.status === "Aguardando Assinatura" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConsultarStatus(contrato)}
                  className="border-[#E5DCC8]"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Consultar Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVerDetalhes(contrato)}
                  className="border-[#E5DCC8]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
              </>
            )}

            {contrato.status === "Assinado" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(contrato.autentique_signed_url, '_blank')}
                  className="border-[#2D5016] text-[#2D5016]"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Baixar Assinado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVerDetalhes(contrato)}
                  className="border-[#E5DCC8]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}