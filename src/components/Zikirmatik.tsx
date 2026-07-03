
import React, { useState, useEffect, useCallback } from 'react';
import { useUserData } from '../contexts/UserDataContext';

type MainTab = 'zikirlerim' | 'tesbihler' | 'gecmis';
type SkinType = 'standard' | 'oltu' | 'yesim' | 'aytasi' | 'neon' | 'yakut';

interface ZikirItem {
  id: string;
  name: string;
  count: number;
  target: number;
}

interface HistoryItem {
  id: string;
  name: string;
  count: number;
  target: number;
  date: string;
  time: string;
  status: 'completed' | 'incomplete';
}

interface SkinConfig {
  id: SkinType;
  name: string;
  bg: string;
  beadGradient: string;
  accent: string;
  text: string;
}

const SKINS: SkinConfig[] = [
  { 
    id: 'standard', 
    name: 'STANDART', 
    bg: 'bg-[#0f172a]', 
    beadGradient: '', 
    accent: 'text-teal-500', 
    text: 'text-white'
  },
  { 
    id: 'oltu', 
    name: 'OLTU TAŞI', 
    bg: 'bg-zinc-950', 
    beadGradient: 'from-zinc-400 via-zinc-700 to-black', 
    accent: 'text-teal-500', 
    text: 'text-white'
  },
  { 
    id: 'yesim', 
    name: 'YEŞİM TAŞI', 
    bg: 'bg-[#134e4a]', 
    beadGradient: 'from-teal-300 via-teal-600 to-teal-900', 
    accent: 'text-teal-500', 
    text: 'text-white'
  },
  { 
    id: 'aytasi', 
    name: 'AY TAŞI', 
    bg: 'bg-[#e2e8f0]', 
    beadGradient: 'from-white via-blue-100 to-blue-200', 
    accent: 'text-teal-600', 
    text: 'text-slate-900'
  },
  { 
    id: 'neon', 
    name: 'NEON PULSE', 
    bg: 'bg-fuchsia-950', 
    beadGradient: 'from-fuchsia-400 via-fuchsia-600 to-fuchsia-900', 
    accent: 'text-teal-400', 
    text: 'text-white'
  },
  { 
    id: 'yakut', 
    name: 'YAKUT', 
    bg: 'bg-rose-950', 
    beadGradient: 'from-rose-400 via-rose-700 to-rose-900', 
    accent: 'text-teal-400', 
    text: 'text-white'
  },
];

const INITIAL_IDS = ['1', '2', '3', '4'];
const INITIAL_DHIKRS: ZikirItem[] = [
  { id: '1', name: "SÜBHÂNALLAH", count: 0, target: 33 },
  { id: '2', name: "ELHAMDÜLİLLAH", count: 0, target: 33 },
  { id: '3', name: "ALLÂHU EKBER", count: 0, target: 33 },
  { id: '4', name: "LÂ İLÂHE İLLALLÂH", count: 0, target: 33 },
];

