import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { conductExam } from '../services/geminiService';
import { startListening, stopListening, speakText } from '../services/speechService';

interface ExamInterfaceProps {
  hskLevel: number;
  onComplete: (passed: boolean) => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ hskLevel, onComplete }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'intro' | 'active' | 'grading'>('intro');
  const [isListening, setIsListening] = useState(false);
  const [examinerText, setExaminerText] = useState("准备好了吗？(Are you ready?)");

  useEffect(() => {
    speakText(`HSK ${hskLevel} Exam. Are you ready?`);
  }, []);

  const handleStart = async () => {
    setStatus('active');
    const startMsg = `请做自我介绍。(Please introduce yourself.)`;
    setExaminerText(startMsg);
    setHistory([{ sender: 'examiner', text: startMsg }]);
    speakText(startMsg);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening(
        (text) => {
          setIsListening(false);
          submitAnswer(text);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const submitAnswer = async (text: string) => {
    // Optimistic UI
    const newHistory = [...history, { sender: 'player', text } as ChatMessage];
    setHistory(newHistory);
    setExaminerText("Evaluating...");

    const result = await conductExam(text, hskLevel, newHistory);

    if (result.finished) {
      setStatus('grading');
      setExaminerText(result.passed ? "恭喜你，通过了！(Congratulations, you passed!)" : "很遗憾，没通过。(Sorry, you failed.)");
      speakText(result.passed ? "Pass" : "Fail");
      setTimeout(() => onComplete(result.passed), 3000);
    } else {
      setExaminerText(result.text);
      setHistory(prev => [...prev, { sender: 'examiner', text: result.text }]);
      speakText(result.text);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-stone-900 flex flex-col items-center p-8">
      <div className="w-full max-w-md bg-stone-800 p-6 rounded-xl border border-yellow-600/50 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-yellow-500 mb-6">HSK {hskLevel} Oral Exam</h2>
        
        <div className="h-64 overflow-y-auto mb-6 bg-black/30 rounded p-4 border border-gray-700">
           {history.map((m, i) => (
             <div key={i} className={`mb-2 ${m.sender === 'examiner' ? 'text-yellow-200' : 'text-white text-right'}`}>
               <span className="text-xs text-gray-500 block">{m.sender.toUpperCase()}</span>
               {m.text}
             </div>
           ))}
           {status === 'active' && history.length === 0 && <p className="text-gray-500 text-center">Press Start...</p>}
        </div>

        <div className="text-center">
           <div className="text-xl text-white mb-8 min-h-[3rem]">{examinerText}</div>
           
           {status === 'intro' ? (
             <button onClick={handleStart} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-full">
               Start Exam
             </button>
           ) : status === 'active' ? (
             <button 
               onClick={handleMicToggle}
               className={`w-20 h-20 rounded-full border-4 ${isListening ? 'border-red-500 bg-red-500/20 animate-pulse' : 'border-gray-500 bg-gray-700'}`}
             >
               🎤
             </button>
           ) : (
             <div className="text-yellow-500 font-bold">Finishing...</div>
           )}
        </div>
      </div>
    </div>
  );
};