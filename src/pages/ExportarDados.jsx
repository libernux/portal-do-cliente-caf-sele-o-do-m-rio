import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Upload, 
  Database, 
  Package, 
  Coffee, 
  Users, 
  Calendar, 
  AlertCircle,
  FileJson,
  CheckCircle2,
  Loader2,
  FileUp,
  Info
} from "lucide-react";
import { toast } from "sonner";

// Lista de todas as entidades do sistema
const ENTIDADES_SISTEMA = [
  { nome: "Cafe", label: "Cafés (Estoque)", icon: Coffee },
  { nome: "Cliente", label: "Clientes", icon: Users },
  { nome: "ReservaCafe", label: "Reservas de Café", icon: Package },
  { nome: "PrecoCafe", label: "Preços por Cliente", icon: Package },
  { nome: "ClienteSlug", label: "Links de Clientes", icon: Package },
  { nome: "Problema", label: "Chamados/Problemas", icon: AlertCircle },
  { nome: "AtualizacaoProblema", label: "Atualizações de Problemas", icon: AlertCircle },
  { nome: "EtiquetaProblema", label: "Etiquetas de Problemas", icon: AlertCircle },
  { nome: "Tarefa", label: "Tarefas", icon: Calendar },
  { nome: "Agendamento", label: "Agendamentos", icon: Calendar },
  { nome: "Caixa", label: "Caixas (Logística)", icon: Package },
  { nome: "SubmissaoProdutor", label: "Cadastros de Cafés", icon: Coffee },
  { nome: "InfoCafe", label: "Informações de Cafés", icon: Coffee },
  { nome: "SolicitacaoEvento", label: "Solicitações de Eventos", icon: Calendar },
  { nome: "AtualizacaoSolicitacao", label: "Atualizações de Solicitações", icon: Calendar },
  { nome: "SolicitacaoPatrocinio", label: "Solicitações de Patrocínio", icon: Package },
  { nome: "AtualizacaoPatrocinio", label: "Atualizações de Patrocínio", icon: Package },
  { nome: "AssinanteClube", label: "Assinantes do Clube", icon: Users },
  { nome: "EntregaClube", label: "Entregas do Clube", icon: Package },
  { nome: "EmpresaPermuta", label: "Empresas Permuta", icon: Users },
  { nome: "DemandaExterna", label: "Demandas Externas", icon: Package },
  { nome: "HistoricoDemanda", label: "Histórico de Demandas", icon: Package },
  { nome: "ItemChecklist", label: "Itens de Checklist", icon: Package },
  { nome: "ClienteChecklistItem", label: "Checklist por Cliente", icon: Package },
  { nome: "PedidoYampi", label: "Pedidos Yampi", icon: Package },
  { nome: "ProdutoYampi", label: "Produtos Yampi", icon: Package },
  { nome: "ClienteYampi", label: "Clientes Yampi", icon: Users },
  { nome: "CategoriaYampi", label: "Categorias Yampi", icon: Package },
  { nome: "LogSincronizacaoYampi", label: "Logs Yampi", icon: Database },
  { nome: "ContratoRPA", label: "Contratos RPA", icon: FileJson },
  { nome: "SignatarioContrato", label: "Signatários de Contratos", icon: Users },
  { nome: "ProdutoAgridrones", label: "Produtos Agridrones", icon: Package },
  { nome: "CotacaoAgridrones", label: "Cotações Agridrones", icon: Package },
  { nome: "ConfiguracaoFrete", label: "Configurações de Frete", icon: Package },
  { nome: "Responsavel", label: "Responsáveis", icon: Users },
  { nome: "ConfiguracaoNotificacao", label: "Configurações de Notificação", icon: Database },
];

