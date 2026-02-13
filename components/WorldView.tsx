import React from 'react';
import { Zone, NPC, GameState } from '../types';

interface WorldViewProps {
  zone: Zone;
  npcs: NPC[];
  onInteract: (npc: NPC) => void;
  gameState: GameState;
  onOpenJobBoard: () => void;
  onOpenExam: () => void;
  onOpenMinigame: () => void;
  isZoneLocked: boolean;
}

export const WorldView: React.FC<WorldViewProps> = ({ 
  zone, npcs, onInteract, gameState, 
  onOpenJobBoard, onOpenExam, onOpenMinigame, isZoneLocked 
}) => {
  
  if (isZoneLocked) {
     return (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
           <div className="text-center">
              <h2 className="text-4xl text-gray-600 font-bold mb-4">LOCKED</h2>
              <p className="text-xl text-gray-400">Requires HSK Level {zone.minHsk}</p>
              <p className="text-sm text-gray-500 mt-2">Pass the exam in previous zones to unlock.</p>
           </div>
        </div>
     );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-stone-800">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(https://picsum.photos/seed/${zone.imageSeed}/1024/768?grayscale&blur=2)`,
          opacity: 0.6 
        }}
      />
      
      {/* Zone Title */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10 opacity-80 pointer-events-none">
        <h2 className="text-3xl font-bold tracking-widest text-white drop-shadow-lg">{zone.name}</h2>
        <p className="text-sm text-gray-300 mt-1">{zone.description}</p>
      </div>

      {/* Action Buttons (Buildings) */}
      <div className="absolute top-32 right-4 flex flex-col gap-4 z-20">
         {zone.id === 'residential' && (
           <button onClick={onOpenExam} className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg shadow-lg border border-purple-400 transform hover:scale-105 transition-transform">
             📝 Take Exam
           </button>
         )}
         {zone.id === 'market' && (
           <button onClick={onOpenJobBoard} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg shadow-lg border border-blue-400 transform hover:scale-105 transition-transform">
             💼 Job Center
           </button>
         )}
         {zone.id === 'alley' && (
           <button onClick={onOpenMinigame} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg shadow-lg border border-green-400 transform hover:scale-105 transition-transform">
             🎮 Arcade
           </button>
         )}
         {/* Practice Room Button in Park (or Residential fallback) */}
         {zone.id === 'park' && (
           <button 
             onClick={() => {
                const tutor = npcs.find(n => n.id === 'ai_tutor');
                if (tutor) onInteract(tutor);
             }} 
             className="bg-pink-600 hover:bg-pink-500 text-white p-3 rounded-lg shadow-lg border border-pink-400 transform hover:scale-105 transition-transform"
           >
             💬 Chat Room
           </button>
         )}
      </div>

      {/* NPCs in the Scene */}
      <div className="absolute bottom-1/4 w-full flex justify-around items-end px-10">
        {npcs.filter(n => n.id !== 'ai_tutor').map((npc) => (
          <div 
            key={npc.id}
            onClick={() => gameState === GameState.EXPLORING && onInteract(npc)}
            className={`
              relative group cursor-pointer transition-all duration-300
              ${gameState !== GameState.EXPLORING ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-105'}
            `}
          >
            {/* NPC Sprite Placeholder */}
            <div className="w-24 h-48 sm:w-32 sm:h-64 bg-contain bg-no-repeat bg-bottom relative z-10"
                 style={{ backgroundImage: `url(https://picsum.photos/seed/${npc.avatarSeed}/200/400)` }}
            >
               {/* Selection Glow */}
               <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 blur-xl rounded-full transition-opacity"></div>
            </div>

            {/* Name Tag */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 px-2 py-1 rounded text-xs text-white whitespace-nowrap border border-gray-600 group-hover:border-yellow-500">
              {npc.name}
            </div>

            {/* Interaction Prompt */}
            {gameState === GameState.EXPLORING && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                Talk
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};