import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PublicarItem = () => {
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit
  } = usePublicarItemFormV2();

  const [pendingCropsCount, setPendingCropsCount] = useState(0);

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {pendingCropsCount > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                      {pendingCropsCount} foto(s) precisa(m) ser ajustada(s) para o formato quadrado antes de publicar.
                    </AlertDescription>
                  </Alert>
                )}

                <SimpleItemForm
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  errors={errors}
                  onPendingCropsChange={setPendingCropsCount}
                />

                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    disabled={loading || pendingCropsCount > 0} 
                    className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : pendingCropsCount > 0 ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Ajuste as fotos primeiro
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
