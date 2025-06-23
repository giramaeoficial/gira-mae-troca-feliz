
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, MapPin } from 'lucide-react';
import AddressInput from '@/components/address/AddressInput';
import { useUserAddresses } from '@/hooks/useUserAddresses';
import { Tables } from '@/integrations/supabase/types';
import type { Address } from '@/hooks/useAddress';

type UserAddress = Tables<'user_addresses'>;

const EnderecoAdicional: React.FC = () => {
  const { addresses, loading, adicionarEndereco, atualizarEndereco, removerEndereco } = useUserAddresses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<{
    apelido: string;
    address: Partial<Address>;
  }>({
    apelido: '',
    address: {}
  });

  const handleAddAddress = async () => {
    if (!newAddress.apelido.trim() || !newAddress.address.cep) {
      return;
    }

    await adicionarEndereco({
      apelido: newAddress.apelido,
      cep: newAddress.address.cep || '',
      endereco: newAddress.address.endereco || '',
      bairro: newAddress.address.bairro || '',
      cidade: newAddress.address.cidade || '',
      estado: newAddress.address.estado || '',
      complemento: newAddress.address.complemento || '',
      ponto_referencia: newAddress.address.ponto_referencia || ''
    });

    setNewAddress({ apelido: '', address: {} });
    setShowAddForm(false);
  };

  const handleRemoveAddress = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      await removerEndereco(id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereços Adicionais
          </div>
          <Button 
            type="button" 
            onClick={() => setShowAddForm(true)} 
            size="sm" 
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">Carregando endereços...</div>
        ) : (
          <>
            {addresses.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Nenhum endereço adicional cadastrado</p>
                <p className="text-sm">Adicione endereços alternativos para facilitar as trocas</p>
              </div>
            )}

            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-8 w-8"
                  onClick={() => handleRemoveAddress(address.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="pr-8">
                  <h4 className="font-medium text-primary mb-2">{address.apelido}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.endereco}</p>
                    {address.bairro && <p>{address.bairro}</p>}
                    <p>{address.cidade} - {address.estado}</p>
                    {address.cep && <p>CEP: {address.cep}</p>}
                    {address.complemento && <p>Complemento: {address.complemento}</p>}
                    {address.ponto_referencia && <p>Referência: {address.ponto_referencia}</p>}
                  </div>
                </div>
              </div>
            ))}

            {showAddForm && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
                <div>
                  <Label htmlFor="apelido" className="text-sm font-medium">
                    Apelido do endereço *
                  </Label>
                  <Input
                    id="apelido"
                    value={newAddress.apelido}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, apelido: e.target.value }))}
                    placeholder="Ex: Casa da vovó, Trabalho, etc."
                    className="mt-1 h-12"
                  />
                </div>

                <AddressInput
                  value={newAddress.address}
                  onChange={(address) => setNewAddress(prev => ({ ...prev, address }))}
                  showAllFields={true}
                />

                <div className="flex gap-2 pt-2">
                  <Button 
                    type="button" 
                    onClick={handleAddAddress}
                    disabled={!newAddress.apelido.trim() || !newAddress.address.cep}
                    className="flex-1"
                  >
                    Salvar Endereço
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnderecoAdicional;
