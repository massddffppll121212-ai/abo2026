import React, { useState, useEffect } from 'react';
import { ChildrenStory } from '../../data/arabicData';
import {
  getUserStories,
  addUserStory,
  updateUserStory,
  deleteUserStory,
  resetDefaultStories,
} from '../../utils/contentSync';
import { playPopSound, playSuccessSound, triggerConfetti } from '../../utils/sound';
import {
  hasUserStoryVoice,
  playUserAudio,
  stopUserAudio,
  isUserVoiceActive,
} from '../../utils/userVoiceStorage';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  X,
  Check,
  Mic,
} from 'lucide-react';

interface StoriesScreenProps {
  setScreen: (screen: 'home' | 'letters' | 'numbers' | 'games' | 'stories' | 'quran' | 'adab' | 'voiceStudio' | 'settings') => void;
  playSound: (text: string) => void;
  addStars?: (count: number) => void;
}

const POPULAR_EMOJIS = ['🦁', '🦆', '🍎', '🌸', '🚀', '👑', '🐠', '🐘', '🐢', '🐝', '🌙', '☀️', '🐱', '🐴', '🍇', '🎨'];

export const StoriesScreen: React.FC<StoriesScreenProps> = ({
  setScreen,
  playSound,
  addStars,
}) => {
  const [stories, setStories] = useState<ChildrenStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [readStories, setReadStories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akram_read_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Story Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [inputTitle, setInputTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputEmoji, setInputEmoji] = useState('🦁');
  const [inputCategory, setInputCategory] = useState('القيم والأخلاق');
  const [inputMoral, setInputMoral] = useState('');

  // Load stories from persistent storage
  const loadStories = () => {
    const list = getUserStories();
    setStories(list);
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Stop speech or recorded audio if unmounting or switching stories
  useEffect(() => {
    return () => {
      stopUserAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedStory]);

  const handleSelectStory = (story: ChildrenStory) => {
    playPopSound();
    stopUserAudio();
    setSelectedStory(story);
    setIsPlayingAudio(false);
    playSound(`قصة ${story.title}`);
  };

  const handleToggleNarrator = async (useTeacherOverride = false) => {
    if (!selectedStory) return;

    if (isPlayingAudio) {
      stopUserAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const hasRecorded = hasUserStoryVoice(selectedStory.id);
    const preferUserVoice = hasRecorded && isUserVoiceActive() && !useTeacherOverride;

    setIsPlayingAudio(true);

    if (preferUserVoice) {
      const played = await playUserAudio(`story_${selectedStory.id}`, () => {
        setIsPlayingAudio(false);
      });
      if (!played) {
        // Fallback to standard speech if audio file couldn't be loaded
        playSound(`${selectedStory.title}. ${selectedStory.text}. العبرة من القصة: ${selectedStory.moral}`);
      }
    } else {
      playSound(`${selectedStory.title}. ${selectedStory.text}. العبرة من القصة: ${selectedStory.moral}`);
    }
  };

  const handleClaimReward = () => {
    if (!selectedStory) return;
    if (!readStories.includes(selectedStory.id)) {
      const next = [...readStories, selectedStory.id];
      setReadStories(next);
      try {
        localStorage.setItem('akram_read_stories', JSON.stringify(next));
      } catch {
        // Ignore
      }
      playSuccessSound();
      triggerConfetti();
      if (addStars) {
        addStars(2);
      }
      playSound(`أحسنت يا بطل! استمعت لقصة ${selectedStory.title} ونلت نجمتين ⭐⭐`);
    } else {
      playSound(`لقد استمعت لهذه القصة الرائعة من قبل!`);
    }
  };

  // Open modal for adding a new story
  const handleOpenAddStory = () => {
    playPopSound();
    setEditingStoryId(null);
    setInputTitle('');
    setInputText('');
    setInputEmoji('🦁');
    setInputCategory('القيم والأخلاق');
    setInputMoral('');
    setIsEditorOpen(true);
  };

  // Open modal for editing an existing story
  const handleOpenEditStory = (e: React.MouseEvent, story: ChildrenStory) => {
    e.stopPropagation();
    playPopSound();
    setEditingStoryId(story.id);
    setInputTitle(story.title);
    setInputText(story.text);
    setInputEmoji(story.emoji);
    setInputCategory(story.category);
    setInputMoral(story.moral);
    setIsEditorOpen(true);
  };

  // Delete a story
  const handleDeleteStory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('هل تريد حذف هذه القصة؟')) {
      playPopSound();
      deleteUserStory(id);
      loadStories();
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    }
  };

  // Save story (either new or edited)
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim() || !inputText.trim()) return;

    if (editingStoryId) {
      updateUserStory(editingStoryId, {
        title: inputTitle.trim(),
        text: inputText.trim(),
        emoji: inputEmoji || '📖',
        category: inputCategory.trim() || 'قصص متنوعة',
        moral: inputMoral.trim() || 'العمل الطيب يثمر خيراً دائماً.',
      });
      playSuccessSound();
      playSound(`تم تعديل قصة ${inputTitle.trim()} بنجاح!`);
    } else {
      const newStory: ChildrenStory = {
        id: `story-${Date.now()}`,
        title: inputTitle.trim(),
        text: inputText.trim(),
        emoji: inputEmoji || '📖',
        category: inputCategory.trim() || 'قصص من تأليف الوالدين',
        moral: inputMoral.trim() || 'التعلم والأخلاق الحسنة طريق السعادة.',
      };
      addUserStory(newStory);
      playSuccessSound();
      playSound(`تمت إضافة قصة ${newStory.title} بنجاح!`);
    }

    loadStories();
    setIsEditorOpen(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد استعادة جميع القصص الأصلية؟')) {
      playPopSound();
      resetDefaultStories();
      loadStories();
      playSound('تمت استعادة القصص الأصلية');
    }
  };

  const currentIdx = selectedStory
    ? stories.findIndex((s) => s.id === selectedStory.id)
    : -1;

  const handleNextStory = () => {
    if (stories.length === 0) return;
    if (currentIdx < stories.length - 1) {
      handleSelectStory(stories[currentIdx + 1]);
    } else {
      handleSelectStory(stories[0]);
    }
  };

  const handlePrevStory = () => {
    if (stories.length === 0) return;
    if (currentIdx > 0) {
      handleSelectStory(stories[currentIdx - 1]);
    } else {
      handleSelectStory(stories[stories.length - 1]);
    }
  };

  const isCurrentRead = selectedStory ? readStories.includes(selectedStory.id) : false;

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => {
            playPopSound();
            if (selectedStory) {
              setSelectedStory(null);
              setIsPlayingAudio(false);
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            } else {
              setScreen('home');
            }
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          {selectedStory ? '⬅️ العودة للقصص' : '🏠 الرئيسية'}
        </button>

        <span className="text-sm font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-2xl border border-purple-200 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>قصص وحكايات ({readStories.length}/{stories.length})</span>
        </span>
      </div>

      {/* Mode 1: Stories Library List */}
      {!selectedStory ? (
        <div className="w-full space-y-4">
          {/* Header Action Bar */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-3xl p-5 text-white shadow-lg text-right relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">حكايات وقصص الأطفال 📖</h2>
                <span className="text-2xl animate-float">✨</span>
              </div>
              <p className="text-xs text-purple-100 font-medium mt-1">
                استمع للقصص الهادفة، أو ألّف وأضف قصصك الخاصة في أي وقت لتعليم وتسلية طفلك!
              </p>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button
                  onClick={handleOpenAddStory}
                  className="px-4 py-2.5 rounded-2xl bg-white text-purple-900 font-black text-xs sm:text-sm shadow-md hover:bg-purple-50 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>+ كتابة وإضافة قصة جديدة ✍️</span>
                </button>

                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="استعادة القصص الأصلية للتطبيق"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الأصلية</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stories Grid / List */}
          <div className="grid grid-cols-1 gap-3 w-full">
            {stories.map((story) => {
              const isRead = readStories.includes(story.id);
              const hasRecorded = hasUserStoryVoice(story.id);

              return (
                <div
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
                  className="bg-white hover:bg-purple-50/40 border-3 border-purple-100 hover:border-purple-300 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer group relative"
                >
                  {/* Emoji Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-purple-100/70 border border-purple-200 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    {story.emoji}
                  </div>

                  {/* Story Details */}
                  <div className="flex-1 text-right overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          {story.category}
                        </span>
                        {hasRecorded && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span>🎙️</span>
                            <span>بصوتك المسجل</span>
                          </span>
                        )}
                      </div>
                      {isRead && (
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          مقروءة
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {story.text}
                    </p>
                  </div>

                  {/* Edit and Delete Buttons for each story */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleOpenEditStory(e, story)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-purple-100 text-purple-600 transition-colors"
                      title="تعديل القصة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteStory(e, story.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-100 text-rose-500 transition-colors"
                      title="حذف القصة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mode 2: Full Story Reader View */
        <div className="w-full bg-white rounded-3xl p-6 border-4 border-purple-200 shadow-xl text-center relative overflow-hidden animate-pop">
          {/* Top Actions in Reader */}
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black">
              {selectedStory.category}
            </span>

            <button
              onClick={(e) => handleOpenEditStory(e, selectedStory)}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl border border-purple-200 flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل هذه القصة</span>
            </button>
          </div>

          {/* Story Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-purple-900 mb-2">
            {selectedStory.title}
          </h2>

          {/* Big Story Emoji Illustration */}
          <div className="my-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200 inline-block shadow-inner">
            <span className="text-6xl sm:text-7xl select-none animate-float drop-shadow-sm">
              {selectedStory.emoji}
            </span>
          </div>

          {/* Story Text */}
          <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 text-right my-3">
            <p className="text-base sm:text-lg text-slate-800 font-bold leading-relaxed whitespace-pre-line">
              {selectedStory.text}
            </p>
          </div>

          {/* Moral Lesson Callout */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-right flex items-start gap-2.5 my-3">
            <Heart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-amber-900 block mb-0.5">
                العبرة من القصة:
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-800">
                {selectedStory.moral}
              </p>
            </div>
          </div>

          {/* User Voice Banner if Recorded */}
          {hasUserStoryVoice(selectedStory.id) && (
            <div className="p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-right flex items-center justify-between my-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <div>
                  <span className="text-xs font-black text-emerald-900 block">
                    هذه القصة مسجلة بصوتك الحقيقي!
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    يتم تشغيلها بصوتك كلغة أصلية للبرنامج 🌟
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopUserAudio();
                  setScreen('voiceStudio');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                تعديل التسجيل 🎙️
              </button>
            </div>
          )}

          {/* Audio Narrator Controls */}
          <div className="space-y-2 my-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleToggleNarrator(false)}
                className={`flex-1 py-3 px-5 rounded-2xl font-black text-sm sm:text-base shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                    : hasUserStoryVoice(selectedStory.id) && isUserVoiceActive()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>إيقاف القراءة الصوتية</span>
                  </>
                ) : hasUserStoryVoice(selectedStory.id) && isUserVoiceActive() ? (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>🎙️ استمع للقصة بصوتك المسجل</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>🔊 اقرأ القصة بصوت واضح</span>
                  </>
                )}
              </button>

              {/* Claim Reward Button */}
              <button
                onClick={handleClaimReward}
                className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrentRead
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 shadow-md active:scale-95'
                }`}
              >
                <Star className={`w-4 h-4 ${isCurrentRead ? 'fill-amber-500' : ''}`} />
                <span>{isCurrentRead ? 'حصلت على النجوم ⭐' : 'فهمت القصة (+2 نجوم ⭐)'}</span>
              </button>
            </div>

            {/* Extra Audio Options & Voice Studio Recording Button */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {hasUserStoryVoice(selectedStory.id) && (
                <button
                  type="button"
                  onClick={() => handleToggleNarrator(true)}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="الاستماع بصوت المعلمة الفصيح بدلاً من الصوت المسجل"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>الاستماع بصوت المعلمة الفصيح</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  stopUserAudio();
                  setScreen('voiceStudio');
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span>{hasUserStoryVoice(selectedStory.id) ? 'استوديو الأصوات 🎙️' : 'سجّل هذه القصة بصوتك 🎙️'}</span>
              </button>
            </div>
          </div>

          {/* Navigation between stories */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <button
              onClick={handlePrevStory}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>القصة السابقة</span>
            </button>

            <button
              onClick={handleNextStory}
              className="flex-1 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-200 transition-all active:scale-95 cursor-pointer"
            >
              <span>القصة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Story Create & Edit Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-purple-300 shadow-2xl p-5 text-right space-y-4 max-h-[90vh] overflow-y-auto animate-pop">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-lg font-black text-purple-900 flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <span>{editingStoryId ? 'تعديل القصة' : 'كتابة قصة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  عنوان القصة:
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="مثال: رحلة العصفور الصغير إلى الغابة"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-hidden text-sm font-bold bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  اختر رمز أو إيموجي القصة:
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl p-2 bg-purple-50 border border-purple-200 rounded-xl">
                    {inputEmoji}
                  </span>
                  <input
                    type="text"
                    value={inputEmoji}
                    onChange={(e) => setInputEmoji(e.target.value)}
                    placeholder="رمز تعبيري"
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center"
                  />
                  <span className="text-[11px] text-slate-400">أو اختر من هنا:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_EMOJIS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setInputEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        inputEmoji === em
                          ? 'bg-purple-200 border-2 border-purple-600 scale-110'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  نص القصة (اكتب القصة بأسلوب مشوق ومناسب للأطفال):
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="كان يا ما كان في قديم الزمان..."
                  rows={5}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-hidden text-sm font-bold bg-slate-50 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    تصنيف القصة:
                  </label>
                  <input
                    type="text"
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value)}
                    placeholder="مثال: الصداقة، الأمانة، بر الوالدين"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    العبرة المستفادة من القصة:
                  </label>
                  <input
                    type="text"
                    value={inputMoral}
                    onChange={(e) => setInputMoral(e.target.value)}
                    placeholder="مثال: الصدق منجاة والتعاون قوة."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStoryId ? 'حفظ التعديلات' : 'إضافة القصة للطفل ⭐'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
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
