
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
    <div className="min-h-screen w-full bg-[#fcfdfd] dark:bg-slate-950 flex flex-col justify-center items-center px-5 py-8 relative overflow-hidden">
      {/* Ana menüyle uyumlu yumuşak, premium arka plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-100/70 dark:bg-emerald-950/30 blur-3xl" />
        <div className="absolute top-1/3 -left-28 w-80 h-80 rounded-full bg-amber-100/60 dark:bg-amber-950/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-emerald-50 dark:bg-emerald-950/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg z-10 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-premium via-emerald-900 to-slate-950 flex items-center justify-center border border-amber-300/30 shadow-[0_18px_40px_-14px_rgba(6,78,59,0.55)] text-4xl animate-subtle">
            🕌
          </div>
          <div>
            <p className="text-[9px] font-black text-emerald-premium dark:text-emerald-300 uppercase tracking-[0.35em] mb-2">PRO+ İSLAMİ YAŞAM REHBERİ</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Mübarekçe</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-3">Manevi yolculuğuna kaldığın yerden devam et.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-emerald-100 dark:border-emerald-900/40 shadow-[0_8px_30px_rgba(6,78,59,0.08)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-premium via-emerald-700 to-gold-accent" />
          <div className="absolute right-[-3rem] top-[-3rem] w-36 h-36 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 blur-2xl pointer-events-none" />
          <div className="absolute left-[-2rem] bottom-[-3rem] w-32 h-32 rounded-full bg-amber-100/50 dark:bg-amber-900/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex bg-slate-100/80 dark:bg-slate-950/70 p-1.5 rounded-[1.4rem] mb-6 border border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setInfoMsg(null); }}
                className={`flex-1 py-3 text-[10px] font-black rounded-[1rem] transition-all uppercase tracking-widest ${isLogin ? 'bg-white dark:bg-slate-900 text-emerald-premium dark:text-emerald-300 shadow-sm scale-100' : 'text-slate-400 scale-95'}`}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setInfoMsg(null); }}
                className={`flex-1 py-3 text-[10px] font-black rounded-[1rem] transition-all uppercase tracking-widest ${!isLogin ? 'bg-white dark:bg-slate-900 text-emerald-premium dark:text-emerald-300 shadow-sm scale-100' : 'text-slate-400 scale-95'}`}
              >
                Kayıt
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-300 text-[11px] font-bold text-center">
                {error}
              </div>
            )}
            {infoMsg && (
              <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-premium dark:text-emerald-300 text-[11px] font-bold text-center">
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-emerald-premium dark:text-emerald-300 ml-4 uppercase tracking-widest">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Muhammed Ali"
                    className="w-full bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-emerald-premium focus:border-emerald-300 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm placeholder:text-slate-300"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-emerald-premium dark:text-emerald-300 ml-4 uppercase tracking-widest">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@vakitler.com"
                  className="w-full bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-emerald-premium focus:border-emerald-300 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-4 mr-1">
                  <label className="text-[9px] font-black text-emerald-premium dark:text-emerald-300 uppercase tracking-widest">Şifre</label>
                  {isLogin && (
                    <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-emerald-premium dark:text-emerald-300 uppercase tracking-widest hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors">
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
                  className="w-full bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-emerald-premium focus:border-emerald-300 transition-all outline-none font-bold text-slate-900 dark:text-white shadow-sm placeholder:text-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-emerald-premium via-emerald-900 to-slate-950 hover:from-emerald-800 hover:via-emerald-900 hover:to-slate-900 disabled:opacity-60 text-white font-black py-4 rounded-[1.5rem] shadow-[0_12px_30px_-8px_rgba(6,78,59,0.45)] active:scale-[0.98] transition-all mt-4 uppercase tracking-[0.2em] text-[11px] border border-amber-300/20"
              >
                {loading ? 'Lütfen bekleyin...' : isLogin ? 'Oturum Aç' : 'Hesap Oluştur'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black mb-4 uppercase tracking-[0.3em]">Hızlı Bağlan</p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:shadow-sm transition-all group disabled:opacity-60"
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 group-hover:text-emerald-premium dark:group-hover:text-emerald-200 uppercase tracking-widest">Google ile devam et</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-300 dark:text-slate-600 text-[8px] uppercase tracking-[0.3em] font-black">
          © 2026 Mübarekçe Pro+
        </p>
      </div>
    </div>
  );
};

export default Auth;
