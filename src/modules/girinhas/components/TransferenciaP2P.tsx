import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, User, Calculator, AlertTriangle, Loader2 } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useTransferenciaP2P } from '../hooks/useTransferenciaP2P';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TransferenciaP2P: React.FC = () => {
  const { searchUsers, users, isSearching } = useUserSearch();
  
  const {
    // Dados do formulário
    quantidade,
    setQuantidade,
    usuarioSelecionado, 
    setUsuarioSelecionado,
    
    // Cálculos
    valorQuantidade,
    taxa,
    valorLiquido,
    taxaPercentual,
    
    // Validações  
    podeTransferir,
    temSaldoSuficiente,
    saldoAtual,
    
    // Estados
    isTransferindo,
    isLoadingConfig,
    
    // Ações
    executarTransferencia,
    limparFormulario
  } = useTransferenciaP2P();

  const [usuarioDestino, setUsuarioDestino] = React.useState('');

  const handleSearch = (value: string) => {
    setUsuarioDestino(value);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      // Limpar seleção se busca for muito pequena
      if (usuarioSelecionado) {
        setUsuarioSelecionado(null);
      }
    }
  };

  const handleSelecionarUsuario = (user: any) => {
    setUsuarioSelecionado(user);
    setUsuarioDestino(user.nome);
  };

  const handleTransferir = () => {
    executarTransferencia();
  };

  if (isLoadingConfig) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando configurações...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Transferir Girinhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de segurança */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            🔒 Transferências são processadas de forma segura pelo sistema. 
            Verifique sempre o destinatário antes de confirmar.
          </AlertDescription>
        </Alert>

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
              disabled={isTransferindo}
            />
            <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            {isSearching && (
              <Loader2 className="absolute right-8 top-3 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {/* Lista de usuários encontrados */}
          {users.length > 0 && !usuarioSelecionado && (
            <div className="border rounded-lg bg-white max-h-40 overflow-y-auto shadow-sm">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelecionarUsuario(user)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                  disabled={isTransferindo}
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-green-600">
                  {usuarioSelecionado.nome.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-green-800">{usuarioSelecionado.nome}</p>
                <p className="text-sm text-green-600">
                  {usuarioSelecionado.username && `@${usuarioSelecionado.username} • `}
                  Usuário selecionado ✓
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUsuarioSelecionado(null);
                setUsuarioDestino('');
              }}
              disabled={isTransferindo}
              className="text-green-600 hover:text-green-700"
            >
              Alterar
            </Button>
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
            placeholder="0.00"
            min="0.01"
            max="10000"
            step="0.01"
            disabled={isTransferindo}
            className={!temSaldoSuficiente && valorQuantidade > 0 ? 'border-red-300' : ''}
          />
          <p className="text-sm text-gray-500">
            Seu saldo: {saldoAtual.toFixed(2)} Girinhas
          </p>
        </div>

        {/* Cálculo da taxa */}
        {quantidade && valorQuantidade > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Resumo da transferência</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor a transferir:</span>
                <span className="font-medium">{valorQuantidade.toFixed(2)} Girinhas</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Taxa ({taxaPercentual}%):</span>
                <span className="font-medium">-{taxa.toFixed(2)} Girinhas</span>
              </div>
              <div className="h-px bg-purple-200 my-2"></div>
              <div className="flex justify-between font-bold text-purple-800">
                <span>Destinatário recebe:</span>
                <span>{valorLiquido.toFixed(2)} Girinhas</span>
              </div>
            </div>
          </div>
        )}

        {/* Validações de erro */}
        {!temSaldoSuficiente && valorQuantidade > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Saldo insuficiente. Você tem apenas {saldoAtual.toFixed(2)} Girinhas.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleTransferir}
            disabled={!podeTransferir || isTransferindo}
            className="flex-1"
            size="lg"
          >
            {isTransferindo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transferir {valorQuantidade.toFixed(2)} Girinhas
              </>
            )}
          </Button>

          {(usuarioSelecionado || quantidade) && (
            <Button
              variant="outline"
              onClick={() => {
                limparFormulario();
                setUsuarioDestino('');
              }}
              disabled={isTransferindo}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Informações de segurança */}
        <div className="text-xs text-gray-500 text-center space-y-1 pt-2 border-t">
          <p>• Taxa de {taxaPercentual}% aplicada automaticamente</p>
          <p>• A taxa é queimada do sistema para controlar a inflação</p>
          <p>• Transferências são instantâneas e irreversíveis</p>
          <p>• Sistema protegido contra manipulações e fraudes</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferenciaP2P;
