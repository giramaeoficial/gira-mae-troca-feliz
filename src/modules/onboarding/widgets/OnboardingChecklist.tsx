import React, { useState } from 'react';
import { useGiraTour } from '../core/useGiraTour';
import { GiraAvatar } from '../components/GiraAvatar';

export const OnboardingChecklist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useGiraTour();
  
  // Fake list for demo
  const tasks = [
    { id: 'feed-tour', label: 'Conhecer o Feed', completed: state.completedTours.includes('feed-tour') },
    { id: 'profile', label: 'Completar Perfil', completed: false },
    { id: 'wallet', label: 'Ver Carteira', completed: false },
  ];

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-transform duration-300 ${isOpen ? '' : 'translate-y-[calc(100%-60px)]'}`}>
      <div className="bg-white rounded-t-2xl shadow-xl w-72 overflow-hidden border border-gray-100">
        <div 
          className="bg-pink-500 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
              <span className="text-xs font-bold text-pink-500">{progress}%</span>
            </div>
            <span className="text-white font-bold text-sm">Sua Jornada</span>
          </div>
          <span className="text-white text-xl">{isOpen ? '−' : '+'}</span>
        </div>

        <div className="p-4 bg-white">
          <div className="mb-4 flex gap-3 items-center bg-pink-50 p-3 rounded-lg">
             <div className="transform scale-75 origin-left">
               <GiraAvatar emotion="thinking" size="sm" />
             </div>
             <p className="text-xs text-pink-800">Complete as missões para ganhar Girinhas!</p>
          </div>

          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {task.completed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {task.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};