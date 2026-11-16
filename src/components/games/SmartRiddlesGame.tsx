import React, { useState } from 'react';
import { playPopSound, playSuccessSound, playTryAgainSound, triggerConfetti } from '../../utils/sound';
import { HelpCircle, Brain, Sparkles, Lightbulb, CheckCircle2, XCircle, ArrowRight, Award, Trophy } from 'lucide-react';
import { getCorrectAnswerPraise, getTryAgainPhrase, getChildName } from '../../utils/phrases';

interface SmartRiddlesGameProps {
  onBack: () => void;
  addStars: (count: number) => void;
  playSound: (text: string) => void;
}

interface Riddle {
  id: number;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  icon: string;
}

const RIDDLES_DATA: Riddle[] = [
  {
    id: 1,
    question: 'شيء كلما أخذت منه وتعمقت فيه كَبُرَ وأصبح أوسع، فما هو؟',
    hint: 'شيء تحفره في الأرض!',
    options: ['الحفرة 🕳️', 'الجبل ⛰️', 'البحر 🌊', 'الشجرة 🌳'],
    correctIndex: 0,
    explanation: 'الحفرة كلما أخذت منها تراباً زاد حجمها واتسعت أكثر!',
    icon: '🕳️'
  },
  {
    id: 2,
    question: 'يمشي في السماء بلا أرجل، ويطير بلا أجنحة، ويبكي مطراً بلا عيون، فما هو؟',
    hint: 'شيء نراه في السماء تمطر منه قطرات الماء!',
    options: ['الشمس ☀️', 'السحاب والغيوم ☁️', 'الطائرة ✈️', 'الطائر 🐦'],
    correctIndex: 1,
    explanation: 'السحاب يتحرك مع الرياح في السماء وينزل منه المطر كأنه يبكي!',
    icon: '☁️'
  },
  {
    id: 3,
    question: 'له أوراق كثيرة ولكنه ليس بشجرة، وله غلاف يحميه ولكنه ليس ببيت، فما هو؟',
    hint: 'نقرأ فيه القصص والعلوم!',
    options: ['الكتاب 📖', 'البيت 🏠', 'الزهرة 🌸', 'القلم ✏️'],
    correctIndex: 0,
    explanation: 'الكتاب يتكون من صفحات وأوراق غنية بالمعلومات وله غلاف خارجي!',
    icon: '📖'
  },
  {
    id: 4,
    question: 'ما هو الشيء الذي ينبض بدقة واستمرار ولكن ليس له قلب؟',
    hint: 'نلبسها في معصمنا لنعرف الوقت!',
    options: ['السيارة 🚗', 'الساعة ⏰', 'الهاتف 📱', 'العصفور 🐦'],
    correctIndex: 1,
    explanation: 'الساعة تنبض وتتكتاك بانتظام لتعرفنا بالوقت الدقيق!',
    icon: '⏰'
  },
  {
    id: 5,
    question: 'يتكلم جميع لغات العالم ويكرر كلامك، ولكنه ليس بإنسان، فما هو؟',
    hint: 'صوتك عندما يصطدم بالجبل أو في الغرفة الخالية!',
    options: ['الراديو 📻', 'الصدى 🗣️', 'الببغاء 🦜', 'التلفاز 📺'],
    correctIndex: 1,
    explanation: 'الصدى يعيد ارتداد الصوت الذي تنطقه بأي لغة كانت!',
    icon: '🗣️'
  },
  {
    id: 6,
    question: 'ما هو الشيء الذي ينزل من السماء دائماً ولا يصعد أبداً؟',
    hint: 'قطرات ماء ناعمة تسقي الزرع!',
    options: ['المطر 🌧️', 'الدخان 💨', 'الطائرة ✈️', 'البالون 🎈'],
    correctIndex: 0,
    explanation: 'المطر ينزل من السحاب نحو الأرض برحمة الله ولا يصعد بذاته!',
    icon: '🌧️'
  },
  {
    id: 7,
    question: 'شيء يحملك وتأكل فوقه وتجلس حوله في الطعام، ولكنه لا يتحرك من مكانه؟',
    hint: 'قطعة أثاث نضع عليها الطعام!',
    options: ['الطاولة والكرسي 🪑', 'السيارة 🚗', 'السرير 🛏️', 'الباب 🚪'],
    correctIndex: 0,
    explanation: 'الطاولة والكرسي نستخدمهما يومياً في أكل الطعام والجلوس!',
    icon: '🪑'
  },
  {
    id: 8,
    question: 'شيء يكسو الناس والملابس بالجمال، ولكنه لا يرتدي أي ثوب؟',
    hint: 'أداة خياطة صغيرة فيها خيط!',
    options: ['الإبرة والخيط 🪡', 'المقص ✂️', 'المرآة 🪞', 'المغسلة 🧼'],
    correctIndex: 0,
    explanation: 'الإبرة تخيط وتصنع أجمل الملابس للناس بينما هي مجرد قطعة معدن!',
    icon: '🪡'
  }
];

