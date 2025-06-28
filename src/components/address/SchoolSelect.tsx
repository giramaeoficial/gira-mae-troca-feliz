
import React, { useState } from 'react';
import { Check, ChevronsUpDown, School, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEscolas, type EscolaEssencial } from '@/hooks/useEscolas';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';

interface SchoolSelectProps {
  value?: EscolaEssencial | null;
  onChange: (escola: EscolaEssencial | null) => void;
  placeholder?: string;
  disabled?: boolean;
  estadoFiltro?: string;
  cidadeFiltro?: string;
}

const SchoolSelect: React.FC<SchoolSelectProps> = ({
  value,
  onChange,
  placeholder = "Selecione uma escola...",
  disabled = false,
  estadoFiltro,
  cidadeFiltro
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarTodasEscolas, setMostrarTodasEscolas] = useState(false);
  
  const { getEscolasDosMeusFilhos } = useFilhosPorEscola();
  const escolasDosMeusFilhos = getEscolasDosMeusFilhos();
  
  // Hook para buscar outras escolas quando necessário
  const { escolas, isLoading } = useEscolas({
    searchTerm: mostrarTodasEscolas && searchTerm.length >= 3 ? searchTerm : undefined,
    uf: estadoFiltro,
    municipio: cidadeFiltro
  });

  const handleSelect = (escola: EscolaEssencial) => {
    onChange(escola);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatSchoolDisplay = (escola: EscolaEssencial) => {
    const nome = escola.escola || 'Escola sem nome';
    const municipio = escola.municipio || '';
    const uf = escola.uf || '';
    
    if (municipio && uf) {
      return `${nome} - ${municipio}/${uf}`;
    }
    
    return nome;
  };

  const handleToggleTodasEscolas = () => {
    setMostrarTodasEscolas(!mostrarTodasEscolas);
    setSearchTerm('');
  };

  // Filtrar escolas baseado no estado atual
  let escolasParaMostrar: EscolaEssencial[] = [];
  
  if (!mostrarTodasEscolas) {
    // Converter escolas dos filhos para o tipo essencial
    escolasParaMostrar = escolasDosMeusFilhos.map(escola => ({
      codigo_inep: escola.codigo_inep,
      escola: escola.escola || '',
      municipio: escola.municipio || '',
      uf: escola.uf || '',
      endereco: escola.endereco || '',
      categoria_administrativa: escola.categoria_administrativa || ''
    }));
  } else {
    // Mostrar resultado da busca geral
    escolasParaMostrar = escolas || [];
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {value ? formatSchoolDisplay(value) : placeholder}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {value && !disabled && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-50" align="start">
          <div className="p-4">
            {!mostrarTodasEscolas ? (
              <div className="space-y-4">
                {/* Mostrar escolas dos filhos */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Escolas dos seus filhos</h4>
                  {escolasParaMostrar.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum filho com escola cadastrada
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {escolasParaMostrar.map((escola) => (
                        <div
                          key={escola.codigo_inep}
                          onClick={() => handleSelect(escola)}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              value?.codigo_inep === escola.codigo_inep ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{escola.escola}</span>
                            <span className="text-sm text-muted-foreground">
                              {escola.municipio}/{escola.uf}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Opção para buscar outras escolas */}
                <div
                  onClick={handleToggleTodasEscolas}
                  className="cursor-pointer p-2 text-primary hover:bg-primary/10 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buscar outra escola</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Voltar para escolas dos filhos */}
                <div
                  onClick={handleToggleTodasEscolas}
                  className="cursor-pointer p-2 text-muted-foreground hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <School className="h-4 w-4" />
                  <span>← Voltar para escolas dos filhos</span>
                </div>

                {/* Campo de busca */}
                <div>
                  <input
                    type="text"
                    placeholder="Buscar escola (mín. 3 caracteres)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Resultado da busca geral */}
                {searchTerm.length < 3 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Digite pelo menos 3 caracteres para buscar
                  </div>
                ) : isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Carregando escolas...
                  </div>
                ) : escolasParaMostrar.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma escola encontrada
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      {escolasParaMostrar.length} escola(s) encontrada(s)
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {escolasParaMostrar.map((escola) => (
                        <div
                          key={escola.codigo_inep}
                          onClick={() => handleSelect(escola)}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              value?.codigo_inep === escola.codigo_inep ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{escola.escola}</span>
                            <span className="text-xs text-muted-foreground">
                              {escola.municipio}/{escola.uf}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SchoolSelect;
