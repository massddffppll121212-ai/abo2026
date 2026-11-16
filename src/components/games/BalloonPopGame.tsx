import React, { useState, useEffect, useRef } from 'react';
import { ARABIC_LETTERS } from '../../data/arabicData';
import { playPopSound, playSuccessSound, playTryAgainSound, triggerConfetti } from '../../utils/sound';
import { Trophy, RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface BalloonPopGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
}

interface BalloonItem {
  id: string;
  char: string;
  name: string;
  x: number; // percentage 10% to 80%
  y: number; // percentage 100% to -20%
  speed: number;
  color: string;
  isTarget: boolean;
  popped: boolean;
}

const BALLOON_COLORS = [
  { bg: '#FF6B6B', border: '#EE5253' },
  { bg: '#4D96FF', border: '#2E86DE' },
  { bg: '#6BCB77', border: '#10AC84' },
  { bg: '#FFD93D', border: '#F39C12' },
  { bg: '#9B51E0', border: '#8E44AD' },
  { bg: '#FF9F43', border: '#E67E22' },
];

export const BalloonPopGame: React.FC<BalloonPopGameProps> = ({
  addStars,
  playSound,
  onBack,
}) => {
  const [targetChar, setTargetChar] = useState(ARABIC_LETTERS[0]);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startRound = (targetIndex?: number) => {
    const chosen = targetIndex !== undefined
      ? ARABIC_LETTERS[targetIndex]
      : ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];

    setTargetChar(chosen);
    setFeedback(null);

    // Pick 3 other random letters
    const otherLetters: typeof ARABIC_LETTERS = [];
    while (otherLetters.length < 3) {
      const rand = ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
      if (rand.letter !== chosen.letter && !otherLetters.some((l) => l.letter === rand.letter)) {
        otherLetters.push(rand);
      }
    }

    const itemsToSpawn = [chosen, ...otherLetters].sort(() => Math.random() - 0.5);

    const newBalloons: BalloonItem[] = itemsToSpawn.map((item, idx) => {
      const col = BALLOON_COLORS[idx % BALLOON_COLORS.length];
      return {
        id: `${item.letter}-${Date.now()}-${idx}`,
        char: item.letter,
        name: item.name,
        x: 12 + idx * 22 + (Math.random() * 8 - 4),
        y: 85 + Math.random() * 15,
        speed: 0.12 + Math.random() * 0.08,
        color: col.bg,
        isTarget: item.letter === chosen.letter,
        popped: false,
      };
    });

    setBalloons(newBalloons);

    setTimeout(() => {
      playSound(`فرقع بالون ${chosen.name}!`);
    }, 150);
  };

  useEffect(() => {
    startRound();
  }, []);

  // Float animation loop
  useEffect(() => {
    const updatePhysics = () => {
      setBalloons((prev) =>
        prev.map((b) => {
          if (b.popped) return b;
          let newY = b.y - b.speed;
          if (newY < -15) {
            newY = 95; // recycle to bottom
          }
          return { ...b, y: newY };
        })
      );
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePop = (balloon: BalloonItem) => {
    if (balloon.popped) return;

    playPopSound();

    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    if (balloon.isTarget) {
      playSuccessSound();
      triggerConfetti();
      addStars(1);
      setScore((s) => s + 1);
      const praiseMsg = getCorrectAnswerPraise(getChildName(), `فرقعت بالون ${balloon.char}`);
      setFeedback(praiseMsg);
      playSound(praiseMsg);

      setTimeout(() => {
        startRound();
      }, 1500);
    } else {
      playTryAgainSound();
      setFeedback(`هذا بالون ${balloon.name}، ابحث عن ${targetChar.name}!`);
      playSound(`هذا ${balloon.name}!`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full mb-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
        >
          ⬅️ قائمة الألعاب
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border border-rose-300 rounded-2xl text-rose-900 font-bold text-sm">
          <Trophy className="w-4 h-4 text-rose-600" />
          <span>النقاط: {score}</span>
        </div>
      </div>

      {/* Target Mission Banner */}
      <div className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-3xl p-4 shadow-lg text-center mb-3 flex items-center justify-between">
        <div className="text-right">
          <span className="text-xs text-rose-100 font-bold block">مهمتك الآن:</span>
          <p className="text-lg font-black">
            فرقع بالون حرف ( <span className="text-amber-200 text-2xl">{targetChar.letter}</span> ) {targetChar.name}
          </p>
        </div>
        <button
          onClick={() => playSound(`فرقع بالون حرف ${targetChar.name}`)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-transform active:scale-90"
          title="استمع للمهمة"
        >
          <Volume2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Floating Arena */}
      <div className="relative w-full h-[400px] bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 rounded-3xl border-4 border-sky-300 overflow-hidden shadow-inner touch-none">
        {/* Sky Clouds / Decor */}
        <div className="absolute top-4 left-6 text-3xl opacity-60 select-none">☁️</div>
        <div className="absolute top-10 right-8 text-2xl opacity-60 select-none">☁️</div>
        <div className="absolute bottom-2 inset-x-0 h-6 bg-emerald-200/50 rounded-b-2xl pointer-events-none" />

        {/* Floating Balloons */}
        {balloons.map((b) => {
          if (b.popped) {
            return (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping text-3xl"
              >
                💥
              </div>
            );
          }

          return (
            <button
              key={b.id}
              onClick={() => handlePop(b)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                backgroundColor: b.color,
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-24 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] text-white shadow-lg flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90 hover:scale-105 z-10"
            >
              {/* Balloon Highlight */}
              <div className="absolute top-2 right-3 w-3 h-5 bg-white/40 rounded-full rotate-45 pointer-events-none" />

              {/* Balloon Char */}
              <span className="text-3xl font-black drop-shadow-sm select-none">
                {b.char}
              </span>

              {/* Balloon Knot and String */}
              <div
                className="absolute -bottom-2 w-3 h-2 rounded-xs pointer-events-none"
                style={{ backgroundColor: b.color }}
              />
              <div className="absolute -bottom-6 w-0.5 h-5 bg-slate-400 pointer-events-none" />
            </button>
          );
        })}
      </div>

      {/* Feedback Bar */}
      {feedback && (
        <div className="mt-3 text-center">
          <span className="inline-block px-4 py-2 bg-white text-slate-800 font-bold rounded-2xl border-2 border-slate-200 shadow-sm text-sm">
            {feedback}
          </span>
        </div>
      )}
    </div>
  );
};
