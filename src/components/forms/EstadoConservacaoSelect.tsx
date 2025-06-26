
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EstadoConservacaoSelectProps {
  value: string;
  onChange: (valor: string) => void;
  error?: string;
}

export const EstadoConservacaoSelect: React.FC<EstadoConservacaoSelectProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div>
      <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="novo">✨ Novo</SelectItem>
          <SelectItem value="seminovo">⭐ Seminovo</SelectItem>
          <SelectItem value="usado">👍 Usado</SelectItem>
          <SelectItem value="muito usado">🔄 Muito Usado</SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
