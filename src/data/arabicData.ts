export interface ArabicLetter {
  id: number;
  letter: string;
  name: string; // e.g. ألف
  word: string; // e.g. أسد
  emoji: string; // e.g. 🦁
  secondaryWord?: string; // e.g. أرنب 🐰
  phoneticHint: string; // e.g. أَ - أَسَد
  color: string; // bg color style
  border: string;
}

export const ARABIC_LETTERS: ArabicLetter[] = [
  { id: 1, letter: 'أ', name: 'ألف', word: 'أسد', emoji: '🦁', secondaryWord: 'أرنب 🐰', phoneticHint: 'أَ - أَسَد', color: '#FFF0F0', border: '#FF6B6B' },
  { id: 2, letter: 'ب', name: 'باء', word: 'بطة', emoji: '🦆', secondaryWord: 'برتقال 🍊', phoneticHint: 'بَ - بَطَّة', color: '#EFF6FF', border: '#3B82F6' },
  { id: 3, letter: 'ت', name: 'تاء', word: 'تفاحة', emoji: '🍎', secondaryWord: 'تمساح 🐊', phoneticHint: 'تَ - تُفَّاحَة', color: '#ECFDF5', border: '#10B981' },
  { id: 4, letter: 'ث', name: 'ثاء', word: 'ثعلب', emoji: '🦊', secondaryWord: 'ثعبان 🐍', phoneticHint: 'ثَ - ثَعْلَب', color: '#FFFBEB', border: '#F59E0B' },
  { id: 5, letter: 'ج', name: 'جيم', word: 'جمل', emoji: '🐪', secondaryWord: 'جزر 🥕', phoneticHint: 'جَ - جَمَل', color: '#FDF4FF', border: '#D946EF' },
  { id: 6, letter: 'ح', name: 'حاء', word: 'حصان', emoji: '🐎', secondaryWord: 'حوت 🐋', phoneticHint: 'حَ - حِصَان', color: '#F0FDFA', border: '#14B8A6' },
  { id: 7, letter: 'خ', name: 'خاء', word: 'خروف', emoji: '🐑', secondaryWord: 'خبز 🥖', phoneticHint: 'خَ - خَرُوف', color: '#FEF2F2', border: '#EF4444' },
  { id: 8, letter: 'د', name: 'دال', word: 'دراجة', emoji: '🚲', secondaryWord: 'دب 🐻', phoneticHint: 'دَ - دَرَّاجَة', color: '#F5F3FF', border: '#8B5CF6' },
  { id: 9, letter: 'ذ', name: 'ذال', word: 'ذئب', emoji: '🐺', secondaryWord: 'ذرة 🌽', phoneticHint: 'ذَ - ذِئْب', color: '#FFF7ED', border: '#F97316' },
  { id: 10, letter: 'ر', name: 'راء', word: 'رمان', emoji: '🍇', secondaryWord: 'ريشة 🪶', phoneticHint: 'رَ - رُمَّان', color: '#FFF1F2', border: '#F43F5E' },
  { id: 11, letter: 'ز', name: 'زاي', word: 'زرافة', emoji: '🦒', secondaryWord: 'زهرة 🌸', phoneticHint: 'زَ - زَرَافَة', color: '#FEFCE8', border: '#EAB308' },
  { id: 12, letter: 'س', name: 'سين', word: 'سمكة', emoji: '🐟', secondaryWord: 'سيارة 🚗', phoneticHint: 'سَ - سَمَكَة', color: '#F0F9FF', border: '#0284C7' },
  { id: 13, letter: 'ش', name: 'شين', word: 'شمس', emoji: '☀️', secondaryWord: 'شجرة 🌳', phoneticHint: 'شَ - شَمْس', color: '#FFFBEB', border: '#D97706' },
  { id: 14, letter: 'ص', name: 'صاد', word: 'صقر', emoji: '🦅', secondaryWord: 'صاروخ 🚀', phoneticHint: 'صَ - صَقْر', color: '#F8FAFC', border: '#64748B' },
  { id: 15, letter: 'ض', name: 'ضاد', word: 'ضفدع', emoji: '🐸', secondaryWord: 'ضوء 💡', phoneticHint: 'ضَ - ضِفْدَع', color: '#F0FDF4', border: '#16A34A' },
  { id: 16, letter: 'ط', name: 'طاء', word: 'طائرة', emoji: '✈️', secondaryWord: 'طاووس 🦚', phoneticHint: 'طَ - طَائِرَة', color: '#EEF2FF', border: '#6366F1' },
  { id: 17, letter: 'ظ', name: 'ظاء', word: 'ظرف', emoji: '✉️', secondaryWord: 'ظبي 🦌', phoneticHint: 'ظَ - ظَرْف', color: '#FAF5FF', border: '#A855F7' },
  { id: 18, letter: 'ع', name: 'عين', word: 'عصفور', emoji: '🐦', secondaryWord: 'عسل 🍯', phoneticHint: 'عَ - عُصْفُور', color: '#ECFEFF', border: '#06B6D4' },
  { id: 19, letter: 'غ', name: 'غين', word: 'غزال', emoji: '🦌', secondaryWord: 'غيوم ☁️', phoneticHint: 'غَ - غَزَال', color: '#FDF2F8', border: '#EC4899' },
  { id: 20, letter: 'ف', name: 'فاء', word: 'فراشة', emoji: '🦋', secondaryWord: 'فيل 🐘', phoneticHint: 'فَ - فَرَاشَة', color: '#FEF3C7', border: '#F59E0B' },
  { id: 21, letter: 'ق', name: 'قاف', word: 'قرد', emoji: '🐵', secondaryWord: 'قمر 🌙', phoneticHint: 'قَ - قِرْد', color: '#EFF6FF', border: '#2563EB' },
  { id: 22, letter: 'ك', name: 'كاف', word: 'كتاب', emoji: '📖', secondaryWord: 'كرة ⚽', phoneticHint: 'كَ - كِتَاب', color: '#F0FDF4', border: '#22C55E' },
  { id: 23, letter: 'ل', name: 'لام', word: 'ليمون', emoji: '🍋', secondaryWord: 'لعبة 🧸', phoneticHint: 'لَ - لَيْمُون', color: '#FEFCE8', border: '#CA8A04' },
  { id: 24, letter: 'م', name: 'ميم', word: 'موز', emoji: '🍌', secondaryWord: 'مفتاح 🔑', phoneticHint: 'مَ - مَوْز', color: '#FFF7ED', border: '#EA580C' },
  { id: 25, letter: 'ن', name: 'نون', word: 'نحلة', emoji: '🐝', secondaryWord: 'نجمة ⭐', phoneticHint: 'نَ - نَحْلَة', color: '#FDF4FF', border: '#C026D3' },
  { id: 26, letter: 'هـ', name: 'هاء', word: 'هدهد', emoji: '🦜', secondaryWord: 'هدية 🎁', phoneticHint: 'هَ - هُدْهُد', color: '#F1F5F9', border: '#475569' },
  { id: 27, letter: 'و', name: 'واو', word: 'وردة', emoji: '🌹', secondaryWord: 'وسادة 🛋️', phoneticHint: 'وَ - وَرْدَة', color: '#FFF1F2', border: '#E11D48' },
  { id: 28, letter: 'ي', name: 'ياء', word: 'يد', emoji: '🖐️', secondaryWord: 'يمامة 🕊️', phoneticHint: 'يَ - يَد', color: '#ECFEFF', border: '#0891B2' },
];

