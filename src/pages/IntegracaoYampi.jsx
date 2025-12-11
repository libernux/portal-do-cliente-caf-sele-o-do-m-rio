import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ProdutoYampi } from "@/entities/ProdutoYampi";
import { PedidoYampi } from "@/entities/PedidoYampi";
import { ClienteYampi } from "@/entities/ClienteYampi";
import { CategoriaYampi } from "@/entities/CategoriaYampi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  RefreshCw,
  Search,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Plus,
  FolderOpen,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditarProdutoModal from "../components/yampi/EditarProdutoModal";
import CriarProdutoModal from "../components/yampi/CriarProdutoModal";
import BuscarProdutoModal from "../components/yampi/BuscarProdutoModal";
import LogsSincronizacao from "../components/yampi/LogsSincronizacao";
import PedidoDetalhesModal from "../components/yampi/PedidoDetalhesModal";
import PreviewImportacaoModal from "../components/yampi/PreviewImportacaoModal";
import VariacoesModal from "../components/yampi/VariacoesModal";

export default function IntegracaoYampi() {
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState({ produtos: false, pedidos: false, clientes: false, categorias: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [syncResult, setSyncResult] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTipo, setPreviewTipo] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [currentPageProdutos, setCurrentPageProdutos] = useState(1);
  const [currentPagePedidos, setCurrentPagePedidos] = useState(1);
  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  const itemsPerPage = 20;
  const [showVariacoesModal, setShowVariacoesModal] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [produtosData, pedidosData, clientesData, categoriasData] = await Promise.all([
      ProdutoYampi.list("-ultima_sincronizacao"),
      PedidoYampi.list("-data_pedido"),
      ClienteYampi.list("-ultima_sincronizacao"),
      CategoriaYampi.list("ordem")
    ]);
    setProdutos(produtosData);
    setPedidos(pedidosData);
    setClientes(clientesData);
    setCategorias(categoriasData);
    setIsLoading(false);
  };

  const handlePreviewSync = async (type) => {
    setIsSyncing({ ...isSyncing, [type]: true });
    setSyncResult(null);

    try {
      const response = await base44.functions.invoke('previewYampiData', { tipo: type });

      if (response.data.success) {
        setPreviewData(response.data.items);
        setPreviewTipo(type);
        setShowPreviewModal(true);
      } else {
        setSyncResult({ type, error: response.data.error });
      }
    } catch (error) {
      setSyncResult({ type, error: error.message });
    } finally {
      setIsSyncing({ ...isSyncing, [type]: false });
    }
  };

  const addDebugLog = (mensagem, tipo = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setDebugLogs(prev => [...prev, { timestamp, mensagem, tipo }]);
  };

  const handleConfirmImport = async () => {
    if (!previewTipo) return;

    setIsImporting(true);
    setSyncResult(null);
    setDebugLogs([]);
    setImportProgress({ current: 0, total: previewData?.length || 0, status: 'Iniciando...' });

    addDebugLog(`🚀 Iniciando sincronização de ${previewTipo}`, 'info');
    addDebugLog(`📊 Total de itens na preview: ${previewData?.length || 0}`, 'info');

    try {
      let response;
      
      if (previewTipo === 'produtos') {
        addDebugLog('⚙️ Sincronizando produtos via API...', 'info');
        response = await base44.functions.invoke('syncYampiProductsBatch', { 
          batchSize: 10
        });
      } else if (previewTipo === 'pedidos') {
        addDebugLog('⚙️ Sincronizando pedidos via API...', 'info');
        addDebugLog('⏱️ Este processo pode demorar alguns minutos...', 'aviso');
        response = await base44.functions.invoke('syncYampiOrders', {});
      } else if (previewTipo === 'clientes') {
        addDebugLog('⚙️ Sincronizando clientes via API...', 'info');
        response = await base44.functions.invoke('syncYampiCustomers', {});
      } else if (previewTipo === 'categorias') {
        addDebugLog('⚙️ Sincronizando categorias via API...', 'info');
        response = await base44.functions.invoke('syncYampiCategories', {});
      }

      setImportProgress({ current: 100, total: 100, status: 'Finalizando...' });

      if (response.data.erros_detalhados && response.data.erros_detalhados.length > 0) {
        addDebugLog(`⚠️ ${response.data.erros_detalhados.length} erros encontrados`, 'aviso');
        response.data.erros_detalhados.slice(0, 5).forEach(erro => {
          const nome = erro.produto_nome || erro.pedido_numero || erro.cliente_nome || 'Item';
          addDebugLog(`❌ ${nome}: ${erro.erro}`, 'erro');
        });
      }

      if (response.data.success) {
        addDebugLog(`✅ Sincronização concluída!`, 'sucesso');
        addDebugLog(`📈 Novos: ${response.data.novos}, Atualizados: ${response.data.atualizados}`, 'sucesso');
        if (response.data.erros > 0) {
          addDebugLog(`⚠️ Erros: ${response.data.erros}`, 'aviso');
        }

        setSyncResult({ type: previewTipo, ...response.data });
        await loadData();
        setShowPreviewModal(false);
        setPreviewData(null);
        setPreviewTipo(null);
        setImportProgress({ current: 0, total: 0, status: '' });
        setDebugLogs([]);
      } else {
        addDebugLog(`❌ Erro: ${response.data.error}`, 'erro');
        setSyncResult({ type: previewTipo, error: response.data.error || 'Erro desconhecido' });
      }
    } catch (error) {
      addDebugLog(`💥 Erro crítico: ${error.message}`, 'erro');
      console.error('Erro detalhado:', error);
      setSyncResult({ type: previewTipo, error: error.message || 'Erro ao processar sincronização' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteLocal = async (type) => {
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleExportToJson = async () => {
    setIsExporting(true);
    setDebugLogs([]);
    addDebugLog('🚀 Iniciando coleta de pedidos da Yampi...', 'info');
    
    try {
      const response = await base44.functions.invoke('exportYampiOrdersToJson', {});
      
      addDebugLog('✅ Coleta concluída!', 'sucesso');
      
      // O response.data já é o JSON string do arquivo
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yampi_pedidos_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      // Extrair metadata para mostrar ao usuário
      try {
        const jsonData = JSON.parse(response.data);
        if (jsonData.metadata) {
          addDebugLog(`📊 ${jsonData.metadata.total_pedidos} pedidos coletados`, 'sucesso');
          addDebugLog(`⏱️ Tempo de coleta: ${jsonData.metadata.tempo_coleta_segundos}s`, 'info');
        }
      } catch (e) {
        // Ignorar erro de parse
      }

      setSyncResult({ 
        type: 'pedidos', 
        mensagem: 'Arquivo JSON baixado com sucesso! Agora você pode importá-lo.' 
      });
    } catch (error) {
      addDebugLog(`❌ Erro: ${error.message}`, 'erro');
      setSyncResult({ type: 'pedidos', error: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFromJson = async (file) => {
    setIsImportingJson(true);
    setDebugLogs([]);
    addDebugLog('🚀 Iniciando importação do arquivo JSON...', 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);

      addDebugLog(`📄 Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'info');

      const response = await base44.functions.invoke('importYampiOrdersFromJson', formData);

      if (response.data.success) {
        addDebugLog(`✅ Importação concluída!`, 'sucesso');
        addDebugLog(`📊 Total: ${response.data.total}`, 'info');
        addDebugLog(`🆕 Novos: ${response.data.novos}`, 'sucesso');
        addDebugLog(`🔄 Atualizados: ${response.data.atualizados}`, 'info');
        if (response.data.erros > 0) {
          addDebugLog(`⚠️ Erros: ${response.data.erros}`, 'aviso');
        }

        setSyncResult({ type: 'pedidos', ...response.data });
        await loadData();
        setShowImportModal(false);
      } else {
        addDebugLog(`❌ Erro: ${response.data.error}`, 'erro');
        setSyncResult({ type: 'pedidos', error: response.data.error });
      }
    } catch (error) {
      addDebugLog(`💥 Erro crítico: ${error.message}`, 'erro');
      setSyncResult({ type: 'pedidos', error: error.message });
    } finally {
      setIsImportingJson(false);
    }
  };

  const confirmDeleteLocal = async () => {
    try {
      let entityName;
      switch(deleteType) {
        case 'produtos': entityName = 'ProdutoYampi'; break;
        case 'pedidos': entityName = 'PedidoYampi'; break;
        case 'clientes': entityName = 'ClienteYampi'; break;
        case 'categorias': entityName = 'CategoriaYampi'; break;
      }

      const allRecords = await base44.entities[entityName].list();
      for (const record of allRecords) {
        await base44.entities[entityName].delete(record.id);
      }

      setSyncResult({ 
        type: deleteType, 
        mensagem: `${allRecords.length} registro(s) excluído(s) localmente` 
      });
      await loadData();
    } catch (error) {
      setSyncResult({ type: deleteType, error: error.message });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteType(null);
    }
  };

  const handleSyncToYampi = async (produto) => {
    try {
      const response = await base44.functions.invoke('updateYampiProduct', {
        yampi_id: produto.yampi_id,
        productData: {
          name: produto.nome,
          description: produto.descricao,
          sku: produto.sku,
          active: produto.ativo,
          price: produto.preco,
          promotional_price: produto.preco_promocional,
          quantity: produto.estoque,
          weight: produto.peso,
          height: produto.altura,
          width: produto.largura,
          length: produto.comprimento
        }
      });

      if (response.data.success) {
        setSyncResult({ 
          type: 'produtos', 
          mensagem: 'Produto atualizado na Yampi com sucesso!' 
        });
        await loadData();
      } else {
        setSyncResult({ type: 'produtos', error: response.data.error });
      }
    } catch (error) {
      setSyncResult({ type: 'produtos', error: error.message });
    }
  };

  const handleEditProduct = (produto) => {
    setEditingProduct(produto);
    setShowEditModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      const response = await base44.functions.invoke('updateYampiProduct', {
        yampi_id: editingProduct.yampi_id,
        productData
      });

      if (response.data.success) {
        setSyncResult({ type: 'produtos', mensagem: 'Produto atualizado com sucesso!' });
        await loadData();
      } else {
        setSyncResult({ type: 'produtos', error: response.data.error });
      }
    } catch (error) {
      setSyncResult({ type: 'produtos', error: error.message });
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const response = await base44.functions.invoke('createYampiProduct', {
        productData
      });

      if (response.data.success) {
        setSyncResult({ type: 'produtos', mensagem: 'Produto criado com sucesso!' });
        await loadData();
      } else {
        setSyncResult({ type: 'produtos', error: response.data.error });
      }
    } catch (error) {
      setSyncResult({ type: 'produtos', error: error.message });
    }
  };

  const handleViewPedido = (pedido) => {
    setSelectedPedidoId(pedido.yampi_id);
    setShowPedidoModal(true);
  };

  const handlePedidoUpdated = async () => {
    await loadData();
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPagesProdutos = Math.ceil(produtosFiltrados.length / itemsPerPage);
  const produtosPaginados = produtosFiltrados.slice(
    (currentPageProdutos - 1) * itemsPerPage,
    currentPageProdutos * itemsPerPage
  );

  const pedidosFiltrados = pedidos.filter(p => {
    const matchesSearch = 
      p.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || p.status?.toLowerCase().includes(statusFilter.toLowerCase());
    
    let matchesDate = true;
    if (dataInicio || dataFim) {
      const pedidoDate = new Date(p.data_pedido);
      if (dataInicio) {
        matchesDate = matchesDate && pedidoDate >= new Date(dataInicio);
      }
      if (dataFim) {
        const fimDate = new Date(dataFim);
        fimDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && pedidoDate <= fimDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPagesPedidos = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const pedidosPaginados = pedidosFiltrados.slice(
    (currentPagePedidos - 1) * itemsPerPage,
    currentPagePedidos * itemsPerPage
  );

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPagesClientes = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const clientesPaginados = clientesFiltrados.slice(
    (currentPageClientes - 1) * itemsPerPage,
    currentPageClientes * itemsPerPage
  );

  const stats = {
    produtos: produtos.length,
    produtosAtivos: produtos.filter(p => p.ativo).length,
    pedidos: pedidos.length,
    pedidosPendentes: pedidos.filter(p => p.status_pagamento !== 'Pago').length,
    clientes: clientes.length,
    valorTotal: pedidos.reduce((sum, p) => sum + (p.valor_total || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#6B4423] mb-2">
            Integração Yampi
          </h1>
          <p className="text-[#8B7355]">
            Sincronize e gerencie dados da sua loja Yampi
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6B4423]/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-[#6B4423]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#6B4423]">{stats.produtos}</p>
                  <p className="text-xs text-[#8B7355]">Produtos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.pedidos}</p>
                  <p className="text-xs text-[#8B7355]">Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.clientes}</p>
                  <p className="text-xs text-[#8B7355]">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5DCC8] bg-[#2D5016]/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-[#2D5016]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#2D5016]">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[#8B7355]">Total em Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <Card className={syncResult.error ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {syncResult.error ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${syncResult.error ? 'text-red-800' : 'text-green-800'}`}>
                    {syncResult.error ? 'Erro na sincronização' : syncResult.mensagem}
                  </p>
                  {syncResult.error && (
                    <p className="text-sm text-red-600 mt-1">{syncResult.error}</p>
                  )}
                  {syncResult.erros > 0 && syncResult.erros_detalhados && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                      <p className="font-semibold text-red-800 mb-2">
                        ⚠️ {syncResult.erros} erro(s) encontrado(s):
                      </p>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {syncResult.erros_detalhados.map((erro, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-red-300">
                            <p className="font-semibold text-xs text-red-800">
                              Produto: {erro.produto_nome} (ID: {erro.produto_id})
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              SKU: {erro.produto_sku}
                            </p>
                            <p className="text-xs text-red-700 mt-1 font-mono">
                              {erro.erro}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="produtos" className="space-y-6">
          <TabsList className="bg-white border border-[#E5DCC8]">
            <TabsTrigger value="produtos" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Produtos ({stats.produtos})
            </TabsTrigger>
            <TabsTrigger value="categorias" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              Categorias ({categorias.length})
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos ({stats.pedidos})
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Clientes ({stats.clientes})
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Tab Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8]"
                    />
                  </div>
                  <Button
                    onClick={() => setShowBuscarModal(true)}
                    variant="outline"
                    className="border-[#6B4423] text-[#6B4423]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar por ID
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="outline"
                    className="border-[#6B4423] text-[#6B4423]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Produto
                  </Button>
                  <Button
                    onClick={() => handleDeleteLocal('produtos')}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Limpar Local
                  </Button>
                  <Button
                    onClick={() => handlePreviewSync('produtos')}
                    disabled={isSyncing.produtos}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    {isSyncing.produtos ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sincronizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#6B4423] animate-spin mx-auto mb-4" />
                <p className="text-[#8B7355]">Carregando...</p>
              </div>
            ) : produtosFiltrados.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {produtosPaginados.map((produto) => (
                  <Card key={produto.id} className="border-[#E5DCC8]">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {produto.imagem_url && (
                          <img
                            src={produto.imagem_url}
                            alt={produto.nome}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-[#6B4423] text-lg">{produto.nome}</h3>
                              <p className="text-sm text-[#8B7355]">SKU: {produto.sku}</p>
                              {produto.variacoes && produto.variacoes.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduto(produto);
                                    setShowVariacoesModal(true);
                                  }}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  {produto.variacoes.length} variação(ões)
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSyncToYampi(produto);
                                }}
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                title="Enviar alterações para Yampi"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProduct(produto)}
                                className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {produto.ativo ? (
                                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                              ) : (
                                <Badge variant="outline">Inativo</Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-[#8B7355]">Preço</p>
                              <p className="font-semibold text-[#2D5016]">
                                R$ {produto.preco?.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Estoque</p>
                              <p className="font-semibold">{produto.estoque} un</p>
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Categoria</p>
                              <p className="font-semibold">{produto.categoria || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Última Sincronização</p>
                              <p className="font-semibold text-xs">
                                {format(new Date(produto.ultima_sincronizacao), "dd/MM/yy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>

                {/* Paginação Produtos */}
                {totalPagesProdutos > 1 && (
                  <Card className="border-[#E5DCC8]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#8B7355]">
                          Mostrando {((currentPageProdutos - 1) * itemsPerPage) + 1}-{Math.min(currentPageProdutos * itemsPerPage, produtosFiltrados.length)} de {produtosFiltrados.length}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageProdutos(p => Math.max(1, p - 1))}
                            disabled={currentPageProdutos === 1}
                          >
                            Anterior
                          </Button>
                          <span className="flex items-center px-3 text-sm">
                            Página {currentPageProdutos} de {totalPagesProdutos}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageProdutos(p => Math.min(totalPagesProdutos, p + 1))}
                            disabled={currentPageProdutos === totalPagesProdutos}
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhum produto encontrado</p>
                  <Button
                    onClick={() => handlePreviewSync('produtos')}
                    className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    Sincronizar Produtos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Categorias */}
          <TabsContent value="categorias" className="space-y-4">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => handlePreviewSync('categorias')}
                    disabled={isSyncing.categorias}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    {isSyncing.categorias ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sincronizar Categorias
                  </Button>
                </div>
              </CardContent>
            </Card>

            {categorias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((categoria) => (
                  <Card key={categoria.id} className="border-[#E5DCC8]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#6B4423]">{categoria.nome}</h3>
                        <Badge variant={categoria.ativo ? "default" : "outline"}>
                          {categoria.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      {categoria.descricao && (
                        <p className="text-sm text-[#8B7355] mb-2">{categoria.descricao}</p>
                      )}
                      <div className="text-xs text-[#A69483]">
                        <p>Slug: {categoria.slug}</p>
                        <p>Ordem: {categoria.ordem}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhuma categoria encontrada</p>
                  <Button
                    onClick={() => handlePreviewSync('categorias')}
                    className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    Sincronizar Categorias
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Pedidos */}
          <TabsContent value="pedidos" className="space-y-4">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                      <Input
                        placeholder="Buscar por número, cliente ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#E5DCC8]"
                      />
                    </div>
                    <Button
                      onClick={handleExportToJson}
                      disabled={isExporting}
                      variant="outline"
                      className="border-[#6B4423] text-[#6B4423]"
                      title="Coletar todos os pedidos da API Yampi e salvar em arquivo JSON"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Coletando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          1. Coletar JSON
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowImportModal(true)}
                      variant="outline"
                      className="border-green-600 text-green-600"
                      title="Importar pedidos do arquivo JSON coletado"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      2. Importar JSON
                    </Button>
                    <Button
                      onClick={() => handlePreviewSync('pedidos')}
                      disabled={isSyncing.pedidos}
                      className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                    >
                      {isSyncing.pedidos ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Sincronizar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-[#8B7355] mb-1">Status</Label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border border-[#E5DCC8] rounded-md text-sm"
                      >
                        <option value="all">Todos os Status</option>
                        <option value="aguardando">Aguardando</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="separação">Em Separação</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-[#8B7355] mb-1">Data Início</Label>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="border-[#E5DCC8]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-[#8B7355] mb-1">Data Fim</Label>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="border-[#E5DCC8]"
                      />
                    </div>
                  </div>

                  {(statusFilter !== "all" || dataInicio || dataFim) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatusFilter("all");
                        setDataInicio("");
                        setDataFim("");
                      }}
                      className="border-[#6B4423] text-[#6B4423]"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#6B4423] animate-spin mx-auto mb-4" />
                <p className="text-[#8B7355]">Carregando...</p>
              </div>
            ) : pedidosFiltrados.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {pedidosPaginados.map((pedido) => (
                  <Card 
                    key={pedido.id} 
                    className="border-[#E5DCC8] cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewPedido(pedido)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-[#6B4423] text-lg">
                            Pedido #{pedido.numero_pedido}
                          </h3>
                          <p className="text-sm text-[#8B7355]">{pedido.cliente_nome}</p>
                          <p className="text-xs text-[#A69483]">{pedido.cliente_email}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={pedido.status_pagamento === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {pedido.status_pagamento}
                          </Badge>
                          <p className="text-2xl font-bold text-[#2D5016] mt-2">
                            R$ {pedido.valor_total?.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3 text-sm border-t border-[#E5DCC8] pt-4">
                        <div>
                          <p className="text-[#8B7355]">Status</p>
                          <p className="font-semibold">{pedido.status}</p>
                        </div>
                        <div>
                          <p className="text-[#8B7355]">Data</p>
                          <p className="font-semibold">
                            {format(new Date(pedido.data_pedido), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#8B7355]">Itens</p>
                          <p className="font-semibold">{pedido.itens?.length || 0} produto(s)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>

                {/* Paginação Pedidos */}
                {totalPagesPedidos > 1 && (
                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#8B7355]">
                        Mostrando {((currentPagePedidos - 1) * itemsPerPage) + 1}-{Math.min(currentPagePedidos * itemsPerPage, pedidosFiltrados.length)} de {pedidosFiltrados.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePedidos(p => Math.max(1, p - 1))}
                          disabled={currentPagePedidos === 1}
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                          Página {currentPagePedidos} de {totalPagesPedidos}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePedidos(p => Math.min(totalPagesPedidos, p + 1))}
                          disabled={currentPagePedidos === totalPagesPedidos}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
                </>
                ) : (
                <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355]">Nenhum pedido encontrado</p>
                <Button
                  onClick={() => handlePreviewSync('pedidos')}
                  className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  Sincronizar Pedidos
                </Button>
                </CardContent>
                </Card>
                )}
          </TabsContent>

          {/* Tab Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8]"
                    />
                  </div>
                  <Button
                    onClick={() => handlePreviewSync('clientes')}
                    disabled={isSyncing.clientes}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    {isSyncing.clientes ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sincronizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#6B4423] animate-spin mx-auto mb-4" />
                <p className="text-[#8B7355]">Carregando...</p>
              </div>
            ) : clientesFiltrados.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {clientesPaginados.map((cliente) => (
                  <Card key={cliente.id} className="border-[#E5DCC8]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-[#6B4423] text-lg">{cliente.nome}</h3>
                          <p className="text-sm text-[#8B7355]">{cliente.email}</p>
                          <p className="text-xs text-[#A69483]">{cliente.telefone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#2D5016]">
                            R$ {cliente.valor_total_gasto?.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-[#8B7355]">total gasto</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3 text-sm border-t border-[#E5DCC8] pt-4">
                        <div>
                          <p className="text-[#8B7355]">Total de Pedidos</p>
                          <p className="font-semibold">{cliente.total_pedidos || 0}</p>
                        </div>
                        <div>
                          <p className="text-[#8B7355]">Última Compra</p>
                          <p className="font-semibold">
                            {cliente.ultima_compra 
                              ? format(new Date(cliente.ultima_compra), "dd/MM/yyyy", { locale: ptBR })
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-[#8B7355]">Endereços</p>
                          <p className="font-semibold">{cliente.enderecos?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>

                {/* Paginação Clientes */}
                {totalPagesClientes > 1 && (
                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#8B7355]">
                        Mostrando {((currentPageClientes - 1) * itemsPerPage) + 1}-{Math.min(currentPageClientes * itemsPerPage, clientesFiltrados.length)} de {clientesFiltrados.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageClientes(p => Math.max(1, p - 1))}
                          disabled={currentPageClientes === 1}
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                          Página {currentPageClientes} de {totalPagesClientes}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageClientes(p => Math.min(totalPagesClientes, p + 1))}
                          disabled={currentPageClientes === totalPagesClientes}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
                </>
                ) : (
                <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                <p className="text-[#8B7355]">Nenhum cliente encontrado</p>
                <Button
                  onClick={() => handlePreviewSync('clientes')}
                  className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  Sincronizar Clientes
                </Button>
                </CardContent>
                </Card>
                )}
          </TabsContent>

          {/* Tab Logs */}
          <TabsContent value="logs" className="space-y-4">
            <LogsSincronizacao />
          </TabsContent>
        </Tabs>

        <EditarProdutoModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          produto={editingProduct}
          onSave={handleSaveProduct}
        />

        <CriarProdutoModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateProduct}
          categorias={categorias}
        />

        <BuscarProdutoModal
          open={showBuscarModal}
          onClose={() => setShowBuscarModal(false)}
        />

        <PedidoDetalhesModal
          open={showPedidoModal}
          onClose={() => {
            setShowPedidoModal(false);
            setSelectedPedidoId(null);
          }}
          pedidoId={selectedPedidoId}
          onUpdate={handlePedidoUpdated}
        />

        <PreviewImportacaoModal
          open={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewData(null);
            setPreviewTipo(null);
            setDebugLogs([]);
          }}
          tipo={previewTipo}
          dados={previewData}
          onConfirm={handleConfirmImport}
          isLoading={isImporting}
          progresso={importProgress}
          logsDebug={debugLogs}
        />

        <VariacoesModal
          open={showVariacoesModal}
          onClose={() => {
            setShowVariacoesModal(false);
            setSelectedProduto(null);
          }}
          produto={selectedProduto}
        />

        {/* Modal de confirmação de exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Confirmar Exclusão Local</h3>
                    <p className="text-sm text-[#8B7355]">
                      Tem certeza que deseja excluir todos os dados locais de <strong>{deleteType}</strong>?
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ Esta ação não afeta os dados na Yampi, apenas remove os registros locais do Base44.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteType(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDeleteLocal}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Importação JSON */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-4">Importar Pedidos via JSON</h3>

                {isImportingJson ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 text-[#6B4423] animate-spin" />
                      <span>Processando arquivo...</span>
                    </div>

                    {debugLogs.length > 0 && (
                      <ScrollArea className="h-48 border border-gray-300 rounded p-2 bg-white">
                        <div className="space-y-1 font-mono text-xs">
                          {debugLogs.map((log, idx) => (
                            <div
                              key={idx}
                              className={`p-1 rounded ${
                                log.tipo === 'erro' ? 'bg-red-50 text-red-800' :
                                log.tipo === 'sucesso' ? 'bg-green-50 text-green-800' :
                                log.tipo === 'aviso' ? 'bg-yellow-50 text-yellow-800' :
                                'text-gray-700'
                              }`}
                            >
                              <span className="text-gray-500">[{log.timestamp}]</span> {log.mensagem}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[#E5DCC8] rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImportFromJson(file);
                          }
                        }}
                        className="hidden"
                        id="json-upload"
                      />
                      <label htmlFor="json-upload" className="cursor-pointer">
                        <FileText className="w-12 h-12 text-[#6B4423] mx-auto mb-4" />
                        <p className="text-lg font-semibold text-[#6B4423] mb-2">
                          Clique para selecionar o arquivo JSON
                        </p>
                        <p className="text-sm text-[#8B7355]">
                          Arquivo exportado da Yampi com os pedidos
                        </p>
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Dica:</strong> Use o botão "Exportar JSON" para gerar o arquivo primeiro, 
                        depois importe-o aqui para processar grandes volumes de pedidos de forma mais eficiente.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportModal(false);
                      setDebugLogs([]);
                    }}
                    disabled={isImportingJson}
                  >
                    {isImportingJson ? 'Processando...' : 'Cancelar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progresso da importação */}
        {isImporting && importProgress.total > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="w-80 border-[#E5DCC8] shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-[#6B4423] animate-spin" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Importando...</p>
                    <p className="text-xs text-[#8B7355]">{importProgress.status}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#6B4423] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2 text-[#8B7355]">
                  {importProgress.current} / {importProgress.total}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}