
import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

interface TamanhoInteligenteProps {
  categoria: string;
  subcategoria?: string;
  value?: string;
  tipoTamanho?: string;
  onChange: (tipo: string, valor: string) => void;
  error?: string;
}

export const TamanhoInteligente: React.FC<TamanhoInteligenteProps> = ({
  categoria,
  subcategoria,
  value,
  tipoTamanho,
  onChange,
  error
}) => {
  const { tiposTamanho, tipos, isLoading } = useTiposTamanho(categoria);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>(tipoTamanho || '');

  const handleTipoChange = (novoTipo: string) => {
    setTipoSelecionado(novoTipo);
    onChange(novoTipo, ''); // Limpar valor quando tipo muda
  };

  const handleValorChange = (valor: string) => {
    onChange(tipoSelecionado, valor);
  };

  // Para roupas, mostrar opção bebê vs criança
  if (categoria === 'roupas') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Tipo de Roupa</Label>
          <Select 
            value={tipoSelecionado} 
            onValueChange={handleTipoChange}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roupa_bebe">
                👶 Roupas de Bebê (0-24 meses)
              </SelectItem>
              <SelectItem value="roupa_crianca">
                🧒 Roupas de Criança (2+ anos)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipoSelecionado && tiposTamanho[tipoSelecionado] && (
          <div>
            <Label className="text-base font-medium">Tamanho</Label>
            <Select 
              value={value} 
              onValueChange={handleValorChange}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                {tiposTamanho[tipoSelecionado]?.map((t) => (
                  <SelectItem key={t.id} value={t.valor}>
                    {t.label_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  // Para outras categorias, mostrar tamanhos direto
  const tipoUnico = tipos[0];
  
  if (!tipoUnico || !tiposTamanho[tipoUnico]) {
    return (
      <div>
        <Label className="text-base font-medium">Tamanho</Label>
        <p className="text-sm text-gray-500 mt-2">Sem opções de tamanho para esta categoria</p>
      </div>
    );
  }

  const getLabel = () => {
    switch (categoria) {
      case 'calcados': return 'Número';
      case 'brinquedos': return 'Idade Recomendada';
      case 'livros': return 'Faixa Etária';
      case 'equipamentos': return 'Idade/Peso';
      default: return 'Tamanho';
    }
  };

  return (
    <div>
      <Label className="text-base font-medium">{getLabel()}</Label>
      <Select 
        value={value} 
        onValueChange={(val) => onChange(tipoUnico, val)}
      >
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {tiposTamanho[tipoUnico]?.map((t) => (
            <SelectItem key={t.id} value={t.valor}>
              {t.label_display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