export interface ArabicNumber {
  num: number;
  word: string;
  emoji: string;
  label: string;
  color: string;
}

export const ARABIC_NUMBERS: ArabicNumber[] = [
  { num: 1, word: 'واحد', emoji: '🦁', label: 'أسد واحد', color: '#FF6B6B' },
  { num: 2, word: 'اثنان', emoji: '🦆', label: 'بطتان', color: '#4D96FF' },
  { num: 3, word: 'ثلاثة', emoji: '🍎', label: 'تفاحات', color: '#6BCB77' },
  { num: 4, word: 'أربعة', emoji: '🚗', label: 'سيارات', color: '#FFD93D' },
  { num: 5, word: 'خمسة', emoji: '⭐', label: 'نجوم', color: '#FF9F43' },
  { num: 6, word: 'ستة', emoji: '🎈', label: 'بالونات', color: '#54A0FF' },
  { num: 7, word: 'سبعة', emoji: '🐱', label: 'قطط', color: '#5F27CD' },
  { num: 8, word: 'ثمانية', emoji: '🍓', label: 'فراولات', color: '#FF6B6B' },
  { num: 9, word: 'تسعة', emoji: '🐟', label: 'أسماك', color: '#00D2D3' },
  { num: 10, word: 'عشرة', emoji: '🌸', label: 'زهور', color: '#10AC84' },
  { num: 11, word: 'أحد عشر', emoji: '🐥', label: 'كتاكيت', color: '#F368E0' },
  { num: 12, word: 'اثنا عشر', emoji: '⚽', label: 'كرات', color: '#2E86DE' },
  { num: 13, word: 'ثلاثة عشر', emoji: '🍬', label: 'حلوى', color: '#EE5253' },
  { num: 14, word: 'أربعة عشر', emoji: '🦋', label: 'فراشات', color: '#1DD1A1' },
  { num: 15, word: 'خمسة عشر', emoji: '🍌', label: 'موزات', color: '#FF9F43' },
  { num: 16, word: 'ستة عشر', emoji: '🚀', label: 'صواريخ', color: '#341F97' },
  { num: 17, word: 'سبعة عشر', emoji: '🦚', label: 'طواويس', color: '#01A3A4' },
  { num: 18, word: 'ثمانية عشر', emoji: '🎨', label: 'لوحات ألوان', color: '#FF6B6B' },
  { num: 19, word: 'تسعة عشر', emoji: '🍉', label: 'قطع بطيخ', color: '#10AC84' },
  { num: 20, word: 'عشرون', emoji: '🏆', label: 'كؤوس فوز', color: '#FFD93D' },
];

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredStars: number;
  category: 'learning' | 'games' | 'mastery';
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  { id: 'first_step', title: 'البداية السعيدة', description: 'احصل على أول 3 نجوم', icon: '🌟', requiredStars: 3, category: 'learning' },
  { id: 'star_collector', title: 'جامع النجوم', description: 'اجمع 15 نجمة متألقة', icon: '⭐', requiredStars: 15, category: 'learning' },
  { id: 'letter_lover', title: 'مستكشف الحروف', description: 'اجمع 30 نجمة في الحروف', icon: '📚', requiredStars: 30, category: 'learning' },
  { id: 'story_reader', title: 'قارئ القصص البارع', description: 'استمع إلى حكايات عالم أكرم', icon: '📖', requiredStars: 40, category: 'learning' },
  { id: 'number_hero', title: 'بطل الأرقام والعد', description: 'اجمع 50 نجمة متألقة', icon: '🔢', requiredStars: 50, category: 'mastery' },
  { id: 'game_master', title: 'عالم الألعاب الذكي', description: 'اجمع 75 نجمة من الألعاب', icon: '🎮', requiredStars: 75, category: 'games' },
  { id: 'akram_champion', title: 'بطل عالم أكرم الخارق', description: 'اجمع 100 نجمة واستلم شهادة التميز', icon: '👑', requiredStars: 100, category: 'mastery' },
];

