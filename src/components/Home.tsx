
import React, { useState, useMemo, useEffect } from 'react';
import { User, PrayerTimes, HijriDate, AppTab } from '../types';
import { resetAllScroll } from '../utils/scrollReset';
import AISor from './AISor';
import MosqueMap from './MosqueMap';
import StoryViewer from './StoryViewer';
import { useUserData } from '../contexts/UserDataContext';
import { SHORTCUT_CATALOG, DEFAULT_SHORTCUT_IDS, MAX_SHORTCUTS, MIN_SHORTCUTS } from '../data/homeShortcuts';

interface HomeProps {
  user: User;
  prayerData: { times: PrayerTimes; hijri: HijriDate; city: string } | null;
  currentTime: Date;
  onAction: (tab: string) => void;
}

// 30 Günlük Mock İmsakiye Verisi
const FULL_IMSAKIYE = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  date: `${i + 1} Ramazan`,
  imsak: "05:24",
  gunes: "06:52",
  ogle: "13:12",
  ikindi: "16:45",
  aksam: "19:24",
  yatsi: "20:48"
}));

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
  const { getField, setField, data } = useUserData();
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'ai' | 'camiler' | 'story'>('none');
  const [showShortcutEditor, setShowShortcutEditor] = useState(false);
  const [spiritTab, setSpiritTab] = useState<'ayet' | 'hadis' | 'dua'>('ayet');
  const [selectedShortcutIds, setSelectedShortcutIds] = useState<string[]>(() =>
    getField('home_shortcuts', DEFAULT_SHORTCUT_IDS)
  );

  useEffect(() => {
    const remote = data['home_shortcuts'];
    if (Array.isArray(remote)) setSelectedShortcutIds(remote);
  }, [data['home_shortcuts']]);

  const toggleShortcut = (id: string) => {
    setSelectedShortcutIds((prev) => {
      const isSelected = prev.includes(id);
      let next: string[];
      if (isSelected) {
        if (prev.length <= MIN_SHORTCUTS) return prev; // en az MIN_SHORTCUTS kalsın
        next = prev.filter((s) => s !== id);
      } else {
        if (prev.length >= MAX_SHORTCUTS) return prev; // en fazla MAX_SHORTCUTS
        next = [...prev, id];
      }
      setField('home_shortcuts', next);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      return next;
    });
  };

  const activeShortcuts = useMemo(
    () => selectedShortcutIds
      .map((id) => SHORTCUT_CATALOG.find((s) => s.id === id))
      .filter((s): s is typeof SHORTCUT_CATALOG[number] => !!s),
    [selectedShortcutIds]
  );

  useEffect(() => {
    resetAllScroll();
    const id = requestAnimationFrame(resetAllScroll);
    return () => cancelAnimationFrame(id);
  }, [activeOverlay]);
  const [activeStoryCategory, setActiveStoryCategory] = useState<string | null>(null);
  const [showImsakiyeModal, setShowImsakiyeModal] = useState(false);

  // Zikirmatik'ten güncel serbest zikir sayısını çekiyoruz (artık Firestore'dan,
  // böylece başka bir cihazda yapılan zikir de burada anında görünür)
  const [currentDhikrCount, setCurrentDhikrCount] = useState(() => Number(getField('serbest_count', 0)));

  useEffect(() => {
    setCurrentDhikrCount(Number(data['serbest_count'] || 0));
  }, [data['serbest_count']]);

  const goToLibraryTool = (viewId: string) => {
    localStorage.setItem('goto_library_view', viewId);
    onAction(AppTab.Library);
  };

  const handleZikirClick = () => goToLibraryTool('zikir');

  const openStory = (category: string) => {
    setActiveStoryCategory(category);
    setActiveOverlay('story');
    if (window.navigator.vibrate) window.navigator.vibrate(40);
  };

  // Sıradaki vakti ve geri sayımı hesaplayan logic
  const prayerInfo = useMemo(() => {
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

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();

    let nextIndex = order.findIndex(p => toMinutes(p.time) > nowMinutes);
    if (nextIndex === -1) nextIndex = 0; // gece yarısından sonra -> yarının İmsak'ı
    const prevIndex = (nextIndex - 1 + order.length) % order.length;

    const next = order[nextIndex];
    const prev = order[prevIndex];

    let diffSeconds = toMinutes(next.time) * 60 - (nowMinutes * 60 + nowSeconds);
    if (diffSeconds < 0) diffSeconds += 24 * 60 * 60;

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    // İki vakit arasında geçen sürenin yüzdesi (ilerleme çubuğu için)
    let intervalMinutes = toMinutes(next.time) - toMinutes(prev.time);
    if (intervalMinutes <= 0) intervalMinutes += 24 * 60;
    let elapsedMinutes = nowMinutes - toMinutes(prev.time);
    if (elapsedMinutes < 0) elapsedMinutes += 24 * 60;
    const progress = Math.min(100, Math.max(0, (elapsedMinutes / intervalMinutes) * 100));

    return { next, prev, hours, minutes, progress };
  }, [prayerData, currentTime]);

  const nextPrayer = prayerInfo?.next || null;

  const countdownText = useMemo(() => {
    if (!prayerInfo) return '';
    const { hours, minutes } = prayerInfo;
    if (hours > 0) return `${hours} sa ${minutes} dk kaldı`;
    if (minutes > 0) return `${minutes} dk kaldı`;
    return 'Vakit giriyor';
  }, [prayerInfo]);

  if (activeOverlay === 'ai') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#faf6f0] dark:bg-[#0d1220] relative animate-in fade-in zoom-in duration-300">
        <div className="absolute top-12 left-6 z-50">
          <button onClick={() => setActiveOverlay('none')} className="w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">←</button>
        </div>
        <AISor />
      </div>
    );
  }

  if (activeOverlay === 'camiler') {
    return <MosqueMap onBack={() => setActiveOverlay('none')} />;
  }

  if (activeOverlay === 'story' && activeStoryCategory) {
    return <StoryViewer category={activeStoryCategory} onClose={() => setActiveOverlay('none')} />;
  }

  const stories = [
    { 
      label: 'AYET', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ), 
      color: 'border-[#c9a668]/70',
      glow: 'shadow-[0_0_15px_rgba(201,166,104,0.35)]',
      iconColor: 'text-[#a8895a] dark:text-[#c9a668]'
    },
    { 
      label: 'HADİS', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      ), 
      color: 'border-[#1c2541]/40 dark:border-[#c9a668]/40',
      glow: 'shadow-[0_0_15px_rgba(28,37,65,0.25)]',
      iconColor: 'text-[#1c2541] dark:text-[#c9a668]'
    },
    { 
      label: 'DUA', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 12V6.5a1.5 1.5 0 0 1 3 0V11"></path>
          <path d="M10 11V5a1.5 1.5 0 0 1 3 0v6"></path>
          <path d="M13 11V6.5a1.5 1.5 0 0 1 3 0V12"></path>
          <path d="M4 12c0 5 3.5 9 8 9s8-4 8-9"></path>
        </svg>
      ), 
      color: 'border-[#c9a668]/50',
      glow: 'shadow-[0_0_15px_rgba(201,166,104,0.3)]',
      iconColor: 'text-[#a8895a] dark:text-[#c9a668]'
    },
    { 
      label: 'SÜNNET', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ), 
      color: 'border-[#1c2541]/30 dark:border-[#c9a668]/30',
      glow: 'shadow-[0_0_15px_rgba(28,37,65,0.2)]',
      iconColor: 'text-[#1c2541]/80 dark:text-[#c9a668]/90'
    },
    { 
      label: 'AI HOCAM', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          <path d="M12 7v5l3 3"></path>
        </svg>
      ), 
      color: 'border-[#c9a668]',
      glow: 'shadow-[0_0_18px_rgba(201,166,104,0.5)]',
      iconColor: 'text-[#a8895a] dark:text-[#c9a668]',
      special: true 
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-36 pt-2 space-y-6 animate-in fade-in duration-700 no-scrollbar relative">
      
      {/* BACKGROUND DECORATIVE LAYERS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* 1. İslami Geometrik Yıldız Deseni (sekiz kollu yıldız motifi) */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] transition-opacity duration-1000"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23c9a668' stroke-width='1'%3E%3Cpath d='M28 4 L34 16 L46 10 L40 22 L52 28 L40 34 L46 46 L34 40 L28 52 L22 40 L10 46 L16 34 L4 28 L16 22 L10 10 L22 16 Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* 2. Top Ambient Glow - sıcak altın tonu */}
        <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#c9a668]/15 blur-[110px] rounded-full pointer-events-none z-0" />

        {/* 3. Bottom Ambient Glow - derin lacivert huzur tonu */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#1c2541]/10 dark:bg-[#c9a668]/5 blur-[110px] rounded-full transition-all duration-1000" />
      </div>

      {/* Ay-yıldız süslemesi - üstte ince bir manevi ayraç */}
      <div className="flex items-center justify-center gap-3 relative z-10 mb-0">
        <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#c9a668]/50" />
        <span className="text-[#c9a668] text-sm">☾</span>
        <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#c9a668]/50" />
      </div>

      {/* MAIN CARD - Artık uygulamanın genel fildişi/lacivert huzur temasıyla aynı, ayrı bir renk bloğu değil */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-[#141a2c]/70 backdrop-blur-xl text-slate-900 dark:text-[#f3ede0] shadow-[0_10px_30px_-15px_rgba(13,18,32,0.15)] border border-[#c9a668]/20 dark:border-[#c9a668]/10 z-10 transition-transform duration-300 active:scale-[0.99]">
        
        {/* Mosque Background Silhouette - altın tonuyla, çok sönük */}
        <div className="absolute right-[-15px] bottom-2 opacity-[0.05] pointer-events-none transition-all duration-1000">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor" className="text-[#c9a668]">
            <path d="M30 65 Q50 35 70 65 L70 95 L30 95 Z" />
            <path d="M48 35 L52 35 L50 30 Z" />
            <rect x="22" y="45" width="4" height="50" rx="1" />
            <path d="M21 45 L27 45 L24 38 Z" />
            <rect x="74" y="45" width="4" height="50" rx="1" />
            <path d="M73 45 L79 45 L76 38 Z" />
            <circle cx="50" cy="27" r="2" />
          </svg>
        </div>
        
        {/* Top Info Section - kompakt */}
        <div className="p-5 pb-3 relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-0">
              <h1 className="text-[2.6rem] font-black tracking-tighter leading-none text-slate-900 dark:text-white">
                {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-[10px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase tracking-[0.2em] mt-1">
                {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
              </p>
            </div>
            
            {/* Sade ay rozeti - Hicri tarihin tam hali aşağıdaki kutuda */}
            <div className="w-11 h-11 rounded-2xl bg-[#c9a668]/10 border border-[#c9a668]/20 flex items-center justify-center text-lg shadow-sm shrink-0">
              🌙
            </div>
          </div>

          <div className="mt-3 mb-4">
            <h2 className="text-base font-bold tracking-tight text-slate-500 dark:text-slate-400 italic">Selam, <span className="text-slate-900 dark:text-white font-black not-italic">{user.name.split(' ')[0]}</span></h2>
          </div>
          
          {/* SIRADAKİ VAKİT - Geri Sayımlı Ana Panel */}
          <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#1c2541] to-[#0d1220] p-4 mb-2.5 shadow-lg shadow-black/10">
            <div className="absolute right-[-10px] top-[-14px] text-6xl opacity-[0.08] pointer-events-none select-none">🕌</div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[8px] font-black uppercase text-[#c9a668]/80 tracking-[0.25em] mb-1">SIRADAKİ VAKİT</p>
                <p className="text-xl font-black text-white leading-none">{nextPrayer?.name || 'Vakit'}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] mb-1">EZAN SAATİ</p>
                <p className="text-lg font-black text-[#c9a668] tabular-nums leading-none">{nextPrayer?.time || '--:--'}</p>
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c9a668] to-[#e4cd94] transition-all duration-1000"
                  style={{ width: `${prayerInfo?.progress ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] font-black text-white mt-2 text-center tracking-wide">
                {nextPrayer?.name || 'Vakte'} vaktine <span className="text-[#c9a668]">{countdownText}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-1">
             {/* ZIKIR BOX */}
             <div className="bg-slate-50/80 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5 cursor-pointer active:scale-95 transition-transform" onClick={handleZikirClick}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[#a8895a] dark:text-[#c9a668] text-[11px]">📿</span>
                  <p className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">ZİKİR</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-[13px] font-black text-slate-900 dark:text-white">{currentDhikrCount}</p>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500">/ 99</p>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                   <div 
                    className="h-full bg-[#c9a668] transition-all duration-700" 
                    style={{ width: `${Math.min(100, (currentDhikrCount / 99) * 100)}%` }}
                   ></div>
                </div>
             </div>

             {/* HICRI TARIH BOX (üstten taşındı, ana kart artık tek satır başlık) */}
             <div className="bg-slate-50/80 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[#a8895a] dark:text-[#c9a668] text-[11px]">🌙</span>
                  <p className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">HİCRİ TARİH</p>
                </div>
                <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">
                  {prayerData?.hijri.day} {prayerData?.hijri.month.tr}
                </p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{prayerData?.hijri.year}</p>
             </div>
          </div>
        </div>

        {/* Integrated Imsakiye Section */}
        <div className="bg-slate-50/60 dark:bg-black/10 border-t border-slate-100 dark:border-white/5 p-3">
           <div className="grid grid-cols-3 gap-1">
              <div className="text-center py-0.5">
                 <p className="text-[6.5px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase mb-0.5 tracking-widest">İMSAK</p>
                 <p className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums">{prayerData?.times.Fajr || '--:--'}</p>
              </div>
              <div className="text-center py-0.5 border-x border-slate-200 dark:border-white/5 px-2">
                 <p className="text-[6.5px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase mb-0.5 tracking-widest">GÜNEŞ</p>
                 <p className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums">{prayerData?.times.Sunrise || '--:--'}</p>
              </div>
              <div className="text-center py-0.5">
                 <p className="text-[6.5px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase mb-0.5 tracking-widest">AKŞAM</p>
                 <p className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums">{prayerData?.times.Maghrib || '--:--'}</p>
              </div>
           </div>
           <div className="mt-2 flex justify-center">
             <button 
                onClick={() => setShowImsakiyeModal(true)}
                className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] hover:text-[#a8895a] dark:hover:text-[#c9a668] transition-colors py-1 px-4 rounded-full border border-slate-200 dark:border-white/5"
              >
                GÜNLÜK İMSAKİYE →
              </button>
           </div>
        </div>
      </div>

      {/* HIZLI ERİŞİM - Kişiselleştirilebilir kısayollar */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex-1">
            <SectionHeader title="HIZLI ERİŞİM" />
          </div>
          <button
            onClick={() => setShowShortcutEditor(true)}
            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 transition-transform shrink-0 -ml-2"
            aria-label="Kısayolları düzenle"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activeShortcuts.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'camiler' ? setActiveOverlay('camiler') : goToLibraryTool(item.id)}
              className={`bg-gradient-to-br ${item.bg} border ${item.ring} rounded-[2rem] p-5 flex flex-col items-center gap-2 text-center shadow-sm active:scale-95 transition-transform`}
            >
              <span className="text-4xl leading-none">{item.emoji}</span>
              <span className="text-[14px] font-black text-slate-800 dark:text-white leading-tight">{item.label}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KISAYOL DÜZENLEME MODALI */}
      {showShortcutEditor && (
        <div
          className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowShortcutEditor(false)}
        >
          <div
            className="w-full max-w-lg bg-[#faf6f0] dark:bg-[#141a2c] rounded-t-[2.5rem] p-6 pb-10 max-h-[80vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Kısayollarım</h3>
              <button
                onClick={() => setShowShortcutEditor(false)}
                className="w-9 h-9 rounded-full bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-900 dark:text-white"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-5">
              {selectedShortcutIds.length}/{MAX_SHORTCUTS} seçili · Ana sayfanda görünmesini istediklerine dokun
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {SHORTCUT_CATALOG.map((item) => {
                const isSelected = selectedShortcutIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleShortcut(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#c9a668]/10 border-[#c9a668]/40'
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 opacity-60'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] font-black text-slate-800 dark:text-white truncate">{item.label}</span>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide truncate">{item.desc}</span>
                    </span>
                    {isSelected && <span className="text-[#c9a668] text-sm shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stories Section */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="MANEVİ HİKAYELER" />
        <div className="flex justify-center gap-3 py-1">
          {stories.map((story, i) => (
            <div 
              key={i} 
              onClick={() => story.special ? setActiveOverlay('ai') : openStory(story.label)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className={`w-[52px] h-[52px] rounded-full p-[2px] border-2 ${story.color} ${story.glow} group-active:scale-90 transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm`}>
                <div className={`w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center ${story.iconColor} group-hover:scale-110 transition-transform`}>
                  {story.icon}
                </div>
              </div>
              <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">{story.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mosque Finder Shortcut Card - Updated with Harita Dokusu (Map Texture) */}
      <div className="px-1 relative z-10">
         <div 
           onClick={() => setActiveOverlay('camiler')}
           className="bg-[#0d1220] rounded-[2rem] p-5 flex items-center justify-between border border-[#c9a668]/15 shadow-xl shadow-black/10 cursor-pointer group active:scale-[0.98] transition-all overflow-hidden relative"
         >
            {/* Map Texture Overlay - Refined according to user prompt */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none grayscale brightness-125"
              style={{ 
                backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_symbol_location_02.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>

            <div className="absolute right-[-20px] top-[-10px] opacity-10 text-8xl pointer-events-none group-hover:rotate-12 transition-transform duration-700">🕌</div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">📍</div>
               <div>
                  <h4 className="text-white font-black text-lg tracking-tight leading-none">Yakındaki Camiler</h4>
                  <p className="text-[#c9a668] text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">En Yakın Mescitleri Bul</p>
               </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#c9a668]/15 flex items-center justify-center text-white group-hover:bg-[#c9a668] transition-colors">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
         </div>
      </div>

      {/* Main Feature Area */}
      <div className="space-y-4 relative z-10">
        <SectionHeader title="GÜNÜN MANEVİYATI" />

        {/* Günün Maneviyatı - tek, kompakt, sekmeli kart */}
        <div className="bg-white/70 dark:bg-[#141a2c]/70 backdrop-blur-xl rounded-[2rem] border border-[#c9a668]/20 dark:border-[#c9a668]/10 shadow-[0_8px_30px_-15px_rgba(13,18,32,0.12)] overflow-hidden">
          <div className="flex p-1.5 gap-1 border-b border-slate-100 dark:border-white/5">
            {([
              { key: 'ayet', label: 'AYET' },
              { key: 'hadis', label: 'HADİS' },
              { key: 'dua', label: 'DUA' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setSpiritTab(t.key)}
                className={`flex-1 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  spiritTab === t.key
                    ? 'bg-[#c9a668]/15 text-[#a8895a] dark:text-[#c9a668]'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 text-center">
            {spiritTab === 'ayet' && (
              <>
                <p className="arabic-text text-2xl text-slate-800 dark:text-white/90 mb-3" dir="rtl" lang="ar">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-base mb-2">"Allah, sabredenlerle beraberdir."</p>
                <p className="text-[#a8895a] dark:text-[#c9a668] text-[9px] font-bold uppercase tracking-[0.3em]">BAKARA, 153</p>
              </>
            )}
            {spiritTab === 'hadis' && (
              <>
                <p className="arabic-text text-xl text-slate-800 dark:text-white/90 mb-3" dir="rtl" lang="ar">يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-base mb-2">"Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz."</p>
                <p className="text-[#a8895a] dark:text-[#c9a668] text-[9px] font-bold uppercase tracking-[0.3em]">BUHÂRÎ, İLİM, 11</p>
              </>
            )}
            {spiritTab === 'dua' && (
              <>
                <p className="arabic-text text-xl text-slate-800 dark:text-white/90 mb-3" dir="rtl" lang="ar">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-[15px] mb-2">"Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru."</p>
                <p className="text-[#a8895a] dark:text-[#c9a668] text-[9px] font-bold uppercase tracking-[0.3em]">BAKARA, 201</p>
              </>
            )}
          </div>
        </div>


        {/* Footer with Calligraphy Ornaments */}
        <div className="flex items-center justify-center gap-6 py-10 opacity-20 dark:opacity-30 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-16 h-[0.5px] bg-slate-900 dark:bg-white"></div>
            <div className="w-2 h-2 rotate-45 border-[0.5px] border-slate-900 dark:border-white"></div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] whitespace-nowrap dark:text-white">HAYIRLI VAKİTLER</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rotate-45 border-[0.5px] border-slate-900 dark:border-white"></div>
            <div className="w-16 h-[0.5px] bg-slate-900 dark:bg-white"></div>
          </div>
        </div>
      </div>

      {/* FULL IMSAKIYE MODAL */}
      {showImsakiyeModal && (
        <div className="fixed inset-0 z-[600] bg-[#faf6f0] dark:bg-[#0d1220] animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
           <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-[#faf6f0] dark:bg-[#0d1220] z-10">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setShowImsakiyeModal(false)}
                   className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-900 dark:text-white"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                 </button>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">İMSAKİYE TAKVİMİ</h3>
                    <p className="text-[9px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase tracking-widest">30 GÜNLÜK VAKİT ÇİZELGESİ</p>
                 </div>
              </div>
              <div className="bg-[#c9a668]/10 dark:bg-[#c9a668]/10 px-3 py-1.5 rounded-full border border-[#c9a668]/20">
                 <span className="text-[10px] font-black text-[#a8895a] dark:text-[#c9a668] uppercase tracking-widest">{prayerData?.city || 'GENEL'}</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-4">
                 <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                       <tr className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                          <th className="px-4 py-2">GÜN</th>
                          <th className="px-2 py-2">İMSAK</th>
                          <th className="px-2 py-2">GÜNEŞ</th>
                          <th className="px-2 py-2">ÖĞLE</th>
                          <th className="px-2 py-2">İKİNDİ</th>
                          <th className="px-2 py-2">AKŞAM</th>
                          <th className="px-2 py-2 text-right pr-4">YATSI</th>
                       </tr>
                    </thead>
                    <tbody>
                       {FULL_IMSAKIYE.map((day) => (
                          <tr 
                            key={day.day} 
                            className="transition-all rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-[#c9a668]/5 dark:hover:bg-[#c9a668]/5 group"
                          >
                             <td className="px-4 py-4 rounded-l-2xl">
                                <p className="text-[10px] font-black text-slate-900 dark:text-white">{day.day}. Gün</p>
                             </td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-[#a8895a] dark:text-[#c9a668]">{day.imsak}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-slate-700 dark:text-slate-300 opacity-40 group-hover:opacity-100">{day.gunes}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-slate-700 dark:text-slate-300 opacity-40 group-hover:opacity-100">{day.ogle}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-slate-700 dark:text-slate-300 opacity-40 group-hover:opacity-100">{day.ikindi}</td>
                             <td className="px-2 py-4 tabular-nums text-xs font-black text-[#a8895a] dark:text-[#c9a668]">{day.aksam}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-slate-700 dark:text-slate-300 text-right pr-4 rounded-r-2xl opacity-40 group-hover:opacity-100">{day.yatsi}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed italic">
                 "Vakitler Diyanet İşleri Başkanlığı verileriyle uyumludur."
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
