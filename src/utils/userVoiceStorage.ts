/**
 * User Voice Storage Utility
 * Persistent storage for user and child voice recordings using IndexedDB with localStorage fallback.
 * Allows recording individual letters (أ - ي) and full spoken stories.
 */

const DB_NAME = 'akram_user_voice_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

// Open IndexedDB safely
function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Global active audio element for user voice playback
let activeUserAudio: HTMLAudioElement | null = null;

// Stop any currently playing user voice audio
export function stopUserAudio() {
  if (activeUserAudio) {
    try {
      activeUserAudio.pause();
      activeUserAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeUserAudio = null;
  }
}

// Save a recording (audioDataUrl: data:audio/webm;base64,... or data:audio/wav;base64,...)
export async function saveUserRecording(key: string, audioDataUrl: string): Promise<boolean> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, dataUrl: audioDataUrl, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      // Also save quick key index in localStorage for fast synchronous lookups
      markKeyExists(key, true);
      return true;
    }
    // Fallback to localStorage
    localStorage.setItem(`akram_rec_${key}`, audioDataUrl);
    markKeyExists(key, true);
    return true;
  } catch (err) {
    console.warn('Failed to save user recording:', err);
    try {
      localStorage.setItem(`akram_rec_${key}`, audioDataUrl);
      markKeyExists(key, true);
      return true;
    } catch {
      return false;
    }
  }
}

// Retrieve a recording by key
export async function getUserRecording(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    if (db) {
      const item = await new Promise<{ key: string; dataUrl: string } | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (item && item.dataUrl) return item.dataUrl;
    }
    // Fallback to localStorage
    const local = localStorage.getItem(`akram_rec_${key}`);
    return local;
  } catch {
    return localStorage.getItem(`akram_rec_${key}`);
  }
}

// Delete a recording
export async function deleteUserRecording(key: string): Promise<boolean> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
    localStorage.removeItem(`akram_rec_${key}`);
    markKeyExists(key, false);
    return true;
  } catch {
    localStorage.removeItem(`akram_rec_${key}`);
    markKeyExists(key, false);
    return true;
  }
}

// Synchronous fast check if recording exists
function markKeyExists(key: string, exists: boolean) {
  try {
    const set = getRecordedKeysSet();
    if (exists) set.add(key);
    else set.delete(key);
    localStorage.setItem('akram_rec_keys_index', JSON.stringify(Array.from(set)));
  } catch {
    // Ignore
  }
}

export function getRecordedKeysSet(): Set<string> {
  try {
    const raw = localStorage.getItem('akram_rec_keys_index');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

// Fast check if user has a voice recording for a specific letter
export function hasUserLetterVoice(letter: string): boolean {
  return getRecordedKeysSet().has(`letter_${letter}`);
}

// Fast check if user has a voice recording for a specific story
export function hasUserStoryVoice(storyId: string): boolean {
  return getRecordedKeysSet().has(`story_${storyId}`);
}

// Play user's recorded audio directly
export async function playUserAudio(key: string, onEnd?: () => void): Promise<boolean> {
  stopUserAudio();
  const dataUrl = await getUserRecording(key);
  if (!dataUrl) return false;

  try {
    const audio = new Audio(dataUrl);
    activeUserAudio = audio;
    audio.onended = () => {
      activeUserAudio = null;
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      activeUserAudio = null;
      if (onEnd) onEnd();
    };
    await audio.play();
    return true;
  } catch (err) {
    console.warn('Failed to play user recorded audio:', err);
    if (onEnd) onEnd();
    return false;
  }
}

// Whether user voice is activated as a primary voice of the app
export function isUserVoiceActive(): boolean {
  try {
    const val = localStorage.getItem('akram_use_user_voice');
    // Default to true if user has made at least 1 recording, or user explicit toggle
    return val !== 'false';
  } catch {
    return true;
  }
}

export function setUserVoiceActive(active: boolean) {
  try {
    localStorage.setItem('akram_use_user_voice', String(active));
  } catch {
    // Ignore
  }
}

// Helper to convert Float32Array PCM samples directly to a WAV Data URL
export function pcmToWavDataUrl(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count (mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM float32 samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Convert buffer to base64 data URL
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
