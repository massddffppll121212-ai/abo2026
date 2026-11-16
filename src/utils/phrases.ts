export type Dialect = 'fusha' | 'yemeni';

export function getChildName(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('akram_child_name');
      if (saved && saved.trim()) return saved.trim();
    } catch {
      // Fallback
    }
  }
  return 'أكرم اليسري';
}

export function getCorrectAnswerPraise(name?: string, extraText: string = '', dialect: Dialect = 'fusha'): string {
  const childName = (name && name.trim()) ? name.trim() : getChildName();
  if (dialect === 'yemeni') {
    return `أحسنت يا ${childName}! إجابة مية مية وكفو والله! ${extraText} 🎉⭐`;
  }
  return `أحسنت يا ${childName}! إجابة صحيحة ورائعة! ${extraText} 🎉⭐`;
}

export function getTryAgainPhrase(name?: string, dialect: Dialect = 'fusha'): string {
  const childName = (name && name.trim()) ? name.trim() : getChildName();
  if (dialect === 'yemeni') {
    return `حاول مرة أخرى يا ${childName}، أنت كفو وتستطيع! 💪`;
  }
  return `محاولة طيبة يا ${childName}، حاول مرة أخرى! 💪`;
}

export interface DialectPhrases {
  welcome: (name: string) => string;
  correct: (name: string) => string;
  tryAgain: (name: string) => string;
  starEarned: (name: string) => string;
  tracingIntro: (letter: string, name?: string) => string;
  tracingFinish: (letter: string, name?: string) => string;
  letterQuestion: (name: string, word: string) => string;
  countingQuestion: (plural: string) => string;
  matchingQuestion: string;
  balloonMission: (name: string) => string;
  storyFinish: (title: string, name?: string) => string;
  encouragementLow: (name?: string) => string;
  encouragementMid: (name?: string) => string;
  encouragementHigh: (name?: string) => string;
}

export const PHRASES: Record<Dialect, DialectPhrases> = {
  fusha: {
    welcome: (name) => `أهلاً وسهلاً بك يا ${name} في عالم أكرم التعليمي!`,
    correct: (name) => `أحسنت يا ${name}! إجابة صحيحة ورائعة جداً 🎉`,
    tryAgain: (name) => `حاول مرة أخرى يا ${name}، أنت ذكي وتستطيع! 💪`,
    starEarned: (name) => `أحسنت يا ${name}! ربحت نجمة جديدة تضاف لإنجازاتك ⭐`,
    tracingIntro: (char, name) => `شوف يا ${name || 'بطل'} كيف نكتب ${char}، ثم ابدأ من النقطة الخضراء واكتب بيدك!`,
    tracingFinish: (char, name) => `أحسنت يا ${name || 'بطل'}! كتبت ${char} بخط جميل ومتقن جداً!`,
    letterQuestion: (charName, word) => `أين ${charName}؟ مثل ${word}`,
    countingQuestion: (plural) => `كم عدد الـ ${plural} في المربع؟ يمكنك لمسها لعدها!`,
    matchingQuestion: 'ما هي الكلمة المناسبة لهذه الصورة؟',
    balloonMission: (charName) => `فرقع بالون ${charName}!`,
    storyFinish: (title, name) => `أحسنت يا ${name || 'بطل'}! استمعت لقصة ${title} وفهمت العبرة الجميلة ⭐⭐`,
    encouragementLow: (name) => `أنت تبدأ طريقك الرائع يا ${name || 'بطل'}، واصل التعلم وجمع النجوم! 🚀`,
    encouragementMid: (name) => `ما شاء الله يا ${name || 'عبقري'}! بداية قوية جداً وتقدم ممتاز! استمر! ⭐`,
    encouragementHigh: (name) => `ما شاء الله تبارك الله! أنت البطل الأسطوري يا ${name || 'عبقري'} لعالم أكرم! 👑🏆`,
  },
  yemeni: {
    welcome: (name) => `يا حيا ومسهلا بك يا ${name} في عالم أكرم، نورتنا يا بطل!`,
    correct: (name) => `أحسنت يا ${name}! إجابة مية مية وكفو والله! 🎉`,
    tryAgain: (name) => `حاول مرة ثانية يا ${name}، ولا يهمك أنت كفو وتقدر! 💪`,
    starEarned: (name) => `أحسنت يا ${name}! خذ لك نجمة ذهبية تلمع يا بطل ⭐`,
    tracingIntro: (char, name) => `شوف يا ${name || 'بطل'} كيف نكتب ${char}، وبعدها ابدأ من النقطة الخضراء واكتب بيدك الحلوة!`,
    tracingFinish: (char, name) => `ما شاء الله تبارك الرحمن! أحسنت يا ${name || 'فنان'} ويا محلا خطك في ${char}!`,
    letterQuestion: (charName, word) => `وين ${charName} يا شاطر؟ زي ${word}`,
    countingQuestion: (plural) => `كم حبات ${plural} هنا يا بطل؟ اضغط عليها وعدها وشوف!`,
    matchingQuestion: 'إيش الكلمة المناسبة لهذه الصورة يا شاطر؟',
    balloonMission: (charName) => `فرقع بالون ${charName} سريع!`,
    storyFinish: (title, name) => `يا سلاام عليك يا ${name || 'ذكي'}! سمعت قصة ${title} وفهمت العبرة، كفو عليك ⭐⭐`,
    encouragementLow: (name) => `ما شاء الله عليك يا ${name || 'فنان'}، بداية الخير قطرة واصل! 🚀`,
    encouragementMid: (name) => `يا عيني على شطارتك يا ${name || 'ذكي'}! ماشي تمام وماسك الخط الصح! ⭐`,
    encouragementHigh: (name) => `ما شاء الله تبارك الرحمن! أنت كفو وفارس عالم أكرم بلا منازع يا ${name || 'أكرم'}! 👑🏆`,
  },
};

export function getPhrase<K extends keyof DialectPhrases>(
  dialect: Dialect,
  key: K,
  ...args: DialectPhrases[K] extends (...a: infer P) => string ? P : []
): string {
  const phraseGroup = PHRASES[dialect] || PHRASES.fusha;
  const item = phraseGroup[key];
  if (typeof item === 'function') {
    return (item as (...a: unknown[]) => string)(...args);
  }
  return item as string;
}
