import confetti from 'canvas-confetti';

// Audio Context singleton for zero-latency Web Audio effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Web Audio Sound Effects (100% offline, immediate feedback)
export function playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.2, gainValue: number = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio error gracefully
  }
}

// Success chime (arpeggio)
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 'triangle', 0.25, 0.2);
      }, index * 80);
    });
  } catch {
    // Audio context error
  }
}

// Star collected twinkle
export function playStarSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [880, 1174.66, 1318.51, 1760];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.18, 0.18);
      }, index * 60);
    });
  } catch {
    // Audio context error
  }
}

// Gentle soft error / try again tone (not harsh)
export function playTryAgainSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [330, 261.63];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.22, 0.15);
      }, index * 120);
    });
  } catch {
    // Audio context error
  }
}

// Bubble / Balloon pop sound
export function playPopSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore
  }
}

// Sound for counting items (1 to 20 pitch increases pleasantly)
export function playCountSound(index: number) {
  const baseFreq = 300;
  const freq = baseFreq + Math.min(index * 25, 500);
  playTone(freq, 'sine', 0.12, 0.15);
}

// Grand fanfare for achievements and certificates
export function playFanfareSound() {
  try {
    const notes = [
      { f: 523.25, d: 150 },
      { f: 659.25, d: 150 },
      { f: 783.99, d: 150 },
      { f: 1046.5, d: 350 },
      { f: 880, d: 150 },
      { f: 1046.5, d: 500 },
    ];
    let time = 0;
    notes.forEach(({ f, d }) => {
      setTimeout(() => {
        playTone(f, 'triangle', d / 1000, 0.22);
      }, time);
      time += d;
    });
  } catch {
    // Ignore
  }
}

// Play lovely xylophone/glockenspiel note for kids songs interactive accompaniment
export function playKidsChime(freq: number = 659.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore
  }
}

// Speak/chant in a sweet, melodious child's voice (pitch: 1.48, musical pacing)
export function singChildVoice(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-SA';
    // High sweet child pitch
    utterance.pitch = 1.48;
    // Rhythmic singing pace
    utterance.rate = 0.85;

    const femaleVoice = findBestFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) onEnd();
  }
}

// 2. Real Human Female Voice Engine (Studio AI + Enhanced Web Speech API)
let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
const clientAudioCache = new Map<string, string>();

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  };
  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

// Strip emojis, brackets and symbols so the synthesizer never reads emojis mechanically
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[⭐✨🎈🎉👏🏆👑🦁🦆🍎🦊🐪🐎🐑🚲🐺🦒🐟☀️🦅🐸✈️✉️🐦🦌🦋🐵📖🍋🍌🐝🦜🌹🖐️💪💡🔍🏷️✏️🗑️✍️📚🎯🎲⚡➕➖✖️➗]/gu, '')
    .replace(/[()[\]{}«»""'']/g, ' ')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get all detected Arabic voices on the user device
export function getAvailableArabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  return voices.filter(
    (v) => v.lang.startsWith('ar') || v.lang.includes('AR') || v.name.toLowerCase().includes('arabic')
  );
}

// Check if a voice is a female voice
export function isLikelyFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const femaleKeywords = /(salma|zari|laila|layla|mariam|maryam|amina|fatima|hoda|female|نادية|سلمى|ليلى|مريم|أمينة|فاطمة|هدى|عائشة|siri|dfa#female)/i;
  const isMale = /(male|tarik|maged|naif|hamed|espeak)/i.test(voice.name);
  if (isMale) return false;
  return femaleKeywords.test(voice.name) || femaleKeywords.test(voice.voiceURI) || voice.name.includes('Natural') || voice.name.includes('Neural');
}

export function setSelectedVoiceName(name: string) {
  try {
    localStorage.setItem('akram_selected_voice_name', name);
  } catch {
    // Ignore
  }
}

export function getSelectedVoiceName(): string {
  try {
    return localStorage.getItem('akram_selected_voice_name') || '';
  } catch {
    return '';
  }
}

// Find the best real, warm female voice available in the browser
export function findBestFemaleVoice(): SpeechSynthesisVoice | null {
  const arabicVoices = getAvailableArabicVoices();
  if (!arabicVoices.length) return null;

  // 0. User's manually selected preferred voice
  const userPreferred = getSelectedVoiceName();
  if (userPreferred) {
    const match = arabicVoices.find((v) => v.name === userPreferred || v.voiceURI === userPreferred);
    if (match) return match;
  }

  // 1. Specific known high quality female Arabic voices
  const preferredFemale = arabicVoices.find((v) => isLikelyFemaleVoice(v));
  if (preferredFemale) return preferredFemale;

  // 2. Natural / Neural online voices
  const naturalVoice = arabicVoices.find(
    (v) => (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google')) && !/(male|tarik|maged)/i.test(v.name)
  );
  if (naturalVoice) return naturalVoice;

  // 3. Fallback to any non-espeak Arabic voice
  const nonEspeak = arabicVoices.find((v) => !v.name.toLowerCase().includes('espeak'));
  return nonEspeak || arabicVoices[0] || null;
}

// Stop any currently playing speech immediately
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

export function getSpeechPitch(): number {
  try {
    const val = localStorage.getItem('akram_speech_pitch');
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0.5 && num <= 2.0) return num;
    }
  } catch {
    // Ignore
  }
  return 1.22; // Default pleasant warm feminine pitch
}

export function setSpeechPitch(pitch: number) {
  try {
    localStorage.setItem('akram_speech_pitch', String(pitch));
  } catch {
    // Ignore
  }
}

export function getSpeechRate(): number {
  try {
    const val = localStorage.getItem('akram_speech_rate');
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0.5 && num <= 1.8) return num;
    }
  } catch {
    // Ignore
  }
  return 0.92; // Default gentle clear pacing for children
}

export function setSpeechRate(rate: number) {
  try {
    localStorage.setItem('akram_speech_rate', String(rate));
  } catch {
    // Ignore
  }
}

// Web Speech fallback with natural maternal parameters
function speakViaWebSpeech(cleanText: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    // User configurable or natural feminine pitch
    utterance.pitch = getSpeechPitch();
    // User configurable pace
    utterance.rate = getSpeechRate();

    const femaleVoice = findBestFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Web Speech error:', err);
  }
}

// Master speech function: Speaks immediately with real female educator voice (0ms latency, 100% reliable)
export function speakArabic(
  text: string,
  enabled: boolean = true,
  dialect: 'fusha' | 'yemeni' = 'fusha'
) {
  if (!enabled) return;
  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  stopSpeaking();

  const cacheKey = `${dialect}:${clean}`;

  // If already loaded in client cache, play immediately
  if (clientAudioCache.has(cacheKey)) {
    try {
      const audioUrl = clientAudioCache.get(cacheKey)!;
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.play().catch(() => {
        speakViaWebSpeech(clean);
      });
      return;
    } catch {
      // Fallback
    }
  }

  // Speak immediately via natural feminine teacher voice
  speakViaWebSpeech(clean);
}


// 3. Confetti Celebration helper
export function triggerConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B51E0', '#FF9F43'],
      zIndex: 9999,
    });
  } catch {
    // Fallback if canvas-confetti fails
  }
}

export function triggerBigCelebration() {
  try {
    const count = 120;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF8080'],
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.4),
      spread: 80,
    });
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.3),
      spread: 120,
      decay: 0.91,
      scalar: 1.2,
    });
  } catch {
    // Ignore
  }
}
