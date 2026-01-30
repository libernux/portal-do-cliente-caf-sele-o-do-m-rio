import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Key
} from "lucide-react";
import { toast } from "sonner";

export default function ApiConsultaCard() {
  const [showExamples, setShowExamples] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // URL base da API - obtida do ambiente Base44
  const appId = window.location.hostname.split('.')[0];
  const apiBaseUrl = `https://app.base44.com/api/v1/apps/${appId}/functions/apiConsultaDados`;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const exemplos = [
    {
      titulo: "Listar Entidades",
      descricao: "Lista todas as entidades e documentação",
      body: JSON.stringify({ acao: "listar_entidades" }, null, 2)
    },
    {
      titulo: "Consultar com Paginação",
      descricao: "Consulta registros com filtros e paginação",
      body: JSON.stringify({ 
        acao: "consultar", 
        entidade: "Cafe", 
        pagina: 1, 
        por_pagina: 50,
        ordenar: "-created_date",
        filtros: { status: "Ativo" },
        campos: ["nome", "forma", "localizacao"]
      }, null, 2)
    },
    {
      titulo: "Consultar por Data",
      descricao: "Filtra registros por período",
      body: JSON.stringify({ 
        acao: "consultar", 
        entidade: "Problema", 
        data_inicio: "2024-01-01",
        data_fim: "2024-12-31",
        campo_data: "created_date"
      }, null, 2)
    },
    {
      titulo: "Detalhe de Registro",
      descricao: "Busca detalhes completos de um item",
      body: JSON.stringify({ 
        acao: "detalhe", 
        entidade: "Cafe", 
        id: "ID_DO_REGISTRO" 
      }, null, 2)
    },
    {
      titulo: "Exportar Paginado",
      descricao: "Exporta dados com paginação",
      body: JSON.stringify({ 
        acao: "exportar_completo",
        pagina: 1,
        por_pagina: 1000,
        entidades: ["Cafe", "Cliente"]
      }, null, 2)
    },
    {
      titulo: "Busca Otimizada",
      descricao: "Busca retornando apenas IDs e resumos",
      body: JSON.stringify({ 
        acao: "buscar", 
        termo: "exemplo",
        limite: 20
      }, null, 2)
    },
    {
      titulo: "Estatísticas",
      descricao: "Retorna contagem de registros",
      body: JSON.stringify({ acao: "estatisticas" }, null, 2)
    }
  ];

  const curlExample = `curl -X POST "${apiBaseUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '{"acao": "listar_entidades"}'`;

  return (
    <Card className="border-[#E5DCC8]">
      <CardHeader className="border-b border-[#E5DCC8] bg-gradient-to-r from-purple-500/10 to-transparent">
        <CardTitle className="text-[#6B4423] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            API de Consulta Externa
          </div>
          <Badge className="bg-purple-100 text-purple-700">REST API</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* URL da API */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#6B4423] flex items-center gap-2">
            <Code className="w-4 h-4" />
            URL da API
          </label>
          <div className="flex gap-2">
            <Input
              value={apiBaseUrl}
              readOnly
              className="font-mono text-sm bg-gray-50"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(apiBaseUrl, 'url')}
            >
              {copiedField === 'url' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Informação de Autenticação */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Autenticação Necessária</p>
              <p className="text-amber-700 text-xs mt-1">
                A API requer autenticação de administrador. Use o token de sessão do usuário logado 
                ou configure uma chave de API através do sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Botão para expandir exemplos */}
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowExamples(!showExamples)}
        >
          <span className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Ver Exemplos de Uso
          </span>
          {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Exemplos */}
        {showExamples && (
          <div className="space-y-4 pt-2">
            {/* Exemplo cURL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#6B4423]">Exemplo cURL</label>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                  {curlExample}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 bg-gray-800 hover:bg-gray-700"
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                >
                  {copiedField === 'curl' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </Button>
              </div>
            </div>

            {/* Ações disponíveis */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#6B4423]">Ações Disponíveis</label>
              {exemplos.map((exemplo, idx) => (
                <div key={idx} className="border border-[#E5DCC8] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-[#6B4423]">{exemplo.titulo}</p>
                      <p className="text-xs text-[#8B7355]">{exemplo.descricao}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(exemplo.body, `exemplo-${idx}`)}
                    >
                      {copiedField === `exemplo-${idx}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {exemplo.body}
                  </pre>
                </div>
              ))}
            </div>

            {/* Link para documentação */}
            <div className="pt-2 border-t border-[#E5DCC8]">
              <p className="text-xs text-[#8B7355]">
                Acesse a função no painel Base44 para obter a URL completa e testar a API diretamente.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}