import React, { useState, useEffect } from 'react';
import { WORD_MATCH_ITEMS, WordMatchItem } from '../../data/arabicData';
import { getWordMatchItems } from '../../utils/contentSync';
import { playSuccessSound, playTryAgainSound, triggerConfetti } from '../../utils/sound';
import { Trophy, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface WordMatchGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
}

export const WordMatchGame: React.FC<WordMatchGameProps> = ({
  addStars,
  playSound,
  onBack,
}) => {
  const [items, setItems] = useState<WordMatchItem[]>(getWordMatchItems());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const activeItems = items.length > 0 ? items : WORD_MATCH_ITEMS;
  const currentItem = activeItems[currentIndex % activeItems.length];

  const setupRound = (item: WordMatchItem) => {
    setSelectedWord(null);
    setIsCorrect(null);

    // Mix correct word with 2 distractors
    const roundOpts = [item.word, ...item.distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
    setOptions(roundOpts);

    setTimeout(() => {
      playSound(`ما هي الكلمة المناسبة لهذه الصورة؟`);
    }, 150);
  };

  useEffect(() => {
    setupRound(currentItem);
  }, [currentIndex]);

  const handleSelect = (word: string) => {
    if (selectedWord !== null) return;
    setSelectedWord(word);

    if (word === currentItem.word) {
      setIsCorrect(true);
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      setStreak((s) => s + 1);
      playSound(getCorrectAnswerPraise(getChildName(), `${currentItem.word} مطابقة صحيحة وممتازة`));

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1600);
    } else {
      setIsCorrect(false);
      playTryAgainSound();
      playSound(`حاول مرة أخرى يا بطل!`);

      setTimeout(() => {
        setSelectedWord(null);
        setIsCorrect(null);
      }, 1300);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          ⬅️ قائمة الألعاب
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-2xl text-blue-900 font-bold text-sm">
          <Trophy className="w-4 h-4 text-blue-600" />
          <span>تتابع الإجابات: {streak}</span>
        </div>
      </div>

      {/* Picture Stage */}
      <div className="w-full bg-white rounded-3xl p-6 border-4 border-blue-200 shadow-xl text-center relative mb-5">
        <h3 className="text-slate-800 font-black text-xl mb-1">
          طابق الصورة بالكلمة الصحيحة
        </h3>
        <p className="text-xs text-blue-600 font-semibold mb-4">
          انظر إلى الصورة واختر اسمها من الكلمات بالأسفل
        </p>

        {/* Big Emoji Card */}
        <div className="w-36 h-36 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-3 border-blue-300 rounded-3xl flex items-center justify-center shadow-inner my-2">
          <span className="text-7xl select-none animate-float drop-shadow-md">
            {currentItem.emoji}
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={() => playSound(`ما هي الكلمة المناسبة لهذه الصورة؟`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>اسمع السؤال</span>
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {options.map((opt) => {
          const isThisSelected = selectedWord === opt;
          let btnStyle = 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 shadow-md';

          if (isThisSelected) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-105';
            } else {
              btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-rose-200 animate-shake';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selectedWord !== null && isCorrect === true}
              className={`h-20 rounded-2xl border-3 text-center flex items-center justify-center text-xl font-black transition-all transform active:scale-95 cursor-pointer ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {selectedWord !== null && (
        <div className="mt-5 text-center animate-pop">
          {isCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-800 font-black text-base rounded-2xl border-2 border-emerald-300 shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>إجابة مطابقة تماماً! +1 نجمة ⭐</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-800 font-bold text-sm rounded-2xl border-2 border-rose-300 shadow-sm">
              <span>حاول مرة أخرى، ركز في الصورة! 🌟</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