const Zikirmatik: React.FC = () => {
  const { getField, setField } = useUserData();
  const [activeTab, setActiveTab] = useState<MainTab>('zikirlerim');
  const [activeSkinId, setActiveSkinId] = useState<SkinType>(() => getField('zikir_skin', 'standard' as SkinType));
  const [zikirler, setZikirler] = useState<ZikirItem[]>(() => getField('user_zikirler', INITIAL_DHIKRS));
  const [history, setHistory] = useState<HistoryItem[]>(() => getField('zikir_history', [] as HistoryItem[]));
  const [activeZikirId, setActiveZikirId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState(33);
  const [serbestZikir, setSerbestZikir] = useState(() => Number(getField('serbest_count', 0)));
  const [beadRotation, setBeadRotation] = useState(0);
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    setField('user_zikirler', zikirler);
    setField('zikir_skin', activeSkinId);
    setField('serbest_count', serbestZikir);
    setField('zikir_history', history);
  }, [zikirler, activeSkinId, serbestZikir, history]);

  const activeZikir = activeZikirId === 'serbest' 
    ? { id: 'serbest', name: 'SERBEST ZİKİR', count: serbestZikir, target: 999999 }
    : zikirler.find(z => z.id === activeZikirId);

  const saveToHistory = useCallback((zikir: ZikirItem, status: 'completed' | 'incomplete') => {
    if (zikir.count === 0 && status === 'incomplete') return;
    
    const now = new Date();
    const newRecord: HistoryItem = {
      id: Date.now().toString(),
      name: zikir.name,
      count: zikir.count,
      target: zikir.target,
      date: now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: status
    };
    setHistory(prev => [newRecord, ...prev]);
  }, []);

  const handleIncrement = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!activeZikirId || !activeZikir) return;

    if (activeZikirId !== 'serbest' && activeZikir.count >= activeZikir.target) {
      if (window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
      return;
    }

    if (activeZikirId === 'serbest') {
      setSerbestZikir(prev => prev + 1);
    } else {
      const nextCount = activeZikir.count + 1;
      setZikirler(prev => prev.map(z => z.id === activeZikirId ? { ...z, count: Math.min(z.target, nextCount) } : z));
      
      if (nextCount === activeZikir.target) {
        saveToHistory({ ...activeZikir, count: nextCount }, 'completed');
      }
    }

    setIsAnimate(true);
    setBeadRotation(prev => prev + (360 / 33));
    if (window.navigator.vibrate) window.navigator.vibrate(35);
    setTimeout(() => setIsAnimate(false), 100);
  }, [activeZikirId, activeZikir, saveToHistory]);

  const handleResetAction = useCallback((e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (activeZikir) {
      if (activeZikir.count < activeZikir.target) {
        saveToHistory(activeZikir, 'incomplete');
      }
    }

    if (activeZikirId === 'serbest') {
      setSerbestZikir(0);
    } else if (activeZikirId) {
      setZikirler(prev => prev.map(z => z.id === activeZikirId ? { ...z, count: 0 } : z));
    }
    setBeadRotation(0);
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }, [activeZikirId, activeZikir, saveToHistory]);

  const handleAddZikir = () => {
    if (!newName) return;
    const newItem: ZikirItem = {
      id: Date.now().toString(),
      name: newName.toUpperCase(),
      count: 0,
      target: newTarget
    };
    setZikirler(prev => [newItem, ...prev]);
    setNewName('');
    setNewTarget(33);
    setShowAddModal(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setField('zikir_history', []);
    if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
  };

  const currentSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];
  const userAddedZikirler = zikirler.filter(z => !INITIAL_IDS.includes(z.id));
  const vakitZikirleri = zikirler.filter(z => INITIAL_IDS.includes(z.id));

  // Added React.FC type to handle 'key' prop correctly in map functions (fixes lines 403, 414 errors)
  const ZikirCard: React.FC<{ zikir: ZikirItem }> = ({ zikir }) => {
    const percent = Math.min(100, Math.round((zikir.count / zikir.target) * 100));
    return (
      <div 
        onClick={() => setActiveZikirId(zikir.id)} 
        className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_25px_-12px_rgba(0,0,0,0.06)] cursor-pointer active:scale-[0.99] group transition-all"
      >
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-[14px] font-black text-slate-900 tracking-tight">{zikir.name}</h4>
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 transition-all group-hover:translate-x-1 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <div className="h-full bg-teal-500 transition-all duration-700 shadow-[0_0_10px_rgba(20,184,166,0.3)]" style={{ width: `${percent}%` }}></div>
          </div>
          <span className="text-[11px] font-black text-slate-400 tabular-nums min-w-[50px] text-right">{zikir.count}/{zikir.target}</span>
        </div>
      </div>
    );
  };

  if (activeZikirId !== null) {
    const isStandard = activeSkinId === 'standard';
    const isCompleted = activeZikirId !== 'serbest' && activeZikir && activeZikir.count === activeZikir.target;

    return (
      <div className={`fixed inset-0 z-[250] ${currentSkin.bg} flex flex-col items-center animate-in fade-in duration-300 overflow-hidden select-none transition-colors duration-500`}>
        {/* New Header with Back Button */}
        <div className="w-full px-6 pt-12 flex items-center justify-between z-[400]">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveZikirId(null); }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${isStandard || currentSkin.text === 'text-white' ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-950/5 border-slate-950/5 text-slate-900'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="text-center">
            <h2 className={`${currentSkin.text} text-sm font-black tracking-widest leading-none truncate max-w-[200px]`}>{activeZikir?.name}</h2>
            <p className={`${currentSkin.accent} text-[8px] font-black uppercase tracking-[0.4em] mt-1`}>{currentSkin.name} MODU</p>
          </div>
          <div className="w-11 h-11 opacity-0 pointer-events-none"></div>
        </div>

        {/* Improved main click area to prevent bubbling issues */}
        <div className="flex-1 w-full flex items-center justify-center relative z-10" onClick={handleIncrement}>
          {isStandard ? (
            <div className={`relative w-full max-w-[220px] aspect-square bg-[#111315] rounded-[3rem] p-8 shadow-2xl border-[10px] border-[#1e2124] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isAnimate && !isCompleted ? 'scale-105' : 'scale-100'}`}>
              <div className="absolute top-6 left-0 right-0 flex justify-center">
                <span className="text-[8px] font-black text-teal-500/30 uppercase tracking-[0.6em]">DİJİTAL SAYAÇ</span>
              </div>
              <h1 className={`text-[6.5rem] font-black text-white tracking-tighter tabular-nums leading-none transition-all ${isCompleted ? 'scale-105' : ''}`}>
                {activeZikir?.count}
              </h1>
              {activeZikirId !== 'serbest' && (
                <div className={`mt-4 px-5 py-1.5 rounded-full border transition-all duration-500 ${isCompleted ? 'bg-teal-500/20 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-teal-500/10 border-teal-500/20'}`}>
                  <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isCompleted ? 'text-teal-400 animate-pulse' : 'text-teal-400'}`}>
                    {isCompleted ? 'TAMAMLANDI' : `HEDEF: ${activeZikir?.target}`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full aspect-square flex items-center justify-center pointer-events-none">
              <div className={`absolute w-[260px] h-[260px] rounded-full border border-white/5`}></div>
              <div className="absolute w-[260px] h-[260px] transition-transform duration-300 ease-out" style={{ transform: `rotate(${beadRotation}deg)` }}>
                {[...Array(33)].map((_, i) => (
                  <div key={i} className="absolute left-1/2 top-1/2 w-8 h-10 -ml-4 -mt-5 flex items-center justify-center" style={{ transform: `rotate(${i * (360/33)}deg) translateY(-115px)` }}>
                    <div className={`w-5 h-7 rounded-[1rem] bg-gradient-to-br ${currentSkin.beadGradient} shadow-lg border border-white/5 relative overflow-hidden`} />
                  </div>
                ))}
              </div>
              <div className={`text-center transition-all duration-150 relative z-10 ${isAnimate && !isCompleted ? 'scale-110' : 'scale-100'}`}>
                <h1 className={`text-[6.5rem] font-black ${currentSkin.text} leading-none tracking-tighter drop-shadow-2xl`}>{activeZikir?.count}</h1>
                {activeZikirId !== 'serbest' && (
                  <div className={`mt-3 border px-5 py-1.5 rounded-full inline-block backdrop-blur-xl transition-all duration-500 ${isCompleted ? 'bg-teal-500/20 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-black/30 border-white/10'}`}>
                    <span className={`text-[9px] font-black tracking-[0.3em] uppercase transition-all ${isCompleted ? 'text-teal-400 animate-pulse' : currentSkin.accent}`}>
                      {isCompleted ? 'TAMAMLANDI' : `HEDEF: ${activeZikir?.target}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control area - stopped propagation on container to prevent laggy multi-triggering */}
        <div className="w-full h-[200px] flex items-center justify-center relative z-[300]" onClick={(e) => e.stopPropagation()}>
          <div className="w-full px-8 flex items-center justify-between">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveZikirId(null); }} 
              className="flex flex-col items-center gap-3 active:scale-90 transition-all pointer-events-auto group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl group-hover:bg-white/10 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              </div>
              <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.2em]">LİSTE</span>
            </button>

            <button 
              onClick={handleIncrement} 
              className="w-24 h-24 rounded-full border-[8px] border-white/5 flex items-center justify-center bg-white/5 backdrop-blur-xl active:scale-90 transition-all pointer-events-auto shadow-2xl group"
            >
              <div className="w-8 h-8 bg-teal-50 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(20,184,166,0.6)] group-hover:scale-110 transition-transform flex items-center justify-center">
                 <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-white' : 'bg-teal-500'} transition-colors`}></div>
              </div>
            </button>

            <button 
              onClick={handleResetAction} 
              className="flex flex-col items-center gap-3 active:scale-90 transition-all pointer-events-auto group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl group-hover:bg-white/10 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="rotate-45"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </div>
              <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.2em]">SIFIRLA</span>
            </button>
          </div>
        </div>

        <div className="pb-8 opacity-40 pointer-events-none">
          <p className="text-teal-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
            {isCompleted ? 'HEDEF TAMAMLANDI' : 'DOKUNARAK DEVAM ET'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
      <div className="pt-12 px-6 flex flex-col items-center gap-4 bg-white z-20">
        <div className="w-full flex justify-between items-center">
          <button 
            onClick={() => {
              // Eğer kütüphane içindeysek navigasyonu sıfırla
              window.dispatchEvent(new CustomEvent('resetLibraryView'));
            }} 
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900 tracking-widest uppercase">Tesbihat</h2>
            <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em]">Manevi Huzur</p>
          </div>
          <div className="w-10 h-10 opacity-0"></div>
        </div>

        <div className="w-full bg-slate-100/60 p-1 rounded-2xl flex border border-slate-100">
          {['zikirlerim', 'tesbihler', 'gecmis'].map(id => (
            <button key={id} onClick={() => setActiveTab(id as MainTab)} className={`flex-1 py-2.5 text-[9px] font-black tracking-widest rounded-xl transition-all ${activeTab === id ? 'bg-white text-teal-700 shadow-md border border-slate-100' : 'text-slate-400'}`}>
              {id === 'zikirlerim' ? 'ZİKİRLERİM' : id === 'tesbihler' ? 'TESBİHLER' : 'GEÇMİŞ'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 no-scrollbar">
        {activeTab === 'zikirlerim' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div onClick={() => setActiveZikirId('serbest')} className="bg-[#e0f2fe] rounded-[2.5rem] p-7 flex items-center justify-between border border-sky-100 shadow-[0_10px_30px_-10px_rgba(186,230,253,0.05)] cursor-pointer active:scale-[0.98] transition-all group">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-sky-400 uppercase tracking-[0.4em]">HIZLI SAYAÇ</p>
                <h3 className="text-xl font-black text-sky-950">Serbest Zikir</h3>
              </div>
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-3xl font-black text-sky-950 tabular-nums">{serbestZikir}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowAddModal(true)} className="bg-white border-2 border-dashed border-teal-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-black text-3xl group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.15em]">YENİ EKLE</span>
              </button>
              
              <div className="bg-[#f8fafc] border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">TOPLAM</p>
                  <span className="text-4xl font-black text-slate-900 tabular-nums">{zikirler.reduce((acc, curr) => acc + curr.count, 0) + serbestZikir}</span>
                </div>
              </div>
            </div>

            {userAddedZikirler.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                   <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">ZİKİRLERİM</h3>
                </div>
                <div className="space-y-3.5">
                  {/* Fixed key prop usage by typing ZikirCard as React.FC (fixes line 403 error) */}
                  {userAddedZikirler.map(z => <ZikirCard key={z.id} zikir={z} />)}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                 <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">VAKİT ZİKİRLERİ</h3>
              </div>
              <div className="space-y-3.5">
                {/* Fixed key prop usage by typing ZikirCard as React.FC (fixes line 414 error) */}
                {vakitZikirleri.map(z => <ZikirCard key={z.id} zikir={z} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tesbihler' && (
          <div className="grid grid-cols-2 gap-5 py-2 animate-in fade-in duration-500">
            {SKINS.map(skin => (
              <div key={skin.id} onClick={() => setActiveSkinId(skin.id)} className={`p-1.5 rounded-[2.8rem] transition-all cursor-pointer ${activeSkinId === skin.id ? 'bg-teal-500 shadow-xl shadow-teal-500/10' : 'bg-transparent'}`}>
                <div className="p-4 rounded-[2.5rem] bg-white border border-slate-100 flex flex-col items-center shadow-sm h-full">
                  <div className={`w-full aspect-[4/3] rounded-[1.8rem] mb-3 flex items-center justify-center gap-1.5 ${skin.bg} shadow-inner group overflow-hidden`}>
                     {skin.id === 'standard' ? (
                       <div className="w-14 h-10 bg-slate-800/50 rounded-xl border-2 border-slate-700/50 flex flex-col items-center justify-center gap-0.5"><div className="w-10 h-3.5 bg-teal-500/10 rounded-sm flex items-center justify-center"><span className="text-teal-500 font-black text-[9px] tracking-widest">00</span></div><div className="w-2 h-2 rounded-full bg-teal-600/30"></div></div>
                     ) : (
                       <div className="flex items-center gap-1.5"><div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${skin.beadGradient} shadow-md`}></div><div className={`w-4.5 h-4.5 rounded-full bg-gradient-to-br ${skin.beadGradient} shadow-md scale-110`}></div><div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${skin.beadGradient} shadow-md`}></div></div>
                     )}
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 text-center tracking-tight mb-0.5 uppercase">{skin.name}</h4>
                  {activeSkinId === skin.id && <p className="text-[7px] font-black text-teal-500 uppercase tracking-widest text-center">AKTİF</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'gecmis' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {history.length > 0 ? (
              <>
                {history.map((record) => (
                  <div key={record.id} className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${record.status === 'completed' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                          {record.status === 'completed' ? 'TAMAMLANDI' : 'YARIM KALDI'}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{record.time} - {record.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{record.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{record.count} / {record.target} Tekrar</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.status === 'completed' ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-300'}`}>
                      {record.status === 'completed' ? (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleClearHistory}
                  className="w-full py-5 mt-6 border border-rose-100 rounded-[2rem] bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  GEÇMİŞİ TEMİZLE
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
                <div className="text-center opacity-30 space-y-4">
                  <span className="text-4xl">📜</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Kayıt Yok</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl">
             <h3 className="text-xl font-black text-slate-900 text-center tracking-tight">Yeni Zikir</h3>
             <div className="space-y-6">
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">ZİKİR ADI</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Ya Şafi" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">HEDEF SAYI</label><input type="number" value={newTarget} onChange={e => setNewTarget(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 shadow-inner" /></div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">İPTAL</button>
                <button onClick={handleAddZikir} className="flex-1 py-4 bg-teal-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all">KAYDET</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Zikirmatik;
