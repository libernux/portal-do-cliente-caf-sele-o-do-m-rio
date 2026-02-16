import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coffee, Package, AlertCircle, Calendar, Users, Settings, FileText, 
  Calculator, DollarSign, Link as LinkIcon, ShoppingBag, LayoutDashboard,
  Database, Server, Shield, Smartphone, Globe, Zap, MessageSquare,
  ChevronRight, BookOpen, Code, Layers
} from "lucide-react";

export default function DocumentacaoTecnica() {
  const [activeSection, setActiveSection] = useState("visao-geral");

  const sections = [
    { id: "visao-geral", label: "Visão Geral", icon: BookOpen },
    { id: "arquitetura", label: "Arquitetura", icon: Layers },
    { id: "entidades", label: "Entidades", icon: Database },
    { id: "paginas", label: "Páginas", icon: Globe },
    { id: "componentes", label: "Componentes", icon: Code },
    { id: "funcoes", label: "Funções Backend", icon: Server },
    { id: "integracoes", label: "Integrações", icon: Zap },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "mobile", label: "Mobile/PWA", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] dark:text-[#C9A961]">
                Documentação Técnica
              </h1>
              <p className="text-[#8B7355] dark:text-gray-400">
                Café Seleção do Mário - Sistema de Gestão Operacional
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#2D5016] text-white">Versão 2.0</Badge>
            <Badge variant="outline" className="border-[#6B4423] text-[#6B4423]">React 18</Badge>
            <Badge variant="outline" className="border-[#6B4423] text-[#6B4423]">Base44 Platform</Badge>
            <Badge variant="outline" className="border-[#6B4423] text-[#6B4423]">PWA Ready</Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-[#6B4423] text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-[#6B4423] dark:text-[#C9A961] border border-[#E5DCC8] dark:border-gray-700 hover:bg-[#F5F1E8] dark:hover:bg-gray-700"
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* VISÃO GERAL */}
          {activeSection === "visao-geral" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    1. Visão Geral do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">1.1 Descrição</h3>
                    <p className="text-[#5A4A3A] dark:text-gray-300 leading-relaxed">
                      O <strong>Café Seleção do Mário</strong> é um sistema completo de gestão operacional para 
                      torrefação de cafés especiais. Desenvolvido na plataforma Base44 com React 18, oferece 
                      controle total de estoque, logística, clientes, reservas, chamados, agendamentos e 
                      integrações com e-commerce (Yampi) e assinatura eletrônica (Autentique).
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">1.2 Funcionalidades Principais</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: Package, title: "Controle Logístico", desc: "Rastreamento de caixas, etiquetas, status de envio" },
                        { icon: Coffee, title: "Gestão de Estoque", desc: "Cafés por embalagem, localização, reservas" },
                        { icon: AlertCircle, title: "Central de Chamados", desc: "Tickets, etiquetas, timeline de atualizações" },
                        { icon: Calendar, title: "Agenda Integrada", desc: "Compromissos, visitas, degustações" },
                        { icon: DollarSign, title: "Financeiro", desc: "Contas a receber, checklist de pagamentos" },
                        { icon: Users, title: "Gestão de Clientes", desc: "Cadastro, preços personalizados, links únicos" },
                        { icon: ShoppingBag, title: "Integração Yampi", desc: "Sincronização de pedidos e produtos" },
                        { icon: FileText, title: "Contratos RPA", desc: "Geração e assinatura digital" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg">
                          <item.icon className="w-6 h-6 text-[#6B4423] dark:text-[#C9A961] flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961]">{item.title}</h4>
                            <p className="text-sm text-[#8B7355] dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">1.3 Stack Tecnológica</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5DCC8] dark:border-gray-700">
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Camada</th>
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Tecnologia</th>
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Versão</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#5A4A3A] dark:text-gray-300">
                          <tr className="border-b border-[#E5DCC8]/50 dark:border-gray-700/50">
                            <td className="p-3">Frontend</td>
                            <td className="p-3">React + Vite</td>
                            <td className="p-3">18.2.0</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50 dark:border-gray-700/50">
                            <td className="p-3">Estilização</td>
                            <td className="p-3">Tailwind CSS + shadcn/ui</td>
                            <td className="p-3">3.x</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50 dark:border-gray-700/50">
                            <td className="p-3">Backend</td>
                            <td className="p-3">Base44 Platform (Deno)</td>
                            <td className="p-3">V2</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50 dark:border-gray-700/50">
                            <td className="p-3">Banco de Dados</td>
                            <td className="p-3">Base44 Entities (NoSQL)</td>
                            <td className="p-3">-</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50 dark:border-gray-700/50">
                            <td className="p-3">Autenticação</td>
                            <td className="p-3">Google OAuth (SSO)</td>
                            <td className="p-3">2.0</td>
                          </tr>
                          <tr>
                            <td className="p-3">Animações</td>
                            <td className="p-3">Framer Motion</td>
                            <td className="p-3">11.x</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ARQUITETURA */}
          {activeSection === "arquitetura" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    2. Arquitetura do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">2.1 Estrutura de Diretórios</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`📁 projeto/
├── 📁 entities/          # Schemas JSON das entidades
│   ├── Cafe.json
│   ├── Caixa.json
│   ├── Cliente.json
│   ├── Problema.json
│   ├── Agendamento.json
│   ├── ReservaCafe.json
│   ├── PedidoYampi.json
│   ├── ContratoRPA.json
│   └── ... (22 entidades)
│
├── 📁 pages/             # Páginas React (rotas)
│   ├── Dashboard.js
│   ├── Estoque.js
│   ├── Logistica.js
│   ├── Problemas.js
│   ├── Agenda.js
│   ├── AReceber.js
│   ├── IntegracaoYampi.js
│   └── ... (28 páginas)
│
├── 📁 components/        # Componentes reutilizáveis
│   ├── 📁 ui/           # shadcn/ui base components
│   ├── 📁 dashboard/    # Dashboard widgets
│   ├── 📁 estoque/      # Componentes de estoque
│   ├── 📁 logistica/    # Componentes logísticos
│   ├── 📁 problemas/    # Componentes de chamados
│   ├── 📁 yampi/        # Integração Yampi
│   ├── 📁 layout/       # Layout components
│   └── ... (15 pastas)
│
├── 📁 functions/         # Backend functions (Deno)
│   ├── syncYampiOrders.js
│   ├── cotarFrete.js
│   ├── criarContratoAutentique.js
│   └── ... (25 funções)
│
├── 📁 agents/            # AI Agents
│   └── notificacoes_whatsapp.json
│
├── Layout.js             # Layout principal
└── globals.css           # Estilos globais`}
                    </pre>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">2.2 Fluxo de Dados</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm text-[#5A4A3A] dark:text-gray-300 whitespace-pre-wrap">
{`┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │ ──▶ │  React App   │ ──▶ │  Base44 SDK │
│   (Client)  │     │  (Frontend)  │     │   (Client)  │
└─────────────┘     └──────────────┘     └──────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Components  │     │   Entities  │
                    │   (shadcn)   │     │  (NoSQL DB) │
                    └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────┐           │
                    │   Backend    │ ◀─────────┘
                    │  Functions   │
                    │   (Deno)     │
                    └──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │   Yampi    │  │ Autentique │  │   Melhor   │
   │    API     │  │    API     │  │   Envio    │
   └────────────┘  └────────────┘  └────────────┘`}
                      </pre>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">2.3 Padrões de Design</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Component Pattern</h4>
                        <p className="text-sm text-[#8B7355] dark:text-gray-400">
                          Componentes pequenos e focados (~50 linhas). Separação clara entre 
                          containers (lógica) e presentational (UI).
                        </p>
                      </div>
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Optimistic UI</h4>
                        <p className="text-sm text-[#8B7355] dark:text-gray-400">
                          Atualizações imediatas na UI antes da confirmação do servidor, 
                          revertendo em caso de erro.
                        </p>
                      </div>
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Pull-to-Refresh</h4>
                        <p className="text-sm text-[#8B7355] dark:text-gray-400">
                          Padrão mobile nativo para atualização de dados com animação suave 
                          e feedback visual.
                        </p>
                      </div>
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">RLS (Row Level Security)</h4>
                        <p className="text-sm text-[#8B7355] dark:text-gray-400">
                          Controle de acesso granular por registro nas entidades, baseado em 
                          role do usuário e propriedade.
                        </p>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ENTIDADES */}
          {activeSection === "entidades" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    3. Modelo de Dados (Entidades)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-[#5A4A3A] dark:text-gray-300">
                    O sistema utiliza 22 entidades principais, cada uma com schema JSON e regras RLS.
                  </p>

                  {/* Core Entities */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">3.1 Entidades Core</h3>
                    <div className="space-y-4">
                      <EntityDoc 
                        name="Cafe"
                        description="Cadastro de cafés com estoque por embalagem e localização"
                        fields={[
                          { name: "nome", type: "string", desc: "Nome do café (ex: Amendoado)" },
                          { name: "forma", type: "enum", desc: "Grão ou Moído" },
                          { name: "estoque_por_embalagem", type: "object", desc: "{ '10g': 0, '250g': 50, '1kg': 10 }" },
                          { name: "embalagens_disponiveis", type: "array", desc: "['10g', '250g', '500g', '1kg']" },
                          { name: "localizacao", type: "enum", desc: "Vila Velha ou Venda Nova" },
                          { name: "is_private_label", type: "boolean", desc: "Se é linha Private Label" },
                          { name: "precos_private_label", type: "object", desc: "Preços por embalagem" },
                        ]}
                      />

                      <EntityDoc 
                        name="Caixa"
                        description="Controle de movimentação logística entre unidades"
                        fields={[
                          { name: "numero_identificacao", type: "string", desc: "Código único da caixa" },
                          { name: "origem/destino", type: "enum", desc: "Venda Nova ou Vila Velha" },
                          { name: "status", type: "enum", desc: "Aguardando Envio, Em Trânsito, Entregue, Problema" },
                          { name: "responsavel", type: "string", desc: "Nome do responsável" },
                          { name: "codigo_rastreamento", type: "string", desc: "Código da transportadora" },
                          { name: "conteudo", type: "string", desc: "Descrição do conteúdo" },
                        ]}
                      />

                      <EntityDoc 
                        name="Cliente"
                        description="Cadastro de clientes para reservas e vendas"
                        fields={[
                          { name: "nome", type: "string", desc: "Nome do cliente" },
                          { name: "email", type: "email", desc: "Email de contato" },
                          { name: "telefone", type: "string", desc: "Telefone" },
                          { name: "endereco", type: "string", desc: "Endereço completo" },
                          { name: "localizacao", type: "enum", desc: "Região de atendimento" },
                        ]}
                      />

                      <EntityDoc 
                        name="ReservaCafe"
                        description="Reservas de café vinculadas a clientes"
                        fields={[
                          { name: "cliente_id/nome", type: "string", desc: "Referência ao cliente" },
                          { name: "cafe_id/nome/forma", type: "string", desc: "Referência ao café" },
                          { name: "embalagem", type: "enum", desc: "Tipo de embalagem" },
                          { name: "quantidade_pacotes", type: "number", desc: "Quantidade reservada" },
                          { name: "status", type: "enum", desc: "Ativa, Entregue, Cancelada" },
                        ]}
                      />
                    </div>
                  </section>

                  {/* Support Entities */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">3.2 Entidades de Suporte</h3>
                    <div className="space-y-4">
                      <EntityDoc 
                        name="Problema"
                        description="Sistema de chamados/tickets de clientes"
                        fields={[
                          { name: "nome_cliente/email", type: "string", desc: "Dados do cliente" },
                          { name: "descricao", type: "string", desc: "Descrição do problema" },
                          { name: "tipo", type: "enum", desc: "Logística, Estoque, Cliente, etc." },
                          { name: "prioridade", type: "enum", desc: "Baixa, Média, Alta, Urgente" },
                          { name: "status", type: "enum", desc: "Aberto, Em Andamento, Resolvido" },
                          { name: "responsavel", type: "string", desc: "Responsável atribuído" },
                          { name: "etiquetas", type: "array", desc: "IDs de etiquetas" },
                        ]}
                      />

                      <EntityDoc 
                        name="Agendamento"
                        description="Compromissos e eventos da equipe"
                        fields={[
                          { name: "titulo", type: "string", desc: "Título do evento" },
                          { name: "data_inicio/fim", type: "datetime", desc: "Período do evento" },
                          { name: "tipo", type: "enum", desc: "Reunião, Visita, Degustação, etc." },
                          { name: "participantes", type: "array", desc: "Lista de participantes" },
                          { name: "status", type: "enum", desc: "Agendado, Confirmado, Concluído" },
                        ]}
                      />

                      <EntityDoc 
                        name="Tarefa"
                        description="Kanban de tarefas internas"
                        fields={[
                          { name: "titulo", type: "string", desc: "Título da tarefa" },
                          { name: "status", type: "enum", desc: "A Fazer, Em Andamento, Concluído" },
                          { name: "prioridade", type: "enum", desc: "Baixa, Média, Alta, Urgente" },
                          { name: "responsavel", type: "string", desc: "Responsável" },
                          { name: "prazo", type: "date", desc: "Data limite" },
                        ]}
                      />
                    </div>
                  </section>

                  {/* Integration Entities */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">3.3 Entidades de Integração</h3>
                    <div className="space-y-4">
                      <EntityDoc 
                        name="PedidoYampi"
                        description="Pedidos sincronizados da plataforma Yampi"
                        fields={[
                          { name: "yampi_id", type: "string", desc: "ID original na Yampi" },
                          { name: "numero_pedido", type: "string", desc: "Número do pedido" },
                          { name: "cliente_*", type: "string", desc: "Dados do comprador" },
                          { name: "itens", type: "array", desc: "Produtos do pedido" },
                          { name: "valor_total", type: "number", desc: "Valor total" },
                          { name: "status_pagamento", type: "string", desc: "Status do pagamento" },
                        ]}
                      />

                      <EntityDoc 
                        name="ContratoRPA"
                        description="Contratos de prestação de serviços"
                        fields={[
                          { name: "nome_prestador", type: "string", desc: "Nome do prestador" },
                          { name: "cpf/rg", type: "string", desc: "Documentos" },
                          { name: "valor_servico", type: "number", desc: "Valor acordado" },
                          { name: "descricao_servico", type: "string", desc: "Descrição do serviço" },
                          { name: "status_assinatura", type: "enum", desc: "Status no Autentique" },
                        ]}
                      />

                      <EntityDoc 
                        name="AssinanteClube"
                        description="Assinantes do clube de café"
                        fields={[
                          { name: "nome/email/telefone", type: "string", desc: "Dados do assinante" },
                          { name: "plano", type: "enum", desc: "Básico, Premium, Especial" },
                          { name: "cafes_preferidos", type: "array", desc: "Preferências" },
                          { name: "dia_entrega", type: "number", desc: "Dia preferido" },
                          { name: "status", type: "enum", desc: "Ativo, Pausado, Cancelado" },
                        ]}
                      />
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PÁGINAS */}
          {activeSection === "paginas" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    4. Páginas e Navegação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Menu Principal */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">4.1 Menu Principal</h3>
                    <div className="space-y-4">
                      <PageDoc 
                        icon={LayoutDashboard}
                        name="Dashboard"
                        route="/Dashboard"
                        description="Painel central com KPIs e visão geral operacional"
                        features={[
                          "4 cards de estatísticas (Caixas em Trânsito, Estoque Total, Chamados Abertos, Agendamentos)",
                          "Solicitações de eventos pendentes",
                          "Atividade recente de logística",
                          "Painel de notificações",
                          "Pull-to-refresh para atualização"
                        ]}
                      />

                      <PageDoc 
                        icon={LayoutDashboard}
                        name="Tarefas"
                        route="/Tarefas"
                        description="Kanban de tarefas internas da equipe"
                        features={[
                          "Visualização Kanban com drag-and-drop",
                          "Filtros por status e prioridade",
                          "Estatísticas de tarefas",
                          "Modal de criação/edição",
                          "Etiquetas e responsáveis"
                        ]}
                      />

                      <PageDoc 
                        icon={Package}
                        name="Logística"
                        route="/Logistica"
                        description="Controle de movimentação de caixas entre unidades"
                        features={[
                          "Grid de cards com status visual",
                          "Filtros por status (Aguardando, Em Trânsito, Entregue)",
                          "Scan de etiquetas via câmera",
                          "Upload em lote de imagens para extração",
                          "Seleção múltipla para exclusão em lote",
                          "Pull-to-refresh"
                        ]}
                      />

                      <PageDoc 
                        icon={Coffee}
                        name="Estoque"
                        route="/Estoque"
                        description="Gestão completa de cafés, clientes e reservas"
                        features={[
                          "3 abas: Estoque, Reservas, Clientes",
                          "Cards de café com estoque por embalagem",
                          "Filtros por forma (Grão/Moído) e busca",
                          "Modal de adição de estoque",
                          "Sistema de reservas vinculado a clientes",
                          "Preços personalizados por cliente",
                          "Cálculo automático de equivalência em kg"
                        ]}
                      />

                      <PageDoc 
                        icon={DollarSign}
                        name="A Receber"
                        route="/AReceber"
                        description="Controle financeiro de reservas e demandas externas"
                        features={[
                          "2 abas: Reservas, Demandas Externas",
                          "Checklist de pagamento (NF, Boleto, Pagamento)",
                          "Filtros por status de pagamento",
                          "Histórico de alterações",
                          "Estatísticas financeiras"
                        ]}
                      />

                      <PageDoc 
                        icon={LinkIcon}
                        name="Links Clientes"
                        route="/LinksClientes"
                        description="Geração de links personalizados para clientes"
                        features={[
                          "Slug único por cliente",
                          "Toggle de visibilidade de preços",
                          "Ativação/desativação de links",
                          "Cópia rápida de URL",
                          "Estatísticas de reservas por link"
                        ]}
                      />

                      <PageDoc 
                        icon={AlertCircle}
                        name="Chamados"
                        route="/Problemas"
                        description="Central de atendimento ao cliente"
                        features={[
                          "Visualização Lista e Kanban",
                          "Sistema de etiquetas coloridas",
                          "Timeline de atualizações",
                          "Filtros por status e prioridade",
                          "Atribuição de responsáveis",
                          "Notificação de novas interações",
                          "Pull-to-refresh"
                        ]}
                      />

                      <PageDoc 
                        icon={Calendar}
                        name="Agenda"
                        route="/Agenda"
                        description="Calendário de compromissos"
                        features={[
                          "Calendário visual com indicadores",
                          "Lista de compromissos do dia",
                          "Próximos agendamentos",
                          "Modal de criação/edição",
                          "Seleção múltipla para exclusão"
                        ]}
                      />
                    </div>
                  </section>

                  {/* Calculadoras */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">4.2 Calculadoras</h3>
                    <div className="space-y-4">
                      <PageDoc 
                        icon={Calculator}
                        name="Calculadora Eventos"
                        route="/CalculadoraEventos"
                        description="Cálculo de café para eventos e uso interno"
                        features={[
                          "2 modos: Evento e Uso Interno",
                          "Parâmetros customizáveis (público, taxa adesão, dias, horas)",
                          "Cálculo de consumidores esperados",
                          "Distribuição por embalagem",
                          "Resumo por dia/hora"
                        ]}
                      />

                      <PageDoc 
                        icon={Calculator}
                        name="Calculadora Agridrones"
                        route="/CalculadoraAgridrones"
                        description="Cotação de produtos Agridrones"
                        features={[
                          "Catálogo de produtos",
                          "Cálculo de quantidades",
                          "Geração de cotações"
                        ]}
                      />

                      <PageDoc 
                        icon={Calculator}
                        name="Calculadora Fornecedores"
                        route="/CalculadoraFornecedores"
                        description="Comparativo de preços de fornecedores"
                        features={[
                          "Cadastro de fornecedores",
                          "Comparativo de preços",
                          "Cálculo de custo por kg"
                        ]}
                      />
                    </div>
                  </section>

                  {/* Integrações */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">4.3 Integrações</h3>
                    <div className="space-y-4">
                      <PageDoc 
                        icon={ShoppingBag}
                        name="Integração Yampi"
                        route="/IntegracaoYampi"
                        description="Sincronização com e-commerce Yampi"
                        features={[
                          "5 abas: Produtos, Categorias, Pedidos, Clientes, Logs",
                          "Sincronização de produtos (preview e confirmação)",
                          "Visualização de pedidos com detalhes",
                          "Busca de clientes Yampi",
                          "Exportação/Importação JSON",
                          "Logs de sincronização"
                        ]}
                      />

                      <PageDoc 
                        icon={FileText}
                        name="Contratos RPA"
                        route="/ContratosRPA"
                        description="Gestão de contratos de prestadores"
                        features={[
                          "Criação de contratos com template",
                          "Envio para assinatura digital (Autentique)",
                          "Acompanhamento de status",
                          "Visualização de signatários"
                        ]}
                      />

                      <PageDoc 
                        icon={Users}
                        name="Clube Assinatura"
                        route="/ClubeAssinatura"
                        description="Gestão de assinantes do clube"
                        features={[
                          "2 abas: Assinantes, Entregas",
                          "Cadastro de planos",
                          "Preferências de café",
                          "Controle de entregas mensais"
                        ]}
                      />

                      <PageDoc 
                        icon={Package}
                        name="Cotação de Frete"
                        route="/CotacaoFrete"
                        description="Cálculo de frete via Melhor Envio"
                        features={[
                          "Formulário de cotação",
                          "Múltiplas transportadoras",
                          "Configuração de CEPs padrão"
                        ]}
                      />
                    </div>
                  </section>

                  {/* Páginas Públicas */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">4.4 Páginas Públicas</h3>
                    <div className="space-y-4">
                      <PageDoc 
                        icon={Globe}
                        name="Portal Cliente"
                        route="/PortalCliente"
                        description="Portal público para clientes abrirem e acompanharem chamados"
                        features={[
                          "Abertura de chamados sem login",
                          "Consulta por email",
                          "Visualização de atualizações",
                          "Envio de respostas",
                          "Indicador de novas interações"
                        ]}
                      />

                      <PageDoc 
                        icon={Globe}
                        name="Reserva Pública"
                        route="/ReservaPublica"
                        description="Página de reserva via link personalizado"
                        features={[
                          "Acesso via slug único",
                          "Calculadora de café para eventos",
                          "Seleção de cafés disponíveis",
                          "Envio de solicitação"
                        ]}
                      />

                      <PageDoc 
                        icon={Globe}
                        name="Cafés Públicos"
                        route="/CafesPublico"
                        description="Catálogo público de cafés"
                        features={[
                          "Lista de cafés disponíveis",
                          "Filtros por tipo",
                          "Informações detalhadas"
                        ]}
                      />

                      <PageDoc 
                        icon={Globe}
                        name="Tabela Private Label"
                        route="/TabelaPrivateLabel"
                        description="Tabela pública de preços Private Label"
                        features={[
                          "Cafés marcados como Private Label",
                          "Preços por embalagem",
                          "Notas de degustação"
                        ]}
                      />
                    </div>
                  </section>

                  {/* Administração */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">4.5 Administração</h3>
                    <div className="space-y-4">
                      <PageDoc 
                        icon={Users}
                        name="Usuários"
                        route="/Usuarios"
                        description="Gestão de usuários do sistema"
                        features={[
                          "Lista de usuários",
                          "Convite de novos usuários",
                          "Definição de roles (admin, user)",
                          "Definição de cargos operacionais"
                        ]}
                      />

                      <PageDoc 
                        icon={Settings}
                        name="Configurações"
                        route="/Configuracoes"
                        description="Configurações do sistema"
                        features={[
                          "4 abas: Responsáveis, Notificações, WhatsApp, Conta",
                          "Cadastro de responsáveis por área",
                          "Toggle de notificações por categoria",
                          "Integração WhatsApp com agente AI",
                          "Exclusão de conta (LGPD)"
                        ]}
                      />

                      <PageDoc 
                        icon={FileText}
                        name="Relatórios"
                        route="/Relatorios"
                        description="Relatórios e análises"
                        features={[
                          "6 abas de relatórios",
                          "Filtro por período",
                          "Gráficos de estoque, reservas, chamados",
                          "Relatório por cliente",
                          "Exportação CSV e TXT"
                        ]}
                      />

                      <PageDoc 
                        icon={FileText}
                        name="Exportar Dados"
                        route="/ExportarDados"
                        description="Exportação de dados do sistema"
                        features={[
                          "Seleção de entidades",
                          "Exportação JSON/CSV",
                          "Download direto"
                        ]}
                      />
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* COMPONENTES */}
          {activeSection === "componentes" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    5. Componentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Layout */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.1 Layout</h3>
                    <div className="space-y-3">
                      <ComponentDoc 
                        name="Layout.js"
                        description="Layout principal com sidebar e bottom tabs"
                        props={["children", "currentPageName"]}
                        features={[
                          "Sidebar colapsável (desktop)",
                          "Bottom tabs (mobile)",
                          "Header com botão voltar",
                          "Theme toggle (dark mode)",
                          "Safe area handling",
                          "Autenticação automática"
                        ]}
                      />
                      <ComponentDoc 
                        name="MobileBottomTabs"
                        description="Navegação inferior para mobile"
                        props={[]}
                        features={[
                          "4 tabs principais + menu More",
                          "Indicador de tab ativa",
                          "Refresh ao tocar tab ativa",
                          "Dropdown para itens secundários"
                        ]}
                      />
                      <ComponentDoc 
                        name="PullToRefresh"
                        description="Wrapper para pull-to-refresh"
                        props={["onRefresh", "className", "children"]}
                        features={[
                          "Animação de loading",
                          "Threshold configurável",
                          "Feedback visual"
                        ]}
                      />
                      <ComponentDoc 
                        name="ThemeToggle"
                        description="Botão de alternância de tema"
                        props={[]}
                        features={[
                          "Light/Dark mode",
                          "Persistência em localStorage"
                        ]}
                      />
                    </div>
                  </section>

                  {/* Dashboard */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.2 Dashboard</h3>
                    <div className="space-y-3">
                      <ComponentDoc 
                        name="StatsCard"
                        description="Card de estatística com ícone e gradiente"
                        props={["title", "value", "icon", "gradient", "subtext"]}
                        features={[
                          "Responsivo",
                          "Animação de entrada",
                          "Suporte dark mode"
                        ]}
                      />
                      <ComponentDoc 
                        name="RecentActivity"
                        description="Lista de atividades recentes"
                        props={["title", "items"]}
                        features={["Timeline visual", "Status colorido"]}
                      />
                      <ComponentDoc 
                        name="NotificationPanel"
                        description="Painel de notificações"
                        props={[]}
                        features={["Alertas de estoque", "Chamados pendentes"]}
                      />
                      <ComponentDoc 
                        name="SolicitacoesEventos"
                        description="Lista de solicitações de eventos"
                        props={["solicitacoes", "onUpdate"]}
                        features={["Cards compactos", "Ação rápida"]}
                      />
                    </div>
                  </section>

                  {/* Estoque */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.3 Estoque</h3>
                    <div className="space-y-3">
                      <ComponentDoc 
                        name="CafeCard"
                        description="Card de café com estoque detalhado"
                        props={["cafe", "onEdit", "onAddStock", "onReservas"]}
                        features={[
                          "Estoque por embalagem",
                          "Badges de forma e localização",
                          "Ações dropdown"
                        ]}
                      />
                      <ComponentDoc 
                        name="CafeFormModal"
                        description="Modal de criação/edição de café"
                        props={["open", "onClose", "onSave", "cafe"]}
                        features={["Validação", "Preços Private Label"]}
                      />
                      <ComponentDoc 
                        name="ReservasModal"
                        description="Modal de reservas de um café"
                        props={["open", "onClose", "cafe", "clientes", "onSave"]}
                        features={["Criação de reserva", "Lista de reservas ativas"]}
                      />
                      <ComponentDoc 
                        name="ClientesTab"
                        description="Aba de gestão de clientes"
                        props={["clientes", "onEdit", "onPrices"]}
                        features={["Lista de clientes", "Links para preços"]}
                      />
                    </div>
                  </section>

                  {/* Logística */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.4 Logística</h3>
                    <div className="space-y-3">
                      <ComponentDoc 
                        name="CaixaCard"
                        description="Card de caixa com status visual"
                        props={["caixa", "onEdit", "onDelete"]}
                        features={["Cores por status", "Rota visual", "Actions"]}
                      />
                      <ComponentDoc 
                        name="ScanLabelModal"
                        description="Modal de scan de etiqueta via câmera"
                        props={["open", "onClose", "onDataExtracted"]}
                        features={["Captura de imagem", "Extração via AI"]}
                      />
                      <ComponentDoc 
                        name="BatchImageUploadModal"
                        description="Upload em lote de imagens"
                        props={["open", "onClose", "onComplete"]}
                        features={["Múltiplas imagens", "Processamento paralelo"]}
                      />
                    </div>
                  </section>

                  {/* Problemas */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.5 Chamados</h3>
                    <div className="space-y-3">
                      <ComponentDoc 
                        name="ProblemaCard"
                        description="Card de chamado com timeline"
                        props={["problema", "etiquetas", "onEdit", "onDelete", "onViewDetails"]}
                        features={["Badges coloridos", "Contagem de atualizações"]}
                      />
                      <ComponentDoc 
                        name="ProblemaKanban"
                        description="Visualização Kanban de chamados"
                        props={["problemas", "etiquetas", "onStatusChange", "onEdit"]}
                        features={["Drag-and-drop", "Colunas por status"]}
                      />
                      <ComponentDoc 
                        name="ProblemaDetalhesModal"
                        description="Modal de detalhes com timeline"
                        props={["open", "onClose", "problema", "etiquetas", "onEdit", "onUpdate"]}
                        features={["Timeline de atualizações", "Adição de comentários"]}
                      />
                      <ComponentDoc 
                        name="EtiquetasManager"
                        description="Gerenciador de etiquetas"
                        props={["open", "onClose"]}
                        features={["CRUD de etiquetas", "Cores customizáveis"]}
                      />
                    </div>
                  </section>

                  {/* UI Base */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">5.6 UI Base (shadcn/ui)</h3>
                    <div className="grid md:grid-cols-3 gap-2 text-sm">
                      {[
                        "Button", "Input", "Textarea", "Select", "Checkbox", "Radio",
                        "Card", "Dialog", "Sheet", "Dropdown", "Tabs", "Badge",
                        "Calendar", "Popover", "Tooltip", "Progress", "Skeleton",
                        "Alert", "Toast", "Table", "Form", "Label", "Separator"
                      ].map((comp) => (
                        <div key={comp} className="p-2 bg-[#F5F1E8] dark:bg-gray-800 rounded text-[#6B4423] dark:text-[#C9A961]">
                          {comp}
                        </div>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FUNÇÕES BACKEND */}
          {activeSection === "funcoes" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    6. Funções Backend (Deno)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-[#5A4A3A] dark:text-gray-300">
                    Backend functions executadas em Deno Deploy, invocadas via SDK ou webhooks.
                  </p>

                  {/* Yampi */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">6.1 Integração Yampi</h3>
                    <div className="space-y-3">
                      <FunctionDoc 
                        name="syncYampiOrders"
                        description="Sincroniza pedidos da Yampi"
                        input="{ page?: number, limit?: number }"
                        output="{ success, orders, total }"
                        secrets={["YAMPI_USER_TOKEN", "YAMPI_USER_SECRET_KEY", "YAMPI_MERCHANT_ALIAS"]}
                      />
                      <FunctionDoc 
                        name="syncYampiProducts"
                        description="Sincroniza produtos da Yampi"
                        input="{ page?: number, limit?: number }"
                        output="{ success, products, total }"
                        secrets={["YAMPI_*"]}
                      />
                      <FunctionDoc 
                        name="getYampiOrderById"
                        description="Busca pedido específico"
                        input="{ order_id: string }"
                        output="{ success, order }"
                        secrets={["YAMPI_*"]}
                      />
                      <FunctionDoc 
                        name="updateYampiOrderStatus"
                        description="Atualiza status do pedido"
                        input="{ order_id, status }"
                        output="{ success }"
                        secrets={["YAMPI_*"]}
                      />
                      <FunctionDoc 
                        name="previewYampiData"
                        description="Preview de dados antes de importar"
                        input="{ type: 'products' | 'orders' }"
                        output="{ items, total, existing }"
                        secrets={["YAMPI_*"]}
                      />
                    </div>
                  </section>

                  {/* Autentique */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">6.2 Assinatura Digital</h3>
                    <div className="space-y-3">
                      <FunctionDoc 
                        name="criarContratoAutentique"
                        description="Cria contrato e envia para assinatura"
                        input="{ contrato_id, signatarios: [{email, name}] }"
                        output="{ success, document_id, sign_url }"
                        secrets={["AUTENTIQUE_API_TOKEN"]}
                      />
                      <FunctionDoc 
                        name="consultarStatusContrato"
                        description="Consulta status do contrato no Autentique"
                        input="{ document_id: string }"
                        output="{ success, status, signatures }"
                        secrets={["AUTENTIQUE_API_TOKEN"]}
                      />
                      <FunctionDoc 
                        name="webhookAutentique"
                        description="Webhook para receber eventos do Autentique"
                        input="{ event, document, signatures }"
                        output="{ received: true }"
                        secrets={[]}
                      />
                    </div>
                  </section>

                  {/* Frete */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">6.3 Cotação de Frete</h3>
                    <div className="space-y-3">
                      <FunctionDoc 
                        name="cotarFrete"
                        description="Calcula frete via Melhor Envio"
                        input="{ cep_origem, cep_destino, peso, dimensoes }"
                        output="{ success, quotes: [{carrier, price, days}] }"
                        secrets={["MELHOR_ENVIO_TOKEN"]}
                      />
                    </div>
                  </section>

                  {/* Notificações */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">6.4 Notificações</h3>
                    <div className="space-y-3">
                      <FunctionDoc 
                        name="notificarProblema"
                        description="Envia notificação de novo chamado"
                        input="{ problema_id }"
                        output="{ success, notifications_sent }"
                        secrets={[]}
                      />
                      <FunctionDoc 
                        name="notificarAtualizacao"
                        description="Notifica atualização de chamado"
                        input="{ problema_id, atualizacao_id }"
                        output="{ success }"
                        secrets={[]}
                      />
                      <FunctionDoc 
                        name="notificarAgendamento"
                        description="Envia lembrete de agendamento"
                        input="{ agendamento_id }"
                        output="{ success }"
                        secrets={[]}
                      />
                      <FunctionDoc 
                        name="alertarEstoqueBaixo"
                        description="Alerta de estoque abaixo do mínimo"
                        input="{ }"
                        output="{ success, alerts }"
                        secrets={[]}
                      />
                    </div>
                  </section>

                  {/* Utilitários */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">6.5 Utilitários</h3>
                    <div className="space-y-3">
                      <FunctionDoc 
                        name="apiConsultaDados"
                        description="API pública para consulta de dados"
                        input="{ type, filters }"
                        output="{ success, data }"
                        secrets={[]}
                      />
                      <FunctionDoc 
                        name="getCafesPublicos"
                        description="Retorna cafés públicos para o site"
                        input="{ }"
                        output="{ cafes }"
                        secrets={[]}
                      />
                      <FunctionDoc 
                        name="exportYampiOrdersToJson"
                        description="Exporta pedidos Yampi em JSON"
                        input="{ filters }"
                        output="application/json (download)"
                        secrets={[]}
                      />
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* INTEGRAÇÕES */}
          {activeSection === "integracoes" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    7. Integrações Externas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Yampi */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">7.1 Yampi (E-commerce)</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Configuração</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• YAMPI_MERCHANT_ALIAS: Alias da loja</li>
                            <li>• YAMPI_USER_TOKEN: Token de acesso</li>
                            <li>• YAMPI_USER_SECRET_KEY: Chave secreta</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Funcionalidades</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Sincronização de produtos</li>
                            <li>• Importação de pedidos</li>
                            <li>• Atualização de status</li>
                            <li>• Sincronização de clientes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Autentique */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">7.2 Autentique (Assinatura Digital)</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Configuração</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• AUTENTIQUE_API_TOKEN: Token de API</li>
                            <li>• Webhook configurado para eventos</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Funcionalidades</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Criação de documentos</li>
                            <li>• Envio para assinatura</li>
                            <li>• Tracking de status</li>
                            <li>• Múltiplos signatários</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Melhor Envio */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">7.3 Melhor Envio (Frete)</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Configuração</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• MELHOR_ENVIO_TOKEN: Token de acesso</li>
                            <li>• MELHOR_ENVIO_SANDBOX: Modo sandbox</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Funcionalidades</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Cotação de frete</li>
                            <li>• Múltiplas transportadoras</li>
                            <li>• Prazo de entrega</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Google SSO */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">7.4 Google SSO (Autenticação)</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Configuração</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• sso_client_id: Client ID OAuth</li>
                            <li>• sso_client_secret: Client Secret</li>
                            <li>• sso_discovery_url: OpenID Connect</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Funcionalidades</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Login com Google</li>
                            <li>• Sincronização de perfil</li>
                            <li>• Token refresh automático</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* WhatsApp Agent */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">7.5 WhatsApp Agent (AI)</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Configuração</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Agent: notificacoes_whatsapp</li>
                            <li>• Acesso a entidades via tools</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Funcionalidades</h4>
                          <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
                            <li>• Consulta de pedidos</li>
                            <li>• Cálculos de café</li>
                            <li>• Abertura de chamados</li>
                            <li>• Notificações automáticas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SEGURANÇA */}
          {activeSection === "seguranca" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    8. Segurança e Permissões
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Autenticação */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">8.1 Autenticação</h3>
                    <ul className="space-y-2 text-[#5A4A3A] dark:text-gray-300">
                      <li>• <strong>SSO Google OAuth 2.0:</strong> Login seguro via conta Google</li>
                      <li>• <strong>Token JWT:</strong> Tokens de sessão com expiração automática</li>
                      <li>• <strong>Refresh automático:</strong> Renovação transparente de tokens</li>
                      <li>• <strong>Logout global:</strong> Invalidação de todas as sessões</li>
                    </ul>
                  </section>

                  {/* RLS */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">8.2 Row Level Security (RLS)</h3>
                    <p className="text-[#5A4A3A] dark:text-gray-300 mb-4">
                      Cada entidade possui regras granulares de acesso por operação:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5DCC8] dark:border-gray-700">
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Regra</th>
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#5A4A3A] dark:text-gray-300">
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3 font-mono text-xs">role: admin</td>
                            <td className="p-3">Acesso total a todas as operações</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3 font-mono text-xs">cargo: Administrativo</td>
                            <td className="p-3">CRUD completo na maioria das entidades</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3 font-mono text-xs">cargo: Representante</td>
                            <td className="p-3">Leitura + criação de reservas e clientes</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3 font-mono text-xs">cargo: Parceiro Logístico</td>
                            <td className="p-3">Acesso a caixas e estoque (leitura)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-xs">{`created_by: {{user.email}}`}</td>
                            <td className="p-3">Acesso apenas aos próprios registros</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Roles */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">8.3 Roles e Cargos</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Roles (Sistema)</h4>
                        <ul className="text-sm text-[#8B7355] dark:text-gray-400 space-y-1">
                          <li>• <strong>admin:</strong> Administrador do sistema</li>
                          <li>• <strong>user:</strong> Usuário padrão</li>
                        </ul>
                      </div>
                      <div className="p-4 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">Cargos (Operacional)</h4>
                        <ul className="text-sm text-[#8B7355] dark:text-gray-400 space-y-1">
                          <li>• Administrativo</li>
                          <li>• Representante</li>
                          <li>• Parceiro Logístico</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* LGPD */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">8.4 Conformidade LGPD</h3>
                    <ul className="space-y-2 text-[#5A4A3A] dark:text-gray-300">
                      <li>✅ Política de Privacidade acessível (/Privacy)</li>
                      <li>✅ Página de Suporte (/Support)</li>
                      <li>✅ Exclusão de conta nas configurações</li>
                      <li>✅ Logs de acesso e auditoria</li>
                      <li>✅ Consentimento explícito para notificações</li>
                    </ul>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MOBILE */}
          {activeSection === "mobile" && (
            <div className="space-y-6">
              <Card className="border-[#E5DCC8] dark:border-gray-700">
                <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
                  <CardTitle className="text-[#6B4423] dark:text-[#C9A961]">
                    9. Mobile e PWA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Guidelines Compliance */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">9.1 Conformidade App Store / Play Store</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-bold text-green-800 dark:text-green-400 mb-2">✅ Implementado</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Touch targets mínimos 44px</li>
                          <li>• Safe area handling (notch)</li>
                          <li>• Dark mode completo</li>
                          <li>• Pull-to-refresh nativo</li>
                          <li>• Bottom navigation tabs</li>
                          <li>• Botão voltar no header</li>
                          <li>• Política de privacidade</li>
                          <li>• Exclusão de conta</li>
                          <li>• Página de suporte</li>
                          <li>• Responsivo para telas menores que 360px</li>
                          <li>• Desabilitar text selection em nav</li>
                          <li>• Optimistic UI updates</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#F5F1E8] dark:bg-gray-800 border border-[#E5DCC8] dark:border-gray-700 rounded-lg">
                        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">📱 Features Mobile</h4>
                        <ul className="text-sm text-[#8B7355] dark:text-gray-400 space-y-1">
                          <li>• Viewport height fix (100dvh)</li>
                          <li>• Prevent overscroll bounce</li>
                          <li>• Disable tap highlight</li>
                          <li>• Custom scrollbar styling</li>
                          <li>• Responsive grids</li>
                          <li>• Touch-friendly inputs</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* CSS Classes */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">9.2 Classes CSS Utilitárias</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5DCC8] dark:border-gray-700">
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Classe</th>
                            <th className="text-left p-3 text-[#6B4423] dark:text-[#C9A961]">Função</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#5A4A3A] dark:text-gray-300 font-mono text-xs">
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3">.pt-safe</td>
                            <td className="p-3">Padding top para safe area</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3">.pb-safe</td>
                            <td className="p-3">Padding bottom para safe area</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3">.min-h-screen-safe</td>
                            <td className="p-3">100dvh com fallback</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3">.select-none</td>
                            <td className="p-3">Desabilita seleção de texto</td>
                          </tr>
                          <tr className="border-b border-[#E5DCC8]/50">
                            <td className="p-3">.touch-target</td>
                            <td className="p-3">min-height/width 44px</td>
                          </tr>
                          <tr>
                            <td className="p-3">.list-item-touch</td>
                            <td className="p-3">Padding adequado para toque</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Navigation */}
                  <section>
                    <h3 className="text-xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-3">9.3 Navegação Mobile</h3>
                    <div className="bg-[#F5F1E8] dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm text-[#5A4A3A] dark:text-gray-300">
{`Bottom Tabs (4 principais):
┌─────────┬─────────┬─────────┬─────────┐
│  Home   │Logística│ Estoque │Chamados │
│   🏠    │   📦    │   ☕    │   ⚠️    │
└─────────┴─────────┴─────────┴─────────┘

Menu "Mais" (dropdown):
• Tarefas
• A Receber
• Agenda
• Calculadoras
• Integrações
• Configurações`}
                      </pre>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#8B7355] dark:text-gray-400">
          <p>Documentação gerada automaticamente • Café Seleção do Mário © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function EntityDoc({ name, description, fields }) {
  return (
    <div className="border border-[#E5DCC8] dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-[#6B4423]/5 dark:bg-gray-800 p-4 border-b border-[#E5DCC8] dark:border-gray-700">
        <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] font-mono">{name}</h4>
        <p className="text-sm text-[#8B7355] dark:text-gray-400">{description}</p>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#8B7355] dark:text-gray-400">
              <th className="pb-2">Campo</th>
              <th className="pb-2">Tipo</th>
              <th className="pb-2">Descrição</th>
            </tr>
          </thead>
          <tbody className="text-[#5A4A3A] dark:text-gray-300">
            {fields.map((field, i) => (
              <tr key={i} className="border-t border-[#E5DCC8]/30 dark:border-gray-700/30">
                <td className="py-2 font-mono text-xs">{field.name}</td>
                <td className="py-2 text-xs">{field.type}</td>
                <td className="py-2 text-xs">{field.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageDoc({ icon: Icon, name, route, description, features }) {
  return (
    <div className="border border-[#E5DCC8] dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-[#6B4423]/5 dark:bg-gray-800 p-4 border-b border-[#E5DCC8] dark:border-gray-700 flex items-start gap-3">
        <Icon className="w-6 h-6 text-[#6B4423] dark:text-[#C9A961] flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961]">{name}</h4>
            <Badge variant="outline" className="text-xs font-mono">{route}</Badge>
          </div>
          <p className="text-sm text-[#8B7355] dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="p-4">
        <ul className="text-sm text-[#5A4A3A] dark:text-gray-300 space-y-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComponentDoc({ name, description, props, features }) {
  return (
    <div className="border border-[#E5DCC8] dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] font-mono">{name}</h4>
          <p className="text-sm text-[#8B7355] dark:text-gray-400">{description}</p>
        </div>
      </div>
      {props.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-[#8B7355] dark:text-gray-400">Props: </span>
          {props.map((prop, i) => (
            <Badge key={i} variant="outline" className="text-xs mr-1 mb-1">{prop}</Badge>
          ))}
        </div>
      )}
      <ul className="text-xs text-[#5A4A3A] dark:text-gray-300 space-y-1">
        {features.map((feature, i) => (
          <li key={i}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}

function FunctionDoc({ name, description, input, output, secrets }) {
  return (
    <div className="border border-[#E5DCC8] dark:border-gray-700 rounded-lg p-4">
      <h4 className="font-bold text-[#6B4423] dark:text-[#C9A961] font-mono mb-1">{name}</h4>
      <p className="text-sm text-[#8B7355] dark:text-gray-400 mb-2">{description}</p>
      <div className="grid md:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#8B7355] dark:text-gray-400">Input: </span>
          <code className="text-[#2D5016] dark:text-green-400">{input}</code>
        </div>
        <div>
          <span className="text-[#8B7355] dark:text-gray-400">Output: </span>
          <code className="text-[#2D5016] dark:text-green-400">{output}</code>
        </div>
      </div>
      {secrets.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-[#8B7355] dark:text-gray-400">Secrets: </span>
          {secrets.map((s, i) => (
            <Badge key={i} variant="outline" className="text-xs mr-1">{s}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}