export default function ExportarDados() {
  const [entidadesSelecionadas, setEntidadesSelecionadas] = useState(
    ENTIDADES_SISTEMA.map(e => e.nome)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEntity, setCurrentEntity] = useState("");
  const [exportStats, setExportStats] = useState(null);
  const [importStats, setImportStats] = useState(null);

  const toggleEntidade = (nome) => {
    setEntidadesSelecionadas(prev => 
      prev.includes(nome) 
        ? prev.filter(e => e !== nome)
        : [...prev, nome]
    );
  };

  const selecionarTodas = () => {
    setEntidadesSelecionadas(ENTIDADES_SISTEMA.map(e => e.nome));
  };

  const deselecionarTodas = () => {
    setEntidadesSelecionadas([]);
  };

  const exportarDados = async () => {
    if (entidadesSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma entidade para exportar");
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setExportStats(null);

    const dadosExportados = {
      metadata: {
        versao: "1.0",
        dataExportacao: new Date().toISOString(),
        sistema: "Cafe Selecao do Mario",
        totalEntidades: entidadesSelecionadas.length
      },
      dados: {}
    };

    const stats = {};

    try {
      for (let i = 0; i < entidadesSelecionadas.length; i++) {
        const entidade = entidadesSelecionadas[i];
        setCurrentEntity(entidade);
        setProgress(((i + 1) / entidadesSelecionadas.length) * 100);

        try {
          const dados = await base44.entities[entidade].list();
          dadosExportados.dados[entidade] = dados;
          stats[entidade] = dados.length;
        } catch (error) {
          console.warn(`Erro ao exportar ${entidade}:`, error);
          dadosExportados.dados[entidade] = [];
          stats[entidade] = 0;
        }
      }

      // Calcular totais
      const totalRegistros = Object.values(stats).reduce((a, b) => a + b, 0);
      dadosExportados.metadata.totalRegistros = totalRegistros;

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(dadosExportados, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_cafe_selecao_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setExportStats({ ...stats, total: totalRegistros });
      toast.success(`Exportação concluída! ${totalRegistros} registros exportados.`);

    } catch (error) {
      console.error("Erro na exportação:", error);
      toast.error("Erro ao exportar dados");
    }

    setIsExporting(false);
    setCurrentEntity("");
  };

  const importarDados = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setImportStats(null);

    try {
      const content = await file.text();
      const dadosImportados = JSON.parse(content);

      if (!dadosImportados.metadata || !dadosImportados.dados) {
        throw new Error("Arquivo de backup inválido");
      }

      const entidades = Object.keys(dadosImportados.dados);
      const stats = { importados: {}, erros: {} };

      for (let i = 0; i < entidades.length; i++) {
        const entidade = entidades[i];
        const registros = dadosImportados.dados[entidade];
        
        setCurrentEntity(entidade);
        setProgress(((i + 1) / entidades.length) * 100);

        if (!registros || registros.length === 0) {
          stats.importados[entidade] = 0;
          continue;
        }

        try {
          // Remover campos do sistema que não devem ser importados
          const registrosLimpos = registros.map(r => {
            const { id, created_date, updated_date, created_by, ...dados } = r;
            return dados;
          });

          // Importar em lotes de 50
          let importadosCount = 0;
          for (let j = 0; j < registrosLimpos.length; j += 50) {
            const lote = registrosLimpos.slice(j, j + 50);
            try {
              await base44.entities[entidade].bulkCreate(lote);
              importadosCount += lote.length;
            } catch (batchError) {
              // Tentar um por um se o lote falhar
              for (const registro of lote) {
                try {
                  await base44.entities[entidade].create(registro);
                  importadosCount++;
                } catch (singleError) {
                  console.warn(`Erro ao importar registro de ${entidade}:`, singleError);
                }
              }
            }
          }
          stats.importados[entidade] = importadosCount;

        } catch (error) {
          console.warn(`Erro ao importar ${entidade}:`, error);
          stats.erros[entidade] = error.message;
          stats.importados[entidade] = 0;
        }
      }

      const totalImportados = Object.values(stats.importados).reduce((a, b) => a + b, 0);
      setImportStats({ ...stats, total: totalImportados });
      toast.success(`Importação concluída! ${totalImportados} registros importados.`);

    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao importar dados: " + error.message);
    }

    setIsImporting(false);
    setCurrentEntity("");
    event.target.value = "";
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-2 flex items-center gap-3">
            <Database className="w-8 h-8" />
            Exportar / Importar Dados
          </h1>
          <p className="text-[#8B7355]">
            Faça backup completo dos dados ou importe dados de outro sistema
          </p>
        </div>

        {/* Aviso Importante */}
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Informações Importantes:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>Exportação:</strong> Gera um arquivo JSON com todos os dados selecionados</li>
                  <li><strong>Importação:</strong> Adiciona novos registros (não substitui existentes)</li>
                  <li>IDs e datas de criação serão gerados novamente ao importar</li>
                  <li>Recomendado fazer backup antes de importar dados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Painel de Exportação */}
          <Card className="border-[#E5DCC8]">
            <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#6B4423]/10 to-transparent">
              <CardTitle className="text-[#6B4423] flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Seleção de Entidades */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-[#6B4423]">
                    Selecione as entidades para exportar:
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selecionarTodas}>
                      Todas
                    </Button>
                    <Button variant="ghost" size="sm" onClick={deselecionarTodas}>
                      Nenhuma
                    </Button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto border border-[#E5DCC8] rounded-lg p-3 space-y-2">
                  {ENTIDADES_SISTEMA.map((entidade) => (
                    <label
                      key={entidade.nome}
                      className="flex items-center gap-3 p-2 hover:bg-[#F5F1E8] rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={entidadesSelecionadas.includes(entidade.nome)}
                        onCheckedChange={() => toggleEntidade(entidade.nome)}
                      />
                      <entidade.icon className="w-4 h-4 text-[#8B7355]" />
                      <span className="text-sm text-[#5A4A3A]">{entidade.label}</span>
                    </label>
                  ))}
                </div>

                <p className="text-xs text-[#8B7355]">
                  {entidadesSelecionadas.length} de {ENTIDADES_SISTEMA.length} entidades selecionadas
                </p>
              </div>

              {/* Progresso da Exportação */}
              {isExporting && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-[#8B7355] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando: {currentEntity}
                  </p>
                </div>
              )}

              {/* Estatísticas de Exportação */}
              {exportStats && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Exportação Concluída!
                  </div>
                  <p className="text-sm text-green-600 mb-2">
                    Total: {exportStats.total} registros exportados
                  </p>
                  <div className="max-h-32 overflow-y-auto text-xs text-green-700 space-y-1">
                    {Object.entries(exportStats)
                      .filter(([key]) => key !== 'total')
                      .map(([entidade, count]) => (
                        <div key={entidade} className="flex justify-between">
                          <span>{entidade}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Botão de Exportar */}
              <Button
                onClick={exportarDados}
                disabled={isExporting || entidadesSelecionadas.length === 0}
                className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados ({entidadesSelecionadas.length} entidades)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Painel de Importação */}
          <Card className="border-[#E5DCC8]">
            <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-[#2D5016]/10 to-transparent">
              <CardTitle className="text-[#2D5016] flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Área de Upload */}
              <div className="border-2 border-dashed border-[#E5DCC8] rounded-lg p-8 text-center hover:border-[#6B4423] transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={importarDados}
                  disabled={isImporting}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <FileUp className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
                  <p className="text-[#6B4423] font-medium mb-2">
                    Clique para selecionar arquivo
                  </p>
                  <p className="text-sm text-[#8B7355]">
                    Arquivo JSON exportado anteriormente
                  </p>
                </label>
              </div>

              {/* Progresso da Importação */}
              {isImporting && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-[#8B7355] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando: {currentEntity}
                  </p>
                </div>
              )}

              {/* Estatísticas de Importação */}
              {importStats && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Importação Concluída!
                  </div>
                  <p className="text-sm text-green-600 mb-2">
                    Total: {importStats.total} registros importados
                  </p>
                  <div className="max-h-32 overflow-y-auto text-xs text-green-700 space-y-1">
                    {Object.entries(importStats.importados).map(([entidade, count]) => (
                      <div key={entidade} className="flex justify-between">
                        <span>{entidade}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(importStats.erros).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs text-red-600 font-medium mb-1">Erros:</p>
                      {Object.entries(importStats.erros).map(([entidade, erro]) => (
                        <p key={entidade} className="text-xs text-red-500">
                          {entidade}: {erro}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instruções */}
              <div className="bg-[#F5F1E8] rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-[#6B4423]">📋 Como usar:</p>
                <ol className="text-sm text-[#8B7355] space-y-1 list-decimal ml-4">
                  <li>Exporte os dados do sistema de origem</li>
                  <li>Transfira o arquivo JSON para este computador</li>
                  <li>Clique na área acima e selecione o arquivo</li>
                  <li>Aguarde a importação ser concluída</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card className="border-[#E5DCC8]">
          <CardHeader>
            <CardTitle className="text-base text-[#6B4423] flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Estrutura do Arquivo de Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "metadata": {
    "versao": "1.0",
    "dataExportacao": "2024-01-23T10:00:00.000Z",
    "sistema": "Cafe Selecao do Mario",
    "totalEntidades": 36,
    "totalRegistros": 1500
  },
  "dados": {
    "Cafe": [...],
    "Cliente": [...],
    "ReservaCafe": [...],
    ...
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}