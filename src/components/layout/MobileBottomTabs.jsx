import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Package,
  Coffee,
  AlertCircle,
  Menu,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Itens principais para bottom tabs (máximo 5)
const mainTabItems = [
  { title: "Home", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Logística", url: createPageUrl("Logistica"), icon: Package },
  { title: "Estoque", url: createPageUrl("Estoque"), icon: Coffee },
  { title: "Chamados", url: createPageUrl("Problemas"), icon: AlertCircle },
];

// Itens adicionais no menu "Mais"
const moreItems = [
  { title: "Tarefas", url: createPageUrl("Tarefas") },
  { title: "A Receber", url: createPageUrl("AReceber") },
  { title: "Links Clientes", url: createPageUrl("LinksClientes") },
  { title: "Solicitações Café", url: createPageUrl("SolicitacoesCafe") },
  { title: "Calculadora Eventos", url: createPageUrl("CalculadoraEventos") },
  { title: "Clube Assinatura", url: createPageUrl("ClubeAssinatura") },
  { title: "Cotação de Frete", url: createPageUrl("CotacaoFrete") },
  { title: "Integração Yampi", url: createPageUrl("IntegracaoYampi") },
  { title: "Contratos RPA", url: createPageUrl("ContratosRPA") },
  { title: "Agenda", url: createPageUrl("Agenda") },
  { title: "Relatórios", url: createPageUrl("Relatorios") },
  { title: "Usuários", url: createPageUrl("Usuarios") },
  { title: "Configurações", url: createPageUrl("Configuracoes") },
];

export default function MobileBottomTabs() {
  const location = useLocation();

  const isMoreActive = moreItems.some(item => location.pathname === item.url);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-[#E5DCC8] dark:border-gray-700 pb-safe select-none">
      <div className="flex items-center justify-around h-16 select-none">
        {mainTabItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors select-none ${
                isActive 
                  ? 'text-[#6B4423] dark:text-[#C9A961]' 
                  : 'text-[#8B7355] dark:text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{item.title}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-[#6B4423] dark:bg-[#C9A961] rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Menu "Mais" */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors select-none ${
                isMoreActive 
                  ? 'text-[#6B4423] dark:text-[#C9A961]' 
                  : 'text-[#8B7355] dark:text-gray-400'
              }`}
            >
              <MoreHorizontal className={`w-5 h-5 mb-1 ${isMoreActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 mb-2 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border-[#E5DCC8] dark:border-gray-700"
          >
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <Link 
                  to={item.url}
                  className={`w-full ${
                    location.pathname === item.url 
                      ? 'bg-[#6B4423]/10 text-[#6B4423] dark:bg-[#C9A961]/10 dark:text-[#C9A961]' 
                      : 'dark:text-gray-200'
                  }`}
                >
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}