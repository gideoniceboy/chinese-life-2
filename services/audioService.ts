// Simple mock audio service. 
// In a real app, you would load MP3 files here.
// We will simply log playing for now, or use browser synthesis for effects.

class AudioService {
    private currentAmbience: string | null = null;
    
    playAmbience(type: string) {
        if (this.currentAmbience === type) return;
        this.currentAmbience = type;
        console.log(`🎵 Playing Ambience: ${type}`);
        // In real impl: audioEl.src = `/assets/sounds/${type}.mp3`; audioEl.play();
    }

    playEffect(type: 'correct' | 'wrong' | 'coin' | 'rain') {
        console.log(`🔊 Effect: ${type}`);
        // Simple beep for feedback
        if (type === 'correct') this.beep(600, 100);
        if (type === 'wrong') this.beep(200, 300);
    }

    private beep(freq: number, duration: number) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), duration);
    }
}

export const audioManager = new AudioService();