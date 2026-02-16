import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Coffee, Copy, Check, ChevronDown, ChevronRight,
  LayoutDashboard, Package, AlertCircle, Calendar, CheckSquare,
  Users, Settings, FileText, Calculator, DollarSign, Link as LinkIcon,
  ShoppingBag, Info, Truck, BarChart3, Download, Gift, Award, Plane
} from "lucide-react";

const dadosExemplo = {
  cafes: [
    { nome: "Alma Gourmet", forma: "Moído", localizacao: "Vila Velha", origem: "Alto Caxixe - Venda Nova do Imigrante", torra: "Média", estoque_por_embalagem: { "250g": 0, "500g": 0, "1kg": 0 }, is_private_label: true, precos_private_label: { "250g": 25, "500g": 50, "1kg": 100 } },
    { nome: "Intenso", forma: "Grão", localizacao: "Vila Velha", origem: "Alto Caxixe - Venda Nova do Imigrante", torra: "Média", estoque_por_embalagem: { "250g": 0 }, is_private_label: true, precos_private_label: { "250g": 35 } },
    { nome: "Chocolate", forma: "Grão", localizacao: "Vila Velha", estoque_por_embalagem: { "250g": 0 }, is_private_label: true, precos_private_label: { "250g": 35 } },
    { nome: "Amendoado", forma: "Grão", localizacao: "Vila Velha" }
  ],
  problemas: [
    { nome_cliente: "Henery Garção", email_cliente: "hgarcao@yahoo.com.br", telefone_cliente: "27992035992", descricao: "Atraso na entrega da remessa referente ao mês de JANEIRO...", tipo: "Logística", prioridade: "Média", status: "Aberto", data_abertura: "2026-01-28" },
    { nome_cliente: "Keylla Cunha", email_cliente: "keyllafcunha@gmail.com", telefone_cliente: "27998377920", descricao: "Compra dia 08/10 entregue em endereço errado...", tipo: "Logística", prioridade: "Urgente", status: "Aberto", data_abertura: "2025-11-12" }
  ],
  tarefas: [
    { titulo: "Pedido Findes", descricao: "Acompanhar email para o 2 pedido da findes, falar com daiane", status: "Em Revisão", prioridade: "Urgente", responsavel: "Weslley", tipo: "Atendimento", prazo: "2025-10-12", tempo_estimado: 48 }
  ],
  agendamentos: [
    { titulo: "Reunião com cliente Gourmet Express", descricao: "Apresentação de novos produtos e renovação de contrato", data_inicio: "2025-01-22T14:00:00", data_fim: "2025-01-22T16:00:00", local: "Escritório do cliente", tipo: "Visita Cliente", participantes: ["Mário"], status: "Confirmado" },
    { titulo: "Degustação com novo fornecedor", descricao: "Avaliar novos lotes de café especial da região de Caparaó", data_inicio: "2025-01-25T10:00:00", data_fim: "2025-01-25T12:00:00", local: "Vila Velha - Sala de Degustação", tipo: "Degustação", participantes: ["Mário", "Fernando"], status: "Agendado" }
  ],
  clientes: [
    { nome: "Aurélio", localizacao: "Vila Velha", ativo: true },
    { nome: "Dani Pimenta", localizacao: "Vila Velha", ativo: true },
    { nome: "Águia Branca", localizacao: "Vila Velha", ativo: true },
    { nome: "Sicoob Central", localizacao: "Vila Velha", ativo: true }
  ],
  reservas: [
    { cliente_nome: "Sicoob Central", cafe_nome: "Amendoado", cafe_forma: "Grão", embalagem: "500g", quantidade_pacotes: 30, data_reserva: "2025-11-14", status: "Ativa", observacoes: "Evento dia 19" },
    { cliente_nome: "Sicoob Central", cafe_nome: "Amendoado", cafe_forma: "Grão", embalagem: "500g", quantidade_pacotes: 12, data_reserva: "2025-11-14", status: "Ativa", observacoes: "Faturamento vai ser por outra associação" },
    { cliente_nome: "Sicoob Central", cafe_nome: "Amendoado", cafe_forma: "Grão", embalagem: "500g", quantidade_pacotes: 16, data_reserva: "2025-11-05", status: "Entregue" }
  ]
};

