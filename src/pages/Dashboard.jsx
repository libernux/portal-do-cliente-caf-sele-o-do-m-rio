import React, { useState, useEffect } from "react";
import { Caixa } from "@/entities/Caixa";
import { Cafe } from "@/entities/Cafe";
import { Problema } from "@/entities/Problema";
import { Agendamento } from "@/entities/Agendamento";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";
import { Package, Coffee, AlertCircle, Calendar, TrendingUp } from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import NotificationPanel from "../components/dashboard/NotificationPanel";
import SolicitacoesEventos from "../components/dashboard/SolicitacoesEventos";

export default function Dashboard() {
  const [caixas, setCaixas] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [caixasData, cafesData, problemasData, agendamentosData, solicitacoesData] = await Promise.all([
        Caixa.list("-created_date"),
        Cafe.list("-created_date"),
        Problema.list("-created_date"),
        Agendamento.list("-data_inicio"),
        SolicitacaoEvento.list("-created_date")
      ]);
      
      setCaixas(caixasData);
      setCafes(cafesData);
      setProblemas(problemasData);
      setAgendamentos(agendamentosData);
      setSolicitacoes(solicitacoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const getPesoEmbalagem = (embalagem) => {
    const pesos = {
      "10g": 0.01,
      "18g": 0.018,
      "100g": 0.1,
      "250g": 0.25,
      "500g": 0.5,
      "1kg": 1
    };
    return pesos[embalagem] || 0.25;
  };

  // Calcular estoque total real em kg baseado no estoque_por_embalagem
  const estoqueTotal = cafes.reduce((sum, cafe) => {
    const estoqueDetalhado = cafe.estoque_por_embalagem || {};
    const kgCafe = Object.entries(estoqueDetalhado).reduce((sumCafe, [emb, qtd]) => {
      const pesoEmbalagem = getPesoEmbalagem(emb);
      return sumCafe + (qtd * pesoEmbalagem);
    }, 0);
    return sum + kgCafe;
  }, 0);

  const caixasEmTransito = caixas.filter(c => c.status === "Em Trânsito").length;
  const problemasAbertos = problemas.filter(p => p.status !== "Resolvido" && p.status !== "Cancelado").length;
  const proximosAgendamentos = agendamentos.filter(a => 
    new Date(a.data_inicio) > new Date() && a.status !== "Cancelado"
  ).length;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2">
            Dashboard Operacional
          </h1>
          <p className="text-[#8B7355]">
            Visão geral da operação Café Seleção do Mário
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Caixas em Trânsito"
            value={caixasEmTransito}
            icon={Package}
            gradient="bg-gradient-to-br from-[#6B4423] to-[#8B5A2B]"
            subtext={`de ${caixas.length} total`}
          />
          <StatsCard
            title="Estoque Total"
            value={`${estoqueTotal.toFixed(1)} kg`}
            icon={Coffee}
            gradient="bg-gradient-to-br from-[#2D5016] to-[#3D6B1F]"
            subtext={`${cafes.length} tipos de café`}
          />
          <StatsCard
            title="Chamados Abertos"
            value={problemasAbertos}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-[#D97706] to-[#EA580C]"
            subtext={`de ${problemas.length} total`}
          />
          <StatsCard
            title="Próximos Agendamentos"
            value={proximosAgendamentos}
            icon={Calendar}
            gradient="bg-gradient-to-br from-[#C9A961] to-[#B8935A]"
            subtext="nos próximos dias"
          />
        </div>

        {/* Solicitações de Eventos */}
        <div className="mb-8">
          <SolicitacoesEventos 
            solicitacoes={solicitacoes} 
            onUpdate={loadData}
          />
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity
              title="Atividade Recente - Logística"
              items={caixas}
            />
          </div>
          <div>
            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  );
}