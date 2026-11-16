import React, { useState } from 'react';
import {
  ONLINE_PACKS,
  OnlineContentPack,
  installOnlinePack,
  importFromWebUrl,
  getLastSyncTime,
  getInstalledPacks,
  getQuizQuestions,
  addQuizQuestion,
  deleteQuizQuestion,
  CustomQuestion,
} from '../../utils/contentSync';
import { playPopSound, playSuccessSound, playTryAgainSound } from '../../utils/sound';
import {
  Globe,
  DownloadCloud,
  CheckCircle2,
  Sparkles,
  Link2,
  Plus,
  Trash2,
  HelpCircle,
  X,
  RefreshCw,
  Layers,
  BookOpen,
} from 'lucide-react';

interface OnlineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  playSound: (text: string) => void;
  onContentUpdated?: () => void;
}

export const OnlineSyncModal: React.FC<OnlineSyncModalProps> = ({
  isOpen,
  onClose,
  playSound,
  onContentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'customUrl' | 'editor'>('packs');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [installedPacks, setInstalledPacks] = useState<string[]>(getInstalledPacks());
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());

  // Questions Editor State
  const [questions, setQuestions] = useState<CustomQuestion[]>(getQuizQuestions());
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newCategory, setNewCategory] = useState('ذكاء ومعلومات');
  const [newEmoji, setNewEmoji] = useState('⭐');

  if (!isOpen) return null;

  const handleInstallPack = async (pack: OnlineContentPack) => {
    setInstallingId(pack.id);
    setStatusMessage(null);
    playPopSound();

    try {
      const result = await installOnlinePack(pack.id);
      if (result.success) {
        playSuccessSound();
        setInstalledPacks(getInstalledPacks());
        setLastSync(getLastSyncTime());
        setQuestions(getQuizQuestions());
        setStatusMessage(`✅ ${result.message}`);
        playSound(`تم تنزيل وتحديث ${pack.title} بنجاح عبر الإنترنت!`);
        if (onContentUpdated) onContentUpdated();
      } else {
        playTryAgainSound();
        setStatusMessage(`❌ ${result.message}`);
      }
    } catch {
      setStatusMessage('❌ حدث خطأ أثناء التنزيل.');
    } finally {
      setInstallingId(null);
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setIsUrlLoading(true);
    setStatusMessage(null);
    playPopSound();

    const res = await importFromWebUrl(customUrl.trim());
    setIsUrlLoading(false);

    if (res.success) {
      playSuccessSound();
      setLastSync(getLastSyncTime());
      setQuestions(getQuizQuestions());
      setStatusMessage(`✅ ${res.message}`);
      playSound(res.message);
      setCustomUrl('');
      if (onContentUpdated) onContentUpdated();
    } else {
      playTryAgainSound();
      setStatusMessage(`❌ ${res.message}`);
      playSound(`تعذر تنزيل الحزمة، تأكد من صحة الرابط.`);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOpt1.trim() || !newOpt2.trim()) return;

    const options = [newOpt1.trim(), newOpt2.trim()];
    if (newOpt3.trim()) options.push(newOpt3.trim());

    const newQ: CustomQuestion = {
      id: `custom-q-${Date.now()}`,
      question: newQuestionText.trim(),
      options,
      correctIndex: Math.min(newCorrectIdx, options.length - 1),
      category: newCategory.trim() || 'أسئلة الأولياء',
      emoji: newEmoji || '🧠',
    };

    addQuizQuestion(newQ);
    playSuccessSound();
    setQuestions(getQuizQuestions());
    setStatusMessage('✅ تمت إضافة السؤال الجديد بنجاح للألعاب!');
    playSound('تمت إضافة السؤال بنجاح');

    // Reset inputs
    setNewQuestionText('');
    setNewOpt1('');
    setNewOpt2('');
    setNewOpt3('');
    if (onContentUpdated) onContentUpdated();
  };

  const handleDeleteQuestion = (id: string) => {
    playPopSound();
    deleteQuizQuestion(id);
    setQuestions(getQuizQuestions());
    if (onContentUpdated) onContentUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right animate-pop">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              🌐
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl">تحديث الأسئلة والألعاب عبر الإنترنت</h3>
              <p className="text-xs text-sky-100 font-medium">
                تنزيل حزم أسئلة وقصص جديدة وتخصيص الألعاب
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 flex items-center justify-between text-xs font-bold text-sky-900">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            متصل بسيرفر المحتوى والإنترنت 🟢
          </span>
          {lastSync && <span className="text-slate-500">آخر تحديث: {lastSync}</span>}
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('packs');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'packs'
                ? 'bg-white text-sky-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>حزم أونلاين جاهزة</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('customUrl');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'customUrl'
                ? 'bg-white text-sky-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>رابط ويب مخصص</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('editor');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'editor'
                ? 'bg-white text-sky-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>محرر الأسئلة ({questions.length})</span>
          </button>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs animate-pop">
            {statusMessage}
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Ready-made Online Packs */}
          {activeTab === 'packs' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                اضغط على زر التنزيل لجلب وتثبيت الأسئلة والقصص والألعاب الجديدة مباشرة من الإنترنت إلى جهاز طفلك:
              </p>

              {ONLINE_PACKS.map((pack) => {
                const isInstalled = installedPacks.includes(pack.id);
                const isBusy = installingId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isInstalled
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 bg-slate-100 rounded-2xl shrink-0">
                          {pack.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm">{pack.title}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                              {pack.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {pack.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-500">
                            {pack.questionsCount && <span>❓ {pack.questionsCount} أسئلة ذكاء</span>}
                            {pack.storiesCount && <span>📖 {pack.storiesCount} قصص جديدة</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInstallPack(pack)}
                        disabled={isBusy}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs ${
                          isInstalled
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-sky-500 hover:bg-sky-600 text-white'
                        }`}
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>جارٍ التنزيل...</span>
                          </>
                        ) : isInstalled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>إعادة التحديث</span>
                          </>
                        ) : (
                          <>
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>تنزيل الحزمة</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Custom Web URL */}
          {activeTab === 'customUrl' && (
            <form onSubmit={handleImportUrl} className="space-y-4">
              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                <h4 className="font-black text-xs text-sky-900 mb-1 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-sky-600" />
                  تنزيل حزمة أسئلة عبر رابط إنترنت مخصص
                </h4>
                <p className="text-[11px] text-sky-800 font-medium leading-relaxed">
                  يمكن للمعلمين أو أولياء الأمور مشاركة رابط لملف JSON يحتوي على أسئلة وقصص مخصصة ليتم تثبيتها فوراً عبر النت في التطبيق.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  رابط الويب (URL):
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/akram-questions.json"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-sky-500 focus:outline-hidden text-xs font-bold text-left ltr"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUrlLoading || !customUrl.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                >
                  {isUrlLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارٍ التحميل والتثبيت من الإنترنت...</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      <span>تنزيل وتثبيت الحزمة عبر الإنترنت</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Parent Questions Editor */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Add New Question Form */}
              <form onSubmit={handleAddQuestion} className="p-3.5 bg-amber-50/70 rounded-2xl border-2 border-amber-300 space-y-3">
                <h4 className="font-black text-xs text-amber-950 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-amber-600" />
                  إضافة سؤال جديد إلى الألعاب التعليمية:
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نص السؤال:
                  </label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="مثال: ما هو لون التفاح الأكثر شهرة؟"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الخيار الأول (1):
                    </label>
                    <input
                      type="text"
                      value={newOpt1}
                      onChange={(e) => setNewOpt1(e.target.value)}
                      placeholder="أحمر"
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الخيار الثاني (2):
                    </label>
                    <input
                      type="text"
                      value={newOpt2}
                      onChange={(e) => setNewOpt2(e.target.value)}
                      placeholder="أزرق"
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الخيار الثالث (3):
                    </label>
                    <input
                      type="text"
                      value={newOpt3}
                      onChange={(e) => setNewOpt3(e.target.value)}
                      placeholder="بنفسجي"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الإجابة الصحيحة هي:
                    </label>
                    <select
                      value={newCorrectIdx}
                      onChange={(e) => setNewCorrectIdx(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                    >
                      <option value={0}>الخيار الأول (1)</option>
                      <option value={1}>الخيار الثاني (2)</option>
                      {newOpt3 && <option value={2}>الخيار الثالث (3)</option>}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رمز إيموجي:
                    </label>
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center text-sm bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-xs transition-colors cursor-pointer"
                >
                  حفظ السؤال في بنك الألعاب ⭐
                </button>
              </form>

              {/* Existing Questions List */}
              <div className="space-y-2">
                <h5 className="font-black text-xs text-slate-800">
                  قائمة الأسئلة الحالية في الألعاب ({questions.length}):
                </h5>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1">
                        <div className="font-black text-slate-900 flex items-center gap-1">
                          <span>{q.emoji || '❓'}</span>
                          <span>{q.question}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          ✓ الإجابة الصحيحة: {q.options[q.correctIndex]}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
