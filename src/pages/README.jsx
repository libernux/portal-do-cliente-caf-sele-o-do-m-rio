import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import ReactMarkdown from "react-markdown";

const readmeContent = `
# Café Seleção do Mário - Sistema de Gestão Operacional

## Visão Geral

Sistema completo de gestão operacional para torrefação de cafés especiais, desenvolvido na plataforma **Base44** com **React 18**. Oferece controle total de estoque, logística, clientes, reservas, chamados, agendamentos e integrações externas.

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React + Vite | 18.2.0 |
| Estilização | Tailwind CSS + shadcn/ui | 3.x |
| Backend | Base44 Platform (Deno) | V2 |
| Banco de Dados | Base44 Entities (NoSQL) | - |
| Autenticação | Google OAuth (SSO) | 2.0 |
| Animações | Framer Motion | 11.x |

---

## Estrutura de Diretórios

\`\`\`
📁 projeto/
├── 📁 entities/          # Schemas JSON (22 entidades)
├── 📁 pages/             # Páginas React (28 páginas)
├── 📁 components/        # Componentes reutilizáveis
│   ├── 📁 ui/           # shadcn/ui base
│   ├── 📁 dashboard/    # Widgets dashboard
│   ├── 📁 estoque/      # Componentes estoque
│   ├── 📁 logistica/    # Componentes logísticos
│   ├── 📁 problemas/    # Componentes chamados
│   └── 📁 yampi/        # Integração Yampi
├── 📁 functions/         # Backend (Deno) - 25 funções
├── 📁 agents/            # AI Agents (WhatsApp)
├── Layout.js             # Layout principal
└── globals.css           # Estilos globais
\`\`\`

---

## Entidades Principais (22 total)

### Core
- **Cafe** - Cadastro com estoque por embalagem e localização
- **Caixa** - Movimentação logística entre unidades
- **Cliente** - Cadastro para reservas e vendas
- **ReservaCafe** - Reservas vinculadas a clientes

### Suporte
- **Problema** - Sistema de chamados/tickets
- **AtualizacaoProblema** - Timeline de interações
- **EtiquetaProblema** - Labels coloridos
- **Agendamento** - Compromissos e eventos
- **Tarefa** - Kanban interno

### Integração
- **PedidoYampi** - Pedidos do e-commerce
- **ProdutoYampi** - Produtos sincronizados
- **ClienteYampi** - Clientes da loja
- **ContratoRPA** - Contratos de prestadores
- **SignatarioContrato** - Signatários Autentique
- **AssinanteClube** - Clube de assinatura
- **EntregaClube** - Entregas mensais

### Configuração
- **Responsavel** - Responsáveis por área
- **ConfiguracaoNotificacao** - Preferências
- **ConfiguracaoFrete** - CEPs padrão
- **ClienteSlug** - Links personalizados
- **PrecoCafe** - Preços por cliente

---

## Páginas e Funcionalidades

### Menu Principal

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | /Dashboard | KPIs, estatísticas, atividade recente |
| Tarefas | /Tarefas | Kanban com drag-and-drop |
| Logística | /Logistica | Controle de caixas, scan de etiquetas |
| Estoque | /Estoque | Cafés, reservas, clientes |
| A Receber | /AReceber | Checklist financeiro |
| Links Clientes | /LinksClientes | URLs personalizadas |
| Chamados | /Problemas | Central de atendimento |
| Agenda | /Agenda | Calendário de compromissos |

### Calculadoras

| Página | Rota | Descrição |
|--------|------|-----------|
| Calculadora Eventos | /CalculadoraEventos | Café para eventos/uso interno |
| Calculadora Agridrones | /CalculadoraAgridrones | Cotação produtos |
| Calculadora Fornecedores | /CalculadoraFornecedores | Comparativo preços |

### Integrações

| Página | Rota | Descrição |
|--------|------|-----------|
| Integração Yampi | /IntegracaoYampi | Sync produtos/pedidos |
| Contratos RPA | /ContratosRPA | Assinatura digital |
| Clube Assinatura | /ClubeAssinatura | Gestão assinantes |
| Cotação Frete | /CotacaoFrete | Melhor Envio |

### Páginas Públicas

| Página | Rota | Descrição |
|--------|------|-----------|
| Portal Cliente | /PortalCliente | Chamados sem login |
| Reserva Pública | /ReservaPublica | Link personalizado |
| Cafés Públicos | /CafesPublico | Catálogo |
| Tabela Private Label | /TabelaPrivateLabel | Preços B2B |
| Política Privacidade | /Privacy | LGPD |
| Suporte | /Support | Contato |

### Administração

| Página | Rota | Descrição |
|--------|------|-----------|
| Usuários | /Usuarios | Gestão de acessos |
| Configurações | /Configuracoes | Notificações, WhatsApp, conta |
| Relatórios | /Relatorios | Análises e exportação |
| Exportar Dados | /ExportarDados | Download JSON/CSV |
| Documentação | /DocumentacaoTecnica | Esta documentação |

---

## Funções Backend (Deno)

### Yampi
- \`syncYampiOrders\` - Sincroniza pedidos
- \`syncYampiProducts\` - Sincroniza produtos
- \`getYampiOrderById\` - Busca pedido
- \`updateYampiOrderStatus\` - Atualiza status
- \`previewYampiData\` - Preview importação

### Autentique
- \`criarContratoAutentique\` - Cria contrato
- \`consultarStatusContrato\` - Status assinatura
- \`webhookAutentique\` - Recebe eventos

### Frete
- \`cotarFrete\` - Cotação Melhor Envio

### Notificações
- \`notificarProblema\` - Novo chamado
- \`notificarAtualizacao\` - Atualização
- \`notificarAgendamento\` - Lembrete
- \`alertarEstoqueBaixo\` - Estoque mínimo

---

## Integrações Externas

### Yampi (E-commerce)
- **Secrets:** YAMPI_MERCHANT_ALIAS, YAMPI_USER_TOKEN, YAMPI_USER_SECRET_KEY
- **Funcionalidades:** Sync produtos, pedidos, clientes, status

### Autentique (Assinatura Digital)
- **Secrets:** AUTENTIQUE_API_TOKEN
- **Funcionalidades:** Criar documentos, enviar assinatura, tracking

### Melhor Envio (Frete)
- **Secrets:** MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_SANDBOX
- **Funcionalidades:** Cotação múltiplas transportadoras

### Google SSO (Autenticação)
- **Secrets:** sso_client_id, sso_client_secret, sso_discovery_url
- **Funcionalidades:** Login Google, sync perfil

### WhatsApp Agent (AI)
- **Agent:** notificacoes_whatsapp
- **Funcionalidades:** Consultas, cálculos, chamados via chat

---

## Segurança

### Row Level Security (RLS)
- **admin** - Acesso total
- **Administrativo** - CRUD completo
- **Representante** - Leitura + criação
- **Parceiro Logístico** - Leitura limitada

### Conformidade LGPD
- ✅ Política de Privacidade
- ✅ Página de Suporte
- ✅ Exclusão de conta
- ✅ Logs de auditoria

---

## Mobile / PWA

### Conformidade App Store / Play Store
- ✅ Touch targets 44px mínimo
- ✅ Safe area handling (notch)
- ✅ Dark mode completo
- ✅ Pull-to-refresh nativo
- ✅ Bottom navigation tabs
- ✅ Botão voltar no header
- ✅ Responsivo (telas pequenas)
- ✅ Optimistic UI updates

### Classes CSS Utilitárias
- \`.pt-safe\` - Padding top safe area
- \`.pb-safe\` - Padding bottom safe area
- \`.min-h-screen-safe\` - 100dvh
- \`.select-none\` - Desabilita seleção
- \`.touch-target\` - 44px mínimo

---

## Componentes Principais

### Layout
- **Layout.js** - Sidebar + bottom tabs
- **MobileBottomTabs** - Navegação mobile
- **PullToRefresh** - Atualização puxando
- **ThemeToggle** - Dark/Light mode

### Dashboard
- **StatsCard** - Card de estatística
- **RecentActivity** - Atividades recentes
- **NotificationPanel** - Alertas
- **SolicitacoesEventos** - Eventos pendentes

### Estoque
- **CafeCard** - Card de café
- **CafeFormModal** - Criar/editar café
- **ReservasModal** - Gerenciar reservas
- **ClientesTab** - Aba de clientes

### Logística
- **CaixaCard** - Card de caixa
- **ScanLabelModal** - Scan via câmera
- **BatchImageUploadModal** - Upload em lote

### Chamados
- **ProblemaCard** - Card de chamado
- **ProblemaKanban** - Visualização Kanban
- **ProblemaDetalhesModal** - Detalhes + timeline
- **EtiquetasManager** - Gerenciar labels

---

## Ambiente de Desenvolvimento

### Secrets Necessários
\`\`\`
# Yampi
YAMPI_MERCHANT_ALIAS=seu_alias
YAMPI_USER_TOKEN=seu_token
YAMPI_USER_SECRET_KEY=sua_chave

# Autentique
AUTENTIQUE_API_TOKEN=seu_token

# Melhor Envio
MELHOR_ENVIO_TOKEN=seu_token
MELHOR_ENVIO_SANDBOX=true

# Google SSO
sso_client_id=seu_client_id
sso_client_secret=seu_secret
sso_discovery_url=https://accounts.google.com/.well-known/openid-configuration
sso_scope=openid email profile
sso_name=Google
\`\`\`

---

## Versão

**Versão:** 2.0  
**Plataforma:** Base44 V2  
**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

© ${new Date().getFullYear()} Café Seleção do Mário - Todos os direitos reservados
`;

