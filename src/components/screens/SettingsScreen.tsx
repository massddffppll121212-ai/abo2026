import React, { useState, useEffect } from 'react';
import { 
  playPopSound, 
  playSuccessSound, 
  speakArabic,
  getAvailableArabicVoices,
  setSelectedVoiceName,
  getSelectedVoiceName,
  isLikelyFemaleVoice,
  getSpeechPitch,
  setSpeechPitch,
  getSpeechRate,
  setSpeechRate,
} from '../../utils/sound';
import { Settings, User, Volume2, RotateCcw, Check, Sparkles, AlertTriangle, Camera, Globe, DownloadCloud, Shield, Lock, KeyRound, Sliders, Layers, Mic } from 'lucide-react';
import { OnlineSyncModal } from '../modals/OnlineSyncModal';
import { isUserVoiceActive, setUserVoiceActive, getRecordedKeysSet } from '../../utils/userVoiceStorage';
import { Dialect } from '../../utils/phrases';

interface SettingsScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'cactus' | 'settings') => void;
  childName: string;
  setChildName: (name: string) => void;
  childAvatar: string;
  setChildAvatar: (avatar: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  stars: number;
  setStars: (stars: number) => void;
  playSound: (text: string) => void;
  dialect?: Dialect;
  setDialect?: (d: Dialect) => void;
  usePhotoBg?: boolean;
  setUsePhotoBg?: (v: boolean) => void;
  enable3D?: boolean;
  setEnable3D?: (v: boolean) => void;
  parentPin?: string;
  setParentPin?: (pin: string) => void;
  parentPinEnabled?: boolean;
  setParentPinEnabled?: (enabled: boolean) => void;
}