export interface ChildrenStory {
  id: string;
  title: string;
  text: string;
  emoji: string;
  category: string;
  moral: string;
}

export const STORIES_DATA: ChildrenStory[] = [
  {
    id: 'lion-duck',
    title: 'الأسد الصغير والبطة',
    text: 'كان يا ما كان، في الغابة الجميلة، عاش أسد صغير لطيف. التقى ببطة صفراء تسبح في النهر، وقررا أن يكونا صديقين رائعين ويلعبا معاً كل يوم.',
    emoji: '🦁🦆',
    category: 'الصداقة واللطف',
    moral: 'الصداقة الجميلة تجعل قلوبنا سعيدة وتجمعنا معاً بالمحبة.',
  },
  {
    id: 'busy-bee',
    title: 'النحلة النشيطة',
    text: 'طارت النحلة الذكية من زهرة إلى زهرة لتجمع العسل الطيب. قالت النحلة لأكرم: العمل الجميل يصنع حياة سعيدة ومفيدة للجميع!',
    emoji: '🐝🌸',
    category: 'النشاط والعمل',
    moral: 'النشاط والاجتهاد يصنعان أطيب الثمار وأحلى الإنجازات.',
  },
  {
    id: 'turtle-rabbit',
    title: 'السلحفاة الحكيمة والأرنب',
    text: 'في صباح مشرق، تسابق الأرنب السريع مع السلحفاة الصبورة. نام الأرنب تحت الشجرة معتقداً أنه سيفوز، بينما واصلت السلحفاة خطواتها بهدوء حتى وصلت لخط النهاية وفازت!',
    emoji: '🐢🐰',
    category: 'الصبر والمثابرة',
    moral: 'الاستمرار والهدوء والصبر يحققون الفوز دائماً.',
  },
  {
    id: 'singing-bird',
    title: 'العصفور المغرد والشجرة',
    text: 'استيقظ عصفور ملون فوق غصن شجرة خضراء وأخذ يغرد بأعذب الألحان. شكرت الشجرة العصفور على صوته الجميل، وقدمت له ظلاً بارداً وأوراقاً تحميه من الشمس.',
    emoji: '🐦🌳',
    category: 'التعاون والشكر',
    moral: 'تبادل الخير والمعروف ينشر الفرح في كل مكان.',
  },
  {
    id: 'kind-elephant',
    title: 'الفيل الطيب ومساعدة الأصدقاء',
    text: 'وجد الفيل الصغير غزالاً لطيفاً يبحث عن ماء عذب. ساعده الفيل بخرطومه القوي وملأ البركة بالماء الصافي، ففرح الغزال وشكره بحرارة.',
    emoji: '🐘🦌',
    category: 'مساعدة الآخرين',
    moral: 'مساعدة الصديق في وقت الحاجة هي أجمل صفات الأبطال.',
  },
];

