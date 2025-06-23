
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Clock, ShoppingBag, Calendar, Zap } from 'lucide-react';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useEscolas } from '@/hooks/useEscolas';

interface SegmentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSegmentacaoChange: (criterios: any) => void;
  criteriosIniciais?: any;
}

const SegmentacaoModal: React.FC<SegmentacaoModalProps> = ({
  open,
  onOpenChange,
  onSegmentacaoChange,
  criteriosIniciais = {}
}) => {
  const [criterios, setCriterios] = useState(criteriosIniciais);
  const [previewCount, setPreviewCount] = useState(0);
  
  const { subcategorias } = useSubcategorias();
  const { escolas } = useEscolas();

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const faixasIdade = [
    { value: '0-2', label: '0-2 anos (Bebê)' },
    { value: '3-5', label: '3-5 anos (Pré-escolar)' },
    { value: '6-8', label: '6-8 anos (Escolar inicial)' },
    { value: '9-12', label: '9-12 anos (Pré-adolescente)' },
    { value: '13-15', label: '13-15 anos (Adolescente)' },
    { value: '16+', label: '16+ anos (Jovem)' }
  ];

  const faixasSaldo = [
    { value: '0-10', label: '0-10 Girinhas' },
    { value: '11-50', label: '11-50 Girinhas' },
    { value: '51-100', label: '51-100 Girinhas' },
    { value: '100+', label: '100+ Girinhas' }
  ];

  const categorias = ['roupas', 'calcados', 'brinquedos', 'livros', 'acessorios'];

  const handleCriterioChange = (categoria: string, valor: any) => {
    const novosCriterios = { ...criterios, [categoria]: valor };
    setCriterios(novosCriterios);
    // Simular cálculo de preview (seria uma chamada real à API)
    setPreviewCount(Math.floor(Math.random() * 1000) + 50);
  };

  const handleArrayChange = (categoria: string, item: string, checked: boolean) => {
    const array = criterios[categoria] || [];
    const novoArray = checked 
      ? [...array, item]
      : array.filter((i: string) => i !== item);
    
    handleCriterioChange(categoria, novoArray.length > 0 ? novoArray : undefined);
  };

  const aplicarSegmentacao = () => {
    onSegmentacaoChange(criterios);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configurar Segmentação de Missão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview de usuários elegíveis */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Usuários Elegíveis</p>
                  <p className="text-2xl font-bold text-blue-900">{previewCount.toLocaleString()}</p>
                </div>
                <Badge variant="secondary">
                  {previewCount > 100 ? 'Segmento Adequado' : 'Segmento Pequeno'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="geografico" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geografico" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Geografia
              </TabsTrigger>
              <TabsTrigger value="demografico" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Demografia
              </TabsTrigger>
              <TabsTrigger value="comportamental" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Comportamento
              </TabsTrigger>
              <TabsTrigger value="temporal" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Temporal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geografico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Geográficos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estados */}
                  <div>
                    <Label className="text-sm font-medium">Estados</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {estados.map(estado => (
                        <div key={estado} className="flex items-center space-x-2">
                          <Checkbox
                            id={`estado-${estado}`}
                            checked={criterios.estados?.includes(estado)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('estados', estado, checked as boolean)
                            }
                          />
                          <Label htmlFor={`estado-${estado}`} className="text-sm">
                            {estado}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cidades */}
                  <div>
                    <Label htmlFor="cidades">Cidades Específicas</Label>
                    <Input
                      id="cidades"
                      placeholder="Digite cidades separadas por vírgula"
                      value={criterios.cidades?.join(', ') || ''}
                      onChange={(e) => {
                        const cidades = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                        handleCriterioChange('cidades', cidades.length > 0 ? cidades : undefined);
                      }}
                    />
                  </div>

                  {/* Bairros */}
                  <div>
                    <Label htmlFor="bairros">Bairros Específicos</Label>
                    <Input
                      id="bairros"
                      placeholder="Digite bairros separados por vírgula"
                      value={criterios.bairros?.join(', ') || ''}
                      onChange={(e) => {
                        const bairros = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                        handleCriterioChange('bairros', bairros.length > 0 ? bairros : undefined);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demografico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Demográficos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Idades dos filhos */}
                  <div>
                    <Label className="text-sm font-medium">Idades dos Filhos</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {faixasIdade.map(faixa => (
                        <div key={faixa.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`idade-${faixa.value}`}
                            checked={criterios.idades_filhos?.includes(faixa.value)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('idades_filhos', faixa.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`idade-${faixa.value}`} className="text-sm">
                            {faixa.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sexo dos filhos */}
                  <div>
                    <Label className="text-sm font-medium">Sexo dos Filhos</Label>
                    <div className="flex gap-4 mt-2">
                      {['menino', 'menina', 'ambos'].map(sexo => (
                        <div key={sexo} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sexo-${sexo}`}
                            checked={criterios.sexo_filhos?.includes(sexo)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('sexo_filhos', sexo, checked as boolean)
                            }
                          />
                          <Label htmlFor={`sexo-${sexo}`} className="text-sm capitalize">
                            {sexo}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Escolas */}
                  <div>
                    <Label htmlFor="escolas">Escolas Específicas</Label>
                    <Select onValueChange={(value) => {
                      const escolasSelecionadas = criterios.escolas || [];
                      if (!escolasSelecionadas.includes(value)) {
                        handleCriterioChange('escolas', [...escolasSelecionadas, value]);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione escolas" />
                      </SelectTrigger>
                      <SelectContent>
                        {escolas?.slice(0, 50).map(escola => (
                          <SelectItem key={escola.codigo_inep} value={escola.codigo_inep.toString()}>
                            {escola.escola}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {criterios.escolas?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {criterios.escolas.map((escolaId: string) => {
                          const escola = escolas?.find(e => e.codigo_inep.toString() === escolaId);
                          return (
                            <Badge key={escolaId} variant="secondary" className="text-xs">
                              {escola?.escola || escolaId}
                              <button
                                onClick={() => {
                                  const novasEscolas = criterios.escolas.filter((id: string) => id !== escolaId);
                                  handleCriterioChange('escolas', novasEscolas.length > 0 ? novasEscolas : undefined);
                                }}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comportamental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros Comportamentais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Faixa de saldo */}
                  <div>
                    <Label className="text-sm font-medium">Faixa de Saldo em Carteira</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {faixasSaldo.map(faixa => (
                        <div key={faixa.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`saldo-${faixa.value}`}
                            checked={criterios.faixas_saldo?.includes(faixa.value)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('faixas_saldo', faixa.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`saldo-${faixa.value}`} className="text-sm">
                            {faixa.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Histórico de compras */}
                  <div>
                    <Label className="text-sm font-medium">Histórico de Compras de Girinhas</Label>
                    <div className="flex gap-4 mt-2">
                      {[
                        { value: true, label: 'Já comprou Girinhas' },
                        { value: false, label: 'Nunca comprou Girinhas' }
                      ].map(opcao => (
                        <div key={opcao.value.toString()} className="flex items-center space-x-2">
                          <Checkbox
                            id={`comprou-${opcao.value}`}
                            checked={criterios.ja_comprou_girinhas === opcao.value}
                            onCheckedChange={(checked) => 
                              handleCriterioChange('ja_comprou_girinhas', checked ? opcao.value : undefined)
                            }
                          />
                          <Label htmlFor={`comprou-${opcao.value}`} className="text-sm">
                            {opcao.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorias favoritas */}
                  <div>
                    <Label className="text-sm font-medium">Categorias de Interesse</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {categorias.map(categoria => (
                        <div key={categoria} className="flex items-center space-x-2">
                          <Checkbox
                            id={`categoria-${categoria}`}
                            checked={criterios.categorias_favoritas?.includes(categoria)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('categorias_favoritas', categoria, checked as boolean)
                            }
                          />
                          <Label htmlFor={`categoria-${categoria}`} className="text-sm capitalize">
                            {categoria}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subcategorias */}
                  {criterios.categorias_favoritas?.map((categoria: string) => (
                    <div key={categoria}>
                      <Label className="text-sm font-medium">Subcategorias de {categoria}</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {subcategorias
                          ?.filter(sub => sub.categoria_pai === categoria)
                          .map(subcategoria => (
                            <div key={subcategoria.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`sub-${subcategoria.id}`}
                                checked={criterios.subcategorias?.includes(subcategoria.id)}
                                onCheckedChange={(checked) => 
                                  handleArrayChange('subcategorias', subcategoria.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={`sub-${subcategoria.id}`} className="text-sm">
                                {subcategoria.nome}
                              </Label>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temporal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuração Temporal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Frequência */}
                  <div>
                    <Label htmlFor="frequencia">Frequência de Ativação</Label>
                    <Select onValueChange={(value) => handleCriterioChange('frequencia', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unica">Única</SelectItem>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dias da semana (se semanal) */}
                  {criterios.frequencia === 'semanal' && (
                    <div>
                      <Label className="text-sm font-medium">Dias da Semana</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[
                          { value: '1', label: 'Segunda' },
                          { value: '2', label: 'Terça' },
                          { value: '3', label: 'Quarta' },
                          { value: '4', label: 'Quinta' },
                          { value: '5', label: 'Sexta' },
                          { value: '6', label: 'Sábado' },
                          { value: '0', label: 'Domingo' }
                        ].map(dia => (
                          <div key={dia.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dia-${dia.value}`}
                              checked={criterios.dias_semana?.includes(dia.value)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('dias_semana', dia.value, checked as boolean)
                              }
                            />
                            <Label htmlFor={`dia-${dia.value}`} className="text-sm">
                              {dia.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Horários */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horario_inicio">Horário de Início</Label>
                      <Input
                        id="horario_inicio"
                        type="time"
                        value={criterios.horario_inicio || ''}
                        onChange={(e) => handleCriterioChange('horario_inicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="horario_fim">Horário de Fim</Label>
                      <Input
                        id="horario_fim"
                        type="time"
                        value={criterios.horario_fim || ''}
                        onChange={(e) => handleCriterioChange('horario_fim', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Período de vigência */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_inicio">Data de Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={criterios.data_inicio || ''}
                        onChange={(e) => handleCriterioChange('data_inicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_fim">Data de Fim</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={criterios.data_fim || ''}
                        onChange={(e) => handleCriterioChange('data_fim', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Resumo da segmentação */}
          {Object.keys(criterios).length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Segmentação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(criterios).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    
                    return (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {Array.isArray(value) ? value.join(', ') : value.toString()}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicarSegmentacao} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Aplicar Segmentação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SegmentacaoModal;
