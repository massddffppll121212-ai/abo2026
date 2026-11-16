import { STORIES_DATA, ChildrenStory, WORD_MATCH_ITEMS, WordMatchItem } from '../data/arabicData';

export interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  emoji?: string;
  explanation?: string;
}

export interface OnlineContentPack {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  itemCount: number;
  storiesCount?: number;
  questionsCount?: number;
  wordMatchCount?: number;
  data: {
    questions?: CustomQuestion[];
    stories?: ChildrenStory[];
    wordMatches?: WordMatchItem[];
  };
}

// Initial Default Questions for the interactive Quiz Game
export const DEFAULT_QUIZ_QUESTIONS: CustomQuestion[] = [
  {
    id: 'q1',
    question: 'ما هو الحيوان الذي يُلقّب بملك الغابة؟',
    options: ['الأسد', 'الفيل', 'الزرافة'],
    correctIndex: 0,
    category: 'عالم الحيوان',
    emoji: '🦁',
    explanation: 'الأسد هو ملك الغابة لقوته وشجاعته وجمال عرفه!',
  },
  {
    id: 'q2',
    question: 'أي من هذه الفواكه لونها أصفر وتفضّلها القردة؟',
    options: ['الفراولة', 'الموز', 'العنب'],
    correctIndex: 1,
    category: 'الفواكه والأطعمة',
    emoji: '🍌',
    explanation: 'الموز فاكهة لذيذة ومفيدة وغنية بالطاقة يحبها الصغار والقردة!',
  },
  {
    id: 'q3',
    question: 'ما هو الطائر الذي يُعتبر رمزاً للسلام؟',
    options: ['الغراب', 'الحمامة', 'الصقر'],
    correctIndex: 1,
    category: 'الطيور والطبيعة',
    emoji: '🕊️',
    explanation: 'الحمامة البيضاء الجميلة هي رمز المحبة والسلام.',
  },
  {
    id: 'q4',
    question: 'كم عدد الصلوات المفروضة في اليوم والليلة؟',
    options: ['٣ صلوات', '٥ صلوات', '٧ صلوات'],
    correctIndex: 1,
    category: 'القيم والأخلاق',
    emoji: '🕌',
    explanation: 'خمس صلوات مباركة: الفجر، والظهر، والعصر، والمغرب، والعشاء.',
  },
  {
    id: 'q5',
    question: 'ما هو الكوكب الذي نعيش عليه؟',
    options: ['المريخ', 'الأرض', 'المشتري'],
    correctIndex: 1,
    category: 'العلوم والفضاء',
    emoji: '🌍',
    explanation: 'كوكب الأرض الجميل هو بيتنا الدافئ الذي خلقه الله لنا.',
  },
  {
    id: 'q6',
    question: 'أي من الكائنات التالية يعيش داخل الماء ويتنفس بالخياشيم؟',
    options: ['السمكة', 'الأرنب', 'الحصان'],
    correctIndex: 0,
    category: 'الكائنات البحرية',
    emoji: '🐟',
    explanation: 'الأسماك تعيش وتسبح في الماء بخفة ورشاقة!',
  },
];

