
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, Users, Sparkles, Gift, Clock, CheckCircle, Star, Zap } from 'lucide-react';
import { useMissoes } from '@/hooks/useMissoes';
import { useMissoesSegmentadas } from '@/hooks/useMissoesSegmentadas';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

const MissionCard: React.FC<{ missao: any; onColetar: (id: string) => void; isCollecting: boolean }> = ({ 
  missao, 
  onColetar, 
  isCollecting 
}) => {
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

  const handleColetar = async () => {
    console.log('🎯 Clique no botão coletar - Missão:', missao.id, missao.titulo);
    await onColetar(missao.id);
  };

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
                onClick={handleColetar}
                disabled={isCollecting}
                className="w-full mt-1 h-8 text-xs"
              >
                {isCollecting ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Coletando...
                  </>
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

const MissaoSegmentadaCard: React.FC<{ missao: any; onColetar: (id: string) => void; onExecutarAcao: (missaoId: string, eventoId: string) => void; isCollecting: boolean }> = ({ 
  missao, 
  onColetar, 
  onExecutarAcao, 
  isCollecting 
}) => {
  const progressPercentual = Math.round((missao.progresso_atual / missao.progresso_necessario) * 100);
  const temEventos = missao.acoes_eventos && missao.acoes_eventos.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm text-gray-900">{missao.titulo}</h3>
              <Badge variant="outline" className="text-xs">Segmentada</Badge>
            </div>
            <p className="text-xs text-gray-500 mb-2">{missao.descricao}</p>
            
            {/* Eventos/Ações personalizadas */}
            {temEventos && (
              <div className="flex flex-wrap gap-1 mb-2">
                {missao.acoes_eventos.slice(0, 2).map((evento: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => onExecutarAcao(missao.id, evento.id)}
                  >
                    {evento.tipo_evento === 'navigate_to_page' && '🔗'}
                    {evento.tipo_evento === 'external_link' && '🌐'}
                    {evento.tipo_evento === 'trigger_notification' && '🔔'}
                    {evento.tipo_evento === 'open_modal' && '📋'}
                    {evento.parametros?.titulo || evento.tipo_evento}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">
                  {missao.progresso_atual}/{missao.progresso_necessario}
                </span>
                <span className="text-xs font-medium text-purple-700">
                  {progressPercentual}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-purple-500 transition-all"
                  style={{ width: `${Math.min(progressPercentual, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="text-xs mb-2 bg-purple-100 text-purple-800">
              +{missao.recompensa_girinhas}
            </Badge>
            
            {missao.status === 'completa' && (
              <Button
                size="sm"
                onClick={() => onColetar(missao.id)}
                disabled={isCollecting}
                className="w-full mt-1 h-8 text-xs bg-purple-600 hover:bg-purple-700"
              >
                {isCollecting ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Coletando...
                  </>
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
    missoes: missoesSimples, 
    isLoading: loadingSimples, 
    progressoTotal, 
    missoesCompletas: missoesCompletasSimples,
    totalGirinhasDisponiveis: girinhasDisponiveisSimples,
    verificarProgresso,
    coletarRecompensa
  } = useMissoes();

  const {
    missoes: missoesSegmentadas,
    isLoading: loadingSegmentadas,
    executarAcao,
    coletarRecompensaSegmentada,
    missoesCompletas: missoesCompletasSegmentadas,
    totalGirinhasDisponiveis: girinhasDisponiveisSegmentadas
  } = useMissoesSegmentadas();

  // Combinar missões
  const todasMissoes = [...missoesSimples, ...missoesSegmentadas];
  const missoesCompletas = missoesCompletasSimples + missoesCompletasSegmentadas;
  const totalGirinhasDisponiveis = girinhasDisponiveisSimples + girinhasDisponiveisSegmentadas;
  const isLoading = loadingSimples || loadingSegmentadas;

  const missoesFiltradas = filtroTipo === 'todos' 
    ? todasMissoes 
    : todasMissoes.filter(m => m.tipo_missao === filtroTipo);

  const missoesPorTipo = {
    basic: todasMissoes.filter(m => m.tipo_missao === 'basic'),
    engagement: todasMissoes.filter(m => m.tipo_missao === 'engagement'),
    social: todasMissoes.filter(m => m.tipo_missao === 'social')
  };

  const handleColetarRecompensa = async (missaoId: string) => {
    // Verificar se é missão segmentada ou simples
    const missaoSegmentada = missoesSegmentadas.find(m => m.id === missaoId);
    
    if (missaoSegmentada) {
      await coletarRecompensaSegmentada.mutateAsync(missaoId);
    } else {
      await coletarRecompensa.mutateAsync(missaoId);
    }
  };

  const handleExecutarAcao = async (missaoId: string, eventoId: string) => {
    await executarAcao.mutateAsync({ missaoId, eventoId });
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
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 space-y-6 pb-32 md:pb-8">
          {/* Header com progresso total */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-purple-500" />
                Missões GiraMãe
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">{missoesSimples.length}</div>
                  <div className="text-xs text-gray-600">Missões Básicas</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600">{missoesSegmentadas.length}</div>
                  <div className="text-xs text-gray-600">Missões Segmentadas</div>
                </div>
              </div>

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
              {missoesFiltradas.map(missao => {
                const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
                
                if (isSegmentada) {
                  return (
                    <MissaoSegmentadaCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      onExecutarAcao={handleExecutarAcao}
                      isCollecting={coletarRecompensaSegmentada.isPending}
                    />
                  );
                } else {
                  return (
                    <MissionCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      isCollecting={coletarRecompensa.isPending}
                    />
                  );
                }
              })}
            </TabsContent>

            <TabsContent value="basic" className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <h3 className="font-medium text-blue-900 text-sm">🎯 Missões Básicas</h3>
                <p className="text-xs text-blue-700">Primeiros passos na plataforma</p>
              </div>
              {missoesPorTipo.basic.map(missao => {
                const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
                
                if (isSegmentada) {
                  return (
                    <MissaoSegmentadaCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      onExecutarAcao={handleExecutarAcao}
                      isCollecting={coletarRecompensaSegmentada.isPending}
                    />
                  );
                } else {
                  return (
                    <MissionCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      isCollecting={coletarRecompensa.isPending}
                    />
                  );
                }
              })}
            </TabsContent>

            <TabsContent value="engagement" className="space-y-3">
              <div className="bg-purple-50 p-3 rounded-lg mb-4">
                <h3 className="font-medium text-purple-900 text-sm">🚀 Missões de Engajamento</h3>
                <p className="text-xs text-purple-700">Atividades avançadas na comunidade</p>
              </div>
              {missoesPorTipo.engagement.map(missao => {
                const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
                
                if (isSegmentada) {
                  return (
                    <MissaoSegmentadaCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      onExecutarAcao={handleExecutarAcao}
                      isCollecting={coletarRecompensaSegmentada.isPending}
                    />
                  );
                } else {
                  return (
                    <MissionCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      isCollecting={coletarRecompensa.isPending}
                    />
                  );
                }
              })}
            </TabsContent>

            <TabsContent value="social" className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <h3 className="font-medium text-green-900 text-sm">👥 Missões Sociais</h3>
                <p className="text-xs text-green-700">Construa sua rede na comunidade</p>
              </div>
              {missoesPorTipo.social.map(missao => {
                const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
                
                if (isSegmentada) {
                  return (
                    <MissaoSegmentadaCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      onExecutarAcao={handleExecutarAcao}
                      isCollecting={coletarRecompensaSegmentada.isPending}
                    />
                  );
                } else {
                  return (
                    <MissionCard 
                      key={missao.id} 
                      missao={missao} 
                      onColetar={handleColetarRecompensa}
                      isCollecting={coletarRecompensa.isPending}
                    />
                  );
                }
              })}
            </TabsContent>
          </Tabs>

          {missoesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma missão disponível</h3>
              <p className="text-gray-500">Todas as missões desta categoria foram completadas!</p>
            </div>
          )}
        </main>
        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default () => (
  <AuthGuard>
    <Missoes />
  </AuthGuard>
);
