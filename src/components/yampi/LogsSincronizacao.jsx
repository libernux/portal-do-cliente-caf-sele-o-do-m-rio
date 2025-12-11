import React, { useState, useEffect } from "react";
import { LogSincronizacaoYampi } from "@/entities/LogSincronizacaoYampi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LogsSincronizacao() {
  const [logs, setLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const logsData = await LogSincronizacaoYampi.list("-created_date", 50);
    setLogs(logsData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sucesso':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Erro':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Parcial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sucesso':
        return 'bg-green-100 text-green-800';
      case 'Erro':
        return 'bg-red-100 text-red-800';
      case 'Parcial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#6B4423]">
          Histórico de Sincronizações
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadLogs}
          className="border-[#6B4423] text-[#6B4423]"
        >
          Atualizar
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card className="border-[#E5DCC8]">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-[#8B7355] mx-auto mb-4 opacity-30" />
            <p className="text-[#8B7355]">Nenhuma sincronização registrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="border-[#E5DCC8]">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#6B4423]">{log.tipo}</h4>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          {log.sincronizacao_automatica && (
                            <Badge variant="outline" className="text-xs">
                              Automático
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#8B7355]">
                          {format(new Date(log.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    {log.erros_detalhados?.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-sm">{log.mensagem}</p>

                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-[#8B7355]">Total</p>
                      <p className="font-semibold">{log.total_itens || 0}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-[#8B7355]">Novos</p>
                      <p className="font-semibold text-green-700">{log.itens_novos || 0}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-[#8B7355]">Atualizados</p>
                      <p className="font-semibold text-blue-700">{log.itens_atualizados || 0}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-[#8B7355]">Erros</p>
                      <p className="font-semibold text-red-700">{log.itens_erro || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-[#8B7355]">Duração</p>
                      <p className="font-semibold">{log.duracao_segundos || 0}s</p>
                    </div>
                  </div>

                  {expandedLog === log.id && log.erros_detalhados?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        Detalhes dos Erros:
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {log.erros_detalhados.map((erro, idx) => (
                          <div key={idx} className="text-xs bg-white p-2 rounded">
                            <p className="font-semibold text-red-700">
                              Item: {erro.item_id}
                            </p>
                            <p className="text-red-600">{erro.mensagem_erro}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}