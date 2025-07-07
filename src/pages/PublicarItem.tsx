import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trophy, Ban, ArrowRight, CheckCircle } from "lucide-react";
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PublicarItem = () => {
 const location = useLocation();
 const navigate = useNavigate();
 
 // Detectar se é missão baseado na URL ou parâmetro
 const isMissao = location.pathname.includes('primeiro-item') || location.state?.isMissao;
 const totalItens = isMissao ? 2 : 1;
 const [currentItem, setCurrentItem] = useState(1);

 const {
   formData,
   updateFormData,
   errors,
   loading,
   handleSubmit: originalSubmit
 } = usePublicarItemFormV2(isMissao);

 // Override do submit para missão
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   
   if (isMissao) {
     // Lógica especial para missão
     await originalSubmit(e);
     
     if (currentItem === 1 && !loading) {
       setCurrentItem(2);
       // Reset form for second item
       updateFormData({
         titulo: '',
         descricao: '',
         categoria_id: '',
         subcategoria: '',
         tamanho_valor: '',
         preco: '',
         imagens: []
       });
     }
   } else {
     // Publicação normal
     await originalSubmit(e);
   }
 };

 const handleFieldChange = (field: string, value: any) => {
   updateFormData({ [field]: value });
 };

 return (
   <AuthGuard>
     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col">
       <Header />
       
       <main className="flex-grow container mx-auto px-4 py-6 pb-32 md:pb-8">
         <div className={`mx-auto space-y-4 ${isMissao ? 'max-w-md' : 'max-w-2xl'}`}>
           
           {/* Header da Missão - só aparece se for missão */}
           {isMissao && (
             <>
               <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                 <CardContent className="p-4">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                       <Trophy className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <h1 className="text-lg font-bold text-gray-800">MISSÃO OBRIGATÓRIA #1</h1>
                       <p className="text-sm text-gray-600">Anunciar 2 itens para venda</p>
                     </div>
                   </div>
                   <div className="bg-white/60 rounded-lg p-3">
                     <p className="text-sm font-medium text-gray-800 mb-2">
                       🎯 <strong>A REAL:</strong> Aqui TODOS contribuem! 
                     </p>
                     <p className="text-xs text-gray-700">
                       Você vende por <strong>Girinhas</strong> (1 Girinha = R$ 1,00) e pode comprar de outras mães. 
                       Esta é a ÚNICA missão obrigatória para ter acesso completo.
                     </p>
                   </div>
                 </CardContent>
               </Card>

               {/* Warning Alert */}
               <Alert className="border-red-200 bg-red-50">
                 <Ban className="h-4 w-4 text-red-600" />
                 <AlertDescription className="text-red-700 text-sm">
                   <strong>ATENÇÃO:</strong> Itens falsos ou inadequados resultam em banimento da plataforma. 
                   Aqui não é bagunça!
                 </AlertDescription>
               </Alert>

               {/* Progress */}
               <div className="text-center">
                 <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                   <span className="text-sm font-medium">Item {currentItem} de {totalItens}</span>
                   <div className="flex gap-1">
                     <div className={`w-2 h-2 rounded-full ${currentItem >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                     <div className={`w-2 h-2 rounded-full ${currentItem >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                   </div>
                 </div>
               </div>
             </>
           )}

           {/* Formulário Principal */}
           <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
             <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
               <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                 <Upload className="w-5 h-5" />
                 {isMissao 
                   ? `Anunciar Item ${currentItem} para Venda`
                   : 'Publicar Novo Item'
                 }
               </CardTitle>
             </CardHeader>
             
             <CardContent className="p-6">
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
                         {isMissao ? 'Salvando...' : 'Publicando...'}
                       </>
                     ) : isMissao && currentItem === 1 ? (
                       <>
                         Próximo Item
                         <ArrowRight className="ml-2 h-4 w-4" />
                       </>
                     ) : isMissao && currentItem === 2 ? (
                       <>
                         Finalizar Missão
                         <CheckCircle className="ml-2 h-4 w-4" />
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

           {/* Footer da Missão */}
           {isMissao && (
             <div className="text-center text-xs text-gray-500 space-y-1">
               <p>⚡ Após completar esta missão você ganha 100 Girinhas!</p>
               <p>🔒 Esta é a única missão obrigatória da plataforma</p>
             </div>
           )}
         </div>
       </main>
       
       <QuickNav />
     </div>
   </AuthGuard>
 );
};

export default PublicarItem;