export default function README() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-[#E5DCC8] dark:border-gray-700 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E5DCC8] dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#6B4423] dark:text-[#C9A961]">README.md</h1>
                <p className="text-sm text-[#8B7355] dark:text-gray-400">Documentação Técnica</p>
              </div>
            </div>
            
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert
              prose-headings:text-[#6B4423] dark:prose-headings:text-[#C9A961]
              prose-h1:text-3xl prose-h1:border-b prose-h1:border-[#E5DCC8] prose-h1:pb-4
              prose-h2:text-xl prose-h2:mt-8
              prose-h3:text-lg
              prose-p:text-[#5A4A3A] dark:prose-p:text-gray-300
              prose-li:text-[#5A4A3A] dark:prose-li:text-gray-300
              prose-strong:text-[#6B4423] dark:prose-strong:text-[#C9A961]
              prose-code:bg-[#F5F1E8] dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-green-400
              prose-table:text-sm
              prose-th:bg-[#6B4423]/10 prose-th:text-[#6B4423] dark:prose-th:text-[#C9A961]
              prose-td:border-[#E5DCC8] dark:prose-td:border-gray-700
              prose-hr:border-[#E5DCC8] dark:prose-hr:border-gray-700
            ">
              <ReactMarkdown>{readmeContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}