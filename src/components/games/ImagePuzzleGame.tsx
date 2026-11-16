import React, { useState, useEffect } from 'react';
import { playPopSound, playSuccessSound, playKidsChime, triggerConfetti } from '../../utils/sound';
import { Sparkles, RotateCcw, Eye, Trophy, ArrowRight, Grid3X3, CheckCircle2, Award } from 'lucide-react';
import { getCorrectAnswerPraise, getChildName } from '../../utils/phrases';

interface ImagePuzzleGameProps {
  onBack: () => void;
  addStars: (count: number) => void;
  playSound: (text: string) => void;
}

interface PuzzleItem {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  gradient: string;
  hint: string;
}

const PUZZLE_ITEMS: PuzzleItem[] = [
  { id: 'lion', name: 'الأسد الشجاع', emoji: '🦁', bgColor: 'bg-amber-100 border-amber-300', gradient: 'from-amber-400 to-orange-500', hint: 'ملك الغابة القوي!' },
  { id: 'apple', name: 'التفاحة الحمراء', emoji: '🍎', bgColor: 'bg-rose-100 border-rose-300', gradient: 'from-rose-400 to-red-600', hint: 'فاكهة صحية ولذيذة!' },
  { id: 'rocket', name: 'الصاروخ الفضائي', emoji: '🚀', bgColor: 'bg-sky-100 border-sky-300', gradient: 'from-sky-400 to-indigo-600', hint: 'يطير نحو النجوم والمجرات!' },
  { id: 'mosque', name: 'المسجد المبارك', emoji: '🕌', bgColor: 'bg-emerald-100 border-emerald-300', gradient: 'from-emerald-400 to-teal-600', hint: 'بيت الله للصلاة والعبادة!' },
  { id: 'ship', name: 'السفينة البحرية', emoji: '⛵', bgColor: 'bg-cyan-100 border-cyan-300', gradient: 'from-cyan-400 to-blue-600', hint: 'تبحر في أعماق البحر الأزرق!' },
  { id: 'giraffe', name: 'الزرافة اللطيفة', emoji: '🦒', bgColor: 'bg-yellow-100 border-yellow-300', gradient: 'from-yellow-400 to-amber-600', hint: 'حيوان جميل برقبة طويلة!' }
];

