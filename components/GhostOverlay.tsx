import React from 'react';
import { Ghost } from '../types';
import { speakText } from '../services/speechService';

interface GhostOverlayProps {
  ghosts: Ghost[];
}

export const GhostOverlay: React.FC<GhostOverlayProps> = ({ ghosts }) => {
  if (ghosts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {ghosts.map(ghost => (
        <div 
          key={ghost.id}
          className="absolute animate-bounce transition-all duration-1000 pointer-events-auto cursor-help"
          style={{ 
            left: `${ghost.x}%`, 
            top: `${ghost.y}%`,
            opacity: 0.85
          }}
          onClick={() => speakText(ghost.word)}
        >
          <div className="bg-stone-800/90 p-3 rounded-xl border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] text-center transform hover:scale-110 transition-transform">
             <div className="text-3xl text-purple-300 drop-shadow">👻</div>
             <div className="text-white font-bold text-lg">{ghost.word}</div>
             <div className="text-xs text-purple-200 font-mono">{ghost.pinyin}</div>
             <div className="text-[10px] text-gray-400 mt-1">Tap to listen • Say to kill</div>
             
             {/* Simple health/age indicator if needed, or just visual flair */}
             {ghost.age > 30 && (
                <div className="w-full h-1 bg-red-900 mt-1 rounded">
                   <div className="h-full bg-red-500 animate-pulse w-full"></div>
                </div>
             )}
          </div>
        </div>
      ))}
      
      {ghosts.length > 0 && (
          <div className="absolute top-20 w-full text-center pointer-events-none">
             <p className="text-purple-400 font-bold bg-black/50 inline-block px-4 py-1 rounded-full animate-pulse border border-purple-500/50">
                Warning: Ghosts are draining your Face!
             </p>
          </div>
      )}
    </div>
  );
};