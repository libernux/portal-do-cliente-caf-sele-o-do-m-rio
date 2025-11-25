
import React, { useState, useEffect } from "react";
import { Responsavel } from "@/entities/Responsavel";
import { ConfiguracaoNotificacao } from "@/entities/ConfiguracaoNotificacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Mail, Bell, Settings, User, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Added
import { createPageUrl } from "@/utils"; // Added
import { base44 } from "@/api/base44Client"; // Added

export default function Configuracoes() {
  const [responsaveis, setResponsaveis] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState(""); // Added
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    area: "Geral",
    receber_problemas: true,
    receber_estoque: true,
    receber_logistica: false,
    ativo: true
  });

  useEffect(() => {
    const criarConfiguracoesIniciais = async (configsExistentes) => {
      const configsPadrao = [
        {
          chave: "notificar_clientes_problema",
          valor: false,
          descricao: "Enviar notificações por email para clientes quando problemas forem atualizados",
          categoria: "Problemas"
        },
        {
          chave: "notificar_clientes_resolvido",
          valor: false,
          descricao: "Notificar clientes quando seus problemas forem resolvidos",
          categoria: "Problemas"
        },
        {
          chave: "notificar_responsaveis_atribuicao",
          valor: true,
          descricao: "Notificar responsáveis quando problemas forem atribuídos a eles",
          categoria: "Problemas"
        },
        {
          chave: "alertas_estoque_baixo",
          valor: true,
          descricao: "Enviar alertas quando estoque estiver abaixo do limite",
          categoria: "Estoque"
        },
        {
          chave: "notificar_agendamentos",
          valor: true,
          descricao: "Enviar lembretes de agendamentos",
          categoria: "Agenda"
        },
        { // Added
          chave: "whatsapp_notificacoes_ativo",
          valor: true,
          descricao: "Ativar notificações via WhatsApp",
          categoria: "WhatsApp"
        }
      ];

      for (const config of configsPadrao) {
        const existe = configsExistentes.find(c => c.chave === config.chave);
        if (!existe) {
          await ConfiguracaoNotificacao.create(config);
        }
      }

      const novasConfigs = await ConfiguracaoNotificacao.list();
      setConfiguracoes(novasConfigs);
    };

    const loadData = async () => {
      setIsLoading(true);
      const [responsaveisData, configData] = await Promise.all([
        Responsavel.list(),
        ConfiguracaoNotificacao.list()
      ]);
      setResponsaveis(responsaveisData);
      setConfiguracoes(configData);

      await criarConfiguracoesIniciais(configData);

      // Gerar URL do WhatsApp
      const url = base44.agents.getWhatsAppConnectURL('notificacoes_whatsapp');
      setWhatsappUrl(url);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [responsaveisData, configData] = await Promise.all([
      Responsavel.list(),
      ConfiguracaoNotificacao.list()
    ]);
    setResponsaveis(responsaveisData);
    setConfiguracoes(configData);
    setIsLoading(false);
  };

  const handleSaveResponsavel = async (e) => {
    e.preventDefault();
    await Responsavel.create(formData);
    setShowForm(false);
    setFormData({
      nome: "",
      email: "",
      cargo: "",
      area: "Geral",
      receber_problemas: true,
      receber_estoque: true,
      receber_logistica: false,
      ativo: true
    });
    loadData();
  };

  const handleDeleteResponsavel = async (id) => {
    if (confirm("Deseja excluir este responsável?")) {
      await Responsavel.delete(id);
      loadData();
    }
  };

  const handleToggleConfig = async (config) => {
    await ConfiguracaoNotificacao.update(config.id, {
      ...config,
      valor: !config.valor
    });
    loadData();
  };

  const areaColors = {
    "Logística": "bg-[#6B4423]/10 text-[#6B4423] border-[#6B4423]",
    "Estoque": "bg-[#2D5016]/10 text-[#2D5016] border-[#2D5016]",
    "Atendimento": "bg-[#C9A961]/10 text-[#8B7355] border-[#C9A961]",
    "Geral": "bg-blue-100 text-blue-800 border-blue-300"
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Configurações do Sistema
          </h1>
          <p className="text-[#8B7355]">
            Gerencie responsáveis e preferências de notificações
          </p>
        </div>

        <Tabs defaultValue="responsaveis" className="space-y-6">
          <TabsList className="bg-[#F5F1E8]">
            <TabsTrigger value="responsaveis" className="gap-2">
              <User className="w-4 h-4" />
              Responsáveis
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2"> {/* Added */}
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          {/* Tab Responsáveis */}
          <TabsContent value="responsaveis" className="space-y-6">
            <Card className="border-[#E5DCC8]">
              <CardHeader className="border-b border-[#E5DCC8]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#6B4423]">Responsáveis Cadastrados</CardTitle>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Responsável
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {showForm && (
                  <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveResponsavel}
                    className="bg-[#F5F1E8] p-6 rounded-lg mb-6 space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          required
                          className="border-[#E5DCC8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="border-[#E5DCC8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          value={formData.cargo}
                          onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                          className="border-[#E5DCC8]"
                          placeholder="Ex: Gerente de Logística"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area">Área *</Label>
                        <Select
                          value={formData.area}
                          onValueChange={(value) => setFormData({ ...formData, area: value })}
                        >
                          <SelectTrigger className="border-[#E5DCC8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Logística">Logística</SelectItem>
                            <SelectItem value="Estoque">Estoque</SelectItem>
                            <SelectItem value="Atendimento">Atendimento</SelectItem>
                            <SelectItem value="Geral">Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.receber_problemas}
                          onChange={(e) => setFormData({ ...formData, receber_problemas: e.target.checked })}
                          className="w-4 h-4 text-[#6B4423] rounded"
                        />
                        <span className="text-sm text-[#6B4423]">Receber notificações de problemas</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.receber_estoque}
                          onChange={(e) => setFormData({ ...formData, receber_estoque: e.target.checked })}
                          className="w-4 h-4 text-[#6B4423] rounded"
                        />
                        <span className="text-sm text-[#6B4423]">Receber alertas de estoque</span>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-[#6B4423] hover:bg-[#5A3A1E]">
                        Salvar
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </motion.form>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
                  </div>
                ) : responsaveis.length > 0 ? (
                  <div className="space-y-3">
                    {responsaveis.map((resp) => (
                      <motion.div
                        key={resp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5DCC8] hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#6B4423] to-[#8B5A2B] rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {resp.nome?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-[#6B4423]">{resp.nome}</h3>
                              {!resp.ativo && (
                                <Badge variant="outline" className="text-xs">Inativo</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#8B7355] mb-2">
                              <Mail className="w-3 h-3" />
                              <span>{resp.email}</span>
                              {resp.cargo && (
                                <>
                                  <span>•</span>
                                  <span>{resp.cargo}</span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={areaColors[resp.area]}>
                                {resp.area}
                              </Badge>
                              {resp.receber_problemas && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  📋 Problemas
                                </Badge>
                              )}
                              {resp.receber_estoque && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  📦 Estoque
                                </Badge>
                              )}
                              {resp.receber_logistica && (
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                  🚚 Logística
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteResponsavel(resp.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8B7355]">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum responsável cadastrado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card className="border-[#E5DCC8]">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-[#6B4423]">Preferências de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B4423] mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {["Problemas", "Estoque", "Agenda", "Geral"].map((categoria) => {
                      const configsCategoria = configuracoes.filter(c => c.categoria === categoria);
                      if (configsCategoria.length === 0) return null;

                      return (
                        <div key={categoria}>
                          <h3 className="text-lg font-bold text-[#6B4423] mb-4">{categoria}</h3>
                          <div className="space-y-3">
                            {configsCategoria.map((config) => (
                              <div
                                key={config.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5DCC8] hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-[#6B4423]">{config.descricao}</p>
                                  <p className="text-xs text-[#8B7355] mt-1">Chave: {config.chave}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={config.valor}
                                    onChange={() => handleToggleConfig(config)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B4423]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B4423]"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#E5DCC8] bg-[#F5F1E8]/50">
              <CardHeader>
                <CardTitle className="text-[#6B4423] text-base flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Informações sobre Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#8B7355]">
                  <li>• <strong>Responsáveis:</strong> Cadastre as pessoas que devem receber notificações operacionais</li>
                  <li>• <strong>Área de Atuação:</strong> Defina qual área cada responsável atende para filtrar notificações relevantes</li>
                  <li>• <strong>Preferências Globais:</strong> Configure se clientes devem receber notificações por email</li>
                  <li>• <strong>Notificações Ativas:</strong> Apenas responsáveis marcados como "Ativo" receberão emails</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nova Tab WhatsApp */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="border-[#E5DCC8]">
              <CardHeader className="border-b border-[#E5DCC8]">
                <CardTitle className="text-[#6B4423] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Integração WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Status da Integração */}
                <div className="bg-gradient-to-br from-[#25D366]/10 to-white p-6 rounded-lg border-2 border-[#25D366]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#6B4423]">Agente Completo do Sistema</h3>
                      <p className="text-sm text-[#8B7355]">Gestão total via WhatsApp</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg space-y-3">
                    <p className="text-[#6B4423]">
                      <strong>✨ Funcionalidades Completas:</strong>
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-[#8B7355]">
                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">📦 Pedidos & Reservas</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Consultar status de pedidos</li>
                          <li>• Criar novas reservas</li>
                          <li>• Verificar entregas</li>
                          <li>• Acompanhar logística</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">💰 Financeiro</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Confirmar pagamentos</li>
                          <li>• Status do checklist (NF, boleto)</li>
                          <li>• Consultar valores</li>
                          <li>• Relatórios por cliente</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">☕ Cálculos de Café</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Calcular café para eventos</li>
                          <li>• Calcular uso interno/empresa</li>
                          <li>• Sugerir mix de cafés</li>
                          <li>• Converter embalagens</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">📊 Estoque</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Consultar disponibilidade</li>
                          <li>• Ver estoque por embalagem</li>
                          <li>• Verificar reservas ativas</li>
                          <li>• Alertas de estoque baixo</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">📋 Suporte</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Abrir chamados/problemas</li>
                          <li>• Acompanhar solicitações</li>
                          <li>• Atualizar status</li>
                          <li>• Histórico de interações</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-[#6B4423] mb-2">📅 Agendamentos</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Consultar agenda</li>
                          <li>• Criar compromissos</li>
                          <li>• Lembretes automáticos</li>
                          <li>• Sincronização</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conectar WhatsApp */}
                <Card className="border-[#E5DCC8] bg-[#F5F1E8]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <h4 className="font-semibold text-[#6B4423] text-lg">
                          🔗 Conectar seu WhatsApp
                        </h4>
                        <p className="text-sm text-[#8B7355]">
                          Clique no botão abaixo para conectar seu número do WhatsApp ao agente de notificações.
                          Após conectar, você poderá receber atualizações e interagir com o assistente virtual.
                        </p>
                        <div className="flex gap-3">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-lg transition-colors shadow-lg"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Conectar WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações WhatsApp */}
                <Card className="border-[#E5DCC8]">
                  <CardHeader>
                    <CardTitle className="text-base text-[#6B4423]">
                      Configurações de Notificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {configuracoes
                      .filter(c => c.categoria === "WhatsApp")
                      .map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5DCC8]"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-[#6B4423]">{config.descricao}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.valor}
                              onChange={() => handleToggleConfig(config)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#25D366]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                          </label>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                {/* Exemplo de Uso EXPANDIDO */}
                <Card className="border-[#E5DCC8] bg-gradient-to-br from-[#F5F1E8] to-white">
                  <CardHeader>
                    <CardTitle className="text-base text-[#6B4423] flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Como usar o Agente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-[#E5DCC8]">
                        <p className="text-sm font-medium text-[#6B4423] mb-2">💬 Exemplos de perguntas:</p>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-[#8B7355]">
                          <div>
                            <p className="font-semibold text-[#6B4423] mb-1">Pedidos:</p>
                            <ul className="space-y-1 ml-4">
                              <li>"Qual o status do meu pedido?"</li>
                              <li>"Meu pagamento foi confirmado?"</li>
                              <li>"Quando será a entrega?"</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-[#6B4423] mb-1">Cálculos:</p>
                            <ul className="space-y-1 ml-4">
                              <li>"Preciso de café para 200 pessoas"</li>
                              <li>"Quanto café para 50 funcionários?"</li>
                              <li>"Calcule café para 3 dias de evento"</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-[#6B4423] mb-1">Estoque:</p>
                            <ul className="space-y-1 ml-4">
                              <li>"Quais cafés estão disponíveis?"</li>
                              <li>"Tem Amendoado em estoque?"</li>
                              <li>"Quanto tem de Melaço de Cana?"</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-[#6B4423] mb-1">Suporte:</p>
                            <ul className="space-y-1 ml-4">
                              <li>"Problema com minha entrega"</li>
                              <li>"Solicitar patrocínio para evento"</li>
                              <li>"Agendar degustação"</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-[#E5DCC8]">
                        <p className="text-sm font-medium text-[#6B4423] mb-2">🔔 Notificações Automáticas:</p>
                        <ul className="text-sm text-[#8B7355] space-y-1 ml-4">
                          <li>✅ Quando uma reserva é criada ou atualizada</li>
                          <li>📦 Quando um pedido é enviado (mudança de status)</li>
                          <li>💰 Quando um pagamento é confirmado (checklist)</li>
                          <li>📋 Quando há atualizações em chamados</li>
                          <li>📅 Lembretes de agendamentos (1 dia antes)</li>
                          <li>⚠️ Alertas de estoque baixo</li>
                          <li>🎉 Aprovação de solicitações de eventos</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-[#6B4423]/10 to-[#C9A961]/10 p-4 rounded-lg border border-[#E5DCC8]">
                        <p className="text-sm font-medium text-[#6B4423] mb-2">🎯 Recursos Avançados:</p>
                        <ul className="text-sm text-[#8B7355] space-y-1 ml-4">
                          <li>🧮 <strong>Calculadora inteligente:</strong> Faz cálculos complexos de café automaticamente</li>
                          <li>📊 <strong>Relatórios personalizados:</strong> Gera resumos por cliente, período ou produto</li>
                          <li>🔄 <strong>Conversão de embalagens:</strong> Sugere melhores combinações (10g, 18g, 250g, etc)</li>
                          <li>💡 <strong>Sugestões proativas:</strong> Recomenda cafés e quantidades baseado no histórico</li>
                          <li>🔍 <strong>Busca inteligente:</strong> Encontra informações em todo o sistema</li>
                          <li>📝 <strong>Criação de registros:</strong> Abre chamados, reservas e agendamentos direto no chat</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Importantes */}
                <Card className="border-[#D97706] bg-[#D97706]/5">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-[#6B4423] space-y-2">
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul className="space-y-1 ml-4 text-[#8B7355]">
                          <li>• Cada usuário precisa conectar seu próprio WhatsApp</li>
                          <li>• A conexão é segura e autenticada via Base44</li>
                          <li>• Você pode desconectar seu WhatsApp a qualquer momento</li>
                          <li>• O agente responde automaticamente 24/7</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
