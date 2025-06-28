import React from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Item } from '@/hooks/useItens';

interface ItemCardWithActionsProps {
  item: Item;
}

const ItemCardWithActions: React.FC<ItemCardWithActionsProps> = ({ item }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEditarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/publicar?edit=${item.id}`);
  };

  const handleRemoverClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm("Tem certeza que deseja remover este item?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('itens')
        .update({ status: 'inativo' })
        .eq('id', item.id);

      if (error) {
        console.error("Erro ao remover item:", error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o item. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Item removido com sucesso!",
      });
      
      // Recarregar a página para atualizar a lista de itens
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao remover item:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'disponivel':
        return <Badge variant="secondary">Disponível</Badge>;
      case 'reservado':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Reservado</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Inativo</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'disponivel':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reservado':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'inativo':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200">
      {item.fotos && item.fotos.length > 0 ? (
        <img
          src={item.fotos[0]}
          alt={item.titulo}
          className="w-full h-48 object-cover rounded-t-md"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-t-md flex items-center justify-center">
          <span className="text-gray-400">Sem foto</span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{item.titulo}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-500">
          {item.descricao.substring(0, 80)}...
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-semibold text-primary">
            {item.valor_girinhas} Girinhas
          </span>
          {getStatusBadge()}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {getStatusIcon()}
          Atualizado há {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true, locale: ptBR })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleEditarClick}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleRemoverClick}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ItemCardWithActions;
