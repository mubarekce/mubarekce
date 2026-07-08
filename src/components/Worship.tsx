import React, { useState, useEffect, useMemo } from 'react';
import { LocationData, PrayerTimes, HijriDate, PrayerStatus, HabitTask } from '../types';
import { resetAllScroll } from '../utils/scrollReset';
import SpiritualGarden from './SpiritualGarden';
import { useUserData } from '../contexts/UserDataContext';

interface WorshipProps {
  location: LocationData | null;
  prayerData: { times: PrayerTimes; hijri: HijriDate; city: string } | null;
  onUpdateLocation: () => void;
}

interface NamazState {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

interface WorshipLog {
  id: string;
  type: 'prayer' | 'habit';
  label: string;
  detail?: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
}

const BASE_HABITS: HabitTask[] = [
  { id: 'quran', label: 'Kuran Okuma', icon: '📖', category: 'ilm' },
  { id: 'dua', label: 'Cevşen / Dua', icon: '🤲', category: 'ihsan' },
  { id: 'zikir', label: 'Günlük Tesbihat', icon: '📿', category: 'zikir' },
  { id: 'sadaka', label: 'Günün Sadakası', icon: '🪙', category: 'sosyal' },
  { id: 'ilim', label: 'Dini Kitap / Sohbet', icon: '📚', category: 'ilm' },
  { id: 'tefekkur', label: '10 Dakika Tefekkür', icon: '✨', category: 'ihsan' },
];

const Worship: React.FC<WorshipProps> = ({ location, prayerData, onUpdateLocation }) => {
  const dateKey = new Date().toDateString();
  const { getField, setField, data } = useUserData();

  // Main Page Tabs
  const [mainTab, setMainTab] = useState<'garden' | 'habits' | 'history'>('garden');

  useEffect(() => {
    resetAllScroll();
    const id = requestAnimationFrame(resetAllScroll);
    return () => cancelAnimationFrame(id);
  }, [mainTab]);

  // States (Firestore'dan gelen kayıtlı değerlerle başlatılır, kullanıcı hesabında saklanır)
  const [prayerStatuses, setPrayerStatuses] = useState<Record<string, PrayerStatus>>(() =>
    getField(`prayers_${dateKey}`, {} as Record<string, PrayerStatus>)
  );

  const [completedHabits, setCompletedHabits] = useState<string[]>(() =>
    getField(`habits_${dateKey}`, [] as string[])
  );

  const [customHabits, setCustomHabits] = useState<HabitTask[]>(() =>
    getField('user_custom_habits', [] as HabitTask[])
  );

  const [namazDebts, setNamazDebts] = useState<NamazState>(() =>
    getField('kaza_namaz', { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 } as NamazState)
  );

  const [worshipLogs, setWorshipLogs] = useState<WorshipLog[]>(() =>
    getField('worship_logs', [] as WorshipLog[])
  );

  const [totalKaza, setTotalKaza] = useState(0);
  const [totalOruc, setTotalOruc] = useState(0);
  const [lastActionTrigger, setLastActionTrigger] = useState<number | undefined>(undefined);
  
  const [habitTab, setHabitTab] = useState<'my' | 'add'>('my');
  const [newHabitLabel, setNewHabitLabel] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');

  const allHabits = useMemo(() => [...customHabits, ...BASE_HABITS], [customHabits]);

  // Başka bir cihazdan senkronize gelen kaza/oruç verisini de yakala
  useEffect(() => {
    const remoteNamaz = data['kaza_namaz'] as NamazState | undefined;
    if (remoteNamaz) setNamazDebts(remoteNamaz);
  }, [data['kaza_namaz']]);

  useEffect(() => {
    setField(`prayers_${dateKey}`, prayerStatuses);
    setField(`habits_${dateKey}`, completedHabits);
    setField('kaza_namaz', namazDebts);
    setField('user_custom_habits', customHabits);
    setField('worship_logs', worshipLogs);

    const total = (Object.values(namazDebts) as number[]).reduce((acc: number, val: number) => acc + val, 0);
    setTotalKaza(total);

    const kazaOruc = getField('kaza_oruc', null as { ramadan?: number; kaffarah?: number } | null);
    if (kazaOruc) {
      setTotalOruc((kazaOruc.ramadan || 0) + (kazaOruc.kaffarah || 0));
    }
  }, [prayerStatuses, completedHabits, namazDebts, customHabits, worshipLogs, dateKey]);

  const prayers = [
    { name: 'Sabah', key: 'Fajr', icon: '🌅' },
    { name: 'Öğle', key: 'Dhuhr', icon: '🌤️' },
    { name: 'İkindi', key: 'Asr', icon: '🌥️' },
    { name: 'Akşam', key: 'Maghrib', icon: '🌙' },
    { name: 'Yatsı', key: 'Isha', icon: '✨' },
  ];

  const gardenScore = useMemo(() => {
    const prayerPoints: number = (Object.values(prayerStatuses) as PrayerStatus[]).reduce((acc: number, status: PrayerStatus) => {
      if (status === 'congregation') return acc + 12;
      if (status === 'done') return acc + 10;
      if (status === 'late') return acc + 5;
      if (status === 'missed') return acc - 10;
      return acc;
    }, 0);

    const habitPoints: number = completedHabits.length * 8;
    const kazaPenalty: number = Math.min(40, (totalKaza * 0.5) + (totalOruc * 2));
    const rawScore: number = 50 + prayerPoints + habitPoints - kazaPenalty;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }, [prayerStatuses, completedHabits, totalKaza, totalOruc]);

  const addLog = (type: 'prayer' | 'habit', label: string, detail?: string) => {
    const now = new Date();
    const newLog: WorshipLog = {
      id: Date.now().toString(),
      type,
      label,
      detail,
      timestamp: now.getTime(),
      dateStr: now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setWorshipLogs(prev => [newLog, ...prev.slice(0, 499)]); 
  };

  const updatePrayerStatus = (name: string, status: PrayerStatus) => {
    const oldStatus = prayerStatuses[name];
    if (status === 'missed' && oldStatus !== 'missed') {
      modifyKaza('fajr', 1);
    } else if (oldStatus === 'missed' && status !== 'missed') {
      modifyKaza('fajr', -1);
    }
    
    if (status !== 'not_yet' && status !== 'missed' && status !== oldStatus) {
      const detailStr = status === 'congregation' ? 'Cemaatle kılındı' : status === 'done' ? 'Münferit kılındı' : 'Vakti geçerek kılındı';
      addLog('prayer', `${name} Namazı`, detailStr);
      setLastActionTrigger(Date.now()); // Animasyonu tetikle
    }

    setPrayerStatuses(prev => ({ ...prev, [name]: status }));
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  const modifyKaza = (key: string, amount: number) => {
    const map: any = { 'sabah': 'fajr', 'öğle': 'dhuhr', 'ikindi': 'asr', 'akşam': 'maghrib', 'yatsı': 'isha', 'vitir': 'witr' };
    const kazaKey = (map[key] || key) as keyof NamazState;
    setNamazDebts(prev => ({ ...prev, [kazaKey]: Math.max(0, prev[kazaKey] + amount) }));
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    if (amount < 0) setLastActionTrigger(Date.now()); // Borç ödeme animasyonu
  };

  const toggleHabit = (id: string) => {
    const isNowDone = !completedHabits.includes(id);
    if (isNowDone) {
      const habit = allHabits.find(h => h.id === id);
      if (habit) {
        addLog('habit', habit.label, 'Tamamlandı');
        setLastActionTrigger(Date.now());
      }
    }
    setCompletedHabits(prev => isNowDone ? [...prev, id] : prev.filter(h => h !== id));
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const addCustomHabit = () => {
    if (!newHabitLabel.trim()) return;
    const newHabit: HabitTask = {
      id: `custom_${Date.now()}`,
      label: newHabitLabel.trim(),
      icon: newHabitIcon,
      category: 'ihsan'
    };
    setCustomHabits([newHabit, ...customHabits]);
    setNewHabitLabel('');
    setHabitTab('my');
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const removeCustomHabit = (id: string) => {
    setCustomHabits(prev => prev.filter(h => h.id !== id));
    setCompletedHabits(prev => prev.filter(hId => hId !== id));
    if (window.navigator.vibrate) window.navigator.vibrate(40);
  };

  const clearLogs = () => {
    if (window.confirm("Tüm geçmiş kayıtları silmek istediğinize emin misiniz?")) {
      setWorshipLogs([]);
    }
  };

  const renderGardenDescription = () => {
    if (gardenScore >= 85) return "Maneviyatın zirvede! Bahçen cennet köşesi gibi parlıyor.";
    if (gardenScore >= 65) return "Bahçen canlanıyor, ibadetlerinle çiçekler açmaya başladı.";
    if (gardenScore >= 40) return "Bahçen ilgi bekliyor, fidanlar ibadet suyu istiyor.";
    return "Bahçen bakımsız kalmış, kaza borçların kuraklığa sebep oluyor.";
  };

  const groupedLogs = useMemo(() => {
    const groups: Record<string, WorshipLog[]> = {};
    worshipLogs.forEach(log => {
      if (!groups[log.dateStr]) groups[log.dateStr] = [];
      groups[log.dateStr].push(log);
    });
    return groups;
  }, [worshipLogs]);

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-36 pt-12 space-y-8 bg-[#fcfdfd] dark:bg-slate-950 no-scrollbar">
      <div className="flex justify-between items-end">
         <div className="space-y-1">
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Bahçem</h2>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Manevi Tekmil Defteri</p>
         </div>
         <button onClick={onUpdateLocation} className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">📍</button>
      </div>

      <div className="bg-slate-100/60 p-1.5 rounded-[2.2rem] flex border border-slate-200/50 shadow-inner">
        <button 
          onClick={() => setMainTab('garden')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.1em] rounded-[1.8rem] transition-all duration-500 ${mainTab === 'garden' ? 'bg-teal-600 text-white shadow-xl scale-100' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 scale-95'}`}
        >
          Bahçem
        </button>
        <button 
          onClick={() => setMainTab('habits')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.1em] rounded-[1.8rem] transition-all duration-500 ${mainTab === 'habits' ? 'bg-sky-600 text-white shadow-xl scale-100' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 scale-95'}`}
        >
          Alışkanlıklar
        </button>
        <button 
          onClick={() => setMainTab('history')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.1em] rounded-[1.8rem] transition-all duration-500 ${mainTab === 'history' ? 'bg-indigo-600 text-white shadow-xl scale-100' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 scale-95'}`}
        >
          Geçmiş
        </button>
      </div>

      {mainTab === 'garden' ? (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl group-hover:scale-110 transition-transform pointer-events-none rotate-12">📈</div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em]">MANEVİ DURUM PANELİ</h4>
                <p className="text-2xl font-black text-slate-900 dark:text-white">Genel İlerleme</p>
              </div>
              <div className="text-right">
                 <span className="text-[3.8rem] font-black text-teal-600 tracking-tighter leading-none">%{gardenScore}</span>
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">GÜNLÜK SKOR</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 relative z-10">
              <div className="space-y-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 dark:border-slate-800 pb-2">GÜNLÜK AMEL</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Vakit Namazları</span>
                      <span className="text-teal-600">{(Object.values(prayerStatuses) as PrayerStatus[]).filter(s => s !== 'not_yet' && s !== 'missed').length} / 5</span>
                    </div>
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/60 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                      <div 
                        className="h-full bg-teal-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(20,184,166,0.3)]" 
                        style={{ width: `${((Object.values(prayerStatuses) as PrayerStatus[]).filter(s => s !== 'not_yet' && s !== 'missed').length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Alışkanlıklar</span>
                      <span className="text-sky-600">{completedHabits.length} / {allHabits.length}</span>
                    </div>
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/60 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                      <div 
                        className="h-full bg-sky-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(14,165,233,0.3)]" 
                        style={{ width: `${(completedHabits.length / allHabits.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">BORÇ YÜKÜ</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">NAMAZ KAZALARIM</span>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-black text-orange-600 tabular-nums">{totalKaza} VAKİT</span>
                    </div>
                  </div>
                  <div className="h-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner p-0.5">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${totalKaza > 100 ? 'bg-rose-500' : 'bg-orange-500'} shadow-[0_0_10px_rgba(249,115,22,0.3)]`} 
                      style={{ width: `${Math.min(100, (totalKaza / 500) * 100)}%` }} 
                    ></div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 px-1">
                    <span>ORUÇ BORÇLARIM</span>
                    <span className={totalOruc > 10 ? "text-rose-500" : "text-indigo-500"}>{totalOruc} GÜN</span>
                  </div>
                  <div className="h-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner p-0.5">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${totalOruc > 30 ? 'bg-rose-600' : 'bg-indigo-500'} shadow-[0_0_10px_rgba(99,102,241,0.3)]`} 
                      style={{ width: `${Math.min(100, (totalOruc / 60) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DİNAMİK MANEVİ BAHÇE (Yeni Bileşen) */}
          <div className={`rounded-[3rem] p-10 border text-center relative overflow-hidden transition-all duration-1000 shadow-xl ${gardenScore >= 50 ? 'bg-teal-950 border-teal-900' : 'bg-amber-950 border-amber-900'}`}>
             <div className="relative z-10 space-y-6">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">MANEVİ BAHÇEM</h4>
                
                {/* Yüksek Kaliteli Animasyonlu Bahçe */}
                <SpiritualGarden score={gardenScore} lastActionTrigger={lastActionTrigger} />

                <div className="space-y-2">
                  <p className="text-[15px] font-black text-white tracking-tight leading-relaxed px-4">{renderGardenDescription()}</p>
                </div>
             </div>
          </div>

          {/* NAMAZ TRACKER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-2 px-1">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                 <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Günlük Namaz Takvimi</h5>
               </div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{dateKey}</span>
            </div>

            {prayers.map((p) => {
              const status = prayerStatuses[p.name] || 'not_yet';
              return (
                <div key={p.name} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 p-6 shadow-sm space-y-5 transition-all hover:border-teal-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-100 dark:border-slate-800">{p.icon}</div>
                      <div>
                        <p className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">{p.name} Namazı</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prayerData?.times[p.key as keyof PrayerTimes] || '--:--'}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      status === 'congregation' ? 'bg-teal-600 text-white' :
                      status === 'done' ? 'bg-teal-100 text-teal-700' :
                      status === 'late' ? 'bg-orange-100 text-orange-700' :
                      status === 'missed' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-50 dark:bg-slate-800/60 text-slate-300 border border-slate-100 dark:border-slate-800'
                    }`}>
                      {status === 'congregation' ? 'CEMAAT' : status === 'done' ? 'TEK' : status === 'late' ? 'GEÇ' : status === 'missed' ? 'KAZA' : 'BEKLİYOR'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                     <button onClick={() => updatePrayerStatus(p.name, 'done')} className={`py-3.5 rounded-2xl text-[9px] font-black transition-all border ${status === 'done' ? 'bg-teal-500 border-teal-400 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-50 dark:border-slate-800 text-slate-400'}`}>TEK</button>
                     <button onClick={() => updatePrayerStatus(p.name, 'congregation')} className={`py-3.5 rounded-2xl text-[9px] font-black transition-all border ${status === 'congregation' ? 'bg-teal-600 border-teal-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-50 dark:border-slate-800 text-slate-400'}`}>CEMAAT</button>
                     <button onClick={() => updatePrayerStatus(p.name, 'late')} className={`py-3.5 rounded-2xl text-[9px] font-black transition-all border ${status === 'late' ? 'bg-orange-500 border-orange-400 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-50 dark:border-slate-800 text-slate-400'}`}>GEÇ</button>
                     <button onClick={() => updatePrayerStatus(p.name, 'missed')} className={`py-3.5 rounded-2xl text-[9px] font-black transition-all border ${status === 'missed' ? 'bg-rose-500 border-rose-400 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-50 dark:border-slate-800 text-slate-400'}`}>KAZA</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : mainTab === 'habits' ? (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="bg-slate-100/50 p-1 rounded-2xl flex border border-slate-200/50 shadow-inner">
            <button 
              onClick={() => setHabitTab('my')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all duration-300 ${habitTab === 'my' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
            >
              Alışkanlıklarım
            </button>
            <button 
              onClick={() => setHabitTab('add')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all duration-300 ${habitTab === 'add' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
            >
              Alışkanlık Ekle
            </button>
          </div>

          {habitTab === 'my' ? (
            <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-500">
              {allHabits.map(h => {
                const isDone = completedHabits.includes(h.id);
                const isCustom = h.id.startsWith('custom_');
                return (
                  <div 
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] ${isDone ? 'bg-sky-50/50 border-sky-100' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-5 flex-1 overflow-hidden">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${isDone ? 'bg-white dark:bg-slate-900 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/60 grayscale opacity-40'}`}>
                        {h.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-[15px] font-black tracking-tight truncate ${isDone ? 'text-sky-900' : 'text-slate-500'}`}>{h.label}</p>
                          {isCustom && !isDone && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); removeCustomHabit(h.id); }}
                               className="text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                             </button>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{isCustom ? 'ÖZEL HEDEF' : h.category === 'ilm' ? 'İlim Tahsili' : h.category === 'ihsan' ? 'Manevi İhsan' : h.category === 'zikir' ? 'Zikr-i Daim' : 'Sosyal Sorumluluk'}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isDone ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-200'}`}>
                      {isDone ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:scale-150 transition-transform"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-1">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yeni Hedef Oluştur</h4>
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Kişisel Alışkanlık Ekle</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">ALIŞKANLIK ADI</label>
                     <input 
                       type="text" 
                       value={newHabitLabel}
                       onChange={(e) => setNewHabitLabel(e.target.value)}
                       placeholder="Örn: 1 Sayfa Tefsir" 
                       className="w-full bg-slate-50 dark:bg-slate-800/60 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-inner focus:ring-2 focus:ring-sky-100 transition-all" 
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">SİMGE SEÇİN</label>
                     <div className="grid grid-cols-6 gap-2">
                        {['✨', '📖', '📿', '🤲', '📚', '🕌', '🍃', '☀️', '💧', '🏃', '🤝', '💎'].map(icon => (
                          <button 
                            key={icon}
                            onClick={() => setNewHabitIcon(icon)}
                            className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all border ${newHabitIcon === icon ? 'bg-sky-600 border-sky-500 shadow-lg scale-110' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-100'}`}
                          >
                            {icon}
                          </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={addCustomHabit}
                    disabled={!newHabitLabel.trim()}
                    className="w-full py-5 bg-sky-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                     LİSTEYE EKLE
                  </button>
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex justify-between items-center px-1">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">İbadet Geçmişi</h5>
             </div>
             <button 
               onClick={clearLogs}
               className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
             >
               TEMİZLE
             </button>
          </div>

          {worshipLogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed text-center space-y-4">
               <div className="text-4xl opacity-20">📜</div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed">Henüz bir ibadet kaydı bulunmuyor.<br/>İbadetlerinizi yaptıkça burada listelenecektir.</p>
            </div>
          ) : (
            Object.keys(groupedLogs).map((date) => (
              <div key={date} className="space-y-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2 mb-2">{date}</p>
                <div className="divide-y divide-slate-50 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                  {groupedLogs[date].map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between group active:bg-slate-50 dark:bg-slate-800/60 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner border border-slate-50/50 ${log.type === 'prayer' ? 'bg-teal-50 text-teal-600' : 'bg-sky-50 text-sky-600'}`}>
                            {log.type === 'prayer' ? '🕌' : '✨'}
                          </div>
                          <div className="min-w-0">
                             <h6 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">{log.label}</h6>
                             <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{log.detail}</p>
                          </div>
                       </div>
                       <div className="text-right flex-shrink-0">
                          <p className="text-[11px] font-black text-indigo-600 tabular-nums">{log.timeStr}</p>
                          <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">SAAT</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 opacity-50"></div>
         <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.5em]">GÜNÜN REHBERİ</p>
         <p className="text-white font-medium text-[16px] italic leading-relaxed px-4 opacity-90">"İbadetin en hayırlısı, az da olsa devamlı olanıdır."</p>
         <div className="flex flex-col items-center gap-2">
            <div className="h-px w-8 bg-slate-700"></div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">- Hadis-i Şerif (Buhari)</p>
         </div>
      </div>
    </div>
  );
};

export default Worship;