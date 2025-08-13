import React from 'react';
import { AlertTriangle, X, Clock, User, FileX, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePenalidadesAdmin } from '@/hooks/usePenalidadesAdmin';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GestorPenalidades: React.FC = () => {
  const {
    penalidades,
    loading,
    removingId,
    refetch,
    removerPenalidade,
    limparPenalidadesExpiradas,
    getNivelTexto,
    getCorNivel,
    getTipoTexto
  } = usePenalidadesAdmin();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Gestão de Penalidades
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie penalidades aplicadas automaticamente (níveis 2 e 3)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={limparPenalidadesExpiradas}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Limpar Expiradas
          </Button>
          
          <Button
            variant="outline"
            onClick={refetch}
            className="flex items-center gap-2"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Explicação dos Níveis */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <strong>Níveis de Penalidade:</strong> Nível 2 (Médio) - impede denúncias e publicações. 
          Nível 3 (Grave) - impede todas as ações críticas da plataforma.
        </AlertDescription>
      </Alert>

      {/* Lista de Penalidades */}
      {penalidades.length === 0 ? (
        <Alert>
          <Shield className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Situação Regular ✅</strong><br />
            Nenhuma penalidade ativa de nível médio ou grave encontrada.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {penalidades.map((penalidade) => (
            <Card key={penalidade.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {penalidade.profiles.nome}
                      </span>
                      {penalidade.profiles.username && (
                        <span className="text-sm text-muted-foreground">
                          @{penalidade.profiles.username}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileX className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getTipoTexto(penalidade.tipo)}
                      </span>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={getCorNivel(penalidade.nivel)}
                  >
                    Nível {penalidade.nivel} - {getNivelTexto(penalidade.nivel)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {penalidade.motivo && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Motivo:</p>
                    <p className="text-sm text-muted-foreground">{penalidade.motivo}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    {penalidade.expira_em && (
                      <p className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Expira {formatDistanceToNow(new Date(penalidade.expira_em), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Aplicada {formatDistanceToNow(new Date(penalidade.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removerPenalidade(penalidade.id)}
                    disabled={removingId === penalidade.id}
                    className="flex items-center gap-2"
                  >
                    {removingId === penalidade.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Remover
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};