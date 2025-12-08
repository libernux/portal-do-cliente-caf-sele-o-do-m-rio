import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, DollarSign, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultadoCotacao({ cotacao }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-[#E5DCC8] hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo e Info */}
            <div className="flex items-center gap-4 flex-1">
              {cotacao.logo && (
                <img 
                  src={cotacao.logo} 
                  alt={cotacao.empresa}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#6B4423]">
                  {cotacao.nome}
                </h3>
                <p className="text-sm text-[#8B7355]">{cotacao.empresa}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-[#8B7355]">
                    <Clock className="w-4 h-4" />
                    <span>{cotacao.prazo_entrega_texto}</span>
                  </div>
                  
                  {cotacao.informacoes_adicionais?.seguro > 0 && (
                    <Badge variant="outline" className="border-[#2D5016] text-[#2D5016]">
                      <Shield className="w-3 h-3 mr-1" />
                      Seguro
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <DollarSign className="w-5 h-5 text-[#2D5016]" />
                <span className="text-3xl font-bold text-[#2D5016]">
                  {cotacao.preco_formatado}
                </span>
              </div>
              <p className="text-xs text-[#8B7355]">valor do frete</p>
            </div>
          </div>

          {/* Informações Adicionais */}
          {(cotacao.informacoes_adicionais?.mao_propria || cotacao.informacoes_adicionais?.aviso_recebimento) && (
            <div className="mt-4 pt-4 border-t border-[#E5DCC8]">
              <div className="flex gap-2">
                {cotacao.informacoes_adicionais.mao_propria && (
                  <Badge variant="outline" className="text-xs">
                    Mão Própria
                  </Badge>
                )}
                {cotacao.informacoes_adicionais.aviso_recebimento && (
                  <Badge variant="outline" className="text-xs">
                    Aviso de Recebimento
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}