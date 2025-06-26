
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload } from "lucide-react";
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import FormProgress from '@/components/ui/form-progress';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { BasicInfoForm } from '@/components/forms/BasicInfoForm';
import { LocationForm } from '@/components/forms/LocationForm';
import { DeliveryOptionsForm } from '@/components/forms/DeliveryOptionsForm';
import { ImageUploadForm } from '@/components/forms/ImageUploadForm';

const PublicarItem = () => {
  const { configuracoes } = useConfigCategorias();
  const { filhos } = useFilhosPorEscola();
  const {
    formData,
    updateFormData,
    errors,
    progress,
    loading,
    handleSubmit,
    calculateProgress,
    userAddress
  } = usePublicarItemFormV2();

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  const handleImageUpload = (files: File[]) => {
    updateFormData({ imagens: files });
  };

  const handleEnderecoTipoChange = (tipo: 'meu' | 'escola' | 'outro') => {
    updateFormData({ 
      endereco_tipo: tipo,
      escola_selecionada: null,
      endereco_personalizado: {}
    });
  };

  const handleEscolaSelect = (escola: any) => {
    updateFormData({ escola_selecionada: escola });
  };

  const handleEnderecoPersonalizadoChange = (endereco: any) => {
    updateFormData({ endereco_personalizado: endereco });
  };

  const handleSwitchChange = (checked: boolean) => {
    updateFormData({ aceita_entrega: checked });
  };

  const handleRaioChange = (value: number[]) => {
    updateFormData({ raio_entrega_km: value[0] });
  };

  const handleInstrucoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ instrucoes_retirada: e.target.value });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Publicar Novo Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {progress > 0 && (
                  <FormProgress steps={calculateProgress()} />
                )}

                {/* Informações Básicas */}
                <BasicInfoForm
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  errors={errors}
                  configuracoes={configuracoes}
                />

                <Separator />

                {/* Local de Retirada */}
                <LocationForm
                  enderecoTipo={formData.endereco_tipo}
                  escolaSelecionada={formData.escola_selecionada}
                  userAddress={userAddress}
                  filhos={filhos || []}
                  onEnderecoTipoChange={handleEnderecoTipoChange}
                  onEscolaSelect={handleEscolaSelect}
                  onEnderecoPersonalizadoChange={handleEnderecoPersonalizadoChange}
                  error={errors.endereco}
                />

                <Separator />

                {/* Opções de Entrega */}
                <DeliveryOptionsForm
                  aceitaEntrega={formData.aceita_entrega}
                  raioEntregaKm={formData.raio_entrega_km}
                  instrucoesRetirada={formData.instrucoes_retirada}
                  onAceitaEntregaChange={handleSwitchChange}
                  onRaioChange={handleRaioChange}
                  onInstrucoesChange={handleInstrucoesChange}
                  raioError={errors.raio_entrega}
                />

                <Separator />

                {/* Upload de Imagens */}
                <ImageUploadForm
                  imagens={formData.imagens}
                  onImageUpload={handleImageUpload}
                  error={errors.imagens}
                />

                <Button disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publicar Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default PublicarItem;