// Rich Online Content Packs ready for instantaneous download via Internet
export const ONLINE_PACKS: OnlineContentPack[] = [
  {
    id: 'pack-smart-kids',
    title: 'حزمة عباقرة المعرفة والذكاء 🧠',
    description: 'أسئلة تفاعلية رائعة في العلوم، البيئة، الفضاء، والحيوانات لاختبار ذكاء الطفل.',
    icon: '🚀',
    category: 'ذكاء ومعلومات',
    itemCount: 6,
    questionsCount: 4,
    storiesCount: 2,
    data: {
      questions: [
        {
          id: 'net-q1',
          question: 'ما هو أسرع حيوان بري على وجه الأرض؟',
          options: ['الفهد', 'السلحفاة', 'الدب'],
          correctIndex: 0,
          category: 'حيوانات',
          emoji: '🐆',
          explanation: 'الفهد سريع جداً ويستطيع الركض بسرعة فائقة!',
        },
        {
          id: 'net-q2',
          question: 'ما الذي ينير لنا السماء في النهار ويمدنا بالدفء؟',
          options: ['القمر', 'الشمس', 'النجوم'],
          correctIndex: 1,
          category: 'الطبيعة',
          emoji: '☀️',
          explanation: 'الشمس المشرقة تمد الأرض بالنور والدفء لنمو النباتات.',
        },
        {
          id: 'net-q3',
          question: 'ما هو الشيء الذي يحمي رؤوسنا أثناء ركوب الدراجة؟',
          options: ['الخوذة', 'النظارة', 'الساعة'],
          correctIndex: 0,
          category: 'السلامة والصحة',
          emoji: '⛑️',
          explanation: 'الخوذة تحمي الرأس وتضمن سلامة البطل أثناء قيادة الدراجة.',
        },
        {
          id: 'net-q4',
          question: 'من الذي يصنع العسل اللذيذ من رحيق الأزهار؟',
          options: ['النملة', 'النحلة', 'الفراشة'],
          correctIndex: 1,
          category: 'حشرات نافعة',
          emoji: '🐝',
          explanation: 'النحلة النشيطة تجمع الرحيق وتصنع منه عسلاً فيه شفاء للناس.',
        },
      ],
      stories: [
        {
          id: 'net-story-space',
          title: 'رحلة أكرم إلى كوكب الألوان',
          text: 'صعد أكرم في صاروخ فضائي لطيف. وصل إلى كوكب تبتسم فيه الأزهار وتغني السحب. قال الكوكب لأكرم: بالتعلم والقراءة تستطيع أن تصل إلى أبعد النجوم وتحقق أعظم الأحلام!',
          emoji: '🚀🌈',
          category: 'الخيال والهمة',
          moral: 'القراءة والتعلم يفتحان لنا أبواب الكون والعالم الجميل.',
        },
      ],
    },
  },
  {
    id: 'pack-morals-wisdom',
    title: 'حزمة الحكايات والأخلاق الفاضلة 🕌',
    description: 'قصص دافئة وأسئلة عن بر الوالدين، الصدق، الأمانة ومساعدة المحتاجين.',
    icon: '❤️',
    category: 'أخلاق وقيم',
    itemCount: 5,
    questionsCount: 3,
    storiesCount: 2,
    data: {
      questions: [
        {
          id: 'net-m1',
          question: 'إذا وجدنا شيئاً ضائعاً ليس ملكنا، فماذا نفعل؟',
          options: ['نأخذه لأنفسنا', 'نعيده لصاحبه بأمانة', 'نخبئه'],
          correctIndex: 1,
          category: 'الأمانة',
          emoji: '💎',
          explanation: 'الأمانة صفة الأبطال والأتقياء، وإعادة الشيء لصاحبه خلق نبيل.',
        },
        {
          id: 'net-m2',
          question: 'كيف نتصرف عندما ينادينا الوالدان؟',
          options: ['نتجاهلهم', 'نجيبهم بابتسامة وأدب', 'نغضب'],
          correctIndex: 1,
          category: 'بر الوالدين',
          emoji: '👨‍👩‍👦',
          explanation: 'بر الوالدين وسماع كلامهما يجلبان رضا الله وبركة الحياة.',
        },
        {
          id: 'net-m3',
          question: 'ما هي الكلمة الطيبة التي نقولها عندما يقدم لنا أحد مساعدة؟',
          options: ['شكراً جزيلاً', 'لا شيء', 'ارحل'],
          correctIndex: 0,
          category: 'الآداب الاجتماعية',
          emoji: '🌸',
          explanation: 'شكر الناس من شكر الله ويديم المودة والمحبة بين الجميع.',
        },
      ],
      stories: [
        {
          id: 'net-story-bird-nest',
          title: 'عش العصفور والولد الرحيم',
          text: 'رأى الولد الرحيم فرخ عصفور صغيراً سقط من عشه في يوم عاصف. حمله برفق ورفعه إلى حضن أمه في العش بأمان. شكرته العصافير بتغريد جميل وأحس بفرح كبير في قلبه.',
          emoji: '🐦🌿',
          category: 'الرحمة بالحيوان',
          moral: 'الرحمة بجميع المخلوقات تملأ الحياة خيراً ورحمة وسعادة.',
        },
        {
          id: 'net-story-honesty',
          title: 'درهم الأمانة الفضي',
          text: 'اشترى الصبي تفاحاً من السوق، فأعاد له البائع درهماً إضافياً بالخطأ. عاد الصبي فوراً وأرجع الدرهم للبائع. فرح البائع وقال له: أنت بطل حقيقي، والأمانة أعظم كنز في الدنيا!',
          emoji: '🪙🍎',
          category: 'الأمانة والصدق',
          moral: 'الصدق والأمانة يرفعان من شأن الإنسان ويجعلانه محبوباً عند الجميع.',
        },
      ],
    },
  },
  {
    id: 'pack-animals-nature',
    title: 'حزمة مخلوقات الأرض والبحار 🐬',
    description: 'ألعاب مطابقة صور جديدة وأسئلة ممتعة عن أسرار الحيوانات والبحار.',
    icon: '🐠',
    category: 'طبيعة وحيوانات',
    itemCount: 6,
    questionsCount: 3,
    data: {
      wordMatches: [
        { id: 'wm-net1', emoji: '🐬', word: 'دلفين', distractors: ['فيل', 'نمر', 'دب'] },
        { id: 'wm-net2', emoji: '🦒', word: 'زرافة', distractors: ['قرد', 'أسد', 'أرنب'] },
        { id: 'wm-net3', emoji: '🦚', word: 'طاووس', distractors: ['غراب', 'عصفور', 'حمامة'] },
      ],
      questions: [
        {
          id: 'net-a1',
          question: 'من هو أضخم حيوان يعيش في المحيطات؟',
          options: ['الحوت الأزرق', 'القرش', 'الدلفين'],
          correctIndex: 0,
          category: 'عالم البحار',
          emoji: '🐋',
          explanation: 'الحوت الأزرق هو أضخم مخلوق على كوكبنا وزنه يعادل عشرات الأفيال!',
        },
        {
          id: 'net-a2',
          question: 'أي طائر يمتلك رقبة وساقين طويلتين وريشاً أبيض جميلاً؟',
          options: ['اللقلق', 'الدجاجة', 'البومة'],
          correctIndex: 0,
          category: 'طيور',
          emoji: '🦩',
          explanation: 'اللقلق يهاجر مسافات طويلة في السماء الصافية.',
        },
      ],
    },
  },
];

