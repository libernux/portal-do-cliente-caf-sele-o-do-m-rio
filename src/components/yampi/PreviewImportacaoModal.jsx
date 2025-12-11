import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Package, ShoppingCart, Users, FolderOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PreviewImportacaoModal({ 
  open, 
  onClose, 
  tipo, 
  dados, 
  onConfirm,
  isLoading,
  progresso,
  logsDebug
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showDebug, setShowDebug] = useState(false);

  const totalPages = Math.ceil((dados?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dadosPaginados = dados?.slice(startIndex, endIndex) || [];

  const getIcon = () => {
    switch (tipo) {
      case 'produtos':
        return <Package className="w-6 h-6 text-[#6B4423]" />;
      case 'pedidos':
        return <ShoppingCart className="w-6 h-6 text-blue-600" />;
      case 'clientes':
        return <Users className="w-6 h-6 text-purple-600" />;
      case 'categorias':
        return <FolderOpen className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'produtos':
        return 'Produtos';
      case 'pedidos':
        return 'Pedidos';
      case 'clientes':
        return 'Clientes';
      case 'categorias':
        return 'Categorias';
      default:
        return 'Itens';
    }
  };

  const renderItem = (item) => {
    switch (tipo) {
      case 'produtos':
        const totalSkus = item.skus?.data?.length || 0;
        const totalEstoque = item.skus?.data?.reduce((sum, sku) => sum + (sku.quantity || 0), 0) || 0;
        return (
          <div className="flex items-center gap-3">
            {item.images?.data?.[0]?.url && (
              <img
                src={item.images.data[0].url}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-[#8B7355]">SKU: {item.sku}</p>
              {totalSkus > 1 && (
                <p className="text-xs text-blue-600">{totalSkus} variações</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">R$ {item.prices?.data?.[0]?.price?.toFixed(2)}</p>
              <p className="text-xs text-[#8B7355]">{totalEstoque} un total</p>
            </div>
          </div>
        );
      
      case 'pedidos':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Pedido #{item.number}</p>
              <p className="text-xs text-[#8B7355]">
                {item.customer?.data?.first_name} {item.customer?.data?.last_name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">R$ {item.value?.toFixed(2)}</p>
              <Badge variant={item.paid ? "default" : "secondary"} className="text-xs">
                {item.paid ? "Pago" : "Pendente"}
              </Badge>
            </div>
          </div>
        );
      
      case 'clientes':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {item.first_name} {item.last_name}
              </p>
              <p className="text-xs text-[#8B7355]">{item.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8B7355]">{item.orders_count || 0} pedidos</p>
            </div>
          </div>
        );
      
      case 'categorias':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-[#8B7355]">{item.slug}</p>
            </div>
            <Badge variant={item.active ? "default" : "secondary"} className="text-xs">
              {item.active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        );
      
      default:
        return <p className="text-sm">{JSON.stringify(item)}</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <DialogTitle>Preview de Importação - {getTitulo()}</DialogTitle>
              <p className="text-sm text-[#8B7355] mt-1">
                {dados?.length || 0} {getTitulo().toLowerCase()} encontrados na Yampi
              </p>
            </div>
            {isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs"
              >
                {showDebug ? 'Ocultar' : 'Mostrar'} Debug
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progresso da Importação */}
          {isLoading && progresso && progresso.total > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      <span className="font-semibold text-green-800">
                        Importando... {progresso.current} / {progresso.total}
                      </span>
                    </div>
                    <span className="text-sm text-green-600">
                      {Math.round((progresso.current / progresso.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progresso.current / progresso.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-green-700">{progresso.status}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Logs */}
          {isLoading && showDebug && logsDebug && logsDebug.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-800">Debug Logs</span>
                  <Badge variant="outline">{logsDebug.length} logs</Badge>
                </div>
                <ScrollArea className="h-48 border border-gray-300 rounded p-2 bg-white">
                  <div className="space-y-1 font-mono text-xs">
                    {logsDebug.map((log, idx) => (
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
              </CardContent>
            </Card>
          )}

          {!isLoading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Revise os dados antes de importar</p>
                    <p>
                      Os dados serão sincronizados com seu banco de dados local. 
                      Itens existentes serão atualizados e novos itens serão criados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[400px] border border-[#E5DCC8] rounded-lg p-4">
            <div className="space-y-2">
              {dadosPaginados.map((item, index) => (
                <Card key={item.id || index} className="border-[#E5DCC8]">
                  <CardContent className="p-3">
                    {renderItem(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#8B7355]">
                Mostrando {startIndex + 1}-{Math.min(endIndex, dados.length)} de {dados.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum ? "bg-[#6B4423]" : ""}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="bg-[#6B4423]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Importação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}