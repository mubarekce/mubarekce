
import React, { useState, useMemo, useEffect } from 'react';
import { User, PrayerTimes, HijriDate, AppTab } from '../types';
import { resetAllScroll } from '../utils/scrollReset';
import AISor from './AISor';
import MosqueMap from './MosqueMap';
import StoryViewer from './StoryViewer';
import { useUserData } from '../contexts/UserDataContext';

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
  const { getField, data } = useUserData();
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'ai' | 'camiler' | 'story'>('none');

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

  // Sıradaki vakti hesaplayan logic
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

  if (activeOverlay === 'ai') {
    return (
      <div className="flex-1 flex flex-col h-full bg-white relative animate-in fade-in zoom-in duration-300">
        <div className="absolute top-12 left-6 z-50">
          <button onClick={() => setActiveOverlay('none')} className="w-10 h-10 bg-white/80 backdrop-blur rounded-xl flex items-center justify-center shadow-sm border border-slate-100">←</button>
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
      color: 'border-teal-400',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]',
      iconColor: 'text-teal-500'
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
      color: 'border-amber-400',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]',
      iconColor: 'text-amber-500'
    },
    { 
      label: 'DUA', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v0"></path>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
        </svg>
      ), 
      color: 'border-indigo-400',
      glow: 'shadow-[0_0_15px_rgba(129,140,248,0.4)]',
      iconColor: 'text-indigo-500'
    },
    { 
      label: 'SÜNNET', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ), 
      color: 'border-rose-300',
      glow: 'shadow-[0_0_15px_rgba(253,164,175,0.4)]',
      iconColor: 'text-rose-400'
    },
    { 
      label: 'AI HOCAM', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          <path d="M12 7v5l3 3"></path>
        </svg>
      ), 
      color: 'border-sky-400', 
      glow: 'shadow-[0_0_15px_rgba(56,189,248,0.4)]',
      iconColor: 'text-sky-500',
      special: true 
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-36 pt-6 space-y-6 animate-in fade-in duration-700 no-scrollbar relative">
      
      {/* BACKGROUND DECORATIVE LAYERS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* 1. Subtle Dot Pattern - Specific User Request */}
        <div 
          className="absolute inset-0 opacity-[0.02] transition-opacity duration-1000" 
          style={{ 
            backgroundImage: `radial-gradient(#115e59 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} 
        />
        
        {/* 2. Top "Nur" Ambient Glow - Specific sizing/blur from user request */}
        <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-teal-400/30 blur-[100px] rounded-full pointer-events-none z-0" />
        
        {/* 3. Bottom Ambient Glow (Subtle Amber/Gold) */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-amber-200/10 blur-[100px] rounded-full transition-all duration-1000" />
      </div>

      {/* MAIN CARD - PASTEL DARK GREEN (EMERALD) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-teal-50 shadow-[0_20px_60px_-12px_rgba(17,94,89,0.4)] border border-teal-800/50 z-10 transition-transform duration-300 active:scale-[0.99]">
        
        {/* Mosque Background Silhouette */}
        <div className="absolute right-[-20px] bottom-4 opacity-5 pointer-events-none transition-all duration-1000">
          <svg width="240" height="240" viewBox="0 0 100 100" fill="white">
            <path d="M30 65 Q50 35 70 65 L70 95 L30 95 Z" />
            <path d="M48 35 L52 35 L50 30 Z" />
            <rect x="22" y="45" width="4" height="50" rx="1" />
            <path d="M21 45 L27 45 L24 38 Z" />
            <rect x="74" y="45" width="4" height="50" rx="1" />
            <path d="M73 45 L79 45 L76 38 Z" />
            <circle cx="50" cy="27" r="2" />
          </svg>
        </div>
        
        {/* Top Info Section */}
        <div className="p-7 pb-4 relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-0">
              <h1 className="text-[3.8rem] font-black tracking-tighter leading-none text-white drop-shadow-lg">
                {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-[11px] font-black text-teal-300 uppercase tracking-[0.2em] mt-1.5 ml-1">
                {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
              </p>
            </div>
            
            {/* HICRI BOX */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-3.5 py-2.5 border border-white/10 text-right flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center text-[10px]">🌙</div>
              <div>
                <p className="text-[8px] font-black text-teal-300 uppercase tracking-[0.2em] mb-0.5">HİCRİ</p>
                <p className="text-[10px] font-bold text-white leading-none">
                  {prayerData?.hijri.day} {prayerData?.hijri.month.tr} {prayerData?.hijri.year}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 mb-7">
            <h2 className="text-xl font-bold tracking-tight text-teal-100/70 italic">Selam, <span className="text-white font-black not-italic">{user.name.split(' ')[0]}</span></h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-8 h-[1px] bg-teal-400/50"></div>
              <p className="text-teal-300 text-[8.5px] font-black uppercase tracking-[0.35em]">RUHUN ŞİFASI İBADETTİR</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
             {/* NEXT PRAYER BOX */}
             <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-teal-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="M8 17a1 1 0 0 1-1-1v-5a5 5 0 0 1 10 0v5a1 1 0 0 1-1 1H8z" /><path d="M12 2v3" />
                    </svg>
                  </div>
                  <p className="text-[8px] font-black uppercase text-teal-300/60 tracking-widest">SIRADAKİ</p>
                </div>
                <p className="text-sm font-black text-white mb-0.5">{nextPrayer?.name || 'Vakit'}</p>
                <p className="text-[11px] font-bold text-teal-200 tabular-nums">{nextPrayer?.time || '--:--'}</p>
             </div>

             {/* ZIKIR BOX - UPDATED: Dynamic Count & Navigation to Zikirmatik */}
             <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/5 shadow-sm cursor-pointer active:scale-95 transition-transform" onClick={handleZikirClick}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-teal-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
                    </svg>
                  </div>
                  <p className="text-[8px] font-black uppercase text-teal-300/60 tracking-widest">ZİKİR</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-black text-white">{currentDhikrCount}</p>
                  <p className="text-[9px] font-bold text-teal-400/40">/ 99</p>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                   <div 
                    className="h-full bg-teal-400 transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                    style={{ width: `${Math.min(100, (currentDhikrCount / 99) * 100)}%` }}
                   ></div>
                </div>
             </div>
          </div>
        </div>

        {/* Integrated Imsakiye Section */}
        <div className="bg-black/10 border-t border-white/5 p-4 backdrop-blur-sm">
           <div className="grid grid-cols-3 gap-1">
              <div className="text-center py-1">
                 <p className="text-[7px] font-black text-teal-300 uppercase mb-1 tracking-widest">İMSAK</p>
                 <p className="text-[13px] font-black text-white tabular-nums">{prayerData?.times.Fajr || '--:--'}</p>
              </div>
              <div className="text-center py-1 border-x border-white/5 px-2">
                 <p className="text-[7px] font-black text-teal-300 uppercase mb-1 tracking-widest">GÜNEŞ</p>
                 <p className="text-[13px] font-black text-white tabular-nums">{prayerData?.times.Sunrise || '--:--'}</p>
              </div>
              <div className="text-center py-1">
                 <p className="text-[7px] font-black text-teal-300 uppercase mb-1 tracking-widest">AKŞAM</p>
                 <p className="text-[13px] font-black text-white tabular-nums">{prayerData?.times.Maghrib || '--:--'}</p>
              </div>
           </div>
           <div className="mt-3 flex justify-center">
             <button 
                onClick={() => setShowImsakiyeModal(true)}
                className="text-[8px] font-black text-teal-300/60 uppercase tracking-[0.4em] hover:text-white transition-colors py-1.5 px-5 rounded-full border border-white/5 bg-white/5 active:scale-95"
              >
                GÜNLÜK İMSAKİYE LİSTESİ →
              </button>
           </div>
        </div>
      </div>

      {/* HIZLI ERİŞİM - Büyük, sade, herkesin kolayca kullanabileceği kısayollar */}
      <div className="space-y-3 relative z-10">
        <SectionHeader title="HIZLI ERİŞİM" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'kible', label: 'Kıble Bulucu', desc: 'Yönünü Bul', emoji: '🧭', bg: 'from-teal-50 to-white dark:from-teal-950/40 dark:to-slate-900', ring: 'border-teal-100 dark:border-teal-900/50' },
            { id: 'zikir', label: 'Zikirmatik', desc: 'Zikir Çek', emoji: '📿', bg: 'from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900', ring: 'border-amber-100 dark:border-amber-900/40' },
            { id: 'quran', label: 'Kuran-ı Kerim', desc: 'Oku & Dinle', emoji: '📖', bg: 'from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900', ring: 'border-cyan-100 dark:border-cyan-900/40' },
            { id: 'camiler', label: 'Yakın Camiler', desc: 'Mescit Bul', emoji: '🕌', bg: 'from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900', ring: 'border-emerald-100 dark:border-emerald-900/40' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => goToLibraryTool(item.id)}
              className={`bg-gradient-to-br ${item.bg} border ${item.ring} rounded-[2rem] p-5 flex flex-col items-center gap-2 text-center shadow-sm active:scale-95 transition-transform`}
            >
              <span className="text-4xl leading-none">{item.emoji}</span>
              <span className="text-[14px] font-black text-slate-800 dark:text-white leading-tight">{item.label}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

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
           className="bg-[#022e2c] rounded-[2.5rem] p-6 flex items-center justify-between border border-teal-800 shadow-xl shadow-teal-900/10 cursor-pointer group active:scale-[0.98] transition-all overflow-hidden relative"
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
                  <p className="text-teal-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">En Yakın Mescitleri Bul</p>
               </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-white group-hover:bg-teal-500 transition-colors">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
         </div>
      </div>

      {/* Main Feature Area */}
      <div className="space-y-4 relative z-10">
        <SectionHeader title="GÜNÜN MANEVİYATI" />

        {/* Daily Verse Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2rem] p-7 border border-teal-100 dark:border-teal-900/40 shadow-[0_8px_30px_rgba(17,94,89,0.04)] relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(17,94,89,0.08)] text-center">
          <span className="inline-block bg-teal-600/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 text-[11px] font-black px-5 py-1.5 rounded-full mb-5 tracking-widest uppercase">GÜNÜN AYETİ</span>
          <p className="arabic-text text-3xl text-teal-900/90 mb-4" dir="rtl" lang="ar">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-lg mb-3">
            "Allah, sabredenlerle beraberdir."
          </p>
          <p className="text-teal-900/40 dark:text-teal-300/40 text-[9px] font-bold uppercase tracking-[0.4em]">BAKARA, 153</p>
        </div>

        {/* Daily Hadith Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2rem] p-7 border border-amber-100 dark:border-amber-900/40 shadow-[0_8px_30px_rgba(180,83,9,0.04)] relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(180,83,9,0.08)] text-center">
          <span className="inline-block bg-amber-600/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 text-[11px] font-black px-5 py-1.5 rounded-full mb-5 tracking-widest uppercase">GÜNÜN HADİS-İ ŞERİFİ</span>
          <p className="arabic-text text-2xl text-amber-900/90 mb-4" dir="rtl" lang="ar">يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا</p>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-lg mb-3">
            "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz."
          </p>
          <p className="text-amber-900/40 dark:text-amber-300/40 text-[9px] font-bold uppercase tracking-[0.4em]">BUHÂRÎ, İLİM, 11</p>
        </div>

        {/* Daily Dua Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-[2rem] p-7 border border-indigo-100 dark:border-indigo-900/40 shadow-[0_8px_30px_rgba(99,102,241,0.04)] relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(99,102,241,0.08)] text-center">
          <span className="inline-block bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-black px-5 py-1.5 rounded-full mb-5 tracking-widest uppercase">GÜNÜN DUASI</span>
          <p className="arabic-text text-2xl text-indigo-900/90 mb-4" dir="rtl" lang="ar">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-[16px] mb-3">
            "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru."
          </p>
          <p className="text-indigo-900/40 dark:text-indigo-300/40 text-[9px] font-bold uppercase tracking-[0.4em]">BAKARA, 201</p>
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
        <div className="fixed inset-0 z-[600] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
           <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setShowImsakiyeModal(false)}
                   className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-transform"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                 </button>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">İMSAKİYE TAKVİMİ</h3>
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">30 GÜNLÜK VAKİT ÇİZELGESİ</p>
                 </div>
              </div>
              <div className="bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                 <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{prayerData?.city || 'GENEL'}</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-4">
                 <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                       <tr className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
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
                            className="transition-all rounded-2xl bg-slate-50/50 hover:bg-sky-50 group"
                          >
                             <td className="px-4 py-4 rounded-l-2xl">
                                <p className="text-[10px] font-black text-slate-900">{day.day}. Gün</p>
                             </td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-sky-700">{day.imsak}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40 group-hover:opacity-100">{day.gunes}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40 group-hover:opacity-100">{day.ogle}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40 group-hover:opacity-100">{day.ikindi}</td>
                             <td className="px-2 py-4 tabular-nums text-xs font-black text-sky-600">{day.aksam}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-right pr-4 rounded-r-2xl opacity-40 group-hover:opacity-100">{day.yatsi}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                 "Vakitler Diyanet İşleri Başkanlığı verileriyle uyumludur."
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