// Local Storage helpers
const STORAGE_KEYS = {
  stories: 'akram_user_stories',
  quizQuestions: 'akram_quiz_questions',
  wordMatches: 'akram_word_matches',
  lastSync: 'akram_online_last_sync',
  installedPacks: 'akram_installed_packs',
};

// 1. Stories management
export function getUserStories(): ChildrenStory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stories);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load user stories:', err);
  }
  return STORIES_DATA;
}

export function saveUserStories(stories: ChildrenStory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
  } catch (err) {
    console.error('Failed to save user stories:', err);
  }
}

export function addUserStory(story: ChildrenStory): void {
  const current = getUserStories();
  const next = [story, ...current];
  saveUserStories(next);
}

export function updateUserStory(id: string, updated: Partial<ChildrenStory>): void {
  const current = getUserStories();
  const next = current.map((s) => (s.id === id ? { ...s, ...updated } : s));
  saveUserStories(next);
}

export function deleteUserStory(id: string): void {
  const current = getUserStories();
  const next = current.filter((s) => s.id !== id);
  saveUserStories(next.length > 0 ? next : STORIES_DATA);
}

export function resetDefaultStories(): void {
  saveUserStories(STORIES_DATA);
}

// 2. Quiz Questions management
export function getQuizQuestions(): CustomQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.quizQuestions);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load quiz questions:', err);
  }
  return DEFAULT_QUIZ_QUESTIONS;
}

export function saveQuizQuestions(questions: CustomQuestion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.quizQuestions, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save quiz questions:', err);
  }
}

export function addQuizQuestion(question: CustomQuestion): void {
  const current = getQuizQuestions();
  const next = [question, ...current];
  saveQuizQuestions(next);
}

export function deleteQuizQuestion(id: string): void {
  const current = getQuizQuestions();
  const next = current.filter((q) => q.id !== id);
  saveQuizQuestions(next.length > 0 ? next : DEFAULT_QUIZ_QUESTIONS);
}

