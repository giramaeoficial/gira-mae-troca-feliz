
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, Shield, Clock } from "lucide-react";
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CheckoutMercadoPago = () => {
  const [quantidade, setQuantidade] = useState<number>(50);
  const { criarPreferencia, isProcessing } = useMercadoPago();
  const { user } = useAuth();
  const { toast } = useToast();

  const valorTotal = quantidade * 1.00; // R$ 1,00 por Girinha

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value) || 0;
    setQuantidade(Math.max(10, Math.min(999000, valor)));
  };

  const handleComprar = async () => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return;
    }

    if (quantidade < 10 || quantidade > 999000) {
      toast({
        title: "Quantidade Inválida",
        description: "A quantidade deve ser entre 10 e 999.000 Girinhas.",
        variant: "destructive",
      });
      return;
    }

    await criarPreferencia(quantidade);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-primary" />
            Comprar Girinhas
          </CardTitle>
          <p className="text-muted-foreground">
            Compre Girinhas de forma segura com Mercado Pago
          </p>
        </CardHeader>
      </Card>

      {/* Formulário de Compra */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantidade Desejada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
            <Input
              id="quantidade"
              type="number"
              min="10"
              max="999000"
              value={quantidade}
              onChange={handleQuantidadeChange}
              placeholder="Digite a quantidade (mín: 10)"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Mínimo: 10 Girinhas | Máximo: 999.000 Girinhas
            </p>
          </div>

          <Separator />

          {/* Resumo */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Quantidade:</span>
              <span className="font-bold text-lg">{quantidade.toLocaleString()} Girinhas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Preço unitário:</span>
              <span>R$ 1,00</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Botão de Compra */}
          <Button
            onClick={handleComprar}
            disabled={isProcessing || quantidade < 10}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              "Redirecionando para pagamento..."
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pagar com Mercado Pago
              </>
            )}
          </Button>

          {/* Informações de Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Pagamento 100% seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Crédito imediato</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Aceitamos cartão de crédito, débito, PIX e boleto</p>
            <p>• Suas Girinhas são creditadas automaticamente após aprovação</p>
            <p>• Válidas por 12 meses a partir da compra</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutMercadoPago;
