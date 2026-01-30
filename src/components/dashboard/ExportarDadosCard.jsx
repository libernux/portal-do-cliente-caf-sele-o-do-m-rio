import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileJson, 
  Loader2,
  CheckCircle,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const entidades = [
  { name: "Cafe", label: "Cafés" },
  { name: "Caixa", label: "Caixas" },
  { name: "Cliente", label: "Clientes" },
  { name: "Problema", label: "Problemas" },
  { name: "Agendamento", label: "Agendamentos" },
  { name: "Tarefa", label: "Tarefas" },
  { name: "ReservaCafe", label: "Reservas" },
  { name: "SolicitacaoEvento", label: "Solicitações Evento" },
  { name: "SolicitacaoPatrocinio", label: "Patrocínios" },
  { name: "PedidoYampi", label: "Pedidos Yampi" },
  { name: "ProdutoYampi", label: "Produtos Yampi" },
  { name: "ClienteYampi", label: "Clientes Yampi" },
  { name: "AssinanteClube", label: "Assinantes Clube" },
  { name: "EntregaClube", label: "Entregas Clube" },
  { name: "ContratoRPA", label: "Contratos RPA" },
  { name: "DemandaExterna", label: "Demandas Externas" },
  { name: "EmpresaPermuta", label: "Empresas Permuta" },
  { name: "SubmissaoProdutor", label: "Submissões Produtor" },
  { name: "InfoCafe", label: "Info Cafés" },
];

export default function ExportarDadosCard() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEntity, setCurrentEntity] = useState("");

  const exportarTodosDados = async () => {
    setExporting(true);
    setProgress(0);
    
    const dadosExportados = {
      exportado_em: new Date().toISOString(),
      versao: "1.0",
      entidades: {}
    };

    try {
      for (let i = 0; i < entidades.length; i++) {
        const entidade = entidades[i];
        setCurrentEntity(entidade.label);
        setProgress(Math.round(((i + 1) / entidades.length) * 100));

        try {
          const dados = await base44.entities[entidade.name].list();
          dadosExportados.entidades[entidade.name] = {
            total: dados.length,
            registros: dados
          };
        } catch (err) {
          console.warn(`Erro ao exportar ${entidade.name}:`, err);
          dadosExportados.entidades[entidade.name] = {
            total: 0,
            registros: [],
            erro: err.message
          };
        }
      }

      // Criar arquivo JSON e fazer download
      const blob = new Blob([JSON.stringify(dadosExportados, null, 2)], { 
        type: "application/json" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_cafe_selecao_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exportação concluída com sucesso!");
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast.error("Erro ao exportar dados");
    } finally {
      setExporting(false);
      setProgress(0);
      setCurrentEntity("");
    }
  };

  return (
    <Card className="border-[#E5DCC8]">
      <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-green-500/10 to-transparent pb-3">
        <CardTitle className="text-[#6B4423] flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Exportar Dados
          </div>
          <Badge className="bg-green-100 text-green-700">Backup</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-[#8B7355]">
          Exporte todos os dados do sistema em formato JSON para backup ou análise externa.
        </p>

        {exporting ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#6B4423]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando: {currentEntity}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-[#8B7355] text-center">{progress}%</p>
          </div>
        ) : (
          <Button
            onClick={exportarTodosDados}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos os Dados (JSON)
          </Button>
        )}

        <div className="text-xs text-[#8B7355] border-t border-[#E5DCC8] pt-3">
          <p className="font-medium mb-1">Inclui {entidades.length} entidades:</p>
          <p className="text-[10px] leading-relaxed">
            {entidades.map(e => e.label).join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}