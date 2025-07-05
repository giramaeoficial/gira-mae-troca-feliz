import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Users, Recycle, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from '@/components/auth/AuthGuard';
import QuickNav from '@/components/shared/QuickNav';
import { useItensDisponiveis } from '@/hooks/useItensOptimized';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import PactoEntradaGuard from '@/components/onboarding/PactoEntradaGuard';

const FeedOptimized = () => {
  const { user } = useAuth();
  const { data: itens, isLoading, isError, error } = useItensDisponiveis();

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6 pb-32 md:pb-8">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Carregando Itens...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
          <QuickNav />
        </div>
      </AuthGuard>
    );
  }

  if (isError) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6 pb-32 md:pb-8">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Erro ao Carregar Itens</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Ocorreu um erro ao carregar os itens. Por favor, tente novamente mais tarde.</p>
                {error && (
                  <pre className="mt-4 p-2 bg-gray-100 rounded-md overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </main>
          <QuickNav />
        </div>
      </AuthGuard>
    );
  }

  return (
    <PactoEntradaGuard requiredForAccess={true}>
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6 pb-32 md:pb-8">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Itens Disponíveis</CardTitle>
                <CardDescription>Confira os itens que outras mães estão trocando.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border">
                  <div className="space-y-4">
                    {itens && itens.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-md transition-colors">
                        <Avatar>
                          <AvatarImage src={item.publicado_por_profile?.avatar_url || ""} />
                          <AvatarFallback>{item.publicado_por_profile?.nome?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{item.titulo}</p>
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                          <p className="text-sm text-muted-foreground">Valor: {item.valor_girinhas} Girinhas</p>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <Button asChild variant="link">
                          <Link to={`/item/${item.id}`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </main>
          <QuickNav />
        </div>
      </AuthGuard>
    </PactoEntradaGuard>
  );
};

export default FeedOptimized;
