/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/screens/HomeScreen';
import { LettersScreen } from './components/screens/LettersScreen';
import { NumbersScreen } from './components/screens/NumbersScreen';
import { GamesScreen } from './components/screens/GamesScreen';
import { StoriesScreen } from './components/screens/StoriesScreen';
import { QuranScreen } from './components/screens/QuranScreen';
import { AdabAndDuasScreen } from './components/screens/AdabAndDuasScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TalkingCactusScreen } from './components/screens/TalkingCactusScreen';
import { VoiceStudioScreen } from './components/screens/VoiceStudioScreen';
import { InstallAppModal } from './components/modals/InstallAppModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { speakArabic, playStarSound, playPopSound, playSuccessSound } from './utils/sound';
import { Home, BookOpen, Hash, Gamepad2, Trophy, Volume2, VolumeX, Sparkles, BookMarked, Languages, Shield, Lock, KeyRound, HeartHandshake, Smartphone } from 'lucide-react';
import { ThreeDBackgroundCanvas } from './components/3d/ThreeDBackgroundCanvas';
import { Dialect } from './utils/phrases';
import { toArabicNum } from './data/arabicData';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings'>('home');
  const [childName, setChildName] = useState('أكرم اليسري');
  const [childAvatar, setChildAvatar] = useState('👦');
  const [stars, setStars] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dialect, setDialect] = useState<Dialect>('fusha');
  const [usePhotoBg, setUsePhotoBg] = useState<boolean>(false);
  const [enable3D, setEnable3D] = useState<boolean>(true);

  // Install Modal State
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Security PIN Lock State for Settings (User configurable, default: 1234)
  const [parentPin, setParentPin] = useState('1234');
  const [parentPinEnabled, setParentPinEnabled] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('akram_child_name');
      const savedAvatar = localStorage.getItem('akram_child_avatar');
      const savedStars = localStorage.getItem('akram_stars');
      const savedSound = localStorage.getItem('akram_sound');
      const savedDialect = localStorage.getItem('akram_dialect');
      const savedPhotoBg = localStorage.getItem('akram_photo_bg');
      const savedPin = localStorage.getItem('akram_parent_pin');
      const savedPinEnabled = localStorage.getItem('akram_parent_pin_enabled');
      const savedEnable3D = localStorage.getItem('akram_enable_3d');

      if (savedName) setChildName(savedName);
      if (savedAvatar) setChildAvatar(savedAvatar);
      if (savedStars) setStars(parseInt(savedStars, 10) || 0);
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      if (savedDialect === 'yemeni' || savedDialect === 'fusha') setDialect(savedDialect);
      if (savedPhotoBg === 'true') setUsePhotoBg(true);
      if (savedPin) setParentPin(savedPin);
      if (savedPinEnabled !== null) setParentPinEnabled(savedPinEnabled !== 'false');
      if (savedEnable3D !== null) setEnable3D(savedEnable3D !== 'false');
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const handleSetDialect = (newDialect: Dialect) => {
    setDialect(newDialect);
    try {
      localStorage.setItem('akram_dialect', newDialect);
    } catch {
      // Ignore
    }
  };

  const handleOpenSettings = () => {
    playPopSound();
    // If parent disabled the PIN lock, bypass prompt directly
    if (!parentPinEnabled) {
      setScreen('settings');
      return;
    }
    setPinInput('');
    setPinError(false);
    setShowPinModal(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === parentPin.trim()) {
      playSuccessSound();
      setShowPinModal(false);
      setScreen('settings');
    } else {
      setPinError(true);
    }
  };

  // Add stars with sound and storage persistence
  const addStars = (count: number) => {
    const newStars = stars + count;
    setStars(newStars);
    try {
      localStorage.setItem('akram_stars', String(newStars));
    } catch {
      // Ignore
    }
    if (soundEnabled) {
      playStarSound();
    }
  };

  // Play spoken sound helper
  const playSound = (text: string) => {
    if (!soundEnabled) return;
    speakArabic(text, soundEnabled, dialect);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('akram_sound', String(next));
    } catch {
      // Ignore
    }
    if (next) {
      playSound('تم تشغيل الصوت');
    }
  };

  const handleNav = (target: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus') => {
    playPopSound();
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col selection:bg-amber-200 relative overflow-x-hidden">
      {/* Interactive 3D Spatial Background Canvas (2026-Gen) */}
      <ThreeDBackgroundCanvas enabled={enable3D} />

      {/* Background Photo Wallpaper Overlay (if enabled) */}
      {usePhotoBg && childAvatar && childAvatar.startsWith('data:image') && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center opacity-15 transition-opacity"
          style={{ backgroundImage: `url(${childAvatar})` }}
        />
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs px-4 py-2.5 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Zone 1: Child Profile Badge (Opens Settings) */}
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full py-1.5 px-3.5 transition-all transform active:scale-95 cursor-pointer shadow-2xs"
            title="إعدادات الملف الشخصي والتحكم الشامل"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-amber-400">
              {childAvatar && childAvatar.startsWith('data:image') ? (
                <img src={childAvatar} alt="صورة الطفل" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{childAvatar || '👦'}</span>
              )}
            </div>
            <span className="font-bold text-sm text-slate-800 truncate max-w-[90px] sm:max-w-[140px]">
              {childName}
            </span>
          </button>

          {/* Zone 2: App Brand Title */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-1.5 cursor-pointer select-none"
          >
            <span className="text-2xl animate-bounce-subtle">🎈</span>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              عالم أكرم
            </span>
          </div>

          {/* Zone 3: Install App Button, Dialect Switcher, Stars Badge & Sound Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Install Mobile App Button */}
            <button
              onClick={() => {
                playPopSound();
                setShowInstallModal(true);
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs py-1.5 px-3 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer animate-pulse-subtle"
              title="تثبيت التطبيق على هاتفك"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تثبيت التطبيق 📲</span>
              <span className="sm:hidden">تثبيت 📲</span>
            </button>

            {/* Quick Dialect Toggle */}
            <button
              onClick={() => {
                const next = dialect === 'fusha' ? 'yemeni' : 'fusha';
                handleSetDialect(next);
                playPopSound();
                playSound(next === 'yemeni' ? 'تم التبديل إلى اللهجة اليمنية يا بطل!' : 'تم التبديل إلى اللغة العربية الفصحى');
              }}
              className="text-xs font-black px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full text-amber-900 transition-all active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap"
              title="تغيير اللهجة (فصحى / يمني)"
            >
              {dialect === 'yemeni' ? '🇾🇪 يمني' : '🌍 فصحى'}
            </button>

            <button
              onClick={() => handleNav('quran')}
              className="flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 hover:border-amber-400 py-1.5 px-3 rounded-full text-amber-900 font-black text-xs sm:text-sm shadow-2xs transition-transform active:scale-95 cursor-pointer"
              title="رصيد النجوم وقصار السور"
            >
              <span className="text-base">⭐</span>
              <span className="tabular-nums font-bold">{toArabicNum(stars)}</span>
              <span className="text-[11px] hidden sm:inline">نجوم</span>
            </button>

            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 pb-24 relative z-10">
        {screen === 'home' && (
          <HomeScreen
            setScreen={(target) => {
              if (target === 'settings') {
                handleOpenSettings();
              } else {
                setScreen(target);
              }
            }}
            childName={childName}
            childAvatar={childAvatar}
            stars={stars}
            playSound={playSound}
            dialect={dialect}
            setDialect={handleSetDialect}
            onOpenInstall={() => {
              playPopSound();
              setShowInstallModal(true);
            }}
          />
        )}

        {screen === 'letters' && (
          <LettersScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
            dialect={dialect}
          />
        )}

        {screen === 'numbers' && (
          <NumbersScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
            dialect={dialect}
          />
        )}

        {screen === 'games' && (
          <GamesScreen
            setScreen={setScreen}
            addStars={addStars}
            playSound={playSound}
          />
        )}

        {screen === 'stories' && (
          <StoriesScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
          />
        )}

        {screen === 'quran' && (
          <QuranScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
            dialect={dialect}
          />
        )}

        {screen === 'adab' && (
          <AdabAndDuasScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
            dialect={dialect}
          />
        )}

        {screen === 'voiceStudio' && (
          <VoiceStudioScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
          />
        )}

        {screen === 'cactus' && (
          <TalkingCactusScreen
            setScreen={setScreen}
            playSound={playSound}
            addStars={addStars}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            setScreen={setScreen}
            childName={childName}
            setChildName={setChildName}
            childAvatar={childAvatar}
            setChildAvatar={setChildAvatar}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            stars={stars}
            setStars={setStars}
            playSound={playSound}
            dialect={dialect}
            setDialect={handleSetDialect}
            usePhotoBg={usePhotoBg}
            setUsePhotoBg={setUsePhotoBg}
            enable3D={enable3D}
            setEnable3D={setEnable3D}
            parentPin={parentPin}
            setParentPin={setParentPin}
            parentPinEnabled={parentPinEnabled}
            setParentPinEnabled={setParentPinEnabled}
          />
        )}
      </main>

      {/* Security PIN Lock Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-amber-300 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1 flex items-center justify-center gap-1.5">
              <span>قفل أمان ولي الأمر</span>
              <Shield className="w-5 h-5 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-600 font-bold mb-4">
              أدخل رمز الأمان المخصص للدخول إلى شاشة الإعدادات والتحكم:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-[1em] text-2xl font-black py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              {pinError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-bold text-xs">
                  ❌ رمز الأمان غير صحيح! يرجى إعادة المحاولة.
                </div>
              )}

              <p className="text-[11px] text-amber-800 font-bold bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200 inline-block">
                💡 رمز الأمان الحالي: {parentPin}
              </p>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition-colors cursor-pointer"
                >
                  دخول الإعدادات 🔓
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Installation & App Bundle Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        playSound={playSound}
      />

      <OfflineIndicator />

      {/* Kid-Friendly Bottom Navigation Bar (Sticky Thumb-Zone) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-amber-200 shadow-lg no-print">
        <div className="max-w-lg mx-auto grid grid-cols-6 h-16 items-center px-1">
          {/* Tab 1: Home */}
          <button
            onClick={() => handleNav('home')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'home'
                ? 'text-rose-500 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">الرئيسية</span>
          </button>

          {/* Tab 2: Letters */}
          <button
            onClick={() => handleNav('letters')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'letters'
                ? 'text-rose-500 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Languages className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">الحروف</span>
          </button>

          {/* Tab 3: Numbers */}
          <button
            onClick={() => handleNav('numbers')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'numbers'
                ? 'text-sky-500 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Hash className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">الأرقام</span>
          </button>

          {/* Tab 4: Games */}
          <button
            onClick={() => handleNav('games')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'games'
                ? 'text-emerald-500 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">الألعاب</span>
          </button>

          {/* Tab 5: Stories */}
          <button
            onClick={() => handleNav('stories')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'stories'
                ? 'text-purple-600 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <BookMarked className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">القصص</span>
          </button>

          {/* Tab 6: Quran */}
          <button
            onClick={() => handleNav('quran')}
            className={`flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
              screen === 'quran'
                ? 'text-emerald-600 font-black scale-105'
                : 'text-slate-400 hover:text-slate-600 font-bold'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] whitespace-nowrap">قصار السور</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
