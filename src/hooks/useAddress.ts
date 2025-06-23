
import { useState } from 'react';
import { toast } from 'sonner';

export interface Address {
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  ponto_referencia?: string;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useAddress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (cep: string): string => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const validateCep = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  const fetchAddress = async (cep: string): Promise<Address | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (!validateCep(cleanCep)) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        toast.error('CEP não encontrado');
        return null;
      }

      const address: Address = {
        cep: formatCep(data.cep),
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        complemento: '',
        ponto_referencia: ''
      };

      return address;
    } catch (err) {
      setError('Erro ao buscar CEP');
      toast.error('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchAddress,
    formatCep,
    validateCep
  };
};
