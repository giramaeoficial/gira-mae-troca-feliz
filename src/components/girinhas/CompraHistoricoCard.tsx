
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Tables } from '@/integrations/supabase/types';

type CompraGirinhas = Tables<'compras_girinhas'> & {
  pacotes_girinhas?: {
    nome: string;
    valor_girinhas: number;
  } | null;
};

interface CompraHistoricoCardProps {
  compra: CompraGirinhas;
}

const statusMap = {
  pendente: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pendente' },
  aprovado: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Aprovado' },
  cancelado: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Cancelado' }
};

const CompraHistoricoCard = ({ compra }: CompraHistoricoCardProps) => {
  const statusInfo = statusMap[compra.status as keyof typeof statusMap] || statusMap.pendente;
  const Icon = statusInfo.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{compra.pacotes_girinhas?.nome || 'Pacote'}</span>
          <Badge className={`${statusInfo.bg} ${statusInfo.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {statusInfo.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Girinhas recebidas:</span>
            <span className="font-medium">{compra.girinhas_recebidas}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor pago:</span>
            <span className="font-medium">R$ {Number(compra.valor_pago).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Data:</span>
            <span className="text-sm">
              {new Date(compra.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          {compra.payment_id && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ID Pagamento:</span>
              <span className="text-xs font-mono">{compra.payment_id}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompraHistoricoCard;