export const SmartRiddlesGame: React.FC<SmartRiddlesGameProps> = ({
  onBack,
  addStars,
  playSound,
}) => {
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [shakeError, setShakeError] = useState(false);

  const riddle = RIDDLES_DATA[currentRiddleIdx];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // Prevent double answer

    setSelectedOption(index);
    if (index === riddle.correctIndex) {
      setIsCorrect(true);
      setScore(s => s + 1);
      playSuccessSound();
      triggerConfetti();
      addStars(2);
      const praise = getCorrectAnswerPraise(getChildName(), 'إجابة ذكية وممتازة جـداً!');
      playSound(praise);
    } else {
      setIsCorrect(false);
      setShakeError(true);
      playTryAgainSound();
      const tryAgainMsg = getTryAgainPhrase(getChildName());
      playSound(tryAgainMsg);
      setTimeout(() => setShakeError(false), 800);
    }
  };

  const handleNextRiddle = () => {
    playPopSound();
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
    if (currentRiddleIdx < RIDDLES_DATA.length - 1) {
      setCurrentRiddleIdx(c => c + 1);
    } else {
      // Completed all riddles
      setCurrentRiddleIdx(0);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 text-right">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4" />
          <span>قائمة الألعاب</span>
        </button>

        <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-2xl border border-purple-300 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
          <span>لعبة الألغاز والذكاء 🧠</span>
        </span>
      </div>

      {/* Main Riddles Card */}
      <div className={`w-full bg-white rounded-3xl p-6 border-4 shadow-xl space-y-5 transition-all ${
        shakeError ? 'border-rose-400 bg-rose-50/30 animate-shake' : 'border-purple-300'
      }`}>
        {/* Progress & Hint Header */}
        <div className="flex items-center justify-between bg-purple-50 p-3 rounded-2xl border border-purple-200">
          <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>اللغز {currentRiddleIdx + 1} من {RIDDLES_DATA.length}</span>
          </span>

          <button
            onClick={() => {
              playPopSound();
              setShowHint(!showHint);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black flex items-center gap-1 cursor-pointer border border-amber-300"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>{showHint ? 'إخفاء التلميح' : 'تلميح اللغز 💡'}</span>
          </button>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <span>💡 <strong>تلميح الذكاء:</strong></span>
            <span>{riddle.hint}</span>
          </div>
        )}

        {/* Riddle Question Display */}
        <div className="p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 rounded-2xl text-white shadow-md space-y-2 text-center relative overflow-hidden">
          <span className="text-4xl opacity-20 absolute top-2 left-3 select-none">🧩</span>
          <span className="text-3xl block mb-1">{riddle.icon}</span>
          <h3 className="text-lg sm:text-xl font-black leading-relaxed">
            {riddle.question}
          </h3>
          <p className="text-xs text-purple-100 font-semibold">
            فكر جيداً واختر الإجابة الصحيحة!
          </p>
        </div>

        {/* Multiple Choice Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {riddle.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isThisCorrect = idx === riddle.correctIndex;

            let btnStyle = 'bg-slate-50 border-slate-200 hover:border-purple-300 text-slate-800';
            if (selectedOption !== null) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-md';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-black shadow-sm';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={selectedOption !== null}
                className={`p-4 rounded-2xl border-3 text-right font-black text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <span>{optionText}</span>
                {selectedOption !== null && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {selectedOption !== null && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Result Box */}
        {selectedOption !== null && (
          <div className={`p-4 rounded-2xl border-2 space-y-3 animate-fade-in ${
            isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 font-black text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>إجابة صحيحة يا عازم! 🎉 (حصلت على نجمتين ⭐⭐)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>محاولة طيبة، فكر أكثر في اللغز القادم!</span>
                </>
              )}
            </div>

            <p className="text-xs font-bold leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200">
              💡 <strong>شرح وتفسير اللغز:</strong> {riddle.explanation}
            </p>

            <button
              onClick={handleNextRiddle}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>اللغز التالي ➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
