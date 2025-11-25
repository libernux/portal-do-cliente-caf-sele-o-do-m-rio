
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Caixa } from "@/entities/Caixa";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function BatchImageUploadModal({ open, onClose, onComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const labelSchema = {
    type: "object",
    properties: {
      destinatario: {
        type: "string",
        description: "Nome completo do destinatário"
      },
      endereco_completo: {
        type: "string",
        description: "Endereço completo de destino com rua, número, bairro"
      },
      cidade: {
        type: "string",
        description: "Cidade de destino"
      },
      estado: {
        type: "string",
        description: "Estado/UF de destino"
      },
      cep: {
        type: "string",
        description: "CEP do destino"
      },
      transportadora: {
        type: "string",
        description: "Nome da transportadora (Correios, Melhor Envio, LATAM Cargo, Jadlog, etc)"
      },
      codigo_rastreamento: {
        type: "string",
        description: "Código de rastreamento se visível"
      },
      peso: {
        type: "string",
        description: "Peso da encomenda se visível"
      },
      remetente: {
        type: "string",
        description: "Nome do remetente se visível"
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/png'
    );
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/png'
    );
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    setIsProcessing(true);
    setResults([]);
    setProcessingProgress(0);

    const processResults = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      try {
        // Upload da imagem
        const { file_url } = await UploadFile({ file });

        // Extrair dados da etiqueta/imagem
        const result = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: labelSchema
        });

        if (result.status === "success" && result.output) {
          const data = result.output;
          
          // Determinar meio de transporte
          const meioTransporte = determineMeioTransporte(data.transportadora);
          
          // Criar registro de caixa com status "Problema" para revisão
          const caixaData = {
            numero_identificacao: `SEM-ETIQUETA-${Date.now()}-${i}`,
            origem: "Venda Nova",
            destino: determineDestino(data.cidade, data.estado),
            status: "Problema",
            responsavel: data.remetente || "A definir",
            tem_etiqueta: false,
            codigo_etiqueta: "",
            meio_transporte: meioTransporte,
            codigo_rastreamento: data.codigo_rastreamento || "",
            conteudo: `Destinatário: ${data.destinatario || "Não identificado"}`,
            observacoes: `⚠️ CAIXA SEM ETIQUETA/NOTA FISCAL - REQUER ATENÇÃO\n\nEndereço: ${data.endereco_completo || ""}\nCidade: ${data.cidade || ""} - ${data.estado || ""}\nCEP: ${data.cep || ""}\nPeso: ${data.peso || "Não informado"}\n\nImagem processada automaticamente.`,
          };

          const novaCaixa = await Caixa.create(caixaData);

          processResults.push({
            fileName: file.name,
            status: "success",
            caixaId: novaCaixa.id,
            destinatario: data.destinatario,
            transportadora: data.transportadora
          });
        } else {
          processResults.push({
            fileName: file.name,
            status: "error",
            error: "Não foi possível extrair dados desta imagem"
          });
        }
      } catch (error) {
        processResults.push({
          fileName: file.name,
          status: "error",
          error: error.message || "Erro ao processar imagem"
        });
      }

      setProcessingProgress(((i + 1) / selectedFiles.length) * 100);
    }

    setResults(processResults);
    setIsProcessing(false);
  };

  const determineMeioTransporte = (transportadora) => {
    if (!transportadora) return "Outro";
    
    const lower = transportadora.toLowerCase();
    if (lower.includes("correio")) return "Correios";
    if (lower.includes("latam") || lower.includes("cargo")) return "Transportadora";
    if (lower.includes("jadlog") || lower.includes("melhor")) return "Transportadora";
    
    return "Transportadora";
  };

  const determineDestino = (cidade, estado) => {
    if (!cidade) return "Vila Velha";
    
    const lower = cidade.toLowerCase();
    if (lower.includes("vila velha") || estado?.toLowerCase() === "es") {
      return "Vila Velha";
    }
    return "Vila Velha"; // Default
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setResults([]);
    setProcessingProgress(0);
    if (results.length > 0 && results.some(r => r.status === "success")) {
      onComplete();
    }
    onClose();
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#6B4423] flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Processar Imagens em Lote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isProcessing && results.length === 0 && (
            <>
              <Alert className="bg-[#D97706]/10 border-[#D97706]">
                <AlertCircle className="w-4 h-4 text-[#D97706]" />
                <AlertDescription className="text-[#6B4423]">
                  <strong>Caixas sem etiqueta ou nota fiscal:</strong> As imagens serão processadas por IA para extrair informações de destinatário, endereço e transportadora. Cada caixa será criada com status "Problema" para revisão manual.
                </AlertDescription>
              </Alert>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                  dragActive 
                    ? "border-[#6B4423] bg-[#F5F1E8]" 
                    : "border-[#E5DCC8] hover:border-[#C9A961]"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="batch-file-input"
                />

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-[#F5F1E8] rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#6B4423]" />
                  </div>
                  <div>
                    <p className="text-[#6B4423] font-medium mb-2">
                      Arraste as imagens aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-[#8B7355]">
                      Selecione múltiplas imagens de uma vez (JPG, PNG)
                    </p>
                    <p className="text-xs text-[#D97706] mt-2">
                      ⚠️ iPhone: Converta fotos HEIC para JPG antes de enviar
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => document.getElementById('batch-file-input').click()}
                    className="bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Imagens
                  </Button>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#6B4423]">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                    </p>
                    <Button
                      onClick={() => setSelectedFiles([])}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Limpar todas
                    </Button>
                  </div>

                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#F5F1E8] p-3 rounded-lg"
                      >
                        <span className="text-sm text-[#6B4423] truncate flex-1">
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 hover:bg-red-100"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={processImages}
                    className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Processar {selectedFiles.length} {selectedFiles.length === 1 ? 'Imagem' : 'Imagens'}
                  </Button>
                </div>
              )}
            </>
          )}

          {isProcessing && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#6B4423] mx-auto animate-spin mb-4" />
                <p className="text-lg font-medium text-[#6B4423] mb-2">
                  Processando imagens...
                </p>
                <p className="text-sm text-[#8B7355]">
                  Extraindo informações com IA
                </p>
              </div>
              <Progress value={processingProgress} className="h-2" />
              <p className="text-center text-sm text-[#8B7355]">
                {Math.round(processingProgress)}% concluído
              </p>
            </div>
          )}

          {results.length > 0 && !isProcessing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2D5016]/10 p-4 rounded-lg border border-[#2D5016]">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-[#2D5016]" />
                    <span className="font-bold text-2xl text-[#6B4423]">{successCount}</span>
                  </div>
                  <p className="text-sm text-[#8B7355]">Processadas com sucesso</p>
                </div>

                {errorCount > 0 && (
                  <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-2xl text-[#6B4423]">{errorCount}</span>
                    </div>
                    <p className="text-sm text-[#8B7355]">Com erro</p>
                  </div>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === "success"
                        ? "bg-[#2D5016]/5 border-[#2D5016]/20"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {result.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-[#2D5016] mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#6B4423] mb-1">
                          {result.fileName}
                        </p>
                        {result.status === "success" ? (
                          <div className="text-xs text-[#8B7355]">
                            <p>✓ Destinatário: {result.destinatario}</p>
                            <p>✓ Transportadora: {result.transportadora}</p>
                            <p>✓ Caixa criada com status "Problema" para revisão</p>
                          </div>
                        ) : (
                          <p className="text-xs text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="bg-[#C9A961]/10 border-[#C9A961]">
                <AlertDescription className="text-[#6B4423]">
                  As caixas foram criadas com status <strong>"Problema"</strong>. Revise-as na aba de filtros e atualize as informações necessárias antes de processar o envio.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleClose}
                className="w-full bg-[#6B4423] hover:bg-[#5A3A1E]"
              >
                Concluir e Ver Caixas
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
