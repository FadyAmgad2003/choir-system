import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Mail, Key, ShieldCheck, Languages, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, language, setLanguage, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    </div>
  );
};
