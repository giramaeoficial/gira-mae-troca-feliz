
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, User, Calculator } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useGirinhasSystem } from '../hooks/useGirinhasSystem';
import { useCarteira } from '@/hooks/useCarteira';

const TransferenciaP2P: React.FC = () => {
  const [quantidade, setQuantidade] = useState('');
  const [usuarioDestino, setUsuarioDestino] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  
  const { searchUsers, users, isSearching } = useUserSearch();
  const { transferirP2P, isTransferindo } = useGirinhasSystem();
  const { saldo } = useCarteira();

  const taxa = parseFloat(quantidade) * 0.01 || 0;
  const valorLiquido = parseFloat(quantidade) - taxa || 0;

  const handleSearch = (value: string) => {
    setUsuarioDestino(value);
    if (value.length >= 2) {
      searchUsers(value);
    }
  };

  const handleTransferir = () => {
    if (!usuarioSelecionado || !quantidade) return;

    transferirP2P({
      destinatario_id: usuarioSelecionado.id,
      quantidade: parseFloat(quantidade),
    });

    // Limpar formulário
    setQuantidade('');
    setUsuarioDestino('');
    setUsuarioSelecionado(null);
  };

  const canTransfer = usuarioSelecionado && 
    parseFloat(quantidade) > 0 && 
    parseFloat(quantidade) <= saldo;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Transferir Girinhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca de usuário */}
        <div className="space-y-2">
          <Label htmlFor="usuario">Para quem enviar?</Label>
          <div className="relative">
            <Input
              id="usuario"
              value={usuarioDestino}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Digite o nome ou @username..."
              className="pr-10"
            />
            <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          
          {/* Lista de usuários encontrados */}
          {users.length > 0 && (
            <div className="border rounded-lg bg-white max-h-40 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setUsuarioSelecionado(user);
                    setUsuarioDestino(user.nome);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {user.nome.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.nome}</p>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Usuário selecionado */}
        {usuarioSelecionado && (
          <div className="p-3 bg-green-50 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-green-600">
                {usuarioSelecionado.nome.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-green-800">{usuarioSelecionado.nome}</p>
              <p className="text-sm text-green-600">Usuário selecionado</p>
            </div>
          </div>
        )}

        {/* Quantidade */}
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
          <Input
            id="quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0"
            min="1"
            max={saldo}
          />
          <p className="text-sm text-gray-500">
            Seu saldo: {saldo} Girinhas
          </p>
        </div>

        {/* Cálculo da taxa */}
        {quantidade && parseFloat(quantidade) > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Cálculo da transferência</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Valor a transferir:</span>
                <span className="font-medium">{parseFloat(quantidade)} Girinhas</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Taxa (1%):</span>
                <span className="font-medium">-{taxa.toFixed(2)} Girinhas</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold text-purple-800">
                <span>Destinatário recebe:</span>
                <span>{valorLiquido.toFixed(2)} Girinhas</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleTransferir}
          disabled={!canTransfer || isTransferindo}
          className="w-full"
          size="lg"
        >
          {isTransferindo ? (
            <>Processando...</>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Transferir Girinhas
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Taxa de 1% é aplicada em todas as transferências</p>
          <p>• A taxa é queimada do sistema para controlar a inflação</p>
          <p>• Transferências são instantâneas e irreversíveis</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferenciaP2P;
