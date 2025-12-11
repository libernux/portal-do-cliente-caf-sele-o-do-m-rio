import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ProdutoYampi } from "@/entities/ProdutoYampi";
import { PedidoYampi } from "@/entities/PedidoYampi";
import { ClienteYampi } from "@/entities/ClienteYampi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditarProdutoModal from "../components/yampi/EditarProdutoModal";

export default function IntegracaoYampi() {
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState({ produtos: false, pedidos: false, clientes: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [syncResult, setSyncResult] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [produtosData, pedidosData, clientesData] = await Promise.all([
      ProdutoYampi.list("-ultima_sincronizacao"),
      PedidoYampi.list("-data_pedido"),
      ClienteYampi.list("-ultima_sincronizacao")
    ]);
    setProdutos(produtosData);
    setPedidos(pedidosData);
    setClientes(clientesData);
    setIsLoading(false);
  };

  const handleSync = async (type) => {
    setIsSyncing({ ...isSyncing, [type]: true });
    setSyncResult(null);

    try {
      let response;
      if (type === 'produtos') {
        response = await base44.functions.invoke('syncYampiProducts', {});
      } else if (type === 'pedidos') {
        response = await base44.functions.invoke('syncYampiOrders', {});
      } else if (type === 'clientes') {
        response = await base44.functions.invoke('syncYampiCustomers', {});
      }

      if (response.data.success) {
        setSyncResult({ type, ...response.data });
        await loadData();
      } else {
        setSyncResult({ type, error: response.data.error });
      }
    } catch (error) {
      setSyncResult({ type, error: error.message });
    } finally {
      setIsSyncing({ ...isSyncing, [type]: false });
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

  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pedidosFiltrados = pedidos.filter(p =>
    p.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div>
                  <p className={`font-semibold ${syncResult.error ? 'text-red-800' : 'text-green-800'}`}>
                    {syncResult.error ? 'Erro na sincronização' : syncResult.mensagem}
                  </p>
                  {syncResult.error && (
                    <p className="text-sm text-red-600">{syncResult.error}</p>
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
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos ({stats.pedidos})
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-[#6B4423] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Clientes ({stats.clientes})
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
                    onClick={() => handleSync('produtos')}
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
              <div className="grid gap-4">
                {produtosFiltrados.map((produto) => (
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
                            </div>
                            <div className="flex gap-2">
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
            ) : (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhum produto encontrado</p>
                  <Button
                    onClick={() => handleSync('produtos')}
                    className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    Sincronizar Produtos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Pedidos */}
          <TabsContent value="pedidos" className="space-y-4">
            <Card className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5" />
                    <Input
                      placeholder="Buscar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#E5DCC8]"
                    />
                  </div>
                  <Button
                    onClick={() => handleSync('pedidos')}
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
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-[#6B4423] animate-spin mx-auto mb-4" />
                <p className="text-[#8B7355]">Carregando...</p>
              </div>
            ) : pedidosFiltrados.length > 0 ? (
              <div className="grid gap-4">
                {pedidosFiltrados.map((pedido) => (
                  <Card key={pedido.id} className="border-[#E5DCC8]">
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
            ) : (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhum pedido encontrado</p>
                  <Button
                    onClick={() => handleSync('pedidos')}
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
                    onClick={() => handleSync('clientes')}
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
              <div className="grid gap-4">
                {clientesFiltrados.map((cliente) => (
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
            ) : (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhum cliente encontrado</p>
                  <Button
                    onClick={() => handleSync('clientes')}
                    className="mt-4 bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    Sincronizar Clientes
                  </Button>
                </CardContent>
              </Card>
            )}
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
      </div>
    </div>
  );
}