
import React, { useState } from 'react';
import { Search, MapPin, Building2, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEscolas } from '@/hooks/useEscolas';
import { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface EscolaFilterProps {
  value?: Escola | null;
  onChange: (escola: Escola | null) => void;
}

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const EscolaFilter: React.FC<EscolaFilterProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');

  const { escolas, loading, buscarEscolas } = useEscolas();

  const handleBuscarEscolas = async () => {
    if (!estado || !cidade) {
      alert('Por favor, selecione o estado e digite a cidade antes de buscar');
      return;
    }

    if (nomeEscola.length < 3) {
      alert('Digite pelo menos 3 caracteres do nome da escola');
      return;
    }

    await buscarEscolas(nomeEscola, estado, cidade);
  };

  const handleSelecionarEscola = (escola: Escola) => {
    onChange(escola);
    setIsOpen(false);
  };

  const handleLimpar = () => {
    onChange(null);
    setEstado('');
    setCidade('');
    setNomeEscola('');
  };

  const formatarEndereco = (escola: Escola) => {
    const partes = [escola.municipio, escola.uf].filter(Boolean);
    return partes.join(', ');
  };

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={value ? "default" : "outline"} 
            className="w-full md:w-auto justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {value ? (
                <span className="truncate max-w-32">{value.escola}</span>
              ) : (
                'Filtrar por Escola'
              )}
            </div>
            <Filter className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtrar por Escola</h4>
              {value && (
                <Button variant="ghost" size="sm" onClick={handleLimpar}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {value ? (
              <Card className="border-primary">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2">{value.escola}</h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{formatarEndereco(value)}</span>
                  </div>
                  {value.categoria_administrativa && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {value.categoria_administrativa}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Selecione estado, cidade e digite parte do nome da escola
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map((uf) => (
                          <SelectItem key={uf.sigla} value={uf.sigla}>
                            {uf.sigla}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade</label>
                    <Input
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Digite a cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Escola</label>
                    <div className="flex gap-2">
                      <Input
                        value={nomeEscola}
                        onChange={(e) => setNomeEscola(e.target.value)}
                        placeholder="Mín. 3 caracteres"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleBuscarEscolas}
                        disabled={!estado || !cidade || nomeEscola.length < 3}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                {escolas.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {escolas.map((escola) => (
                          <div
                            key={escola.codigo_inep}
                            className="p-2 hover:bg-gray-50 cursor-pointer rounded text-sm"
                            onClick={() => handleSelecionarEscola(escola)}
                          >
                            <div className="font-medium line-clamp-1">{escola.escola}</div>
                            <div className="text-xs text-gray-500">
                              {formatarEndereco(escola)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EscolaFilter;
