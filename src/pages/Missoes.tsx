
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, Users, Sparkles, Gift, Clock, CheckCircle, Star } from 'lucide-react';
import { useMissoes } from '@/hooks/useMissoes';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';

const MissionCard: React.FC<{ missao: any }> = ({ missao }) => {
  const { coletarRecompensa } = useMissoes();
  
  const getIconByCategory = (categoria: string) => {
    switch (categoria) {
      case 'perfil': return Star;
      case 'publicacao': return Target;
      case 'venda': return Gift;
      case 'compra': return Sparkles;
      case 'indicacao': return Users;
      default: return Trophy;
    }
  };

  const Icon = getIconByCategory(missao.categoria);
  
  const getStatusColor = () => {
    switch (missao.status) {
      case 'completa': return 'bg-green-500';
      case 'coletada': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  const progressPercentual = Math.round((missao.progresso_atual / missao.progresso_necessario) * 100);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            missao.status === 'completa' ? 'bg-green-100' : 
            missao.status === 'coletada' ? 'bg-gray-100' : 'bg-blue-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              missao.status === 'completa' ? 'text-green-600' : 
              missao.status === 'coletada' ? 'text-gray-500' : 'text-blue-600'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">{missao.titulo}</h3>
            <p className="text-xs text-gray-500 mt-1">{missao.descricao}</p>
            
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">
                  {missao.progresso_atual}/{missao.progresso_necessario}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {progressPercentual}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${getStatusColor()}`}
                  style={{ width: `${Math.min(progressPercentual, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="secondary" className="text-xs mb-2">
              +{missao.recompensa_girinhas}
            </Badge>
            
            {missao.status === 'completa' && (
              <Button
                size="sm"
                onClick={() => coletarRecompensa.mutate(missao.id)}
                disabled={coletarRecompensa.isPending}
                className="w-full mt-1 h-8 text-xs"
              >
                {coletarRecompensa.isPending ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Gift className="w-3 h-3 mr-1" />
                    Coletar
                  </>
                )}
              </Button>
            )}
            
            {missao.status === 'coletada' && (
              <div className="flex items-center text-xs text-gray-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Coletada
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Missoes: React.FC = () => {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const { 
    missoes, 
    isLoading, 
    progressoTotal, 
    missoesCompletas,
    totalGirinhasDisponiveis,
    verificarProgresso 
  } = useMissoes();

  const missoesFiltradas = filtroTipo === 'todos' 
    ? missoes 
    : missoes.filter(m => m.tipo_missao === filtroTipo);

  const missoesPorTipo = {
    basic: missoes.filter(m => m.tipo_missao === 'basic'),
    engagement: missoes.filter(m => m.tipo_missao === 'engagement'),
    social: missoes.filter(m => m.tipo_missao === 'social')
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header com progresso total */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-purple-500" />
            Missões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressoTotal && (
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso Global</span>
                <span className="text-sm font-bold text-purple-600">
                  {progressoTotal.atual}/{progressoTotal.maximo} Girinhas
                </span>
              </div>
              <Progress value={progressoTotal.percentual} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {progressoTotal.percentual}% do limite mensal alcançado
              </p>
            </div>
          )}

          {missoesCompletas > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 Você tem <strong>{missoesCompletas} missões</strong> prontas para coletar! 
                Total: <strong>{totalGirinhasDisponiveis} Girinhas</strong> esperando.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => verificarProgresso.mutate()}
            disabled={verificarProgresso.isPending}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {verificarProgresso.isPending ? (
              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Atualizar Progresso
          </Button>
        </CardContent>
      </Card>

      {/* Filtros por categoria */}
      <Tabs value={filtroTipo} onValueChange={setFiltroTipo} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todas</TabsTrigger>
          <TabsTrigger value="basic">Básicas</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="social">Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-3">
          {missoesFiltradas.map(missao => (
            <MissionCard key={missao.id} missao={missao} />
          ))}
        </TabsContent>

        <TabsContent value="basic" className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-blue-900 text-sm">🎯 Missões Básicas</h3>
            <p className="text-xs text-blue-700">Primeiros passos na plataforma</p>
          </div>
          {missoesPorTipo.basic.map(missao => (
            <MissionCard key={missao.id} missao={missao} />
          ))}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-purple-900 text-sm">🚀 Missões de Engajamento</h3>
            <p className="text-xs text-purple-700">Atividades avançadas na comunidade</p>
          </div>
          {missoesPorTipo.engagement.map(missao => (
            <MissionCard key={missao.id} missao={missao} />
          ))}
        </TabsContent>

        <TabsContent value="social" className="space-y-3">
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-green-900 text-sm">👥 Missões Sociais</h3>
            <p className="text-xs text-green-700">Construa sua rede na comunidade</p>
          </div>
          {missoesPorTipo.social.map(missao => (
            <MissionCard key={missao.id} missao={missao} />
          ))}
        </TabsContent>
      </Tabs>

      {missoesFiltradas.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma missão disponível</h3>
          <p className="text-gray-500">Todas as missões desta categoria foram completadas!</p>
        </div>
      )}
    </div>
  );
};

export default () => (
  <AuthGuard>
    <Missoes />
  </AuthGuard>
);
