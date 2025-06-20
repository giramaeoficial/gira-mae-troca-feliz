
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Plus, Edit, BarChart3, Users, Gift } from 'lucide-react';
import { useMissoesAdmin, MissaoAdmin } from '@/hooks/useMissoesAdmin';
import { useForm } from 'react-hook-form';

const FormMissao: React.FC<{ 
  missao?: MissaoAdmin; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}> = ({ missao, onSubmit, isLoading }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: missao || {
      titulo: '',
      descricao: '',
      tipo_missao: 'basic',
      categoria: 'perfil',
      icone: 'trophy',
      recompensa_girinhas: 10,
      validade_recompensa_meses: 12,
      limite_por_usuario: 1,
      condicoes: { tipo: 'perfil_completo', quantidade: 1 },
      ativo: true
    }
  });

  const tipoCondicao = watch('condicoes.tipo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            {...register('titulo', { required: 'Título é obrigatório' })}
            placeholder="Ex: Primeira Venda"
          />
          {errors.titulo && (
            <p className="text-sm text-red-600 mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipo_missao">Tipo de Missão</Label>
          <Select onValueChange={(value) => setValue('tipo_missao', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básica</SelectItem>
              <SelectItem value="engagement">Engajamento</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register('descricao', { required: 'Descrição é obrigatória' })}
          placeholder="Descreva o que o usuário precisa fazer"
        />
        {errors.descricao && (
          <p className="text-sm text-red-600 mt-1">{errors.descricao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select onValueChange={(value) => setValue('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perfil">Perfil</SelectItem>
              <SelectItem value="publicacao">Publicação</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="compra">Compra</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
              <SelectItem value="seguidor">Seguidor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recompensa_girinhas">Recompensa (Girinhas)</Label>
          <Input
            id="recompensa_girinhas"
            type="number"
            {...register('recompensa_girinhas', { 
              required: 'Recompensa é obrigatória',
              min: { value: 1, message: 'Mínimo 1 Girinha' }
            })}
          />
          {errors.recompensa_girinhas && (
            <p className="text-sm text-red-600 mt-1">{errors.recompensa_girinhas.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_condicao">Tipo de Condição</Label>
          <Select onValueChange={(value) => setValue('condicoes.tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendas_realizadas">Vendas Realizadas</SelectItem>
              <SelectItem value="compras_realizadas">Compras Realizadas</SelectItem>
              <SelectItem value="itens_publicados">Itens Publicados</SelectItem>
              <SelectItem value="seguidores">Seguidores</SelectItem>
              <SelectItem value="indicacoes_ativas">Indicações Ativas</SelectItem>
              <SelectItem value="avaliacoes_5_estrelas">Avaliações 5 Estrelas</SelectItem>
              <SelectItem value="perfil_completo">Perfil Completo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantidade">Quantidade Necessária</Label>
          <Input
            id="quantidade"
            type="number"
            {...register('condicoes.quantidade', { 
              required: 'Quantidade é obrigatória',
              min: { value: 1, message: 'Mínimo 1' }
            })}
          />
          {errors.condicoes?.quantidade && (
            <p className="text-sm text-red-600 mt-1">{errors.condicoes.quantidade.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validade_recompensa_meses">Validade Recompensa (meses)</Label>
          <Input
            id="validade_recompensa_meses"
            type="number"
            {...register('validade_recompensa_meses')}
            defaultValue={12}
          />
        </div>

        <div>
          <Label htmlFor="limite_por_usuario">Limite por Usuário</Label>
          <Input
            id="limite_por_usuario"
            type="number"
            {...register('limite_por_usuario')}
            defaultValue={1}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          {...register('ativo')}
        />
        <Label htmlFor="ativo">Missão Ativa</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {missao ? 'Atualizar Missão' : 'Criar Missão'}
      </Button>
    </form>
  );
};

const MissoesAdmin: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [missaoEditando, setMissaoEditando] = useState<MissaoAdmin | undefined>();
  const { 
    missoes, 
    isLoading, 
    criarMissao, 
    atualizarMissao, 
    toggleMissao,
    estatisticas 
  } = useMissoesAdmin();

  const handleSubmit = async (data: any) => {
    try {
      if (missaoEditando?.id) {
        await atualizarMissao.mutateAsync({ id: missaoEditando.id, ...data });
      } else {
        await criarMissao.mutateAsync(data);
      }
      setDialogOpen(false);
      setMissaoEditando(undefined);
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'basic': return 'Básica';
      case 'engagement': return 'Engajamento';
      case 'social': return 'Social';
      default: return tipo;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Missões</h2>
          <p className="text-gray-600">Configure e monitore as missões da plataforma</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {missaoEditando ? 'Editar Missão' : 'Nova Missão'}
              </DialogTitle>
            </DialogHeader>
            <FormMissao
              missao={missaoEditando}
              onSubmit={handleSubmit}
              isLoading={criarMissao.isPending || atualizarMissao.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Missões</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {missoes.map((missao) => (
                <Card key={missao.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{missao.titulo}</h3>
                          <Badge variant={missao.ativo ? 'default' : 'secondary'}>
                            {missao.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <Badge variant="outline">
                            {getTipoLabel(missao.tipo_missao)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{missao.descricao}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Recompensa: {missao.recompensa_girinhas} Girinhas</span>
                          <span>Categoria: {missao.categoria}</span>
                          <span>Condição: {missao.condicoes?.quantidade}x {missao.condicoes?.tipo}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMissaoEditando(missao);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={missao.ativo ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleMissao.mutate({ 
                            id: missao.id!, 
                            ativo: !missao.ativo 
                          })}
                        >
                          {missao.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="estatisticas">
          {estatisticas && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Girinhas Distribuídas</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalGirinhasDistribuidas}</div>
                  <p className="text-xs text-muted-foreground">
                    Total em recompensas de missões
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalUsuariosAtivos}</div>
                  <p className="text-xs text-muted-foreground">
                    Usuários que coletaram recompensas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Recompensas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalRecompensas}</div>
                  <p className="text-xs text-muted-foreground">
                    Recompensas coletadas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissoesAdmin;
