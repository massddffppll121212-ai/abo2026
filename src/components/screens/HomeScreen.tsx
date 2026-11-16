import React, { useState } from 'react';
import { ARABIC_LETTERS, ARABIC_NUMBERS } from '../../data/arabicData';
import { BookOpen, Hash, Gamepad2, Trophy, Settings, Sparkles, Volume2, Shield, Music, DownloadCloud, Smartphone } from 'lucide-react';
import { playPopSound } from '../../utils/sound';
import { Spatial3DCard } from '../3d/Spatial3DCard';
import { Dialect, getPhrase } from '../../utils/phrases';

interface HomeScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  childName: string;
  childAvatar: string;
  stars: number;
  playSound: (text: string) => void;
  dialect?: Dialect;
  setDialect?: (d: Dialect) => void;
  onOpenInstall?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setScreen,
  childName,
  childAvatar,
  stars,
  playSound,
  dialect = 'fusha',
  setDialect,
  onOpenInstall,
}) => {
  // Letter and number of the day (based on today's date)
  const today = new Date();
  const dayIndex = today.getDate() % ARABIC_LETTERS.length;
  const letterOfDay = ARABIC_LETTERS[dayIndex];
  const numOfDay = ARABIC_NUMBERS[today.getDate() % ARABIC_NUMBERS.length];

  // Parent lock state
  const [showParentLock, setShowParentLock] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [lockError, setLockError] = useState(false);

  const num1 = 3;
  const num2 = 4;
  const correctAnswer = num1 + num2; // 7

  const handleOpenParentSettings = () => {
    playPopSound();
    setShowParentLock(true);
    setParentAnswer('');
    setLockError(false);
  };

  const handleVerifyParentLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentAnswer, 10) === correctAnswer) {
      setShowParentLock(false);
      setScreen('settings');
    } else {
      setLockError(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-6">
      {/* Friendly Welcome Hero Banner */}
      <div className="relative w-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl overflow-hidden">
        {/* Playful background decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute top-2 left-6 text-4xl opacity-30 select-none animate-float">🎈</div>
        <div className="absolute bottom-2 right-12 text-3xl opacity-30 select-none">⭐</div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              مرحباً بك في عالم المعرفة والمرح
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-sm flex items-center gap-2">
              <span>أهلاً يا {childName}!</span>
              {childAvatar && childAvatar.startsWith('data:image') ? (
                <img src={childAvatar} alt="صورة الطفل" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md inline-block shrink-0" />
              ) : (
                <span>{childAvatar || '👦'}</span>
              )}
            </h1>
            <p className="text-rose-100 text-sm sm:text-base font-semibold mt-1">
              هيا نكتشف الحروف والأرقام ونلعب أمتع الألعاب!
            </p>
          </div>

          <button
            onClick={() => playSound(getPhrase(dialect, 'welcome', childName))}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-transform active:scale-95 shadow-md cursor-pointer"
            title="استمع للترحيب"
          >
            <Volume2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Quick Dialect Selector */}
      {setDialect && (
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="text-xs font-bold text-slate-500">لهجة الصوت:</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-amber-200 shadow-2xs">
            <button
              onClick={() => {
                playPopSound();
                setDialect('fusha');
                playSound('مرحباً بك في لغة الضاد الفصحى');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                dialect === 'fusha'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌍 العربية الفصحى
            </button>
            <button
              onClick={() => {
                playPopSound();
                setDialect('yemeni');
                playSound('يا حيا ومسهلا بك باللهجة اليمنية يا بطل!');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                dialect === 'yemeni'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇾🇪 اللهجة اليمنية
            </button>
          </div>
        </div>
      )}

      {/* Daily Discovery Strip (حرف اليوم & رقم اليوم) */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Letter of the day */}
        <div
          onClick={() => {
            playPopSound();
            setScreen('letters');
          }}
          className="bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-98"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-3xl font-black shrink-0 border border-rose-100">
            {letterOfDay.letter}
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-bold text-rose-500 block">حرف اليوم</span>
            <span className="text-xs font-black text-slate-800 truncate block">
              {letterOfDay.letter} مثل {letterOfDay.word} {letterOfDay.emoji}
            </span>
          </div>
        </div>

        {/* Number of the day */}
        <div
          onClick={() => {
            playPopSound();
            setScreen('numbers');
          }}
          className="bg-white border-2 border-sky-200 hover:border-sky-400 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-98"
        >
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 border border-sky-100">
            {numOfDay.num}
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-bold text-sky-500 block">رقم اليوم</span>
            <span className="text-xs font-black text-slate-800 truncate block">
              {numOfDay.word} ({numOfDay.label})
            </span>
          </div>
        </div>
      </div>

      {/* Featured Banner: Voice Studio (Record Letters & Stories) */}
      <div 
        onClick={() => {
          playPopSound();
          setScreen('voiceStudio');
        }}
        className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-3xl p-5 text-white shadow-xl cursor-pointer transition-all transform hover:-translate-y-1 active:scale-98 border-2 border-purple-300 relative overflow-hidden group"
      >
        <div className="absolute top-2.5 left-4 bg-amber-400 text-amber-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
          <span>🎙️</span>
          <span>سجل صوتك كلغة أصلية</span>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2 sm:mt-0">
          <div className="text-right space-y-1">
            <span className="text-xs font-bold text-purple-200 block">استوديو تسجيل الأصوات</span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>سجّل صوتك في الحروف والقصص 🎙️</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 font-semibold max-w-md">
              سجل نطق الحروف (أ، ب، ت...) أو احكِ قصة بصوتك أو صوت طفلك ليتم حفظها وتشغيلها كلغة أصلية للبرنامج!
            </p>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all select-none shadow-inner">
            🎙️
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid - 2026-Gen 3D Spatial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* 0. User Voice Recording Studio */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('voiceStudio');
          }}
          title="استوديو تسجيل صوتك"
          subtitle="سجل نطق الحروف بصوتك (أ، ب، ت) أو احكِ قصة مكتوبة ليحتفظ بها البرنامج كلغة أصلية"
          badgeText="صوتك الأصلي 🎙️"
          icon3D="🎙️"
          colorScheme="purple"
        />

        {/* 1. Letters */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('letters');
          }}
          title="الحروف العربية"
          subtitle="28 حرفاً مع النطق، الكلمات، وتتبع الرسم التفاعلي ثلاثي الأبعاد"
          badgeText="الجيل الجديد 2026 🚀"
          icon3D="🦁"
          colorScheme="rose"
        />

        {/* 2. Numbers & Counting */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('numbers');
          }}
          title="الأرقام والعد"
          subtitle="من 1 إلى 20 مع عد العناصر وأسئلة الحساب الممتعة"
          badgeText="رياضيات ذكية 🔢"
          icon3D="🔢"
          colorScheme="sky"
        />

        {/* 3. Educational Games */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('games');
          }}
          title="الألعاب والذكاء"
          subtitle="تركيب الصور المقطعة، فرقعة البالونات، الذاكرة والألغاز الصعبة"
          badgeText="تفكير وألغاز 🧠"
          icon3D="🎮"
          colorScheme="purple"
        />

        {/* 4. Stories & Tales */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('stories');
          }}
          title="قصص الحكايات"
          subtitle="قصص ممتعة وهادفة مع الاستماع الصوتي والدروس اللطيفة"
          badgeText="حكايات معبرة 📖"
          icon3D="📖"
          colorScheme="indigo"
        />

        {/* 5. Short Quran Surahs for Kids */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('quran');
          }}
          title="قصار السور والتفسير"
          subtitle="استمع لقصار السور القرآنية وتعرف على تفسير كل سورة ومعناها للأطفال"
          badgeText="القرآن الكريم 🌙"
          icon3D="🕌"
          colorScheme="emerald"
        />

        {/* 6. Islamic Etiquettes & Daily Supplications */}
        <Spatial3DCard
          onClick={() => {
            playPopSound();
            setScreen('adab');
          }}
          title="آداب وأدعية المسلم الصغير"
          subtitle="آداب الطعام، دعاء دخول الحمام والخروج منه، ودعاء النوم والاستيقاظ"
          badgeText="أذكار يومية 🤲"
          icon3D="🤲"
          colorScheme="amber"
        />

        {/* 6. Install App on Mobile (PWA & APK) */}
        <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-emerald-300">
          <div className="flex items-center gap-3 text-right">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 select-none shadow-inner">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">تثبيت تطبيق عالم أكرم على هاتفك</h3>
                <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-xs">
                  تثبيت فوري ⚡
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-100 mt-1 max-w-md">
                ثبت التطبيق بشاشة كاملة على هاتفك بدون متصفح، أو حمل الحزمة الكاملة للتطبيق للعمل أوفلاين وتجهيز الأندرويد!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {onOpenInstall && (
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onOpenInstall();
                }}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>📲 تثبيت على الهاتف</span>
              </button>
            )}

            <a
              href="/AkramWorld_App_Bundle.zip"
              download="AkramWorld_App_Bundle.zip"
              onClick={() => playPopSound()}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="تحميل حزمة التطبيق الكاملة"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>حزمة الملفات 📦</span>
            </a>
          </div>
        </div>
      </div>

      {/* Parent Gateway Link */}
      <div className="pt-2 pb-4">
        <button
          onClick={handleOpenParentSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer border border-slate-200 shadow-xs"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>بوابة أولياء الأمور (تعديل الاسم والإعدادات)</span>
        </button>
      </div>

      {/* Parent Lock Modal */}
      {showParentLock && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-amber-300 shadow-2xl text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">بوابة الأولياء</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              للتحقق من أنك ولي الأمر، يرجى حل هذه المسألة البسيطة:
            </p>

            <form onSubmit={handleVerifyParentLock} className="space-y-4">
              <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl font-black text-slate-800">
                {num1} + {num2} = ؟
              </div>

              <input
                type="number"
                value={parentAnswer}
                onChange={(e) => {
                  setParentAnswer(e.target.value);
                  setLockError(false);
                }}
                placeholder="اكتب الناتج هنا"
                autoFocus
                className="w-full text-center py-2.5 px-4 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:outline-hidden text-lg font-bold"
              />

              {lockError && (
                <p className="text-xs font-bold text-rose-500">
                  إجابة غير صحيحة، حاول مجدداً!
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors"
                >
                  دخول
                </button>
                <button
                  type="button"
                  onClick={() => setShowParentLock(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
