import React, { useState } from 'react';
import { DialogueInterface } from './DialogueInterface';
import { NPC, ChatMessage } from '../types';

interface PartnerRoomProps {
  onLeave: () => void;
}

export const PartnerRoom: React.FC<PartnerRoomProps> = ({ onLeave }) => {
  // Mock a "Teacher AI" NPC
  const partnerNPC: NPC = {
    id: 'ai_partner',
    name: 'AI Tutor',
    role: 'Language Partner',
    personality: 'Patient, educational, corrects everything.',
    avatarSeed: 'robot',
    intro: 'Hi! Let\'s practice. You can talk about anything.',
    zoneId: 'partner_room',
    hskLevel: 6
  };

  const [history, setHistory] = useState<ChatMessage[]>([{
    sender: 'npc', text: partnerNPC.intro, translation: "Intro", pinyin: "-"
  }]);
  const [isListening, setIsListening] = useState(false);

  // Reusing logic from App.tsx normally, but for isolation we'll just implement simple handling here
  // Note: In a real refactor, we'd extract the "Chat Logic" to a custom hook.
  // For this prototype, I will just render a placeholder since DialogueInterface expects props controlled by parent.
  
  return (
    <div className="absolute inset-0 z-50 bg-indigo-950 flex flex-col items-center justify-center">
       <div className="text-white text-2xl mb-4">Partner Practice Room</div>
       <div className="text-gray-400 mb-8">Connects to Gemini for free talk (Simulated)</div>
       <button onClick={onLeave} className="bg-red-500 px-6 py-2 rounded">Leave</button>
    </div>
  );
};