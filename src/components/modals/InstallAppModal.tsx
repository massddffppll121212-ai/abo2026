import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { playPopSound, playSuccessSound } from '../../utils/sound';
import {
  DownloadCloud,
  Smartphone,
  X,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  ShieldCheck,
  ExternalLink,
  FolderArchive,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  playSound?: (text: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  playSound,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'bundle'>('pwa');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  const handleInstallPWA = async () => {
    playPopSound();
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      playSuccessSound();
      if (playSound) playSound('تم بدء تثبيت التطبيق بنجاح!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl p-5 text-right space-y-4 max-h-[92vh] overflow-y-auto animate-pop relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-xs">
              📱
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                تثبيت التطبيق على الهاتف
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                استمتع بالتطبيق بشاشة كاملة وسرعة فائقة بدون متصفح
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('pwa');
            }}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>تثبيت مباشر على الهاتف ⚡</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('bundle');
            }}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bundle'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>تحميل حزمة التطبيق الكاملة 📦</span>
          </button>
        </div>

        {/* Tab 1: Direct PWA Install */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            {isInstalled ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-black text-emerald-900 text-base">
                  التطبيق مثبت بالفعل على جهازك! 🎉
                </h4>
                <p className="text-xs text-emerald-700 font-bold">
                  يمكنك فتحه مباشرة من الشاشة الرئيسية لهاتفك في أي وقت.
                </p>
              </div>
            ) : installSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-emerald-900 text-base">
                  جاري إضافة التطبيق لشاشة هاتفك! 🚀
                </h4>
                <p className="text-xs text-emerald-700 font-bold">
                  تفقد شاشة هاتفك الرئيسية، ستجد أيقونة "عالم أكرم" جاهزة للاستخدام.
                </p>
              </div>
            ) : isInstallable ? (
              <div className="p-4 bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border-2 border-rose-200 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center text-3xl border border-rose-100">
                  🎈
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">
                    جاهز للتثبيت الفوري على هاتفك!
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    يعمل كتطبيق كامل بشاشة كاملة وسريع جداً ويعمل بدون إنترنت.
                  </p>
                </div>

                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-rose-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>📲 اضغط هنا لتثبيت التطبيق الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {isInIframe && (
                  <div className="p-3.5 bg-indigo-50 rounded-2xl border-2 border-indigo-200 space-y-2">
                    <p className="text-xs font-black text-indigo-950">
                      🌐 افتح التطبيق في نافذة متصفح مستقلة لتفعيل زر التثبيت التلقائي:
                    </p>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playPopSound()}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>فتح في متصفح الهاتف مباشرة</span>
                    </a>
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-right">
                  <span className="text-xs font-black text-amber-900 block mb-1">
                    💡 خطوات بسيطة وسريعة لتثبيته على هاتفك خلال 5 ثوانٍ:
                  </span>
                </div>

                {isIOS ? (
                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="font-black text-xs text-slate-800 flex items-center gap-1.5 text-blue-600">
                      <span>🍎</span>
                      <span>طريقة التثبيت على الآيفون والآيباد (متصفح Safari):</span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[11px] font-black">1</span>
                      <p>اضغط على زر <strong>المشاركة (Share)</strong> <Share className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> في أسفل الشاشة أو أعلاها.</p>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[11px] font-black">2</span>
                      <p>مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> (Add to Home Screen).</p>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[11px] font-black">3</span>
                      <p>اضغط على <strong>"إضافة" (Add)</strong> في الزاوية العلوية، وسيظهر التطبيق فوراً على شاشتك الرئيسية!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="font-black text-xs text-slate-800 flex items-center gap-1.5 text-emerald-600">
                      <span>🤖</span>
                      <span>طريقة التثبيت على هواتف الأندرويد (Chrome):</span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[11px] font-black">1</span>
                      <p>اضغط على زر القائمة <strong>النقاط الثلاث (⋮)</strong> <MoreVertical className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> في أعلى المتصفح.</p>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[11px] font-black">2</span>
                      <p>اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Install app / Add to Home screen).</p>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[11px] font-black">3</span>
                      <p>اضغط <strong>"تثبيت"</strong> لتجده متاحاً كأي تطبيق عادي على هاتفك بشاشة كاملة وبدون متصفح!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 font-medium">
              ✨ ميزات التثبيت المباشر: لا يشغل مساحة على الهاتف، يتحدث تلقائياً بأحدث الميزات، ويعمل بدون إنترنت.
            </div>
          </div>
        )}

        {/* Tab 2: Complete Offline Bundle & Android Build Package */}
        {activeTab === 'bundle' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 text-right space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                  📦
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-sm">
                    الحزمة الكاملة للتطبيق (AkramWorld_App_Bundle.zip)
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    تشمل ملفات التشغيل الكاملة (www) + الأصوات + إعدادات بناء APK الموقع
                  </span>
                </div>
              </div>

              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                تحتوي الحزمة على كامل التطبيق الجاهز للعمل أو للتحويل إلى ملف APK موقع ومعتمد عبر Capacitor / Android Studio أو PWABuilder.
              </p>

              <a
                href="/AkramWorld_App_Bundle.zip"
                download="AkramWorld_App_Bundle.zip"
                onClick={() => {
                  playPopSound();
                  if (playSound) playSound('جاري تحميل حزمة التطبيق الكاملة الآن!');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <DownloadCloud className="w-5 h-5" />
                <span>📥 تحميل حزمة التطبيق الكاملة (ZIP)</span>
              </a>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>طريقة تحويل الحزمة أو الرابط إلى ملف APK موقع للأندرويد:</span>
              </span>

              <div className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[11px] font-black">1</span>
                <p>للتحويل السريع أونلاين: افتح موقع <strong>PWABuilder.com</strong> وأدخل رابط التطبيق لتحصل على ملف <strong>APK موقع وجاهز للتثبيت</strong> خلال دقيقة واحدة.</p>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-700 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[11px] font-black">2</span>
                <p>أو عبر الكمبيوتر: فك ضغط <strong>AkramWorld_App_Bundle.zip</strong> واستخدم مجلد <code>android-ready</code> مع <strong>Capacitor + Android Studio</strong> لبناء الـ APK الرسمي.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400">
            عالم أكرم للأطفال 2026 ⭐
          </span>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
