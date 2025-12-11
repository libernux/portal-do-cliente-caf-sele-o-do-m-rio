import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package } from "lucide-react";

export default function VariacoesModal({ open, onClose, produto }) {
  if (!produto) return null;

  const variacoes = produto.variacoes || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Variações de {produto.nome}</DialogTitle>
          <p className="text-sm text-[#8B7355]">
            {variacoes.length} variação(ões) disponível(is)
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4">
            {variacoes.length === 0 ? (
              <Card className="border-[#E5DCC8]">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-[#8B7355] mx-auto mb-4 opacity-30" />
                  <p className="text-[#8B7355]">Nenhuma variação encontrada</p>
                </CardContent>
              </Card>
            ) : (
              variacoes.map((variacao, index) => (
                <Card key={variacao.sku_id || index} className="border-[#E5DCC8]">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {variacao.imagem_url && (
                        <img
                          src={variacao.imagem_url}
                          alt={variacao.titulo}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-[#6B4423]">
                              {variacao.titulo || variacao.sku}
                            </h4>
                            <p className="text-xs text-[#8B7355]">
                              SKU: {variacao.sku}
                            </p>
                            {variacao.descricao && (
                              <p className="text-xs text-[#A69483] mt-1">{variacao.descricao}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={variacao.estoque > 0 ? "default" : "secondary"}
                              className={variacao.estoque > 0 ? "bg-green-100 text-green-800" : ""}
                            >
                              {variacao.estoque > 0 ? `${variacao.estoque} un` : "Sem Estoque"}
                            </Badge>
                            {!variacao.ativo && (
                              <Badge variant="outline" className="border-red-300 text-red-600">Inativo</Badge>
                            )}
                          </div>
                        </div>

                        {/* Opções da variação */}
                        {variacao.opcoes && variacao.opcoes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {variacao.opcoes.map((opcao, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline"
                                className="text-xs"
                              >
                                {opcao.nome}: {opcao.valor}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-[#8B7355]">Preço</p>
                              <p className="font-semibold text-[#2D5016]">
                                R$ {variacao.preco?.toFixed(2).replace('.', ',')}
                              </p>
                              {variacao.preco_promocional > 0 && (
                                <p className="text-xs text-red-600">
                                  Promo: R$ {variacao.preco_promocional?.toFixed(2).replace('.', ',')}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Estoque</p>
                              <p className="font-semibold">{variacao.estoque} un</p>
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Peso</p>
                              <p className="font-semibold">{variacao.peso} kg</p>
                            </div>
                            <div>
                              <p className="text-[#8B7355]">Dimensões</p>
                              <p className="font-semibold">
                                {variacao.altura}x{variacao.largura}x{variacao.comprimento} cm
                              </p>
                            </div>
                          </div>

                          {(variacao.referencia || variacao.ean || variacao.ncm || variacao.preco_custo) && (
                            <div className="border-t border-[#E5DCC8] pt-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                {variacao.preco_custo > 0 && (
                                  <div>
                                    <p className="text-[#8B7355]">Custo</p>
                                    <p className="font-semibold">R$ {variacao.preco_custo?.toFixed(2).replace('.', ',')}</p>
                                  </div>
                                )}
                                {variacao.referencia && (
                                  <div>
                                    <p className="text-[#8B7355]">Referência</p>
                                    <p className="font-semibold">{variacao.referencia}</p>
                                  </div>
                                )}
                                {variacao.ean && (
                                  <div>
                                    <p className="text-[#8B7355]">EAN</p>
                                    <p className="font-semibold">{variacao.ean}</p>
                                  </div>
                                )}
                                {variacao.ncm && (
                                  <div>
                                    <p className="text-[#8B7355]">NCM</p>
                                    <p className="font-semibold">{variacao.ncm}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}