const prompts = {
  dashboard: {
    titulo: "Dashboard Operacional",
    icon: LayoutDashboard,
    descricao: "Tela inicial com visão geral de KPIs, estatísticas e atividades recentes",
    prompt: `# PROMPT PARA RECRIAR: Dashboard Operacional

## OBJETIVO
Criar uma página de dashboard operacional para sistema de gestão de torrefação de café que exiba KPIs principais, estatísticas em tempo real, atividades recentes e alertas.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Dashboard Operacional"
- Subtítulo: "Visão geral da operação [Nome da Empresa]"
- Sem botões de ação no header

### 2. CARDS DE ESTATÍSTICAS (Grid 4 colunas desktop, 2 mobile)

**Card 1 - Caixas em Trânsito**
- Ícone: Package
- Cor: Gradiente marrom (#6B4423 → #8B5A2B)
- Valor: Contagem de caixas com status "Em Trânsito"
- Subtexto: "de X total"
- Dados: Entidade Caixa, filtro status === "Em Trânsito"

**Card 2 - Estoque Total**
- Ícone: Coffee
- Cor: Gradiente verde (#2D5016 → #3D6B1F)
- Valor: Soma em kg (calculado por embalagem)
- Subtexto: "X tipos de café"
- Dados: Entidade Cafe, somar estoque_por_embalagem convertendo para kg

**Card 3 - Chamados Abertos**
- Ícone: AlertCircle
- Cor: Gradiente laranja (#D97706 → #EA580C)
- Valor: Contagem de problemas não resolvidos/cancelados
- Subtexto: "de X total"
- Dados: Entidade Problema, filtro status !== "Resolvido" AND !== "Cancelado"

**Card 4 - Próximos Agendamentos**
- Ícone: Calendar
- Cor: Gradiente dourado (#C9A961 → #B8935A)
- Valor: Contagem de agendamentos futuros não cancelados
- Subtexto: "nos próximos dias"
- Dados: Entidade Agendamento, filtro data_inicio > hoje AND status !== "Cancelado"

### 3. SEÇÃO DE SOLICITAÇÕES DE EVENTOS
- Card com lista das últimas solicitações de eventos
- Exibir: cliente_nome, data_evento, status, kg_total_calculado
- Ação: Link para detalhes
- Dados: Entidade SolicitacaoEvento, ordenado por -created_date

### 4. GRID DE ATIVIDADES (3 colunas desktop)

**Coluna Esquerda (2/3 largura)**
- Componente: RecentActivity
- Título: "Atividade Recente - Logística"
- Lista das últimas caixas movimentadas
- Exibir: numero_identificacao, origem → destino, status, data
- Dados: Entidade Caixa, ordenado por -created_date

**Coluna Direita (1/3 largura)**
- NotificationPanel: Alertas e notificações
- ExportarDadosCard: Atalho para exportação
- ApiConsultaCard: Consulta rápida de dados

## ENTIDADES NECESSÁRIAS

### Caixa
{
  numero_identificacao: string (required),
  origem: enum ["Venda Nova", "Vila Velha"],
  destino: enum ["Venda Nova", "Vila Velha"],
  status: enum ["Aguardando Envio", "Em Trânsito", "Entregue", "Problema"],
  responsavel: string,
  conteudo: string,
  data_envio: date,
  data_entrega_real: date
}

### Cafe
{
  nome: string (required),
  forma: enum ["Grão", "Moído"],
  estoque_por_embalagem: object { "10g": number, "18g": number, "100g": number, "250g": number, "500g": number, "1kg": number },
  localizacao: enum ["Vila Velha", "Venda Nova"]
}

### Problema
{
  nome_cliente: string (required),
  email_cliente: email (required),
  descricao: string (required),
  tipo: enum ["Logística", "Estoque", "Cliente", "Fornecedor", "Equipamento", "Qualidade", "Outro"],
  prioridade: enum ["Baixa", "Média", "Alta", "Urgente"],
  status: enum ["Aberto", "Em Andamento", "Aguardando", "Resolvido", "Cancelado"],
  responsavel: string
}

### Agendamento
{
  titulo: string (required),
  data_inicio: datetime (required),
  data_fim: datetime (required),
  local: string,
  tipo: enum ["Reunião", "Visita Cliente", "Fornecedor", "Evento", "Degustação", "Treinamento", "Outro"],
  status: enum ["Agendado", "Confirmado", "Em Andamento", "Concluído", "Cancelado"]
}

### SolicitacaoEvento
{
  cliente_nome: string (required),
  data_evento: date (required),
  local_evento: string (required),
  kg_total_calculado: number,
  status: enum ["Pendente", "Em Análise", "Aprovada", "Cancelada"]
}

## COMPONENTES NECESSÁRIOS

### StatsCard
Props: title, value, icon, gradient, subtext
- Card com gradiente no topo
- Ícone decorativo
- Valor grande centralizado
- Texto secundário
- Animação de entrada (framer-motion)

### RecentActivity
Props: title, items
- Lista scrollável
- Cada item: ícone de status, descrição, timestamp
- Badge colorido por status

### NotificationPanel
- Sem props
- Busca alertas internos
- Exibe ícones de prioridade

### SolicitacoesEventos
Props: solicitacoes, onUpdate
- Grid de cards de solicitações
- Ações rápidas de aprovação

## FUNCIONALIDADES

1. Pull-to-refresh para recarregar dados (mobile)
2. Auto-refresh ao retornar à aba
3. Cálculo de estoque em kg:
   - 10g = 0.01kg, 18g = 0.018kg, 100g = 0.1kg
   - 250g = 0.25kg, 500g = 0.5kg, 1kg = 1kg
4. Loading spinner durante carregamento
5. Dark mode support

## ESTILO VISUAL
- Background: Gradiente creme (#F5F1E8) → branco
- Cards: Fundo branco com blur, borda #E5DCC8
- Cores principais: Marrom #6B4423, Dourado #C9A961
- Tipografia: Títulos bold, subtextos em #8B7355
- Responsivo: Mobile-first, grid adaptativo

## QUERIES DE DADOS
\`\`\`javascript
const [caixas, cafes, problemas, agendamentos, solicitacoes] = await Promise.all([
  Caixa.list("-created_date"),
  Cafe.list("-created_date"),
  Problema.list("-created_date"),
  Agendamento.list("-data_inicio"),
  SolicitacaoEvento.list("-created_date")
]);
\`\`\`

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: Após criar todas as entidades e a estrutura do sistema, insira os dados abaixo como registros iniciais para popular o banco de dados.

### Inserir na Entidade "Cafe":
\`\`\`json
[
  { "nome": "Alma Gourmet", "forma": "Moído", "localizacao": "Vila Velha", "origem": "Alto Caxixe - Venda Nova do Imigrante", "torra": "Média", "is_private_label": true, "precos_private_label": { "250g": 25, "500g": 50, "1kg": 100 } },
  { "nome": "Intenso", "forma": "Grão", "localizacao": "Vila Velha", "origem": "Alto Caxixe - Venda Nova do Imigrante", "torra": "Média", "is_private_label": true, "precos_private_label": { "250g": 35 } },
  { "nome": "Chocolate", "forma": "Grão", "localizacao": "Vila Velha", "is_private_label": true, "precos_private_label": { "250g": 35 } },
  { "nome": "Amendoado", "forma": "Grão", "localizacao": "Vila Velha" }
]
\`\`\`

### Inserir na Entidade "Problema":
\`\`\`json
[
  { "nome_cliente": "Henery Garção", "email_cliente": "hgarcao@yahoo.com.br", "telefone_cliente": "27992035992", "descricao": "Atraso na entrega da remessa referente ao mês de JANEIRO", "tipo": "Logística", "prioridade": "Média", "status": "Aberto", "data_abertura": "2026-01-28" },
  { "nome_cliente": "Keylla Cunha", "email_cliente": "keyllafcunha@gmail.com", "telefone_cliente": "27998377920", "descricao": "Compra dia 08/10 entregue em endereço errado", "tipo": "Logística", "prioridade": "Urgente", "status": "Aberto", "data_abertura": "2025-11-12" }
]
\`\`\`

### Inserir na Entidade "Agendamento":
\`\`\`json
[
  { "titulo": "Reunião com cliente Gourmet Express", "descricao": "Apresentação de novos produtos e renovação de contrato", "data_inicio": "2025-01-22T14:00:00", "data_fim": "2025-01-22T16:00:00", "local": "Escritório do cliente", "tipo": "Visita Cliente", "participantes": ["Mário"], "status": "Confirmado" },
  { "titulo": "Degustação com novo fornecedor", "descricao": "Avaliar novos lotes de café especial da região de Caparaó", "data_inicio": "2025-01-25T10:00:00", "data_fim": "2025-01-25T12:00:00", "local": "Vila Velha - Sala de Degustação", "tipo": "Degustação", "participantes": ["Mário", "Fernando"], "status": "Agendado" }
]
\`\`\``,
    entidades: ["Caixa", "Cafe", "Problema", "Agendamento", "SolicitacaoEvento"],
    componentes: ["StatsCard", "RecentActivity", "NotificationPanel", "SolicitacoesEventos", "ApiConsultaCard", "ExportarDadosCard", "PullToRefresh"]
  },

  tarefas: {
    titulo: "Quadro de Tarefas (Kanban)",
    icon: CheckSquare,
    descricao: "Sistema Kanban completo para gestão de tarefas com drag-and-drop",
    prompt: `# PROMPT PARA RECRIAR: Quadro de Tarefas (Kanban)

## OBJETIVO
Criar um sistema de gerenciamento de tarefas estilo Kanban com colunas de status, drag-and-drop, filtros e estatísticas.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Ícone: CheckSquare
- Título: "Quadro de Tarefas"
- Subtítulo: "Organize e gerencie as demandas da equipe"
- Botão: "Nova Tarefa" (abre modal)

### 2. ESTATÍSTICAS
Componente TarefaStats exibindo:
- Total de tarefas
- Tarefas por status (A Fazer, Em Andamento, Em Revisão, Concluído)
- Tarefas por prioridade
- Tarefas vencidas (prazo < hoje e status !== Concluído)

### 3. BARRA DE BUSCA
- Input com ícone Search
- Busca por: título, descrição, responsável, tipo
- Filtro em tempo real

### 4. KANBAN BOARD

**Colunas (4 colunas)**
1. A Fazer - Cor: Cinza
2. Em Andamento - Cor: Azul
3. Em Revisão - Cor: Amarelo
4. Concluído - Cor: Verde

**Cada Coluna:**
- Header com título e contador
- Lista de cards draggable
- Área de drop

**Cada Card de Tarefa:**
- Título
- Badges: Prioridade (colorido), Tipo
- Etiquetas personalizadas
- Responsável
- Prazo (com indicador de atraso)
- Menu de ações: Editar, Excluir

### 5. MODAL DE FORMULÁRIO (TarefaFormModal)

**Campos:**
- titulo: Input text (required)
- descricao: Textarea
- status: Select ["A Fazer", "Em Andamento", "Em Revisão", "Concluído"]
- prioridade: Select ["Baixa", "Média", "Alta", "Urgente"]
- tipo: Select ["Desenvolvimento", "Logística", "Estoque", "Atendimento", "Administrativo", "Outro"]
- responsavel: Select (lista de responsáveis ativos)
- prazo: Date picker
- data_inicio: Date picker
- tempo_estimado: Number (horas)
- etiquetas: Multi-select (lista de EtiquetaProblema)
- observacoes: Textarea

## ENTIDADES NECESSÁRIAS

### Tarefa
{
  titulo: string (required),
  descricao: string,
  status: enum ["A Fazer", "Em Andamento", "Em Revisão", "Concluído"] (default: "A Fazer"),
  prioridade: enum ["Baixa", "Média", "Alta", "Urgente"] (default: "Média"),
  tipo: enum ["Desenvolvimento", "Logística", "Estoque", "Atendimento", "Administrativo", "Outro"],
  responsavel: string,
  prazo: date,
  data_inicio: date,
  data_conclusao: date,
  tempo_estimado: number,
  etiquetas: array[string], // IDs das etiquetas
  observacoes: string
}

### EtiquetaProblema (reutilizada)
{
  nome: string (required),
  cor: string (hex color),
  descricao: string
}

### Responsavel
{
  nome: string (required),
  email: email (required),
  cargo: string,
  area: enum ["Logística", "Estoque", "Atendimento", "Geral"],
  ativo: boolean (default: true)
}

## COMPONENTES NECESSÁRIOS

### TarefaKanban
Props: tarefas, etiquetas, responsaveis, onStatusChange, onEdit, onDelete
- Implementar @hello-pangea/dnd para drag-and-drop
- 4 colunas com Droppable
- Cards com Draggable
- Callback onStatusChange ao mover card

### TarefaStats
Props: tarefas
- Grid de 4 cards de estatística
- Cálculos de métricas

### TarefaFormModal
Props: open, onClose, onSave, tarefa, etiquetasDisponiveis, responsaveisDisponiveis
- Dialog/Modal com formulário
- Modo criação e edição
- Validação de campos required

## FUNCIONALIDADES

1. **Drag and Drop:**
   - Biblioteca: @hello-pangea/dnd
   - Ao soltar: atualizar status da tarefa
   - Se status = "Concluído": preencher data_conclusao automaticamente

2. **Busca:**
   - Filtrar tarefas por título, descrição, responsável ou tipo
   - Case-insensitive

3. **CRUD:**
   - Criar nova tarefa
   - Editar tarefa existente
   - Excluir com confirmação

4. **Cores de Prioridade:**
   - Baixa: Azul
   - Média: Amarelo
   - Alta: Laranja
   - Urgente: Vermelho

## QUERIES DE DADOS
\`\`\`javascript
const [tarefasData, etiquetasData, responsaveisData] = await Promise.all([
  Tarefa.list("-created_date"),
  EtiquetaProblema.list(),
  Responsavel.filter({ ativo: true })
]);
\`\`\`

## ESTILO VISUAL
- Colunas com scroll vertical individual
- Cards com sombra suave, arredondamento
- Indicador visual de arrasto
- Animações suaves de transição
- Badges coloridos por prioridade/tipo

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: Após criar a entidade Tarefa e seus componentes, insira os dados abaixo:

### Inserir na Entidade "Tarefa":
\`\`\`json
[
  { "titulo": "Pedido Findes", "descricao": "Acompanhar email para o 2 pedido da findes, falar com daiane", "status": "Em Revisão", "prioridade": "Urgente", "responsavel": "Weslley", "tipo": "Atendimento", "prazo": "2025-10-12", "tempo_estimado": 48 }
]
\`\`\``,
    entidades: ["Tarefa", "EtiquetaProblema", "Responsavel"],
    componentes: ["TarefaKanban", "TarefaFormModal", "TarefaStats"]
  },

  logistica: {
    titulo: "Controle Logístico",
    icon: Package,
    descricao: "Gestão de movimentação de caixas entre unidades com scan de etiquetas",
    prompt: `# PROMPT PARA RECRIAR: Controle Logístico

## OBJETIVO
Criar um sistema de controle de movimentação de caixas/pacotes entre unidades, com funcionalidades de scan de etiquetas, processamento em lote e rastreamento.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Controle Logístico"
- Subtítulo: "Acompanhamento de movimentação de caixas"
- Botões:
  1. "Processar Lote" (laranja) - Upload de múltiplas imagens
  2. "Escanear Etiqueta" (outline) - Scan via câmera
  3. "Nova Caixa" (marrom) - Formulário manual

### 2. SELEÇÃO EM MASSA
- Checkbox "Selecionar todas"
- Contador de selecionadas
- Botão "Excluir Selecionadas" (vermelho, aparece se seleção > 0)

### 3. FILTROS
- Input de busca: número, conteúdo, responsável
- Tabs de status:
  - Todas (contador)
  - Aguardando (contador)
  - Em Trânsito (contador)
  - Entregues (contador)
  - Problemas (contador)

### 4. GRID DE CAIXAS
- Grid 3 colunas (desktop), 2 (tablet), 1 (mobile)
- Cada card com checkbox de seleção

### 5. MODAIS

**CaixaFormModal:**
- numero_identificacao: Input (required)
- origem: Select ["Venda Nova", "Vila Velha"]
- destino: Select ["Venda Nova", "Vila Velha"]
- status: Select ["Aguardando Envio", "Em Trânsito", "Entregue", "Problema"]
- responsavel: Input
- tem_etiqueta: Checkbox
- codigo_etiqueta: Input
- meio_transporte: Select ["Transportadora", "Correios", "Entrega Direta", "Outro"]
- codigo_rastreamento: Input
- conteudo: Textarea
- data_envio: Date
- data_entrega_prevista: Date
- data_entrega_real: Date
- observacoes: Textarea

**ScanLabelModal:**
- Acesso à câmera do dispositivo
- Captura de imagem
- Envio para AI (InvokeLLM) para extração de dados
- Retorno: dados estruturados da etiqueta
- Auto-preenchimento do formulário

**BatchImageUploadModal:**
- Upload múltiplo de imagens
- Processamento em fila
- Barra de progresso
- Criação automática de caixas

## ENTIDADE CAIXA (Completa)

{
  numero_identificacao: string (required),
  origem: enum ["Venda Nova", "Vila Velha"] (default: "Venda Nova"),
  destino: enum ["Venda Nova", "Vila Velha"] (default: "Vila Velha"),
  status: enum ["Aguardando Envio", "Em Trânsito", "Entregue", "Problema"] (default: "Aguardando Envio"),
  responsavel: string,
  tem_etiqueta: boolean (default: false),
  codigo_etiqueta: string,
  meio_transporte: enum ["Transportadora", "Correios", "Entrega Direta", "Outro"],
  codigo_rastreamento: string,
  conteudo: string,
  data_envio: date,
  data_entrega_prevista: date,
  data_entrega_real: date,
  observacoes: string
}

## COMPONENTES NECESSÁRIOS

### CaixaCard
Props: caixa, onEdit, onDelete
- Badge de status com cor
- Ícones de origem → destino
- Responsável
- Data de envio
- Menu dropdown: Editar, Excluir

### ScanLabelModal
Props: open, onClose, onDataExtracted
- Acesso a navigator.mediaDevices.getUserMedia
- Canvas para captura
- Integração com AI para OCR
- Parse de dados de etiqueta

### BatchImageUploadModal
Props: open, onClose, onComplete
- Input file multiple
- Preview de imagens
- Processamento sequencial
- Status de cada imagem

## FUNCIONALIDADES

1. **Pull-to-refresh**
2. **Tab-refresh listener**
3. **Optimistic UI updates**
4. **Seleção múltipla com checkbox**
5. **Exclusão em lote**
6. **Filtro por status**
7. **Busca textual**

## INTEGRAÇÃO AI (Scan de Etiqueta)
\`\`\`javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: \`Extraia os dados desta etiqueta de envio:
    - Número de identificação
    - Origem
    - Destino
    - Código de rastreamento
    - Transportadora
    Retorne JSON estruturado.\`,
  file_urls: [imageUrl],
  response_json_schema: {
    type: "object",
    properties: {
      numero_identificacao: { type: "string" },
      origem: { type: "string" },
      destino: { type: "string" },
      codigo_rastreamento: { type: "string" },
      transportadora: { type: "string" }
    }
  }
});
\`\`\`

## CORES DE STATUS
- Aguardando Envio: Cinza
- Em Trânsito: Azul
- Entregue: Verde
- Problema: Vermelho

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: A entidade Caixa pode começar vazia. Dados serão inseridos conforme movimentações reais de logística.

### Exemplo de Inserção na Entidade "Caixa":
\`\`\`json
[
  { "numero_identificacao": "CX-001", "origem": "Venda Nova", "destino": "Vila Velha", "status": "Aguardando Envio", "responsavel": "Fernando", "conteudo": "Pacotes de café 250g", "data_envio": "2026-02-15" }
]
\`\`\``,
    entidades: ["Caixa"],
    componentes: ["CaixaCard", "CaixaFormModal", "ScanLabelModal", "BatchImageUploadModal", "PullToRefresh"]
  },

  estoque: {
    titulo: "Gestão de Estoque",
    icon: Coffee,
    descricao: "Controle de cafés, reservas para clientes e gestão de inventário por embalagem",
    prompt: `# PROMPT PARA RECRIAR: Gestão de Estoque

## OBJETIVO
Criar sistema completo de gestão de estoque de cafés com controle por embalagem, reservas para clientes, e rastreamento de entregas.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Gestão de Estoque"
- Subtítulo: "Controle de cafés e reservas para clientes"

### 2. TABS PRINCIPAIS
1. **Estoque de Cafés** - Lista de produtos
2. **Reservas** - Visualização por cliente
3. **Clientes** - Cadastro e preços

### 3. ABA ESTOQUE

**Botões:**
- "Nova Reserva" (outline)
- "Novo Café" (principal)

**EstoqueStats:**
- Total em estoque (kg)
- Total de tipos de café
- Reservas ativas
- Entregas pendentes

**Filtros:**
- Busca por nome ou localização
- Tabs: Todos | Em Grão | Moído

**Grid de Cafés:**
- Cards com informações detalhadas
- Estoque por embalagem
- Reservas ativas do café
- Ações: Editar, Excluir, Reservar, Adicionar Estoque

### 4. ABA RESERVAS

**ReservasTab:**
- Agrupamento por cliente
- Cada grupo mostra todos os cafés reservados
- Status: Ativa, Entregue, Cancelada
- Ações: Editar, Cancelar, Marcar como Entregue

### 5. ABA CLIENTES

**ClientesTab:**
- Lista de clientes cadastrados
- Reservas por cliente
- Preços personalizados
- Ações: Editar, Ver reservas

## ENTIDADES NECESSÁRIAS

### Cafe
{
  nome: string (required),
  forma: enum ["Grão", "Moído"] (default: "Grão"),
  quantidade_pacotes: number, // Calculado automaticamente
  estoque_por_embalagem: {
    "10g": number (default: 0),
    "18g": number (default: 0),
    "100g": number (default: 0),
    "250g": number (default: 0),
    "500g": number (default: 0),
    "1kg": number (default: 0)
  },
  embalagens_disponiveis: array[enum] (default: ["250g"]),
  localizacao: enum ["Vila Velha", "Venda Nova"],
  data_entrada: date,
  observacoes: string,
  is_private_label: boolean (default: false),
  precos_private_label: object,
  notas_degustacao: string,
  origem: string,
  torra: enum ["Clara", "Média", "Escura"]
}

### Cliente
{
  nome: string (required),
  email: email,
  telefone: string,
  endereco: string,
  localizacao: enum ["Vila Velha", "Venda Nova", "Outro"],
  observacoes: string,
  ativo: boolean (default: true)
}

### ReservaCafe
{
  cliente_id: string (required),
  cliente_nome: string (required),
  cafe_id: string (required),
  cafe_nome: string (required),
  cafe_forma: enum ["Grão", "Moído"] (required),
  embalagem: enum ["10g", "18g", "100g", "250g", "500g", "1kg"] (default: "250g"),
  quantidade_pacotes: number (required),
  data_reserva: date,
  data_entrega: date,
  status: enum ["Ativa", "Entregue", "Cancelada"] (default: "Ativa"),
  observacoes: string
}

## COMPONENTES NECESSÁRIOS

### CafeCard
Props: cafe, disponivel, reservas, onEdit, onDelete, onReservar, onEditReserva, onAdicionarEstoque
- Imagem/ícone do café
- Nome e forma (badge)
- Localização
- Grid de estoque por embalagem
- Lista de reservas ativas (mini)
- Menu de ações

### CafeFormModal
Props: open, onClose, onSave, cafe
- Todos os campos da entidade
- Grid de estoque por embalagem com inputs numéricos
- Multi-select de embalagens disponíveis

### ReservasModal
Props: open, onClose, cafe, cafes, clientes, onUpdate
- Seleção de cliente (autocomplete)
- Seleção de café (se não pré-selecionado)
- Seleção de embalagem
- Quantidade
- Data da reserva
- Observações

### ReservaEditModal
Props: open, onClose, reservaGrupo, cafes, onSave
- Edição de reserva existente
- Possibilidade de adicionar mais cafés
- Alteração de status
- Ao marcar como "Entregue": diminuir estoque automaticamente

### ReservasTab
Props: reservas, clientes, cafes, onEditReserva, onDeleteReserva, onMarcarComoEntregue
- Agrupamento por cliente
- Filtros por status
- Ações em massa

### ClientesTab
Props: clientes, reservas, cafes, onUpdate, onEditReserva
- CRUD de clientes
- Visualização de reservas por cliente
- Gestão de preços personalizados

### AdicionarEstoqueModal
Props: open, onClose, cafe, onSave
- Incrementar estoque de embalagem específica
- Atualização automática do total

### EstoqueStats
Props: cafes, reservas
- Cards com métricas

## FUNCIONALIDADES

1. **Cálculo de Estoque Total:**
\`\`\`javascript
const getPesoEmbalagem = (embalagem) => {
  const pesos = { "10g": 0.01, "18g": 0.018, "100g": 0.1, "250g": 0.25, "500g": 0.5, "1kg": 1 };
  return pesos[embalagem] || 0.25;
};

const estoqueTotal = cafes.reduce((sum, cafe) => {
  const kgCafe = Object.entries(cafe.estoque_por_embalagem || {}).reduce((sumCafe, [emb, qtd]) => {
    return sumCafe + (qtd * getPesoEmbalagem(emb));
  }, 0);
  return sum + kgCafe;
}, 0);
\`\`\`

2. **Cálculo de Disponível:**
\`\`\`javascript
const calcularDisponivel = (cafe) => {
  const reservasAtivas = reservas.filter(r => r.cafe_id === cafe.id && r.status === "Ativa");
  const totalReservado = reservasAtivas.reduce((sum, r) => sum + r.quantidade_pacotes, 0);
  return (cafe.quantidade_pacotes || 0) - totalReservado;
};
\`\`\`

3. **Marcar como Entregue:**
- Atualizar status da reserva para "Entregue"
- Diminuir estoque_por_embalagem do café
- Recalcular quantidade_pacotes total

4. **Validação ao Excluir Café:**
- Verificar se há reservas ativas
- Bloquear exclusão se houver

5. **Optimistic UI updates**
6. **Pull-to-refresh**

## FLUXO DE RESERVA

1. Selecionar cliente (ou criar novo)
2. Selecionar café(s)
3. Para cada café: escolher embalagem e quantidade
4. Salvar reserva (não altera estoque)
5. Quando entregar: marcar como entregue (altera estoque)

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: Após criar todas as entidades (Cafe, Cliente, ReservaCafe), insira os dados abaixo na ordem indicada para manter as referências.

### 1. Inserir na Entidade "Cafe":
\`\`\`json
[
  { "nome": "Alma Gourmet", "forma": "Moído", "localizacao": "Vila Velha", "origem": "Alto Caxixe - Venda Nova do Imigrante", "torra": "Média", "is_private_label": true, "precos_private_label": { "250g": 25, "500g": 50, "1kg": 100 } },
  { "nome": "Intenso", "forma": "Grão", "localizacao": "Vila Velha", "origem": "Alto Caxixe", "torra": "Média", "is_private_label": true, "precos_private_label": { "250g": 35 } },
  { "nome": "Chocolate", "forma": "Grão", "localizacao": "Vila Velha", "is_private_label": true, "precos_private_label": { "250g": 35 } },
  { "nome": "Amendoado", "forma": "Grão", "localizacao": "Vila Velha" }
]
\`\`\`

### 2. Inserir na Entidade "Cliente":
\`\`\`json
[
  { "nome": "Aurélio", "localizacao": "Vila Velha", "ativo": true },
  { "nome": "Dani Pimenta", "localizacao": "Vila Velha", "ativo": true },
  { "nome": "Águia Branca", "localizacao": "Vila Velha", "ativo": true },
  { "nome": "Sicoob Central", "localizacao": "Vila Velha", "ativo": true }
]
\`\`\`

### 3. Inserir na Entidade "ReservaCafe" (após ter IDs dos Cafés e Clientes):
\`\`\`json
[
  { "cliente_nome": "Sicoob Central", "cafe_nome": "Amendoado", "cafe_forma": "Grão", "embalagem": "500g", "quantidade_pacotes": 30, "status": "Ativa", "observacoes": "Evento dia 19" },
  { "cliente_nome": "Sicoob Central", "cafe_nome": "Amendoado", "cafe_forma": "Grão", "embalagem": "500g", "quantidade_pacotes": 12, "status": "Ativa", "observacoes": "Faturamento vai ser por outra associação" },
  { "cliente_nome": "Sicoob Central", "cafe_nome": "Amendoado", "cafe_forma": "Grão", "embalagem": "500g", "quantidade_pacotes": 16, "status": "Entregue" }
]
\`\`\``,
    entidades: ["Cafe", "Cliente", "ReservaCafe", "PrecoCafe"],
    componentes: ["CafeCard", "CafeFormModal", "ReservasModal", "ReservaEditModal", "ReservasTab", "ClientesTab", "AdicionarEstoqueModal", "EstoqueStats", "PullToRefresh"]
  },

  problemas: {
    titulo: "Gestão de Chamados",
    icon: AlertCircle,
    descricao: "Sistema de tickets/chamados com visualização em lista e Kanban",
    prompt: `# PROMPT PARA RECRIAR: Gestão de Chamados

## OBJETIVO
Criar sistema de gerenciamento de chamados/tickets de clientes com visualização em lista e Kanban, etiquetas personalizadas, timeline de atualizações e notificações.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Gestão de Chamados"
- Subtítulo: "Registro e acompanhamento de chamados de clientes"
- Botões:
  1. "Etiquetas" (outline) - Gerenciar etiquetas
  2. "Novo Chamado" (principal) - Criar chamado

### 2. ESTATÍSTICAS (ProblemaStats)
- Total de chamados
- Abertos
- Em Andamento
- Resolvidos
- Por prioridade

### 3. CONTROLES
- Toggle: Lista | Kanban
- Filtro por status (apenas modo lista)
- Input de busca

### 4. SELEÇÃO EM MASSA (modo lista)
- Checkbox selecionar todos
- Contador de selecionados
- Botão excluir em massa

### 5. VISUALIZAÇÕES

**Modo Lista:**
- Cards verticais com checkbox
- ProblemaCard para cada item
- Ações: Editar, Excluir, Ver Detalhes

**Modo Kanban:**
- Colunas: Aberto, Em Andamento, Aguardando, Resolvido, Cancelado
- Drag-and-drop entre colunas
- Cards compactos

### 6. MODAIS

**ProblemaFormModal:**
- nome_cliente: Input (required)
- email_cliente: Email (required)
- telefone_cliente: Input
- descricao: Textarea (required)
- tipo: Select
- etiquetas: Multi-select
- prioridade: Select
- status: Select
- responsavel: Input
- solucao: Textarea (aparece se status = Resolvido)

**ProblemaDetalhesModal:**
- Informações completas do chamado
- Timeline de atualizações (AtualizacoesTimeline)
- Formulário para adicionar atualização
- Ações: Editar, Mudar status

**EtiquetasManager:**
- CRUD de etiquetas
- Cor picker
- Descrição

## ENTIDADES NECESSÁRIAS

### Problema
{
  nome_cliente: string (required),
  email_cliente: email (required),
  telefone_cliente: string,
  descricao: string (required),
  tipo: enum ["Logística", "Estoque", "Cliente", "Fornecedor", "Equipamento", "Qualidade", "Outro"],
  etiquetas: array[string], // IDs
  prioridade: enum ["Baixa", "Média", "Alta", "Urgente"] (default: "Média"),
  status: enum ["Aberto", "Em Andamento", "Aguardando", "Resolvido", "Cancelado"] (default: "Aberto"),
  responsavel: string,
  data_abertura: date,
  data_resolucao: date,
  solucao: string,
  ultima_interacao_equipe: datetime,
  tem_novas_atualizacoes: boolean (default: false)
}

### EtiquetaProblema
{
  nome: string (required),
  cor: string (hex) (required),
  descricao: string
}

### AtualizacaoProblema
{
  problema_id: string (required),
  tipo: enum ["Comentário", "Mudança Status", "Atribuição", "Resolução", "Interno"],
  mensagem: string (required),
  autor: string (required),
  visivel_cliente: boolean (default: true),
  notificar_cliente: boolean (default: false)
}

## COMPONENTES NECESSÁRIOS

### ProblemaCard
Props: problema, etiquetas, onEdit, onDelete, onViewDetails
- Badge de status
- Badge de prioridade
- Etiquetas coloridas
- Info do cliente
- Responsável
- Data de abertura
- Menu de ações

### ProblemaStats
Props: problemas
- Grid de estatísticas

### ProblemaKanban
Props: problemas, etiquetas, onStatusChange, onEdit
- 5 colunas
- @hello-pangea/dnd
- Cards draggable

### ProblemaFormModal
Props: open, onClose, onSave, problema, etiquetasDisponiveis
- Formulário completo
- Validação

### ProblemaDetalhesModal
Props: open, onClose, problema, etiquetas, onEdit, onUpdate
- Visualização detalhada
- Timeline de atualizações
- Formulário de nova atualização

### EtiquetasManager
Props: open, onClose
- CRUD de etiquetas
- Color picker

### AtualizacoesTimeline
Props: atualizacoes
- Timeline vertical
- Ícones por tipo
- Autor e data

## FUNCIONALIDADES

1. **Drag-and-drop no Kanban:**
   - Ao mover: atualizar status
   - Se mover para "Resolvido": preencher data_resolucao

2. **Notificações:**
   - Ao criar chamado: notificar responsáveis
   - Ao atualizar: opção de notificar cliente

3. **Timeline:**
   - Registrar cada mudança de status
   - Comentários internos e externos
   - Filtro por visibilidade

4. **Busca:**
   - Nome, email, descrição, responsável, etiquetas

5. **Cores de Prioridade:**
   - Baixa: Azul
   - Média: Amarelo
   - Alta: Laranja
   - Urgente: Vermelho

6. **Cores de Status:**
   - Aberto: Vermelho
   - Em Andamento: Azul
   - Aguardando: Amarelo
   - Resolvido: Verde
   - Cancelado: Cinza

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: Após criar as entidades Problema, EtiquetaProblema e AtualizacaoProblema, insira os dados abaixo:

### 1. Inserir na Entidade "EtiquetaProblema" (criar etiquetas primeiro):
\`\`\`json
[
  { "nome": "Urgente", "cor": "#DC2626", "descricao": "Problemas que precisam de atenção imediata" },
  { "nome": "Logística", "cor": "#2563EB", "descricao": "Problemas relacionados a entregas e transportes" },
  { "nome": "Estoque", "cor": "#16A34A", "descricao": "Problemas de estoque e inventário" }
]
\`\`\`

### 2. Inserir na Entidade "Problema":
\`\`\`json
[
  { "nome_cliente": "Henery Garção", "email_cliente": "hgarcao@yahoo.com.br", "telefone_cliente": "27992035992", "descricao": "Atraso na entrega da remessa referente ao mês de JANEIRO. Cliente aguardando há mais de 15 dias.", "tipo": "Logística", "prioridade": "Média", "status": "Aberto", "data_abertura": "2026-01-28" },
  { "nome_cliente": "Keylla Cunha", "email_cliente": "keyllafcunha@gmail.com", "telefone_cliente": "27998377920", "descricao": "Compra dia 08/10 entregue em endereço errado. Produto não foi recuperado ainda.", "tipo": "Logística", "prioridade": "Urgente", "status": "Aberto", "data_abertura": "2025-11-12" }
]
\`\`\``,
    entidades: ["Problema", "EtiquetaProblema", "AtualizacaoProblema", "Responsavel", "ConfiguracaoNotificacao"],
    componentes: ["ProblemaCard", "ProblemaStats", "ProblemaKanban", "ProblemaFormModal", "ProblemaDetalhesModal", "EtiquetasManager", "AtualizacoesTimeline", "PullToRefresh"]
  },

  agenda: {
    titulo: "Agenda de Compromissos",
    icon: Calendar,
    descricao: "Calendário interativo para gerenciar reuniões, visitas e eventos",
    prompt: `# PROMPT PARA RECRIAR: Agenda de Compromissos

## OBJETIVO
Criar uma agenda/calendário interativo para gerenciar compromissos, reuniões, visitas a clientes e eventos.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Agenda de Compromissos"
- Subtítulo: "Gerencie reuniões, visitas e eventos"
- Botão: "Novo Agendamento"

### 2. LAYOUT (Grid 3 colunas)

**Coluna Esquerda (1/3):**
- Componente Calendar
- Destaque de datas com eventos
- Seleção de data

**Coluna Direita (2/3):**
- Card: Agendamentos do dia selecionado
- Card: Próximos agendamentos

### 3. AGENDAMENTOS DO DIA

**Seleção em Massa:**
- Checkbox selecionar todos
- Botão excluir selecionados

**Lista:**
- AgendamentoCard para cada item
- Checkbox de seleção individual

### 4. PRÓXIMOS AGENDAMENTOS
- Lista compacta (max 5)
- Apenas futuros, não cancelados, não do dia selecionado

### 5. MODAL DE FORMULÁRIO

**Campos:**
- titulo: Input (required)
- descricao: Textarea
- data_inicio: DateTime picker (required)
- data_fim: DateTime picker (required)
- local: Input
- tipo: Select
- participantes: Tags input (array)
- link_google_calendar: URL input
- notificar_participantes: Checkbox
- status: Select

## ENTIDADE AGENDAMENTO

{
  titulo: string (required),
  descricao: string,
  data_inicio: datetime (required),
  data_fim: datetime (required),
  local: string,
  tipo: enum ["Reunião", "Visita Cliente", "Fornecedor", "Evento", "Degustação", "Treinamento", "Outro"],
  participantes: array[string],
  link_google_calendar: string,
  notificar_participantes: boolean (default: true),
  status: enum ["Agendado", "Confirmado", "Em Andamento", "Concluído", "Cancelado"] (default: "Agendado")
}

## COMPONENTES NECESSÁRIOS

### AgendamentoCard
Props: agendamento, onEdit, onDelete, compact (opcional)
- Título
- Horário (início - fim)
- Local
- Tipo (badge)
- Status (badge)
- Participantes (avatares/nomes)
- Menu de ações

**Modo Compact:**
- Layout horizontal
- Menos detalhes

### AgendamentoFormModal
Props: open, onClose, onSave, agendamento
- Formulário completo
- Date-time pickers com locale pt-BR
- Validação de data_fim > data_inicio

## FUNCIONALIDADES

1. **Calendário:**
   - Biblioteca: shadcn Calendar (react-day-picker)
   - Locale: pt-BR (date-fns)
   - Destacar datas com eventos (cor diferente)
   - Ao clicar em data: atualizar selectedDate

2. **Filtros:**
   - Agendamentos do dia: isSameDay(data_inicio, selectedDate)
   - Próximos: data_inicio > now AND status !== "Cancelado" AND !sameDay

3. **Seleção em Massa:**
   - Checkboxes
   - Excluir múltiplos

4. **CRUD:**
   - Criar, editar, excluir

5. **Notificações (opcional):**
   - Ao criar/editar com notificar_participantes: true
   - Enviar email para participantes

## CÓDIGO DO CALENDÁRIO COM EVENTOS
\`\`\`javascript
const datesWithEvents = agendamentos.map(a => new Date(a.data_inicio));

<Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  locale={ptBR}
  modifiers={{ hasEvent: datesWithEvents }}
  modifiersStyles={{
    hasEvent: {
      fontWeight: 'bold',
      backgroundColor: '#6B4423',
      color: 'white',
      borderRadius: '50%'
    }
  }}
/>
\`\`\`

## ESTILO VISUAL
- Calendário com destaque visual em datas com eventos
- Cards com cores por tipo de compromisso
- Layout responsivo: sidebar calendário em desktop, empilhado em mobile

## DADOS INICIAIS (INSERIR APÓS ESTRUTURAÇÃO)

⚠️ **IMPORTANTE**: Após criar a entidade Agendamento, insira os dados abaixo:

### Inserir na Entidade "Agendamento":
\`\`\`json
[
  { 
    "titulo": "Reunião com cliente Gourmet Express", 
    "descricao": "Apresentação de novos produtos e renovação de contrato", 
    "data_inicio": "2025-01-22T14:00:00", 
    "data_fim": "2025-01-22T16:00:00", 
    "local": "Escritório do cliente", 
    "tipo": "Visita Cliente", 
    "participantes": ["Mário"], 
    "status": "Confirmado",
    "notificar_participantes": true
  },
  { 
    "titulo": "Degustação com novo fornecedor", 
    "descricao": "Avaliar novos lotes de café especial da região de Caparaó", 
    "data_inicio": "2025-01-25T10:00:00", 
    "data_fim": "2025-01-25T12:00:00", 
    "local": "Vila Velha - Sala de Degustação", 
    "tipo": "Degustação", 
    "participantes": ["Mário", "Fernando"], 
    "status": "Agendado",
    "notificar_participantes": true
  }
]
\`\`\``,
    entidades: ["Agendamento"],
    componentes: ["AgendamentoCard", "AgendamentoFormModal"]
  },

  calculadoraEventos: {
    titulo: "Calculadora de Café para Eventos",
    icon: Calculator,
    descricao: "Calculadora para estimar quantidade de café necessária para eventos ou uso interno",
    prompt: `# PROMPT PARA RECRIAR: Calculadora de Café para Eventos

## OBJETIVO
Criar uma calculadora que estime a quantidade de café necessária para eventos ou uso interno em empresas, considerando diversos parâmetros.

## ESTRUTURA DA PÁGINA

### 1. TABS PRINCIPAIS
1. **Evento** - Cálculo para eventos pontuais
2. **Uso Interno** - Cálculo para consumo diário em empresas

### 2. ABA EVENTO

**Inputs:**
- publico_total: Number - Público total esperado
- taxa_adesao: Number (%) - Taxa de adesão ao café (padrão: 30%)
- dias_evento: Number - Quantidade de dias
- horas_por_dia: Number - Horas de atendimento por dia
- ml_por_copo: Number - ML por copo servido (padrão: 100ml)
- fator_perdas: Number (%) - Fator de perdas (padrão: 10%)

**Fórmula:**
\`\`\`
consumidores = publico_total * (taxa_adesao / 100)
copos_por_hora = 2 (média de consumo)
total_copos = consumidores * dias_evento * horas_por_dia * copos_por_hora
total_ml = total_copos * ml_por_copo
total_ml_com_perdas = total_ml * (1 + fator_perdas / 100)
total_kg = total_ml_com_perdas / 100000 * 7 (7g de café por 100ml)
\`\`\`

### 3. ABA USO INTERNO

**Inputs:**
- quantidade_funcionarios: Number
- xicaras_por_dia: Number - Xícaras por funcionário por dia (padrão: 3)
- tamanho_xicara: Select [100ml, 200ml]
- dias_evento: Number - Período em dias

**Fórmula:**
\`\`\`
consumo_diario_ml = xicaras_por_dia * tamanho_xicara
total_ml = quantidade_funcionarios * consumo_diario_ml * dias_evento
total_kg = total_ml / 100000 * 7
\`\`\`

### 4. RESULTADO

**Cards de Resultado:**
- Total em KG
- Total em pacotes de 250g
- Consumo por dia
- Consumo por hora (eventos)

**Calculadora de Embalagens:**
- Distribuição por tipo de embalagem
- Input para ajustar manualmente

### 5. DETALHAMENTO

**Parâmetros Utilizados:**
- Lista de todos os inputs com valores
- Fórmulas utilizadas
- Explicação do cálculo

## LÓGICA DE CÁLCULO

\`\`\`javascript
// Evento
const calcularEvento = () => {
  const consumidores = publico_total * (taxa_adesao / 100);
  const coposPorHora = 2;
  const totalCopos = consumidores * dias_evento * horas_por_dia * coposPorHora;
  const totalMl = totalCopos * ml_por_copo;
  const totalMlComPerdas = totalMl * (1 + fator_perdas / 100);
  const gramaPorMl = 7 / 100; // 7g para 100ml
  const totalGramas = totalMlComPerdas * gramaPorMl;
  const totalKg = totalGramas / 1000;
  
  return {
    consumidores,
    totalKg,
    pacotes250g: Math.ceil(totalKg / 0.25),
    consumoDiario: totalKg / dias_evento,
    consumoHora: totalKg / (dias_evento * horas_por_dia)
  };
};

// Uso Interno
const calcularInterno = () => {
  const consumoDiarioMl = xicaras_por_dia * tamanho_xicara;
  const totalMl = quantidade_funcionarios * consumoDiarioMl * dias_evento;
  const gramaPorMl = 7 / 100;
  const totalGramas = totalMl * gramaPorMl;
  const totalKg = totalGramas / 1000;
  
  return {
    totalKg,
    pacotes250g: Math.ceil(totalKg / 0.25),
    consumoDiario: totalKg / dias_evento
  };
};

// Distribuição por embalagem
const calcularPacotesPorEmbalagem = (kgTotal) => {
  return {
    "10g": Math.ceil(kgTotal / 0.01),
    "18g": Math.ceil(kgTotal / 0.018),
    "100g": Math.ceil(kgTotal / 0.1),
    "250g": Math.ceil(kgTotal / 0.25),
    "500g": Math.ceil(kgTotal / 0.5),
    "1kg": Math.ceil(kgTotal / 1)
  };
};
\`\`\`

## COMPONENTES

### CalculadoraForm
- Inputs numéricos com labels
- Valores padrão
- Validação

### ResultadoCard
- Cards com métricas
- Animação de atualização

### EmbalagemCalculator
- Grid de inputs por embalagem
- Cálculo automático

## ESTILO VISUAL
- Cards com gradientes
- Ícones ilustrativos
- Responsivo
- Feedback visual ao calcular`,
    entidades: [],
    componentes: ["CalculadoraForm", "ResultadoCard", "EmbalagemCalculator"]
  },

  integracaoYampi: {
    titulo: "Integração Yampi (E-commerce)",
    icon: ShoppingBag,
    descricao: "Dashboard para sincronização e gestão de produtos, pedidos e clientes do Yampi",
    prompt: `# PROMPT PARA RECRIAR: Integração Yampi (E-commerce)

## OBJETIVO
Criar dashboard de integração com a plataforma Yampi para sincronizar e gerenciar produtos, pedidos e clientes do e-commerce.

## ESTRUTURA DA PÁGINA

### 1. TABS PRINCIPAIS
1. **Produtos** - Gerenciamento de produtos
2. **Pedidos** - Visualização de pedidos
3. **Clientes** - Base de clientes
4. **Categorias** - Categorias de produtos
5. **Logs** - Histórico de sincronizações

### 2. ABA PRODUTOS

**Ações:**
- "Sincronizar Produtos" - Sync com Yampi
- "Novo Produto" - Criar localmente
- "Buscar na Yampi" - Search remoto
- "Exportar" / "Importar" - JSON

**Lista:**
- Grid de produtos
- Imagem, nome, SKU, preço, estoque
- Status de sincronização
- Ações: Editar, Ver variações

### 3. ABA PEDIDOS

**Ações:**
- "Sincronizar Pedidos"
- Filtros por status, data

**Lista:**
- Número do pedido
- Cliente
- Valor total
- Status (badge)
- Data
- Ações: Ver detalhes, Atualizar status

### 4. ABA CLIENTES

**Ações:**
- "Sincronizar Clientes"

**Lista:**
- Nome, email, telefone
- Total de pedidos
- Último pedido

### 5. MODAIS

**EditarProdutoModal:**
- Campos do produto
- Variações (SKUs)
- Estoque por variação

**PedidoDetalhesModal:**
- Informações do cliente
- Itens do pedido
- Endereço de entrega
- Histórico de status
- Transações

**PreviewImportacaoModal:**
- Preview antes de importar
- Seleção de itens
- Conflitos

## ENTIDADES NECESSÁRIAS

### ProdutoYampi
{
  yampi_id: string (required),
  nome: string,
  sku: string,
  preco: number,
  preco_comparativo: number,
  estoque: number,
  descricao: string,
  imagem_url: string,
  categoria_id: string,
  categoria_nome: string,
  ativo: boolean,
  variacoes: array[object],
  ultima_sincronizacao: datetime
}

### PedidoYampi
{
  yampi_id: string (required),
  numero_pedido: string (required),
  cliente_nome: string,
  cliente_email: string,
  cliente_telefone: string,
  cliente_cpf: string,
  status: string,
  status_pagamento: string,
  valor_total: number,
  valor_subtotal: number,
  valor_frete: number,
  valor_desconto: number,
  itens: array[{ produto_id, produto_nome, sku, quantidade, preco_unitario, preco_total, imagem_url }],
  endereco_entrega: { rua, numero, complemento, bairro, cidade, estado, cep, destinatario },
  data_pedido: datetime,
  forma_pagamento: string,
  codigo_rastreamento: string,
  transportadora: string,
  historico_status: array[{ status, data, observacao }],
  cupons: array[{ codigo, desconto }],
  ultima_sincronizacao: datetime
}

### ClienteYampi
{
  yampi_id: string (required),
  nome: string,
  email: string,
  telefone: string,
  cpf: string,
  total_pedidos: number,
  ultima_compra: datetime
}

### CategoriaYampi
{
  yampi_id: string (required),
  nome: string,
  slug: string,
  parent_id: string
}

### LogSincronizacaoYampi
{
  tipo: enum ["produtos", "pedidos", "clientes", "categorias"],
  status: enum ["sucesso", "erro", "parcial"],
  itens_processados: number,
  itens_criados: number,
  itens_atualizados: number,
  itens_erro: number,
  mensagem: string,
  detalhes: object
}

## FUNÇÕES BACKEND NECESSÁRIAS

### syncYampiProducts
- Busca produtos na API Yampi
- Compara com local
- Cria/atualiza registros

### syncYampiOrders
- Busca pedidos na API Yampi
- Importa novos pedidos

### syncYampiCustomers
- Busca clientes na API Yampi

### getYampiOrderById
- Busca detalhes de um pedido

### updateYampiOrderStatus
- Atualiza status no Yampi

### createYampiProduct
- Cria produto no Yampi

### updateYampiProduct
- Atualiza produto no Yampi

## SECRETS NECESSÁRIOS
- YAMPI_MERCHANT_ALIAS
- YAMPI_USER_TOKEN
- YAMPI_USER_SECRET_KEY

## API YAMPI

**Base URL:** https://api.dooki.com.br/v2/{alias}

**Headers:**
\`\`\`
User-Token: {token}
User-Secret-Key: {secret}
Content-Type: application/json
\`\`\`

**Endpoints:**
- GET /catalog/products - Listar produtos
- GET /orders - Listar pedidos
- GET /customers - Listar clientes
- PUT /orders/{id}/status - Atualizar status

## FLUXO DE SINCRONIZAÇÃO

1. Chamar API Yampi
2. Comparar com dados locais
3. Criar novos registros
4. Atualizar existentes
5. Registrar log
6. Exibir resultado`,
    entidades: ["ProdutoYampi", "PedidoYampi", "ClienteYampi", "CategoriaYampi", "LogSincronizacaoYampi"],
    componentes: ["EditarProdutoModal", "CriarProdutoModal", "PedidoDetalhesModal", "BuscarProdutoModal", "VariacoesModal", "PreviewImportacaoModal", "LogsSincronizacao", "AtualizarStatusModal"]
  },

  aReceber: {
    titulo: "A Receber",
    icon: DollarSign,
    descricao: "Controle de reservas a receber e demandas externas financeiras",
    prompt: `# PROMPT PARA RECRIAR: A Receber

## OBJETIVO
Criar sistema para controle de valores a receber de reservas de café e demandas externas, com checklist de acompanhamento.

## ESTRUTURA DA PÁGINA

### 1. TABS PRINCIPAIS
1. **Reservas** - Reservas ativas com checklist de itens
2. **Demandas Externas** - Demandas financeiras externas

### 2. ABA RESERVAS

**Estatísticas:**
- Total de reservas ativas
- Valor total a receber
- Itens pendentes no checklist

**Lista de Reservas:**
- Agrupadas por cliente
- Para cada reserva:
  - Nome do café, embalagem, quantidade
  - Checklist de itens (entrega, pagamento, NF, etc.)
  - Progresso do checklist
  - Ações: Gerenciar checklist, Marcar entregue

**ReservaChecklistCard:**
- Exibe reserva com progresso visual
- Botão para gerenciar itens do checklist
- Indicador de % completado

### 3. ABA DEMANDAS EXTERNAS

**Botão:** "Nova Demanda"

**Lista de Demandas:**
- Cards com informações:
  - Descrição, valor, status
  - Data de criação, prazo
  - Histórico de atualizações

**DemandaExternaCard:**
- Badge de status (Pendente, Parcial, Quitada)
- Valor e prazo
- Ações: Editar, Ver histórico

## ENTIDADES NECESSÁRIAS

### ItemChecklist
{
  nome: string (required),
  ordem: number,
  ativo: boolean (default: true)
}

### ClienteChecklistItem
{
  reserva_id: string (required),
  cliente_id: string (required),
  item_checklist_id: string (required),
  concluido: boolean (default: false),
  data_conclusao: datetime,
  observacao: string
}

### DemandaExterna
{
  descricao: string (required),
  valor: number (required),
  status: enum ["Pendente", "Parcial", "Quitada", "Cancelada"] (default: "Pendente"),
  cliente_nome: string,
  prazo: date,
  observacoes: string
}

### HistoricoDemanda
{
  demanda_id: string (required),
  tipo: enum ["Criação", "Pagamento", "Atualização", "Cancelamento"],
  valor: number,
  observacao: string,
  autor: string
}

## COMPONENTES NECESSÁRIOS

### ReservaChecklistCard
Props: reserva, cafe, itensChecklist, checklistStatus, onGerenciarChecklist
- Exibe reserva com progresso
- Barra de progresso visual
- Botão para abrir modal de checklist

### GerenciarItensChecklistModal
Props: open, onClose, reserva, itensDisponiveis, statusAtual, onSave
- Lista de itens do checklist
- Toggle para marcar/desmarcar
- Observações por item

### DemandaExternaCard
Props: demanda, onEdit, onViewHistory
- Informações da demanda
- Badge de status colorido
- Menu de ações

### DemandaExternaFormModal
Props: open, onClose, onSave, demanda
- Formulário completo
- Campos de valor com máscara

### HistoricoDemandaModal
Props: open, onClose, demanda, historico
- Timeline de eventos
- Valores e observações

## FUNCIONALIDADES

1. **Checklist por Reserva:**
   - Itens configuráveis (ex: "Entregue", "NF Emitida", "Pago")
   - Progresso visual por cliente/reserva

2. **Demandas Externas:**
   - CRUD completo
   - Histórico de pagamentos parciais
   - Status automático baseado em pagamentos

3. **Cálculo de Totais:**
   - Soma de valores a receber
   - Filtros por status`,
    entidades: ["ItemChecklist", "ClienteChecklistItem", "DemandaExterna", "HistoricoDemanda", "ReservaCafe"],
    componentes: ["ReservaChecklistCard", "GerenciarItensChecklistModal", "DemandaExternaCard", "DemandaExternaFormModal", "HistoricoDemandaModal"]
  },

  linksClientes: {
    titulo: "Links Clientes",
    icon: LinkIcon,
    descricao: "Geração de links personalizados para clientes visualizarem seus cafés e reservas",
    prompt: `# PROMPT PARA RECRIAR: Links Clientes

## OBJETIVO
Criar sistema para gerar links únicos (slugs) para clientes, permitindo acesso a uma página pública com seus cafés, preços e reservas.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Links para Clientes"
- Subtítulo: "Gere links personalizados para seus clientes"
- Botão: "Novo Link"

### 2. LISTA DE LINKS

**Para cada link:**
- Nome do cliente
- Slug gerado (ex: /cliente/joao-silva)
- Status: Ativo/Inativo
- Opção de mostrar preços
- Ações: Copiar link, Editar, Excluir, Visualizar

**ClienteSlugCard:**
- Badge de status
- URL copiável
- Toggle de preços
- Menu de ações

### 3. MODAL DE FORMULÁRIO

**Campos:**
- cliente_id: Select de clientes existentes
- slug: Input (auto-gerado a partir do nome)
- ativo: Toggle
- mostrar_precos: Toggle

## ENTIDADE CLIENTESLUG

{
  cliente_id: string (required),
  cliente_nome: string (required),
  slug: string (required, unique),
  ativo: boolean (default: true),
  mostrar_precos: boolean (default: false)
}

## PÁGINA PÚBLICA (PortalCliente)

**URL:** /PortalCliente?slug={slug}

**Conteúdo:**
- Nome do cliente
- Lista de cafés disponíveis
- Preços (se habilitado)
- Reservas ativas do cliente
- Formulário para solicitar reserva

## FUNCIONALIDADES

1. **Geração de Slug:**
   - Automático a partir do nome
   - Normalização (lowercase, sem acentos, hífen)
   - Validação de unicidade

2. **Página Pública:**
   - Não requer autenticação
   - Exibe apenas dados do cliente específico
   - Formulário de contato/solicitação

3. **Controle de Visibilidade:**
   - Toggle ativo/inativo
   - Toggle mostrar preços`,
    entidades: ["ClienteSlug", "Cliente", "Cafe", "PrecoCafe"],
    componentes: ["ClienteSlugCard", "ClienteSlugFormModal"]
  },

  infoCafes: {
    titulo: "Informações Cafés",
    icon: Info,
    descricao: "Gestão de informações detalhadas dos cafés para exibição pública",
    prompt: `# PROMPT PARA RECRIAR: Informações Cafés

## OBJETIVO
Criar sistema para gerenciar informações detalhadas de cafés que serão exibidas publicamente, incluindo notas sensoriais, origem, processamento, etc.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Informações dos Cafés"
- Subtítulo: "Gerencie as fichas técnicas dos cafés"
- Botão: "Nova Ficha"

### 2. LISTA DE CAFÉS

**Grid de cards:**
- Imagem do café
- Nome e origem
- Notas sensoriais (tags)
- Status: Publicado/Rascunho
- Ações: Editar, Visualizar público, Excluir

### 3. MODAL DE FORMULÁRIO

**Campos:**
- cafe_id: Select (vincular a café existente)
- nome_display: string
- origem_detalhada: string
- altitude: string
- variedade: string
- processamento: string
- torra: enum
- notas_sensoriais: array[string]
- descricao_completa: textarea
- harmonizacoes: array[string]
- metodos_preparo: array[string]
- imagem_url: upload
- publicado: boolean

## ENTIDADE INFOCAFE

{
  cafe_id: string,
  nome_display: string (required),
  origem_detalhada: string,
  altitude: string,
  variedade: string,
  processamento: string,
  torra: enum ["Clara", "Média", "Escura"],
  notas_sensoriais: array[string],
  descricao_completa: string,
  harmonizacoes: array[string],
  metodos_preparo: array[string],
  imagem_url: string,
  publicado: boolean (default: false)
}

## PÁGINA PÚBLICA (InfoCafePublico)

**URL:** /InfoCafePublico?id={id}

**Conteúdo:**
- Layout elegante com imagem
- Todas as informações formatadas
- Ícones para notas sensoriais
- Seção de métodos de preparo`,
    entidades: ["InfoCafe", "Cafe"],
    componentes: ["InfoCafeCard", "InfoCafeFormModal"]
  },

  submissoesProdutores: {
    titulo: "Submissões Produtores",
    icon: Coffee,
    descricao: "Gestão de submissões de cafés enviadas por produtores",
    prompt: `# PROMPT PARA RECRIAR: Submissões Produtores

## OBJETIVO
Criar sistema para receber e gerenciar submissões de cafés de produtores, com formulário público e painel de análise.

## ESTRUTURA DA PÁGINA (Admin)

### 1. HEADER
- Título: "Submissões de Produtores"
- Subtítulo: "Analise as submissões de cafés"
- Link para formulário público

### 2. FILTROS
- Status: Todas, Pendente, Em Análise, Aprovado, Recusado
- Busca por nome do café

### 3. LISTA DE SUBMISSÕES

**SubmissaoCard:**
- Nome do café
- Origem e variedade
- Data de submissão
- Status (badge colorido)
- Ações: Ver detalhes, Aprovar, Recusar

### 4. MODAL DE DETALHES

**Visualização completa:**
- Todos os campos da submissão
- Notas do admin
- Histórico de status
- Ações: Mudar status, Adicionar notas

## ENTIDADE SUBMISSAOPRODUTOR

{
  nome_cafe: string (required),
  origem: string,
  tipo_grao: string,
  variedade: string,
  processamento: string,
  bebida: string,
  sabor_notas_sensoriais: string,
  docura: string,
  aroma: string,
  acidez_tipo: string,
  acidez_intensidade: string,
  corpo: string,
  torra: string,
  moagem: string,
  escala_intensidade: number,
  pontuacao: number,
  modo_conservacao: string,
  metodos_preparo: string,
  notas_degustacao: string,
  altitude: string,
  certificacoes: string,
  observacoes: string,
  status: enum ["Pendente", "Em Análise", "Aprovado", "Recusado"] (default: "Pendente"),
  notas_admin: string
}

## PÁGINA PÚBLICA (FormularioProdutor)

**URL:** /FormularioProdutor

**Formulário extenso:**
- Todos os campos da entidade
- Validações
- Mensagem de sucesso ao enviar`,
    entidades: ["SubmissaoProdutor"],
    componentes: ["SubmissaoCard", "EditarSubmissaoModal"]
  },

  solicitacoesCafe: {
    titulo: "Solicitações Café",
    icon: FileText,
    descricao: "Gestão de solicitações de café para eventos e uso interno",
    prompt: `# PROMPT PARA RECRIAR: Solicitações Café

## OBJETIVO
Criar sistema Kanban para gerenciar solicitações de café para eventos e uso interno de empresas.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Solicitações de Café"
- Subtítulo: "Gerencie pedidos para eventos e empresas"
- Botão: "Nova Solicitação"

### 2. VISUALIZAÇÃO KANBAN

**Colunas:**
1. Pendente (amarelo)
2. Em Análise (azul)
3. Aprovada (verde)
4. Cancelada (cinza)

**SolicitacaoCard:**
- Tipo (Evento/Interno) badge
- Cliente e local
- Data do evento
- KG calculado
- Lista de cafés selecionados
- Valor total (se configurado)

### 3. MODAL DE DETALHES

**Informações:**
- Dados do cliente
- Parâmetros da calculadora usados
- Cafés selecionados com quantidades
- Timeline de atualizações
- Ações: Mudar status, Adicionar comentário

## ENTIDADE SOLICITACAOEVENTO

{
  tipo_solicitacao: enum ["Evento", "Interno"] (default: "Evento"),
  cliente_id: string,
  cliente_nome: string (required),
  email_cliente: email,
  telefone_cliente: string,
  data_evento: date (required),
  local_evento: string (required),
  
  // Parâmetros Evento
  publico_total: number,
  taxa_adesao: number,
  dias_evento: number,
  horas_por_dia: number,
  ml_por_copo: number,
  fator_perdas: number,
  
  // Parâmetros Uso Interno
  quantidade_funcionarios: number,
  consumo_diario_ml: number,
  xicaras_por_dia: number,
  tamanho_xicara: number,
  
  // Resultados
  consumidores_esperados: number,
  kg_total_calculado: number,
  pacotes_totais_calculados: number,
  
  // Seleção de Cafés
  cafes_selecionados: array[{
    cafe_id: string,
    cafe_nome: string,
    cafe_forma: string,
    embalagem: string,
    quantidade_pacotes: number
  }],
  
  observacoes: string,
  status: enum ["Pendente", "Em Análise", "Aprovada", "Cancelada"],
  resposta_admin: string,
  valor_total: number
}

## ENTIDADE ATUALIZACAOSOLICITACAO

{
  solicitacao_id: string (required),
  tipo: enum ["Comentário", "Mudança Status", "Aprovação", "Cancelamento", "Observação"],
  status_anterior: string,
  status_novo: string,
  comentario: string (required),
  autor: string (required),
  autor_email: string
}`,
    entidades: ["SolicitacaoEvento", "AtualizacaoSolicitacao"],
    componentes: ["SolicitacoesKanban", "SolicitacaoDetalhesModal", "SolicitacaoFormModal"]
  },

  calculadoraAgridrones: {
    titulo: "Calculadora Agridrones",
    icon: Plane,
    descricao: "Calculadora para orçamentos de serviços com drones agrícolas",
    prompt: `# PROMPT PARA RECRIAR: Calculadora Agridrones

## OBJETIVO
Criar calculadora para orçamentos de serviços de aplicação com drones agrícolas (Agridrones).

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Calculadora Agridrones"
- Logo ou ícone de drone
- Descrição do serviço

### 2. FORMULÁRIO DE CÁLCULO

**Inputs:**
- area_hectares: Number - Área em hectares
- tipo_aplicacao: Select - Tipo de aplicação
- quantidade_passadas: Number - Número de passadas
- produto_aplicado: String - Nome do produto
- concentracao: Number - Concentração por hectare

### 3. TABELA DE PREÇOS

**Configuração de Preços:**
- Preço por hectare base
- Descontos por volume
- Taxas adicionais

### 4. RESULTADO

**Cards:**
- Área total
- Valor total
- Tempo estimado
- Economia vs método tradicional

## ENTIDADE PRODUTOAGRIDRONES

{
  nome: string (required),
  tipo: enum ["Defensivo", "Fertilizante", "Semente"],
  preco_por_litro: number,
  dosagem_recomendada: number,
  observacoes: string
}

## ENTIDADE COTACAOAGRIDRONES

{
  cliente_nome: string,
  area_hectares: number,
  tipo_aplicacao: string,
  valor_total: number,
  status: enum ["Orçamento", "Aprovado", "Executado"]
}`,
    entidades: ["ProdutoAgridrones", "CotacaoAgridrones"],
    componentes: ["AgridronesForm", "AgridronesResultado", "TabelaPrecosAgridrones"]
  },

  calculadoraFornecedores: {
    titulo: "Calculadora Fornecedores",
    icon: Calculator,
    descricao: "Calculadora para comparação de preços entre fornecedores",
    prompt: `# PROMPT PARA RECRIAR: Calculadora Fornecedores

## OBJETIVO
Criar ferramenta para comparar preços e condições entre diferentes fornecedores de café verde.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Comparador de Fornecedores"
- Subtítulo: "Compare preços e condições"

### 2. FORMULÁRIO

**Dados do Produto:**
- quantidade_kg: Number
- tipo_cafe: Select

**Fornecedor 1:**
- nome: string
- preco_kg: number
- frete: number
- prazo_pagamento: number (dias)
- prazo_entrega: number (dias)

**Fornecedor 2:**
- (mesmos campos)

**Fornecedor 3 (opcional):**
- (mesmos campos)

### 3. RESULTADO

**Comparativo:**
- Tabela side-by-side
- Menor preço total destacado
- Melhor prazo destacado
- Custo total (produto + frete)
- Economia percentual

**Recomendação:**
- Análise automática
- Melhor custo-benefício`,
    entidades: [],
    componentes: ["FornecedorForm", "ComparativoTable", "RecomendacaoCard"]
  },

  clubeAssinatura: {
    titulo: "Clube Assinatura",
    icon: Gift,
    descricao: "Gestão de assinantes do clube de café e entregas mensais",
    prompt: `# PROMPT PARA RECRIAR: Clube Assinatura

## OBJETIVO
Criar sistema completo de gestão de clube de assinatura de café, com controle de assinantes e entregas.

## ESTRUTURA DA PÁGINA

### 1. TABS PRINCIPAIS
1. **Assinantes** - Lista de membros
2. **Entregas** - Controle de entregas mensais
3. **Configurações** - Planos e preços

### 2. ABA ASSINANTES

**Estatísticas:**
- Total de assinantes ativos
- Novos este mês
- Cancelamentos
- MRR (receita recorrente)

**Lista:**
- AssinanteCard para cada membro
- Plano atual
- Próxima entrega
- Status: Ativo, Pausado, Cancelado

**AssinanteFormModal:**
- nome, email, telefone
- endereco completo
- plano selecionado
- forma_cafe: Grão ou Moído
- dia_entrega_preferido
- observacoes

### 3. ABA ENTREGAS

**Filtros:**
- Mês/Ano
- Status: Pendente, Enviada, Entregue, Problema

**Grid de Entregas:**
- EntregaCard com status
- Assinante, plano, endereço
- Código rastreamento
- Ações: Marcar enviada, Marcar entregue

### 4. ABA CONFIGURAÇÕES

**Planos:**
- Nome, descrição, preço
- Quantidade de pacotes/mês
- Frete incluso ou não

## ENTIDADE ASSINANTECLUBE

{
  nome: string (required),
  email: email (required),
  telefone: string,
  endereco: string (required),
  cep: string,
  cidade: string,
  estado: string,
  plano: enum ["Básico", "Premium", "VIP"],
  forma_cafe: enum ["Grão", "Moído"],
  dia_entrega_preferido: number,
  status: enum ["Ativo", "Pausado", "Cancelado"] (default: "Ativo"),
  data_inicio: date,
  observacoes: string
}

## ENTIDADE ENTREGACLUBE

{
  assinante_id: string (required),
  assinante_nome: string,
  mes_referencia: string, // "2025-01"
  cafes_enviados: array[{ cafe_nome, embalagem, quantidade }],
  status: enum ["Pendente", "Enviada", "Entregue", "Problema"],
  codigo_rastreamento: string,
  data_envio: date,
  data_entrega: date,
  observacoes: string
}

## ENTIDADE CONFIGURACAOFRETE

{
  cep_origem: string,
  valor_base: number,
  valor_por_kg: number,
  frete_gratis_acima: number
}`,
    entidades: ["AssinanteClube", "EntregaClube", "ConfiguracaoFrete"],
    componentes: ["AssinanteCard", "AssinanteFormModal", "EntregaCard", "EntregaFormModal"]
  },

  cotacaoFrete: {
    titulo: "Cotação de Frete",
    icon: Truck,
    descricao: "Sistema de cotação de frete integrado com Melhor Envio",
    prompt: `# PROMPT PARA RECRIAR: Cotação de Frete

## OBJETIVO
Criar sistema de cotação de frete integrado com a API do Melhor Envio.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Cotação de Frete"
- Subtítulo: "Calcule o melhor frete para suas entregas"

### 2. FORMULÁRIO DE COTAÇÃO

**Origem (pré-configurado):**
- CEP de origem
- Endereço (visualização)

**Destino:**
- cep_destino: Input com máscara
- Busca automática de endereço

**Pacote:**
- peso_kg: Number
- altura_cm: Number
- largura_cm: Number
- comprimento_cm: Number
- valor_declarado: Number

### 3. RESULTADO

**Lista de Opções:**
- Transportadora e serviço
- Prazo de entrega
- Valor do frete
- Destaque para mais barato
- Destaque para mais rápido

**ResultadoCotacao:**
- Cards ordenados por preço
- Badge "Mais barato" / "Mais rápido"
- Botão para selecionar

### 4. CONFIGURAÇÕES

**ConfiguracaoFreteForm:**
- CEP de origem padrão
- Dimensões padrão do pacote
- Token Melhor Envio

## INTEGRAÇÃO MELHOR ENVIO

**Endpoint:** POST /api/v2/me/shipment/calculate

**Headers:**
- Authorization: Bearer {MELHOR_ENVIO_TOKEN}
- Content-Type: application/json

**Payload:**
\`\`\`json
{
  "from": { "postal_code": "29101000" },
  "to": { "postal_code": "01310100" },
  "package": {
    "height": 10,
    "width": 15,
    "length": 20,
    "weight": 0.5
  }
}
\`\`\`

## FUNÇÃO BACKEND: cotarFrete

\`\`\`javascript
// Chama API Melhor Envio
// Retorna array de opções
// Ordena por preço e prazo
\`\`\`

## SECRETS NECESSÁRIOS
- MELHOR_ENVIO_TOKEN
- MELHOR_ENVIO_SANDBOX (boolean)`,
    entidades: ["ConfiguracaoFrete"],
    componentes: ["CotacaoForm", "ResultadoCotacao", "ConfiguracaoFreteForm"]
  },

  contratosRPA: {
    titulo: "Contratos RPA",
    icon: FileText,
    descricao: "Gestão de contratos RPA com assinatura digital via Autentique",
    prompt: `# PROMPT PARA RECRIAR: Contratos RPA

## OBJETIVO
Criar sistema para gestão de contratos de Recibo de Pagamento a Autônomo (RPA) com assinatura digital via Autentique.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Contratos RPA"
- Subtítulo: "Gestão de contratos e assinaturas digitais"
- Botão: "Novo Contrato"

### 2. FILTROS
- Status: Todos, Rascunho, Aguardando Assinatura, Assinado, Cancelado
- Busca por nome

### 3. LISTA DE CONTRATOS

**ContratoRPACard:**
- Nome do prestador
- Valor do contrato
- Status (badge colorido)
- Data de criação
- Signatários e status de cada um
- Ações: Ver, Enviar para assinatura, Cancelar

### 4. MODAL DE FORMULÁRIO

**Dados do Contrato:**
- prestador_nome: string
- prestador_cpf: string
- prestador_endereco: string
- valor: number
- descricao_servico: textarea
- data_inicio: date
- data_fim: date

**Signatários:**
- Lista de pessoas que devem assinar
- Email de cada signatário
- Papel (Contratante, Contratado, Testemunha)

### 5. INTEGRAÇÃO AUTENTIQUE

**Fluxo:**
1. Criar contrato localmente
2. Gerar PDF do contrato
3. Enviar para Autentique via API
4. Adicionar signatários
5. Acompanhar status de assinaturas
6. Webhook para atualização automática

## ENTIDADE CONTRATORPA

{
  prestador_nome: string (required),
  prestador_cpf: string (required),
  prestador_email: email,
  prestador_endereco: string,
  valor: number (required),
  descricao_servico: string (required),
  data_inicio: date,
  data_fim: date,
  status: enum ["Rascunho", "Aguardando Assinatura", "Assinado", "Cancelado"],
  autentique_id: string,
  autentique_url: string,
  pdf_url: string
}

## ENTIDADE SIGNATARIOCONTRATO

{
  contrato_id: string (required),
  nome: string (required),
  email: email (required),
  papel: enum ["Contratante", "Contratado", "Testemunha"],
  status: enum ["Pendente", "Assinado", "Recusado"],
  data_assinatura: datetime,
  autentique_signer_id: string
}

## FUNÇÕES BACKEND

### criarContratoAutentique
- Gera PDF
- Cria documento na Autentique
- Adiciona signatários
- Retorna URL de assinatura

### consultarStatusContrato
- Consulta status na Autentique
- Atualiza local

### webhookAutentique
- Recebe notificações de assinatura
- Atualiza status automaticamente

## SECRETS NECESSÁRIOS
- AUTENTIQUE_API_TOKEN`,
    entidades: ["ContratoRPA", "SignatarioContrato"],
    componentes: ["ContratoRPACard", "ContratoRPAFormModal", "EnviarAssinaturaModal"]
  },

  relatorios: {
    titulo: "Relatórios",
    icon: BarChart3,
    descricao: "Relatórios e dashboards analíticos do sistema",
    prompt: `# PROMPT PARA RECRIAR: Relatórios

## OBJETIVO
Criar página de relatórios com gráficos e métricas analíticas do sistema.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Relatórios"
- Filtro de período (data início - data fim)
- Botão: Exportar PDF

### 2. CARDS DE MÉTRICAS

**Grid 4 colunas:**
- Vendas do período
- Ticket médio
- Cafés mais vendidos
- Clientes novos

### 3. GRÁFICOS

**Gráfico de Vendas (LineChart):**
- Vendas por dia/semana/mês
- Comparativo com período anterior

**Gráfico de Cafés (PieChart):**
- Distribuição por tipo de café
- Percentual de cada um

**Gráfico de Status (BarChart):**
- Chamados por status
- Tarefas por status

**Gráfico de Logística (BarChart):**
- Caixas por status
- Origem vs Destino

### 4. TABELAS

**Top 10 Clientes:**
- Nome, total de compras, valor total
- Ordenado por valor

**Top 10 Cafés:**
- Nome, quantidade vendida
- Ordenado por quantidade

## BIBLIOTECAS

- **recharts**: Para gráficos
- **date-fns**: Para manipulação de datas
- **jspdf**: Para exportação PDF

## COMPONENTES

### MetricCard
Props: title, value, change, icon, color

### SalesChart
Props: data, period

### CoffeeDistributionChart
Props: cafes

### StatusChart
Props: data, title

### RankingTable
Props: data, columns, title`,
    entidades: [],
    componentes: ["MetricCard", "SalesChart", "CoffeeDistributionChart", "StatusChart", "RankingTable"]
  },

  usuarios: {
    titulo: "Usuários",
    icon: Users,
    descricao: "Gestão de usuários do sistema e permissões",
    prompt: `# PROMPT PARA RECRIAR: Usuários

## OBJETIVO
Criar página para gestão de usuários do sistema, convites e permissões.

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Usuários"
- Subtítulo: "Gerencie os usuários do sistema"
- Botão: "Convidar Usuário"

### 2. LISTA DE USUÁRIOS

**UserCard para cada usuário:**
- Avatar (inicial do nome)
- Nome completo
- Email
- Role (Admin/User)
- Cargo personalizado
- Data de criação
- Status: Ativo/Inativo
- Ações: Editar role, Editar cargo, Remover

### 3. MODAL DE CONVITE

**Campos:**
- email: Email do convidado
- role: Select ["admin", "user"]

**Uso:**
\`\`\`javascript
await base44.users.inviteUser(email, role);
\`\`\`

### 4. MODAL DE EDIÇÃO

**Campos editáveis:**
- cargo: Select ["Administrativo", "Parceiro Logístico", "Representante"]
- (role apenas para admins)

## ENTIDADE USER (Built-in)

**Campos read-only:**
- id
- email
- full_name
- created_date

**Campos editáveis:**
- role: enum ["admin", "user"]
- cargo: enum ["Administrativo", "Parceiro Logístico", "Representante"]

## PERMISSÕES POR CARGO

### Administrativo
- Acesso total
- Pode convidar usuários
- Pode editar roles

### Parceiro Logístico
- Acesso à Logística
- Acesso ao Estoque (leitura)
- Não vê valores financeiros

### Representante
- Acesso ao Estoque
- Acesso a Clientes
- Acesso a Solicitações
- Pode criar reservas

## FUNCIONALIDADES

1. **Listagem com RLS:**
   - Admins veem todos
   - Outros veem apenas próprio perfil

2. **Convite:**
   - Envia email de convite
   - Usuário cria senha no primeiro acesso

3. **Edição de Cargo:**
   - Atualiza campo personalizado no User`,
    entidades: ["User"],
    componentes: ["UserCard", "InviteUserModal", "EditUserModal"]
  },

  exportarDados: {
    titulo: "Exportar Dados",
    icon: Download,
    descricao: "Exportação de dados do sistema em diferentes formatos",
    prompt: `# PROMPT PARA RECRIAR: Exportar Dados

## OBJETIVO
Criar ferramenta para exportação de dados do sistema em diferentes formatos (JSON, CSV, Excel).

## ESTRUTURA DA PÁGINA

### 1. HEADER
- Título: "Exportar Dados"
- Subtítulo: "Baixe os dados do sistema"

### 2. SELEÇÃO DE ENTIDADE

**Cards para cada entidade:**
- Café
- Cliente
- Reservas
- Chamados
- Tarefas
- Agendamentos
- Caixas
- Pedidos Yampi

**Para cada card:**
- Nome da entidade
- Contagem de registros
- Última atualização
- Botão: Exportar

### 3. MODAL DE EXPORTAÇÃO

**Opções:**
- Formato: JSON / CSV
- Período: Todo / Últimos 30 dias / Personalizado
- Campos: Todos / Selecionar
- Incluir campos do sistema (id, created_date, etc.)

### 4. PREVIEW

**Antes de baixar:**
- Quantidade de registros
- Tamanho estimado
- Preview das primeiras linhas

## FUNCIONALIDADES

1. **Exportação JSON:**
\`\`\`javascript
const data = await base44.entities.Cafe.list();
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Download
\`\`\`

2. **Exportação CSV:**
\`\`\`javascript
const headers = Object.keys(data[0]).join(',');
const rows = data.map(item => Object.values(item).join(','));
const csv = [headers, ...rows].join('\\n');
\`\`\`

3. **Filtro por Data:**
\`\`\`javascript
const filtered = data.filter(item => 
  new Date(item.created_date) >= startDate &&
  new Date(item.created_date) <= endDate
);
\`\`\`

## COMPONENTES

### EntityExportCard
Props: entity, count, onExport

### ExportModal
Props: open, onClose, entity, onConfirm

### ExportPreview
Props: data, format`,
    entidades: [],
    componentes: ["EntityExportCard", "ExportModal", "ExportPreview"]
  },

  solicitarPatrocinio: {
    titulo: "Solicitar Patrocínio",
    icon: Award,
    descricao: "Sistema de recebimento e gestão de solicitações de patrocínio",
    prompt: `# PROMPT PARA RECRIAR: Solicitar Patrocínio

## OBJETIVO
Criar sistema para receber e gerenciar solicitações de patrocínio para eventos.

## ESTRUTURA - PÁGINA PÚBLICA (SolicitarPatrocinio)

### Formulário de Solicitação

**Dados do Organizador:**
- nome_organizador: string (required)
- email_contato: email (required)
- telefone_contato: string

**Dados do Evento:**
- nome_evento: string (required)
- tipo_evento: Select ["Corporativo", "Esportivo", "Cultural", "Educacional", "Social", "Feira/Exposição", "Outro"]
- data_evento: date (required)
- local_evento: string (required)
- publico_esperado: number
- duracao_dias: number

**Solicitação:**
- tipo_solicitacao: Select ["Patrocínio", "Doação", "Participação/Stand"]
- proposta_patrocinio: textarea (required)
- contrapartidas_oferecidas: textarea (required)
- beneficios_visibilidade: textarea (required)
- alcance_estimado: string (required)

**Informações Adicionais:**
- descricao_evento: textarea
- historico_eventos: textarea
- material_divulgacao: string
- outras_marcas_patrocinadoras: string
- exclusividade_categoria: Select ["sim", "nao", "negociavel"]
- midia_redes_sociais: string
- orcamento_evento: string
- cafe_necessario_kg: number

## ESTRUTURA - PÁGINA ADMIN (GerenciarPatrocinios)

### Kanban de Solicitações

**Colunas:**
1. Nova
2. Em Análise
3. Aguardando Informações
4. Aprovada
5. Recusada
6. Concluída

**PatrocinioCard:**
- Nome do evento
- Tipo e data
- Organizador
- Alcance estimado
- Pontuação (se avaliado)

### Modal de Detalhes

**Informações completas**
**Sistema de Pontuação:**
- Alinhamento com marca (0-10)
- Visibilidade (0-10)
- ROI potencial (0-10)
- Pontuação total calculada

**Decisão:**
- Aprovado Total / Parcial / Recusado
- Nível de patrocínio
- Quantidade de café aprovada
- Outros recursos

**Timeline de Atualizações**

## ENTIDADE SOLICITACAOPATROCINIO

{
  nome_organizador: string (required),
  email_contato: email (required),
  telefone_contato: string,
  nome_evento: string (required),
  tipo_evento: enum,
  data_evento: date (required),
  local_evento: string (required),
  publico_esperado: number,
  duracao_dias: number,
  tipo_solicitacao: enum,
  descricao_evento: string,
  historico_eventos: string,
  proposta_patrocinio: string (required),
  contrapartidas_oferecidas: string (required),
  beneficios_visibilidade: string (required),
  alcance_estimado: string (required),
  material_divulgacao: string,
  outras_marcas_patrocinadoras: string,
  exclusividade_categoria: enum,
  midia_redes_sociais: string,
  orcamento_evento: string,
  cafe_necessario_kg: number,
  status: enum ["Nova", "Em Análise", "Aguardando Informações", "Aprovada", "Recusada", "Concluída"],
  pontuacao_alinhamento: number,
  pontuacao_visibilidade: number,
  pontuacao_roi: number,
  pontuacao_total: number,
  decisao_final: enum ["Pendente", "Aprovado Total", "Aprovado Parcial", "Recusado"],
  nivel_patrocinio: enum,
  quantidade_cafe_aprovada: number,
  outros_recursos: string,
  observacoes_internas: string,
  resposta_organizador: string,
  responsavel_analise: string
}

## ENTIDADE ATUALIZACAOPATROCINIO

{
  patrocinio_id: string (required),
  tipo: enum,
  status_anterior: string,
  status_novo: string,
  comentario: string (required),
  autor: string (required),
  autor_email: string,
  visivel_solicitante: boolean
}`,
    entidades: ["SolicitacaoPatrocinio", "AtualizacaoPatrocinio"],
    componentes: ["PatrocinioKanban", "PatrocinioDetalhesModal", "PatrocinioFormPublico"]
  },

  configuracoes: {
    titulo: "Configurações do Sistema",
    icon: Settings,
    descricao: "Gestão de responsáveis, notificações, integrações e conta do usuário",
    prompt: `# PROMPT PARA RECRIAR: Configurações do Sistema

## OBJETIVO
Criar página de configurações para gerenciar responsáveis, preferências de notificação, integrações e conta do usuário.

## ESTRUTURA DA PÁGINA

### 1. TABS PRINCIPAIS
1. **Responsáveis** - Cadastro de responsáveis por área
2. **Notificações** - Preferências de notificação
3. **WhatsApp** - Integração WhatsApp Agent
4. **Conta** - Dados do usuário e exclusão

### 2. ABA RESPONSÁVEIS

**Formulário de Cadastro:**
- nome: Input (required)
- email: Email (required)
- cargo: Input
- area: Select ["Logística", "Estoque", "Atendimento", "Geral"]
- Checkboxes de notificações:
  - receber_problemas
  - receber_estoque
  - receber_logistica

**Lista:**
- Cards de responsáveis
- Ações: Excluir

### 3. ABA NOTIFICAÇÕES

**Toggles por Categoria:**

Problemas:
- Notificar equipe ao criar chamado
- Notificar cliente sobre atualizações
- Notificar ao resolver

Estoque:
- Alertar estoque baixo
- Notificar nova reserva
- Notificar entrega

Logística:
- Notificar caixa em trânsito
- Notificar caixa entregue
- Notificar problema

Agenda:
- Lembrete de agendamento
- Notificar participantes

### 4. ABA WHATSAPP

**Integração com Agent:**
- QR Code ou link de conexão
- Status da conexão
- Instruções de uso

\`\`\`javascript
<a href={base44.agents.getWhatsAppConnectURL('notificacoes_whatsapp')} target="_blank">
  Conectar WhatsApp
</a>
\`\`\`

### 5. ABA CONTA

**Informações do Usuário:**
- Nome completo
- Email
- Role
- Data de criação

**Ações:**
- Logout
- Excluir conta (LGPD)

**DeleteAccountSection:**
- Input de confirmação (digitar email)
- Botão de exclusão
- Modal de confirmação

## ENTIDADES NECESSÁRIAS

### Responsavel
{
  nome: string (required),
  email: email (required),
  cargo: string,
  area: enum ["Logística", "Estoque", "Atendimento", "Geral"],
  receber_problemas: boolean (default: true),
  receber_estoque: boolean (default: true),
  receber_logistica: boolean (default: false),
  ativo: boolean (default: true)
}

### ConfiguracaoNotificacao
{
  chave: string (required), // ex: "notificar_clientes_problema"
  valor: boolean (required),
  descricao: string,
  categoria: enum ["Problemas", "Estoque", "Logística", "Agenda", "Geral"]
}

## COMPONENTES NECESSÁRIOS

### ResponsavelCard
Props: responsavel, onDelete

### NotificacaoToggle
Props: configuracao, onToggle

### DeleteAccountSection
Props: user
- Formulário de confirmação
- Chamada base44.auth.deleteAccount()

## FUNCIONALIDADES

1. **CRUD de Responsáveis**
2. **Toggle de Configurações:**
   - Buscar/criar configuração por chave
   - Atualizar valor
3. **WhatsApp Integration:**
   - SDK base44.agents
4. **Exclusão de Conta (LGPD):**
   - Confirmação por email
   - Exclusão de dados pessoais

## CONFIGURAÇÕES PADRÃO
\`\`\`javascript
const defaultConfigs = [
  { chave: "notificar_equipe_novo_problema", categoria: "Problemas", valor: true },
  { chave: "notificar_cliente_atualizacao", categoria: "Problemas", valor: false },
  { chave: "alertar_estoque_baixo", categoria: "Estoque", valor: true },
  { chave: "notificar_nova_reserva", categoria: "Estoque", valor: true },
  { chave: "lembrete_agendamento", categoria: "Agenda", valor: true }
];
\`\`\``,
    entidades: ["Responsavel", "ConfiguracaoNotificacao"],
    componentes: ["ResponsavelCard", "NotificacaoToggle", "DeleteAccountSection"]
  }
};