export function resetDefaultQuizQuestions(): void {
  saveQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
}

// 3. Word Matches management
export function getWordMatchItems(): WordMatchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.wordMatches);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load word matches:', err);
  }
  return WORD_MATCH_ITEMS;
}

export function saveWordMatchItems(items: WordMatchItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.wordMatches, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save word matches:', err);
  }
}

// 4. Online Synchronization & Pack installation
export function getInstalledPacks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.installedPacks);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.lastSync);
  } catch {
    return null;
  }
}

// Install an Online Pack directly into the app
export async function installOnlinePack(packId: string): Promise<{ success: boolean; message: string; addedQuestions: number; addedStories: number }> {
  // Simulate network latency for genuine online feedback
  await new Promise((resolve) => setTimeout(resolve, 800));

  const pack = ONLINE_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return { success: false, message: 'الحزمة غير موجودة', addedQuestions: 0, addedStories: 0 };
  }

  let addedQuestions = 0;
  let addedStories = 0;

  // Add questions
  if (pack.data.questions && pack.data.questions.length > 0) {
    const currentQ = getQuizQuestions();
    const newQ = [...pack.data.questions.filter((q) => !currentQ.some((cq) => cq.id === q.id)), ...currentQ];
    saveQuizQuestions(newQ);
    addedQuestions = pack.data.questions.length;
  }

  // Add stories
  if (pack.data.stories && pack.data.stories.length > 0) {
    const currentS = getUserStories();
    const newS = [...pack.data.stories.filter((s) => !currentS.some((cs) => cs.id === s.id)), ...currentS];
    saveUserStories(newS);
    addedStories = pack.data.stories.length;
  }

  // Add word matches if any
  if (pack.data.wordMatches && pack.data.wordMatches.length > 0) {
    const currentW = getWordMatchItems();
    const newW = [...pack.data.wordMatches.filter((w) => !currentW.some((cw) => cw.id === w.id)), ...currentW];
    saveWordMatchItems(newW);
  }

  // Record installed pack
  const installed = getInstalledPacks();
  if (!installed.includes(packId)) {
    installed.push(packId);
    try {
      localStorage.setItem(STORAGE_KEYS.installedPacks, JSON.stringify(installed));
      localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toLocaleDateString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' } as any));
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    message: `تم تثبيت ${pack.title} وتحديث الأسئلة والقصص بنجاح!`,
    addedQuestions,
    addedStories,
  };
}

// Import custom JSON package from any external online web URL
export async function importFromWebUrl(url: string): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`تعذر جلب البيانات من الرابط (رمز الخطأ ${res.status})`);
    }
    const json = await res.json();

    let count = 0;
    if (Array.isArray(json.questions)) {
      const currentQ = getQuizQuestions();
      saveQuizQuestions([...json.questions, ...currentQ]);
      count += json.questions.length;
    }
    if (Array.isArray(json.stories)) {
      const currentS = getUserStories();
      saveUserStories([...json.stories, ...currentS]);
      count += json.stories.length;
    }
    if (Array.isArray(json.wordMatches)) {
      const currentW = getWordMatchItems();
      saveWordMatchItems([...json.wordMatches, ...currentW]);
      count += json.wordMatches.length;
    }

    if (count === 0 && Array.isArray(json)) {
      // Check if top-level array is stories or questions
      if (json[0]?.title && json[0]?.text) {
        saveUserStories([...json, ...getUserStories()]);
        count += json.length;
      } else if (json[0]?.question && json[0]?.options) {
        saveQuizQuestions([...json, ...getQuizQuestions()]);
        count += json.length;
      }
    }

    if (count === 0) {
      return { success: false, message: 'الملف لا يحتوي على أسئلة أو قصص متوافقة مع التطبيق.', count: 0 };
    }

    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toLocaleDateString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' } as any));
    return {
      success: true,
      message: `تم تحميل وتثبيت ${count} عنصراً جديداً بنجاح عبر الإنترنت!`,
      count,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'فشل الاتصال بالرابط، تأكد من صحة الرابط واتصال الإنترنت.',
      count: 0,
    };
  }
}
