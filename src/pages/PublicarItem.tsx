import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';

const PublicarItem = () => {
  const { status: pactoStatus, refetch: refetchPacto } = usePactoEntrada();
  
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit: originalHandleSubmit
  } = usePublicarItemFormV2();

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await originalHandleSubmit(e);
    // Atualizar status do pacto após publicar
    await refetchPacto();
  };

  const getMissaoBanner = () => {
    if (pactoStatus.isCompleto) return null;
    
    return (
      <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">
              Missão: Item {pactoStatus.itensContribuidos + 1} de 2
            </h3>
            <p className="text-sm text-yellow-700">
              {pactoStatus.itensContribuidos === 0 
                ? 'Seu primeiro item da missão "Primeiros Passos"!'
                : 'Último item para completar seu pacto de entrada!'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 pb-32 md:pb-8">
          <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Publicar Novo Item
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {getMissaoBanner()}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <SimpleItemForm
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  errors={errors}
                />

                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg rounded-lg transition-all duration-200"
                  >
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
                </div>
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
