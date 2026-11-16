import React, { useState } from 'react';
import { LetterQuizGame } from '../games/LetterQuizGame';
import { CountingGame } from '../games/CountingGame';
import { BalloonPopGame } from '../games/BalloonPopGame';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { WordMatchGame } from '../games/WordMatchGame';
import { SmartQuizGame } from '../games/SmartQuizGame';
import { ImagePuzzleGame } from '../games/ImagePuzzleGame';
import { SmartRiddlesGame } from '../games/SmartRiddlesGame';
import { OnlineSyncModal } from '../modals/OnlineSyncModal';
import { TalkingCactusScreen } from './TalkingCactusScreen';
import { playPopSound } from '../../utils/sound';
import { Sparkles, Gamepad2, Globe, DownloadCloud, Grid3X3, Brain } from 'lucide-react';

interface GamesScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  addStars: (count: number) => void;
  playSound: (text: string) => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({
  setScreen,
  addStars,
  playSound,
}) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'cactus' | 'letters' | 'wordMatch' | 'counting' | 'balloons' | 'memory' | 'smartQuiz' | 'puzzle' | 'riddles'>('menu');
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  if (activeGame === 'cactus') {
    return (
      <TalkingCactusScreen
        setScreen={setScreen}
        addStars={addStars}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'smartQuiz') {
    return (
      <>
        <SmartQuizGame
          addStars={addStars}
          playSound={playSound}
          onBack={() => {
            playPopSound();
            setActiveGame('menu');
          }}
          onOpenOnlineSync={() => setShowOnlineModal(true)}
        />
        <OnlineSyncModal
          isOpen={showOnlineModal}
          onClose={() => setShowOnlineModal(false)}
          playSound={playSound}
        />
      </>
    );
  }

  if (activeGame === 'letters') {
    return (
      <LetterQuizGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'wordMatch') {
    return (
      <WordMatchGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'counting') {
    return (
      <CountingGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'balloons') {
    return (
      <BalloonPopGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'puzzle') {
    return (
      <ImagePuzzleGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'riddles') {
    return (
      <SmartRiddlesGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  if (activeGame === 'memory') {
    return (
      <MemoryMatchGame
        addStars={addStars}
        playSound={playSound}
        onBack={() => {
          playPopSound();
          setActiveGame('menu');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {/* Top Bar */}
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

        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200">
          🎮 6 ألعاب ذكاء وتحدي
        </span>
      </div>

      {/* Online Sync Callout Banner */}
      <div className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 rounded-3xl p-4 text-white shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
            🌐
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base">تحديث الأسئلة والألعاب عبر الإنترنت</h3>
            <p className="text-[11px] text-sky-100 font-medium">
              تنزيل حزم أسئلة أونلاين جديدة وتخصيص محتوى الألعاب
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playPopSound();
            setShowOnlineModal(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-white text-indigo-900 font-black text-xs shadow-md hover:bg-sky-50 transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-indigo-600" />
          <span>تحديث عبر النت</span>
        </button>
      </div>

      <div className="text-center mb-1">
        <h2 className="text-2xl font-black text-slate-800">الألعاب التعليمية الممتعة</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          اختر لعبتك المفضلة، أجب بشكل صحيح واجمع النجوم! ⭐
        </p>
      </div>

      {/* Games List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Featured Game: Talking Cactus Simulator (Offline Voice Mimic) */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('cactus');
          }}
          className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white rounded-3xl p-5 text-right flex items-center justify-between shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group col-span-1 sm:col-span-2 relative overflow-hidden border-2 border-emerald-300"
        >
          <div className="absolute top-2 left-3 bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
            <span>🌵</span>
            <span>بدون إنترنت 100%</span>
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-200 block mb-1">المحاكي الصوتي الواقعي</span>
            <h3 className="text-xl font-black text-white flex items-center gap-1.5">
              <span>🌵 محاكي الصبار الراقص ومقلد الأصوات</span>
            </h3>
            <p className="text-xs text-emerald-100 font-semibold mt-1">
              تحدث معه فيقلد صوتك فوراً! اختر صوت الصبار، صوتك الحقيقي، القطة اللطيفة، أو الأسد الضخم.
            </p>
          </div>
          <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform select-none">
            🌵
          </div>
        </button>

        {/* Featured Game: Smart Kids Quiz (Online / Dynamic) */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('smartQuiz');
          }}
          className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white rounded-3xl p-5 text-right flex items-center justify-between shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group col-span-1 sm:col-span-2 relative overflow-hidden"
        >
          <div className="absolute top-2 left-3 bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <span>🌐</span>
            <span>محدثة أونلاين</span>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-200 block mb-1">مسابقة المعرفة الذكية</span>
            <h3 className="text-xl font-black text-white">
              🧠 بنك الأسئلة والذكاء للأطفال
            </h3>
            <p className="text-xs text-indigo-100 font-semibold mt-1">
              أسئلة ومعلومات عامة ممتعة ومسابقات قابلة للتحديث والتنزيل عبر الإنترنت
            </p>
          </div>
          <div className="text-5xl group-hover:scale-110 transition-transform select-none">
            🚀
          </div>
        </button>

        {/* Game 1: Letter Quiz */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('letters');
          }}
          className="bg-white hover:bg-rose-50/60 border-3 border-rose-200 hover:border-rose-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-rose-500 block mb-1">تحدي الحروف</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-rose-600 transition-colors">
              🎯 اختر الحرف الصحيح
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              استمع للحرف واختر بطاقته من بين الخيارات
            </p>
          </div>
          <div className="text-4xl text-rose-500 group-hover:scale-110 transition-transform">
            📚
          </div>
        </button>

        {/* Game 2: Word to Picture Match */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('wordMatch');
          }}
          className="bg-white hover:bg-blue-50/60 border-3 border-blue-200 hover:border-blue-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-blue-500 block mb-1">تحدي الكلمات</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              🧩 مطابقة الصور والكلمات
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              طابق الصورة مع الكلمة العربية المناسبة
            </p>
          </div>
          <div className="text-4xl text-blue-500 group-hover:scale-110 transition-transform">
            🍎
          </div>
        </button>

        {/* Game 2: Counting Objects */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('counting');
          }}
          className="bg-white hover:bg-sky-50/60 border-3 border-sky-200 hover:border-sky-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-sky-500 block mb-1">تحدي الحساب</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-600 transition-colors">
              🔢 عد واكتشف الأشكال
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              المس العناصر وعدّها ثم اختر الرقم المطابق
            </p>
          </div>
          <div className="text-4xl text-sky-500 group-hover:scale-110 transition-transform">
            ⭐
          </div>
        </button>

        {/* Game 3: Balloon Pop */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('balloons');
          }}
          className="bg-white hover:bg-amber-50/60 border-3 border-amber-200 hover:border-amber-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-amber-500 block mb-1">خفة وسرعة</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">
              🎈 فرقعة البالونات السحرية
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              فرقع البالون الذي يحمل الحرف المطلوب بأسرع وقت
            </p>
          </div>
          <div className="text-4xl text-amber-500 group-hover:scale-110 transition-transform">
            🎈
          </div>
        </button>

        {/* Game 4: Jigsaw Tile Image Puzzle */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('puzzle');
          }}
          className="bg-white hover:bg-amber-50/60 border-3 border-amber-200 hover:border-amber-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-amber-600 block mb-1">تركيب ذكي والتحدي</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <span>🧩 تركيب الصور المقطعة</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              رتب القطع المقطعة والشفرات لتشكل الصورة الكاملة
            </p>
          </div>
          <div className="text-4xl text-amber-500 group-hover:scale-110 transition-transform">
            🧩
          </div>
        </button>

        {/* Game 5: Smart Riddles & Brain Teasers */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('riddles');
          }}
          className="bg-white hover:bg-purple-50/60 border-3 border-purple-200 hover:border-purple-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-purple-600 block mb-1">تفكير وفطنة</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
              <span>🧠 الألغاز والأسئلة الذكية</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              ألغاز محفزة للتفكير الذكي والتأمل مسببة التحدي
            </p>
          </div>
          <div className="text-4xl text-purple-500 group-hover:scale-110 transition-transform">
            💡
          </div>
        </button>

        {/* Game 6: Memory Match */}
        <button
          onClick={() => {
            playPopSound();
            setActiveGame('memory');
          }}
          className="bg-white hover:bg-purple-50/60 border-3 border-purple-200 hover:border-purple-400 rounded-3xl p-5 text-right flex items-center justify-between shadow-md transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold text-purple-500 block mb-1">قوة الملاحظة</span>
            <h3 className="text-lg font-black text-slate-800 group-hover:text-purple-600 transition-colors">
              🃏 لعبة مطابقة الذاكرة
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              اقلب البطاقات وطابق الحرف مع صورته اللطيفة
            </p>
          </div>
          <div className="text-4xl text-purple-500 group-hover:scale-110 transition-transform">
            ✨
          </div>
        </button>
      </div>

      {/* Online Sync & Question Editor Modal */}
      <OnlineSyncModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        playSound={playSound}
      />
    </div>
  );
};
