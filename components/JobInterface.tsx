import React, { useState } from 'react';
import { Job } from '../types';
import { startListening, stopListening } from '../services/speechService';

interface JobInterfaceProps {
  job: Job;
  onComplete: (earned: number) => void;
  onCancel: () => void;
}

export const JobInterface: React.FC<JobInterfaceProps> = ({ job, onComplete, onCancel }) => {
  const [tasksDone, setTasksDone] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("Press mic and read the text below.");
  
  // Simple mocked tasks
  const phrases = [
    "欢迎光临 (Welcome)",
    "一共五十元 (Total 50 yuan)",
    "请慢走 (Take care)",
    "这里是新闻 (Here is the news)",
    "今日天气晴朗 (Today is sunny)"
  ];
  const currentPhrase = phrases[tasksDone % phrases.length];

  const handleMic = () => {
    setIsListening(true);
    setFeedback("Listening...");
    startListening(
      (text) => {
        setIsListening(false);
        // Simple heuristic matching
        if (text.length > 1) {
          setTasksDone(p => p + 1);
          setFeedback("Great! Next task.");
        } else {
          setFeedback("Too short. Try again.");
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const finishWork = () => {
    onComplete(tasksDone * job.salary);
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/95 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold text-blue-400 mb-2">{job.title}</h2>
      <p className="text-gray-400 mb-8">Salary: ¥{job.salary} / task</p>

      <div className="bg-black/50 p-8 rounded-2xl border border-blue-500/30 w-full max-w-md text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">Task {tasksDone + 1}</p>
        <h3 className="text-4xl font-bold text-white mb-2">{currentPhrase.split(' ')[0]}</h3>
        <p className="text-gray-400">{currentPhrase.split('(')[1].replace(')', '')}</p>
      </div>

      <p className={`mb-8 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>{feedback}</p>

      <div className="flex gap-6">
        <button onClick={handleMic} className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
          🎤
        </button>
      </div>

      <div className="mt-12 flex gap-4">
        <button onClick={finishWork} className="px-6 py-2 bg-green-600 rounded hover:bg-green-500">
          Finish & Collect ¥{tasksDone * job.salary}
        </button>
        <button onClick={onCancel} className="px-6 py-2 border border-gray-600 rounded hover:bg-gray-800">
          Quit
        </button>
      </div>
    </div>
  );
};