const AVATARS = [
  '👦', '👧', '🦁', '🐱', '🐼', '🚀', '🤖', '🦄', '🦊', '👑', '🐻', '🐶', '🐯', '🐰',
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  setScreen,
  childName,
  setChildName,
  childAvatar,
  setChildAvatar,
  soundEnabled,
  setSoundEnabled,
  stars,
  setStars,
  playSound,
  dialect = 'fusha',
  setDialect,
  usePhotoBg = false,
  setUsePhotoBg,
  enable3D = true,
  setEnable3D,
  parentPin = '1234',
  setParentPin,
  parentPinEnabled = true,
  setParentPinEnabled,
}) => {
  const [tempName, setTempName] = useState(childName);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => getSelectedVoiceName());

  // Full Program Control States
  const [tempPin, setTempPin] = useState(parentPin);
  const [isPinActive, setIsPinActive] = useState(parentPinEnabled);
  const [is3DActive, setIs3DActive] = useState(enable3D);
  const [pitchVal, setPitchVal] = useState<number>(() => getSpeechPitch());
  const [rateVal, setRateVal] = useState<number>(() => getSpeechRate());
  const [userVoiceActive, setUserVoiceActiveState] = useState<boolean>(() => isUserVoiceActive());
  const [recordedLetterCount, setRecordedLetterCount] = useState<number>(0);
  const [recordedStoryCount, setRecordedStoryCount] = useState<number>(0);

  useEffect(() => {
    const keys = Array.from(getRecordedKeysSet());
    setRecordedLetterCount(keys.filter((k) => k.startsWith('letter_')).length);
    setRecordedStoryCount(keys.filter((k) => k.startsWith('story_')).length);
  }, []);

  const handleToggleUserVoice = (active: boolean) => {
    setUserVoiceActiveState(active);
    setUserVoiceActive(active);
    playPopSound();
    if (active) {
      playSound('تم تفعيل صوتك المسجل كلغة أصلية للبرنامج!');
    }
  };

  useEffect(() => {
    const list = getAvailableArabicVoices();
    setAvailableVoices(list);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setAvailableVoices(getAvailableArabicVoices());
      };
    }
  }, []);

  const handleVoiceChange = (vName: string) => {
    setSelectedVoice(vName);
    setSelectedVoiceName(vName);
    playPopSound();
    speakArabic('مرحباً بك يا بطل! أنا معلمتك وهذا هو صوتي.', soundEnabled, dialect);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير، يرجى اختيار صورة أصغر من 2 ميغابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setChildAvatar(base64String);
        localStorage.setItem('akram_child_avatar', base64String);
        playSuccessSound();
        playSound('تم تعيين صورة طفلك الشخصية بنجاح!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    setChildName(tempName.trim());
    localStorage.setItem('akram_child_name', tempName.trim());

    // Save PIN settings
    const validPin = tempPin.trim() || '1234';
    if (setParentPin) {
      setParentPin(validPin);
    }
    localStorage.setItem('akram_parent_pin', validPin);

    if (setParentPinEnabled) {
      setParentPinEnabled(isPinActive);
    }
    localStorage.setItem('akram_parent_pin_enabled', String(isPinActive));

    // Save 3D setting
    if (setEnable3D) {
      setEnable3D(is3DActive);
    }
    localStorage.setItem('akram_enable_3d', String(is3DActive));

    // Save Speech pitch and rate
    setSpeechPitch(pitchVal);
    setSpeechRate(rateVal);

    playSuccessSound();
    setSavedNotice(true);
    playSound(`تم حفظ كافة الإعدادات والتحكم بنجاح يا ${tempName}!`);

    setTimeout(() => {
      setSavedNotice(false);
      setScreen('home');
    }, 1200);
  };

  const handlePitchChange = (newPitch: number) => {
    setPitchVal(newPitch);
    setSpeechPitch(newPitch);
  };

  const handleRateChange = (newRate: number) => {
    setRateVal(newRate);
    setSpeechRate(newRate);
  };

  const handleResetSpeechSliders = () => {
    playPopSound();
    setPitchVal(1.22);
    setRateVal(0.92);
    setSpeechPitch(1.22);
    setSpeechRate(0.92);
  };

  const handleSelectAvatar = (av: string) => {
    playPopSound();
    setChildAvatar(av);
    localStorage.setItem('akram_child_avatar', av);
  };

  const handleToggleSound = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem('akram_sound', String(checked));
    if (checked) {
      playSuccessSound();
      speakArabic('تم تفعيل الأصوات والنطق', true);
    }
  };

  const handleTogglePhotoBg = (checked: boolean) => {
    playPopSound();
    if (setUsePhotoBg) {
      setUsePhotoBg(checked);
    }
    localStorage.setItem('akram_photo_bg', String(checked));
    if (checked) {
      playSound('تم تفعيل صورة الطفل كخلفية للتطبيق!');
    }
  };

  const handleResetData = () => {
    setStars(0);
    localStorage.setItem('akram_stars', '0');
    localStorage.removeItem('akram_mastered_letters');
    setShowResetConfirm(false);
    playPopSound();
    alert('تمت إعادة ضبط النجوم والتقدم بنجاح.');
  };

  const handleTestVoice = (sampleType: 'welcome' | 'cheer' | 'letter' = 'welcome') => {
    if (sampleType === 'cheer') {
      const phrase = dialect === 'yemeni' 
        ? 'يا عيني عليك يا حالي! إجابة مية مية وكفو والله!' 
        : 'ممتاز يا بطل! إجابة صحيحة ورائعة جداً!';
      speakArabic(phrase, soundEnabled, dialect);
      return;
    }
    if (sampleType === 'letter') {
      speakArabic('ألف، أسد', soundEnabled, dialect);
      return;
    }
    if (dialect === 'yemeni') {
      speakArabic(`يا حيا ومسهلا بك يا ${tempName}! أنا معلمتك في عالم أكرم، كفو عليك يا بطل!`, soundEnabled, 'yemeni');
    } else {
      speakArabic(`مرحباً بك يا ${tempName}! أنا معلمتك في عالم أكرم، هيا نتعلم معاً بصوت نقي وجميل.`, soundEnabled, 'fusha');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {/* Top Header */}
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

        <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-2xl border border-slate-200">
          ⚙️ إعدادات أولياء الأمور (كلمة السر 1234)
        </span>
      </div>

      {/* Main Settings Form */}
      <div className="w-full bg-white rounded-3xl p-6 border-4 border-slate-200 shadow-xl text-right space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Section 1: Child Name & Photo preview */}
          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-500" />
                اسم الطفل:
              </span>
              {/* Photo right next to name */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">صورة الطفل:</span>
                <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-400 flex items-center justify-center bg-blue-50">
                  {childAvatar && childAvatar.startsWith('data:image') ? (
                    <img src={childAvatar} alt={childName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{childAvatar || '👦'}</span>
                  )}
                </div>
              </div>
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="اكتب اسم الطفل..."
              required
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-hidden text-base font-bold bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Section 2: Avatar Picker & Photo Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-800">
              صورة الطفل الشخصية والخلفية:
            </label>

            {/* Current Avatar and Upload Action */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-full border-3 border-blue-500 overflow-hidden flex items-center justify-center bg-white shadow-sm shrink-0">
                {childAvatar && childAvatar.startsWith('data:image') ? (
                  <img src={childAvatar} alt="صورة الطفل" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{childAvatar || '👦'}</span>
                )}
              </div>

              <div className="flex-1 text-right space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>رفع صورة شخصية من الجهاز 📸</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  اختر صورة طفلك الحقيقية لتظهر بجانب اسمه وفي الخلفية!
                </p>

                {/* Photo Background Wallpaper Toggle */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <label htmlFor="photo-bg-toggle" className="text-xs font-black text-slate-700 cursor-pointer flex items-center gap-1.5">
                    <span>🖼️</span>
                    <span>وضع صورة الطفل كخلفية للتطبيق</span>
                  </label>
                  <input
                    id="photo-bg-toggle"
                    type="checkbox"
                    checked={usePhotoBg}
                    onChange={(e) => handleTogglePhotoBg(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quick Cartoon Avatars Grid */}
            <div className="grid grid-cols-7 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`h-11 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                    childAvatar === av
                      ? 'bg-blue-100 border-3 border-blue-500 scale-110 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Dialect Selection */}
          {setDialect && (
            <div>
              <label className="block text-sm font-black text-slate-800 mb-1.5">
                لهجة الصوت والتشجيع:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setDialect('fusha');
                    localStorage.setItem('akram_dialect', 'fusha');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                    dialect === 'fusha'
                      ? 'bg-rose-50 border-rose-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-slate-800">🌍 العربية الفصحى</span>
                    {dialect === 'fusha' && <span className="text-rose-500 font-bold text-xs">✓ مفعّلة</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    لغة عربية فصيحة ومثالية للتعليم المدرسي وتأسيس القراءة والكتابة.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setDialect('yemeni');
                    localStorage.setItem('akram_dialect', 'yemeni');
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                    dialect === 'yemeni'
                      ? 'bg-rose-50 border-rose-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-slate-800">🇾🇪 اللهجة اليمنية العامية</span>
                    {dialect === 'yemeni' && <span className="text-rose-500 font-bold text-xs">✓ مفعّلة</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    لهجة يمنية دافئة ومحبوبة للأطفال مع تشجيعات لطيفة (كفو، يا عيني عليك، يا فدوبك!).
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Audio Settings - Real Female Teacher Voice */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="sound-toggle" className="text-sm font-black text-slate-800 cursor-pointer flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-amber-500" />
                  صوت المعلمة الحقيقي والمؤثرات الصوتية
                </label>
                <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                  تم ضبط الناطق على نبرة أنثوية دافئة وطبيعية (صوت معلمة حقيقية) بدلاً من الصوت الآلي الروبوتي.
                </p>
              </div>
              <input
                id="sound-toggle"
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => handleToggleSound(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded-md cursor-pointer shrink-0 mr-2"
              />
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                🎧 استمع لعينات صوت المعلمة الأنثوي:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTestVoice('welcome')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>👩‍🏫</span>
                  <span>ترحيب المعلمة</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestVoice('cheer')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎉</span>
                  <span>عبارة تشجيعية</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestVoice('letter')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔤</span>
                  <span>نطق حرف وكلمة</span>
                </button>
              </div>

              {availableVoices.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    🎙️ اختيار صوت المعلمة المفضل على جهازك:
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-xl bg-white border border-amber-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="">✨ تلقائي (أفضل صوت أنثوي دافئ ومريح للأطفال)</option>
                    {availableVoices.map((v) => {
                      const isFemale = isLikelyFemaleVoice(v);
                      return (
                        <option key={v.name} value={v.name}>
                          {isFemale ? '👩‍🏫 صوت أنثوي: ' : '👤 '} {v.name} ({v.lang})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Fine-Tuning Voice Pitch and Speed Sliders */}
              <div className="bg-white/95 p-3.5 rounded-xl border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>التحكم الدقيق بنبرة وسرعة صوت المعلمة:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSpeechSliders}
                    className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    إعادة ضبط الصوت ↺
                  </button>
                </div>

                {/* Pitch Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>نبرة الصوت (Pitch):</span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {pitchVal > 1.3 ? 'طفولي ورفيع جداً' : pitchVal > 1.1 ? 'أنثوي دافئ ولطيف' : 'نبرة عميقة'} ({pitchVal.toFixed(2)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.6"
                    step="0.05"
                    value={pitchVal}
                    onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Rate Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>سرعة الإلقاء (Speed):</span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {rateVal < 0.85 ? 'هادئ وبطيء للتعلم' : rateVal <= 1.05 ? 'طبيعي ومثالي' : 'سريع'} ({rateVal.toFixed(2)}x)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={rateVal}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: User Voice Studio & Custom Recorded Speech */}
          <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  استوديو تسجيل صوتك (الحروف والقصص كلغة أصلية) 🎙️
                </h4>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  سجل صوتك أو صوت طفلك لنطق الحروف الهجائية ورواية القصص ليصبح لغة التطبيق الأصلية!
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs shrink-0">
                <input
                  type="checkbox"
                  checked={userVoiceActive}
                  onChange={(e) => handleToggleUserVoice(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-900">
                  {userVoiceActive ? 'مفعّل كلغة أصلية 🌟' : 'معطّل'}
                </span>
              </label>
            </div>

            <div className="bg-white/95 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                  🔤 الحروف المسجلة: <strong>{recordedLetterCount}/28</strong>
                </span>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                  📖 القصص المسجلة: <strong>{recordedStoryCount}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('voiceStudio');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>فتح استوديو تسجيل الأصوات 🎙️</span>
              </button>
            </div>
          </div>

          {/* Section 6: Security PIN & Parental Access Control */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  قفل أمان ولي الأمر والتحكم بالدخول
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  يمكنك تفعيل أو إلغاء قفل كلمة السر، وتغيير رمز PIN حسب رغبتك بالكامل.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                <input
                  type="checkbox"
                  checked={isPinActive}
                  onChange={(e) => setIsPinActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  {isPinActive ? 'القفل مفعّل 🔒' : 'القفل معطّل 🔓'}
                </span>
              </label>
            </div>

            {isPinActive && (
              <div className="bg-white/95 p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>تغيير رمز الأمان (PIN) الحالي:</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value)}
                  placeholder="1234"
                  className="w-28 text-center text-base font-black tracking-widest py-1.5 px-3 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-hidden bg-amber-50 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Section 7: 3D Spatial Visuals & 2026 Graphics Toggle */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-purple-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                المؤثرات ثلاثية الأبعاد (3D Spatial Graphics 2026)
              </h4>
              <p className="text-xs text-purple-800 font-medium">
                تشغيل أو إيقاف خلفية الفضاء ثلاثية الأبعاد التفاعلية والمجسمات العائمة.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-purple-300 shadow-2xs shrink-0">
              <input
                type="checkbox"
                checked={is3DActive}
                onChange={(e) => setIs3DActive(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-purple-900">
                {is3DActive ? '3D مفعّل ✨' : 'إيقاف 3D'}
              </span>
            </label>
          </div>

          {/* Section 8: Program Command Hub - Quick Navigation */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2.5">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>🚀</span>
              <span>لوحة التحكم والانتقال السريع لكافة أقسام البرنامج:</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('voiceStudio');
                }}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🎙️</span>
                <span>استوديو الأصوات</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('games');
                }}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🎮</span>
                <span>الألعاب (محاكي الصبار)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('quran');
                }}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🕌</span>
                <span>قصار السور</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('adab');
                }}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🤲</span>
                <span>الآداب والأدعية</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('games');
                }}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🎮</span>
                <span>الألعاب والألغاز</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('letters');
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🔤</span>
                <span>الحروف الهجائية</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('numbers');
                }}
                className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🔢</span>
                <span>الأرقام والعد</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('stories');
                }}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">📖</span>
                <span>القصص والحكايات</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setScreen('home');
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black transition-all active:scale-95 text-center flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🏠</span>
                <span>الرئيسية</span>
              </button>
            </div>
          </div>

          {/* Section 5: Online Content & Questions Management */}
          <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border-2 border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-sky-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600" />
                  تحديث وتنزيل الأسئلة والألعاب عبر الإنترنت
                </h4>
                <p className="text-xs text-sky-800 font-medium">
                  تنزيل حزم أسئلة أونلاين جديدة، أو إدخال رابط ويب مخصص
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowOnlineModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>إدارة التحديثات</span>
              </button>
            </div>
          </div>

          {/* Section 6: Complete App Bundle Download */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <DownloadCloud className="w-4 h-4 text-emerald-600" />
                  تنزيل حزمة التطبيق الكاملة (AkramWorld_App_Bundle.zip)
                </h4>
                <p className="text-xs text-emerald-800 font-medium">
                  حمل الحزمة الكاملة للتطبيق والأصوات مع إعدادات Android Studio و Capacitor
                </p>
              </div>

              <a
                href="/AkramWorld_App_Bundle.zip"
                download="AkramWorld_App_Bundle.zip"
                onClick={() => playPopSound()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>تحميل الحزمة 📥</span>
              </a>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-md shadow-emerald-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {savedNotice ? (
              <>
                <Check className="w-5 h-5" />
                تم الحفظ بنجاح!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                حفظ تعديلات الطفل
              </>
            )}
          </button>
        </form>

        {/* Section 4: Progress Danger Zone */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              رصيد النجوم الحالي: <strong className="text-amber-600">{stars} نجمة</strong>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(0, stars - 5);
                  setStars(next);
                  localStorage.setItem('akram_stars', String(next));
                  playPopSound();
                }}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 cursor-pointer"
              >
                -5 نجوم ➖
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = stars + 5;
                  setStars(next);
                  localStorage.setItem('akram_stars', String(next));
                  playSuccessSound();
                }}
                className="text-xs px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 cursor-pointer"
              >
                +5 نجوم 🎁
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = stars + 20;
                  setStars(next);
                  localStorage.setItem('akram_stars', String(next));
                  playSuccessSound();
                }}
                className="text-xs px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg border border-amber-300 cursor-pointer"
              >
                +20 نجمة ⭐
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة ضبط التقدم والنجوم للصفر
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-rose-300 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">هل أنت متأكد؟</h3>
            <p className="text-xs text-slate-600 font-medium mb-4">
              سيتم تصفير رصيد النجوم ({stars} نجمة) وإعادة التطبيق إلى البداية.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-colors"
              >
                نعم، تصفير الآن
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Sync & Question Editor Modal */}
      <OnlineSyncModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        playSound={playSound}
      />
    </div>
  );
};
