
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

const PublicarItem = () => {
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit
  } = usePublicarItemFormV2();

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Publicar Novo Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <SimpleItemForm
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  errors={errors}
                />

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
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
