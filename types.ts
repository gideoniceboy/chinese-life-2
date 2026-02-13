export interface PlayerStats {
  health: number;
  hunger: number;
  thirst: number; 
  stamina: number;
  money: number;
  face: number;
  hskLevel: number;
  isSick: boolean; // New status effect
}

export interface InventoryItem {
  id: string;
  count: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  type: 'food' | 'drink' | 'tool' | 'medicine' | 'clothing';
  effectValue: number; 
}

export interface ResponseSuggestion {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatarSeed: string;
  intro: string;
  zoneId: string;
  hskLevel: number;
  isVendor?: boolean; 
  shopInventory?: string[]; 
  initialSuggestions?: ResponseSuggestion[]; 
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  imageSeed: string;
  npcs: string[];
  minHsk: number;
  ambientSound?: string; 
}

export interface Job {
  id: string;
  title: string;
  description: string;
  minHsk: number;
  salary: number;
  type: 'repetition' | 'translation';
}

export interface ChatMessage {
  sender: 'player' | 'npc' | 'system' | 'examiner';
  text: string;
  pinyin?: string;
  translation?: string;
  isCorrection?: boolean;
}

export interface Ghost {
  id: string;
  word: string;
  pinyin: string;
  translation: string;
  x: number;
  y: number;
  age: number; 
}

export enum GameState {
  EXPLORING,
  CHATTING,
  SHOPPING,
  WORKING,
  MINIGAME,
  EXAM,
  PARTNER_ROOM,
  GAME_OVER,
  GHOST_BATTLE 
}

export type Weather = 'sunny' | 'rainy';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';