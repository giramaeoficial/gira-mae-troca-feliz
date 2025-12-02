import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useCarteira } from '@/hooks/useCarteira';
import { Skeleton } from '@/components/ui/skeleton';

const SaldoHeader: React.FC = () => {
  const { saldo, loading } = useCarteira();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5  text-pink-50 rounded-full">
        <Wallet className="w-4 h-4 text-pink-600" />
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  return (
    <Link 
      to="/carteira" 
      data-tour="wallet-button"
      className="flex justify-center items-center gap-2 px-5 ml-5 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full transition-all  group"
      title="Ver Carteira Completa"
    >
      <img 
    src="/girinha_sem_fundo.png" 
    alt="Girinha" 
    className="w-5 h-5 object-contain group-hover:animate-pulse"
  />
      
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 leading-none">GR</span>
        <span className="text-sm font-bold text-pink-700 leading-tight">
          {saldo.toFixed(2)}
        </span>
      </div>
    </Link>
  );
};

export default SaldoHeader;