import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, Users, Sparkles, Gift, Clock, CheckCircle, Star, Zap, Eye, EyeOff } from 'lucide-react';
import { useMissoes } from '@/hooks/useMissoes';
import { useMissoesSegmentadas } from '@/hooks/useMissoesSegmentadas';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { MissaoInstagramCard } from '@/components/missoes/MissaoInstagramCard';
import { analytics } from '@/lib/analytics';

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
  const isColetada = missao.status === 'coletada';

  const handleColetar = async () => {
    console.log('🎯 Clique no botão coletar - Missão:', missao.id, missao.titulo);
    await onColetar(missao.id);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isColetada ? 'opacity-60' : ''}`}>
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
  const isColetada = missao.status === 'coletada';

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 border-l-purple-500 ${isColetada ? 'opacity-60' : ''}`}>
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
            
            {temEventos && !isColetada && (
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
  const [mostrarColetadas, setMostrarColetadas] = useState(false);

  const { 
    missoes: missoesSimples, 
    isLoading: loadingSimples, 
    coletarRecompensa
  } = useMissoes();

  const {
    missoes: missoesSegmentadas,
    isLoading: loadingSegmentadas,
    executarAcao,
    coletarRecompensaSegmentada
  } = useMissoesSegmentadas();

  // Combinar missões
  const todasMissoes = [...missoesSimples, ...missoesSegmentadas];
  
  // Filtrar missões baseado no toggle
  const missoesFiltradas = mostrarColetadas 
    ? todasMissoes 
    : todasMissoes.filter(m => m.status !== 'coletada');

  // Contar missões
  const totalAtivas = todasMissoes.filter(m => m.status !== 'coletada').length;
  const totalColetadas = todasMissoes.filter(m => m.status === 'coletada').length;

  const isLoading = loadingSimples || loadingSegmentadas;

  const handleColetarRecompensa = async (missaoId: string) => {
    const missaoSegmentada = missoesSegmentadas.find(m => m.id === missaoId);
    const missao = missaoSegmentada || missoesSimples.find(m => m.id === missaoId);
    
    if (missao) {
      // ✅ ANALYTICS: Missão completa
      analytics.missions.complete(
        missao.id,
        missao.tipo_missao || 'regular',
        0 // Tempo não rastreado aqui
      );
    }
    
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
          {/* Header com contador e toggle */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-purple-500" />
                Missões GiraMãe
              </CardTitle>
              
              {/* Contador de missões */}
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">
                    {totalAtivas} {totalAtivas === 1 ? 'Ativa' : 'Ativas'}
                  </span>
                </div>
                {totalColetadas > 0 && (
                  <>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-500">
                        {totalColetadas} {totalColetadas === 1 ? 'Completada' : 'Completadas'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Toggle para mostrar coletadas */}
              {totalColetadas > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarColetadas(!mostrarColetadas)}
                    className="text-xs"
                  >
                    {mostrarColetadas ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Ocultar Completadas
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Mostrar Completadas ({totalColetadas})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Lista de missões filtradas */}
          <div className="space-y-3">
            {missoesFiltradas.map(missao => {
              const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
              const isInstagram = missao.titulo?.toLowerCase().includes('instagram') || 
                                  missao.tipo_missao === 'social';
              
              // Missão Instagram - Card específico
              if (isInstagram && missao.titulo?.toLowerCase().includes('instagram')) {
                return (
                  <MissaoInstagramCard 
                    key={missao.id}
                    onColetar={handleColetarRecompensa}
                    isCollecting={coletarRecompensa.isPending || coletarRecompensaSegmentada.isPending}
                  />
                );
              }
              
              // Missão Segmentada
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
              }
              
              // Missão Simples
              return (
                <MissionCard 
                  key={missao.id} 
                  missao={missao} 
                  onColetar={handleColetarRecompensa}
                  isCollecting={coletarRecompensa.isPending}
                />
              );
            })}
          </div>

          {/* Estados vazios */}
          {missoesFiltradas.length === 0 && !mostrarColetadas && totalColetadas > 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Parabéns! 🎉
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Você completou todas as missões disponíveis
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarColetadas(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Missões Completadas
              </Button>
            </div>
          )}

          {todasMissoes.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma missão disponível</h3>
              <p className="text-gray-500">Novas missões em breve!</p>
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
