
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEscolas } from '@/hooks/useEscolas';
import { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface EscolaPickerProps {
  value?: Escola | null;
  onChange: (escola: Escola | null) => void;
  placeholder?: string;
  className?: string;
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

const EscolaPicker: React.FC<EscolaPickerProps> = ({
  value,
  onChange,
  placeholder = "Buscar escola...",
  className = ""
}) => {
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { escolas, loading, buscarEscolas } = useEscolas();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setMostrarResultados(true);
  };

  const handleSelecionarEscola = (escola: Escola) => {
    onChange(escola);
    setMostrarResultados(false);
  };

  const handleLimpar = () => {
    onChange(null);
    setEstado('');
    setCidade('');
    setNomeEscola('');
    setMostrarResultados(false);
  };

  const formatarEndereco = (escola: Escola) => {
    const partes = [escola.municipio, escola.uf].filter(Boolean);
    return partes.join(', ');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Escola selecionada */}
      {value && (
        <div className="mb-4">
          <Card className="border-primary">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={handleLimpar}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário de busca */}
      {!value && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Para buscar uma escola, primeiro selecione o estado e digite a cidade, depois digite parte do nome da escola.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado *</label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((uf) => (
                    <SelectItem key={uf.sigla} value={uf.sigla}>
                      {uf.nome} ({uf.sigla})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cidade *</label>
              <Input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Digite a cidade"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome da Escola *</label>
            <div className="flex gap-2">
              <Input
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                placeholder="Digite pelo menos 3 caracteres do nome da escola"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBuscarEscolas();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleBuscarEscolas}
                disabled={!estado || !cidade || nomeEscola.length < 3}
                className="shrink-0"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Escola
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resultados da busca */}
      {mostrarResultados && !value && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm">Buscando escolas...</p>
              </div>
            ) : escolas.length > 0 ? (
              <div className="space-y-1">
                {escolas.map((escola) => (
                  <div
                    key={escola.codigo_inep}
                    className="p-3 hover:bg-gray-50 cursor-pointer rounded-md border"
                    onClick={() => handleSelecionarEscola(escola)}
                  >
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{escola.escola}</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{formatarEndereco(escola)}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {escola.categoria_administrativa && (
                            <Badge variant="outline" className="text-xs">
                              {escola.categoria_administrativa}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma escola encontrada</p>
                <p className="text-xs text-gray-400 mt-1">
                  Verifique se o estado, cidade e nome da escola estão corretos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscolaPicker;
