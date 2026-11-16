import React, { useState, useEffect, useRef } from 'react';
import { QURAN_SURAHS, QuranSurah } from '../../data/quranData';
import { playPopSound, playSuccessSound, playKidsChime, speakArabic, stopSpeaking, triggerConfetti } from '../../utils/sound';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, BookOpen, Volume2, Sparkles, Star, Download, HeartHandshake, Shield, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Dialect } from '../../utils/phrases';

interface QuranScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'settings') => void;
  playSound: (text: string) => void;
  addStars: (count: number) => void;
  dialect?: Dialect;
}

export const QuranScreen: React.FC<QuranScreenProps> = ({
  setScreen,
  playSound,
  addStars,
  dialect = 'fusha',
}) => {
  const [selectedSurahIndex, setSelectedSurahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'verses' | 'explanation'>('verses');

  const [completedSurahs, setCompletedSurahs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akram_completed_surahs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const surah: QuranSurah = QURAN_SURAHS[selectedSurahIndex] || QURAN_SURAHS[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any audio or speech on change/unmount
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopSpeaking();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleSelectSurah = (index: number) => {
    stopAllAudio();
    setSelectedSurahIndex(index);
    setCurrentVerseIndex(0);
    playPopSound();
  };

  // Recite verse by verse or full surah
  const handlePlaySurah = (startIdx: number = 0) => {
    stopAllAudio();
    setIsPlaying(true);
    setCurrentVerseIndex(startIdx);

    // Recite all verses sequentially with serene teacher voice
    const reciteFromIndex = (idx: number) => {
      if (idx >= surah.verses.length) {
        setIsPlaying(false);
        playSuccessSound();
        triggerConfetti();
        addStars(3);
        playSound(`أحسنت يا بطل! أتممت الاستماع لسورة ${surah.title} وتعلمت معناها العظيم وحصلت على 3 نجوم! ⭐⭐⭐`);

        if (!completedSurahs.includes(surah.id)) {
          const next = [...completedSurahs, surah.id];
          setCompletedSurahs(next);
          try {
            localStorage.setItem('akram_completed_surahs', JSON.stringify(next));
          } catch {
            // Ignore
          }
        }
        return;
      }

      setCurrentVerseIndex(idx);
      const verse = surah.verses[idx];
      const textToSpeak = verse.text;

      // Speak verse text calmly
      speakArabic(textToSpeak, true, 'fusha');

      // Schedule next verse after estimation duration
      const duration = Math.max(3000, textToSpeak.length * 130);
      setTimeout(() => {
        if (audioRef.current === null) {
          reciteFromIndex(idx + 1);
        }
      }, duration);
    };

    reciteFromIndex(startIdx);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      handlePlaySurah(currentVerseIndex);
    }
  };

  const handleNextSurah = () => {
    const nextIdx = (selectedSurahIndex + 1) % QURAN_SURAHS.length;
    handleSelectSurah(nextIdx);
  };

  const handlePrevSurah = () => {
    const prevIdx = (selectedSurahIndex - 1 + QURAN_SURAHS.length) % QURAN_SURAHS.length;
    handleSelectSurah(prevIdx);
  };

  const handlePlaySingleVerse = (idx: number) => {
    stopAllAudio();
    setCurrentVerseIndex(idx);
    playPopSound();
    const v = surah.verses[idx];
    speakArabic(v.text, true, 'fusha');
  };

  const handlePlayVerseMeaning = (v: { text: string; verseMeaning: string }) => {
    stopAllAudio();
    playPopSound();
    speakArabic(`تفسير الآية: ${v.verseMeaning}`, true, dialect);
  };

  const handlePlayOverallExplanation = () => {
    stopAllAudio();
    playPopSound();
    speakArabic(`شرح سورة ${surah.title}: ${surah.explanation}`, true, dialect);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => {
            playPopSound();
            stopAllAudio();
            setScreen('home');
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          🏠 الرئيسية
        </button>

        <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>قصار السور والتفسير المبسط 📖</span>
        </span>
      </div>

      {/* Main Surah Reader & Explanation Card */}
      <div className="w-full bg-white rounded-3xl p-5 border-4 border-emerald-300 shadow-xl relative overflow-hidden text-center space-y-4">
        {/* Decorative Quranic Banner */}
        <div className={`w-full bg-gradient-to-r ${surah.bgGradient} p-5 rounded-2xl text-white shadow-md relative overflow-hidden`}>
          <div className="absolute top-2 left-3 text-3xl opacity-25 animate-float select-none">🌙</div>
          <div className="absolute bottom-2 right-4 text-3xl opacity-25 select-none">✨</div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl mb-2 shadow-inner border border-white/30">
              {surah.icon}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black drop-shadow-sm font-serif">
              {surah.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-xs">
                {surah.type} • {surah.versesCount} آيات
              </span>
              {completedSurahs.includes(surah.id) && (
                <span className="text-xs font-bold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>⭐</span>
                  <span>مكتملة</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center justify-center gap-3 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
          <button
            onClick={handlePrevSurah}
            className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs border border-emerald-200"
            title="السورة السابقة"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-5 py-3 rounded-2xl text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>إيقاف التلاوة ⏸️</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>استمع للتلاوة المباركة 🎧</span>
              </>
            )}
          </button>

          <button
            onClick={handleNextSurah}
            className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs border border-emerald-200"
            title="السورة التالية"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Verses vs Meaning Explanation) */}
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('verses');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'verses'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>آيات السورة ({surah.versesCount})</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('explanation');
              handlePlayOverallExplanation();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'explanation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>ماذا تعني السورة؟ (الشرح) 💡</span>
          </button>
        </div>

        {/* Tab 1: Verses & Verse Meaning List */}
        {activeTab === 'verses' && (
          <div className="space-y-3 max-h-96 overflow-y-auto px-1 py-1 text-right">
            {/* Basmala Header */}
            {surah.id !== 'fatiha' && (
              <div className="text-center py-2 text-emerald-800 font-serif font-black text-lg bg-emerald-50/50 rounded-2xl border border-emerald-100">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            {surah.verses.map((v, idx) => {
              const isCurrent = isPlaying && currentVerseIndex === idx;
              return (
                <div
                  key={v.num}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.01]'
                      : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {v.num}
                    </span>

                    <div className="flex-1 text-right">
                      <p className="text-xl sm:text-2xl font-black text-slate-900 font-serif leading-relaxed">
                        {v.text}
                      </p>
                      
                      {/* Verse Meaning Explanation */}
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900 font-bold bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                        <span className="flex-1">
                          💡 <strong className="text-emerald-700">معنى الآية:</strong> {v.verseMeaning}
                        </span>

                        <button
                          onClick={() => handlePlayVerseMeaning(v)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-black shrink-0 mr-2 flex items-center gap-1 cursor-pointer"
                          title="استمع لتفسير الآية"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>الشرح</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlaySingleVerse(idx)}
                      className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 shrink-0 cursor-pointer"
                      title="استمع للآية"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Overall Surah Explanation & Lessons for Kids */}
        {activeTab === 'explanation' && (
          <div className="space-y-4 text-right p-2">
            {/* Main Kid-Friendly Explanation */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl border-2 border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-base text-emerald-950 flex items-center gap-1.5">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span>معنى سورة {surah.title} للأطفال:</span>
                </h4>

                <button
                  onClick={handlePlayOverallExplanation}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استمع للشرح</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-100">
                {surah.explanation}
              </p>
            </div>

            {/* Key Lessons / Takeaways for Kids */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-2">
              <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ماذا نتعلم ونستفيد من سورة {surah.title}؟</span>
              </h4>

              <div className="space-y-2">
                {surah.lessons.map((lesson, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{lesson}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quran Surahs Grid Selector */}
      <div className="w-full bg-white rounded-3xl p-5 border-4 border-emerald-300 shadow-lg text-right">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-base text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>فهرس قصار السور القرآنية ({QURAN_SURAHS.length} سور)</span>
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ⭐ {completedSurahs.length} / {QURAN_SURAHS.length} مكتملة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QURAN_SURAHS.map((s, idx) => {
            const isSelected = idx === selectedSurahIndex;
            const isDone = completedSurahs.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSurah(idx)}
                className={`p-3 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none">{s.icon}</span>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-800 font-serif">{s.title}</h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      {s.type} • {s.versesCount} آيات (مع الشرح)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isDone && <span className="text-amber-500 text-xs" title="مكتملة">⭐</span>}
                  {isSelected && <span className="text-emerald-600 font-bold text-xs">📖</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
