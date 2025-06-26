
// DEPRECATED: Este hook foi simplificado.
// Agora utilizamos apenas um endereço principal através do useUserAddress.ts
// Mantido apenas para compatibilidade com código legado.

import { useUserAddress } from './useUserAddress';

export const useUserAddresses = () => {
  const { userAddress, isLoading, error, updateAddress, isUpdating } = useUserAddress();
  
  // Retorna formato compatível com código antigo
  return {
    addresses: userAddress ? [userAddress] : [],
    isLoading,
    error,
    updateAddress,
    isUpdating,
    // Métodos deprecados que não fazem nada
    deleteAddress: () => Promise.resolve(false),
    addAddress: () => Promise.resolve(null)
  };
};
