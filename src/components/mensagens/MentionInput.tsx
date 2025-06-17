
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface MentionSuggestion {
  id: string;
  nome: string;
  username: string;
  avatar_url: string | null;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Digite sua mensagem...",
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { users, loading } = useUserSearch(mentionSearch);

  // Detectar quando @ é digitado
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Verificar se há uma menção sendo digitada
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionSearch('');
    }
  };

  // Inserir menção selecionada
  const insertMention = (user: MentionSuggestion) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    // Encontrar o início da menção
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    
    if (mentionStart !== -1) {
      const beforeMention = textBeforeCursor.slice(0, mentionStart);
      const newValue = `${beforeMention}@${user.username} ${textAfterCursor}`;
      
      onChange(newValue);
      setShowSuggestions(false);
      setMentionSearch('');
      
      // Focar o input novamente
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = mentionStart + user.username.length + 2;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showSuggestions) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pr-4"
          />
          
          {/* Sugestões de menção */}
          {showSuggestions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
              {loading ? (
                <div className="p-3 text-sm text-gray-500">Buscando...</div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                    onClick={() => insertMention(user)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.nome?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.nome}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </button>
                ))
              ) : mentionSearch.length > 0 ? (
                <div className="p-3 text-sm text-gray-500">
                  Nenhum usuário encontrado
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-500">
                  Digite para buscar usuários
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button 
          onClick={onSubmit} 
          disabled={disabled || !value.trim()}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MentionInput;
