import React, { useState } from 'react';
import { playPopSound, playSuccessSound, speakArabic, triggerConfetti } from '../../utils/sound';
import { HeartHandshake, Volume2, Sparkles, Star, CheckCircle2, Shield, Moon, Sun, Utensils, Bath, Home, Shirt } from 'lucide-react';
import { Dialect } from '../../utils/phrases';

interface AdabAndDuasScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'settings') => void;
  playSound: (text: string) => void;
  addStars: (count: number) => void;
  dialect?: Dialect;
}

export interface DuaItem {
  id: string;
  category: string;
  title: string;
  duaText: string;
  whenToSay: string;
  etiquettes: string[];
  explanation: string;
  icon: string;
  bgGradient: string;
}

export const ADAB_AND_DUAS_DATA: DuaItem[] = [
  {
    id: 'food',
    category: 'آداب الطعام والشراب',
    title: 'دعاء وآداب الطعام والشراب 🍽️',
    duaText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n(وعند الانتهاء: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ)',
    whenToSay: 'قبل بدء الأكل وبعد الانتهاء منه مباشرة.',
    etiquettes: [
      'غسل اليدين جيداً بالماء والصابون قبل الطعام',
      'القول "بسم الله" والأكل باليد اليمنى فقط',
      'الأكل مما يلي الإنسان ولا ينفخ في الطعام الساخن',
      'حمد الله تعالى بعد الانتهاء من تناول الوجبة'
    ],
    explanation: 'نقول بسم الله لنبارك في طعامنا وطاقتنا، ونأكل باليمين اقتداءً بالنبي الكريم، ونشكر الله بعد الطعام حتى تزيد النعم وتدوم الصحة.',
    icon: '🍽️',
    bgGradient: 'from-amber-500 via-orange-500 to-yellow-500'
  },
  {
    id: 'bathroom',
    category: 'أذكار الدخول والخروج من الخلاء',
    title: 'دعاء دخول الحمام والخروج منه 🚿',
    duaText: 'عند الدخول: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ"\nعند الخروج: "غُفْرَانَكَ"',
    whenToSay: 'قبل دخول عتبة الحمام بتقديم القدم اليسرى، وعند الخروج بتقديم القدم اليمنى.',
    etiquettes: [
      'تقديم القدم اليسرى عند الدخول والقول: "اللهم إني أعوذ بك من الخبث والخبائث"',
      'عدم الحديث أو استخدام الهاتف داخل الحمام',
      'غسل اليدين جيداً بالماء والصابون بعد الانتهاء',
      'تقديم القدم اليمنى عند الخروج والقول: "غفرانك"'
    ],
    explanation: 'نستعيذ بالله عند دخول الخلاء ليحمينا وحفظنا، ونقول "غفرانك" عند الخروج شُكراً لله على التخلص من الأذى والراحة.',
    icon: '🚿',
    bgGradient: 'from-sky-500 via-blue-600 to-cyan-600'
  },
  {
    id: 'sleep',
    category: 'أذكار النوم الهادئ',
    title: 'دعاء وآداب النوم 🌙',
    duaText: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِاسْمِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    whenToSay: 'عند الاستلقاء على الفراش للتحضير للنوم.',
    etiquettes: [
      'الوضوء وغسل الأسنان بالفرشاة قبل النوم',
      'النوم على الشق الأيمن ووضع اليد تحت الخد الأيمن',
      'قراءة سورة الإخلاص والفلق والناس وآية الكرسي',
      'الاستغفار وذكر الله حتى يغلبنا النوم الهادئ'
    ],
    explanation: 'نذكر الله قبل النوم ليكون نومنا آكناً وهادئاً وتحفنا الملائكة بالحفظ والسلامة من الأحلام المزعجة.',
    icon: '🌙',
    bgGradient: 'from-indigo-600 via-purple-600 to-violet-700'
  },
  {
    id: 'wake',
    category: 'أذكار الاستيقاظ والصباح',
    title: 'دعاء الاستيقاظ من النوم ☀️',
    duaText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    whenToSay: 'فور الاستيقاظ وفتح العينين في الصباح.',
    etiquettes: [
      'مسح أثر النوم عن الوجه باليدين والابتسام',
      'حمد الله وشكره على نعمة الحياة واليوم الجديد',
      'ترتيب السرير والتوجه للوضوء وصلاة الفجر/الصباح'
    ],
    explanation: 'النوم يشبه الموت الصغير، وعندما نستيقظ بنشاط نشكر الله الذي وهبنا يوماً جديداً لنعمل فيه الخير والتعلم.',
    icon: '☀️',
    bgGradient: 'from-rose-500 via-amber-500 to-yellow-400'
  },
  {
    id: 'clothes',
    category: 'آداب الثياب والمظهر',
    title: 'دعاء ارتداء الثوب الجديد والملابس 👕',
    duaText: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    whenToSay: 'عند لبس الملابس الجديدة أو اليومية.',
    etiquettes: [
      'البدء بالكم الأيمن والجانب الأيمن عند ارتداء الثياب',
      'الحفاظ على نظافة الملابس وترتيبها في الخزانة',
      'حمد الله على نعمة الثياب والستر والجمال'
    ],
    explanation: 'الملابس نعمة من الله تستر أجسادنا وتحمينا من البرد والحر، ونشكره ليحفظ نعمته علينا.',
    icon: '👕',
    bgGradient: 'from-emerald-500 via-teal-600 to-cyan-600'
  },
  {
    id: 'home_leave',
    category: 'أذكار الخروج من المنزل',
    title: 'دعاء خروج ودخول المنزل 🏠',
    duaText: 'عند الخروج: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"\nعند الدخول: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا"',
    whenToSay: 'عند فتح باب المنزل للخروج أو الدخول.',
    etiquettes: [
      'القول عند الخروج: بسم الله توكلت على الله',
      'إلقاء السلام "السلام عليكم ورحمة الله وبركاته" عند الدخول',
      'الابتسامة لأفراد الأسرة عند العودة للمنزل'
    ],
    explanation: 'هذا الدعاء يحمي المسلم في طريقه وحركته خارج البيت ويجعل الملائكة تحفظه وترعاه حتى يعود سالماً.',
    icon: '🏠',
    bgGradient: 'from-purple-500 via-pink-500 to-rose-500'
  }
];

