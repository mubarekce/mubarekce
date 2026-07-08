
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Not: Bu bileşen artık bir "onLogin" prop'una ihtiyaç duymuyor.
// Giriş başarılı olduğunda Firebase Auth durumu değişir ve bunu
// App.tsx içindeki onAuthStateChanged dinleyicisi otomatik yakalar.

// Firebase'in İngilizce hata kodlarını kullanıcıya anlamlı Türkçe
// mesajlara çeviriyoruz.
const translateAuthError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/wrong-password':
      return 'E-posta veya şifre hatalı.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
    case 'auth/popup-closed-by-user':
      return 'Google penceresi kapatıldı.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantınızı kontrol edin.';
    default:
      return 'Bir hata oluştu, lütfen tekrar deneyin.';
  }
};

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        // Kullanıcı profilini Firestore'da da oluştur
        await setDoc(
          doc(db, 'users', cred.user.uid),
          { name: name.trim(), email: email.trim(), createdAt: new Date().toISOString() },
          { merge: true }
        );
      }
      // Başarılı: App.tsx'teki onAuthStateChanged tetiklenecek, burada
      // ekstra bir şey yapmaya gerek yok.
    } catch (err: any) {
      setError(translateAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          name: cred.user.displayName || '',
          email: cred.user.email || '',
          avatar: cred.user.photoURL || null,
        },
        { merge: true }
      );
    } catch (err: any) {
      setError(translateAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setError('Şifre sıfırlamak için önce e-posta adresinizi yazın.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
    } catch (err: any) {
      setError(translateAuthError(err?.code || ''));
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] aspect-square bg-sky-200 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] aspect-square bg-teal-200 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-[420px] z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 uppercase">Mübarekçe</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">PRO+ İSLAMİ YAŞAM REHBERİ</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#f0f9ff] rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_60px_-12px_rgba(0,163,255,0.1)] border border-sky-100/50 relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-full h-full pointer-events-none opacity-[0.03] flex items-end justify-center">
            <svg width="100%" height="55%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" fill="currentColor" className="text-sky-900">
              <path d="M0,100 L100,100 L100,85 Q80,75 70,85 L70,100 Z" />
              <path d="M30,85 Q50,45 70,85 L70,100 L30,100 Z" />
              <path d="M48,45 L52,45 L50,40 Z" />
              <rect x="22" y="55" width="4" height="45" rx="1" />
              <path d="M21,55 L27,55 L24,48 Z" />
              <rect x="74" y="55" width="4" height="45" rx="1" />
              <path d="M73,55 L79,55 L76,48 Z" />
              <path d="M5,100 L25,100 L25,90 Q15,80 5,90 Z" />
              <path d="M75,100 L95,100 L95,90 Q85,80 75,90 Z" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex bg-sky-100/50 p-1.5 rounded-[1.2rem] mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setInfoMsg(null); }}
                className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${isLogin ? 'bg-white dark:bg-slate-900 text-sky-900 shadow-sm scale-100' : 'text-sky-400 scale-95'}`}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setInfoMsg(null); }}
                className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${!isLogin ? 'bg-white dark:bg-slate-900 text-sky-900 shadow-sm scale-100' : 'text-sky-400 scale-95'}`}
              >
                Kayıt
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 text-red-600 text-[11px] font-bold text-center">
                {error}
              </div>
            )}
            {infoMsg && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-100 text-teal-700 text-[11px] font-bold text-center">
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-sky-400 ml-4 uppercase tracking-widest">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Muhammed Ali"
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-sky-400 ml-4 uppercase tracking-widest">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@vakitler.com"
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-4 mr-1">
                  <label className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Şifre</label>
                  {isLogin && (
                    <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-teal-600 uppercase tracking-widest">
                      Unuttum
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-black py-3.5 rounded-[1.5rem] shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all mt-4 uppercase tracking-[0.2em] text-[11px]"
              >
                {loading ? 'Lütfen bekleyin...' : isLogin ? 'Oturum Aç' : 'Hesap Oluştur'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-sky-100 text-center">
              <p className="text-[8px] text-sky-300 font-black mb-4 uppercase tracking-[0.3em]">Hızlı Bağlan</p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-5 rounded-xl bg-white dark:bg-slate-900 border border-sky-100 hover:bg-sky-50 dark:bg-sky-950/20 hover:shadow-sm transition-all group disabled:opacity-60"
                >
                  <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 group-hover:text-teal-900 uppercase tracking-widest">Google ile devam et</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-300 dark:text-slate-600 text-[8px] mt-8 uppercase tracking-[0.3em] font-black">
          © 2025 Mübarekçe Pro+
        </p>
      </div>
    </div>
  );
};

export default Auth;
