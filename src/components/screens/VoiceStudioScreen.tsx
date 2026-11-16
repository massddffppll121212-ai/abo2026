import React, { useState, useEffect, useRef } from 'react';
import { ARABIC_LETTERS } from '../../data/arabicData';
import { getUserStories } from '../../utils/contentSync';
import { 
  saveUserRecording, 
  getUserRecording, 
  deleteUserRecording, 
  hasUserLetterVoice, 
  hasUserStoryVoice, 
  isUserVoiceActive, 
  setUserVoiceActive, 
  playUserAudio, 
  stopUserAudio,
  pcmToWavDataUrl 
} from '../../utils/userVoiceStorage';
import { playPopSound, playSuccessSound, playStarSound, triggerConfetti } from '../../utils/sound';
import { 
  Mic, 
  Square, 
  Play, 
  Trash2, 
  Check, 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  BookOpen, 
  Languages, 
  AlertCircle, 
  Star,
  CheckCircle2
} from 'lucide-react';

interface VoiceStudioScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  playSound?: (text: string) => void;
  addStars?: (count: number) => void;
}

export const VoiceStudioScreen: React.FC<VoiceStudioScreenProps> = ({
  setScreen,
  addStars,
}) => {
  const [activeTab, setActiveTab] = useState<'letters' | 'stories'>('letters');
  const [selectedLetter, setSelectedLetter] = useState(ARABIC_LETTERS[0]);
  const [storiesList, setStoriesList] = useState(getUserStories());
  const [selectedStory, setSelectedStory] = useState(storiesList[0] || null);

  // User voice master activation
  const [userVoiceEnabled, setUserVoiceEnabled] = useState(isUserVoiceActive());

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeMeter, setVolumeMeter] = useState(0);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const durationTimerRef = useRef<number | null>(null);

  // Check stats
  const recordedLettersCount = ARABIC_LETTERS.filter((l) => hasUserLetterVoice(l.letter)).length;
  const recordedStoriesCount = storiesList.filter((s) => hasUserStoryVoice(s.id)).length;

  useEffect(() => {
    setStoriesList(getUserStories());
  }, []);

  const handleToggleUserVoice = (enabled: boolean) => {
    playPopSound();
    setUserVoiceEnabled(enabled);
    setUserVoiceActive(enabled);
    if (enabled) {
      playSuccessSound();
    }
  };

  // Start direct PCM audio recording
  const startRecording = async (targetType: 'letter' | 'story') => {
    playPopSound();
    stopUserAudio();
    setIsPlaying(false);
    setMicError('');

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      setMicError('متصفحك لا يدعم تسجيل الصوت.');
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
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

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferSize = 4096;
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = processor;

      isRecordingRef.current = true;
      setIsRecording(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(inputData));

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setVolumeMeter(Math.min(100, Math.round((avg / 128) * 100)));
      };

      source.connect(processor);

      const muteGain = ctx.createGain();
      muteGain.gain.value = 0;
      processor.connect(muteGain);
      muteGain.connect(ctx.destination);

      const maxTime = targetType === 'letter' ? 10 : 120; // 10s for letter, 2min for story

      durationTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= maxTime) {
            stopRecordingAndSave(targetType);
            return maxTime;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      setIsRecording(false);
      isRecordingRef.current = false;
      setMicError('يرجى السماح للتطبيق باستخدام المايكروفون لتسجيل صوتك.');
    }
  };

  // Stop recording and save to persistent storage
  const stopRecordingAndSave = async (targetType: 'letter' | 'story') => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

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
    if (!chunks.length || !ctx) return;

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    if (totalLength < ctx.sampleRate * 0.3) {
      setMicError('التسجيل قصير جداً، يرجى التحدث بوضوح وإعادة المحاولة.');
      return;
    }

    // Merge Float32Array
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to uncompressed WAV Data URL
    const wavUrl = pcmToWavDataUrl(merged, ctx.sampleRate);
    const key = targetType === 'letter' ? `letter_${selectedLetter.letter}` : `story_${selectedStory.id}`;

    await saveUserRecording(key, wavUrl);
    setRefreshTrigger((prev) => prev + 1);
    playSuccessSound();
    triggerConfetti();
    if (addStars) addStars(2);
  };

  // Play test
  const handlePlayRecording = async (key: string) => {
    playPopSound();
    stopUserAudio();
    setIsPlaying(true);
    await playUserAudio(key, () => {
      setIsPlaying(false);
    });
  };

  // Delete
  const handleDeleteRecording = async (key: string) => {
    playPopSound();
    stopUserAudio();
    setIsPlaying(false);
    await deleteUserRecording(key);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopUserAudio();
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

  const currentLetterKey = `letter_${selectedLetter.letter}`;
  const isCurrentLetterRecorded = hasUserLetterVoice(selectedLetter.letter);

  const currentStoryKey = selectedStory ? `story_${selectedStory.id}` : '';
  const isCurrentStoryRecorded = selectedStory ? hasUserStoryVoice(selectedStory.id) : false;

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 pb-12 text-right">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => {
            playPopSound();
            stopUserAudio();
            setScreen('home');
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <span className="text-sm font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-2xl border border-purple-300 flex items-center gap-1.5 shadow-2xs">
          <span>🎙️</span>
          <span>استوديو تسجيل صوتك (لغة أصلية للبرنامج)</span>
        </span>
      </div>

      {/* Hero Studio Banner */}
      <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-2 left-4 text-3xl opacity-30 select-none">🎙️</div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              تسجيل وحفظ صوت الطفل والأهل
            </span>
            <span className="text-xs font-bold text-purple-100">
              ⭐ {recordedLettersCount}/28 حرف مسجل
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            اجعل صوتك أو صوت طفلك هو الناطق الرسمي للبرنامج!
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 font-medium">
            سجل نطق الحروف الهجائية، أو احكِ قصة بصوتك الدافئ، وسيتم حفظ التسجيل الدائم وتشغيله للطفل بدلاً من الصوت الآلي.
          </p>

          {/* Master Switch */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-2xl cursor-pointer transition-all border border-white/30 text-xs sm:text-sm font-black">
              <input
                type="checkbox"
                checked={userVoiceEnabled}
                onChange={(e) => handleToggleUserVoice(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded-md cursor-pointer"
              />
              <span>تفعيل صوتي المسجل كلغة أساسية في الحروف والقصص 🌟</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Letters / Stories */}
      <div className="grid grid-cols-2 gap-2 w-full p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => {
            playPopSound();
            stopUserAudio();
            setActiveTab('letters');
          }}
          className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'letters'
              ? 'bg-white text-purple-700 shadow-md border border-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>تسجيل الحروف الهجائية ({recordedLettersCount}/28)</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            stopUserAudio();
            setActiveTab('stories');
          }}
          className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'stories'
              ? 'bg-white text-purple-700 shadow-md border border-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>حكاية وتسجيل القصص ({recordedStoriesCount})</span>
        </button>
      </div>

      {/* TAB 1: Letters Studio */}
      {activeTab === 'letters' && (
        <div className="w-full space-y-4">
          {/* Active Letter Recording Stage */}
          <div className="w-full bg-white rounded-3xl p-6 border-4 border-purple-200 shadow-xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                الحرف المحدد: <strong className="text-purple-700 font-black">{selectedLetter.name}</strong>
              </span>

              {isCurrentLetterRecorded ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم التسجيل بصوتك!</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  لم يسجل بعد
                </span>
              )}
            </div>

            {/* Letter Big Display Card */}
            <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex flex-col items-center justify-center shadow-lg border-4 border-purple-200">
              <span className="text-5xl font-black leading-none">{selectedLetter.letter}</span>
              <span className="text-xs font-bold mt-1 text-purple-100">
                {selectedLetter.word} {selectedLetter.emoji}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-bold max-w-sm mx-auto">
              اضغط على زر التسجيل وتكلّم بصوتك قائلاً: ({selectedLetter.name} - {selectedLetter.word})
            </p>

            {/* Live Volume Meter while recording */}
            {isRecording && (
              <div className="space-y-1.5 max-w-xs mx-auto bg-purple-50 p-3 rounded-2xl border-2 border-purple-300 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-black text-purple-950 px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>جارٍ التسجيل... ({recordSeconds}ث)</span>
                  </span>
                  <span className="text-purple-700">{volumeMeter > 10 ? 'صوت مسموع! 🗣️' : 'تكلّم...'}</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-75"
                    style={{ width: `${Math.max(8, volumeMeter)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {micError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{micError}</span>
              </div>
            )}

            {/* Record / Stop Button */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={() => startRecording('letter')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm sm:text-base shadow-lg shadow-purple-200 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>ابدأ تسجيل صوتك لهذا الحرف 🎙️</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => stopRecordingAndSave('letter')}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>إيقاف وحفظ التسجيل 💾</span>
                </button>
              )}

              {/* Play Recorded Voice */}
              {isCurrentLetterRecorded && !isRecording && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayRecording(currentLetterKey)}
                    disabled={isPlaying}
                    className="px-4 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isPlaying ? 'استماع...' : 'استمع لصوتك ▶️'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRecording(currentLetterKey)}
                    className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all active:scale-95 cursor-pointer"
                    title="حذف هذا التسجيل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 28 Letters Grid Picker */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <span>🔤</span>
                <span>اختر أي حرف لتسجيله بصوتك:</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">28 حرفاً</span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-7 gap-2">
              {ARABIC_LETTERS.map((letter) => {
                const isSelected = selectedLetter.letter === letter.letter;
                const isRec = hasUserLetterVoice(letter.letter);
                return (
                  <button
                    key={letter.letter}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setSelectedLetter(letter);
                      if (isRec) {
                        handlePlayRecording(`letter_${letter.letter}`);
                      }
                    }}
                    className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md scale-105 border-2 border-purple-400 font-black'
                        : isRec
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-300 font-black'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-2xl leading-none">{letter.letter}</span>
                    {isRec && (
                      <span className="absolute top-1 left-1 text-[9px] bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stories Studio */}
      {activeTab === 'stories' && (
        <div className="w-full space-y-4">
          {/* Stories List Selector */}
          <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
              <span>📖</span>
              <span>اختر القصة التي تريد قراءتها وحكايتها بصوتك:</span>
            </h3>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {storiesList.map((story) => {
                const isSelected = selectedStory?.id === story.id;
                const isRec = hasUserStoryVoice(story.id);
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setSelectedStory(story);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                        : isRec
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{story.emoji}</span>
                    <span className="truncate max-w-[120px]">{story.title}</span>
                    {isRec && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">مسجلة ✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reading & Recording Canvas */}
          {selectedStory && (
            <div className="w-full bg-white rounded-3xl p-6 border-4 border-purple-200 shadow-xl space-y-4 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-purple-600 block">حكاية قصة بصوتك</span>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                    <span>{selectedStory.emoji}</span>
                    <span>{selectedStory.title}</span>
                  </h3>
                </div>

                {isCurrentStoryRecorded ? (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>القصة مسجلة بصوتك!</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    غير مسجلة
                  </span>
                )}
              </div>

              {/* Story Text to Read from Screen */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-amber-900/80 block">
                  📜 اقرأ هذا النص بصوتك اللطيف أثناء التسجيل:
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                  {selectedStory.text}
                </p>
                {selectedStory.moral && (
                  <p className="text-xs font-bold text-amber-800 pt-2 border-t border-amber-200/60">
                    💡 العبرة: {selectedStory.moral}
                  </p>
                )}
              </div>

              {/* Live Volume Meter while recording */}
              {isRecording && (
                <div className="space-y-1.5 max-w-sm mx-auto bg-purple-50 p-3 rounded-2xl border-2 border-purple-300 animate-fade-in text-center">
                  <div className="flex items-center justify-between text-xs font-black text-purple-950 px-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>جارٍ تسجيل القصة... ({recordSeconds}ث)</span>
                    </span>
                    <span className="text-purple-700">{volumeMeter > 10 ? 'صوت مسموع! 🗣️' : 'تكلّم...'}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-75"
                      style={{ width: `${Math.max(8, volumeMeter)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {micError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={() => startRecording('story')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm sm:text-base shadow-lg shadow-purple-200 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5 animate-pulse" />
                    <span>ابدأ حكاية القصة وتسجيلها 🎙️</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => stopRecordingAndSave('story')}
                    className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    <span>إنهاء وحفظ حكاية القصة 💾</span>
                  </button>
                )}

                {/* Play and Delete */}
                {isCurrentStoryRecorded && !isRecording && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayRecording(currentStoryKey)}
                      disabled={isPlaying}
                      className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isPlaying ? 'استماع للقصة...' : 'استمع لحكايتك ▶️'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecording(currentStoryKey)}
                      className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all active:scale-95 cursor-pointer"
                      title="حذف تسجيل هذه القصة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
