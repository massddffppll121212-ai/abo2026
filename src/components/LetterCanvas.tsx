import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Sparkles, Check, RotateCcw, Play, AlertCircle } from 'lucide-react';
import { playSuccessSound, playTryAgainSound, playPopSound, triggerConfetti } from '../utils/sound';
import { getCharStrokeData, LetterStrokeData, StrokePoint } from '../data/letterStrokes';
import { Dialect, getPhrase, getCorrectAnswerPraise, getChildName } from '../utils/phrases';

interface LetterCanvasProps {
  letter: string; // Letter or number character
  word?: string;
  isNumber?: boolean;
  dialect?: Dialect;
  onLetterDrawn?: () => void;
  playSound: (text: string) => void;
}

const COLORS = [
  { name: 'أحمر', value: '#EF4444' },
  { name: 'أزرق', value: '#3B82F6' },
  { name: 'أخضر', value: '#10B981' },
  { name: 'برتقالي', value: '#F97316' },
  { name: 'بنفسجي', value: '#8B5CF6' },
];

export const LetterCanvas: React.FC<LetterCanvasProps> = ({
  letter,
  word = '',
  isNumber = false,
  dialect = 'fusha',
  onLetterDrawn,
  playSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const demoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState(COLORS[0].value);
  const [brushSize] = useState(16);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawnPointsCount, setDrawnPointsCount] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<'correct' | 'incorrect' | null>(null);
  const [evaluationMsg, setEvaluationMsg] = useState('');
  const [accuracyPercent, setAccuracyPercent] = useState<number | null>(null);
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [demoPointer, setDemoPointer] = useState<StrokePoint | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeoutRef = useRef<number | null>(null);

  const strokeData: LetterStrokeData | undefined = getCharStrokeData(letter);
  const animTimeoutRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const triggerGentleShake = () => {
    setIsShaking(true);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = window.setTimeout(() => {
      setIsShaking(false);
    }, 650);
  };

  // Clear user canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setDrawnPointsCount(0);
    setEvaluationResult(null);
    setEvaluationMsg('');
    setAccuracyPercent(null);
    setIsShaking(false);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    playPopSound();
  };

  // Interpolate intermediate points for ultra-smooth and slow demonstration
  const interpolatePoints = (p1: StrokePoint, p2: StrokePoint, stepSize: number = 6): StrokePoint[] => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= stepSize) return [p2];

    const steps = Math.ceil(dist / stepSize);
    const pts: StrokePoint[] = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      pts.push({
        x: p1.x + dx * t,
        y: p1.y + dy * t,
      });
    }
    return pts;
  };

  // Run the automated demonstration of writing the letter in a calm, relatively slow pace
  const runDemonstration = () => {
    if (!strokeData || strokeData.strokes.length === 0) return;

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const demoCanvas = demoCanvasRef.current;
    if (!demoCanvas) return;
    const ctx = demoCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, demoCanvas.width, demoCanvas.height);
    setIsDemonstrating(true);
    setEvaluationResult(null);
    setEvaluationMsg('');

    // Dense interpolation for a calm, educational stroke drawing
    const detailedStrokes: StrokePoint[][] = strokeData.strokes.map((stroke) => {
      if (stroke.length <= 1) return stroke;
      const interpolated: StrokePoint[] = [stroke[0]];
      for (let i = 0; i < stroke.length - 1; i++) {
        const seg = interpolatePoints(stroke[i], stroke[i + 1], 5);
        interpolated.push(...seg);
      }
      return interpolated;
    });

    // Voice prompt
    const itemLabel = isNumber ? letter : letter;
    const introMsg = dialect === 'yemeni'
      ? `شوف يا بطل كيف نكتب ${itemLabel} ببطء، وبعدها ابدأ من النقطة الخضراء واكتب بيدك!`
      : `شاهد كيف نكتب ${itemLabel} ببطء، ثم ابدأ من النقطة الخضراء واكتب بيدك!`;
    playSound(introMsg);

    let strokeIndex = 0;
    let stepIndex = 0;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 14;

    const animateSlowly = () => {
      if (strokeIndex >= detailedStrokes.length) {
        setIsDemonstrating(false);
        // Leave the demo guide visible for 1.5s, then clear so child writes freely
        animTimeoutRef.current = window.setTimeout(() => {
          ctx.clearRect(0, 0, demoCanvas.width, demoCanvas.height);
          setDemoPointer(null);
        }, 1500);
        return;
      }

      const currentStroke = detailedStrokes[strokeIndex];

      if (stepIndex === 0) {
        ctx.beginPath();
        ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
        setDemoPointer(currentStroke[0]);
        stepIndex++;
        // Short pause at beginning of stroke
        animTimeoutRef.current = window.setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(animateSlowly);
        }, 180);
        return;
      }

      if (stepIndex < currentStroke.length) {
        const pt = currentStroke[stepIndex];
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        setDemoPointer(pt);
        stepIndex++;

        // Slower step interval (65ms per micro-point for gentle, legible drawing)
        animTimeoutRef.current = window.setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(animateSlowly);
        }, 65);
      } else {
        // Pause between strokes (e.g. before dots or next stroke)
        strokeIndex++;
        stepIndex = 0;
        animTimeoutRef.current = window.setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(animateSlowly);
        }, 350);
      }
    };

    animTimeoutRef.current = window.setTimeout(() => {
      animateSlowly();
    }, 450);
  };

  useEffect(() => {
    clearCanvas();

    const timer = setTimeout(() => {
      runDemonstration();
    }, 600);

    return () => {
      clearTimeout(timer);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [letter]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDemonstrating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setEvaluationResult(null);
    setEvaluationMsg('');
    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    setDrawnPointsCount((c) => c + 1);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isDemonstrating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setDrawnPointsCount((c) => c + 1);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Precise verification algorithm: checks checkpoint coverage and detects errors/scribbles
  const evaluateDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !strokeData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Minimum stroke points check
    if (drawnPointsCount < 8) {
      setEvaluationResult('incorrect');
      setAccuracyPercent(20);
      triggerGentleShake();
      const msg = dialect === 'yemeni'
        ? 'محاولة حلوة وبداية ذكية يا غالي! 🌟 واصل وامشي على المسار كامل وبتاخذ النجمة فوراً! 💪'
        : 'بداية جميلة ومحاولة رائعة يا بطل! 🌟 هيا نكمل مسار الحرف بالكامل لننال النجمة معاً، أنت تستطيع! 💪';
      setEvaluationMsg(msg);
      playTryAgainSound();
      playSound(msg);
      return;
    }

    // Extract image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Generate checkpoints along the target strokes
    const checkpoints: StrokePoint[] = [];
    strokeData.strokes.forEach((stroke) => {
      if (stroke.length <= 1) {
        checkpoints.push(stroke[0]);
      } else {
        for (let i = 0; i < stroke.length - 1; i++) {
          checkpoints.push(stroke[i]);
          // midpoint
          checkpoints.push({
            x: Math.round((stroke[i].x + stroke[i + 1].x) / 2),
            y: Math.round((stroke[i].y + stroke[i + 1].y) / 2),
          });
        }
        checkpoints.push(stroke[stroke.length - 1]);
      }
    });

    if (checkpoints.length === 0) return;

    // Check how many checkpoints have drawn pixels nearby
    const checkRadius = 24; // generous hit radius for child motor ability
    let hitCount = 0;

    checkpoints.forEach((cp) => {
      let isHit = false;
      const minX = Math.max(0, Math.round(cp.x - checkRadius));
      const maxX = Math.min(canvas.width - 1, Math.round(cp.x + checkRadius));
      const minY = Math.max(0, Math.round(cp.y - checkRadius));
      const maxY = Math.min(canvas.height - 1, Math.round(cp.y + checkRadius));

      // Sample pixels in radius
      for (let y = minY; y <= maxY && !isHit; y += 3) {
        for (let x = minX; x <= maxX; x += 3) {
          const idx = (y * canvas.width + x) * 4;
          const alpha = pixels[idx + 3];
          if (alpha > 40) {
            isHit = true;
            break;
          }
        }
      }

      if (isHit) hitCount++;
    });

    const coverageRate = Math.round((hitCount / checkpoints.length) * 100);
    setAccuracyPercent(coverageRate);

    // Threshold: 62% coverage required to count as correct
    if (coverageRate >= 62) {
      setEvaluationResult('correct');
      playSuccessSound();
      triggerConfetti();

      const successMsg = getCorrectAnswerPraise(getChildName(), 'خطك ممتاز ومتقن جداً وحصلت على نجمة', dialect);
      setEvaluationMsg(successMsg);
      playSound(successMsg);

      if (onLetterDrawn) {
        onLetterDrawn();
      }
    } else {
      // Detected incorrect / inaccurate stroke!
      setEvaluationResult('incorrect');
      triggerGentleShake();
      playTryAgainSound();

      const failMsg = dialect === 'yemeni'
        ? `قريب قوي يا بطل ولا يهمك! 🎨 جرب مرة ثانية وتتبع النقطة الخضراء وبتضبط معك مية مية! 🌟`
        : `أنت قريب جداً ومحاولتك رائعة يا بطل! 🎨 حاول مرة أخرى وتتبع النقطة الخضراء برفق وستتقنها بالتأكيد! 🌟`;
      setEvaluationMsg(failMsg);
      playSound(failMsg);
    }
  };

  const startPoint = strokeData?.startPoint;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-amber-50/70 p-4 rounded-3xl border-2 border-amber-200 shadow-sm">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="font-black text-amber-900 text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {isNumber ? `لوحة كتابة الرقم (${letter})` : `لوحة كتابة الحرف (${letter})`}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Replay Demonstration button */}
          <button
            onClick={() => {
              playPopSound();
              runDemonstration();
            }}
            disabled={isDemonstrating}
            className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all shadow-2xs font-bold cursor-pointer ${
              isDemonstrating
                ? 'bg-amber-200 border-amber-300 text-amber-900'
                : 'bg-white border-amber-300 hover:bg-amber-100 text-amber-800'
            }`}
            title="إعادة التوضيح البطيء لطريقة الكتابة"
          >
            <Play className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>{isDemonstrating ? 'جارٍ التوضيح ببطء...' : 'شاهد البداية'}</span>
          </button>

          {/* Clear canvas button */}
          <button
            onClick={clearCanvas}
            disabled={isDemonstrating}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 flex items-center gap-1 hover:bg-amber-100 transition-colors shadow-2xs font-bold cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      </div>

      {/* Start Hint Banner */}
      <div className="w-full bg-white/95 border border-amber-300 rounded-xl px-3 py-1.5 mb-2.5 text-center shadow-2xs">
        <p className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{strokeData?.startHint || `ابدأ من النقطة الخضراء واتبع المسار`}</span>
        </p>
      </div>

      {/* Drawing Stage with 256x256 canvases */}
      <div
        className={`relative w-64 h-64 bg-white rounded-2xl border-4 transition-all duration-300 shadow-inner overflow-hidden flex items-center justify-center touch-none select-none ${
          isShaking
            ? 'animate-gentle-shake border-rose-400 ring-4 ring-rose-200/90 shadow-rose-200/50 bg-rose-50/25'
            : evaluationResult === 'incorrect'
            ? 'border-rose-300 ring-2 ring-rose-200/70 bg-rose-50/15'
            : evaluationResult === 'correct'
            ? 'border-emerald-400 ring-4 ring-emerald-200 shadow-emerald-100'
            : 'border-amber-300'
        }`}
      >
        {/* Subtle soft red glow/overlay when incorrect to gently indicate trying again */}
        {evaluationResult === 'incorrect' && (
          <div className="absolute inset-0 bg-rose-500/8 pointer-events-none z-20 transition-all duration-300 animate-pulse flex items-start justify-center pt-2">
            <span className="bg-rose-500/95 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 animate-bounce-subtle pointer-events-none">
              <span>💪</span>
              <span>{dialect === 'yemeni' ? 'محاولة ممتازة! يلا نجرب ثانية' : 'محاولة رائعة! هيا نحاول مجدداً'}</span>
            </span>
          </div>
        )}

        {/* Visual background template letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[145px] font-bold text-slate-200/90 leading-none select-none"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {letter}
          </span>
        </div>

        {/* Green starting point indicator with pulsing ripple */}
        {startPoint && !isDemonstrating && (
          <div
            style={{ left: `${(startPoint.x / 256) * 100}%`, top: `${(startPoint.y / 256) * 100}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-7 h-7 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black">
                1
              </span>
            </div>
            {!hasDrawn && (
              <span className="mt-1 bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs whitespace-nowrap">
                ابدأ هنا 🟢
              </span>
            )}
          </div>
        )}

        {/* Demonstration Overlay Canvas */}
        <canvas
          ref={demoCanvasRef}
          width={256}
          height={256}
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
        />

        {/* Animated slow demo pointer hand */}
        {isDemonstrating && demoPointer && (
          <div
            style={{
              left: `${(demoPointer.x / 256) * 100}%`,
              top: `${(demoPointer.y / 256) * 100}%`,
              transition: 'left 65ms linear, top 65ms linear',
            }}
            className="absolute transform -translate-x-3 -translate-y-8 pointer-events-none z-30 filter drop-shadow-md text-3xl"
          >
            ✍️
          </div>
        )}

        {/* Child interactive drawing canvas */}
        <canvas
          ref={canvasRef}
          width={256}
          height={256}
          className={`w-full h-full z-10 ${isDemonstrating ? 'cursor-wait pointer-events-none' : 'cursor-crosshair'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Color Palette Selector */}
      <div className="flex items-center justify-center gap-2.5 mt-3">
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setBrushColor(c.value);
              playPopSound();
            }}
            style={{ backgroundColor: c.value }}
            className={`w-8 h-8 rounded-full transition-transform shadow-xs cursor-pointer ${
              brushColor === c.value
                ? 'scale-120 ring-3 ring-amber-400 ring-offset-2'
                : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            title={c.name}
          />
        ))}
      </div>

      {/* Accuracy & Error Feedback Banner with Encouragement */}
      {evaluationResult && (
        <div
          className={`w-full mt-3 p-3.5 rounded-2xl border-2 flex items-start gap-2.5 text-right transition-all shadow-xs ${
            evaluationResult === 'correct'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 animate-pop'
              : 'bg-rose-50/90 border-rose-300 text-rose-950 animate-pop'
          }`}
        >
          {evaluationResult === 'correct' ? (
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-black mb-0.5 text-rose-900">
              {evaluationResult === 'correct'
                ? (dialect === 'yemeni' ? 'كفو والله يا فنان! ⭐' : 'ممتاز وأحسنت يا بطل! ⭐')
                : (dialect === 'yemeni' ? 'محاولة شجاعة وقريبة يا غالي! 💪' : 'محاولة رائعة وبداية قوية يا بطل! 💪')}
            </p>
            <p className="text-xs font-semibold leading-relaxed">
              {evaluationMsg}
            </p>
          </div>
        </div>
      )}

      {/* Action / Evaluation Buttons */}
      {evaluationResult === 'incorrect' ? (
        <div className="w-full mt-3 flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="flex-1 py-3 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Eraser className="w-4 h-4 text-amber-700" />
            <span>امسح وجرب ثانية 🎨</span>
          </button>
          <button
            onClick={() => {
              playPopSound();
              runDemonstration();
            }}
            className="flex-1 py-3 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 border-2 border-sky-300 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Play className="w-4 h-4 fill-sky-600 text-sky-600" />
            <span>شاهد التوضيح 👀</span>
          </button>
        </div>
      ) : (
        <button
          onClick={evaluateDrawing}
          disabled={!hasDrawn || isDemonstrating || evaluationResult === 'correct'}
          className={`w-full mt-3 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            evaluationResult === 'correct'
              ? 'bg-emerald-500 text-white cursor-default shadow-emerald-200'
              : hasDrawn && !isDemonstrating
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 hover:brightness-105 active:scale-98 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {evaluationResult === 'correct' ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              أحسنت! إجابة صحيحة ومتقنة ⭐
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              تحقق من صحة كتابتي وافحص الحرف ⭐
            </>
          )}
        </button>
      )}
    </div>
  );
};
