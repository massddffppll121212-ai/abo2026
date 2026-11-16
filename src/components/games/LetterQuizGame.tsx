import React, { useState, useEffect } from 'react';
import { ARABIC_LETTERS, ArabicLetter } from '../../data/arabicData';
import { playSuccessSound, playTryAgainSound, triggerConfetti } from '../../utils/sound';
import { Volume2, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface LetterQuizGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
}

export const LetterQuizGame: React.FC<LetterQuizGameProps> = ({
  addStars,
  playSound,
  onBack,
}) => {
  const [targetLetter, setTargetLetter] = useState<ArabicLetter>(ARABIC_LETTERS[0]);
  const [options, setOptions] = useState<ArabicLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const generateRound = () => {
    setSelectedLetter(null);
    setIsCorrect(null);

    const randomTarget = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
    setTargetLetter(randomTarget);

    const distractors: ArabicLetter[] = [];
    while (distractors.length < 3) {
      const rand = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
      if (rand.letter !== randomTarget.letter && !distractors.some((d) => d.letter === rand.letter)) {
        distractors.push(rand);
      }
    }

    const allOptions = [randomTarget, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setTimeout(() => {
      playSound(`أين ${randomTarget.name}؟ مثل ${randomTarget.word}`);
    }, 150);
  };

  useEffect(() => {
    generateRound();
  }, []);

  const handleSelect = (item: ArabicLetter) => {
    if (selectedLetter !== null) return; // Prevent double tap during transition
    setSelectedLetter(item.letter);

    if (item.letter === targetLetter.letter) {
      setIsCorrect(true);
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      setStreak((s) => s + 1);
      playSound(getCorrectAnswerPraise(getChildName(), `${targetLetter.letter} مثل ${targetLetter.word}`));

      setTimeout(() => {
        generateRound();
      }, 1600);
    } else {
      setIsCorrect(false);
      playTryAgainSound();
      playSound(`حاول ثانية! هذا ${item.name}، نريد ${targetLetter.name}`);

      setTimeout(() => {
        setSelectedLetter(null);
        setIsCorrect(null);
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between w-full mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
        >
          ⬅️ قائمة الألعاب
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-2xl text-amber-900 font-bold text-sm">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>تتابع الإجابات: {streak}</span>
        </div>
      </div>

      {/* Target Question Box */}
      <div className="w-full bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-xl text-center relative overflow-hidden mb-6">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-400 via-amber-400 to-sky-400" />

        <p className="text-slate-600 font-bold text-lg mb-2">أين نجد هذا الحرف؟</p>

        <div className="my-2 inline-flex flex-col items-center justify-center p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300">
          <span className="text-5xl font-black text-rose-500 mb-1">{targetLetter.name}</span>
          <span className="text-slate-600 font-semibold text-sm flex items-center gap-1">
            (مثل {targetLetter.word} {targetLetter.emoji})
          </span>
        </div>

        <div className="mt-3">
          <button
            onClick={() => playSound(`أين حرف ${targetLetter.name}؟ مثل ${targetLetter.word}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Volume2 className="w-5 h-5 text-amber-900" />
            <span>اسمع السؤال مرة أخرى</span>
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((item) => {
          const isThisSelected = selectedLetter === item.letter;
          let btnStyle = 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 shadow-md';

          if (isThisSelected) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105';
            } else {
              btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-rose-200 animate-shake';
            }
          }

          return (
            <button
              key={item.letter}
              onClick={() => handleSelect(item)}
              disabled={selectedLetter !== null && isCorrect === true}
              className={`h-28 rounded-3xl border-4 text-center flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer relative ${btnStyle}`}
            >
              <span className="text-5xl font-black">{item.letter}</span>
              <span className="text-xs font-bold opacity-75 mt-1">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {selectedLetter && (
        <div className="mt-6 text-center animate-pop">
          {isCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-800 font-black text-lg rounded-2xl border-2 border-emerald-300 shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>رائع ومبهر يا بطل! +1 نجمة ⭐</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-800 font-bold text-base rounded-2xl border-2 border-rose-300 shadow-sm">
              <span>حاول مرة أخرى، أنت تستطيع! 💪</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
