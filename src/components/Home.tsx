
import React, { useState, useMemo, useEffect } from 'react';
import { User, PrayerTimes, HijriDate, AppTab, PrayerStatus } from '../types';
import { resetAllScroll } from '../utils/scrollReset';
import StoryViewer from './StoryViewer';
import PrayerCard from './PrayerCard';
import SpiritualGarden from './SpiritualGarden';
import { useUserData } from '../contexts/UserDataContext';

interface HomeProps {
  user: User;
  prayerData: { times: PrayerTimes; hijri: HijriDate; city: string } | null;
  currentTime: Date;
  onAction: (tab: string) => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center gap-4 py-2 relative z-10">
    <div className="flex items-center gap-1.5 opacity-20 dark:opacity-30">
      <div className="w-8 h-[1px] bg-slate-900 dark:bg-white"></div>
      <div className="w-1 h-1 rotate-45 border border-slate-900 dark:border-white"></div>
    </div>
    <h3 className="text-[10px] font-black text-slate-900/30 dark:text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">
      {title}
    </h3>
    <div className="flex items-center gap-1.5 opacity-20 dark:opacity-30">
      <div className="w-1 h-1 rotate-45 border border-slate-900 dark:border-white"></div>
      <div className="w-8 h-[1px] bg-slate-900 dark:bg-white"></div>
    </div>
  </div>
);

