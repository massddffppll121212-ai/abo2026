import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, ArrowRight, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { playPopSound, playSuccessSound, playStarSound, triggerConfetti } from '../../utils/sound';

interface TalkingCactusScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  playSound?: (text: string) => void;
  addStars: (count: number) => void;
  onBack?: () => void;
}

export type VoiceMode = 'cactus' | 'original' | 'baby' | 'cat' | 'lion';

interface VoiceOption {
  id: VoiceMode;
  name: string;
  icon: string;
  desc: string;
  color: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'cactus',
    name: 'صوت الصبار الراقص 🌵',
    icon: '🌵',
    desc: 'الصوت الرفيع والمضحك مع حركة الصبار',
    color: 'from-emerald-500 to-green-600 border-emerald-400 text-emerald-950',
  },
  {
    id: 'original',
    name: 'صوتك الحقيقي 🎙️',
    icon: '🗣️',
    desc: 'يكرر نفس صوتك تماماً 100% بدون أي تغيير',
    color: 'from-blue-500 to-indigo-600 border-blue-400 text-blue-950',
  },
  {
    id: 'baby',
    name: 'صوت طفل لطيف 👶',
    icon: '🍼',
    desc: 'صوت كرتوني رقيق ومحبوب للأطفال',
    color: 'from-pink-400 to-rose-500 border-pink-300 text-rose-950',
  },
  {
    id: 'cat',
    name: 'صوت قطة لطيفة 🐱',
    icon: '🐱',
    desc: 'صوت مواء ناعم ومرح',
    color: 'from-amber-400 to-orange-500 border-amber-300 text-amber-950',
  },
  {
    id: 'lion',
    name: 'صوت أسد ضخم 🦁',
    icon: '🦁',
    desc: 'صوت عميق وضخم كملك الغابة',
    color: 'from-amber-600 to-red-600 border-amber-500 text-amber-950',
  },
];

