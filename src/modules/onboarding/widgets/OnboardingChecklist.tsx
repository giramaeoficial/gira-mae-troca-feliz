import React, { useState } from 'react';
import { useJornadas, JornadaComProgresso } from '@/hooks/useJornadas';
import { useGiraTour } from '../core/useGiraTour';
import { GiraAvatar } from '../components/GiraAvatar';
import { ChevronDown, ChevronUp, Check, Gift, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CATEGORIA_LABELS: Record<string, { label: string; icon: string }> = {
  tours: { label: 'Tours Guiados', icon: '🗺️' },
  favoritos: { label: 'Favoritos', icon: '❤️' },
  social: { label: 'Social', icon: '👥' },
  girinhas: { label: 'Girinhas', icon: '💰' },
  publicacao: { label: 'Publicação', icon: '📸' },
  perfil: { label: 'Perfil', icon: '✨' },
  geral: { label: 'Geral', icon: '🎯' },
};

export const OnboardingChecklist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['tours']);
  
  const { 
    jornadasPorCategoria, 
    progressoPercentual, 
    jornadasConcluidas,
    totalJornadas,
    jornadaAtiva,
    concluirJornada,
    iniciarJornada,
    isPending,
  } = useJornadas();
  
  const { startTour, checkTourEligibility } = useGiraTour();

  // Não mostrar se desabilitado ou sem jornadas
  if (!jornadaAtiva || totalJornadas === 0) return null;

  const toggleCategoria = (categoria: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoria) 
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleJornadaClick = (jornada: JornadaComProgresso) => {
    // Se é um tour e ainda não foi concluído
    if (jornada.tipo === 'tour' && jornada.tour_id && !jornada.concluida) {
      if (checkTourEligibility(jornada.tour_id)) {
        // Primeiro navegar, depois iniciar tour
        iniciarJornada(jornada);
        setTimeout(() => {
          startTour(jornada.tour_id!);
        }, 500);
      }
    } else if (!jornada.concluida) {
      // Para ações, apenas navegar
      iniciarJornada(jornada);
    } else if (jornada.concluida && !jornada.recompensa_coletada) {
      // Coletar recompensa pendente
      concluirJornada(jornada.id);
    }
  };

  const categorias = Object.keys(jornadasPorCategoria);

  return (
    <div 
      className={cn(
        "fixed bottom-20 right-4 z-40 transition-all duration-300 sm:bottom-4",
        isOpen ? "w-80" : "w-auto"
      )}
    >
      <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header - sempre visível */}
        <button 
          className="w-full bg-primary/90 p-3 flex items-center justify-between cursor-pointer hover:bg-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <div className="bg-background rounded-full p-1.5 w-9 h-9 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{progressoPercentual}%</span>
            </div>
            <div className="text-left">
              <span className="text-primary-foreground font-semibold text-sm block">
                Sua Jornada
              </span>
              <span className="text-primary-foreground/70 text-xs">
                {jornadasConcluidas}/{totalJornadas} completas
              </span>
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="text-primary-foreground w-5 h-5" />
          ) : (
            <ChevronUp className="text-primary-foreground w-5 h-5" />
          )}
        </button>

        {/* Conteúdo expandido */}
        {isOpen && (
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Banner motivacional */}
            <div className="p-3 bg-primary/5 border-b border-border">
              <div className="flex gap-3 items-center">
                <div className="transform scale-75 origin-left -ml-2">
                  <GiraAvatar emotion="celebrating" size="sm" />
                </div>
                <p className="text-xs text-muted-foreground flex-1">
                  Complete jornadas e ganhe <span className="text-primary font-semibold">Girinhas</span>! 🎉
                </p>
              </div>
            </div>

            {/* Lista de categorias */}
            <div className="p-2">
              {categorias.map(categoria => {
                const jornadas = jornadasPorCategoria[categoria];
                const isExpanded = expandedCategories.includes(categoria);
                const concluidas = jornadas.filter(j => j.concluida).length;
                const catInfo = CATEGORIA_LABELS[categoria] || CATEGORIA_LABELS.geral;

                return (
                  <div key={categoria} className="mb-2">
                    {/* Header da categoria */}
                    <button
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => toggleCategoria(categoria)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{catInfo.icon}</span>
                        <span className="text-sm font-medium text-foreground">
                          {catInfo.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({concluidas}/{jornadas.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Lista de jornadas da categoria */}
                    {isExpanded && (
                      <div className="ml-2 mt-1 space-y-1">
                        {jornadas.map(jornada => (
                          <JornadaItem 
                            key={jornada.id} 
                            jornada={jornada}
                            onClick={() => handleJornadaClick(jornada)}
                            isPending={isPending}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progresso total */}
            <div className="p-3 border-t border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Progresso Total</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressoPercentual}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface JornadaItemProps {
  jornada: JornadaComProgresso;
  onClick: () => void;
  isPending: boolean;
}

const JornadaItem: React.FC<JornadaItemProps> = ({ jornada, onClick, isPending }) => {
  const canCollect = jornada.concluida && !jornada.recompensa_coletada;
  
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
        jornada.recompensa_coletada 
          ? "bg-primary/5 opacity-60" 
          : canCollect
            ? "bg-primary/10 hover:bg-primary/20 animate-pulse"
            : "hover:bg-accent/50"
      )}
      onClick={onClick}
      disabled={jornada.recompensa_coletada || isPending}
    >
      {/* Status icon */}
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
        jornada.recompensa_coletada 
          ? "bg-primary text-primary-foreground" 
          : canCollect
            ? "bg-primary/20 text-primary"
            : "border-2 border-muted-foreground/30"
      )}>
        {jornada.recompensa_coletada ? (
          <Check className="w-3.5 h-3.5" />
        ) : canCollect ? (
          <Gift className="w-3.5 h-3.5" />
        ) : (
          <span className="text-xs">{jornada.icone}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm block truncate",
          jornada.recompensa_coletada 
            ? "text-muted-foreground line-through" 
            : "text-foreground"
        )}>
          {jornada.titulo}
        </span>
        {canCollect && (
          <span className="text-xs text-primary font-medium">
            Clique para coletar +{jornada.recompensa_girinhas}G$
          </span>
        )}
      </div>

      {/* Reward badge */}
      {!jornada.recompensa_coletada && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <span>+{jornada.recompensa_girinhas}</span>
          <span className="text-primary">G$</span>
        </div>
      )}
    </button>
  );
};
