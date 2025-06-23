
import React, { useState } from 'react';
import { Check, ChevronsUpDown, School, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEscolas } from '@/hooks/useEscolas';
import type { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface SchoolSelectProps {
  value?: Escola | null;
  onChange: (escola: Escola | null) => void;
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
  
  const { escolas, isLoading } = useEscolas();

  const handleSelect = (escola: Escola) => {
    onChange(escola);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatSchoolDisplay = (escola: Escola) => {
    const nome = escola.escola || 'Escola sem nome';
    const endereco = escola.endereco || '';
    const municipio = escola.municipio || '';
    const uf = escola.uf || '';
    
    if (municipio && uf) {
      return `${nome} - ${municipio}/${uf}`;
    }
    
    return nome;
  };

  // Filtrar escolas com base nos critérios
  const escolasFiltradas = escolas.filter(escola => {
    const matchesSearch = !searchTerm || 
      escola.escola?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !estadoFiltro || escola.uf === estadoFiltro;
    const matchesCidade = !cidadeFiltro || escola.municipio === cidadeFiltro;
    
    return matchesSearch && matchesEstado && matchesCidade;
  });

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
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar escola..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Carregando..." : "Nenhuma escola encontrada."}
              </CommandEmpty>
              <CommandGroup>
                {escolasFiltradas?.map((escola) => (
                  <CommandItem
                    key={escola.codigo_inep}
                    onSelect={() => handleSelect(escola)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.codigo_inep === escola.codigo_inep ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{escola.escola}</span>
                      <span className="text-sm text-muted-foreground">
                        {escola.endereco} - {escola.municipio}/{escola.uf}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SchoolSelect;
