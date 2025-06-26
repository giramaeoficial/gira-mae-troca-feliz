import React from 'react';
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

const FeedOptimized = () => {
  const { data: tiposTamanho } = useTiposTamanho();

  return (
    <div>
      Página de Feed Otimizada (WIP)
    </div>
  );
};

export default FeedOptimized;
