import React, { useState, useEffect, useRef } from 'react';
import { FALLING_WORDS } from '../constants';
import { startListening, stopListening } from '../services/speechService';

interface MinigameInterfaceProps {
  onClose: (score: number) => void;
  hskLevel: number;
}

export const MinigameInterface: React.FC<MinigameInterfaceProps> = ({ onClose, hskLevel }) => {
  const [score, setScore] = useState(0);
  const [activeWord, setActiveWord] = useState<{ text: string; pinyin: string; x: number; y: number } | null>(null);
  const [gameTime, setGameTime] = useState(30);
  const [lastSpoken, setLastSpoken] = useState("");
  // Fix: Initialize useRef with 0
  const requestRef = useRef<number>(0);
  
  // Select words suitable for level (up to user's HSK)
  const availableWords = FALLING_WORDS.filter(w => w.hsk <= hskLevel + 1);

  const spawnWord = () => {
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setActiveWord({
      ...randomWord,
      x: Math.random() * 80 + 10, // 10% to 90% width
      y: -10
    });
  };

  useEffect(() => {
    spawnWord();
    
    // Start listening loop
    const listenLoop = () => {
      startListening(
        (text) => {
           setLastSpoken(text);
           // Simple fuzzy match check
           if (activeWord && text.includes(activeWord.text)) {
             setScore(s => s + 10);
             spawnWord(); // Instant respawn on success
           }
        },
        () => {
           // Restart listening immediately
           setTimeout(listenLoop, 100);
        },
        (err) => console.log("Mic err", err)
      );
    };

    listenLoop();

    return () => stopListening();
  }, []);

  // Game Loop for gravity and timer
  useEffect(() => {
    const tick = () => {
      setGameTime(t => {
        if (t <= 0) {
          onClose(score);
          return 0;
        }
        return t - 0.05;
      });

      setActiveWord(prev => {
        if (!prev) return null;
        const newY = prev.y + 0.3; // Fall speed
        if (newY > 100) {
          spawnWord(); // Missed it
          return null; 
        }
        return { ...prev, y: newY };
      });

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [score, activeWord]); // Dep on score to ensure closure captures latest state if needed

  return (
    <div className="absolute inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-4 right-4 text-3xl font-bold text-yellow-400">
        Score: {score}
      </div>
      <div className="absolute top-4 left-4 text-2xl font-bold text-red-400">
        Time: {Math.ceil(gameTime)}s
      </div>

      <div className="absolute top-20 text-gray-500 text-sm">
        Say the word before it falls!
      </div>

      <div className="absolute bottom-10 text-center">
         <p className="text-gray-400">You said:</p>
         <p className="text-2xl text-white font-mono">{lastSpoken}</p>
      </div>

      {activeWord && (
        <div 
          className="absolute text-center p-4 bg-stone-800 border-2 border-yellow-500 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.5)]"
          style={{ left: `${activeWord.x}%`, top: `${activeWord.y}%` }}
        >
          <div className="text-4xl font-bold text-white">{activeWord.text}</div>
          <div className="text-lg text-yellow-200">{activeWord.pinyin}</div>
        </div>
      )}
    </div>
  );
};