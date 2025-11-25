
import React, { useState, useEffect } from "react";
import { Cafe } from "@/entities/Cafe";
import { ReservaCafe } from "@/entities/ReservaCafe";
import { SolicitacaoEvento } from "@/entities/SolicitacaoEvento";
import { Problema } from "@/entities/Problema";
import { Cliente } from "@/entities/Cliente";
import { PrecoCafe } from "@/entities/PrecoCafe"; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Users,
  Coffee,
  AlertCircle,
  DollarSign,
  Copy // Added Copy icon
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Relatorios() {
  const [cafes, setCafes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [precosCafe, setPrecosCafe] = useState([]); // New state
  const [isLoading, setIsLoading] = useState(true);

  const [dataInicio, setDataInicio] = useState(format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [relatorioCliente, setRelatorioCliente] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [cafesData, reservasData, solicitacoesData, problemasData, clientesData, precosCafeData] = await Promise.all([
      Cafe.list(),
      ReservaCafe.list("-created_date"),
      SolicitacaoEvento.list("-created_date"),
      Problema.list("-created_date"),
      Cliente.list(),
      PrecoCafe.list() // Fetch PrecoCafe data
    ]);
    setCafes(cafesData);
    setReservas(reservasData);
    setSolicitacoes(solicitacoesData);
    setProblemas(problemasData);
    setClientes(clientesData);
    setPrecosCafe(precosCafeData); // Set PrecoCafe state
    setIsLoading(false);
  };

  const reservasFiltradas = reservas.filter(r => {
    const dataReserva = new Date(r.data_reserva);
    // Adjust dataFim to include the entire day
    const endDateAdjusted = new Date(dataFim);
    endDateAdjusted.setHours(23, 59, 59, 999);
    return dataReserva >= new Date(dataInicio) && dataReserva <= endDateAdjusted;
  });

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    const dataCriacao = new Date(s.created_date);
    const endDateAdjusted = new Date(dataFim);
    endDateAdjusted.setHours(23, 59, 59, 999);
    return dataCriacao >= new Date(dataInicio) && dataCriacao <= endDateAdjusted;
  });

  const problemasFiltrados = problemas.filter(p => {
    const dataAbertura = new Date(p.data_abertura || p.created_date);
    const endDateAdjusted = new Date(dataFim);
    endDateAdjusted.setHours(23, 59, 59, 999);
    return dataAbertura >= new Date(dataInicio) && dataAbertura <= endDateAdjusted;
  });

  const getPesoEmbalagem = (embalagem) => {
    const pesos = { "10g": 0.01, "18g": 0.018, "100g": 0.1, "250g": 0.25, "500g": 0.5, "1kg": 1 };
    return pesos[embalagem] || 0.25;
  };

  const estoqueTotal = cafes.reduce((sum, cafe) => {
    const estoque = cafe.estoque_por_embalagem || {};
    const kgCafe = Object.entries(estoque).reduce((s, [emb, qtd]) => {
      return s + (qtd * getPesoEmbalagem(emb));
    }, 0);
    return sum + kgCafe;
  }, 0);

  const reservasAtivas = reservas.filter(r => r.status === "Ativa");
  const estoqueReservado = reservasAtivas.reduce((sum, r) => {
    const peso = getPesoEmbalagem(r.embalagem || "250g");
    return sum + ((r.quantidade_pacotes || 0) * peso);
  }, 0);

  const estoqueDisponivel = estoqueTotal - estoqueReservado;

  const dadosEstoquePorCafe = cafes.map(cafe => {
    const estoque = cafe.estoque_por_embalagem || {};
    const kgTotal = Object.entries(estoque).reduce((s, [emb, qtd]) => {
      return s + (qtd * getPesoEmbalagem(emb));
    }, 0);
    
    const reservasDoCafe = reservasAtivas.filter(r => r.cafe_id === cafe.id);
    const kgReservado = reservasDoCafe.reduce((s, r) => {
      const peso = getPesoEmbalagem(r.embalagem || "250g");
      return s + ((r.quantidade_pacotes || 0) * peso);
    }, 0);
    
    return {
      nome: cafe.nome,
      total: parseFloat(kgTotal.toFixed(2)),
      reservado: parseFloat(kgReservado.toFixed(2)),
      disponivel: parseFloat((kgTotal - kgReservado).toFixed(2))
    };
  }).filter(c => c.total > 0);

  const totalReservas = reservasFiltradas.length;
  const reservasEntregues = reservasFiltradas.filter(r => r.status === "Entregue").length;
  const reservasCanceladas = reservasFiltradas.filter(r => r.status === "Cancelada").length;
  const taxaEntrega = totalReservas > 0 ? ((reservasEntregues / totalReservas) * 100).toFixed(1) : 0;

  const reservasPorStatus = [
    { name: "Ativas", value: reservasFiltradas.filter(r => r.status === "Ativa").length, color: "#D97706" },
    { name: "Entregues", value: reservasEntregues, color: "#2D5016" },
    { name: "Canceladas", value: reservasCanceladas, color: "#DC2626" }
  ];

  const reservasPorCliente = {};
  reservasFiltradas.forEach(r => {
    if (!reservasPorCliente[r.cliente_nome]) {
      reservasPorCliente[r.cliente_nome] = 0;
    }
    reservasPorCliente[r.cliente_nome]++;
  });

  const topClientes = Object.entries(reservasPorCliente)
    .map(([nome, qtd]) => ({ nome, quantidade: qtd }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  const solicitacoesPorStatus = [
    { name: "Pendente", value: solicitacoesFiltradas.filter(s => s.status === "Pendente").length, color: "#EAB308" },
    { name: "Em Análise", value: solicitacoesFiltradas.filter(s => s.status === "Em Análise").length, color: "#3B82F6" },
    { name: "Aprovada", value: solicitacoesFiltradas.filter(s => s.status === "Aprovada").length, color: "#2D5016" },
    { name: "Cancelada", value: solicitacoesFiltradas.filter(s => s.status === "Cancelada").length, color: "#DC2626" }
  ];

  const problemasPorStatus = [
    { name: "Aberto", value: problemasFiltrados.filter(p => p.status === "Aberto").length, color: "#EAB308" },
    { name: "Em Andamento", value: problemasFiltrados.filter(p => p.status === "Em Andamento").length, color: "#3B82F6" },
    { name: "Resolvido", value: problemasFiltrados.filter(p => p.status === "Resolvido").length, color: "#2D5016" },
    { name: "Cancelado", value: problemasFiltrados.filter(p => p.status === "Cancelado").length, color: "#DC2626" }
  ];

  const problemasPorTipo = {};
  problemasFiltrados.forEach(p => {
    if (!problemasPorTipo[p.tipo]) {
      problemasPorTipo[p.tipo] = 0;
    }
    problemasPorTipo[p.tipo]++;
  });

  const dadosProblemasPorTipo = Object.entries(problemasPorTipo)
    .map(([tipo, qtd]) => ({ tipo, quantidade: qtd }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const cafesPrivateLabel = cafes.filter(c => c.is_private_label);
  const totalProdutosPrivateLabel = cafesPrivateLabel.length;

  const gerarRelatorioCliente = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return null;

    const reservasCliente = reservasFiltradas.filter(r => r.cliente_id === clienteId);
    
    if (reservasCliente.length === 0) {
      alert("Nenhuma reserva encontrada para este cliente no período selecionado.");
      return null;
    }

    // Buscar preços específicos do cliente da entity PrecoCafe
    const precosClienteEntity = precosCafe.filter(p => p.cliente_id === clienteId && p.ativo);
    
    // Criar mapa de preços por kg para cada café
    const precosMap = {};
    cafes.forEach(cafe => {
      // Primeiro tentar pegar da PrecoCafe
      const precoCliente = precosClienteEntity.find(p => p.cafe_id === cafe.id);
      
      if (precoCliente && precoCliente.preco_por_pacote > 0) {
        // PrecoCafe.preco_por_pacote é o preço de um pacote de 250g
        // Para obter preço por kg: preco_por_pacote / 0.25
        precosMap[cafe.id] = precoCliente.preco_por_pacote / 0.25;
      } else {
        // Usar preço private label como fallback
        // precos_private_label["250g"] é o preço de um pacote de 250g
        const precoPrivateLabel = cafe.precos_private_label?.["250g"] || 0;
        precosMap[cafe.id] = precoPrivateLabel > 0 ? precoPrivateLabel / 0.25 : 0;
      }
    });

    // Agrupar por data (data_reserva)
    const reservasPorData = {};
    reservasCliente.forEach(r => {
      const dataKey = r.data_reserva;
      if (!reservasPorData[dataKey]) {
        reservasPorData[dataKey] = [];
      }
      reservasPorData[dataKey].push(r);
    });

    // Calcular totais por dia
    const diasDetalhados = Object.entries(reservasPorData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([data, reservasDoDia]) => {
        const cafesPorTipo = {};
        let totalKgDia = 0;
        let totalValorDia = 0;
        let dataEntregaPrimeiraReserva = null;
        let statusPrimeiraReserva = null;

        reservasDoDia.forEach(r => {
          const peso = getPesoEmbalagem(r.embalagem || "250g");
          const kgReserva = (r.quantidade_pacotes || 0) * peso;
          const precoPorKg = precosMap[r.cafe_id] || 0;
          const valorReserva = kgReserva * precoPorKg;

          if (!cafesPorTipo[r.cafe_nome]) {
            cafesPorTipo[r.cafe_nome] = {
              kg: 0,
              valor: 0,
              precoPorKg: precoPorKg
            };
          }

          cafesPorTipo[r.cafe_nome].kg += kgReserva;
          cafesPorTipo[r.cafe_nome].valor += valorReserva;
          totalKgDia += kgReserva;
          totalValorDia += valorReserva;

          if (!dataEntregaPrimeiraReserva) {
            dataEntregaPrimeiraReserva = r.data_entrega;
          }
          if (!statusPrimeiraReserva) {
            statusPrimeiraReserva = r.status;
          }
        });

        return {
          data,
          cafes: cafesPorTipo,
          totalKg: totalKgDia,
          totalValor: totalValorDia,
          dataEntrega: dataEntregaPrimeiraReserva,
          status: statusPrimeiraReserva
        };
      });

    // Calcular totais gerais
    const totalGeralKg = diasDetalhados.reduce((sum, dia) => sum + dia.totalKg, 0);
    const totalGeralValor = diasDetalhados.reduce((sum, dia) => sum + dia.totalValor, 0);

    // Verificar status de entrega
    const numReservas = reservasCliente.length;
    const numEntregues = reservasCliente.filter(r => r.status === "Entregue").length;
    const percentualEntregue = numReservas > 0 ? ((numEntregues / numReservas) * 100).toFixed(0) : 0;
    const todasEntregues = numEntregues === numReservas && numReservas > 0;

    return {
      cliente: cliente.nome,
      periodo: `${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`,
      status: todasEntregues ? `100% entregue` : `${percentualEntregue}% entregue`,
      dias: diasDetalhados,
      totalKg: totalGeralKg,
      totalValor: totalGeralValor
    };
  };

  const handleGerarRelatorioCliente = () => {
    if (!clienteSelecionado) {
      alert("Selecione um cliente para gerar o relatório.");
      return;
    }
    const relatorio = gerarRelatorioCliente(clienteSelecionado);
    if (relatorio) {
      setRelatorioCliente(relatorio);
    } else {
      setRelatorioCliente(null); // Clear previous report if generation failed
    }
  };

  const exportarRelatorio = (tipo) => {
    let dados = "";
    let filename = "";

    switch(tipo) {
      case "estoque":
        dados = "Café,Total (kg),Reservado (kg),Disponível (kg)\n";
        dadosEstoquePorCafe.forEach(c => {
          dados += `${c.nome},${c.total},${c.reservado},${c.disponivel}\n`;
        });
        filename = `relatorio-estoque-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      
      case "reservas":
        dados = "Cliente,Café,Embalagem,Quantidade,Status,Data\n";
        reservasFiltradas.forEach(r => {
          dados += `${r.cliente_nome},${r.cafe_nome},${r.embalagem},${r.quantidade_pacotes},${r.status},${r.data_reserva}\n`;
        });
        filename = `relatorio-reservas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;

      case "solicitacoes":
        dados = "Cliente,Tipo,Local,Data Evento,Status,Data Solicitação\n";
        solicitacoesFiltradas.forEach(s => {
          const dataSolicitacao = format(new Date(s.created_date), 'dd/MM/yyyy');
          dados += `${s.cliente_nome},${s.tipo_solicitacao},${s.local_evento},${s.data_evento},${s.status},${dataSolicitacao}\n`;
        });
        filename = `relatorio-solicitacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;

      case "problemas":
        dados = "Cliente,Tipo,Prioridade,Status,Data Abertura,Responsável\n";
        problemasFiltrados.forEach(p => {
          const dataAbertura = p.data_abertura || format(new Date(p.created_date), 'dd/MM/yyyy');
          const responsavel = p.responsavel || 'Não atribuído';
          dados += `${p.nome_cliente},${p.tipo},${p.prioridade},${p.status},${dataAbertura},${responsavel}\n`;
        });
        filename = `relatorio-chamados-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
    }

    const blob = new Blob([dados], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const copiarRelatorioCliente = () => {
    if (!relatorioCliente) return;

    let texto = `Relatório de Pedidos — ${relatorioCliente.cliente}\n\n`;
    texto += `Período de solicitação: ${relatorioCliente.periodo}\n`;
    texto += `Status: ${relatorioCliente.status}\n\n`;
    
    texto += `Resumo por dia (kg e valores)\n\n`;

    relatorioCliente.dias.forEach(dia => {
      texto += `${format(new Date(dia.data), 'dd/MM/yyyy', { locale: ptBR })} — ${dia.totalKg.toFixed(1)} kg | R$ ${dia.totalValor.toFixed(2)}\n`;
      
      Object.entries(dia.cafes).forEach(([nome, dados]) => {
        texto += `• ${nome}: ${dados.kg.toFixed(1)} kg (R$ ${dados.valor.toFixed(2)})\n`;
      });
      texto += `\n`;
    });

    texto += `Total Geral\n`;
    texto += `${relatorioCliente.totalKg.toFixed(1)} kg | R$ ${relatorioCliente.totalValor.toFixed(2)}\n`;

    navigator.clipboard.writeText(texto).then(() => {
      alert("✅ Relatório copiado para a área de transferência!");
    }).catch(() => {
      alert("❌ Erro ao copiar relatório");
    });
  };

  const exportarRelatorioClienteTexto = () => {
    if (!relatorioCliente) return;

    let texto = `Relatório de Pedidos — ${relatorioCliente.cliente}\n\n`;
    texto += `Período de solicitação: ${relatorioCliente.periodo}\n`;
    texto += `Status: ${relatorioCliente.status}\n\n`;
    
    texto += `Resumo por dia (kg e valores)\n\n`;

    relatorioCliente.dias.forEach(dia => {
      texto += `${format(new Date(dia.data), 'dd/MM/yyyy', { locale: ptBR })} — ${dia.totalKg.toFixed(1)} kg | R$ ${dia.totalValor.toFixed(2)}\n`;
      
      Object.entries(dia.cafes).forEach(([nome, dados]) => {
        texto += `• ${nome}: ${dados.kg.toFixed(1)} kg (R$ ${dados.valor.toFixed(2)})\n`;
      });
      texto += `\n`;
    });

    texto += `Total Geral\n`;
    texto += `${relatorioCliente.totalKg.toFixed(1)} kg | R$ ${relatorioCliente.totalValor.toFixed(2)}\n`;

    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${relatorioCliente.cliente.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    link.click();
  };

  const COLORS = ['#6B4423', '#2D5016', '#D97706', '#DC2626', '#3B82F6', '#8B5A2B'];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Relatórios e Análises
          </h1>
          <p className="text-[#8B7355]">
            Visualize dados e métricas do sistema
          </p>
        </div>

        <Card className="border-[#E5DCC8] shadow-lg mb-6">
          <CardHeader className="border-b border-[#E5DCC8]">
            <CardTitle className="flex items-center gap-2 text-[#6B4423]">
              <Calendar className="w-5 h-5" />
              Período de Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border-[#E5DCC8]"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadData}
                  className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
                >
                  Atualizar Dados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4423] mx-auto"></div>
          </div>
        ) : (
          <Tabs defaultValue="estoque" className="space-y-6">
            <TabsList className="bg-[#F5F1E8] flex-wrap h-auto">
              <TabsTrigger value="estoque" className="gap-2">
                <Package className="w-4 h-4" />
                Estoque
              </TabsTrigger>
              <TabsTrigger value="reservas" className="gap-2">
                <Coffee className="w-4 h-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="solicitacoes" className="gap-2">
                <FileText className="w-4 h-4" />
                Solicitações
              </TabsTrigger>
              <TabsTrigger value="chamados" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                Chamados
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Private Label
              </TabsTrigger>
              <TabsTrigger value="individual" className="gap-2">
                <Users className="w-4 h-4" />
                Por Cliente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estoque" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Estoque Total</p>
                        <p className="text-3xl font-bold text-[#6B4423]">{estoqueTotal.toFixed(2)} kg</p>
                      </div>
                      <Package className="w-10 h-10 text-[#6B4423] opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Disponível</p>
                        <p className="text-3xl font-bold text-[#2D5016]">{estoqueDisponivel.toFixed(2)} kg</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-[#2D5016] opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Reservado</p>
                        <p className="text-3xl font-bold text-[#D97706]">{estoqueReservado.toFixed(2)} kg</p>
                      </div>
                      <Coffee className="w-10 h-10 text-[#D97706] opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E5DCC8]">
                <CardHeader className="border-b border-[#E5DCC8] flex flex-row items-center justify-between">
                  <CardTitle className="text-[#6B4423]">Estoque por Café</CardTitle>
                  <Button
                    onClick={() => exportarRelatorio('estoque')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dadosEstoquePorCafe}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                      <YAxis label={{ value: 'KG', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#6B4423" name="Total" />
                      <Bar dataKey="disponivel" fill="#2D5016" name="Disponível" />
                      <Bar dataKey="reservado" fill="#D97706" name="Reservado" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reservas" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#8B7355] mb-1">Total Reservas</p>
                    <p className="text-3xl font-bold text-[#6B4423]">{totalReservas}</p>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#8B7355] mb-1">Entregues</p>
                    <p className="text-3xl font-bold text-[#2D5016]">{reservasEntregues}</p>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#8B7355] mb-1">Canceladas</p>
                    <p className="text-3xl font-bold text-[#DC2626]">{reservasCanceladas}</p>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#8B7355] mb-1">Taxa Entrega</p>
                    <p className="text-3xl font-bold text-[#6B4423]">{taxaEntrega}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-[#E5DCC8]">
                  <CardHeader className="border-b border-[#E5DCC8]">
                    <CardTitle className="text-[#6B4423]">Reservas por Status</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reservasPorStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reservasPorStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardHeader className="border-b border-[#E5DCC8] flex flex-row items-center justify-between">
                    <CardTitle className="text-[#6B4423]">Top 5 Clientes</CardTitle>
                    <Button
                      onClick={() => exportarRelatorio('reservas')}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topClientes} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="nome" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#6B4423" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="solicitacoes" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                {solicitacoesPorStatus.map((item) => (
                  <Card key={item.name} className="border-[#E5DCC8]">
                    <CardContent className="p-6">
                      <p className="text-sm text-[#8B7355] mb-1">{item.name}</p>
                      <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-[#E5DCC8]">
                <CardHeader className="border-b border-[#E5DCC8] flex flex-row items-center justify-between">
                  <CardTitle className="text-[#6B4423]">Distribuição por Status</CardTitle>
                  <Button
                    onClick={() => exportarRelatorio('solicitacoes')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={solicitacoesPorStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {solicitacoesPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chamados" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                {problemasPorStatus.map((item) => (
                  <Card key={item.name} className="border-[#E5DCC8]">
                    <CardContent className="p-6">
                      <p className="text-sm text-[#8B7355] mb-1">{item.name}</p>
                      <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-[#E5DCC8]">
                  <CardHeader className="border-b border-[#E5DCC8]">
                    <CardTitle className="text-[#6B4423]">Chamados por Status</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={problemasPorStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {problemasPorStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardHeader className="border-b border-[#E5DCC8] flex flex-row items-center justify-between">
                    <CardTitle className="text-[#6B4423]">Chamados por Tipo</CardTitle>
                    <Button
                      onClick={() => exportarRelatorio('problemas')}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosProblemasPorTipo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#6B4423" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Produtos Private Label</p>
                        <p className="text-3xl font-bold text-[#6B4423]">{totalProdutosPrivateLabel}</p>
                      </div>
                      <Coffee className="w-10 h-10 text-[#6B4423] opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Total de Clientes</p>
                        <p className="text-3xl font-bold text-[#6B4423]">{clientes.length}</p>
                      </div>
                      <Users className="w-10 h-10 text-[#6B4423] opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E5DCC8]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B7355]">Total Tipos de Café</p>
                        <p className="text-3xl font-bold text-[#6B4423]">{cafes.length}</p>
                      </div>
                      <Package className="w-10 h-10 text-[#6B4423] opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E5DCC8]">
                <CardHeader className="border-b border-[#E5DCC8]">
                  <CardTitle className="text-[#6B4423]">Cafés Private Label</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {cafesPrivateLabel.map((cafe) => {
                      const precos = cafe.precos_private_label || {};
                      const embalagensComPreco = (cafe.embalagens_disponiveis || []).filter(emb => precos[emb] > 0);
                      
                      return (
                        <div key={cafe.id} className="bg-[#F5F1E8] p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#6B4423] mb-2">{cafe.nome}</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{cafe.forma}</Badge>
                                {cafe.torra && <Badge variant="outline">{cafe.torra}</Badge>}
                                {cafe.origem && <Badge variant="outline">{cafe.origem}</Badge>}
                              </div>
                              {cafe.notas_degustacao && (
                                <p className="text-xs text-[#8B7355] mt-2">
                                  🍫 {cafe.notas_degustacao}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[#8B7355] mb-1">Preços:</p>
                              {embalagensComPreco.map(emb => (
                                <p key={emb} className="text-sm font-semibold text-[#6B4423]">
                                  {emb}: R$ {precos[emb].toFixed(2)}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {cafesPrivateLabel.length === 0 && (
                      <p className="text-center text-[#8B7355] py-8">
                        Nenhum café Private Label cadastrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="space-y-6">
              <Card className="border-[#E5DCC8] shadow-xl">
                <CardHeader className="border-b border-[#E5DCC8]">
                  <CardTitle className="text-[#6B4423]">
                    Relatório Individual por Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="clienteRelatorio">Selecione o Cliente</Label>
                      <select
                        id="clienteRelatorio"
                        value={clienteSelecionado || ""}
                        onChange={(e) => setClienteSelecionado(e.target.value)}
                        className="w-full mt-2 p-2 border border-[#E5DCC8] rounded-lg bg-white text-[#6B4423]"
                      >
                        <option value="">Selecione...</option>
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleGerarRelatorioCliente}
                        className="w-full md:w-auto bg-[#6B4423] hover:bg-[#5A3A1E]"
                      >
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>

                  {relatorioCliente && (
                    <div className="space-y-6">
                      {/* Header do Relatório */}
                      <div className="bg-gradient-to-r from-[#6B4423] to-[#8B5A2B] text-white p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-2">
                          Relatório de Pedidos — {relatorioCliente.cliente}
                        </h2>
                        <p className="text-white/90">
                          Período de solicitação: {relatorioCliente.periodo}
                        </p>
                        <p className="text-white/90">
                          Status: {relatorioCliente.status}
                        </p>
                      </div>

                      {/* Resumo por Dia */}
                      <div>
                        <h3 className="text-xl font-bold text-[#6B4423] mb-4">
                          Resumo por dia (kg e valores)
                        </h3>

                        <div className="space-y-4">
                          {relatorioCliente.dias.map((dia, index) => (
                            <Card key={index} className="border-[#E5DCC8]">
                              <CardHeader className="bg-[#F5F1E8] border-b border-[#E5DCC8]">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                  <CardTitle className="text-lg text-[#6B4423] mb-2 md:mb-0">
                                    {format(new Date(dia.data), 'dd/MM/yyyy', { locale: ptBR })}
                                  </CardTitle>
                                  <div className="text-left md:text-right">
                                    <p className="text-xl font-bold text-[#6B4423]">
                                      {dia.totalKg.toFixed(1)} kg | R$ {dia.totalValor.toFixed(2)}
                                    </p>
                                    {dia.status === "Entregue" && dia.dataEntrega && (
                                      <Badge className="bg-[#2D5016] text-white mt-1">
                                        Entregue em {format(new Date(dia.dataEntrega), 'dd/MM/yyyy', { locale: ptBR })}
                                      </Badge>
                                    )}
                                    {dia.status === "Cancelada" && (
                                      <Badge className="bg-[#DC2626] text-white mt-1">
                                        Cancelada
                                      </Badge>
                                    )}
                                    {dia.status === "Ativa" && (
                                      <Badge className="bg-[#D97706] text-white mt-1">
                                        Ativa
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                <div className="space-y-2">
                                  {Object.entries(dia.cafes).map(([nome, dados]) => (
                                    <div key={nome} className="flex justify-between items-center text-[#6B4423] bg-[#F5F1E8] p-3 rounded">
                                      <span className="font-medium">• {nome}</span>
                                      <span className="font-semibold">
                                        {dados.kg.toFixed(1)} kg (R$ {dados.valor.toFixed(2)})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Total Geral */}
                      <Card className="border-[#E5DCC8] bg-gradient-to-r from-[#2D5016]/10 to-white">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-[#6B4423]">Total Geral</h3>
                            <p className="text-3xl font-bold text-[#2D5016]">
                              {relatorioCliente.totalKg.toFixed(1)} kg | R$ {relatorioCliente.totalValor.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Botões de Exportação */}
                      <div className="flex gap-3">
                        <Button
                          onClick={copiarRelatorioCliente}
                          variant="outline"
                          className="border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Relatório
                        </Button>
                        <Button
                          onClick={exportarRelatorioClienteTexto}
                          variant="outline"
                          className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar TXT
                        </Button>
                      </div>
                    </div>
                  )}

                  {!relatorioCliente && (
                    <div className="text-center py-12 text-[#8B7355]">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Selecione um cliente e clique em "Gerar Relatório"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