export const TalkingCactusScreen: React.FC<TalkingCactusScreenProps> = ({
  setScreen,
  addStars,
  onBack,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceMode>('cactus');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(true);
  const [cactusState, setCactusState] = useState<'idle' | 'listening' | 'dancing'>('idle');
  const [volumeMeter, setVolumeMeter] = useState<number>(0);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string>('');

  // Audio Context and Raw PCM recording refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const recordedBufferRef = useRef<AudioBuffer | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const autoRepeatRef = useRef<boolean>(true);
  const durationTimerRef = useRef<number | null>(null);

  // Sync autoRepeat in ref for process loop
  useEffect(() => {
    autoRepeatRef.current = autoRepeat;
  }, [autoRepeat]);

  // Initialize or resume Web Audio Context
  const getAudioContext = async (): Promise<AudioContext | null> => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Stop any active playback
  const stopPlayback = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Ignore
      }
      currentSourceRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCactusState('idle');
  };

  // Stop Recording
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Stop and release media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Disconnect audio processor nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    setVolumeMeter(0);

    const chunks = pcmChunksRef.current;
    const ctx = audioCtxRef.current;
    if (!chunks.length || !ctx) {
      setCactusState('idle');
      return;
    }

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);

    // If recording was less than 0.25 seconds, don't repeat
    if (totalLength < ctx.sampleRate * 0.25) {
      setCactusState('idle');
      return;
    }

    try {
      // Assemble raw Float32Array PCM samples directly into a native AudioBuffer
      const audioBuffer = ctx.createBuffer(1, totalLength, ctx.sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      let offset = 0;
      for (const chunk of chunks) {
        channelData.set(chunk, offset);
        offset += chunk.length;
      }

      recordedBufferRef.current = audioBuffer;
      setHasRecording(true);

      // Immediately play and repeat user's voice
      setTimeout(() => {
        playRecordedVoice(audioBuffer);
      }, 150);
    } catch (err) {
      console.warn('Error building audio buffer:', err);
      setCactusState('idle');
    }
  };

  // Start Audio Recording using pure uncompressed PCM float32 capture
  const startRecording = async () => {
    playPopSound();
    stopPlayback();
    setMicError('');

    // Resume AudioContext synchronously upon user click
    const ctx = await getAudioContext();
    if (!ctx) {
      setMicError('متصفحك لا يدعم تسجيل الصوت.');
      return;
    }

    pcmChunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Analyser for live volume meter & speech silence detection
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // ScriptProcessor for 100% reliable direct PCM float32 sample streaming
      const bufferSize = 4096;
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = processor;

      isRecordingRef.current = true;
      setIsRecording(true);
      setCactusState('listening');

      let silentFrames = 0;
      let speakingFrames = 0;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Store PCM chunk in RAM
        pcmChunksRef.current.push(new Float32Array(inputData));

        // Calculate instantaneous volume level
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeMeter(Math.min(100, Math.round((avg / 128) * 100)));

        // VAD: Auto-stop and repeat when user finishes speaking (1.2s silence after speech)
        if (autoRepeatRef.current) {
          if (avg > 14) {
            speakingFrames++;
            silentFrames = 0;
          } else if (speakingFrames > 8) {
            silentFrames++;
            if (silentFrames > 22) {
              stopRecording();
            }
          }
        }
      };

      source.connect(processor);

      // Mute gain connected to destination so processor runs without speaker squeal
      const muteGain = ctx.createGain();
      muteGain.gain.value = 0;
      processor.connect(muteGain);
      muteGain.connect(ctx.destination);

      // 12-second max timer
      durationTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 12) {
            stopRecording();
            return 12;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone permission or access error:', err);
      setIsRecording(false);
      isRecordingRef.current = false;
      setCactusState('idle');
      setMicError('يرجى السماح للتطبيق باستخدام المايكروفون عند الضغط على الزر ليتمكن الصبار من سماعك.');
    }
  };

  // Playback mimicking audio with chosen pitch shift and character wobble
  const playRecordedVoice = (buf?: AudioBuffer) => {
    stopPlayback();
    const buffer = buf || recordedBufferRef.current;
    if (!buffer || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Rate for pitch shift
      let rate = 1.62; // Cactus signature chipmunk speed/pitch
      if (selectedVoice === 'original') rate = 1.0;
      else if (selectedVoice === 'baby') rate = 1.35;
      else if (selectedVoice === 'cat') rate = 1.5;
      else if (selectedVoice === 'lion') rate = 0.72;

      source.playbackRate.value = rate;

      // Character Filter
      const filter = ctx.createBiquadFilter();
      if (selectedVoice === 'cactus' || selectedVoice === 'cat') {
        filter.type = 'highpass';
        filter.frequency.value = 320;
      } else if (selectedVoice === 'lion') {
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
      } else {
        filter.type = 'allpass';
      }

      // Authentic tremolo wobble for the dancing cactus
      let lastNode: AudioNode = filter;
      let lfoNode: OscillatorNode | null = null;

      if (selectedVoice === 'cactus') {
        const tremoloGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 7.5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.35;
        lfo.connect(lfoGain);
        lfoGain.connect(tremoloGain.gain);
        lfo.start();
        lfoNode = lfo;

        source.connect(filter);
        filter.connect(tremoloGain);
        lastNode = tremoloGain;
      } else {
        source.connect(filter);
        lastNode = filter;
      }

      // Master volume
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.4;
      lastNode.connect(masterGain);
      masterGain.connect(ctx.destination);

      currentSourceRef.current = source;
      isPlayingRef.current = true;
      setIsPlaying(true);
      setCactusState('dancing');

      source.onended = () => {
        if (lfoNode) {
          try {
            lfoNode.stop();
          } catch {
            // Ignore
          }
        }
        currentSourceRef.current = null;
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCactusState('idle');
        playStarSound();
        triggerConfetti();
        addStars(1);
      };

      source.start(0);
    } catch (err) {
      console.warn('Playback error:', err);
      setIsPlaying(false);
      setCactusState('idle');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 pb-8 text-right">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => {
            playPopSound();
            stopPlayback();
            if (onBack) {
              onBack();
            } else {
              setScreen('games');
            }
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{onBack ? 'العودة للألعاب' : 'الألعاب'}</span>
        </button>

        <span className="text-sm font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-2xl border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
          <span>🌵</span>
          <span>محاكي الصبار الراقص (يسجل ويردد فقط)</span>
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full bg-gradient-to-b from-amber-50 via-emerald-50/50 to-teal-50 rounded-3xl p-6 border-4 border-emerald-300 shadow-2xl relative overflow-hidden text-center space-y-4">
        {/* Stage Disco Lights when Cactus is Dancing and Repeating */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-10 left-1/4 w-36 h-36 bg-yellow-400/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -top-10 right-1/4 w-36 h-36 bg-emerald-400/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-10 left-10 text-3xl animate-bounce-subtle select-none">🎵</div>
            <div className="absolute top-12 right-12 text-3xl animate-bounce select-none">🎶</div>
            <div className="absolute top-20 left-16 text-3xl animate-pulse select-none">✨</div>
          </div>
        )}

        {/* Status Indicator Banner */}
        <div className="relative z-10 flex items-center justify-center">
          <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all flex items-center gap-2 ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : isPlaying
              ? 'bg-emerald-600 text-white'
              : 'bg-white/90 text-slate-700 border border-slate-200'
          }`}>
            {isRecording ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>أنا أسمعك الآن... تكلّم بصوتك! ({recordSeconds}ث)</span>
              </>
            ) : isPlaying ? (
              <>
                <span>🌵</span>
                <span>الصبار يكرر كلامك ويرقص!</span>
              </>
            ) : (
              <>
                <span>👂</span>
                <span>اضغط على الزر الأخضر في الأسفل وتكلّم، وسيردد الصبار كلامك فوراً!</span>
              </>
            )}
          </div>
        </div>

        {/* Visual Dancing Cactus Character */}
        <div className="relative w-56 h-64 sm:w-64 sm:h-72 mx-auto flex flex-col items-center justify-end select-none">
          {/* Dancing Wobble Animation Container */}
          <div className={`relative transition-all duration-150 ${
            cactusState === 'dancing'
              ? 'animate-bounce-subtle scale-105 rotate-3'
              : cactusState === 'listening'
              ? 'scale-105 -rotate-2 drop-shadow-2xl'
              : 'hover:scale-102'
          }`}>
            {/* Cactus Head & Body (SVG Styled Mascot) */}
            <svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
              {/* Left Branch */}
              <path d="M45 90 C25 90 20 60 20 50 C20 40 35 40 35 50 C35 70 45 75 55 80" stroke="#10B981" strokeWidth="18" strokeLinecap="round" />
              <circle cx="28" cy="46" r="4" fill="#047857" />

              {/* Right Branch */}
              <path d="M105 105 C125 105 130 80 130 70 C130 60 115 60 115 70 C115 85 105 92 95 98" stroke="#10B981" strokeWidth="18" strokeLinecap="round" />
              <circle cx="122" cy="65" r="4" fill="#047857" />

              {/* Main Trunk Body */}
              <rect x="48" y="20" width="54" height="135" rx="27" fill="#10B981" stroke="#059669" strokeWidth="4" />

              {/* Cactus Ridges */}
              <path d="M60 26 C60 65 60 120 60 148" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
              <path d="M75 22 C75 65 75 120 75 152" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
              <path d="M90 26 C90 65 90 120 90 148" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />

              {/* Eyes */}
              <circle cx="62" cy="55" r="10" fill="white" stroke="#065F46" strokeWidth="2.5" />
              <circle cx={cactusState === 'dancing' ? 64 : 62} cy={cactusState === 'dancing' ? 53 : 55} r="5" fill="#111827" />
              <circle cx="60" cy="53" r="2" fill="white" />

              <circle cx="88" cy="55" r="10" fill="white" stroke="#065F46" strokeWidth="2.5" />
              <circle cx={cactusState === 'dancing' ? 90 : 88} cy={cactusState === 'dancing' ? 53 : 55} r="5" fill="#111827" />
              <circle cx="86" cy="53" r="2" fill="white" />

              {/* Rosy Cheeks */}
              <circle cx="53" cy="68" r="5" fill="#FB7185" opacity="0.8" />
              <circle cx="97" cy="68" r="5" fill="#FB7185" opacity="0.8" />

              {/* Animated Mouth */}
              {isPlaying ? (
                // Open singing mouth
                <ellipse cx="75" cy="74" rx="9" ry="8" fill="#BE123C" stroke="#881337" strokeWidth="2" />
              ) : cactusState === 'listening' ? (
                // Attentive O mouth
                <circle cx="75" cy="74" r="5" fill="#BE123C" />
              ) : (
                // Smile
                <path d="M66 72 Q75 82 84 72" stroke="#881337" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              )}

              {/* Bowtie */}
              <path d="M63 92 L75 98 L87 92 L75 104 Z" fill="#EF4444" />
              <circle cx="75" cy="96" r="3" fill="#FBBF24" />
            </svg>

            {/* Terracotta Plant Pot */}
            <div className="relative -mt-4 w-32 h-20 mx-auto">
              <div className="w-32 h-6 bg-amber-700 rounded-t-xl border-2 border-amber-900 shadow-md flex items-center justify-center">
                <span className="text-[10px] font-black text-amber-200">عالم أكرم 🌵</span>
              </div>
              <div className="w-28 h-14 mx-auto bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-2xl border-2 border-t-0 border-amber-900 shadow-xl flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Microphone Sound Level Waveform Meter */}
        {isRecording && (
          <div className="space-y-1.5 max-w-sm mx-auto bg-white/90 p-3 rounded-2xl border-2 border-rose-300 animate-fade-in shadow-md">
            <div className="flex items-center justify-between text-xs font-black text-rose-950 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>مستوى التقاط المايكروفون:</span>
              </span>
              <span className="text-rose-600 tabular-nums font-bold">
                {volumeMeter > 10 ? 'صوت مسموع! 🗣️' : 'تكلّم بصوتك...'} ({volumeMeter}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border border-slate-300">
              <div
                className="bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 h-full transition-all duration-75"
                style={{ width: `${Math.max(8, volumeMeter)}%` }}
              />
            </div>
          </div>
        )}

        {/* Mic Permission Error Message */}
        {micError && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{micError}</span>
          </div>
        )}

        {/* PRIMARY ACTION BUTTONS: One-Click Talk & Repeat */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-lg shadow-2xl shadow-emerald-300/60 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border-2 border-emerald-400"
            >
              <Mic className="w-7 h-7 animate-bounce-subtle" />
              <span>اضغط وتكلم مع الصبار 🎙️</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-lg shadow-2xl shadow-rose-300/60 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse border-2 border-rose-300"
            >
              <Square className="w-6 h-6 fill-white" />
              <span>توقّف واستمع للترديد الآن! ⏹️</span>
            </button>
          )}

          {/* Replay Button if there is a saved recording */}
          {hasRecording && !isRecording && (
            <button
              type="button"
              onClick={() => playRecordedVoice()}
              disabled={isPlaying}
              className={`w-full sm:w-auto px-6 py-5 rounded-3xl font-black text-base shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                isPlaying
                  ? 'bg-amber-400 text-amber-950 shadow-amber-200'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-emerald-300'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isPlaying ? 'الصبار يكرر كلامك...' : 'إعادة سماع الترديد 🔁'}</span>
            </button>
          )}
        </div>

        {/* Auto-Repeat Checkbox */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <label className="flex items-center gap-2 bg-white/90 py-2 px-4 rounded-full border border-slate-200 text-xs font-black text-slate-700 cursor-pointer shadow-2xs hover:bg-white transition-all">
            <input
              type="checkbox"
              checked={autoRepeat}
              onChange={(e) => setAutoRepeat(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded-md cursor-pointer"
            />
            <span>التكرار التلقائي فور سكوت المتكلم ⚡</span>
          </label>
        </div>

        {/* Simple & Clean Voice Character Selector */}
        <div className="pt-4 border-t-2 border-emerald-200/80 text-right space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <span>🎭</span>
              <span>اختر نبرة الصوت التي يقلدك بها الصبار:</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              5 نبرات ممتعة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {VOICE_OPTIONS.map((opt) => {
              const isSelected = selectedVoice === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    playPopSound();
                    setSelectedVoice(opt.id);
                    if (hasRecording && !isRecording && !isPlaying) {
                      setTimeout(() => {
                        playRecordedVoice();
                      }, 100);
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? `bg-gradient-to-r ${opt.color} shadow-md border-emerald-500 text-white font-black scale-[1.02]`
                      : 'bg-white/90 border-slate-200 hover:border-emerald-300 text-slate-700 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-2xl select-none shrink-0">{opt.icon}</span>
                    <div className="truncate">
                      <h4 className="text-xs font-black truncate">{opt.name}</h4>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