const Home: React.FC<HomeProps> = ({ user, prayerData, currentTime, onAction }) => {
  const { getField, data } = useUserData();
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'story'>('none');

  useEffect(() => {
    resetAllScroll();
    const id = requestAnimationFrame(resetAllScroll);
    return () => cancelAnimationFrame(id);
  }, [activeOverlay]);

  const dateKey = currentTime.toDateString();

  const goToLibraryTool = (viewId: string) => {
    localStorage.setItem('goto_library_view', viewId);
    onAction(AppTab.Library);
  };

  const openTodayStory = () => {
    setActiveOverlay('story');
    if (window.navigator.vibrate) window.navigator.vibrate(40);
  };

  // Sıradaki vakti hesaplayan logic (mevcut Home mantığından korunmuştur)
  const nextPrayer = useMemo(() => {
    if (!prayerData) return null;
    const times = prayerData.times;
    const order = [
      { name: 'İmsak', time: times.Fajr },
      { name: 'Güneş', time: times.Sunrise },
      { name: 'Öğle', time: times.Dhuhr },
      { name: 'İkindi', time: times.Asr },
      { name: 'Akşam', time: times.Maghrib },
      { name: 'Yatsı', time: times.Isha },
    ];

    const currentStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });

    const next = order.find(p => p.time > currentStr) || order[0];
    return next;
  }, [prayerData, currentTime]);

  // PrayerCard için günün 6 vakti (mevcut PrayerCard component'i kullanılıyor)
  const prayerList = useMemo(() => {
    if (!prayerData) return [];
    const times = prayerData.times;
    return [
      { name: 'İmsak', time: times.Fajr, icon: '🌅' },
      { name: 'Güneş', time: times.Sunrise, icon: '☀️' },
      { name: 'Öğle', time: times.Dhuhr, icon: '🌤️' },
      { name: 'İkindi', time: times.Asr, icon: '🌥️' },
      { name: 'Akşam', time: times.Maghrib, icon: '🌙' },
      { name: 'Yatsı', time: times.Isha, icon: '✨' },
    ];
  }, [prayerData]);

  // SpiritualGarden skoru: Worship.tsx'teki mevcut puanlama mantığı, aynı
  // UserDataContext alanları okunarak burada da uygulanıyor (yeni component/veri
  // yok, sadece mevcut alanlar okunuyor).
  const gardenScore = useMemo(() => {
    const prayerStatuses = getField(`prayers_${dateKey}`, {} as Record<string, PrayerStatus>);
    const completedHabits = getField(`habits_${dateKey}`, [] as string[]);
    const namazDebts = getField('kaza_namaz', { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 } as Record<string, number>);
    const kazaOruc = getField('kaza_oruc', null as { ramadan?: number; kaffarah?: number } | null);

    const totalKaza = (Object.values(namazDebts) as number[]).reduce((acc, val) => acc + val, 0);
    const totalOruc = kazaOruc ? (kazaOruc.ramadan || 0) + (kazaOruc.kaffarah || 0) : 0;

    const prayerPoints = (Object.values(prayerStatuses) as PrayerStatus[]).reduce((acc: number, status: PrayerStatus) => {
      if (status === 'congregation') return acc + 12;
      if (status === 'done') return acc + 10;
      if (status === 'late') return acc + 5;
      if (status === 'missed') return acc - 10;
      return acc;
    }, 0);

    const habitPoints = completedHabits.length * 8;
    const kazaPenalty = Math.min(40, (totalKaza * 0.5) + (totalOruc * 2));
    const rawScore = 50 + prayerPoints + habitPoints - kazaPenalty;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }, [data, dateKey]);

  // "Kaldığın yerden devam et" - QuranReader.tsx'te zaten kullanılan
  // 'quran_last_read' alanı okunuyor; yoksa placeholder gösteriliyor.
  const lastRead = getField('quran_last_read', null as { surah: number; ayah: number } | null);

  if (activeOverlay === 'story') {
    return <StoryViewer category={'AYET'} onClose={() => setActiveOverlay('none')} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-36 pt-6 space-y-6 animate-in fade-in duration-700 no-scrollbar relative">

      {/* Selamlama */}
      <div className="px-1 relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-500 dark:text-slate-400 italic">
          Selam, <span className="text-slate-900 dark:text-white font-black not-italic">{user.name.split(' ')[0]}</span>
        </h2>
      </div>

      {/* 1. PRAYER CARD - Vakit Listesi */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="VAKİTLER" />
        <div className="space-y-2.5">
          {prayerList.map((p) => (
            <PrayerCard
              key={p.name}
              name={p.name}
              time={p.time}
              icon={p.icon}
              isActive={nextPrayer?.name === p.name}
            />
          ))}
        </div>
      </div>

      {/* 2. SPIRITUAL GARDEN */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="MANEVİ BAHÇEN" />
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2rem] border border-teal-100 dark:border-teal-900/40 shadow-[0_8px_30px_rgba(17,94,89,0.04)] overflow-hidden">
          <SpiritualGarden score={gardenScore} />
        </div>
      </div>

      {/* 3. STORY VIEWER - Bugün Kartı */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="BUGÜN" />
        <div
          onClick={openTodayStory}
          className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 rounded-[2rem] p-6 flex items-center justify-between border border-teal-800/50 shadow-[0_12px_30px_-8px_rgba(17,94,89,0.4)] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">✨</div>
            <div>
              <h4 className="text-white font-black text-lg tracking-tight leading-none">Bugünün Hikayesi</h4>
              <p className="text-teal-300 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">Dokun ve Keşfet</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      {/* 4. KALDIĞIN YERDEN DEVAM ET */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="KALDIĞIN YERDEN DEVAM ET" />
        <div
          onClick={() => goToLibraryTool('quran')}
          className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2rem] p-6 flex items-center justify-between border border-sky-100 dark:border-sky-900/40 shadow-[0_8px_30px_rgba(2,132,199,0.04)] cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/30 rounded-2xl flex items-center justify-center text-2xl border border-sky-100 dark:border-sky-900/40">📖</div>
            <div>
              {lastRead ? (
                <>
                  <p className="text-[8px] font-black uppercase tracking-widest text-sky-500 mb-0.5">OKUMAYA DEVAM ET</p>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{lastRead.surah}. Sure, {lastRead.ayah}. Ayet</h4>
                </>
              ) : (
                <>
                  <p className="text-[8px] font-black uppercase tracking-widest text-sky-500 mb-0.5">HENÜZ BAŞLAMADIN</p>
                  <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm">Kur'an okumaya başladığında burada devam edebilirsin.</h4>
                </>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-sky-600 text-sm font-bold">→</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
