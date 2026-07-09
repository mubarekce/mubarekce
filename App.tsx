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
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 35%, #1c4739 0%, #123328 35%, #0a1f1a 65%, #06140f 100%)',
        }}
      >
        <div className="w-10 h-10 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !firebaseUser) {
    return <Auth />;
  }

  return (
    <UserDataProvider uid={firebaseUser.uid}>
      <div
        className="min-h-screen w-full flex flex-col relative"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 30%, #1c4739 0%, #123328 35%, #0a1f1a 65%, #06140f 100%)',
        }}
      >
        {/* Uygulamanın standart teması: koyu yeşil zeminde ortadan yayılan ışık degradesi + altın geometrik desen */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* İnce altın geometrik desen */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23c9a668' stroke-width='1'%3E%3Cpath d='M28 4 L34 16 L46 10 L40 22 L52 28 L40 34 L46 46 L34 40 L28 52 L22 40 L10 46 L16 34 L4 28 L16 22 L10 10 L22 16 Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '56px 56px',
            }}
          />
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
            <Profile user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1f1a]/90 backdrop-blur-xl border-t border-gold-500/10 px-2 pb-safe">
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
                    isActive ? 'text-[#c9a668]' : 'text-slate-400'
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
