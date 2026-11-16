import React, { useState, useEffect } from 'react';
import { ARABIC_LETTERS, ArabicLetter, toArabicNum } from '../../data/arabicData';
import { LetterCanvas } from '../LetterCanvas';
import { playPopSound, playSuccessSound, triggerConfetti } from '../../utils/sound';
import { Volume2, ChevronRight, ChevronLeft, Grid, Sparkles, Star, Mic } from 'lucide-react';
import { hasUserLetterVoice, isUserVoiceActive, playUserAudio } from '../../utils/userVoiceStorage';
import { Dialect, getPhrase } from '../../utils/phrases';

interface LettersScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  playSound: (text: string) => void;
  addStars: (count: number) => void;
  dialect?: Dialect;
}

export const LettersScreen: React.FC<LettersScreenProps> = ({
  setScreen,
  playSound,
  addStars,
  dialect = 'fusha',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [showCanvas, setShowCanvas] = useState(false);
  const [masteredLetters, setMasteredLetters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akram_mastered_letters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const current = ARABIC_LETTERS[currentIndex];
  const hasVoice = hasUserLetterVoice(current.letter);

  const playLetterAudio = (letterObj: ArabicLetter) => {
    if (isUserVoiceActive() && hasUserLetterVoice(letterObj.letter)) {
      playUserAudio(`letter_${letterObj.letter}`);
    } else {
      playSound(letterObj.letter);
    }
  };

  useEffect(() => {
    if (viewMode === 'card') {
      playLetterAudio(current);
    }
  }, [currentIndex, viewMode]);

  const nextLetter = () => {
    playPopSound();
    setShowCanvas(false);
    setCurrentIndex((prev) => (prev < ARABIC_LETTERS.length - 1 ? prev + 1 : 0));
  };

  const prevLetter = () => {
    playPopSound();
    setShowCanvas(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ARABIC_LETTERS.length - 1));
  };

  const handleSelectLetter = (index: number) => {
    playPopSound();
    setCurrentIndex(index);
    setViewMode('card');
    setShowCanvas(false);
    const target = ARABIC_LETTERS[index];
    if (isUserVoiceActive() && hasUserLetterVoice(target.letter)) {
      playUserAudio(`letter_${target.letter}`);
    } else {
      playSound(target.name);
    }
  };

  const handleMasterLetter = () => {
    if (!masteredLetters.includes(current.letter)) {
      const next = [...masteredLetters, current.letter];
      setMasteredLetters(next);
      localStorage.setItem('akram_mastered_letters', JSON.stringify(next));
      playSuccessSound();
      triggerConfetti();
      const praiseMsg = dialect === 'yemeni'
        ? `يا عيني عليك! أتقنت حرف ${current.name} وصرت فنان ونلت نجمة ⭐`
        : `أحسنت! أتقنت حرف ${current.name} ونلت نجمة ⭐`;
      playSound(praiseMsg);
    } else {
      playSound(dialect === 'yemeni' ? `أنت تتقن حرف ${current.name} من قبل يا بطل!` : `أنت تتقن حرف ${current.name} بالفعل يا بطل!`);
    }
  };

  const isMastered = masteredLetters.includes(current.letter);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => {
            playPopSound();
            setScreen('home');
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          🏠 الرئيسية
        </button>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => {
              playPopSound();
              setViewMode('card');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بطاقة الحرف
          </button>
          <button
            onClick={() => {
              playPopSound();
              setViewMode('grid');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            كل الحروف ({masteredLetters.length}/28)
          </button>
        </div>
      </div>

      {/* Grid Mode: View all 28 letters */}
      {viewMode === 'grid' && (
        <div className="w-full bg-white rounded-3xl p-5 border-4 border-rose-200 shadow-lg animate-pop">
          <div className="text-center mb-4">
            <h3 className="text-lg font-black text-slate-800">حروف الهجاء العربية (28 حرفاً)</h3>
            <p className="text-xs text-rose-600 font-semibold">
              المس أي حرف لتسمع صوته وتتعرف على كلماته!
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {ARABIC_LETTERS.map((item, idx) => {
              const mastered = masteredLetters.includes(item.letter);
              return (
                <button
                  key={item.letter}
                  onClick={() => handleSelectLetter(idx)}
                  className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative shadow-xs ${
                    mastered
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-rose-400'
                  }`}
                >
                  <span className="text-2xl font-black">{item.letter}</span>
                  <span className="text-[10px] text-slate-500">{item.emoji}</span>
                  {mastered && (
                    <span className="absolute -top-1 -right-1 text-amber-500 text-xs">⭐</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Mode: Single Letter Deep Dive */}
      {viewMode === 'card' && (
        <div className="w-full bg-white rounded-3xl p-6 border-4 border-rose-200 shadow-xl text-center relative overflow-hidden">
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              الحرف {toArabicNum(currentIndex + 1)} من {toArabicNum(ARABIC_LETTERS.length)}
            </span>

            <button
              onClick={handleMasterLetter}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                isMastered
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600 border border-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isMastered ? 'fill-amber-500 text-amber-500' : ''}`} />
              {isMastered ? 'أتقنت الحرف ⭐' : 'وضع علامة إتقان'}
            </button>
          </div>

          {/* Letter and Illustration Card */}
          <div
            className="my-3 p-6 rounded-3xl border-3 transition-colors flex flex-col items-center justify-center relative"
            style={{ backgroundColor: current.color, borderColor: current.border }}
          >
            {/* Big Letter with animation and click to speak letter name cleanly */}
            <span
              onClick={() => playSound(current.name)}
              className="text-7xl sm:text-8xl font-black text-rose-500 drop-shadow-sm select-none animate-float cursor-pointer transition-transform active:scale-95"
              title="المس لسماع الحرف بصوت المعلمة"
            >
              {current.letter}
            </span>

            {/* Emoji and Primary Word - Click to hear the word and example */}
            <div
              onClick={() => playSound(current.word)}
              className="mt-3 flex items-center justify-center gap-3 p-3 bg-white/80 hover:bg-white rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-400 cursor-pointer transition-all transform active:scale-95 shadow-2xs"
              title="اضغط لسماع الكلمة والمثال"
            >
              <span className="text-5xl select-none">{current.emoji}</span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 block">
                  {current.word}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  {current.phoneticHint} (اضغط لسماع الكلمة 🔊)
                </span>
              </div>
            </div>

            {/* Secondary Example Word if available */}
            {current.secondaryWord && (
              <div className="mt-3 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-black/5 text-xs font-bold text-slate-700">
                كلمة أخرى: {current.secondaryWord}
              </div>
            )}
          </div>

          {/* User Voice Indicator / Record Action */}
          {hasVoice ? (
            <div className="w-full flex items-center justify-center gap-2 my-1">
              <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-300 py-1 px-3 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span>🎙️</span>
                <span>هذا الحرف ينطق بصوتك المسجل!</span>
              </span>
              <button
                type="button"
                onClick={() => setScreen('voiceStudio')}
                className="text-xs font-bold text-slate-500 hover:text-purple-600 underline cursor-pointer"
              >
                تعديل التسجيل
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center my-1">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('voiceStudio');
                }}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 py-1 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-purple-600" />
                <span>سجّل هذا الحرف بصوتك في الاستوديو 🎙️</span>
              </button>
            </div>
          )}

          {/* Action Row: Listen sound & Toggle Tracing */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-3">
            <button
              onClick={() => playLetterAudio(current)}
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-base shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5 text-amber-900" />
              <span>انطق ({current.letter}) {hasVoice ? 'بصوتك 🎙️' : '🔊'}</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                setShowCanvas(!showCanvas);
              }}
              className="py-3 px-4 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-sm border-2 border-sky-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>{showCanvas ? 'إخفاء لوحة الرسم' : '✍️ ارسم الحرف'}</span>
            </button>
          </div>

          {/* Optional Interactive Tracing Canvas */}
          {showCanvas && (
            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 animate-pop">
              <LetterCanvas
                letter={current.letter}
                word={current.word}
                dialect={dialect}
                onLetterDrawn={() => addStars(1)}
                playSound={playSound}
              />
            </div>
          )}

          {/* Previous / Next Arrow Navigation */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={prevLetter}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
              <span>الحرف السابق</span>
            </button>

            <button
              onClick={nextLetter}
              className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>الحرف التالي</span>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
