import React, { useEffect, useRef } from 'react';
import { ChatMessage, NPC, ResponseSuggestion } from '../types';

interface DialogueInterfaceProps {
  npc: NPC;
  history: ChatMessage[];
  suggestions: ResponseSuggestion[];
  isListening: boolean;
  onClose: () => void;
  onToggleRecord: () => void;
  onSelectSuggestion?: (text: string) => void; // Optional handler if we want clicking to auto-say
}

export const DialogueInterface: React.FC<DialogueInterfaceProps> = ({ 
  npc, 
  history, 
  suggestions,
  isListening, 
  onClose,
  onToggleRecord,
  onSelectSuggestion
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="absolute inset-x-0 bottom-0 top-20 z-30 bg-black/80 backdrop-blur-sm flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden border-2 border-yellow-600">
            <img src={`https://picsum.photos/seed/${npc.avatarSeed}/100/100`} alt={npc.name} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-500">{npc.name}</h3>
            <p className="text-xs text-gray-400">{npc.role} • Ren (Affinity): Normal</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-3 py-1 border border-red-500 text-red-400 rounded hover:bg-red-500/20 text-sm"
        >
          Leave (离开)
        </button>
      </div>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {history.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'player' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`
                max-w-[80%] p-3 rounded-2xl relative
                ${msg.sender === 'player' 
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-100 rounded-tr-none' 
                  : msg.sender === 'system'
                  ? 'bg-gray-700/50 text-gray-400 text-xs italic mx-auto'
                  : 'bg-stone-700 border border-stone-600 text-stone-100 rounded-tl-none'
                }
              `}
            >
              <div className="text-lg font-medium">{msg.text}</div>
              {msg.pinyin && <div className="text-xs text-gray-400 mt-1 font-mono">{msg.pinyin}</div>}
              {msg.translation && <div className="text-xs text-gray-500 italic mt-0.5">{msg.translation}</div>}
            </div>
            <span className="text-[10px] text-gray-600 mt-1 uppercase">{msg.sender}</span>
          </div>
        ))}
      </div>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-gray-900/40">
           {suggestions.map((s, i) => (
             <button 
                key={i}
                onClick={() => onSelectSuggestion && onSelectSuggestion(s.chinese)} // Allow auto-say if needed
                className="flex-shrink-0 bg-stone-800 border border-stone-600 hover:border-yellow-500 rounded-lg px-3 py-2 text-left transition-colors max-w-[200px]"
             >
                <div className="text-sm font-bold text-yellow-100">{s.chinese}</div>
                <div className="text-xs text-gray-400 font-mono">{s.pinyin}</div>
                <div className="text-[10px] text-gray-500 truncate">{s.english}</div>
             </button>
           ))}
        </div>
      )}

      {/* Mic Controls */}
      <div className="p-6 bg-gradient-to-t from-black via-gray-900 to-transparent flex flex-col items-center justify-center gap-4">
        
        <div className="text-center">
           <p className="text-gray-400 text-sm mb-2">
             {isListening ? "Listening... (Speaking Chinese)" : "Tap microphone to speak"}
           </p>
        </div>

        <button 
          onClick={onToggleRecord}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative
            ${isListening ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-500'}
          `}
        >
          {isListening && <div className="pulse-ring"></div>}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};