export const ImagePuzzleGame: React.FC<ImagePuzzleGameProps> = ({
  onBack,
  addStars,
  playSound,
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [gridSize, setGridSize] = useState<2 | 3>(3); // 2x2 or 3x3 grid
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const item = PUZZLE_ITEMS[selectedItemIndex];
  const totalTiles = gridSize * gridSize;

  // Initialize and shuffle grid
  const initGame = (size: 2 | 3 = gridSize, itemIdx: number = selectedItemIndex) => {
    const arr = Array.from({ length: size * size }, (_, i) => i);
    // Shuffle array ensuring it's not solved initially
    let shuffled = [...arr];
    do {
      shuffled = [...arr].sort(() => Math.random() - 0.5);
    } while (isAlreadySolved(shuffled));

    setGridSize(size);
    setSelectedItemIndex(itemIdx);
    setTiles(shuffled);
    setMoves(0);
    setIsSolved(false);
    setShowHint(false);
  };

  const isAlreadySolved = (arr: number[]) => {
    return arr.every((val, idx) => val === idx);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    // Swap tile clicked with an adjacent one or swap two tiles selected
    playPopSound();
    
    // Simple drag-to-swap logic: Find an index to swap with or handle swap
    const emptyIndex = tiles.indexOf(totalTiles - 1); // Blank tile index if sliding
    
    // Check if adjacent in grid
    const row1 = Math.floor(index / gridSize);
    const col1 = index % gridSize;
    const row2 = Math.floor(emptyIndex / gridSize);
    const col2 = emptyIndex % gridSize;

    const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;

    let newTiles = [...tiles];
    if (isAdjacent) {
      // Slide move
      newTiles[emptyIndex] = tiles[index];
      newTiles[index] = totalTiles - 1;
    } else {
      // Direct swap for younger kids
      const nextEmpty = tiles.findIndex((val, i) => val !== i);
      if (nextEmpty !== -1 && nextEmpty !== index) {
        const temp = newTiles[index];
        newTiles[index] = newTiles[nextEmpty];
        newTiles[nextEmpty] = temp;
      }
    }

    setTiles(newTiles);
    setMoves(m => m + 1);

    // Check if solved
    if (isAlreadySolved(newTiles)) {
      setIsSolved(true);
      playSuccessSound();
      triggerConfetti();
      addStars(3);
      const praise = getCorrectAnswerPraise(getChildName(), 'أتممت تركيب الصورة بنجاح وتفوق!');
      playSound(praise);
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

        <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-2xl border border-amber-300 flex items-center gap-1.5">
          <Grid3X3 className="w-4 h-4 text-amber-600" />
          <span>لعبة تركيب الصور المقطعة 🧩</span>
        </span>
      </div>

      {/* Main Puzzle Area */}
      <div className="w-full bg-white rounded-3xl p-5 border-4 border-amber-300 shadow-xl space-y-4 text-center">
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => initGame(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 2 ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              مبتدئ (2×2) 🐣
            </button>
            <button
              onClick={() => initGame(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                gridSize === 3 ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              تحدي (3×3) 🧠
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-black flex items-center gap-1 cursor-pointer border border-sky-300"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showHint ? 'إخفاء الصورة' : 'معاينة الصورة 👁️'}</span>
            </button>

            <button
              onClick={() => initGame()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="إعادة الخلط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Puzzle Target Info */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-500">
            عدد الحركات: <strong className="text-amber-600 text-sm font-black">{moves}</strong>
          </span>
          <span className="text-sm font-black text-slate-800">
            ركّب صورة: <span className="text-amber-700">{item.name}</span> {item.emoji}
          </span>
        </div>

        {/* Hint Preview Overlay */}
        {showHint && (
          <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl text-white shadow-md flex items-center justify-center gap-3 animate-fade-in">
            <span className="text-6xl">{item.emoji}</span>
            <div className="text-right">
              <h4 className="font-black text-lg">{item.name}</h4>
              <p className="text-xs text-amber-100 font-bold">{item.hint}</p>
            </div>
          </div>
        )}

        {/* Puzzle Grid Canvas */}
        <div className="relative w-full max-w-sm mx-auto aspect-square p-3 bg-slate-100 rounded-3xl border-4 border-amber-200 shadow-inner flex items-center justify-center">
          <div 
            className="w-full h-full grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
            }}
          >
            {tiles.map((tileVal, idx) => {
              const isCorrectPos = tileVal === idx;
              const isBlank = tileVal === totalTiles - 1 && !isSolved;

              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  className={`relative rounded-2xl flex flex-col items-center justify-center font-black text-2xl transition-all transform active:scale-95 shadow-md cursor-pointer border-2 overflow-hidden ${
                    isBlank
                      ? 'bg-slate-200 border-dashed border-slate-400 opacity-30'
                      : isCorrectPos
                      ? 'bg-gradient-to-br from-amber-50 to-emerald-50 border-emerald-400 text-slate-800'
                      : 'bg-white border-amber-300 text-slate-800 hover:border-amber-400'
                  }`}
                >
                  {/* Tile Number Badge */}
                  <span className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                    {tileVal + 1}
                  </span>

                  {!isBlank && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-0.5">قطع {tileVal + 1}</span>
                    </div>
                  )}

                  {isCorrectPos && !isBlank && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 absolute bottom-1 left-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solved Celebration Modal */}
        {isSolved && (
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-xl space-y-3 animate-bounce-subtle">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-2xl">
              🏆
            </div>
            <h3 className="text-xl font-black">أحسنت يا بطل! تم التركيب بنجاح 🎉</h3>
            <p className="text-xs font-bold text-emerald-100">
              أكملت صورة ({item.name}) في {moves} حركة فقط وحصلت على 3 نجوم! ⭐⭐⭐
            </p>

            <button
              onClick={() => {
                const nextIdx = (selectedItemIndex + 1) % PUZZLE_ITEMS.length;
                initGame(gridSize, nextIdx);
              }}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              الصورة التالية ➔
            </button>
          </div>
        )}

        {/* Image Selection Carousel */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 block mb-2">اختر الصورة المراد تركيبها:</span>
          <div className="grid grid-cols-6 gap-2">
            {PUZZLE_ITEMS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => initGame(gridSize, idx)}
                className={`p-2 rounded-2xl text-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                  selectedItemIndex === idx
                    ? 'bg-amber-100 border-amber-500 scale-105 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
                title={p.name}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
