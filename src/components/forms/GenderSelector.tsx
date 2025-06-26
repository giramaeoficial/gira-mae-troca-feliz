
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GenderSelectorProps {
  value: string;
  onChange: (genero: string) => void;
  error?: string;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div>
      <Label htmlFor="genero">Para quem é o item?</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o gênero" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="menino">👦 Para Menino</SelectItem>
          <SelectItem value="menina">👧 Para Menina</SelectItem>
          <SelectItem value="unissex">👶 Unissex</SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
