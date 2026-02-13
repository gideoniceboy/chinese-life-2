import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerStats, GameState, NPC, ChatMessage, Job, Ghost, Weather, InventoryItem, ResponseSuggestion, TimeOfDay } from './types';
import { INITIAL_STATS as INIT, ZONES as ZONES_DATA, NPCS as NPCS_DATA, JOBS, SHOP_ITEMS } from './constants';
import { HUD } from './components/HUD';
import { WorldView } from './components/WorldView';
import { DialogueInterface } from './components/DialogueInterface';
import { ExamInterface } from './components/ExamInterface';
import { MinigameInterface } from './components/MinigameInterface';
import { JobInterface } from './components/JobInterface';
import { PartnerRoom } from './components/PartnerRoom';
import { GhostOverlay } from './components/GhostOverlay';
import { generateNPCResponse } from './services/geminiService';
import { startListening, stopListening, speakText, isSpeechSupported } from './services/speechService';
import { saveGame, loadGame } from './services/storageService';
import { audioManager } from './services/audioService';

const App: React.FC = () => {
  // Game State
  const [stats, setStats] = useState<PlayerStats>(INIT);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.EXPLORING);
  const [currentZoneId, setCurrentZoneId] = useState<string>('residential');
  const [currentNPCId, setCurrentNPCId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [weather, setWeather] = useState<Weather>('sunny');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<ResponseSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const currentZone = ZONES_DATA.find(z => z.id === currentZoneId) || ZONES_DATA[0];
  const activeNPC = currentNPCId ? NPCS_DATA[currentNPCId] : null;

  // --- Initialization ---
  useEffect(() => {
    const saved = loadGame();
    setStats(saved.stats);
    setInventory(saved.inventory);
  }, []);

  useEffect(() => {
    saveGame(stats, inventory);
  }, [stats.money, stats.hskLevel, inventory]);

  useEffect(() => {
     if (currentZone.ambientSound) {
        audioManager.playAmbience(currentZone.ambientSound);
     }
  }, [currentZoneId]);

  // --- Time & Weather Loop ---
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) return;

    // Time Cycle (Morning -> Afternoon -> Evening -> Night)
    const timeCycle = setInterval(() => {
       setTimeOfDay(prev => {
          if (prev === 'morning') return 'afternoon';
          if (prev === 'afternoon') return 'evening';
          if (prev === 'evening') return 'night';
          return 'morning';
       });
    }, 45000); // 45s per time of day

    const weatherTimer = setInterval(() => {
       const newWeather = Math.random() > 0.7 ? 'rainy' : 'sunny';
       setWeather(prev => {
          if (newWeather === 'rainy' && prev !== 'rainy') {
             showNotification("It started raining! Buy an umbrella!");
             audioManager.playEffect('rain');
          }
          return newWeather;
       });
    }, 60000);

    const survivalTimer = setInterval(() => {
      setStats(prev => {
        let { hunger, thirst, health, stamina, face, isSick } = prev;
        
        // Decay
        hunger = Math.max(0, hunger - 2); 
        thirst = Math.max(0, thirst - 3); 
        stamina = Math.min(100, stamina + 1);

        // Penalties
        if (hunger === 0) health -= 2;
        if (thirst === 0) health -= 3;
        
        // Rain / Sickness Logic
        const hasUmbrella = inventory.some(i => i.id === 'umbrella');
        const hasRaincoat = inventory.some(i => i.id === 'raincoat');
        if (weather === 'rainy' && !hasUmbrella && !hasRaincoat && gameState === GameState.EXPLORING) {
           // 20% chance to get sick each tick if exploring in rain
           if (!isSick && Math.random() > 0.8) {
              isSick = true;
              showNotification("You caught a cold! Visit Dr. Zhang.");
           }
        }

        if (isSick) {
           health -= 1; // Sickness drains health slowly
           stamina = Math.max(0, stamina - 5); // And drains energy
        }

        // Ghost Haunting Logic
        if (ghosts.length > 0) {
            face = Math.max(0, face - 1);
        }

        if (health <= 0) {
           setGameState(GameState.GAME_OVER);
           health = 0;
        }

        return { ...prev, hunger, thirst, health, stamina, face, isSick };
      });
      
      setGhosts(prev => prev.map(g => ({ ...g, age: g.age + 5 })));

    }, 5000); 

    return () => {
       clearInterval(survivalTimer);
       clearInterval(weatherTimer);
       clearInterval(timeCycle);
    };
  }, [gameState, inventory, weather, ghosts.length]);

  // --- Handlers ---

  const showNotification = (msg: string) => {
     setNotification(msg);
     setTimeout(() => setNotification(null), 4000);
  };

  const spawnGhost = (text: string) => {
     if (Math.random() > 0.3) return;
     const newGhost: Ghost = {
        id: Date.now().toString(),
        word: text.slice(0, 4), 
        pinyin: '?',
        translation: 'Unknown',
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        age: 0
     };
     setGhosts(prev => [...prev, newGhost]);
  };

  const handlePlayerSpeak = useCallback(async (text: string) => {
    
    // Ghost Exorcism
    if (ghosts.length > 0) {
       const hitGhost = ghosts.find(g => text.includes(g.word));
       if (hitGhost) {
          setGhosts(prev => prev.filter(g => g.id !== hitGhost.id));
          audioManager.playEffect('correct');
          setStats(prev => ({ ...prev, face: Math.min(100, prev.face + 5) }));
          return; 
       }
    }

    if (!activeNPC) return;

    setChatHistory(prev => [...prev, { sender: 'player', text } as ChatMessage]);
    setStats(prev => ({ ...prev, stamina: Math.max(0, prev.stamina - 5) }));
    setChatHistory(prev => [...prev, { sender: 'system', text: 'Thinking...', isCorrection: false }]);

    const response = await generateNPCResponse(text, activeNPC, stats, chatHistory);

    setChatHistory(prev => {
      const filtered = prev.filter(m => m.text !== 'Thinking...');
      return [...filtered, { 
        sender: 'npc', 
        text: response.text, 
        translation: response.translation, 
        pinyin: response.pinyin 
      } as ChatMessage];
    });

    if (response.suggestions && response.suggestions.length > 0) {
        setCurrentSuggestions(response.suggestions);
    }

    if (response.faceChange > 0) {
        audioManager.playEffect('correct');
        setStats(prev => ({ 
            ...prev, 
            face: Math.min(100, prev.face + response.faceChange),
            money: prev.money + 5 
        }));
    } else if (response.faceChange < 0) {
        audioManager.playEffect('wrong');
        setStats(prev => ({ ...prev, hunger: Math.max(0, prev.hunger - 5) })); 
        spawnGhost(text); 
        if (stats.face < 30) {
           showNotification("Face is low! Apologize to regain respect.");
        }
    }

    if (activeNPC.id === 'ai_tutor' && response.faceChange > 0) {
        setStats(prev => ({ ...prev, money: prev.money + 10 }));
    }

    // Action Handler
    if (response.action && response.action.type !== 'none') {
        const { type, itemId } = response.action;

        // HEAL
        if (type === 'heal') {
           setStats(prev => ({ ...prev, isSick: false, health: Math.min(100, prev.health + 30) }));
           showNotification("You are cured!");
           audioManager.playEffect('coin');
        }

        // REPORT
        if (type === 'report') {
           setStats(prev => ({ ...prev, face: Math.min(100, prev.face + 20) }));
           showNotification("Report filed. Face restored.");
           audioManager.playEffect('correct');
        }

        // RESTORE
        if (type === 'restore') {
            setStats(prev => ({ 
                ...prev, 
                hunger: Math.min(100, prev.hunger + 50),
                thirst: Math.min(100, prev.thirst + 50)
            }));
            showNotification("Received free food/water!");
            audioManager.playEffect('coin'); 
        }

        // BUY
        if (type === 'buy') {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            // Fuzzy match fallback if ID not perfect
            const matchedItem = item || SHOP_ITEMS.find(i => itemId && itemId.includes(i.id));

            if (matchedItem && stats.money >= matchedItem.price) {
                setStats(prev => ({ ...prev, money: prev.money - matchedItem.price }));
                setInventory(prev => [...prev, { id: matchedItem.id, count: 1 }]);
                showNotification(`Bought ${matchedItem.name}!`);
                
                // Auto consume
                if((matchedItem.type === 'food' && stats.hunger < 70) || (matchedItem.type === 'drink' && stats.thirst < 70)) {
                    setStats(prev => ({ 
                        ...prev, 
                        hunger: matchedItem.type === 'food' ? Math.min(100, prev.hunger + matchedItem.effectValue) : prev.hunger,
                        thirst: matchedItem.type === 'drink' ? Math.min(100, prev.thirst + matchedItem.effectValue) : prev.thirst
                    }));
                    setInventory(prev => {
                        const idx = prev.findIndex(i => i.id === matchedItem.id);
                        if(idx > -1) { const n = [...prev]; n.splice(idx, 1); return n; }
                        return prev;
                    });
                }
                
                // Apply Clothing Effect (Face Boost)
                if (matchedItem.type === 'clothing') {
                   setStats(prev => ({ ...prev, face: Math.min(100, prev.face + matchedItem.effectValue) }));
                   showNotification("You look stylish! (+Face)");
                }
            } else {
                speakText("Not enough money!");
            }
        }
    }

    speakText(response.text);
  }, [activeNPC, stats, chatHistory, ghosts, inventory]);

  const handleToggleRecord = useCallback(() => {
    if (!isSpeechSupported) {
      alert("Web Speech API not supported.");
      return;
    }

    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setErrorMsg(null);
      startListening(
        (text) => {
          setIsListening(false);
          handlePlayerSpeak(text);
        },
        () => setIsListening(false),
        (err) => {
          setIsListening(false);
          setErrorMsg("Mic Error");
        }
      );
    }
  }, [isListening, handlePlayerSpeak]);

  const handleExamComplete = (passed: boolean) => {
    setGameState(GameState.EXPLORING);
    if (passed) {
      setStats(prev => ({ ...prev, hskLevel: prev.hskLevel + 1, money: prev.money + 200 }));
      alert("Exam Passed! Level Up! +¥200");
    } else {
      setStats(prev => ({ ...prev, face: Math.max(0, prev.face - 10) }));
      alert("Exam Failed. -10 Face.");
    }
  };

  const handleMinigameComplete = (score: number) => {
    setGameState(GameState.EXPLORING);
    const reward = Math.floor(score / 5);
    setStats(prev => ({ ...prev, money: prev.money + reward }));
  };

  const handleJobComplete = (earned: number) => {
    setGameState(GameState.EXPLORING);
    setStats(prev => ({ ...prev, money: prev.money + earned, stamina: Math.max(0, prev.stamina - 20) }));
    setActiveJob(null);
  };

  const handleInteract = (npc: NPC) => {
      setCurrentNPCId(npc.id);
      setGameState(GameState.CHATTING);
      setChatHistory([{ sender: 'npc', text: npc.intro, translation: "Greeting", pinyin: "-" }]);
      setCurrentSuggestions(npc.initialSuggestions || []); 
      speakText(npc.intro);
  };

  // --- Render ---
  const zones = ZONES_DATA;
  const currentIndex = zones.findIndex(z => z.id === currentZoneId);
  const nextZone = zones[(currentIndex + 1) % zones.length];
  const prevZone = zones[(currentIndex - 1 + zones.length) % zones.length];

  // Time Filter style
  const getTimeFilter = () => {
     if (timeOfDay === 'night') return 'brightness-50 hue-rotate-15';
     if (timeOfDay === 'evening') return 'sepia brightness-75';
     return '';
  };

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-red-500">
        <h1 className="text-6xl font-bold mb-4">GAME OVER</h1>
        <p className="mb-8">You died from hunger, thirst, or sickness.</p>
        <button onClick={() => {
            setStats(INIT); 
            setInventory([]); 
            setGameState(GameState.EXPLORING);
            saveGame(INIT, []);
        }} className="px-6 py-3 bg-white text-black font-bold rounded">Respawn</button>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen bg-stone-900 font-sans overflow-hidden`}>
      <HUD stats={stats} weather={weather} inventory={inventory} />
      
      {/* Time & Weather Effects */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-all duration-1000 ${getTimeFilter()}`}></div>
      
      {weather === 'rainy' && (
          <div className="absolute inset-0 pointer-events-none z-10 bg-blue-900/20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', animation: 'pulse-ring 0.5s linear infinite'}}></div>
      )}

      {/* Global Notification Toast */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          🔔 {notification}
        </div>
      )}

      {/* Sick Overlay */}
      {stats.isSick && (
         <div className="absolute inset-0 z-10 pointer-events-none bg-green-900/20 flex items-center justify-center">
            <div className="text-6xl opacity-20">🤢</div>
         </div>
      )}

      {gameState === GameState.EXPLORING && (
        <>
            <WorldView 
            zone={currentZone} 
            npcs={currentZone.npcs.map(id => NPCS_DATA[id]).filter(Boolean)}
            onInteract={handleInteract}
            gameState={gameState}
            onOpenExam={() => setGameState(GameState.EXAM)}
            onOpenJobBoard={() => {
                setActiveJob(JOBS.find(j => j.minHsk <= stats.hskLevel) || JOBS[0]);
                setGameState(GameState.WORKING);
            }}
            onOpenMinigame={() => setGameState(GameState.MINIGAME)}
            isZoneLocked={stats.hskLevel < currentZone.minHsk}
            />
            
            <GhostOverlay ghosts={ghosts} />

            <div className="absolute bottom-8 w-full flex justify-center gap-4 pointer-events-auto z-40">
                <button 
                    onClick={() => setCurrentZoneId(prevZone.id)}
                    className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur border border-white/20"
                >
                    ← {prevZone.name}
                </button>
                <div className="bg-black/40 text-white px-3 py-2 rounded text-xs backdrop-blur border border-white/10 uppercase font-bold tracking-wider">
                   {timeOfDay}
                </div>
                <button 
                    onClick={() => setCurrentZoneId(nextZone.id)}
                    className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur border border-white/20"
                >
                    {nextZone.name} →
                </button>
            </div>
            
            {ghosts.length > 0 && (
                 <button 
                 onClick={handleToggleRecord}
                 className="absolute bottom-24 right-4 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center animate-bounce z-40 border-2 border-white"
                 >
                    👻
                 </button>
            )}
        </>
      )}

      {gameState === GameState.EXAM && (
        <ExamInterface hskLevel={stats.hskLevel} onComplete={handleExamComplete} />
      )}
      
      {gameState === GameState.MINIGAME && (
        <MinigameInterface hskLevel={stats.hskLevel} onClose={handleMinigameComplete} />
      )}

      {gameState === GameState.WORKING && activeJob && (
        <JobInterface job={activeJob} onComplete={handleJobComplete} onCancel={() => setGameState(GameState.EXPLORING)} />
      )}

      {gameState === GameState.PARTNER_ROOM && (
        <PartnerRoom onLeave={() => setGameState(GameState.EXPLORING)} />
      )}

      {gameState === GameState.CHATTING && activeNPC && (
        <DialogueInterface 
          npc={activeNPC}
          history={chatHistory}
          suggestions={currentSuggestions}
          isListening={isListening}
          onClose={() => {
              setGameState(GameState.EXPLORING);
              setCurrentNPCId(null);
          }}
          onToggleRecord={handleToggleRecord}
          onSelectSuggestion={(text) => handlePlayerSpeak(text)} 
        />
      )}

      {errorMsg && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg animate-pulse z-50">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default App;