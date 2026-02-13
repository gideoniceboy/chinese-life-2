import { PlayerStats, InventoryItem } from '../types';
import { INITIAL_STATS, INITIAL_INVENTORY } from '../constants';

const SAVE_KEY_STATS = 'chinese_life_stats';
const SAVE_KEY_INV = 'chinese_life_inventory';

export const saveGame = (stats: PlayerStats, inventory: InventoryItem[]) => {
  try {
    localStorage.setItem(SAVE_KEY_STATS, JSON.stringify(stats));
    localStorage.setItem(SAVE_KEY_INV, JSON.stringify(inventory));
    console.log('Game Saved');
  } catch (e) {
    console.error('Save failed', e);
  }
};

export const loadGame = (): { stats: PlayerStats; inventory: InventoryItem[] } => {
  try {
    const statsStr = localStorage.getItem(SAVE_KEY_STATS);
    const invStr = localStorage.getItem(SAVE_KEY_INV);
    
    return {
      stats: statsStr ? { ...INITIAL_STATS, ...JSON.parse(statsStr) } : INITIAL_STATS,
      inventory: invStr ? JSON.parse(invStr) : INITIAL_INVENTORY
    };
  } catch (e) {
    console.error('Load failed', e);
    return { stats: INITIAL_STATS, inventory: INITIAL_INVENTORY };
  }
};

export const clearSave = () => {
    localStorage.removeItem(SAVE_KEY_STATS);
    localStorage.removeItem(SAVE_KEY_INV);
};