export default function PromptsDocs() {
  const [selectedPrompt, setSelectedPrompt] = useState("dashboard");
  const [copiedSection, setCopiedSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const copyToClipboard = async (text, section) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentPrompt = prompts[selectedPrompt];
  const Icon = currentPrompt.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white dark:from-gray-900 dark:to-gray-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] dark:text-[#C9A961]">
                Documentação de Prompts
              </h1>
              <p className="text-[#8B7355] dark:text-gray-400">
                Prompts detalhados para recriar cada funcionalidade em outra plataforma
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Menu Lateral */}
          <div className="lg:col-span-1">
            <Card className="border-[#E5DCC8] dark:border-gray-700 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#6B4423] dark:text-[#C9A961]">
                  Itens do Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.entries(prompts).map(([key, item]) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPrompt(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        selectedPrompt === key
                          ? "bg-[#6B4423] text-white"
                          : "hover:bg-[#6B4423]/10 text-[#5A4A3A] dark:text-gray-300"
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.titulo}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Info Card */}
            <Card className="border-[#E5DCC8] dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#6B4423] dark:text-[#C9A961]">
                        {currentPrompt.titulo}
                      </CardTitle>
                      <p className="text-sm text-[#8B7355] dark:text-gray-400 mt-1">
                        {currentPrompt.descricao}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(currentPrompt.prompt, "main")}
                    variant="outline"
                    size="sm"
                    className="border-[#6B4423] text-[#6B4423] hover:bg-[#6B4423] hover:text-white"
                  >
                    {copiedSection === "main" ? (
                      <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copiar Prompt</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-medium text-[#8B7355] dark:text-gray-400">Entidades:</span>
                  {currentPrompt.entidades.length > 0 ? (
                    currentPrompt.entidades.map(e => (
                      <Badge key={e} variant="outline" className="text-xs">
                        {e}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      Nenhuma
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-[#8B7355] dark:text-gray-400">Componentes:</span>
                  {currentPrompt.componentes.map(c => (
                    <Badge key={c} className="text-xs bg-[#6B4423]/10 text-[#6B4423] dark:bg-[#C9A961]/10 dark:text-[#C9A961]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dados de Exemplo do Sistema */}
            <Card className="border-[#E5DCC8] dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#6B4423] dark:text-[#C9A961]">
                  📊 Dados Cadastrados no Sistema (Exemplos Reais)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cafes" className="w-full">
                  <TabsList className="bg-[#F5F1E8] dark:bg-gray-800 flex-wrap h-auto">
                    <TabsTrigger value="cafes" className="text-xs">Cafés</TabsTrigger>
                    <TabsTrigger value="clientes" className="text-xs">Clientes</TabsTrigger>
                    <TabsTrigger value="reservas" className="text-xs">Reservas</TabsTrigger>
                    <TabsTrigger value="problemas" className="text-xs">Chamados</TabsTrigger>
                    <TabsTrigger value="tarefas" className="text-xs">Tarefas</TabsTrigger>
                    <TabsTrigger value="agendamentos" className="text-xs">Agendamentos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cafes" className="mt-4">
                    <div className="flex justify-end mb-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(dadosExemplo.cafes, null, 2), "cafes-json")}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedSection === "cafes-json" ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar JSON</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.cafes.map((cafe, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">{cafe.nome}</div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {cafe.forma} | {cafe.localizacao} {cafe.origem && `| ${cafe.origem}`}
                          </div>
                          {cafe.precos_private_label && (
                            <div className="text-xs mt-1">
                              Preços: {Object.entries(cafe.precos_private_label).filter(([k,v]) => v > 0).map(([k,v]) => `R$${v}/${k}`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="clientes" className="mt-4">
                    <div className="flex justify-end mb-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(dadosExemplo.clientes, null, 2), "clientes-json")}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedSection === "clientes-json" ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar JSON</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.clientes.map((cliente, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">{cliente.nome}</div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {cliente.localizacao} | {cliente.ativo ? '✅ Ativo' : '❌ Inativo'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reservas" className="mt-4">
                    <div className="flex justify-end mb-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(dadosExemplo.reservas, null, 2), "reservas-json")}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedSection === "reservas-json" ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar JSON</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.reservas.map((reserva, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">
                            {reserva.cliente_nome} → {reserva.cafe_nome}
                          </div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {reserva.embalagem} x{reserva.quantidade_pacotes} | {reserva.status}
                          </div>
                          {reserva.observacoes && (
                            <div className="text-xs mt-1 italic">"{reserva.observacoes}"</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="problemas" className="mt-4">
                    <div className="flex justify-end mb-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(dadosExemplo.problemas, null, 2), "problemas-json")}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedSection === "problemas-json" ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar JSON</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.problemas.map((problema, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">{problema.nome_cliente}</div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {problema.email_cliente} | {problema.tipo} | {problema.prioridade} | {problema.status}
                          </div>
                          <div className="text-xs mt-1 line-clamp-2">{problema.descricao.substring(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tarefas" className="mt-4">
                    <div className="flex justify-end mb-2">
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(dadosExemplo.tarefas, null, 2), "tarefas-json")}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedSection === "tarefas-json" ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar JSON</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.tarefas.map((tarefa, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">{tarefa.titulo}</div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {tarefa.status} | {tarefa.prioridade} | {tarefa.responsavel} | {tarefa.tipo}
                          </div>
                          <div className="text-xs mt-1">{tarefa.descricao}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="agendamentos" className="mt-4">
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {dadosExemplo.agendamentos.map((agendamento, i) => (
                        <div key={i} className="p-3 bg-[#F5F1E8] dark:bg-gray-800 rounded-lg text-sm">
                          <div className="font-semibold text-[#6B4423] dark:text-[#C9A961]">{agendamento.titulo}</div>
                          <div className="text-xs text-[#8B7355] dark:text-gray-400">
                            {agendamento.tipo} | {agendamento.status} | {agendamento.local}
                          </div>
                          <div className="text-xs mt-1">
                            {new Date(agendamento.data_inicio).toLocaleString('pt-BR')} - {new Date(agendamento.data_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs">Participantes: {agendamento.participantes.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Prompt Content */}
            <Card className="border-[#E5DCC8] dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#6B4423] dark:text-[#C9A961]">
                    Prompt Completo
                  </CardTitle>
                  <Button
                    onClick={() => copyToClipboard(currentPrompt.prompt, "prompt")}
                    variant="ghost"
                    size="sm"
                  >
                    {copiedSection === "prompt" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                    {currentPrompt.prompt}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}