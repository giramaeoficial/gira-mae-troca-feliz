
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CampoWhatsAppProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const CampoWhatsApp: React.FC<CampoWhatsAppProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const formatarWhatsApp = (numero: string) => {
    const numeroLimpo = numero.replace(/\D/g, '');
    
    if (numeroLimpo.length <= 11) {
      if (numeroLimpo.length <= 10) {
        return numeroLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        return numeroLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }
    return value;
  };

  const validarWhatsApp = (numero: string) => {
    const numeroLimpo = numero.replace(/\D/g, '');
    return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeroLimpo = e.target.value.replace(/\D/g, '');
    onChange(numeroLimpo);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="whatsapp">
        WhatsApp {required && '*'}
        <span className="text-xs text-gray-500 ml-1">
          (para contato nas trocas)
        </span>
      </Label>
      <Input
        id="whatsapp"
        type="tel"
        placeholder="(11) 99999-9999"
        value={formatarWhatsApp(value)}
        onChange={handleChange}
        required={required}
        maxLength={15}
        className={error ? 'border-red-500' : ''}
      />
      {value && !validarWhatsApp(value) && (
        <p className="text-xs text-red-500">
          Digite um número válido com DDD (10 ou 11 dígitos)
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <div className="text-xs text-gray-600 p-2 bg-green-50 rounded flex items-start gap-2">
        <span className="text-green-600">📱</span>
        <span>
          Seu WhatsApp será usado apenas para contato direto nas trocas. 
          Não será exibido publicamente.
        </span>
      </div>
    </div>
  );
};
