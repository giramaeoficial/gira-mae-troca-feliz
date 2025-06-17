
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEscolas } from '@/hooks/useEscolas';
import { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface EscolaPickerProps {
  value?: Escola | null;
  onChange: (escola: Escola | null) => void;
  placeholder?: string;
  className?: string;
}

const EscolaPicker: React.FC<EscolaPickerProps> = ({
  value,
  onChange,
  placeholder = "Buscar escola...",
  className = ""
}) => {
  const [termo, setTermo] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { escolas, loading, buscarEscolas } = useEscolas();

  // Debounce para a busca
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (termo.length >= 3) {
        buscarEscolas(termo);
        setMostrarResultados(true);
      } else {
        setMostrarResultados(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [termo, buscarEscolas]);

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

  const handleSelecionarEscola = (escola: Escola) => {
    onChange(escola);
    setTermo(escola.escola || '');
    setMostrarResultados(false);
  };

  const handleLimpar = () => {
    onChange(null);
    setTermo('');
    setMostrarResultados(false);
  };

  const formatarEndereco = (escola: Escola) => {
    const partes = [escola.municipio, escola.uf].filter(Boolean);
    return partes.join(', ');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={value ? (value.escola || '') : termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => {
            if (termo.length >= 3) {
              setMostrarResultados(true);
            }
          }}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
            onClick={handleLimpar}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Escola selecionada */}
      {value && (
        <div className="mt-2">
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
              </div>
            </CardContent>
          </Card>
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
            ) : termo.length >= 3 ? (
              <div className="p-4 text-center text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma escola encontrada</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tente buscar pelo nome da escola ou cidade
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Digite pelo menos 3 caracteres para buscar</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscolaPicker;
