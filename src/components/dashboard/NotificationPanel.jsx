import React, { useState, useEffect } from "react";
import { Problema } from "@/entities/Problema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, MessageSquare, UserPlus, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotificationPanel() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotificacoes();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificacoes = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os problemas com novas atualizações ou novos
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const problemas = await Problema.list("-created_date");
      
      const notifications = [];
      
      // Problemas com novas atualizações
      const comNovasAtualizacoes = problemas.filter(p => p.tem_novas_atualizacoes);
      notifications.push(...comNovasAtualizacoes.map(p => ({
        id: p.id,
        tipo: "nova_interacao",
        problema: p,
        timestamp: p.ultima_interacao_equipe || p.updated_date,
        icon: MessageSquare,
        color: "text-[#2D5016]",
        bgColor: "bg-[#2D5016]/10"
      })));
      
      // Problemas abertos hoje
      const novosProblemas = problemas.filter(p => {
        if (!p.created_date) return false;
        const createdDate = new Date(p.created_date);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === hoje.getTime() && p.status === "Aberto";
      });
      
      notifications.push(...novosProblemas.map(p => ({
        id: p.id,
        tipo: "novo_chamado",
        problema: p,
        timestamp: p.created_date,
        icon: AlertCircle,
        color: "text-[#D97706]",
        bgColor: "bg-[#D97706]/10"
      })));
      
      // Ordenar por timestamp mais recente
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setNotificacoes(notifications.slice(0, 10)); // Mostrar apenas as 10 mais recentes
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
    setIsLoading(false);
  };

  const getTituloNotificacao = (notif) => {
    switch (notif.tipo) {
      case "nova_interacao":
        return "Nova interação do cliente";
      case "novo_chamado":
        return "Novo chamado aberto";
      default:
        return "Notificação";
    }
  };

  const getDescricaoNotificacao = (notif) => {
    const p = notif.problema;
    switch (notif.tipo) {
      case "nova_interacao":
        return `${p.nome_cliente} respondeu ao chamado`;
      case "novo_chamado":
        return `${p.nome_cliente} - ${p.tipo}`;
      default:
        return "";
    }
  };

  return (
    <Card className="border-[#E5DCC8] bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-[#E5DCC8] pb-4">
        <CardTitle className="text-lg font-semibold text-[#6B4423] flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
          {notificacoes.length > 0 && (
            <Badge className="bg-[#D97706] text-white ml-auto">
              {notificacoes.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#E5DCC8] max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
            </div>
          ) : notificacoes.length > 0 ? (
            notificacoes.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={`${notif.id}-${notif.tipo}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={createPageUrl("Problemas")}
                    className="block p-4 hover:bg-[#F5F1E8]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${notif.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${notif.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#6B4423] text-sm">
                          {getTituloNotificacao(notif)}
                        </p>
                        <p className="text-sm text-[#8B7355] truncate">
                          {getDescricaoNotificacao(notif)}
                        </p>
                        <p className="text-xs text-[#A69483] mt-1">
                          {format(new Date(notif.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {notif.tipo === "nova_interacao" && (
                        <div className="w-2 h-2 bg-[#2D5016] rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#8B7355]">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma notificação nova</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}