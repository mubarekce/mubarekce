import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './src/firebase';
import { User, AppTab, LocationData, PrayerTimes, HijriDate } from './src/types';
import { resetAllScroll } from './src/utils/scrollReset';
import { fetchPrayerTimes } from './src/services/prayerService';
import { UserDataProvider } from './src/contexts/UserDataContext';

import Auth from './src/components/Auth';
import Home from './src/components/Home';
import Library from './src/components/Library';
import Worship from './src/components/Worship';
import Social from './src/components/Social';
import Profile from './src/components/Profile';

// --- Bottom Navigation Icons ---
const NAV_ITEMS: { tab: AppTab; label: string; icon: string }[] = [
  { tab: AppTab.Home, label: 'Anasayfa', icon: '🏠' },
  { tab: AppTab.Library, label: 'Kütüphane', icon: '📚' },
  { tab: AppTab.Worship, label: 'İbadet', icon: '🕌' },
  { tab: AppTab.Social, label: 'Kardeşlik', icon: '🤝' },
  { tab: AppTab.Profile, label: 'Profil', icon: '👤' },
];

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Home);
  const mainScrollRef = useRef<HTMLElement>(null);

  // Sekme değiştiğinde sayfayı her zaman en üstten aç
  useEffect(() => {
    resetAllScroll();
    // Bazı içerikler bir sonraki render'da yerleşiyor, o yüzden bir kare sonra da tekrar dene
    const id = requestAnimationFrame(resetAllScroll);
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [prayerData, setPrayerData] = useState<{ times: PrayerTimes; hijri: HijriDate; city: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');

  // --- Gerçek Firebase Authentication oturum takibi ---
  // Uygulama açıldığında (ve her giriş/çıkışta) Firebase otomatik olarak
  // bu dinleyiciyi tetikler. Böylece kullanıcı uygulamayı kapatıp açsa
  // bile (token cihazda saklandığı için) tekrar giriş yapmasına gerek kalmaz.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Firestore'daki profil belgesini (isim, avatar) gerçek zamanlı dinle ---
  useEffect(() => {
    if (!firebaseUser) return;
    // Admin panelinin kullanıcı listesinde e-posta görünebilsin diye bir kere yazıyoruz
    setDoc(doc(db, 'users', firebaseUser.uid), { email: firebaseUser.email }, { merge: true }).catch(() => {});
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      profileRef,
      (snap) => {
        const profile = snap.exists() ? snap.data() : {};
        setUser({
          uid: firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
          email: firebaseUser.email || '',
          isLoggedIn: true,
          avatar: profile.avatar || firebaseUser.photoURL || undefined,
          bio: profile.bio || '',
        });
        setAuthChecked(true);
      },
      (err) => {
        console.error('Profil bilgisi alınamadı:', err);
        setAuthChecked(true);
      }
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  // --- Dark mode class'ını <html> köküne uygula (cihaza özel bir görsel tercih olduğu için localStorage'da kalıyor) ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // --- Saati her saniye güncelle ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Konum al ve namaz vakitlerini çek ---
  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const data = await fetchPrayerTimes(latitude, longitude);
          setLocation({ city: data.city, country: '', latitude, longitude });
          setPrayerData(data);
        } catch (err) {
          console.error('Namaz vakitleri alınamadı:', err);
        }
      },
      (err) => console.error('Konum alınamadı:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (user) updateLocation();
  }, [user, updateLocation]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab(AppTab.Home);
  };

  const handleUpdateUser = async (updated: User) => {
    setUser(updated);
    if (!firebaseUser) return;
    try {
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { name: updated.name, avatar: updated.avatar || null, bio: updated.bio || '' },
        { merge: true }
      );
      await updateProfile(firebaseUser, {
        displayName: updated.name,
        photoURL: updated.avatar || null,
      });
    } catch (err) {
      console.error('Profil güncellenemedi:', err);
    }
  };

  const handleTabAction = (tab: string) => setActiveTab(tab as AppTab);

  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f7e9] dark:bg-[#0a1f1a]">
        <div className="w-10 h-10 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !firebaseUser) {
    return <Auth />;
  }

  return (
    <UserDataProvider uid={firebaseUser.uid}>
      <div className="min-h-screen w-full flex flex-col bg-[#f3f7e9] dark:bg-[#0a1f1a] relative transition-colors duration-700">
        {/* Tüm uygulamanın arkaplanında sabit tema öğeleri - referans görseldeki cami temasına uygun */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* İnce altın geometrik desen */}
          <div
            className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23c9a668' stroke-width='1'%3E%3Cpath d='M28 4 L34 16 L46 10 L40 22 L52 28 L40 34 L46 46 L34 40 L28 52 L22 40 L10 46 L16 34 L4 28 L16 22 L10 10 L22 16 Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '56px 56px',
            }}
          />

          {/* Sol üst - altın fener süslemesi */}
          <svg className="absolute -top-1 left-3 w-9 h-24 opacity-[0.22] dark:opacity-40 text-gold-500" viewBox="0 0 40 100" fill="none" stroke="currentColor" strokeWidth="1.3">
            <line x1="20" y1="0" x2="20" y2="14" />
            <circle cx="20" cy="16" r="2.5" />
            <path d="M12 20 L28 20 L24 30 L16 30 Z" />
            <rect x="10" y="30" width="20" height="34" rx="3" />
            <line x1="10" y1="40" x2="30" y2="40" />
            <line x1="10" y1="54" x2="30" y2="54" />
            <path d="M13 64 L27 64 L20 76 Z" />
          </svg>

          {/* Sağ üst - altın fener süslemesi (ayna) */}
          <svg className="absolute -top-1 right-3 w-9 h-24 opacity-[0.22] dark:opacity-40 text-gold-500" viewBox="0 0 40 100" fill="none" stroke="currentColor" strokeWidth="1.3">
            <line x1="20" y1="0" x2="20" y2="14" />
            <circle cx="20" cy="16" r="2.5" />
            <path d="M12 20 L28 20 L24 30 L16 30 Z" />
            <rect x="10" y="30" width="20" height="34" rx="3" />
            <line x1="10" y1="40" x2="30" y2="40" />
            <line x1="10" y1="54" x2="30" y2="54" />
            <path d="M13 64 L27 64 L20 76 Z" />
          </svg>

          {/* Alt kısım - referans görseldeki adaçayı yeşili kavis, ekranın en altında sabit */}
          <svg
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] max-w-none h-[26vh] opacity-[0.16] dark:opacity-[0.22]"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="appSageGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6b8a3c" />
                <stop offset="100%" stopColor="#b9d17e" />
              </linearGradient>
            </defs>
            <path d="M0 90 Q200 10 400 90 L400 200 L0 200 Z" fill="url(#appSageGrad)" />
          </svg>

          {/* Alt kısım - hafif hareketli beyaz/altın cami silüeti (gölge gibi, çok sönük) */}
          <div className="absolute inset-x-0 bottom-0 h-[42vh] overflow-hidden opacity-[0.05] dark:opacity-[0.09]">
            <svg
              className="mosque-silhouette absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] max-w-none text-gold-500 dark:text-white"
              viewBox="0 0 800 260"
              fill="currentColor"
              preserveAspectRatio="xMidYMax slice"
            >
              {/* Ana kubbe ve gövde */}
              <path d="M330 130 Q400 40 470 130 L470 260 L330 260 Z" />
              <path d="M392 40 L408 40 L400 20 Z" />
              <circle cx="400" cy="16" r="4" />
              {/* Sol minare */}
              <rect x="255" y="70" width="12" height="190" rx="2" />
              <path d="M251 70 L271 70 L261 40 Z" />
              <circle cx="261" cy="34" r="3" />
              {/* Sağ minare */}
              <rect x="533" y="70" width="12" height="190" rx="2" />
              <path d="M529 70 L549 70 L539 40 Z" />
              <circle cx="539" cy="34" r="3" />
              {/* Uzak sol minare (derinlik) */}
              <rect x="150" y="120" width="9" height="140" rx="2" />
              <path d="M147 120 L162 120 L154.5 98 Z" />
              {/* Uzak sağ minare (derinlik) */}
              <rect x="641" y="120" width="9" height="140" rx="2" />
              <path d="M638 120 L653 120 L645.5 98 Z" />
              {/* Yan küçük kubbeler */}
              <path d="M175 190 Q205 155 235 190 L235 260 L175 260 Z" />
              <path d="M565 190 Q595 155 625 190 L625 260 L565 260 Z" />
              {/* Zemin gölgesi */}
              <rect x="60" y="256" width="680" height="4" rx="2" opacity="0.5" />
            </svg>
          </div>
        </div>

        <main id="app-main-scroll" ref={mainScrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-24">
          {activeTab === AppTab.Home && (
            <Home user={user} prayerData={prayerData} currentTime={currentTime} onAction={handleTabAction} />
          )}
          {activeTab === AppTab.Library && <Library location={location} user={user} />}
          {activeTab === AppTab.Worship && (
            <Worship location={location} prayerData={prayerData} onUpdateLocation={updateLocation} />
          )}
          {activeTab === AppTab.Social && <Social user={user} />}
          {activeTab === AppTab.Profile && (
            <Profile user={user} onUpdateUser={handleUpdateUser} isDark={isDark} setIsDark={setIsDark} onLogout={handleLogout} />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#f3f7e9]/90 dark:bg-[#0a1f1a]/90 backdrop-blur-xl border-t border-gold-200/40 dark:border-gold-500/10 px-2 pb-safe">
          <div className="flex items-center justify-between max-w-lg mx-auto px-2 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    window.dispatchEvent(new Event('resetLibraryView'));
                  }}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl transition-all ${
                    isActive ? 'text-[#a8895a] dark:text-[#c9a668]' : 'text-slate-400'
                  }`}
                >
                  <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </UserDataProvider>
  );
};

export default App;
