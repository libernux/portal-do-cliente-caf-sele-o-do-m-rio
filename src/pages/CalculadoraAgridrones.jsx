import React, { useState, useEffect } from "react";
import { ProdutoAgridrones } from "@/entities/ProdutoAgridrones";
import { CotacaoAgridrones } from "@/entities/CotacaoAgridrones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Save,
  DollarSign,
  Package,
  TrendingUp,
  FileText,
  Settings
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function CalculadoraAgridrones() {
  const [produtos, setProdutos] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [showCotacaoForm, setShowCotacaoForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);

  // Estado para gerenciar produtos
  const [produtoForm, setProdutoForm] = useState({
    nome: "",
    descricao: "",
    tipo: "Moedor",
    valor_compra: 0,
    valor_venda_sugerido: 0,
    margem_padrao: 30,
    ativo: true,
    observacoes: ""
  });

  // Estado para cotação
  const [cotacaoAtual, setCotacaoAtual] = useState({
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    observacoes: "",
    validade: "",
    produtosSelecionados: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [produtosData, cotacoesData] = await Promise.all([
      ProdutoAgridrones.list("-created_date"),
      CotacaoAgridrones.list("-created_date")
    ]);
    setProdutos(produtosData);
    setCotacoes(cotacoesData);
    setIsLoading(false);
  };

  const handleSaveProduto = async () => {
    if (editingProduto) {
      await ProdutoAgridrones.update(editingProduto.id, produtoForm);
    } else {
      await ProdutoAgridrones.create(produtoForm);
    }
    setShowProdutoForm(false);
    setEditingProduto(null);
    setProdutoForm({
      nome: "",
      descricao: "",
      tipo: "Moedor",
      valor_compra: 0,
      valor_venda_sugerido: 0,
      margem_padrao: 30,
      ativo: true,
      observacoes: ""
    });
    loadData();
  };

  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setProdutoForm(produto);
    setShowProdutoForm(true);
  };

  const handleDeleteProduto = async (produtoId) => {
    if (confirm("Deseja excluir este produto?")) {
      await ProdutoAgridrones.delete(produtoId);
      loadData();
    }
  };

  const adicionarProdutoNaCotacao = (produto) => {
    const jaExiste = cotacaoAtual.produtosSelecionados.find(p => p.produto_id === produto.id);
    if (jaExiste) {
      alert("Este produto já foi adicionado à cotação");
      return;
    }

    const novoProduto = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      quantidade: 1,
      valor_compra: produto.valor_compra,
      margem_aplicada: produto.margem_padrao || 30,
      valor_venda: produto.valor_compra * (1 + (produto.margem_padrao || 30) / 100)
    };

    setCotacaoAtual({
      ...cotacaoAtual,
      produtosSelecionados: [...cotacaoAtual.produtosSelecionados, novoProduto]
    });
  };

  const atualizarProdutoCotacao = (index, field, value) => {
    const novosProdutos = [...cotacaoAtual.produtosSelecionados];
    novosProdutos[index][field] = parseFloat(value) || 0;

    if (field === "margem_aplicada" || field === "valor_compra") {
      novosProdutos[index].valor_venda = 
        novosProdutos[index].valor_compra * (1 + novosProdutos[index].margem_aplicada / 100);
    }

    setCotacaoAtual({
      ...cotacaoAtual,
      produtosSelecionados: novosProdutos
    });
  };

  const removerProdutoCotacao = (index) => {
    const novosProdutos = cotacaoAtual.produtosSelecionados.filter((_, i) => i !== index);
    setCotacaoAtual({
      ...cotacaoAtual,
      produtosSelecionados: novosProdutos
    });
  };

  const calcularTotaisCotacao = () => {
    const custo_total = cotacaoAtual.produtosSelecionados.reduce((sum, p) => 
      sum + (p.valor_compra * p.quantidade), 0
    );

    const valor_total = cotacaoAtual.produtosSelecionados.reduce((sum, p) => 
      sum + (p.valor_venda * p.quantidade), 0
    );

    const lucro_total = valor_total - custo_total;
    const margem_geral = custo_total > 0 ? ((lucro_total / custo_total) * 100) : 0;

    return {
      custo_total: custo_total.toFixed(2),
      valor_total: valor_total.toFixed(2),
      lucro_total: lucro_total.toFixed(2),
      margem_geral: margem_geral.toFixed(2)
    };
  };

  const handleSalvarCotacao = async () => {
    const totais = calcularTotaisCotacao();
    
    const cotacaoParaSalvar = {
      ...cotacaoAtual,
      produtos: cotacaoAtual.produtosSelecionados,
      valor_total: parseFloat(totais.valor_total),
      custo_total: parseFloat(totais.custo_total),
      lucro_total: parseFloat(totais.lucro_total),
      margem_geral: parseFloat(totais.margem_geral),
      status: "Rascunho"
    };

    await CotacaoAgridrones.create(cotacaoParaSalvar);
    
    // Limpar formulário
    setCotacaoAtual({
      cliente_nome: "",
      cliente_email: "",
      cliente_telefone: "",
      observacoes: "",
      validade: "",
      produtosSelecionados: []
    });
    
    setShowCotacaoForm(false);
    loadData();
    alert("✅ Cotação salva com sucesso!");
  };

  const exportarCotacaoTexto = () => {
    const totais = calcularTotaisCotacao();
    
    let texto = `COTAÇÃO - AGRIDRONES\n\n`;
    texto += `Cliente: ${cotacaoAtual.cliente_nome}\n`;
    if (cotacaoAtual.cliente_email) texto += `Email: ${cotacaoAtual.cliente_email}\n`;
    if (cotacaoAtual.cliente_telefone) texto += `Telefone: ${cotacaoAtual.cliente_telefone}\n`;
    if (cotacaoAtual.validade) texto += `Validade: ${new Date(cotacaoAtual.validade).toLocaleDateString('pt-BR')}\n`;
    texto += `\n${"=".repeat(60)}\n\n`;
    
    texto += `PRODUTOS:\n\n`;
    cotacaoAtual.produtosSelecionados.forEach((p, i) => {
      texto += `${i + 1}. ${p.produto_nome}\n`;
      texto += `   Quantidade: ${p.quantidade}\n`;
      texto += `   Valor Unitário: R$ ${p.valor_venda.toFixed(2)}\n`;
      texto += `   Subtotal: R$ ${(p.valor_venda * p.quantidade).toFixed(2)}\n`;
      texto += `   Margem: ${p.margem_aplicada}%\n\n`;
    });
    
    texto += `${"=".repeat(60)}\n\n`;
    texto += `RESUMO:\n`;
    texto += `Custo Total: R$ ${totais.custo_total}\n`;
    texto += `Valor Total: R$ ${totais.valor_total}\n`;
    texto += `Lucro Estimado: R$ ${totais.lucro_total}\n`;
    texto += `Margem Geral: ${totais.margem_geral}%\n`;
    
    if (cotacaoAtual.observacoes) {
      texto += `\nObservações:\n${cotacaoAtual.observacoes}\n`;
    }

    // Copiar para clipboard
    navigator.clipboard.writeText(texto).then(() => {
      alert("✅ Cotação copiada para a área de transferência!");
    });
  };

  const totais = calcularTotaisCotacao();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <Calculator className="w-8 h-8" />
            Calculadora Agridrones
          </h1>
          <p className="text-[#8B7355]">
            Gestão de produtos e cotações da parceria Agridrones
          </p>
        </div>

        <Tabs defaultValue="cotacao" className="space-y-6">
          <TabsList className="bg-[#F5F1E8]">
            <TabsTrigger value="cotacao" className="gap-2">
              <Calculator className="w-4 h-4" />
              Nova Cotação
            </TabsTrigger>
            <TabsTrigger value="produtos" className="gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <FileText className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Tab Nova Cotação */}
          <TabsContent value="cotacao" className="space-y-6">
            {/* Dados do Cliente */}
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-[#6B4423]">Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                    <Input
                      id="cliente_nome"
                      value={cotacaoAtual.cliente_nome}
                      onChange={(e) => setCotacaoAtual({...cotacaoAtual, cliente_nome: e.target.value})}
                      className="border-[#E5DCC8]"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cliente_email">Email</Label>
                    <Input
                      id="cliente_email"
                      type="email"
                      value={cotacaoAtual.cliente_email}
                      onChange={(e) => setCotacaoAtual({...cotacaoAtual, cliente_email: e.target.value})}
                      className="border-[#E5DCC8]"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cliente_telefone">Telefone</Label>
                    <Input
                      id="cliente_telefone"
                      value={cotacaoAtual.cliente_telefone}
                      onChange={(e) => setCotacaoAtual({...cotacaoAtual, cliente_telefone: e.target.value})}
                      className="border-[#E5DCC8]"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validade">Validade da Cotação</Label>
                    <Input
                      id="validade"
                      type="date"
                      value={cotacaoAtual.validade}
                      onChange={(e) => setCotacaoAtual({...cotacaoAtual, validade: e.target.value})}
                      className="border-[#E5DCC8]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={cotacaoAtual.observacoes}
                      onChange={(e) => setCotacaoAtual({...cotacaoAtual, observacoes: e.target.value})}
                      className="border-[#E5DCC8]"
                      rows={1}
                      placeholder="Observações sobre a cotação..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos Disponíveis */}
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-[#6B4423]">Adicionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {produtos.filter(p => p.ativo).map((produto) => (
                    <motion.div
                      key={produto.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-[#F5F1E8] to-white p-4 rounded-lg border-2 border-[#E5DCC8] hover:border-[#6B4423] transition-all cursor-pointer"
                      onClick={() => adicionarProdutoNaCotacao(produto)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-[#6B4423]">{produto.nome}</h4>
                        <Badge className="bg-[#2D5016] text-white">
                          {produto.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#8B7355] mb-3">{produto.descricao}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Custo:</span>
                          <span className="font-semibold text-[#6B4423]">
                            R$ {produto.valor_compra?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Margem:</span>
                          <span className="font-semibold text-[#2D5016]">
                            {produto.margem_padrao || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8B7355]">Sugerido:</span>
                          <span className="font-bold text-[#6B4423]">
                            R$ {produto.valor_venda_sugerido?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-[#6B4423] hover:bg-[#5A3A1E]"
                        onClick={(e) => {
                          e.stopPropagation();
                          adicionarProdutoNaCotacao(produto);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {produtos.filter(p => p.ativo).length === 0 && (
                  <div className="text-center py-8 text-[#8B7355]">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum produto cadastrado ainda</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-[#6B4423] text-[#6B4423]"
                      onClick={() => {
                        setProdutoForm({
                          nome: "",
                          descricao: "",
                          tipo: "Moedor",
                          valor_compra: 0,
                          valor_venda_sugerido: 0,
                          margem_padrao: 30,
                          ativo: true,
                          observacoes: ""
                        });
                        setEditingProduto(null);
                        setShowProdutoForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Produto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Produtos na Cotação */}
            {cotacaoAtual.produtosSelecionados.length > 0 && (
              <>
                <Card className="border-[#E5DCC8] shadow-xl">
                  <CardHeader className="border-b border-[#E5DCC8]">
                    <CardTitle className="text-[#6B4423]">Produtos da Cotação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {cotacaoAtual.produtosSelecionados.map((produto, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white p-4 rounded-lg border border-[#E5DCC8]"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-[#6B4423] text-lg">
                                {produto.produto_nome}
                              </h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerProdutoCotacao(index)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Quantidade</Label>
                              <Input
                                type="number"
                                min="1"
                                value={produto.quantidade}
                                onChange={(e) => atualizarProdutoCotacao(index, "quantidade", e.target.value)}
                                className="border-[#E5DCC8]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Custo Unit.</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]">
                                  R$
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={produto.valor_compra}
                                  onChange={(e) => atualizarProdutoCotacao(index, "valor_compra", e.target.value)}
                                  className="border-[#E5DCC8] pl-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Margem (%)</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={produto.margem_aplicada}
                                  onChange={(e) => atualizarProdutoCotacao(index, "margem_aplicada", e.target.value)}
                                  className="border-[#E5DCC8] pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355]">
                                  %
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Venda Unit.</Label>
                              <div className="flex items-center h-10 px-3 bg-[#F5F1E8] rounded-lg border border-[#E5DCC8]">
                                <span className="font-bold text-[#6B4423]">
                                  R$ {produto.valor_venda.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Subtotal</Label>
                              <div className="flex items-center h-10 px-3 bg-gradient-to-r from-[#6B4423]/10 to-[#2D5016]/10 rounded-lg border border-[#6B4423]/20">
                                <span className="font-bold text-[#6B4423]">
                                  R$ {(produto.valor_venda * produto.quantidade).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-[#E5DCC8] grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-[#8B7355]">Custo Total: </span>
                              <span className="font-semibold text-[#6B4423]">
                                R$ {(produto.valor_compra * produto.quantidade).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#8B7355]">Lucro Unit.: </span>
                              <span className="font-semibold text-[#2D5016]">
                                R$ {(produto.valor_venda - produto.valor_compra).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#8B7355]">Lucro Total: </span>
                              <span className="font-bold text-[#2D5016]">
                                R$ {((produto.valor_venda - produto.valor_compra) * produto.quantidade).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo da Cotação */}
                <Card className="border-[#E5DCC8] shadow-2xl bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] text-white">
                  <CardHeader className="border-b border-white/20">
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Resumo da Cotação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Custo Total</p>
                        <p className="text-3xl font-bold">R$ {totais.custo_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Valor Total</p>
                        <p className="text-3xl font-bold">R$ {totais.valor_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Lucro Total</p>
                        <p className="text-3xl font-bold text-[#C9A961]">R$ {totais.lucro_total}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/70 text-sm mb-1">Margem Geral</p>
                        <p className="text-3xl font-bold text-[#C9A961]">{totais.margem_geral}%</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={exportarCotacaoTexto}
                        className="flex-1 bg-white text-[#6B4423] hover:bg-white/90"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Copiar Cotação
                      </Button>
                      <Button
                        onClick={handleSalvarCotacao}
                        disabled={!cotacaoAtual.cliente_nome}
                        className="flex-1 bg-[#2D5016] hover:bg-[#1F3810] text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Cotação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab Produtos */}
          <TabsContent value="produtos" className="space-y-6">
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#6B4423]">Produtos Cadastrados</CardTitle>
                  <Button
                    onClick={() => {
                      setProdutoForm({
                        nome: "",
                        descricao: "",
                        tipo: "Moedor",
                        valor_compra: 0,
                        valor_venda_sugerido: 0,
                        margem_padrao: 30,
                        ativo: true,
                        observacoes: ""
                      });
                      setEditingProduto(null);
                      setShowProdutoForm(true);
                    }}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {produtos.length > 0 ? (
                  <div className="space-y-3">
                    {produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="bg-white p-4 rounded-lg border border-[#E5DCC8] hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-[#6B4423] text-lg">
                                {produto.nome}
                              </h4>
                              <Badge className="bg-[#2D5016] text-white">
                                {produto.tipo}
                              </Badge>
                              {!produto.ativo && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            {produto.descricao && (
                              <p className="text-sm text-[#8B7355] mb-3">
                                {produto.descricao}
                              </p>
                            )}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <span className="text-xs text-[#8B7355]">Custo</span>
                                <p className="font-semibold text-[#6B4423]">
                                  R$ {produto.valor_compra?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#8B7355]">Margem Padrão</span>
                                <p className="font-semibold text-[#2D5016]">
                                  {produto.margem_padrao || 0}%
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#8B7355]">Venda Sugerida</span>
                                <p className="font-semibold text-[#6B4423]">
                                  R$ {produto.valor_venda_sugerido?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-[#8B7355]">Lucro Unitário</span>
                                <p className="font-bold text-[#2D5016]">
                                  R$ {((produto.valor_venda_sugerido || 0) - (produto.valor_compra || 0)).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditProduto(produto)}
                              className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteProduto(produto.id)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8B7355]">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="mb-4">Nenhum produto cadastrado</p>
                    <Button
                      onClick={() => {
                        setProdutoForm({
                          nome: "",
                          descricao: "",
                          tipo: "Moedor",
                          valor_compra: 0,
                          valor_venda_sugerido: 0,
                          margem_padrao: 30,
                          ativo: true,
                          observacoes: ""
                        });
                        setEditingProduto(null);
                        setShowProdutoForm(true);
                      }}
                      className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Produto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-6">
            <Card className="border-[#E5DCC8] shadow-xl">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-[#6B4423]">Histórico de Cotações</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cotacoes.length > 0 ? (
                  <div className="space-y-3">
                    {cotacoes.map((cotacao) => (
                      <div
                        key={cotacao.id}
                        className="bg-white p-4 rounded-lg border border-[#E5DCC8] hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-[#6B4423] text-lg">
                                {cotacao.cliente_nome}
                              </h4>
                              <Badge
                                className={
                                  cotacao.status === "Aprovada"
                                    ? "bg-[#2D5016] text-white"
                                    : cotacao.status === "Recusada"
                                    ? "bg-red-600 text-white"
                                    : "bg-[#C9A961] text-white"
                                }
                              >
                                {cotacao.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-[#8B7355]">Data:</span>
                                <p className="font-semibold text-[#6B4423]">
                                  {new Date(cotacao.created_date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#8B7355]">Valor Total:</span>
                                <p className="font-semibold text-[#6B4423]">
                                  R$ {cotacao.valor_total?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#8B7355]">Lucro:</span>
                                <p className="font-semibold text-[#2D5016]">
                                  R$ {cotacao.lucro_total?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#8B7355]">Margem:</span>
                                <p className="font-semibold text-[#2D5016]">
                                  {cotacao.margem_geral?.toFixed(2) || 0}%
                                </p>
                              </div>
                            </div>
                            {cotacao.produtos && cotacao.produtos.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#E5DCC8]">
                                <p className="text-xs text-[#8B7355] mb-1">Produtos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {cotacao.produtos.map((p, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {p.produto_nome} ({p.quantidade}x)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8B7355]">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma cotação salva ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Produto */}
        <Dialog open={showProdutoForm} onOpenChange={setShowProdutoForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#6B4423]">
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={produtoForm.nome}
                    onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                    className="border-[#E5DCC8]"
                    placeholder="Ex: Moedor Tipo 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={produtoForm.tipo}
                    onChange={(e) => setProdutoForm({ ...produtoForm, tipo: e.target.value })}
                    className="w-full p-2 border border-[#E5DCC8] rounded-lg bg-white"
                  >
                    <option value="Moedor">Moedor</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Acessório">Acessório</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={produtoForm.descricao}
                  onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                  className="border-[#E5DCC8]"
                  rows={2}
                  placeholder="Descrição do produto..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_compra">Valor de Compra (R$) *</Label>
                  <Input
                    id="valor_compra"
                    type="number"
                    step="0.01"
                    value={produtoForm.valor_compra}
                    onChange={(e) => {
                      const novoValorCompra = parseFloat(e.target.value) || 0;
                      const margemAtual = produtoForm.margem_padrao || 0;
                      setProdutoForm({
                        ...produtoForm,
                        valor_compra: novoValorCompra,
                        valor_venda_sugerido: novoValorCompra * (1 + margemAtual / 100)
                      });
                    }}
                    className="border-[#E5DCC8]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margem_padrao">Margem Padrão (%)</Label>
                  <Input
                    id="margem_padrao"
                    type="number"
                    step="0.1"
                    value={produtoForm.margem_padrao}
                    onChange={(e) => {
                      const novaMargem = parseFloat(e.target.value) || 0;
                      setProdutoForm({
                        ...produtoForm,
                        margem_padrao: novaMargem,
                        valor_venda_sugerido: produtoForm.valor_compra * (1 + novaMargem / 100)
                      });
                    }}
                    className="border-[#E5DCC8]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_venda_sugerido">Venda Sugerida (R$)</Label>
                  <Input
                    id="valor_venda_sugerido"
                    type="number"
                    step="0.01"
                    value={produtoForm.valor_venda_sugerido}
                    onChange={(e) => setProdutoForm({ ...produtoForm, valor_venda_sugerido: parseFloat(e.target.value) || 0 })}
                    className="border-[#E5DCC8]"
                  />
                </div>
              </div>

              <div className="bg-[#F5F1E8] p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7355]">Lucro Unitário:</span>
                  <span className="font-bold text-[#2D5016]">
                    R$ {((produtoForm.valor_venda_sugerido || 0) - (produtoForm.valor_compra || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes_produto">Observações</Label>
                <Textarea
                  id="observacoes_produto"
                  value={produtoForm.observacoes}
                  onChange={(e) => setProdutoForm({ ...produtoForm, observacoes: e.target.value })}
                  className="border-[#E5DCC8]"
                  rows={2}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={produtoForm.ativo}
                  onChange={(e) => setProdutoForm({ ...produtoForm, ativo: e.target.checked })}
                  className="w-4 h-4 text-[#6B4423] rounded"
                />
                <Label htmlFor="ativo" className="cursor-pointer">Produto Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProdutoForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveProduto}
                disabled={!produtoForm.nome || !produtoForm.valor_compra}
                className="bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}