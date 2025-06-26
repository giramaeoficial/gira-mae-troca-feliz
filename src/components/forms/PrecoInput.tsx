
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PriceSuggestions from "@/components/ui/price-suggestions";

interface PrecoInputProps {
  value: string;
  onChange: (valor: string) => void;
  categoria?: any;
  estadoConservacao: string;
  error?: string;
}

export const PrecoInput: React.FC<PrecoInputProps> = ({
  value,
  onChange,
  categoria,
  estadoConservacao,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (price: number) => {
    onChange(String(price));
  };

  return (
    <div>
      <Label htmlFor="preco">Preço (Girinhas)</Label>
      <Input
        type="number"
        id="preco"
        name="preco"
        value={value}
        onChange={handleChange}
        placeholder="Ex: 25"
        className="mt-2"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {categoria && (
        <PriceSuggestions 
          categoria={categoria.categoria}
          estadoConservacao={estadoConservacao || "usado"}
          valorMinimo={categoria.valor_minimo}
          valorMaximo={categoria.valor_maximo}
          valorAtual={value ? Number(value) : undefined}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};
