import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Package,
  Coffee,
  AlertCircle,
  Calendar,
  Users,
  Bell,
  Menu,
  LogOut,
  Settings,
  Link as LinkIcon,
  FileText,
  Calculator,
  DollarSign,
  Info
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/entities/User";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Tarefas",
    url: createPageUrl("Tarefas"),
    icon: LayoutDashboard,
  },
  {
    title: "Logística",
    url: createPageUrl("Logistica"),
    icon: Package,
  },
  {
    title: "Estoque",
    url: createPageUrl("Estoque"),
    icon: Coffee,
  },
  {
    title: "A Receber",
    url: createPageUrl("AReceber"),
    icon: DollarSign,
  },
  {
    title: "Links Clientes",
    url: createPageUrl("LinksClientes"),
    icon: LinkIcon,
  },
  {
    title: "Informações Cafés",
    url: createPageUrl("GerenciarInfosCafe"),
    icon: Info,
  },
  {
    title: "Submissões Produtores",
    url: createPageUrl("GerenciarSubmissoes"),
    icon: Coffee,
  },
  {
    title: "Solicitações Café",
    url: createPageUrl("SolicitacoesCafe"),
    icon: FileText,
  },
  {
    title: "Calculadora Eventos",
    url: createPageUrl("CalculadoraEventos"),
    icon: Coffee,
  },
  {
    title: "Calculadora Agridrones",
    url: createPageUrl("CalculadoraAgridrones"),
    icon: Calculator,
  },
  {
    title: "Calculadora Fornecedores",
    url: createPageUrl("CalculadoraFornecedores"),
    icon: Calculator,
  },
  {
    title: "Chamados",
    url: createPageUrl("Problemas"),
    icon: AlertCircle,
  },
  {
    title: "Agenda",
    url: createPageUrl("Agenda"),
    icon: Calendar,
  },
  {
    title: "Relatórios",
    url: createPageUrl("Relatorios"),
    icon: FileText,
  },
  {
    title: "Usuários",
    url: createPageUrl("Usuarios"),
    icon: Users,
  },
  {
    title: "Configurações",
    url: createPageUrl("Configuracoes"),
    icon: Settings,
  },
];

// Páginas públicas que não precisam de autenticação
const publicPages = ["PortalCliente", "ReservaPublica", "SolicitarPatrocinio", "TabelaPrivateLabel", "Privacy", "Support", "FormularioProdutor", "InfoCafePublico"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        
        // Se não está autenticado e não é página pública, redirecionar para login
        if (!publicPages.includes(currentPageName)) {
          await User.loginWithRedirect(window.location.href);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [currentPageName]);

  const handleLogout = async () => {
    await User.logout();
  };

  // Se for página pública, não mostrar o menu
  if (publicPages.includes(currentPageName)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white">
        <style>{`
          :root {
            --cafe-brown: #6B4423;
            --cafe-green: #2D5016;
            --cafe-gold: #C9A961;
            --cafe-cream: #F5F1E8;
          }
        `}</style>
        {children}
      </div>
    );
  }

  // Se está carregando, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto mb-4"></div>
          <p className="text-[#8B7355]">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado (e já tentou carregar), não renderizar nada
  // pois o useEffect já redirecionou para login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --cafe-brown: #6B4423;
          --cafe-green: #2D5016;
          --cafe-gold: #C9A961;
          --cafe-cream: #F5F1E8;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#F5F1E8] to-white">
        <Sidebar className="border-r border-[#E5DCC8]">
          <SidebarHeader className="border-b border-[#E5DCC8] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-md">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-[#6B4423]">Café Seleção</h2>
                <p className="text-xs text-[#8B7355]">do Mário</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider px-3 py-2">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-[#6B4423]/10 hover:text-[#6B4423] transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-[#6B4423]/15 text-[#6B4423] font-semibold shadow-sm' 
                            : 'text-[#5A4A3A]'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-[#E5DCC8] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#C9A961] to-[#B8935A] rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#6B4423] truncate">
                    {user?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-[#8B7355] truncate">
                    {user?.email || 'Carregando...'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#6B4423]/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-[#8B7355]" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-[#E5DCC8] px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-[#6B4423]/10 p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5 text-[#6B4423]" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#6B4423]" />
                <h1 className="text-lg font-bold text-[#6B4423]">Café Seleção do Mário</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}