export interface WordMatchItem {
  id: string;
  emoji: string;
  word: string;
  distractors: string[];
}

export const WORD_MATCH_ITEMS: WordMatchItem[] = [
  { id: '1', emoji: '🍎', word: 'تفاحة', distractors: ['قرد', 'سيارة', 'شمس'] },
  { id: '2', emoji: '🦁', word: 'أسد', distractors: ['بطة', 'فيل', 'نحلة'] },
  { id: '3', emoji: '🦆', word: 'بطة', distractors: ['سمكة', 'حصان', 'أسد'] },
  { id: '4', emoji: '🚗', word: 'سيارة', distractors: ['طائرة', 'قطار', 'دراجة'] },
  { id: '5', emoji: '🍌', word: 'موز', distractors: ['ليمون', 'تفاحة', 'رمان'] },
  { id: '6', emoji: '🐱', word: 'قطة', distractors: ['كلب', 'فأر', 'أرنب'] },
  { id: '7', emoji: '✈️', word: 'طائرة', distractors: ['صاروخ', 'سيارة', 'سفينة'] },
  { id: '8', emoji: '🐝', word: 'نحلة', distractors: ['فراشة', 'عصفور', 'ذبابة'] },
  { id: '9', emoji: '🐟', word: 'سمكة', distractors: ['حوت', 'ضفدع', 'سلحفاة'] },
  { id: '10', emoji: '📖', word: 'كتاب', distractors: ['قلم', 'حقيبة', 'مسطرة'] },
];

// تحويل الأرقام إلى الأرقام العربية المشرقية (٠، ١، ٢، ٣، ٤...)
export const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠'];

export const toArabicNum = (n: number | string): string => {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (!isNaN(num) && num >= 0 && num < arabicNumerals.length) {
    return arabicNumerals[num];
  }
  return String(n).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d, 10)] || d);
};