export const AdabAndDuasScreen: React.FC<AdabAndDuasScreenProps> = ({
  setScreen,
  playSound,
  addStars,
  dialect = 'fusha',
}) => {
  const [selectedDuaIndex, setSelectedDuaIndex] = useState(0);
  const [practicedDuas, setPracticedDuas] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akram_practiced_duas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dua = ADAB_AND_DUAS_DATA[selectedDuaIndex] || ADAB_AND_DUAS_DATA[0];

  const handlePlayDuaText = () => {
    playPopSound();
    speakArabic(`${dua.title}. ${dua.duaText}`, true, 'fusha');
  };

  const handlePlayExplanation = () => {
    playPopSound();
    speakArabic(`الشرح: ${dua.explanation}`, true, dialect);
  };

  const handleMarkPracticed = () => {
    if (!practicedDuas.includes(dua.id)) {
      const next = [...practicedDuas, dua.id];
      setPracticedDuas(next);
      try {
        localStorage.setItem('akram_practiced_duas', JSON.stringify(next));
      } catch {
        // Ignore
      }
      playSuccessSound();
      triggerConfetti();
      addStars(2);
      playSound(`أحسنت يا بطل! تعلمت وحفظت ${dua.title} وحصلت على نجمتين! ⭐⭐`);
    } else {
      playPopSound();
      playSound(`أنت بطل رائع تحفظ ${dua.title}!`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 pb-8">
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

        <span className="text-sm font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-2xl border border-amber-300 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-amber-600" />
          <span>آداب وأدعياء المسلم الصغير 🤲</span>
        </span>
      </div>

      {/* Selected Dua Display Card */}
      <div className="w-full bg-white rounded-3xl p-5 border-4 border-amber-300 shadow-xl space-y-4 text-right">
        {/* Banner */}
        <div className={`w-full bg-gradient-to-r ${dua.bgGradient} p-5 rounded-2xl text-white shadow-md relative overflow-hidden text-center`}>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-1">{dua.icon}</span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm">{dua.title}</h2>
            <span className="text-xs font-bold text-white/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs mt-1">
              {dua.category}
            </span>
          </div>
        </div>

        {/* Dua Content Box */}
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>نص الدعاء المبارك:</span>
            </span>

            <button
              onClick={handlePlayDuaText}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4" />
              <span>استمع للدعاء 🎧</span>
            </button>
          </div>

          <p className="text-lg sm:text-xl font-black text-slate-900 font-serif leading-relaxed text-center bg-white p-4 rounded-xl border border-amber-200 shadow-xs whitespace-pre-line">
            {dua.duaText}
          </p>

          <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
            <span>⏱️ <strong>متى نقوله؟</strong></span>
            <span>{dua.whenToSay}</span>
          </div>
        </div>

        {/* Etiquettes Checklist */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-2">
          <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>آداب وحسن التصرف السلوكي:</span>
          </h4>

          <div className="space-y-2">
            {dua.etiquettes.map((et, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">{et}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Explanation Box */}
        <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border-2 border-sky-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-xs sm:text-sm text-sky-950 flex items-center gap-1.5">
              <span>💡</span>
              <span>لماذا نقول هذا الدعاء؟ (الشرح والبركة):</span>
            </h4>

            <button
              onClick={handlePlayExplanation}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>الشرح الصوتي</span>
            </button>
          </div>

          <p className="text-xs font-bold text-slate-800 leading-relaxed bg-white/90 p-3 rounded-xl border border-sky-100">
            {dua.explanation}
          </p>
        </div>

        {/* Practice & Reward Action Button */}
        <button
          onClick={handleMarkPracticed}
          className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            practicedDuas.includes(dua.id)
              ? 'bg-amber-400 text-amber-950 hover:bg-amber-500'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {practicedDuas.includes(dua.id) ? (
            <>
              <Star className="w-5 h-5 fill-amber-950" />
              <span>ممتاز! حفظت هذا الدعاء والممارسة ⭐</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>قرأت وحفظت هذا الدعاء (+2 نجوم) ⭐⭐</span>
            </>
          )}
        </button>
      </div>

      {/* Duas & Adab List Carousel */}
      <div className="w-full bg-white rounded-3xl p-5 border-4 border-amber-300 shadow-lg text-right">
        <h3 className="font-black text-base text-slate-800 mb-3 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-amber-600" />
          <span>فهرس أذكار وآداب الطفل اليومية ({ADAB_AND_DUAS_DATA.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ADAB_AND_DUAS_DATA.map((d, idx) => {
            const isSelected = idx === selectedDuaIndex;
            const isDone = practicedDuas.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => {
                  playPopSound();
                  setSelectedDuaIndex(idx);
                }}
                className={`p-3 rounded-2xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none">{d.icon}</span>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-800">{d.category}</h4>
                    <span className="text-[10px] font-bold text-slate-500">دعاء وآداب سلوكية</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isDone && <span className="text-amber-500 text-xs">⭐</span>}
                  {isSelected && <span className="text-amber-600 font-bold text-xs">◀</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
