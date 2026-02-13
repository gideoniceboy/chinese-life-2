import { GoogleGenAI } from "@google/genai";
import { NPC, PlayerStats, ChatMessage, Item, ResponseSuggestion } from '../types';
import { SHOP_ITEMS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNPCResponse = async (
  playerInput: string,
  npc: NPC,
  playerStats: PlayerStats,
  history: ChatMessage[]
): Promise<{ 
  text: string; 
  faceChange: number; 
  translation: string; 
  pinyin: string; 
  action?: { type: 'buy' | 'eat' | 'restore' | 'heal' | 'report' | 'none'; itemId?: string; cost?: number };
  suggestions: ResponseSuggestion[];
}> => {
  
  if (!process.env.API_KEY) return mockResponse("API Key Missing");

  const modelId = 'gemini-3-flash-preview';
  const historyText = history.slice(-6).map(h => `${h.sender}: ${h.text}`).join('\n');
  
  // Available items
  const availableItems = (npc.shopInventory || [])
    .map(id => {
      const item = SHOP_ITEMS.find(i => i.id === id);
      return item ? `${item.name} (ID: ${item.id}, Price: ${npc.isVendor ? item.price : 0})` : "";
    })
    .filter(Boolean)
    .join(', ');

  // Instruction Tuning
  let complexityInstruction = "";
  if (playerStats.hskLevel === 1) {
    complexityInstruction = "USE EXTREMELY SIMPLE CHINESE. Short sentences. Max 5-8 words.";
  } else {
    complexityInstruction = `Match vocabulary complexity to HSK ${npc.hskLevel}.`;
  }

  // Role Instruction Update
  let roleInstruction = "";
  if (npc.role === 'Doctor') {
    roleInstruction = "You are a Doctor. If user says they are sick, hurt, or not feeling well, HEAL them (action type: 'heal'). Cost is 50 yuan usually but free if they are poor.";
  } else if (npc.role === 'Police') {
    roleInstruction = "You are Police. If user reports a lost item or crime, RESTORE their Face/Reputation (action type: 'report').";
  } else if (npc.isVendor) {
    roleInstruction = "You are a vendor. If user wants to buy, charge them (action type: 'buy').";
  } else {
    roleInstruction = "You are a generous neighbor. If user is hungry/thirsty, GIVE food/water (action type: 'restore').";
  }

  const prompt = `
    Role: You are ${npc.name}, a ${npc.role}. Personality: ${npc.personality}.
    Player Level: HSK ${playerStats.hskLevel}.
    Player Status: Sick=${playerStats.isSick}, Hunger=${playerStats.hunger}.
    User Input: "${playerInput}"
    
    Inventory: ${availableItems || "None"}
    ${roleInstruction}

    Task:
    1. ${complexityInstruction}
    2. Respond to the player.
    3. DETECT INTENT: 
       - 'buy' : Buying items.
       - 'restore' : Free food/water (Neighbor).
       - 'heal' : Doctor curing sickness.
       - 'report' : Police helping (restores Face).
    4. SUGGEST: Provide 3 simple phrases for the user.

    Output JSON:
    {
      "chineseResponse": "string",
      "pinyin": "string",
      "englishTranslation": "string",
      "faceChange": number,
      "action": { "type": "buy" | "eat" | "restore" | "heal" | "report" | "none", "itemId": "string" },
      "suggestions": [
        { "chinese": "string", "pinyin": "string", "english": "string" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      text: data.chineseResponse || "...",
      faceChange: data.faceChange || 0,
      translation: data.englishTranslation || "",
      pinyin: data.pinyin || "",
      action: data.action,
      suggestions: data.suggestions || []
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return mockResponse("I didn't understand...");
  }
};

// ... existing conductExam ...
export const conductExam = async (
  playerInput: string,
  hskLevel: number,
  history: ChatMessage[]
): Promise<{ text: string; passed: boolean; finished: boolean; translation: string; pinyin: string }> => {
  
  if (!process.env.API_KEY) return { text: "No API Key", passed: false, finished: true, translation: "Error", pinyin: "Error" };

  const modelId = 'gemini-3-flash-preview';
  const historyText = history.map(h => `${h.sender}: ${h.text}`).join('\n');

  const prompt = `
    You are an HSK Examiner. Level: ${hskLevel}.
    History: ${historyText}
    Input: "${playerInput}"
    Task: Ask 3 questions total. Evaluate answers.
    Output JSON: { "examinerResponse": "string", "pinyin": "string", "translation": "string", "finished": boolean, "passed": boolean }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      text: data.examinerResponse || "Error",
      passed: data.passed || false,
      finished: data.finished || false,
      translation: data.translation || "",
      pinyin: data.pinyin || ""
    };
  } catch (e) {
    return { text: "Connection Error", passed: false, finished: true, translation: "Error", pinyin: "" };
  }
};

const mockResponse = (msg: string) => ({
  text: msg, faceChange: 0, translation: msg, pinyin: "", action: { type: 'none' as const }, suggestions: []
});