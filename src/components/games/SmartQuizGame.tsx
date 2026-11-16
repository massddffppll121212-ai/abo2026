import React, { useState, useEffect } from 'react';
import { QUIZ_STAGES, QuizStage } from '../../data/stagesQuizData';
import { getQuizQuestions, CustomQuestion } from '../../utils/contentSync';
import { playSuccessSound, playTryAgainSound, playPopSound, triggerConfetti, triggerBigCelebration } from '../../utils/sound';
import { Trophy, Volume2, Sparkles, RefreshCw, HelpCircle, Award, ChevronLeft, ChevronRight, CheckCircle2, Lock, Flame } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface SmartQuizGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
  onOpenOnlineSync?: () => void;
}

export const SmartQuizGame: React.FC<SmartQuizGameProps> = ({
  addStars,
  playSound,
  onBack,
  onOpenOnlineSync,
}) => {
  // Load saved stage index from localStorage
  const [currentStageId, setCurrentStageId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('akram_active_quiz_stage');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [completedStages, setCompletedStages] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('akram_completed_quiz_stages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showStagesModal, setShowStagesModal] = useState(false);
  const [stageFinished, setStageFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Active Stage (1 to 10)
  const currentStage: QuizStage = QUIZ_STAGES.find((s) => s.id === currentStageId) || QUIZ_STAGES[0];
  const stageQuestions = currentStage.questions;
  const currentQ: CustomQuestion = stageQuestions[currentIndex] || stageQuestions[0];

  const askCurrentQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeout(() => {
      playSound(`${currentQ.question}`);
    }, 200);
  };

  useEffect(() => {
    if (!stageFinished) {
      askCurrentQuestion();
    }
  }, [currentIndex, currentStageId, stageFinished]);

  const handleSelectStage = (stageId: number) => {
    playPopSound();
    setCurrentStageId(stageId);
    setCurrentIndex(0);
    setStageFinished(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowStagesModal(false);
    try {
      localStorage.setItem('akram_active_quiz_stage', String(stageId));
    } catch {
      // Ignore
    }
  };

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    if (idx === currentQ.correctIndex) {
      setIsCorrect(true);
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      playSound(getCorrectAnswerPraise(getChildName(), `${currentQ.options[idx]}`));

      setTimeout(() => {
        if (currentIndex + 1 < stageQuestions.length) {
          setCurrentIndex((i) => i + 1);
        } else {
          // Finished all 20 questions of this stage!
          setStageFinished(true);
          triggerBigCelebration();
          addStars(5);
          playSound(`ما شاء الله تبارك الله! أكملت ${currentStage.title} بنجاح باهر ونلت 5 نجوم ذهبية! 👑🌟`);

          if (!completedStages.includes(currentStage.id)) {
            const nextCompleted = [...completedStages, currentStage.id];
            setCompletedStages(nextCompleted);
            try {
              localStorage.setItem('akram_completed_quiz_stages', JSON.stringify(nextCompleted));
            } catch {
              // Ignore
            }
          }
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      playTryAgainSound();
      setStreak(0);
      playSound(`حاول مرة أخرى يا بطل! فكر بهدوء وستعرف الإجابة 💪`);

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1300);
    }
  };

  const handleNextStage = () => {
    playPopSound();
    if (currentStageId < 10) {
      handleSelectStage(currentStageId + 1);
    } else {
      handleSelectStage(1);
    }
  };

  const handleRestartStage = () => {
    playPopSound();
    setCurrentIndex(0);
    setStageFinished(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto pb-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full mb-3">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
        >
          ⬅️ قائمة الألعاب
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Stage Selector Button */}
          <button
            onClick={() => {
              playPopSound();
              setShowStagesModal(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>🎯</span>
            <span>المراحل ({currentStageId}/10)</span>
          </button>

          {onOpenOnlineSync && (
            <button
              onClick={onOpenOnlineSync}
              className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs rounded-2xl transition-all flex items-center gap-1 cursor-pointer border border-sky-300"
              title="تحديث وإضافة أسئلة عبر الإنترنت"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">تحديث</span>
            </button>
          )}

          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-2xl text-amber-900 font-black text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{score}</span>
          </div>
        </div>
      </div>

      {/* Stage Banner & Level Info */}
      <div
        className="w-full rounded-2xl p-3 border-2 mb-3 text-right flex items-center justify-between shadow-xs transition-colors"
        style={{ backgroundColor: currentStage.color, borderColor: currentStage.border }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-3xl select-none">{currentStage.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-800">{currentStage.title}</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/10 text-slate-700">
                {currentStage.difficulty}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-600">{currentStage.subtitle}</p>
          </div>
        </div>

        {streak >= 3 && (
          <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-black animate-bounce-subtle shrink-0">
            <Flame className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            <span>{streak} متتالية!</span>
          </div>
        )}
      </div>

      {/* Stage Progress Bar (20 Questions Progress) */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + (stageFinished ? 1 : 0)) / stageQuestions.length) * 100}%` }}
        />
      </div>

      {/* Main Game Screen or Stage Completed Screen */}
      {!stageFinished ? (
        <>
          {/* Target Question Box */}
          <div className="w-full bg-white rounded-3xl p-5 border-4 border-indigo-200 shadow-xl text-center relative overflow-hidden mb-4">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {currentQ.category || currentStage.title}
              </span>
              <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                السؤال {currentIndex + 1} من {stageQuestions.length} (20 سؤال)
              </span>
            </div>

            {/* Emoji & Question */}
            <div className="my-2 p-4 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-200">
              <div className="text-5xl mb-2 select-none animate-float">
                {currentQ.emoji || currentStage.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Voice replay button */}
            <div className="mt-2">
              <button
                onClick={() => playSound(`${currentQ.question}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-900" />
                <span>اسمع السؤال بصوت المعلمة 🔊</span>
              </button>
            </div>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-2.5 w-full">
            {currentQ.options.map((opt, idx) => {
              const isThisSelected = selectedOption === idx;
              let btnStyle = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-sm';

              if (isThisSelected) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 scale-[1.02]';
                } else {
                  btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-rose-200 animate-gentle-shake';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full py-3.5 px-4 rounded-2xl border-3 font-black text-base sm:text-lg transition-all transform active:scale-98 cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </span>

                  {isThisSelected && isCorrect && <span className="text-xl">⭐</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback notice if explanation is available */}
          {selectedOption !== null && isCorrect && currentQ.explanation && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-bold text-center animate-pop w-full shadow-xs">
              💡 {currentQ.explanation}
            </div>
          )}
        </>
      ) : (
        /* Stage Completed Celebration Screen */
        <div className="w-full bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-2xl text-center space-y-4 animate-pop">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-md">
            👑
          </div>

          <div>
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block mb-1">
              🎉 مبروك يا بطل المعرفة!
            </span>
            <h2 className="text-2xl font-black text-slate-800">
              أتممت بنجاح: {currentStage.title}
            </h2>
            <p className="text-sm font-bold text-slate-600 mt-1">
              أجبت على 20 سؤالاً بالكامل وحصلت على 5 نجوم ذهبية إضافية! ⭐⭐⭐⭐⭐
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-around">
            <div>
              <span className="block text-slate-500 text-[11px]">مجموع الأسئلة:</span>
              <span className="text-lg font-black text-slate-800">20 / 20</span>
            </div>
            <div className="w-px h-8 bg-amber-200" />
            <div>
              <span className="block text-slate-500 text-[11px]">المرحلة التالية:</span>
              <span className="text-lg font-black text-emerald-600">
                {currentStageId < 10 ? `المرحلة ${currentStageId + 1}` : 'قمة العباقرة 👑'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {currentStageId < 10 ? (
              <button
                onClick={handleNextStage}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>الانتقال للمرحلة {currentStageId + 1}</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleSelectStage(1)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🎉 إعادة التحدي من المرحلة 1</span>
              </button>
            )}

            <button
              onClick={handleRestartStage}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة هذه المرحلة</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Select Any of the 10 Stages */}
      {showStagesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 border-4 border-amber-300 shadow-2xl text-right max-h-[85vh] flex flex-col animate-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <span>🎯</span>
                  <span>مراحل مسابقة المعرفة والذكاء (10 مراحل)</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  كل مرحلة تضم 20 سؤالاً شيقاً متدرجة الصعوبة للأبطال!
                </p>
              </div>
              <button
                onClick={() => {
                  playPopSound();
                  setShowStagesModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stages Scroll List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {QUIZ_STAGES.map((stg) => {
                const isCurrent = stg.id === currentStageId;
                const isCompleted = completedStages.includes(stg.id);
                return (
                  <button
                    key={stg.id}
                    onClick={() => handleSelectStage(stg.id)}
                    className={`w-full p-3 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{stg.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-800">{stg.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {stg.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{stg.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted && (
                        <span className="text-emerald-500 font-bold text-xs flex items-center gap-0.5">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                          <span>مكتملة</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-amber-600 font-extrabold text-xs bg-amber-100 px-2 py-0.5 rounded-full">
                          الحالية
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
