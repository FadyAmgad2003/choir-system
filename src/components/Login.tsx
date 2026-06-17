import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { Mail, Key, ShieldCheck, Languages, AlertCircle, Camera, Database, X, RefreshCw, Signal } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, language, setLanguage, t, isSupabaseConnected, supabaseUrl, updateSupabaseConfig } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Connection Bridge state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerSuccess, setScannerSuccess] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (isScannerOpen) {
      setScannerError(null);
      setScannerSuccess(null);
      
      const timer = setTimeout(() => {
        try {
          import('html5-qrcode').then(({ Html5Qrcode }) => {
            const qrScanner = new Html5Qrcode("login-qr-reader-element");
            html5QrCodeRef.current = qrScanner;

            qrScanner.start(
              { facingMode: "environment" },
              {
                fps: 22,
                qrbox: (width, height) => {
                  const size = Math.min(width, height) * 0.75;
                  return { width: size, height: size };
                }
              },
              (decodedText) => {
                handleSyncDecodedText(decodedText);
              },
              () => {
                // Silently skip scan frame logs
              }
            ).catch(err => {
              console.warn("Camera startup error:", err);
              setScannerError(language === 'ar' 
                ? 'فشل بدء الكاميرا. يرجى إعطاء صلاحيات الكاميرا للمتصفح.' 
                : 'Failed to access camera. Please double check permission preferences.');
            });
          });
        } catch (err) {
          console.error("Failed to load qr library:", err);
          setScannerError('Scanner library failed to load');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      };
    }
  }, [isScannerOpen]);

  const handleSyncDecodedText = (code: string) => {
    const trimmedCode = code.trim();
    let isSyncConfig = false;
    let syncUrl = '';
    let syncKey = '';

    // Check if it is a cams_config JSON string
    if (trimmedCode.startsWith('cams_config:')) {
      try {
        const jsonStr = trimmedCode.substring('cams_config:'.length);
        const config = JSON.parse(jsonStr);
        if (config.url && config.key) {
          isSyncConfig = true;
          syncUrl = config.url;
          syncKey = config.key;
        }
      } catch (err) {
        console.error('Failed to parse synchronized QR JSON config:', err);
      }
    } 
    // Check if it's the direct URL containing parameters
    else if (trimmedCode.includes('sync_url=') && trimmedCode.includes('sync_key=')) {
      try {
        const urlParams = new URL(trimmedCode).searchParams;
        const u = urlParams.get('sync_url');
        const k = urlParams.get('sync_key');
        if (u && k) {
          isSyncConfig = true;
          syncUrl = u;
          syncKey = k;
        }
      } catch (err) {
        // Fallback matching if URL parsing fails on relative/sandboxed environments
        const matchUrl = trimmedCode.match(/[?&]sync_url=([^&]+)/);
        const matchKey = trimmedCode.match(/[?&]sync_key=([^&]+)/);
        if (matchUrl && matchKey) {
          isSyncConfig = true;
          syncUrl = decodeURIComponent(matchUrl[1]);
          syncKey = decodeURIComponent(matchKey[1]);
        }
      }
    }

    if (isSyncConfig && syncUrl && syncKey) {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
      
      updateSupabaseConfig(syncUrl, syncKey);
      
      setScannerSuccess(language === 'ar' 
        ? '⚡ تم المزامنة والربط المباشر بنجاح!' 
        : '⚡ Cloud Database Synchronized and Connected Successfully!');
        
      setTimeout(() => {
        setIsScannerOpen(false);
        setScannerSuccess(null);
      }, 1500);
    } else {
      setScannerError(language === 'ar' 
        ? 'عذراً، هذا الرمز غريب وليس رمز إعداد سحابي صحيح.' 
        : 'Incorrect QR Code. Please scan the DB configuration QR from the laptop Settings.');
    }
  };

  const closeScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsScannerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const res = await login(email, password);
        setIsSubmitting(false);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMsg(err?.message || 'Login failed');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Abstract Flowing Background Aura */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Language Dialect Bar */}
      <div className={`absolute top-6 ${language === 'ar' ? 'left-6' : 'right-6'}`}>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="cursor-pointer px-3.5 py-2 flex items-center gap-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-sm font-sans"
        >
          <Languages className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-slate-850">
        
        {/* Head Center Diocesan Crest details */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100 mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-md flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
              {language === 'ar' ? 'نظام إدارة حضور الكنيسة البطريركي' : 'DIOCESAN SECURITY ENTERPRISE'}
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1 text-slate-900 font-display">
              {language === 'ar' ? 'بوابة تسجيل الدخول الآمن' : 'Operational Login Portal'}
            </h2>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-800 text-xs flex items-center gap-2 animate-[shake_0.4s_ease-in-out]">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email input field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-start">
              {language === 'ar' ? 'البريد الإلكتروني:' : 'Parish Administrator Email:'}
            </label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. fadyamgd126@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 ps-10 pe-4 text-slate-900 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-start"
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-start">
              {language === 'ar' ? 'كلمة المرور المشفرة:' : 'Secure Access Password:'}
            </label>
            <div className="relative">
              <Key className="absolute start-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 ps-10 pe-4 text-slate-900 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-start"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-2 h-11"
          >
            {isSubmitting ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              language === 'ar' ? 'دخول آمن للمنظومة 🔒' : 'Authenticate Access Credentials'
            )}
          </button>
        </form>

        {/* Database Realtime Connector Bridge for mobile client sync */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider text-start">
              {language === 'ar' ? 'منظومة الاتصال والربط السحابي:' : 'Cloud Sync Connectivity:'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] font-bold text-slate-700">
                {isSupabaseConnected 
                  ? (supabaseUrl.includes('hvgkibbyqqreytwtcwwx') 
                    ? (language === 'ar' ? 'المشروع الافتراضي ⚡' : 'Demo Project ⚡') 
                    : (language === 'ar' ? 'مزامنة السحاب النشط ⚡' : 'Custom Live DB ⚡')
                  )
                  : (language === 'ar' ? 'النمط المحلي المنقطع' : 'Local Backup Offline')
                }
              </span>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 text-start leading-relaxed font-medium">
            {language === 'ar' 
              ? 'هل قمت بتهيئة المنظومة على لابتوب ببيانات قاعدة بيانات مخصصة؟ لربط هذا الموبايل بنفس قاعدة البيانات في لحظة واحدة ومزامنة حسابات الأدمن مثل فادي: انقر بالأسفل وامسح رمز الـ QR من شاشة الإعدادات باللابتوب.' 
              : 'Configured a custom database on your laptop? To link this mobile phone to the exact same live project instantly (syncing all accounts like fady), tap the button below and scan the QR from your laptop Settings.'}
          </p>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-2 bg-indigo-50 hover:bg-slate-100 hover:text-indigo-800 text-indigo-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200/50 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 shrink-0 text-indigo-600 animate-pulse" />
            <span>{language === 'ar' ? 'الربط ومزامنة الأجهزة بالكاميرا 🔌' : 'Link Device / Sync via Camera 🔌'}</span>
          </button>
        </div>

        {/* Quick Demo Access Credentials Helper */}
        <div className="mt-6 pt-6 border-t border-slate-150">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
            {language === 'ar' ? '⚡ حسابات الدخول السريع للتجربة والمراجعة' : '⚡ Quick Access Demo Accounts'}
          </p>
          <div className="space-y-2">
            {/* Super Admin Single-Click Login button */}
            <button
              type="button"
              onClick={() => {
                setEmail('superadmin@church.org');
                setPassword('super');
                setErrorMsg('');
                setIsSubmitting(true);
                setTimeout(async () => {
                  try {
                    const res = await login('superadmin@church.org', 'super');
                    setIsSubmitting(false);
                    if (!res.success) setErrorMsg(res.message);
                  } catch (err: any) {
                    setIsSubmitting(false);
                    setErrorMsg(err?.message || 'Login failed');
                  }
                }, 400);
              }}
              className="w-full py-2 px-3 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 rounded-xl flex items-center justify-between text-[11px] font-semibold transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>👑 {language === 'ar' ? 'رئيس الإيبارشية (Bishop)' : 'Super Admin (Bishop)'}</span>
              <span className="font-mono text-[10px] opacity-75">superadmin@church.org (super)</span>
            </button>

            {/* Diocese Admin Single-Click Login button (Maan) */}
            <button
              type="button"
              onClick={() => {
                setEmail('maannddrr@gmail.com');
                setPassword('admin');
                setErrorMsg('');
                setIsSubmitting(true);
                setTimeout(async () => {
                  try {
                    const res = await login('maannddrr@gmail.com', 'admin');
                    if (res.success) {
                      setIsSubmitting(false);
                    } else {
                      // Try backup diocese admin if not seeded yet
                      const resBackup = await login('fadyamgd126@gmail.com', 'admin');
                      setIsSubmitting(false);
                      if (!resBackup.success) {
                        setErrorMsg(resBackup.message);
                      }
                    }
                  } catch (err: any) {
                    setIsSubmitting(false);
                    setErrorMsg(err?.message || 'Login failed');
                  }
                }, 400);
              }}
              className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 rounded-xl flex items-center justify-between text-[11px] font-semibold transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>🔑 {language === 'ar' ? 'مسؤول الإيبارشية (Admin)' : 'Diocese Admin (Admin)'}</span>
              <span className="font-mono text-[10px] opacity-75">maannddrr@gmail.com (admin)</span>
            </button>

            {/* Attendance Officer Single-Click Login button */}
            <button
              type="button"
              onClick={() => {
                setEmail('peter.m@diocesestaff.org');
                setPassword('officer');
                setErrorMsg('');
                setIsSubmitting(true);
                setTimeout(async () => {
                  try {
                    const res = await login('peter.m@diocesestaff.org', 'officer');
                    setIsSubmitting(false);
                    if (!res.success) setErrorMsg(res.message);
                  } catch (err: any) {
                    setIsSubmitting(false);
                    setErrorMsg(err?.message || 'Login failed');
                  }
                }, 400);
              }}
              className="w-full py-2 px-3 border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 text-emerald-900 rounded-xl flex items-center justify-between text-[11px] font-semibold transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>📋 {language === 'ar' ? 'مسؤول الكنيسة (Officer)' : 'Attendance Officer'}</span>
              <span className="font-mono text-[10px] opacity-75">peter.m@.. (officer)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Real-time sync Scanning Modal overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-100 relative shadow-2xl flex flex-col space-y-4">
            <button 
              type="button"
              onClick={closeScanner}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-950 text-sm flex items-center justify-center gap-2">
                <Camera className="h-4 w-4 text-indigo-600 animate-pulse" />
                {language === 'ar' ? 'امسح رمز الـ QR للربط السريع' : 'Scan Database Sync QR Code'}
              </h3>
              <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                {language === 'ar' 
                  ? 'وجه الكاميرا نحو رمز المزامنة الموجود في تبويب "الإعدادات" على شاشة اللابتوب.' 
                  : 'Point your phone\'s camera at the sync QR code displayed under the "Settings" tab of your laptop.'}
              </p>
            </div>

            {/* Live viewport container */}
            <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200">
              <div id="login-qr-reader-element" className="w-full h-full" />
              
              {/* Retro HUD viewfinder graphic */}
              <div className="absolute inset-0 border-[28px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full border-2 border-dashed border-indigo-400 relative">
                  <span className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-4 border-l-4 border-indigo-500" />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-4 border-r-4 border-indigo-500" />
                  <span className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-4 border-l-4 border-indigo-500" />
                  <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-4 border-r-4 border-indigo-500" />
                  {/* Sweep scanline animation */}
                  <div className="w-full h-0.5 bg-indigo-400/80 absolute top-1/2 left-0 shadow-[0_0_10px_2px_rgba(129,140,248,0.5)] animate-[bounce_3s_infinite]" />
                </div>
              </div>
            </div>

            {scannerError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[10px] flex items-center gap-1.5 text-start font-medium leading-relaxed">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{scannerError}</span>
              </div>
            )}

            {scannerSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] flex items-center gap-1.5 text-start font-bold">
                <Signal className="h-4 w-4 text-emerald-600 shrink-0 animate-bounce" />
                <span>{scannerSuccess}</span>
              </div>
            )}

            <button
              type="button"
              onClick={closeScanner}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

