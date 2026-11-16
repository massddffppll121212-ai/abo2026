import React, { useState, useEffect } from 'react';
import { playSuccessSound, playTryAgainSound, playPopSound, playCountSound, triggerConfetti } from '../../utils/sound';
import { Trophy, Volume2, Sparkles } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface CountingGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
}

const ITEMS = [
  { emoji: '🍎', singular: 'تفاحة', plural: 'تفاحات' },
  { emoji: '🐱', singular: 'قطة', plural: 'قطط' },
  { emoji: '🚗', singular: 'سيارة', plural: 'سيارات' },
  { emoji: '⭐', singular: 'نجمة', plural: 'نجوم' },
  { emoji: '🎈', singular: 'بالون', plural: 'بالونات' },
  { emoji: '🦆', singular: 'بطة', plural: 'بطات' },
  { emoji: '🍓', singular: 'فراولة', plural: 'فراولات' },
];

export const CountingGame: React.FC<CountingGameProps> = ({
  addStars,
  playSound,
  onBack,
}) => {
  const [targetCount, setTargetCount] = useState(3);
  const [activeItem, setActiveItem] = useState(ITEMS[0]);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const generateRound = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setTappedIndices([]);

    const count = Math.floor(Math.random() * 7) + 2; // 2 to 8
    setTargetCount(count);

    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setActiveItem(randomItem);

    // Options generator
    const opts = new Set<number>([count]);
    while (opts.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const val = Math.max(1, count + delta);
      opts.add(val);
    }
    setOptions(Array.from(opts).sort((a, b) => a - b));

    setTimeout(() => {
      playSound(`كم عدد الـ ${randomItem.plural} في المربع؟ يمكنك لمسها لعدها!`);
    }, 150);
  };

  useEffect(() => {
    generateRound();
  }, []);

  const handleTapItem = (index: number) => {
    if (tappedIndices.includes(index)) return;
    const newTapped = [...tappedIndices, index];
    setTappedIndices(newTapped);
    playCountSound(newTapped.length);
    playSound(`${newTapped.length}`);
  };

  const handleSelectOption = (num: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(num);

    if (num === targetCount) {
      setIsCorrect(true);
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      setStreak((s) => s + 1);
      playSound(getCorrectAnswerPraise(getChildName(), `عددها ${targetCount}`));

      setTimeout(() => {
        generateRound();
      }, 1600);
    } else {
      setIsCorrect(false);
      playTryAgainSound();
      playSound(`حاول مرة أخرى! انقر على كل شكل لعدها بهدوء`);

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
        >
          ⬅️ قائمة الألعاب
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 border border-sky-300 rounded-2xl text-sky-900 font-bold text-sm">
          <Trophy className="w-4 h-4 text-sky-600" />
          <span>تتابع الإجابات: {streak}</span>
        </div>
      </div>

      {/* Counting Stage */}
      <div className="w-full bg-white rounded-3xl p-6 border-4 border-sky-200 shadow-xl text-center relative mb-5">
        <h3 className="text-slate-700 font-bold text-lg mb-1">
          كم عدد {activeItem.plural} في المربع؟
        </h3>
        <p className="text-xs text-sky-600 font-medium mb-4">
          💡 اضغط على الأشكال واحداً تلو الآخر لتعدها!
        </p>

        {/* Object Clusters Container */}
        <div className="min-h-40 bg-sky-50/70 border-2 border-dashed border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: targetCount }).map((_, idx) => {
            const isTapped = tappedIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTapItem(idx)}
                className={`relative p-2 rounded-2xl transition-all transform cursor-pointer ${
                  isTapped
                    ? 'scale-110 bg-amber-200 ring-4 ring-amber-400 rotate-3'
                    : 'bg-white hover:scale-105 active:scale-95 shadow-xs'
                }`}
              >
                <span className="text-5xl select-none">{activeItem.emoji}</span>
                {isTapped && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-pop">
                    {tappedIndices.indexOf(idx) + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Counter Display & Sound Hint */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm font-bold text-slate-600">
            تم عد: {tappedIndices.length} من {targetCount}
          </span>
          <button
            onClick={() => playSound(`كم عدد الـ ${activeItem.plural}؟`)}
            className="p-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
            title="إعادة نطق السؤال"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {options.map((opt) => {
          const isThisSelected = selectedOption === opt;
          let btnStyle = 'bg-white border-slate-200 hover:border-sky-400 text-slate-800 shadow-md';

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
              onClick={() => handleSelectOption(opt)}
              disabled={selectedOption !== null && isCorrect === true}
              className={`h-20 rounded-2xl border-4 text-center flex items-center justify-center text-4xl font-black transition-all transform active:scale-95 cursor-pointer ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {selectedOption !== null && (
        <div className="mt-5 text-center animate-pop">
          {isCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-800 font-black text-lg rounded-2xl border-2 border-emerald-300 shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>إجابة عبقرية! +1 نجمة ⭐</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-800 font-bold text-base rounded-2xl border-2 border-rose-300 shadow-sm">
              <span>جرّب مرة ثانية يا ذكي! 🌟</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
