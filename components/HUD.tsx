import React from 'react';
import { PlayerStats, Weather, InventoryItem } from '../types';

interface HUDProps {
  stats: PlayerStats;
  weather: Weather;
  inventory: InventoryItem[];
}

export const HUD: React.FC<HUDProps> = ({ stats, weather, inventory }) => {
  const getHealthColor = (val: number) => val < 30 ? 'bg-red-600' : 'bg-green-500';
  const getBarColor = (val: number) => val < 30 ? 'bg-red-500 animate-pulse' : 'bg-blue-400';

  const hasUmbrella = inventory.some(i => i.id === 'umbrella');
  const hasRaincoat = inventory.some(i => i.id === 'raincoat');

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      
      {/* Left: Vitals */}
      <div className="flex flex-col gap-1 w-48 font-mono text-sm shadow-black drop-shadow-md">
        {/* Health */}
        <div className="flex items-center gap-2">
          <span className="w-6 text-center">❤️</span>
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div className={`h-full ${getHealthColor(stats.health)}`} style={{ width: `${stats.health}%` }} />
          </div>
          <span className="text-xs w-8">{Math.floor(stats.health)}</span>
        </div>

        {/* Hunger */}
        <div className="flex items-center gap-2">
          <span className="w-6 text-center">🍚</span>
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div className={`h-full ${stats.hunger < 30 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${stats.hunger}%` }} />
          </div>
          <span className="text-xs w-8">{Math.floor(stats.hunger)}</span>
        </div>

        {/* Thirst */}
        <div className="flex items-center gap-2">
          <span className="w-6 text-center">💧</span>
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div className={`h-full ${getBarColor(stats.thirst)}`} style={{ width: `${stats.thirst}%` }} />
          </div>
          <span className="text-xs w-8">{Math.floor(stats.thirst)}</span>
        </div>

        {/* Indicators */}
        <div className="mt-2 flex flex-wrap gap-2 items-center">
           <span className="text-xl" title={weather}>{weather === 'sunny' ? '☀️' : '🌧️'}</span>
           {weather === 'rainy' && !hasUmbrella && !hasRaincoat && (
             <span className="text-red-400 text-xs animate-pulse bg-black/50 px-1 rounded">Need Umbrella!</span>
           )}
           {weather === 'rainy' && (hasUmbrella || hasRaincoat) && (
             <span className="text-green-400 text-xs bg-black/50 px-1 rounded">Protected ☂️</span>
           )}
           {stats.isSick && (
             <span className="text-green-300 text-xs bg-green-900/50 px-1 rounded border border-green-500 animate-pulse">🤢 SICK (Find Doctor)</span>
           )}
        </div>
      </div>

      {/* Center: HSK */}
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 w-14 h-14 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg">
          <span className="font-bold text-white text-lg">HSK{stats.hskLevel}</span>
        </div>
        <div className="bg-black/50 px-2 py-0.5 rounded text-xs mt-1 border border-white/20">
           Lvl {stats.hskLevel} Beginner
        </div>
        <div className="bg-purple-900/80 px-2 py-0.5 rounded text-xs mt-1 border border-purple-400 text-purple-200">
           Face: {stats.face}
        </div>
      </div>

      {/* Right: Money & Inventory */}
      <div className="flex flex-col items-end gap-1">
         <div className="flex items-center gap-2 bg-yellow-900/60 px-4 py-1 rounded-full border border-yellow-500">
            <span className="text-yellow-400 font-bold font-mono">¥ {stats.money}</span>
         </div>
         <div className="bg-black/50 p-2 rounded border border-gray-600 mt-2">
            <p className="text-xs text-gray-400 mb-1">Backpack:</p>
            <div className="flex gap-1 flex-wrap max-w-[120px] justify-end">
               {inventory.length === 0 && <span className="text-gray-600 text-xs">Empty</span>}
               {inventory.map((item, i) => (
                  <div key={i} className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs border border-gray-500 cursor-help" title={item.id}>
                     {item.id === 'umbrella' ? '☂️' : item.id === 'water' ? '💧' : item.id === 'baozi' ? '🥟' : item.id === 'jacket' ? '🧥' : item.id === 'raincoat' ? '🧥' : '📦'}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};