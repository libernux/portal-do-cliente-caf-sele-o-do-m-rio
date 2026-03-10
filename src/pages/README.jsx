export default function README() {
  const estrutura = {
    projeto: {
      nome: "Café Seleção do Mário",
      descricao: "Sistema completo de gestão operacional para empresa de cafés especiais, incluindo controle de estoque, logística, vendas, atendimento ao cliente, integrações com plataformas externas e automação de processos.",
      tecnologias: ["React", "Tailwind CSS", "shadcn/ui", "Base44 Platform", "Framer Motion", "Recharts"],
      tema: "Café/Marrom (#6B4423, #C9A961, #F5F1E8) com suporte a dark mode"
    },

    entidades: {
      // ==========================================
      // CORE - Gestão de Cafés e Estoque
      // ==========================================
      Cafe: {
        descricao: "Cadastro principal dos cafés com controle de estoque por embalagem e localização",
        campos_principais: ["nome", "forma (Grão/Moído)", "estoque_por_embalagem (10g/18g/100g/250g/500g/1kg)", "embalagens_disponiveis", "localizacao (Vila Velha/Venda Nova)", "is_private_label", "precos_private_label", "notas_degustacao", "origem", "torra"],
        relacionamentos: ["ReservaCafe (1:N)", "InfoCafe (1:1)", "SolicitacaoEvento (N:M via cafes_selecionados)"],
        permissoes: "Admin e Administrativo: CRUD | Parceiro Logístico e Representante: Read"
      },

      InfoCafe: {
        descricao: "Informações detalhadas sensoriais e técnicas dos cafés para exibição pública",
        campos_principais: ["cafe_id", "cafe_nome", "slug", "ativo", "infos_sensoriais (origem, tipo_grao, variedade, processamento, bebida, sabor, docura, aroma, acidez, corpo, torra, moagem, escala_intensidade)", "ingredientes", "metodos_preparo", "infos_adicionais (modo_conservacao, embalagens_disponiveis com dimensões, registro)"],
        relacionamentos: ["Cafe (N:1 via cafe_id)"],
        permissoes: "Admin e Administrativo: CRUD | Público: Read"
      },

      SubmissaoProdutor: {
        descricao: "Formulário de submissão de cafés por produtores externos com avaliação sensorial completa",
        campos_principais: ["nome_cafe", "origem", "tipo_grao", "variedade", "processamento", "bebida", "sabor_notas_sensoriais", "docura", "aroma", "acidez_tipo", "acidez_intensidade", "corpo", "torra", "moagem", "escala_intensidade", "pontuacao (0-100)", "modo_conservacao", "metodos_preparo", "notas_degustacao", "altitude", "certificacoes", "status (Pendente/Em Análise/Aprovado/Recusado)", "notas_admin"],
        permissoes: "Qualquer um: Create | Admin e Administrativo: Read, Update | Admin: Delete"
      },

      // ==========================================
      // CLIENTES E VENDAS
      // ==========================================
      Cliente: {
        descricao: "Cadastro de clientes da empresa",
        campos_principais: ["nome", "email", "telefone", "endereco", "localizacao (Vila Velha/Venda Nova/Outro)", "observacoes", "ativo"],
        relacionamentos: ["ReservaCafe (1:N)", "ClienteSlug (1:1)", "PrecoCafe (1:N)", "SolicitacaoEvento (1:N)"],
        permissoes: "Admin, Administrativo e Representante: Create, Update | Admin, Administrativo, Representante, Parceiro Logístico: Read"
      },

      ReservaCafe: {
        descricao: "Reservas de café feitas pelos clientes com controle de embalagem e status",
        campos_principais: ["cliente_id", "cliente_nome", "cafe_id", "cafe_nome", "cafe_forma", "embalagem (10g-1kg)", "quantidade_pacotes", "data_reserva", "data_entrega", "status (Ativa/Entregue/Cancelada)", "observacoes"],
        relacionamentos: ["Cliente (N:1)", "Cafe (N:1)", "ClienteChecklistItem (1:N)"],
        fluxo: "Reserva criada → Estoque decrementado ao entregar → Estoque restaurado se cancelada"
      },

      PrecoCafe: {
        descricao: "Preços personalizados por cliente para cada café",
        campos_principais: ["cliente_id", "cliente_nome", "cafe_id", "cafe_nome", "preco_por_pacote", "ativo"],
        relacionamentos: ["Cliente (N:1)", "Cafe (N:1)"]
      },

      ClienteSlug: {
        descricao: "Links personalizados para páginas públicas de reserva dos clientes",
        campos_principais: ["cliente_id", "cliente_nome", "slug", "ativo", "mostrar_precos"],
        relacionamentos: ["Cliente (1:1)"],
        uso: "Gera URL pública: /ReservaPublica?cliente={slug}"
      },

      // ==========================================
      // LOGÍSTICA
      // ==========================================
      Caixa: {
        descricao: "Rastreamento de caixas/pacotes entre locais (Vila Velha ↔ Venda Nova)",
        campos_principais: ["numero_identificacao", "origem (Venda Nova/Vila Velha)", "destino", "status (Aguardando Envio/Em Trânsito/Entregue/Problema)", "responsavel", "tem_etiqueta", "codigo_etiqueta", "meio_transporte", "codigo_rastreamento", "conteudo", "data_envio", "data_entrega_prevista", "data_entrega_real"],
        fluxo: "Criação → Etiquetagem → Envio → Rastreamento → Entrega"
      },

      ConfiguracaoFrete: {
        descricao: "Configurações padrão para cálculo de frete via Melhor Envio",
        campos_principais: ["cep_origem", "peso_padrao", "dimensões padrão (altura/largura/comprimento)", "valor_declarado_padrao"]
      },

      // ==========================================
      // ATENDIMENTO / CHAMADOS
      // ==========================================
      Problema: {
        descricao: "Sistema de chamados/tickets de suporte com prioridades e etiquetas",
        campos_principais: ["nome_cliente", "email_cliente", "telefone_cliente", "descricao", "tipo (Logística/Estoque/Cliente/Fornecedor/Equipamento/Qualidade/Outro)", "etiquetas[]", "prioridade (Baixa/Média/Alta/Urgente)", "status (Aberto/Em Andamento/Aguardando/Resolvido/Cancelado)", "responsavel", "data_abertura", "data_resolucao", "solucao", "tem_novas_atualizacoes"],
        relacionamentos: ["AtualizacaoProblema (1:N)", "EtiquetaProblema (N:M via etiquetas[])"],
        visualizacao: "Lista e Kanban"
      },

      AtualizacaoProblema: {
        descricao: "Timeline de atualizações/comentários de cada chamado",
        campos_principais: ["problema_id", "tipo (Comentário/Mudança Status/Atribuição/Resolução/Interno)", "mensagem", "autor", "visivel_cliente", "notificar_cliente"],
        permissoes: "Qualquer um: Create | Visível ao cliente conforme flag visivel_cliente"
      },

      EtiquetaProblema: {
        descricao: "Etiquetas personalizadas para categorizar problemas e tarefas",
        campos_principais: ["nome", "cor (hex)", "descricao"],
        uso: "Usada tanto em Problema quanto em Tarefa"
      },

      // ==========================================
      // TAREFAS
      // ==========================================
      Tarefa: {
        descricao: "Quadro Kanban de tarefas internas da equipe",
        campos_principais: ["titulo", "descricao", "status (A Fazer/Em Andamento/Em Revisão/Concluído)", "prioridade (Baixa/Média/Alta/Urgente)", "responsavel", "tipo (Desenvolvimento/Logística/Estoque/Atendimento/Administrativo/Outro)", "prazo", "data_inicio", "data_conclusao", "tempo_estimado", "etiquetas[]"],
        visualizacao: "Kanban com drag-and-drop"
      },

      // ==========================================
      // AGENDA
      // ==========================================
      Agendamento: {
        descricao: "Agenda de compromissos, reuniões e eventos",
        campos_principais: ["titulo", "descricao", "data_inicio", "data_fim", "local", "tipo (Reunião/Visita Cliente/Fornecedor/Evento/Degustação/Treinamento/Outro)", "participantes[]", "link_google_calendar", "notificar_participantes", "status (Agendado/Confirmado/Em Andamento/Concluído/Cancelado)"]
      },

      // ==========================================
      // FINANCEIRO
      // ==========================================
      DemandaExterna: {
        descricao: "Contas a receber de demandas externas (não vinculadas a reservas)",
        campos_principais: ["cliente_nome", "descricao", "valor", "data_vencimento", "data_pagamento", "status (Pendente/Pago/Vencido/Renegociado/Cancelado)", "forma_pagamento"],
        relacionamentos: ["HistoricoDemanda (1:N)"]
      },

      ItemChecklist: {
        descricao: "Itens configuráveis do checklist de processos (ex: NF Gerada, Boleto Enviado)",
        campos_principais: ["nome", "descricao", "ordem", "cor", "ativo"],
        uso: "Aplicado a cada reserva via ClienteChecklistItem"
      },

      ClienteChecklistItem: {
        descricao: "Registro de conclusão de cada item do checklist por reserva",
        campos_principais: ["cliente_id", "cliente_nome", "reserva_id", "item_checklist_id", "item_checklist_nome", "concluido", "data_conclusao", "usuario_conclusao"],
        relacionamentos: ["ReservaCafe (N:1)", "ItemChecklist (N:1)"]
      },

      // ==========================================
      // CONTRATOS
      // ==========================================
      ContratoRPA: {
        descricao: "Gestão de contratos RPA com assinatura eletrônica via Autentique",
        campos_principais: ["numero_contrato", "tipo_servico", "contratante_nome/cpf/email/telefone/endereco", "contratada_nome/cnpj/representante", "descricao_servico", "valor_contrato", "forma_pagamento", "data_inicio/termino", "status (Rascunho/Aguardando Assinatura/Assinado/Cancelado/Expirado)", "autentique_document_id/url/signed_url"],
        integracao: "Autentique API para envio e assinatura digital"
      },

      SignatarioContrato: {
        descricao: "Signatários de cada contrato no Autentique",
        campos_principais: ["contrato_id", "nome", "email", "tipo", "assinado", "data_assinatura"]
      },

      // ==========================================
      // EVENTOS E SOLICITAÇÕES
      // ==========================================
      SolicitacaoEvento: {
        descricao: "Solicitações de café para eventos ou uso interno com calculadora integrada",
        campos_principais: ["tipo_solicitacao (Evento/Interno)", "cliente_nome/email/telefone", "data_evento", "local_evento", "publico_total", "taxa_adesao", "dias_evento", "horas_por_dia", "ml_por_copo", "fator_perdas", "quantidade_funcionarios", "consumo_diario_ml", "kg_total_calculado", "pacotes_totais_calculados", "cafes_selecionados[]", "status (Pendente/Em Análise/Aprovada/Cancelada)", "valor_total"]
      },

      SolicitacaoPatrocinio: {
        descricao: "Sistema completo de avaliação de solicitações de patrocínio/doação",
        campos_principais: ["nome_organizador", "email/telefone_contato", "nome_evento", "tipo_evento", "data/local_evento", "publico_esperado", "tipo_solicitacao (Patrocínio/Doação/Participação)", "proposta_patrocinio", "contrapartidas_oferecidas", "beneficios_visibilidade", "alcance_estimado", "exclusividade_categoria", "status (Nova/Em Análise/Aprovada/Recusada/Concluída)", "pontuacao_alinhamento/visibilidade/roi/total", "decisao_final", "nivel_patrocinio (Bronze/Prata/Ouro/Diamante)", "quantidade_cafe_aprovada"],
        visualizacao: "Kanban com pontuação"
      },

      // ==========================================
      // CLUBE DE ASSINATURA
      // ==========================================
      AssinanteClube: {
        descricao: "Assinantes do clube de café com planos recorrentes",
        campos_principais: ["nome", "email", "telefone", "endereco", "plano (Mensal/Trimestral/Semestral/Anual)", "quantidade_pacotes", "tipo_cafe_preferido", "moagem_preferida", "data_inicio", "data_proxima_entrega", "status (Ativo/Pausado/Cancelado)", "slug_acesso"],
        relacionamentos: ["EntregaClube (1:N)"]
      },

      EntregaClube: {
        descricao: "Entregas programadas do clube de assinatura",
        campos_principais: ["assinante_id/nome/email", "data_programada", "data_entrega", "cafes_entregues[]", "status (Programada/Em Preparação/Enviada/Entregue/Cancelada)", "codigo_rastreamento"]
      },

      // ==========================================
      // INTEGRAÇÃO YAMPI (E-COMMERCE)
      // ==========================================
      ProdutoYampi: {
        descricao: "Produtos sincronizados da plataforma Yampi com variações/SKUs",
        campos_principais: ["yampi_id", "sku", "nome", "preco", "estoque", "categoria", "ativo", "tem_variacoes", "variacoes[] (com sku, preco, estoque, dimensões, opções)", "imagens[]", "ultima_sincronizacao"],
        sincronizacao: "Bidirecional via API Yampi"
      },

      PedidoYampi: {
        descricao: "Pedidos importados da Yampi com detalhes completos",
        campos_principais: ["yampi_id", "numero_pedido", "cliente_nome/email/telefone/cpf", "status", "status_pagamento", "valor_total/subtotal/frete/desconto", "itens[]", "endereco_entrega", "forma_pagamento", "codigo_rastreamento", "transacoes[]", "historico_status[]", "cupons[]"],
        sincronizacao: "Import via API ou JSON file"
      },

      ClienteYampi: {
        descricao: "Clientes importados da Yampi",
        campos_principais: ["yampi_id", "nome", "email", "telefone", "total_pedidos", "valor_total_gasto", "enderecos[]"]
      },

      CategoriaYampi: {
        descricao: "Categorias de produtos da Yampi",
        campos_principais: ["yampi_id", "nome", "slug", "descricao", "ordem", "ativo"]
      },

      LogSincronizacaoYampi: {
        descricao: "Logs de todas as sincronizações com a Yampi",
        campos_principais: ["tipo", "status", "mensagem", "detalhes"]
      },

      // ==========================================
      // OUTROS
      // ==========================================
      ProdutoAgridrones: {
        descricao: "Catálogo de produtos Agridrones (moedores/equipamentos) para calculadora de preço",
        campos_principais: ["nome", "tipo (Moedor/Equipamento/Acessório)", "valor_compra", "valor_venda_sugerido", "margem_padrao"]
      },

      Responsavel: {
        descricao: "Cadastro de responsáveis para atribuição em problemas e tarefas",
        campos_principais: ["nome", "email", "cargo", "area (Logística/Estoque/Atendimento/Geral)", "receber_problemas", "receber_estoque", "receber_logistica", "ativo"]
      },

      ConfiguracaoNotificacao: {
        descricao: "Configurações de notificações do sistema",
        campos_principais: ["chave", "valor (boolean)", "descricao", "categoria (Problemas/Estoque/Logística/Agenda/Geral)"]
      },

      EmpresaPermuta: {
        descricao: "Cadastro de empresas para clube de permuta de café",
        campos_principais: ["nome_empresa", "cnpj", "endereco_entrega", "contato_nome/telefone/email", "forma_cafe (Moído/Grãos)", "aceite_cobranca", "status (Pendente/Aprovado/Recusado)"]
      },

      User: {
        descricao: "Usuários do sistema (built-in) com campos customizados",
        campos_customizados: ["cargo (Super Admin/Administrativo/Parceiro Logístico/Representante)", "telefone", "localizacao_padrao (Venda Nova/Vila Velha/Ambos)"],
        campos_builtin: ["id", "email", "full_name", "role (admin/user)", "created_date"]
      }
    },

    paginas: {
      // ==========================================
      // PÁGINAS ADMINISTRATIVAS (autenticadas)
      // ==========================================
      Dashboard: {
        descricao: "Painel principal com métricas operacionais, atividades recentes e atalhos",
        entidades: ["Caixa", "Cafe", "Agendamento", "SolicitacaoEvento", "Problema"],
        componentes: ["StatsCard", "RecentActivity", "NotificationPanel", "SolicitacoesEventos", "ExportarDadosCard", "ApiConsultaCard"]
      },
      Tarefas: {
        descricao: "Quadro Kanban de tarefas da equipe com filtros e estatísticas",
        entidades: ["Tarefa", "EtiquetaProblema", "Responsavel"],
        componentes: ["TarefaKanban", "TarefaFormModal", "TarefaStats"]
      },
      Logistica: {
        descricao: "Dashboard de rastreamento de caixas com scan de etiquetas e upload em lote",
        entidades: ["Caixa"],
        componentes: ["CaixaCard", "CaixaFormModal", "ScanLabelModal", "BatchImageUploadModal"]
      },
      Estoque: {
        descricao: "Gestão completa de estoque com abas: Cafés, Reservas e Clientes",
        entidades: ["Cafe", "Cliente", "ReservaCafe", "PrecoCafe"],
        componentes: ["CafeCard", "CafeFormModal", "AdicionarEstoqueModal", "ReservasTab", "ReservasModal", "ReservaEditModal", "ClientesTab", "ClienteFormModal", "PrecosClienteModal", "EstoqueStats"]
      },
      Problemas: {
        descricao: "Central de chamados com visualização lista e Kanban",
        entidades: ["Problema", "AtualizacaoProblema", "EtiquetaProblema", "Responsavel"],
        componentes: ["ProblemaCard", "ProblemaFormModal", "ProblemaDetalhesModal", "ProblemaKanban", "ProblemaStats", "EtiquetasManager", "AtualizacoesTimeline"]
      },
      Agenda: {
        descricao: "Calendário de compromissos com criação, edição e exclusão em lote",
        entidades: ["Agendamento"],
        componentes: ["AgendamentoCard", "AgendamentoFormModal"]
      },
      AReceber: {
        descricao: "Contas a receber: checklist de reservas + demandas externas",
        entidades: ["ReservaCafe", "ItemChecklist", "ClienteChecklistItem", "DemandaExterna"],
        componentes: ["ReservaChecklistCard", "GerenciarItensChecklistModal", "DemandaExternaCard", "DemandaExternaFormModal", "HistoricoDemandaModal"]
      },
      LinksClientes: {
        descricao: "Geração e gestão de links personalizados de reserva para clientes",
        entidades: ["ClienteSlug", "Cliente", "ReservaCafe"]
      },
      GerenciarInfosCafe: {
        descricao: "CRUD de informações técnicas e sensoriais dos cafés",
        entidades: ["InfoCafe", "Cafe"],
        componentes: ["InfoCafeFormModal"]
      },
      GerenciarSubmissoes: {
        descricao: "Gestão de submissões de produtores com aprovação/recusa",
        entidades: ["SubmissaoProdutor"],
        componentes: ["EditarSubmissaoModal"]
      },
      SolicitacoesCafe: {
        descricao: "Gestão de solicitações de café para eventos e uso interno",
        entidades: ["SolicitacaoEvento", "Cafe"],
        componentes: ["SolicitacaoDetalhesModal", "SolicitacoesKanban"]
      },
      CalculadoraEventos: {
        descricao: "Calculadora de quantidade de café para eventos com formulário inteligente",
        entidades: ["Cafe", "SolicitacaoEvento"]
      },
      CalculadoraAgridrones: {
        descricao: "Calculadora de preço de venda de equipamentos Agridrones",
        entidades: ["ProdutoAgridrones"]
      },
      CalculadoraFornecedores: {
        descricao: "Calculadora de custos e margens para fornecedores",
        entidades: []
      },
      ClubeAssinatura: {
        descricao: "Gestão do clube de assinatura: assinantes e entregas",
        entidades: ["AssinanteClube", "EntregaClube", "Cafe"],
        componentes: ["AssinanteCard", "AssinanteFormModal", "EntregaCard", "EntregaFormModal"]
      },
      CotacaoFrete: {
        descricao: "Cotação de frete via Melhor Envio com configurações salvas",
        entidades: ["ConfiguracaoFrete"],
        componentes: ["ConfiguracaoFreteForm", "CotacaoForm", "ResultadoCotacao"]
      },
      IntegracaoYampi: {
        descricao: "Painel de sincronização bidirecional com a plataforma Yampi (produtos, pedidos, clientes, categorias)",
        entidades: ["ProdutoYampi", "PedidoYampi", "ClienteYampi", "CategoriaYampi", "LogSincronizacaoYampi"],
        componentes: ["EditarProdutoModal", "CriarProdutoModal", "BuscarProdutoModal", "LogsSincronizacao", "PedidoDetalhesModal", "PreviewImportacaoModal", "VariacoesModal"]
      },
      ContratosRPA: {
        descricao: "Gestão de contratos digitais com envio para assinatura via Autentique",
        entidades: ["ContratoRPA", "SignatarioContrato"],
        componentes: ["ContratoRPACard", "ContratoRPAFormModal", "EnviarAssinaturaModal"]
      },
      Relatorios: {
        descricao: "Relatórios gerenciais consolidados",
        entidades: ["Todas"]
      },
      Usuarios: {
        descricao: "Gestão de usuários e permissões do sistema",
        entidades: ["User"]
      },
      Configuracoes: {
        descricao: "Configurações gerais do sistema e notificações",
        entidades: ["ConfiguracaoNotificacao"],
        componentes: ["DeleteAccountSection"]
      },
      ExportarDados: {
        descricao: "Ferramenta de exportação de dados em diferentes formatos",
        entidades: ["Todas"]
      },
      DocumentacaoTecnica: {
        descricao: "Documentação técnica do sistema para desenvolvedores",
        entidades: []
      },
      PromptsDocs: {
        descricao: "Página de documentação com agregação dinâmica de dados de 35+ entidades",
        entidades: ["Todas"]
      },

      // ==========================================
      // PÁGINAS PÚBLICAS (sem autenticação)
      // ==========================================
      PortalCliente: {
        descricao: "Portal para clientes consultarem e criarem chamados de suporte",
        entidades: ["Problema", "AtualizacaoProblema"],
        acesso: "Público"
      },
      ReservaPublica: {
        descricao: "Página pública de reserva personalizada por cliente (via slug)",
        entidades: ["ClienteSlug", "Cafe", "PrecoCafe", "ReservaCafe"],
        acesso: "Público via URL com ?cliente={slug}"
      },
      SolicitarPatrocinio: {
        descricao: "Formulário público para solicitação de patrocínio/doação/participação",
        entidades: ["SolicitacaoPatrocinio"],
        acesso: "Público"
      },
      TabelaPrivateLabel: {
        descricao: "Tabela pública de cafés disponíveis na linha Private Label",
        entidades: ["Cafe"],
        acesso: "Público"
      },
      FormularioProdutor: {
        descricao: "Formulário público para produtores submeterem seus cafés",
        entidades: ["SubmissaoProdutor"],
        acesso: "Público"
      },
      InfoCafePublico: {
        descricao: "Página pública com ficha técnica completa de um café",
        entidades: ["InfoCafe"],
        acesso: "Público via slug"
      },
      CafesPublico: {
        descricao: "Catálogo público de cafés disponíveis",
        entidades: ["InfoCafe"],
        acesso: "Público"
      },
      MinhaAssinatura: {
        descricao: "Portal do assinante do clube para acompanhar entregas",
        entidades: ["AssinanteClube", "EntregaClube"],
        acesso: "Público via slug"
      },
      CadastroPermuta: {
        descricao: "Formulário público para empresas se cadastrarem no clube de permuta",
        entidades: ["EmpresaPermuta"],
        acesso: "Público"
      },
      Privacy: {
        descricao: "Política de privacidade (LGPD)",
        acesso: "Público"
      },
      Support: {
        descricao: "Página de suporte",
        acesso: "Público"
      }
    },

    funcoes_backend: {
      // Notificações
      alertarEstoqueBaixo: "Alerta de estoque baixo via email",
      notificarAgendamento: "Notifica participantes sobre agendamentos",
      notificarAtualizacao: "Notifica sobre atualizações em chamados",
      notificarProblema: "Notifica responsáveis sobre novos problemas",

      // API de Consulta
      apiConsultaDados: "API genérica de consulta de dados do sistema",
      getCafesPublicos: "Retorna cafés públicos para páginas sem autenticação",

      // Cotação de Frete
      cotarFrete: "Calcula frete via API Melhor Envio",
      calculateYampiShipping: "Calcula frete para pedidos Yampi",

      // Contratos / Autentique
      criarContratoAutentique: "Cria e envia contrato para assinatura digital via Autentique",
      consultarStatusContrato: "Consulta status de assinatura no Autentique",
      webhookAutentique: "Webhook para receber atualizações do Autentique",

      // Yampi
      syncYampiProducts: "Sincroniza produtos da Yampi",
      syncYampiProductsBatch: "Sincronização em lote de produtos",
      syncYampiOrders: "Sincroniza pedidos da Yampi",
      syncYampiCustomers: "Sincroniza clientes da Yampi",
      syncYampiCategories: "Sincroniza categorias da Yampi",
      previewYampiData: "Preview de dados antes da importação",
      createYampiProduct: "Cria produto na Yampi",
      updateYampiProduct: "Atualiza produto na Yampi",
      getYampiProductById: "Busca produto por ID na Yampi",
      getYampiOrderById: "Busca pedido por ID na Yampi",
      updateYampiOrderStatus: "Atualiza status de pedido na Yampi",
      bulkUpdateYampiProducts: "Atualização em massa de produtos",
      exportYampiOrdersToJson: "Exporta pedidos para arquivo JSON",
      importYampiOrdersFromJson: "Importa pedidos de arquivo JSON"
    },

    agentes_ia: {
      notificacoes_whatsapp: {
        descricao: "Agente de notificações via WhatsApp",
        ferramentas: "CRUD em entidades do sistema"
      }
    },

    integracoes_externas: {
      melhor_envio: {
        descricao: "Cálculo de frete e rastreamento",
        secrets: ["MELHOR_ENVIO_TOKEN", "MELHOR_ENVIO_SANDBOX"]
      },
      autentique: {
        descricao: "Assinatura digital de contratos",
        secrets: ["AUTENTIQUE_API_TOKEN"]
      },
      yampi: {
        descricao: "Plataforma de e-commerce (produtos, pedidos, clientes)",
        secrets: ["YAMPI_USER_TOKEN", "YAMPI_USER_SECRET_KEY", "YAMPI_MERCHANT_ALIAS"]
      },
      google_sso: {
        descricao: "Autenticação via Google",
        secrets: ["sso_client_id", "sso_client_secret", "sso_discovery_url", "sso_scope", "sso_name"]
      }
    },

    seguranca_e_permissoes: {
      roles: {
        admin: "Acesso total ao sistema",
        user: "Acesso limitado conforme cargo"
      },
      cargos: {
        "Super Admin": "Controle total (equivalente admin)",
        "Administrativo": "Gestão operacional completa (CRUD na maioria das entidades)",
        "Parceiro Logístico": "Acesso a logística, estoque e tarefas (somente leitura em muitas áreas)",
        "Representante": "Acesso a clientes, chamados, tarefas e solicitações"
      },
      rls: "Row Level Security implementada em todas as entidades com regras baseadas em role e cargo"
    },

    layout_e_navegacao: {
      desktop: "Sidebar fixa com todas as seções + footer com usuário logado",
      mobile: "Header com botão voltar + Bottom Tabs (Dashboard, Logística, Estoque, Chamados + Menu)",
      tema: {
        cores_principais: { marrom: "#6B4423", dourado: "#C9A961", creme: "#F5F1E8", verde: "#2D5016" },
        dark_mode: "Suportado com toggle no header/sidebar",
        safe_areas: "Suporte a safe areas para dispositivos móveis"
      }
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-[#F5F1E8] to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#6B4423] dark:text-[#C9A961] mb-2">
          Estrutura do Sistema
        </h1>
        <p className="text-[#8B7355] dark:text-gray-400 mb-6">
          Documentação JSON completa da arquitetura do Café Seleção do Mário
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5DCC8] dark:border-gray-700 p-6 overflow-auto">
          <pre className="text-xs md:text-sm text-[#5A4A3A] dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {JSON.stringify(estrutura, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}