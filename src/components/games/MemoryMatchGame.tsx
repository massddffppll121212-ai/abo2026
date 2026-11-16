import React, { useState, useEffect } from 'react';
import { ARABIC_LETTERS } from '../../data/arabicData';
import { playPopSound, playSuccessSound, playFanfareSound, triggerBigCelebration } from '../../utils/sound';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface MemoryMatchGameProps {
  addStars: (count: number) => void;
  playSound: (text: string) => void;
  onBack: () => void;
}

interface CardItem {
  uid: string;
  matchId: string;
  type: 'letter' | 'picture';
  display: string;
  label: string;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  addStars,
  playSound,
  onBack,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedUids, setMatchedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const initGame = () => {
    // Select 4 random letters for 8 cards
    const shuffledLetters = [...ARABIC_LETTERS].sort(() => Math.random() - 0.5).slice(0, 4);

    const generatedCards: CardItem[] = [];
    shuffledLetters.forEach((l) => {
      // Card 1: Letter
      generatedCards.push({
        uid: `${l.letter}-letter`,
        matchId: l.letter,
        type: 'letter',
        display: l.letter,
        label: l.name,
      });
      // Card 2: Picture
      generatedCards.push({
        uid: `${l.letter}-picture`,
        matchId: l.letter,
        type: 'picture',
        display: `${l.emoji}`,
        label: l.word,
      });
    });

    setCards(generatedCards.sort(() => Math.random() - 0.5));
    setFlippedUids([]);
    setMatchedUids([]);
    setMoves(0);
    setGameWon(false);

    setTimeout(() => {
      playSound('طابق الحرف مع صورته المناسبة!');
    }, 200);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (card: CardItem) => {
    if (flippedUids.length === 2 || flippedUids.includes(card.uid) || matchedUids.includes(card.uid)) {
      return;
    }

    playPopSound();
    const newFlipped = [...flippedUids, card.uid];
    setFlippedUids(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards.find((c) => c.uid === newFlipped[0]);
      const secondCard = cards.find((c) => c.uid === newFlipped[1]);

      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Matched!
        playSuccessSound();
        playSound(getCorrectAnswerPraise(getChildName(), `تطابق ممتاز ومبدع`));
        const nextMatched = [...matchedUids, firstCard.uid, secondCard.uid];
        setMatchedUids(nextMatched);
        setFlippedUids([]);

        if (nextMatched.length === cards.length && cards.length > 0) {
          // All matched!
          setGameWon(true);
          playFanfareSound();
          triggerBigCelebration();
          addStars(3);
          playSound('مذهل! لقد أتممت جميع البطاقات وفزت بـ 3 نجوم!');
        }
      } else {
        // Not matched - flip back after brief pause
        setTimeout(() => {
          setFlippedUids([]);
        }, 900);
      }
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

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-purple-100 border border-purple-300 rounded-2xl text-purple-900 font-bold text-sm">
            الحركات: {moves}
          </div>
          <button
            onClick={initGame}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
            title="إعادة خلط البطاقات"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="text-center mb-3">
        <h3 className="font-bold text-slate-800 text-lg">لعبة مطابقة الذاكرة 🃏</h3>
        <p className="text-xs text-purple-700 font-medium">
          المس البطاقات لتجد الحرف مع شكله المطابق!
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map((card) => {
          const isFlipped = flippedUids.includes(card.uid) || matchedUids.includes(card.uid);
          const isMatched = matchedUids.includes(card.uid);

          return (
            <button
              key={card.uid}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer relative shadow-md ${
                isFlipped
                  ? isMatched
                    ? 'bg-emerald-50 border-emerald-400 scale-100 shadow-emerald-100'
                    : 'bg-white border-purple-400 rotate-0'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-700 text-white shadow-indigo-200 hover:brightness-105'
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="text-4xl sm:text-5xl select-none leading-none mb-1">
                    {card.display}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 truncate max-w-[90%]">
                    {card.label}
                  </span>
                  {isMatched && (
                    <span className="absolute top-1 right-1 text-emerald-500 text-xs">✓</span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl select-none opacity-80">❓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Win Banner */}
      {gameWon && (
        <div className="mt-5 w-full bg-emerald-50 border-4 border-emerald-300 rounded-3xl p-5 text-center shadow-lg animate-pop">
          <div className="text-4xl mb-1">🎉 🏆 🎉</div>
          <h4 className="text-xl font-black text-emerald-800 mb-1">
            أحسنت يا بطل الذاكرة الخارق!
          </h4>
          <p className="text-sm text-emerald-700 font-medium mb-3">
            لقد طابقت جميع البطاقات بنجاح وحصلت على 3 نجوم ذهبية ⭐⭐⭐
          </p>
          <button
            onClick={initGame}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-md transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            العب جولة جديدة
          </button>
        </div>
      )}
    </div>
  );
};
