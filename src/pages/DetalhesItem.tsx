
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { analytics } from '@/lib/analytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';
import FriendlyError from '@/components/error/FriendlyError';
import { useReservas } from '@/hooks/useReservas';
import { useBonificacoes } from '@/hooks/useBonificacoes';

interface ItemFeed {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  estado_conservacao: string;
  fotos: string[];
  valor_girinhas: number;
  status: string;
  publicado_por: string;
  created_at: string;
  updated_at: string;
  publicado_por_profile: {
    nome: string;
    avatar_url?: string;
    reputacao?: number;
    whatsapp?: string;
  };
  vendedor_bairro?: string;
  vendedor_cidade?: string;
  vendedor_estado?: string;
  vendedor_cep?: string;
  genero?: string;
  tamanho_categoria?: string;
  tamanho_valor?: string;
}

const DetalhesItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { criarReserva, cancelarReserva } = useReservas();
  const { processarBonusTrocaConcluida } = useBonificacoes();
  const [denunciaDialogOpen, setDenunciaDialogOpen] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do item não fornecido');

      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(nome, avatar_url, telefone, cidade, estado, bairro, reputacao)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const item = useMemo(() => {
    if (!data) return null;
    
    return {
      id: data.id || '',
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      categoria: data.categoria || '',
      subcategoria: data.subcategoria || '',
      genero: data.genero || '',
      tamanho_categoria: data.tamanho_categoria || '',
      tamanho_valor: data.tamanho_valor || '',
      estado_conservacao: data.estado_conservacao || '',
      fotos: data.fotos || [],
      valor_girinhas: data.valor_girinhas || 0,
      status: data.status || '',
      publicado_por: data.publicado_por || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      publicado_por_profile: {
        nome: data.profiles?.nome || '',
        avatar_url: data.profiles?.avatar_url || '',
        reputacao: data.profiles?.reputacao || 0,
        whatsapp: data.profiles?.telefone || ''
      },
      vendedor_bairro: data.profiles?.bairro || '',
      vendedor_cidade: data.profiles?.cidade || '',
      vendedor_estado: data.profiles?.estado || '',
      vendedor_cep: '',
    };
  }, [data]);

  // ✅ ANALYTICS: Visualização do item
  useEffect(() => {
    if (item) {
      analytics.items.view(
        item.id,
        item.titulo,
        item.categoria,
        item.valor_girinhas
      );
    }
  }, [item]);

  const handleReservarItem = async () => {
    if (!id || !item) return;

    // ✅ ANALYTICS: Reserva iniciada
    analytics.items.reserve(item.id, item.valor_girinhas);

    try {
      await criarReserva(id);
      
      // ✅ ANALYTICS: Troca completa (bloqueio de Girinhas)
      analytics.items.exchangeComplete(
        id,
        item.id,
        item.valor_girinhas
      );
      
      toast({
        title: "Item reservado!",
        description: "O vendedor foi notificado da sua reserva.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao reservar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelarReserva = async () => {
    if (!id) return;

    try {
      await cancelarReserva(id);
      toast({
        title: "Reserva cancelada",
        description: "A reserva deste item foi cancelada.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar reserva",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReportarItem = async () => {
    if (!id || !motivoDenuncia.trim()) return;

    try {
      toast({
        title: "Obrigado pelo feedback",
        description: "Sua denúncia foi registrada e será analisada.",
      });
      setDenunciaDialogOpen(false);
      setMotivoDenuncia('');
    } catch (error: any) {
      toast({
        title: "Erro ao reportar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTrocarMensagens = async () => {
    if (!item?.publicado_por_profile?.whatsapp) {
      toast({
        title: "Vendedor sem WhatsApp",
        description: "Este vendedor não possui WhatsApp cadastrado.",
        variant: "destructive",
      });
      return;
    }

    const numeroWhatsApp = item.publicado_por_profile.whatsapp.replace(/\D/g, '');
    const mensagemPadrao = `Olá! Tenho interesse no item "${item.titulo}" que você está doando no GiraMãe.`;
    const linkWhatsApp = `https://wa.me/55${numeroWhatsApp}?text=${encodeURIComponent(mensagemPadrao)}`;
    window.open(linkWhatsApp, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <div>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <FriendlyError 
      title="Erro ao carregar item"
      message="Não foi possível carregar os detalhes do item. Tente novamente mais tarde."
      onRetry={() => window.location.reload()}
    />;
  }

  if (!item) {
    return <FriendlyError 
      title="Item não encontrado"
      message="O item que você está procurando não foi encontrado ou não está mais disponível."
    />;
  }

  const isOwner = user?.id === item.publicado_por;
  const isItemAvailable = item.status === 'disponivel';
  const isItemReserved = item.status === 'reservado';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <Card className="bg-white shadow-md rounded-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">{item.titulo}</CardTitle>
            <div className="flex items-center space-x-2">
              {isItemAvailable && !isOwner && (
                <Button variant="outline" size="sm">
                  Tenho Interesse
                </Button>
              )}
              {isItemAvailable && isOwner && (
                <Badge variant="secondary">Disponível</Badge>
              )}
              {isItemReserved && (
                <Badge variant="destructive">Reservado</Badge>
              )}
              <Dialog open={denunciaDialogOpen} onOpenChange={setDenunciaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Reportar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Reportar Item</DialogTitle>
                    <DialogDescription>
                      Por favor, descreva o motivo da denúncia.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Textarea 
                      placeholder="Descreva o motivo da denúncia..."
                      value={motivoDenuncia} 
                      onChange={(e) => setMotivoDenuncia(e.target.value)} 
                    />
                  </div>
                  <Button onClick={handleReportarItem}>Reportar</Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <ScrollArea className="h-[400px] w-full">
              {item.fotos && item.fotos.length > 0 ? (
                <div className="space-y-4">
                  {item.fotos.map((foto, index) => (
                    <div key={index} className="flex justify-center">
                      <img 
                        src={foto} 
                        alt={`Foto do item ${index + 1}`} 
                        className="max-h-64 object-contain mx-auto rounded-lg" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Nenhuma foto disponível</p>
                </div>
              )}
              <div className="mt-4">
                <p className="text-gray-600">{item.descricao}</p>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={item.publicado_por_profile?.avatar_url || ''} alt={item.publicado_por_profile?.nome} />
                <AvatarFallback>{item.publicado_por_profile?.nome?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.publicado_por_profile?.nome}</span>
                <span className="text-xs text-gray-500">
                  Membro há {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">{item.categoria}</span>
              </div>
              <span className="text-lg font-bold">{item.valor_girinhas} Girinhas</span>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Detalhes da Doação</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <strong>Categoria:</strong> {item.categoria}
                  </p>
                  {item.subcategoria && (
                    <p className="text-gray-600">
                      <strong>Subcategoria:</strong> {item.subcategoria}
                    </p>
                  )}
                  {item.genero && (
                    <p className="text-gray-600">
                      <strong>Gênero:</strong> {item.genero}
                    </p>
                  )}
                  {item.tamanho_categoria && item.tamanho_valor && (
                    <p className="text-gray-600">
                      <strong>Tamanho:</strong> {item.tamanho_valor} ({item.tamanho_categoria})
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Estado de Conservação:</strong> {item.estado_conservacao}
                  </p>
                  <p className="text-gray-600">
                    <strong>Publicado em:</strong> {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Ações</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex flex-col space-y-2">
                {!isOwner && isItemAvailable && (
                  <>
                    <Button onClick={handleTrocarMensagens}>
                      Trocar Mensagens
                    </Button>
                    <Button onClick={handleReservarItem}>
                      Reservar Item
                    </Button>
                  </>
                )}
                {!isOwner && isItemReserved && (
                  <Button variant="destructive" onClick={handleCancelarReserva}>
                    Cancelar Reserva
                  </Button>
                )}
                {isOwner && isItemAvailable && (
                  <Button variant="secondary" disabled>
                    Aguardando Interessados
                  </Button>
                )}
                {isOwner && isItemReserved && (
                  <Button onClick={async () => {
                    if (!id) return;

                    try {
                      await supabase
                        .from('itens')
                        .update({ status: 'trocado' })
                        .eq('id', id);

                      await processarBonusTrocaConcluida();

                      toast({
                        title: "Troca Confirmada!",
                        description: "O item foi marcado como trocado.",
                      });
                      refetch();
                    } catch (error: any) {
                      toast({
                        title: "Erro ao confirmar troca",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}>
                    Confirmar Troca
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {item.vendedor_bairro && item.vendedor_cidade && (
          <Card className="mt-6 bg-white shadow-md rounded-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Localização</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm text-gray-500">
                {item.vendedor_bairro}, {item.vendedor_cidade} - {item.vendedor_estado}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DetalhesItem;
