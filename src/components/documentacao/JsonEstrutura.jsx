import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Database } from "lucide-react";

const estruturaCompleta = {
  sistema: {
    nome: "Café Seleção do Mário",
    descricao: "Sistema de gestão operacional para torrefação de cafés especiais",
    versao: "2.0",
    plataforma: "Base44 Platform V2",
    stack: { frontend: "React 18 + Vite", estilizacao: "Tailwind CSS + shadcn/ui", backend: "Deno Deploy (Base44 Functions)", banco: "Base44 Entities (NoSQL)", autenticacao: "Google OAuth SSO", animacoes: "Framer Motion", graficos: "Recharts" },
    tema: { cores: { marrom: "#6B4423", dourado: "#C9A961", creme: "#F5F1E8", verde: "#2D5016" }, dark_mode: true, safe_areas: true, responsivo: true }
  },

  entidades: {
    User: {
      descricao: "Usuários do sistema (built-in + customizado)",
      campos_builtin: { id: "string", email: "string", full_name: "string", role: "admin | user", created_date: "datetime" },
      campos_custom: {
        cargo: { tipo: "enum", valores: ["Super Admin", "Administrativo", "Parceiro Logístico", "Representante"], obrigatorio: true },
        telefone: { tipo: "string", obrigatorio: true },
        localizacao_padrao: { tipo: "enum", valores: ["Venda Nova", "Vila Velha", "Ambos"], obrigatorio: true }
      }
    },
    Cafe: {
      descricao: "Cadastro de cafés com estoque por embalagem e localização",
      campos: {
        nome: { tipo: "string", obrigatorio: true, descricao: "Nome do café" },
        forma: { tipo: "enum", valores: ["Grão", "Moído"], padrao: "Grão", obrigatorio: true },
        quantidade_pacotes: { tipo: "number", descricao: "Quantidade total em pacotes de 250g" },
        estoque_por_embalagem: { tipo: "object", descricao: "Estoque por tipo: { '10g': 0, '18g': 0, '100g': 0, '250g': 0, '500g': 0, '1kg': 0 }" },
        embalagens_disponiveis: { tipo: "array", valores_possiveis: ["10g", "18g", "100g", "250g", "500g", "1kg"], padrao: ["250g"] },
        localizacao: { tipo: "enum", valores: ["Vila Velha", "Venda Nova"], padrao: "Vila Velha" },
        data_entrada: { tipo: "date" },
        observacoes: { tipo: "string" },
        is_private_label: { tipo: "boolean", padrao: false },
        precos_private_label: { tipo: "object", descricao: "{ '10g': number, '250g': number, '1kg': number }" },
        descricao_private_label: { tipo: "string" },
        notas_degustacao: { tipo: "string" },
        origem: { tipo: "string" },
        torra: { tipo: "enum", valores: ["Clara", "Média", "Escura"] }
      },
      rls: { create: "admin | Administrativo", read: "admin | Administrativo | Parceiro Logístico | Representante", update: "admin | Administrativo", delete: "admin" }
    },
    Cliente: {
      descricao: "Cadastro de clientes",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        email: { tipo: "email" },
        telefone: { tipo: "string" },
        endereco: { tipo: "string" },
        localizacao: { tipo: "enum", valores: ["Vila Velha", "Venda Nova", "Outro"], padrao: "Vila Velha" },
        observacoes: { tipo: "string" },
        ativo: { tipo: "boolean", padrao: true }
      },
      rls: { create: "admin | Administrativo | Representante", read: "admin | Administrativo | Representante | Parceiro Logístico", update: "admin | Administrativo | Representante", delete: "admin" }
    },
    ReservaCafe: {
      descricao: "Reservas de café vinculadas a clientes",
      campos: {
        cliente_id: { tipo: "string", obrigatorio: true },
        cliente_nome: { tipo: "string", obrigatorio: true },
        cafe_id: { tipo: "string", obrigatorio: true },
        cafe_nome: { tipo: "string", obrigatorio: true },
        cafe_forma: { tipo: "enum", valores: ["Grão", "Moído"], obrigatorio: true },
        embalagem: { tipo: "enum", valores: ["10g", "18g", "100g", "250g", "500g", "1kg"], padrao: "250g" },
        quantidade_pacotes: { tipo: "number", obrigatorio: true },
        data_reserva: { tipo: "date" },
        data_entrega: { tipo: "date" },
        status: { tipo: "enum", valores: ["Ativa", "Entregue", "Cancelada"], padrao: "Ativa" },
        observacoes: { tipo: "string" }
      }
    },
    PrecoCafe: {
      descricao: "Preços personalizados por cliente para cada café",
      campos: {
        cliente_id: { tipo: "string", obrigatorio: true },
        cliente_nome: { tipo: "string", obrigatorio: true },
        cafe_id: { tipo: "string", obrigatorio: true },
        cafe_nome: { tipo: "string", obrigatorio: true },
        preco_por_pacote: { tipo: "number", obrigatorio: true },
        ativo: { tipo: "boolean", padrao: true }
      },
      rls: { create: "admin | Administrativo", read: "admin | Administrativo | Representante", update: "admin | Administrativo", delete: "admin" }
    },
    ClienteSlug: {
      descricao: "Links personalizados de reserva para clientes",
      campos: {
        cliente_id: { tipo: "string", obrigatorio: true },
        cliente_nome: { tipo: "string", obrigatorio: true },
        slug: { tipo: "string", obrigatorio: true, descricao: "Slug único para URL" },
        ativo: { tipo: "boolean", padrao: true },
        mostrar_precos: { tipo: "boolean", padrao: false }
      },
      uso: "URL pública: /ReservaPublica?cliente={slug}",
      rls: { create: "admin | Administrativo | Representante", read: "admin | Administrativo | Representante", update: "admin | Administrativo | Representante", delete: "admin" }
    },
    Caixa: {
      descricao: "Rastreamento de caixas entre unidades (Vila Velha ↔ Venda Nova)",
      campos: {
        numero_identificacao: { tipo: "string", obrigatorio: true },
        origem: { tipo: "enum", valores: ["Venda Nova", "Vila Velha"], padrao: "Venda Nova", obrigatorio: true },
        destino: { tipo: "enum", valores: ["Venda Nova", "Vila Velha"], padrao: "Vila Velha", obrigatorio: true },
        status: { tipo: "enum", valores: ["Aguardando Envio", "Em Trânsito", "Entregue", "Problema"], padrao: "Aguardando Envio" },
        responsavel: { tipo: "string" },
        tem_etiqueta: { tipo: "boolean", padrao: false },
        codigo_etiqueta: { tipo: "string" },
        meio_transporte: { tipo: "enum", valores: ["Transportadora", "Correios", "Entrega Direta", "Outro"] },
        codigo_rastreamento: { tipo: "string" },
        conteudo: { tipo: "string" },
        data_envio: { tipo: "date" },
        data_entrega_prevista: { tipo: "date" },
        data_entrega_real: { tipo: "date" },
        observacoes: { tipo: "string" }
      }
    },
    Problema: {
      descricao: "Sistema de chamados/tickets de suporte",
      campos: {
        nome_cliente: { tipo: "string", obrigatorio: true },
        email_cliente: { tipo: "email", obrigatorio: true },
        telefone_cliente: { tipo: "string" },
        descricao: { tipo: "string", obrigatorio: true },
        tipo: { tipo: "enum", valores: ["Logística", "Estoque", "Cliente", "Fornecedor", "Equipamento", "Qualidade", "Outro"], obrigatorio: true },
        etiquetas: { tipo: "array[string]", descricao: "IDs das etiquetas" },
        prioridade: { tipo: "enum", valores: ["Baixa", "Média", "Alta", "Urgente"], padrao: "Média" },
        status: { tipo: "enum", valores: ["Aberto", "Em Andamento", "Aguardando", "Resolvido", "Cancelado"], padrao: "Aberto" },
        responsavel: { tipo: "string" },
        data_abertura: { tipo: "date" },
        data_resolucao: { tipo: "date" },
        solucao: { tipo: "string" },
        ultima_interacao_equipe: { tipo: "datetime" },
        tem_novas_atualizacoes: { tipo: "boolean", padrao: false }
      }
    },
    AtualizacaoProblema: {
      descricao: "Timeline de atualizações de cada chamado",
      campos: {
        problema_id: { tipo: "string", obrigatorio: true },
        tipo: { tipo: "enum", valores: ["Comentário", "Mudança Status", "Atribuição", "Resolução", "Interno"], obrigatorio: true },
        mensagem: { tipo: "string", obrigatorio: true },
        autor: { tipo: "string", obrigatorio: true },
        visivel_cliente: { tipo: "boolean", padrao: true },
        notificar_cliente: { tipo: "boolean", padrao: false }
      }
    },
    EtiquetaProblema: {
      descricao: "Etiquetas para categorizar problemas e tarefas",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        cor: { tipo: "string", obrigatorio: true, descricao: "Cor hex" },
        descricao: { tipo: "string" }
      }
    },
    Tarefa: {
      descricao: "Kanban de tarefas internas da equipe",
      campos: {
        titulo: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string" },
        status: { tipo: "enum", valores: ["A Fazer", "Em Andamento", "Em Revisão", "Concluído"], padrao: "A Fazer", obrigatorio: true },
        prioridade: { tipo: "enum", valores: ["Baixa", "Média", "Alta", "Urgente"], padrao: "Média" },
        responsavel: { tipo: "string" },
        tipo: { tipo: "enum", valores: ["Desenvolvimento", "Logística", "Estoque", "Atendimento", "Administrativo", "Outro"], padrao: "Outro" },
        prazo: { tipo: "date" },
        data_inicio: { tipo: "date" },
        data_conclusao: { tipo: "date" },
        tempo_estimado: { tipo: "number", descricao: "Horas" },
        etiquetas: { tipo: "array[string]" },
        observacoes: { tipo: "string" }
      }
    },
    Agendamento: {
      descricao: "Agenda de compromissos e eventos",
      campos: {
        titulo: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string" },
        data_inicio: { tipo: "datetime", obrigatorio: true },
        data_fim: { tipo: "datetime", obrigatorio: true },
        local: { tipo: "string" },
        tipo: { tipo: "enum", valores: ["Reunião", "Visita Cliente", "Fornecedor", "Evento", "Degustação", "Treinamento", "Outro"] },
        participantes: { tipo: "array[string]" },
        link_google_calendar: { tipo: "string" },
        notificar_participantes: { tipo: "boolean", padrao: true },
        status: { tipo: "enum", valores: ["Agendado", "Confirmado", "Em Andamento", "Concluído", "Cancelado"], padrao: "Agendado" }
      }
    },
    DemandaExterna: {
      descricao: "Contas a receber de demandas externas",
      campos: {
        cliente_nome: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string", obrigatorio: true },
        valor: { tipo: "number", obrigatorio: true },
        data_vencimento: { tipo: "date", obrigatorio: true },
        data_pagamento: { tipo: "date" },
        status: { tipo: "enum", valores: ["Pendente", "Pago", "Vencido", "Renegociado", "Cancelado"], padrao: "Pendente" },
        forma_pagamento: { tipo: "string" },
        observacoes: { tipo: "string" }
      }
    },
    ItemChecklist: {
      descricao: "Itens do checklist de processos (ex: NF Gerada, Boleto Enviado)",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string" },
        ordem: { tipo: "number", obrigatorio: true },
        cor: { tipo: "string" },
        ativo: { tipo: "boolean", padrao: true }
      }
    },
    ClienteChecklistItem: {
      descricao: "Registro de conclusão de cada item do checklist por reserva",
      campos: {
        cliente_id: { tipo: "string", obrigatorio: true },
        cliente_nome: { tipo: "string", obrigatorio: true },
        reserva_id: { tipo: "string" },
        item_checklist_id: { tipo: "string", obrigatorio: true },
        item_checklist_nome: { tipo: "string", obrigatorio: true },
        concluido: { tipo: "boolean", padrao: false },
        data_conclusao: { tipo: "datetime" },
        usuario_conclusao: { tipo: "string" },
        observacoes: { tipo: "string" }
      }
    },
    Responsavel: {
      descricao: "Responsáveis para atribuição em problemas e tarefas",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        email: { tipo: "email", obrigatorio: true },
        cargo: { tipo: "string" },
        area: { tipo: "enum", valores: ["Logística", "Estoque", "Atendimento", "Geral"], obrigatorio: true },
        receber_problemas: { tipo: "boolean", padrao: true },
        receber_estoque: { tipo: "boolean", padrao: true },
        receber_logistica: { tipo: "boolean", padrao: false },
        ativo: { tipo: "boolean", padrao: true }
      }
    },
    ConfiguracaoNotificacao: {
      descricao: "Configurações de notificações do sistema",
      campos: {
        chave: { tipo: "string", obrigatorio: true },
        valor: { tipo: "boolean", obrigatorio: true },
        descricao: { tipo: "string" },
        categoria: { tipo: "enum", valores: ["Problemas", "Estoque", "Logística", "Agenda", "Geral"], obrigatorio: true }
      }
    },
    InfoCafe: {
      descricao: "Informações sensoriais e técnicas dos cafés para exibição pública",
      campos: {
        cafe_id: { tipo: "string" },
        cafe_nome: { tipo: "string", obrigatorio: true },
        slug: { tipo: "string", obrigatorio: true },
        ativo: { tipo: "boolean", padrao: true },
        infos_sensoriais: { tipo: "object", descricao: "{ origem, tipo_grao, variedade, processamento, bebida, sabor, docura, aroma, acidez, corpo, torra, moagem, escala_intensidade }" },
        ingredientes: { tipo: "string" },
        metodos_preparo: { tipo: "array[string]" },
        infos_adicionais: { tipo: "object", descricao: "{ modo_conservacao, embalagens_disponiveis[], registro }" }
      },
      rls: { create: "admin | Administrativo", read: "público", update: "admin | Administrativo", delete: "admin" }
    },
    SubmissaoProdutor: {
      descricao: "Submissões de cafés por produtores externos",
      campos: {
        nome_cafe: { tipo: "string", obrigatorio: true },
        origem: { tipo: "string" },
        tipo_grao: { tipo: "string" },
        variedade: { tipo: "string" },
        processamento: { tipo: "string" },
        bebida: { tipo: "string" },
        sabor_notas_sensoriais: { tipo: "string" },
        docura: { tipo: "string" },
        aroma: { tipo: "string" },
        acidez_tipo: { tipo: "string" },
        acidez_intensidade: { tipo: "string" },
        corpo: { tipo: "string" },
        torra: { tipo: "string" },
        moagem: { tipo: "string" },
        escala_intensidade: { tipo: "number", descricao: "1 a 10" },
        pontuacao: { tipo: "number", descricao: "0 a 100" },
        modo_conservacao: { tipo: "string" },
        metodos_preparo: { tipo: "string" },
        notas_degustacao: { tipo: "string" },
        altitude: { tipo: "string" },
        certificacoes: { tipo: "string" },
        observacoes: { tipo: "string" },
        status: { tipo: "enum", valores: ["Pendente", "Em Análise", "Aprovado", "Recusado"], padrao: "Pendente" },
        notas_admin: { tipo: "string" }
      },
      rls: { create: "público", read: "admin | Administrativo", update: "admin | Administrativo", delete: "admin" }
    },
    SolicitacaoEvento: {
      descricao: "Solicitações de café para eventos ou uso interno com calculadora",
      campos: {
        tipo_solicitacao: { tipo: "enum", valores: ["Evento", "Interno"], padrao: "Evento", obrigatorio: true },
        cliente_id: { tipo: "string" },
        cliente_nome: { tipo: "string", obrigatorio: true },
        email_cliente: { tipo: "email" },
        telefone_cliente: { tipo: "string" },
        data_evento: { tipo: "date", obrigatorio: true },
        local_evento: { tipo: "string", obrigatorio: true },
        publico_total: { tipo: "number" },
        taxa_adesao: { tipo: "number", descricao: "Percentual" },
        dias_evento: { tipo: "number" },
        horas_por_dia: { tipo: "number" },
        ml_por_copo: { tipo: "number" },
        fator_perdas: { tipo: "number", descricao: "Percentual" },
        quantidade_funcionarios: { tipo: "number" },
        consumo_diario_ml: { tipo: "number" },
        xicaras_por_dia: { tipo: "number" },
        tamanho_xicara: { tipo: "number", descricao: "100 ou 200ml" },
        consumidores_esperados: { tipo: "number", descricao: "Calculado" },
        kg_total_calculado: { tipo: "number" },
        pacotes_totais_calculados: { tipo: "number" },
        cafes_selecionados: { tipo: "array[object]", descricao: "[{ cafe_id, cafe_nome, cafe_forma, embalagem, quantidade_pacotes }]" },
        observacoes: { tipo: "string" },
        status: { tipo: "enum", valores: ["Pendente", "Em Análise", "Aprovada", "Cancelada"], padrao: "Pendente" },
        resposta_admin: { tipo: "string" },
        valor_total: { tipo: "number" }
      }
    },
    SolicitacaoPatrocinio: {
      descricao: "Avaliação de solicitações de patrocínio/doação",
      campos: {
        nome_organizador: { tipo: "string", obrigatorio: true },
        email_contato: { tipo: "email", obrigatorio: true },
        telefone_contato: { tipo: "string" },
        nome_evento: { tipo: "string", obrigatorio: true },
        tipo_evento: { tipo: "enum", valores: ["Corporativo", "Esportivo", "Cultural", "Educacional", "Social", "Feira/Exposição", "Outro"], obrigatorio: true },
        data_evento: { tipo: "date", obrigatorio: true },
        local_evento: { tipo: "string", obrigatorio: true },
        publico_esperado: { tipo: "number" },
        duracao_dias: { tipo: "number", padrao: 1 },
        tipo_solicitacao: { tipo: "enum", valores: ["Patrocínio", "Doação", "Participação/Stand"], obrigatorio: true },
        descricao_evento: { tipo: "string" },
        proposta_patrocinio: { tipo: "string", obrigatorio: true },
        contrapartidas_oferecidas: { tipo: "string", obrigatorio: true },
        beneficios_visibilidade: { tipo: "string", obrigatorio: true },
        alcance_estimado: { tipo: "string", obrigatorio: true },
        exclusividade_categoria: { tipo: "enum", valores: ["sim", "nao", "negociavel"] },
        status: { tipo: "enum", valores: ["Nova", "Em Análise", "Aguardando Informações", "Aprovada", "Recusada", "Concluída"], padrao: "Nova" },
        pontuacao_alinhamento: { tipo: "number", descricao: "0-10" },
        pontuacao_visibilidade: { tipo: "number", descricao: "0-10" },
        pontuacao_roi: { tipo: "number", descricao: "0-10" },
        pontuacao_total: { tipo: "number" },
        decisao_final: { tipo: "enum", valores: ["Pendente", "Aprovado Total", "Aprovado Parcial", "Recusado"], padrao: "Pendente" },
        nivel_patrocinio: { tipo: "enum", valores: ["Não se aplica", "Bronze", "Prata", "Ouro", "Diamante"] },
        quantidade_cafe_aprovada: { tipo: "number", descricao: "kg" },
        observacoes_internas: { tipo: "string" },
        responsavel_analise: { tipo: "string" }
      }
    },
    ContratoRPA: {
      descricao: "Contratos RPA com assinatura eletrônica via Autentique",
      campos: {
        numero_contrato: { tipo: "string", obrigatorio: true },
        tipo_servico: { tipo: "enum", valores: ["Consultoria", "Desenvolvimento", "Suporte", "Treinamento", "Outro"], obrigatorio: true },
        contratante_nome: { tipo: "string", obrigatorio: true },
        contratante_cpf: { tipo: "string", obrigatorio: true },
        contratante_email: { tipo: "email", obrigatorio: true },
        contratante_telefone: { tipo: "string" },
        contratante_endereco: { tipo: "string" },
        contratada_nome: { tipo: "string" },
        contratada_cnpj: { tipo: "string" },
        contratada_representante: { tipo: "string" },
        descricao_servico: { tipo: "string", obrigatorio: true },
        valor_contrato: { tipo: "number", obrigatorio: true },
        forma_pagamento: { tipo: "string" },
        data_inicio: { tipo: "date" },
        data_termino: { tipo: "date" },
        prazo_meses: { tipo: "number" },
        status: { tipo: "enum", valores: ["Rascunho", "Aguardando Assinatura", "Assinado", "Cancelado", "Expirado"], padrao: "Rascunho" },
        autentique_document_id: { tipo: "string" },
        autentique_document_url: { tipo: "string" },
        autentique_signed_url: { tipo: "string" },
        data_envio_assinatura: { tipo: "datetime" },
        data_assinatura: { tipo: "datetime" },
        observacoes: { tipo: "string" }
      }
    },
    AssinanteClube: {
      descricao: "Assinantes do clube de café",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        email: { tipo: "email", obrigatorio: true },
        telefone: { tipo: "string" },
        endereco: { tipo: "string" },
        plano: { tipo: "enum", valores: ["Mensal", "Trimestral", "Semestral", "Anual"], padrao: "Mensal", obrigatorio: true },
        quantidade_pacotes: { tipo: "number", obrigatorio: true },
        tipo_cafe_preferido: { tipo: "string" },
        moagem_preferida: { tipo: "enum", valores: ["Grão", "Moído Grosso", "Moído Médio", "Moído Fino"] },
        data_inicio: { tipo: "date" },
        data_proxima_entrega: { tipo: "date" },
        status: { tipo: "enum", valores: ["Ativo", "Pausado", "Cancelado"], padrao: "Ativo" },
        slug_acesso: { tipo: "string" },
        observacoes: { tipo: "string" }
      }
    },
    EntregaClube: {
      descricao: "Entregas programadas do clube de assinatura",
      campos: {
        assinante_id: { tipo: "string", obrigatorio: true },
        assinante_nome: { tipo: "string", obrigatorio: true },
        assinante_email: { tipo: "string" },
        data_programada: { tipo: "date", obrigatorio: true },
        data_entrega: { tipo: "date" },
        cafes_entregues: { tipo: "array[object]", descricao: "[{ cafe_nome, quantidade, moagem }]" },
        status: { tipo: "enum", valores: ["Programada", "Em Preparação", "Enviada", "Entregue", "Cancelada"], padrao: "Programada" },
        codigo_rastreamento: { tipo: "string" },
        observacoes: { tipo: "string" }
      }
    },
    ProdutoYampi: {
      descricao: "Produtos sincronizados da plataforma Yampi",
      campos: {
        yampi_id: { tipo: "string", obrigatorio: true },
        sku: { tipo: "string" },
        nome: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string" },
        preco: { tipo: "number" },
        preco_promocional: { tipo: "number" },
        estoque: { tipo: "number" },
        imagem_url: { tipo: "string" },
        categoria: { tipo: "string" },
        ativo: { tipo: "boolean", padrao: true },
        peso: { tipo: "number", descricao: "kg" },
        altura: { tipo: "number", descricao: "cm" },
        largura: { tipo: "number", descricao: "cm" },
        comprimento: { tipo: "number", descricao: "cm" },
        tem_variacoes: { tipo: "boolean", padrao: false },
        total_skus: { tipo: "number" },
        variacoes: { tipo: "array[object]", descricao: "[{ sku_id, sku, titulo, preco, estoque, opcoes[], imagens[] }]" },
        imagens: { tipo: "array[string]" },
        ultima_sincronizacao: { tipo: "datetime" }
      }
    },
    PedidoYampi: {
      descricao: "Pedidos importados da Yampi",
      campos: {
        yampi_id: { tipo: "string", obrigatorio: true },
        numero_pedido: { tipo: "string", obrigatorio: true },
        cliente_nome: { tipo: "string" },
        cliente_email: { tipo: "string" },
        cliente_telefone: { tipo: "string" },
        cliente_cpf: { tipo: "string" },
        status: { tipo: "string" },
        status_pagamento: { tipo: "string" },
        valor_total: { tipo: "number" },
        valor_subtotal: { tipo: "number" },
        valor_frete: { tipo: "number" },
        valor_desconto: { tipo: "number" },
        itens: { tipo: "array[object]", descricao: "[{ produto_id, produto_nome, sku, quantidade, preco_unitario, preco_total }]" },
        endereco_entrega: { tipo: "object", descricao: "{ rua, numero, complemento, bairro, cidade, estado, cep }" },
        data_pedido: { tipo: "datetime" },
        forma_pagamento: { tipo: "string" },
        codigo_rastreamento: { tipo: "string" },
        transportadora: { tipo: "string" },
        transacoes: { tipo: "array[object]" },
        historico_status: { tipo: "array[object]" },
        cupons: { tipo: "array[object]" },
        ultima_sincronizacao: { tipo: "datetime" }
      }
    },
    ProdutoAgridrones: {
      descricao: "Catálogo de produtos Agridrones para calculadora de preço",
      campos: {
        nome: { tipo: "string", obrigatorio: true },
        descricao: { tipo: "string" },
        tipo: { tipo: "enum", valores: ["Moedor", "Equipamento", "Acessório", "Outro"], padrao: "Moedor" },
        valor_compra: { tipo: "number", obrigatorio: true },
        valor_venda_sugerido: { tipo: "number" },
        margem_padrao: { tipo: "number", descricao: "Percentual" },
        ativo: { tipo: "boolean", padrao: true },
        observacoes: { tipo: "string" }
      }
    },
    ConfiguracaoFrete: {
      descricao: "Configurações padrão para cálculo de frete via Melhor Envio",
      campos: {
        cep_origem: { tipo: "string", obrigatorio: true },
        peso_padrao: { tipo: "number", descricao: "kg" },
        altura_padrao: { tipo: "number", descricao: "cm" },
        largura_padrao: { tipo: "number", descricao: "cm" },
        comprimento_padrao: { tipo: "number", descricao: "cm" },
        valor_declarado_padrao: { tipo: "number", descricao: "R$" },
        ativo: { tipo: "boolean", padrao: true }
      }
    },
    EmpresaPermuta: {
      descricao: "Cadastro de empresas para clube de permuta",
      campos: {
        nome_empresa: { tipo: "string", obrigatorio: true },
        cnpj: { tipo: "string", obrigatorio: true },
        endereco_entrega: { tipo: "string" },
        cep: { tipo: "string" },
        cidade: { tipo: "string" },
        estado: { tipo: "string" },
        telefone_empresa: { tipo: "string" },
        contato_nome: { tipo: "string", obrigatorio: true },
        contato_telefone: { tipo: "string" },
        contato_email: { tipo: "email", obrigatorio: true },
        forma_cafe: { tipo: "enum", valores: ["Moído", "Grãos"], obrigatorio: true },
        aceite_cobranca: { tipo: "boolean", padrao: false, obrigatorio: true },
        status: { tipo: "enum", valores: ["Pendente", "Aprovado", "Recusado"], padrao: "Pendente" }
      }
    }
  },

  paginas: {
    autenticadas: {
      Dashboard: { descricao: "Painel principal com KPIs operacionais", entidades: ["Caixa", "Cafe", "Agendamento", "SolicitacaoEvento", "Problema"] },
      Tarefas: { descricao: "Quadro Kanban de tarefas da equipe", entidades: ["Tarefa", "EtiquetaProblema", "Responsavel"] },
      Logistica: { descricao: "Rastreamento de caixas entre unidades", entidades: ["Caixa"] },
      Estoque: { descricao: "Gestão de cafés, reservas e clientes", entidades: ["Cafe", "Cliente", "ReservaCafe", "PrecoCafe"] },
      Problemas: { descricao: "Central de chamados com lista e Kanban", entidades: ["Problema", "AtualizacaoProblema", "EtiquetaProblema", "Responsavel"] },
      Agenda: { descricao: "Calendário de compromissos", entidades: ["Agendamento"] },
      AReceber: { descricao: "Financeiro: checklist de reservas + demandas externas", entidades: ["ReservaCafe", "ItemChecklist", "ClienteChecklistItem", "DemandaExterna"] },
      LinksClientes: { descricao: "Links personalizados de reserva", entidades: ["ClienteSlug", "Cliente", "ReservaCafe"] },
      GerenciarInfosCafe: { descricao: "CRUD de informações técnicas dos cafés", entidades: ["InfoCafe", "Cafe"] },
      GerenciarSubmissoes: { descricao: "Gestão de submissões de produtores", entidades: ["SubmissaoProdutor"] },
      SolicitacoesCafe: { descricao: "Gestão de solicitações de café para eventos", entidades: ["SolicitacaoEvento", "Cafe"] },
      CalculadoraEventos: { descricao: "Calculadora de café para eventos", entidades: ["Cafe", "SolicitacaoEvento"] },
      CalculadoraAgridrones: { descricao: "Calculadora de preço de equipamentos", entidades: ["ProdutoAgridrones"] },
      CalculadoraFornecedores: { descricao: "Calculadora de custos para fornecedores", entidades: [] },
      ClubeAssinatura: { descricao: "Gestão do clube: assinantes e entregas", entidades: ["AssinanteClube", "EntregaClube", "Cafe"] },
      CotacaoFrete: { descricao: "Cotação de frete via Melhor Envio", entidades: ["ConfiguracaoFrete"] },
      IntegracaoYampi: { descricao: "Sincronização bidirecional com Yampi", entidades: ["ProdutoYampi", "PedidoYampi", "ClienteYampi", "CategoriaYampi", "LogSincronizacaoYampi"] },
      ContratosRPA: { descricao: "Contratos digitais com assinatura Autentique", entidades: ["ContratoRPA", "SignatarioContrato"] },
      Relatorios: { descricao: "Relatórios gerenciais", entidades: ["Todas"] },
      Usuarios: { descricao: "Gestão de usuários", entidades: ["User"] },
      Configuracoes: { descricao: "Configurações e notificações", entidades: ["ConfiguracaoNotificacao"] },
      ExportarDados: { descricao: "Exportação de dados", entidades: ["Todas"] },
      DocumentacaoTecnica: { descricao: "Documentação técnica do sistema", entidades: [] },
      PromptsDocs: { descricao: "Documentação com dados agregados", entidades: ["Todas"] }
    },
    publicas: {
      PortalCliente: { descricao: "Portal de chamados para clientes", entidades: ["Problema", "AtualizacaoProblema"] },
      ReservaPublica: { descricao: "Página de reserva via slug", entidades: ["ClienteSlug", "Cafe", "PrecoCafe", "ReservaCafe"], acesso_via: "/ReservaPublica?cliente={slug}" },
      SolicitarPatrocinio: { descricao: "Formulário de patrocínio", entidades: ["SolicitacaoPatrocinio"] },
      TabelaPrivateLabel: { descricao: "Tabela pública Private Label", entidades: ["Cafe"] },
      FormularioProdutor: { descricao: "Formulário para produtores", entidades: ["SubmissaoProdutor"] },
      InfoCafePublico: { descricao: "Ficha técnica do café", entidades: ["InfoCafe"], acesso_via: "/InfoCafePublico?slug={slug}" },
      CafesPublico: { descricao: "Catálogo público de cafés", entidades: ["InfoCafe"] },
      MinhaAssinatura: { descricao: "Portal do assinante", entidades: ["AssinanteClube", "EntregaClube"], acesso_via: "/MinhaAssinatura?slug={slug}" },
      CadastroPermuta: { descricao: "Cadastro clube de permuta", entidades: ["EmpresaPermuta"] },
      Privacy: { descricao: "Política de privacidade (LGPD)" },
      Support: { descricao: "Página de suporte" }
    }
  },

  funcoes_backend: {
    notificacoes: {
      alertarEstoqueBaixo: { descricao: "Alerta de estoque baixo via email", input: "{}", output: "{ success, alerts }" },
      notificarAgendamento: { descricao: "Lembrete de agendamento", input: "{ agendamento_id }", output: "{ success }" },
      notificarAtualizacao: { descricao: "Notifica atualização de chamado", input: "{ problema_id, atualizacao_id }", output: "{ success }" },
      notificarProblema: { descricao: "Notifica novo chamado", input: "{ problema_id }", output: "{ success }" }
    },
    yampi: {
      syncYampiProducts: { descricao: "Sincroniza produtos", secrets: ["YAMPI_USER_TOKEN", "YAMPI_USER_SECRET_KEY", "YAMPI_MERCHANT_ALIAS"] },
      syncYampiProductsBatch: { descricao: "Sync em lote", secrets: ["YAMPI_*"] },
      syncYampiOrders: { descricao: "Sincroniza pedidos", secrets: ["YAMPI_*"] },
      syncYampiCustomers: { descricao: "Sincroniza clientes", secrets: ["YAMPI_*"] },
      syncYampiCategories: { descricao: "Sincroniza categorias", secrets: ["YAMPI_*"] },
      previewYampiData: { descricao: "Preview antes de importar", secrets: ["YAMPI_*"] },
      createYampiProduct: { descricao: "Cria produto na Yampi", secrets: ["YAMPI_*"] },
      updateYampiProduct: { descricao: "Atualiza produto", secrets: ["YAMPI_*"] },
      getYampiProductById: { descricao: "Busca produto por ID", secrets: ["YAMPI_*"] },
      getYampiOrderById: { descricao: "Busca pedido por ID", secrets: ["YAMPI_*"] },
      updateYampiOrderStatus: { descricao: "Atualiza status de pedido", secrets: ["YAMPI_*"] },
      bulkUpdateYampiProducts: { descricao: "Atualização em massa", secrets: ["YAMPI_*"] },
      exportYampiOrdersToJson: { descricao: "Exporta pedidos para JSON", secrets: ["YAMPI_*"] },
      importYampiOrdersFromJson: { descricao: "Importa pedidos de JSON", secrets: ["YAMPI_*"] }
    },
    autentique: {
      criarContratoAutentique: { descricao: "Cria e envia contrato para assinatura", secrets: ["AUTENTIQUE_API_TOKEN"] },
      consultarStatusContrato: { descricao: "Consulta status da assinatura", secrets: ["AUTENTIQUE_API_TOKEN"] },
      webhookAutentique: { descricao: "Webhook de eventos Autentique", secrets: [] }
    },
    frete: {
      cotarFrete: { descricao: "Calcula frete via Melhor Envio", secrets: ["MELHOR_ENVIO_TOKEN", "MELHOR_ENVIO_SANDBOX"] },
      calculateYampiShipping: { descricao: "Calcula frete para pedidos Yampi", secrets: ["MELHOR_ENVIO_TOKEN"] }
    },
    utilitarios: {
      apiConsultaDados: { descricao: "API genérica de consulta", secrets: [] },
      getCafesPublicos: { descricao: "Retorna cafés públicos", secrets: [] }
    }
  },

  integracoes: {
    yampi: { descricao: "E-commerce", secrets: ["YAMPI_USER_TOKEN", "YAMPI_USER_SECRET_KEY", "YAMPI_MERCHANT_ALIAS"] },
    autentique: { descricao: "Assinatura digital de contratos", secrets: ["AUTENTIQUE_API_TOKEN"] },
    melhor_envio: { descricao: "Cálculo de frete e rastreamento", secrets: ["MELHOR_ENVIO_TOKEN", "MELHOR_ENVIO_SANDBOX"] },
    google_sso: { descricao: "Autenticação OAuth", secrets: ["sso_client_id", "sso_client_secret", "sso_discovery_url", "sso_scope", "sso_name"] }
  },

  agentes_ia: {
    notificacoes_whatsapp: { descricao: "Agente de notificações WhatsApp", ferramentas: ["CRUD em entidades do sistema"], acesso: "Via link WhatsApp com autenticação" }
  },

  seguranca: {
    roles_sistema: { admin: "Acesso total", user: "Acesso conforme cargo" },
    cargos_operacionais: {
      "Super Admin": "Controle total",
      "Administrativo": "CRUD completo na maioria das entidades",
      "Parceiro Logístico": "Acesso a logística e estoque (somente leitura em muitas áreas)",
      "Representante": "Acesso a clientes, chamados, tarefas e solicitações"
    },
    rls: "Row Level Security em todas as entidades baseada em role, cargo e propriedade do registro"
  },

  navegacao: {
    desktop: "Sidebar fixa com todas as seções",
    mobile: {
      bottom_tabs: ["Dashboard", "Logística", "Estoque", "Chamados"],
      header: "Botão voltar + Logo + Theme toggle + Logout",
      menu_mais: ["Tarefas", "A Receber", "Agenda", "Calculadoras", "Integrações", "Configurações"]
    }
  }
};

export default function JsonEstrutura() {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(estruturaCompleta, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Card className="border-[#E5DCC8] dark:border-gray-700">
      <CardHeader className="border-b border-[#E5DCC8] dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-[#6B4423] dark:text-[#C9A961] flex items-center gap-2">
            <Database className="w-5 h-5" />
            JSON Completo da Estrutura de Gestão
          </CardTitle>
          <Button
            onClick={handleCopy}
            className={copied ? "bg-green-600 hover:bg-green-700" : "bg-[#6B4423] hover:bg-[#5A3A1E]"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar JSON Completo
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="p-6 text-xs text-[#5A4A3A] dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[70vh]">
          {jsonString}
        </pre>
      </CardContent>
    </Card>
  );
}