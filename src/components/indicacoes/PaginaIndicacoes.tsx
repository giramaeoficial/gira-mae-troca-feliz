
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { Users, Gift, Share2, Trophy, Mail, Check, Clock } from 'lucide-react';

const PaginaIndicacoes = () => {
  const { 
    indicacoes, 
    indicados, 
    loading, 
    registrarIndicacao, 
    compartilharIndicacao 
  } = useIndicacoes();
  
  const [emailIndicacao, setEmailIndicacao] = useState('');
  const [enviandoIndicacao, setEnviandoIndicacao] = useState(false);

  const handleIndicar = async () => {
    if (!emailIndicacao.trim()) return;
    
    setEnviandoIndicacao(true);
    const sucesso = await registrarIndicacao(emailIndicacao);
    if (sucesso) {
      setEmailIndicacao('');
    }
    setEnviandoIndicacao(false);
  };

  const calcularBonusTotal = (indicacao: any) => {
    let total = 0;
    if (indicacao.bonus_cadastro_pago) total += 5;
    if (indicacao.bonus_primeiro_item_pago) total += 5;
    if (indicacao.bonus_primeira_compra_pago) total += 5;
    return total;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando indicações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">💫 Sistema de Indicações</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Convide suas amigas para o GiraMãe e ganhe Girinhas toda vez que elas se engajarem!
        </p>
      </div>

      {/* Card de Compartilhamento */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Compartilhar Indicação
          </CardTitle>
          <CardDescription>
            Compartilhe o GiraMãe e ganhe até 15 Girinhas por amiga indicada!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">🎁 Como funciona:</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-500" />
                <span><strong>+5 Girinhas</strong> quando sua amiga se cadastra</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-500" />
                <span><strong>+5 Girinhas</strong> quando ela publica o primeiro item</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-500" />
                <span><strong>+5 Girinhas</strong> quando ela faz a primeira compra</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={compartilharIndicacao}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar Link de Indicação
          </Button>
        </CardContent>
      </Card>

      {/* Card de Indicação Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Indicar por Email
          </CardTitle>
          <CardDescription>
            Se sua amiga já tem conta, indique ela diretamente pelo email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email da amiga</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={emailIndicacao}
              onChange={(e) => setEmailIndicacao(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleIndicar}
            disabled={!emailIndicacao.trim() || enviandoIndicacao}
            className="w-full"
          >
            {enviandoIndicacao ? 'Registrando...' : 'Registrar Indicação'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Minhas Indicações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Minhas Indicações ({indicacoes.length})
            </CardTitle>
            <CardDescription>
              Amigas que você indicou para o GiraMãe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicacoes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Você ainda não fez nenhuma indicação
              </p>
            ) : (
              indicacoes.map((indicacao) => (
                <div key={indicacao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Nome não disponível'}</p>
                      <p className="text-sm text-gray-500">{indicacao.profiles?.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      +{calcularBonusTotal(indicacao)} Girinhas
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${indicacao.bonus_cadastro_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_cadastro_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      Cadastro
                    </div>
                    <div className={`flex items-center gap-1 ${indicacao.bonus_primeiro_item_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_primeiro_item_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      1º Item
                    </div>
                    <div className={`flex items-center gap-1 ${indicacao.bonus_primeira_compra_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_primeira_compra_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      1ª Compra
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quem me indicou */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold-600" />
              Quem me indicou ({indicados.length})
            </CardTitle>
            <CardDescription>
              Mães que te trouxeram para o GiraMãe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicados.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Você chegou aqui por conta própria! 🌟
              </p>
            ) : (
              indicados.map((indicacao) => (
                <div key={indicacao.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Nome não disponível'}</p>
                      <p className="text-sm text-gray-500">Te indicou em {new Date(indicacao.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">
                      Indicadora
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaginaIndicacoes;
