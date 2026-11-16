import React, { useState } from 'react';
import { ARABIC_NUMBERS, toArabicNum } from '../../data/arabicData';
import { LetterCanvas } from '../LetterCanvas';
import { playPopSound, playCountSound, playSuccessSound, playTryAgainSound, triggerConfetti } from '../../utils/sound';
import { Dialect, getCorrectAnswerPraise, getChildName } from '../../utils/phrases';
import { Volume2, Plus, Minus, Sparkles, HelpCircle } from 'lucide-react';

interface NumbersScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'settings') => void;
  playSound: (text: string) => void;
  addStars: (count: number) => void;
  dialect?: Dialect;
}

export const NumbersScreen: React.FC<NumbersScreenProps> = ({
  setScreen,
  playSound,
  addStars,
  dialect = 'fusha',
}) => {
  const [num, setNum] = useState(1);
  const [tappedStars, setTappedStars] = useState<number[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [scoreMsg, setScoreMsg] = useState('');
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);

  const currentObj = ARABIC_NUMBERS.find((n) => n.num === num) || ARABIC_NUMBERS[0];

  const handleNumChange = (newNum: number) => {
    if (newNum < 1 || newNum > 20) return;
    playPopSound();
    setNum(newNum);
    setTappedStars([]);
    setShowCanvas(false);
    const found = ARABIC_NUMBERS.find((n) => n.num === newNum) || ARABIC_NUMBERS[0];
    // Pronounce ONLY the number word itself, without the prefix "الرقم"
    playSound(found.word);
  };

  const handleTapCountItem = (index: number) => {
    if (tappedStars.includes(index)) return;
    const next = [...tappedStars, index];
    setTappedStars(next);
    playCountSound(next.length);
    playSound(`${next.length}`);

    if (next.length === num) {
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      const donePraise = dialect === 'yemeni'
        ? `يا عيني عليك! كملت العد وطلعوا ${num} تمام ⭐`
        : `ممتاز يا بطل! عددها ${num} بشكل صحيح ⭐`;
      playSound(donePraise);
    }
  };

  // Mini Math Quiz: e.g. num + 1 or num + 2
  const quizA = Math.min(num, 5);
  const quizB = 1;
  const quizCorrect = quizA + quizB;
  const quizOptions = [quizCorrect - 1, quizCorrect, quizCorrect + 1].filter((x) => x > 0).sort(() => Math.random() - 0.5);

  const handleQuizAnswer = (selected: number) => {
    setQuizAnswered(selected);
    if (selected === quizCorrect) {
      setScoreMsg(`إجابة صحيحة وذكية! أحسنت يا ${getChildName()} ⭐`);
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      const mathPraise = getCorrectAnswerPraise(getChildName(), `${quizA} زائد ${quizB} يساوي ${quizCorrect}`, dialect);
      playSound(mathPraise);
    } else {
      setScoreMsg('حاول مرة أخرى يا بطل، أنت قادر! 💪');
      playTryAgainSound();
      playSound(dialect === 'yemeni' ? `حاول مرة ثانية يا غالي! اجمع بهدوء` : `حاول مرة أخرى! اجمع بهدوء`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {/* Top Header Controls */}
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

        <button
          onClick={() => {
            playPopSound();
            setQuizMode(!quizMode);
            setShowCanvas(false);
          }}
          className={`px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            quizMode
              ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{quizMode ? 'العودة للعد' : 'اختبار الحساب والجمع'}</span>
        </button>
      </div>

      {/* Main Numbers Card */}
      <div className="w-full bg-white rounded-3xl p-6 border-4 border-sky-200 shadow-xl text-center relative overflow-hidden">
        {/* Big Number & Arabic Word (Clicking number pronounces strictly the number) */}
        <div className="my-2 flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center gap-2 sm:gap-3">
            <span
              onClick={() => playSound(currentObj.word)}
              className="text-7xl sm:text-8xl font-black drop-shadow-xs select-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              style={{ color: currentObj.color }}
              title="المس لسماع الرقم فقط"
            >
              {toArabicNum(currentObj.num)}
            </span>
            <span
              onClick={() => playSound(currentObj.word)}
              className="text-3xl sm:text-4xl font-extrabold text-slate-400 select-none cursor-pointer hover:text-slate-600 transition-colors"
              title="الرقم بالأرقام الشائعة"
            >
              ({currentObj.num})
            </span>
          </div>
          <span
            onClick={() => playSound(currentObj.word)}
            className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 cursor-pointer hover:text-sky-600 transition-colors"
          >
            {currentObj.word}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5">
            {currentObj.label}
          </span>
        </div>

        {/* Action Row: Pronounce only the number & Toggle Number Tracing */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          <button
            onClick={() => playSound(currentObj.word)}
            className="flex-1 py-3 px-5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm sm:text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
            <span>انطق ({currentObj.word}) 🔊</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setShowCanvas(!showCanvas);
            }}
            className="py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm border-2 border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{showCanvas ? 'إخفاء لوحة الكتابة' : '✍️ تدرب على كتابة الرقم'}</span>
          </button>
        </div>

        {/* Number Tracing Canvas with Slow Demonstration & Error Check! */}
        {showCanvas && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-sky-200 animate-pop">
            <LetterCanvas
              letter={String(num)}
              word={currentObj.word}
              isNumber={true}
              dialect={dialect}
              onLetterDrawn={() => addStars(1)}
              playSound={playSound}
            />
          </div>
        )}

        {/* Interactive Countable Items Box */}
        <div className="my-4 p-4 bg-sky-50/80 rounded-2xl border-2 border-dashed border-sky-300">
          <div className="text-xs font-bold text-sky-800 mb-2">
            💡 المس كل عنصر لتعد بصوتك (تم عد {tappedStars.length} من {num})
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[70px]">
            {Array.from({ length: num }).map((_, i) => {
              const isTapped = tappedStars.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTapCountItem(i)}
                  className={`relative p-2 rounded-xl transition-all transform cursor-pointer ${
                    isTapped
                      ? 'scale-115 bg-amber-200 ring-3 ring-amber-400 rotate-2'
                      : 'bg-white hover:scale-105 active:scale-95 shadow-2xs'
                  }`}
                >
                  <span className="text-3xl select-none">{currentObj.emoji}</span>
                  {isTapped && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                      {tappedStars.indexOf(i) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plus / Minus Nav Buttons */}
        <div className="flex items-center justify-between gap-4 mt-2">
          <button
            onClick={() => handleNumChange(num - 1)}
            disabled={num <= 1}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              num <= 1
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95'
            }`}
          >
            <Minus className="w-5 h-5" />
            <span>تناقص</span>
          </button>

          <span className="text-base font-black text-slate-600 px-3">
            {toArabicNum(num)} / {toArabicNum(20)}
          </span>

          <button
            onClick={() => handleNumChange(num + 1)}
            disabled={num >= 20}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              num >= 20
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 active:scale-95'
            }`}
          >
            <span>تزايد</span>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Number Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 px-1 mt-3 scrollbar-none">
          {ARABIC_NUMBERS.map((item) => (
            <button
              key={item.num}
              onClick={() => handleNumChange(item.num)}
              className={`min-w-9 h-9 px-2 rounded-xl font-black text-sm shrink-0 transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                num === item.num
                  ? 'bg-sky-500 text-white scale-110 shadow-md ring-2 ring-sky-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{toArabicNum(item.num)}</span>
              <span className="text-[10px] opacity-70">({item.num})</span>
            </button>
          ))}
        </div>

        {/* Math Quiz Section */}
        {quizMode && (
          <div className="mt-5 pt-4 border-t-2 border-dashed border-sky-200 bg-amber-50/50 p-4 rounded-2xl animate-pop">
            <h4 className="text-base font-black text-amber-900 mb-2">
              مسألة جمع سريعة:
            </h4>
            <div className="text-2xl font-black text-slate-800 my-2 flex items-center justify-center gap-2">
              <span>{toArabicNum(quizA)}</span>
              <span className="text-amber-600">+</span>
              <span>{toArabicNum(quizB)}</span>
              <span>=</span>
              <span className="text-sky-600 font-black">؟</span>
            </div>

            <div className="flex justify-center gap-3 mt-3">
              {quizOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleQuizAnswer(opt)}
                  className={`w-14 h-14 rounded-2xl font-black text-2xl border-3 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                    quizAnswered === opt
                      ? opt === quizCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-rose-500 border-rose-600 text-white'
                      : 'bg-white border-amber-300 text-slate-800 hover:border-amber-500'
                  }`}
                >
                  {toArabicNum(opt)}
                </button>
              ))}
            </div>

            {scoreMsg && (
              <p className="mt-3 font-bold text-sm text-slate-800 animate-pop">
                {scoreMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
