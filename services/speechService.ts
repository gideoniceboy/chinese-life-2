// Simple wrapper for Web Speech API

// Types for Web Speech API which might not be in standard TS lib
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const win = window as unknown as IWindow;
const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

export const isSpeechSupported = !!SpeechRecognition;

let recognition: any = null;

if (isSpeechSupported) {
  recognition = new SpeechRecognition();
  recognition.continuous = false; // We want short commands/sentences
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

export const startListening = (
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (err: any) => void
) => {
  if (!recognition) return;

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn("Speech recognition already started or error:", e);
  }
};

export const stopListening = () => {
  if (recognition) recognition.stop();
};

export const speakText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.9; // Slightly slower for learners
  window.speechSynthesis.speak(utterance);
};