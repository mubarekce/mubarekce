
import React, { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../contexts/UserDataContext';

type KazaTab = 'namaz' | 'oruc';

interface PrayerDebt {
  id: string;
  label: string;
  key: keyof NamazState;
  color: string;
}

interface NamazState {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

interface OrucState {
  ramadan: number;
  kaffarah: number;
}

const PRAYERS: PrayerDebt[] = [
  { id: '1', label: 'SABAH', key: 'fajr', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
  { id: '2', label: 'ÖĞLE', key: 'dhuhr', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
  { id: '3', label: 'İKİNDİ', key: 'asr', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { id: '4', label: 'AKŞAM', key: 'maghrib', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
  { id: '5', label: 'YATSI', key: 'isha', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  { id: '6', label: 'VİTİR', key: 'witr', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
];

const KazaTakibi: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { getField, setField, data } = useUserData();
  const [activeTab, setActiveTab] = useState<KazaTab>('namaz');
  const [namazDebts, setNamazDebts] = useState<NamazState>(() =>
    getField('kaza_namaz', { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 } as NamazState)
  );
  const [orucDebts, setOrucDebts] = useState<OrucState>(() =>
    getField('kaza_oruc', { ramadan: 0, kaffarah: 0 } as OrucState)
  );

  // Worship.tsx (İbadet sekmesi) aynı alanları paylaşıyor; orada yapılan
  // bir değişiklik burada da anında görünsün diye Firestore'dan gelen
  // güncellemeleri dinliyoruz.
  useEffect(() => {
    const remote = data['kaza_namaz'] as NamazState | undefined;
    if (remote) setNamazDebts(remote);
  }, [data['kaza_namaz']]);
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [modalMode, setModalMode] = useState<'quick' | 'detailed'>('quick');
  
  // Detailed Calculation States
  const [birthDate, setBirthDate] = useState('');
  const [pubertyAge, setPubertyAge] = useState(12);
  const [startDate, setStartDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [bulkDays, setBulkDays] = useState(30);
  const [dailyPayment, setDailyPayment] = useState(1); 

  useEffect(() => {
    setField('kaza_namaz', namazDebts);
    setField('kaza_oruc', orucDebts);
  }, [namazDebts, orucDebts]);

  const updateNamaz = (key: keyof NamazState, amount: number) => {
    setNamazDebts(prev => ({ ...prev, [key]: Math.max(0, prev[key] + amount) }));
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const updateOruc = (key: keyof OrucState, amount: number) => {
    setOrucDebts(prev => ({ ...prev, [key]: Math.max(0, prev[key] + amount) }));
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const calculateDetailed = () => {
    if (!birthDate || !startDate) return 0;
    
    const birth = new Date(birthDate);
    const puberty = new Date(birth.getFullYear() + pubertyAge, birth.getMonth(), birth.getDate());
    const start = new Date(startDate);
    
    if (start <= puberty) return 0;
    
    const diffTime = Math.abs(start.getTime() - puberty.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (gender === 'female') {
      return Math.floor(diffDays * 0.76); 
    }
    
    return diffDays;
  };

  const addBulkDebt = () => {
    const daysToAdd = modalMode === 'quick' ? bulkDays : calculateDetailed();
    
    if (activeTab === 'namaz') {
      setNamazDebts(prev => ({
        fajr: prev.fajr + daysToAdd,
        dhuhr: prev.dhuhr + daysToAdd,
        asr: prev.asr + daysToAdd,
        maghrib: prev.maghrib + daysToAdd,
        isha: prev.isha + daysToAdd,
        witr: prev.witr + daysToAdd,
      }));
    } else {
      const orucDays = modalMode === 'quick' ? daysToAdd : Math.ceil(Math.abs(new Date(startDate).getTime() - new Date(new Date(birthDate).getFullYear() + pubertyAge, new Date(birthDate).getMonth(), new Date(birthDate).getDate()).getTime()) / (1000 * 60 * 60 * 24));
      const years = orucDays / 365;
      updateOruc('ramadan', Math.floor(years * 30));
    }
    setShowBulkModal(false);
  };

  const totalNamaz = useMemo(() => (Object.values(namazDebts) as number[]).reduce((a, b) => a + b, 0), [namazDebts]);
  const totalOruc = useMemo(() => orucDebts.ramadan + orucDebts.kaffarah, [orucDebts]);
  const maxDebt = useMemo(() => Math.max(...(Object.values(namazDebts) as number[]), 1), [namazDebts]);

  const estimatedFinish = useMemo(() => {
    if (dailyPayment <= 0 || maxDebt === 0) return null;
    const daysLeft = Math.ceil(maxDebt / dailyPayment);
    const date = new Date();
    date.setDate(date.getDate() + daysLeft);
    return {
      days: daysLeft,
      date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  }, [maxDebt, dailyPayment]);

  return (
    <div className="flex-1 flex flex-col bg-[#FCFDFD] h-full relative animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100/50 sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Kaza Takibi</h2>
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">Borçlarımı Ödüyorum</p>
          </div>
        </div>
        <button 
          onClick={() => setShowBulkModal(true)}
          className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm active:scale-90 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 pb-2">
        <div className="bg-slate-100/80 p-1.5 rounded-[1.8rem] flex border border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('namaz')}
            className={`flex-1 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${activeTab === 'namaz' ? 'bg-white dark:bg-slate-900 text-orange-700 shadow-md ring-1 ring-orange-500/10' : 'text-slate-400 dark:text-slate-500'}`}
          >
            NAMAZ KAZALARI
          </button>
          <button 
            onClick={() => setActiveTab('oruc')}
            className={`flex-1 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'oruc' ? 'bg-white dark:bg-slate-900 text-orange-700 shadow-md ring-1 ring-orange-500/10' : 'text-slate-400 dark:text-slate-500'}`}
          >
            ORUÇ KAZALARI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {activeTab === 'namaz' ? (
          <div className="py-6 space-y-8 animate-in fade-in duration-500">
            {/* Stats Card */}
            <div className="bg-orange-600 rounded-[2.8rem] p-10 text-white relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(249,115,22,0.3)]">
               <div className="absolute right-[-10%] top-[-10%] p-8 opacity-[0.08] group-hover:scale-110 transition-transform text-[12rem] pointer-events-none rotate-6">🕋</div>
               <div className="relative z-10">
                  <p className="text-orange-200 text-[10px] font-black uppercase tracking-[0.25em] mb-2 leading-relaxed">TOPLAM BORÇ VAKİT</p>
                  <h3 className="text-6xl font-black tracking-tighter mb-8">{totalNamaz}</h3>
                  <div className="flex gap-1.5 h-1.5">
                    {PRAYERS.map(p => (
                      <div 
                        key={p.id} 
                        className="h-full bg-white/20 rounded-full overflow-hidden flex-1"
                      >
                        <div 
                          className="h-full bg-white dark:bg-slate-900 transition-all duration-1000"
                          style={{ width: `${(namazDebts[p.key] / maxDebt) * 100}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-2 mb-2">
                 <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.7)] animate-pulse"></div>
                 <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.45em]">BORÇ LİSTEM</h5>
              </div>

              {PRAYERS.map(prayer => (
                <div 
                  key={prayer.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm hover:border-orange-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] ${prayer.color}`}>
                       {prayer.label[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{prayer.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{namazDebts[prayer.key]} Vakit</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => updateNamaz(prayer.key, -1)}
                       className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 active:scale-90 transition-all hover:bg-rose-50 dark:bg-rose-950/20 hover:text-rose-500 hover:border-rose-100"
                     >
                       -1
                     </button>
                     <button 
                       onClick={() => updateNamaz(prayer.key, 1)}
                       className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 flex items-center justify-center font-black text-orange-600 active:scale-90 transition-all hover:bg-orange-100"
                     >
                       +1
                     </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Estimated Finish Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.8rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">HEDEF PLANLAYICI</p>
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic">"Günde her vakitten kaç kaza kılacaksın?"</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                     <button onClick={() => setDailyPayment(Math.max(1, dailyPayment - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">-</button>
                     <span className="w-6 text-center font-black text-slate-900 dark:text-white">{dailyPayment}</span>
                     <button onClick={() => setDailyPayment(dailyPayment + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">+</button>
                  </div>
               </div>

               {estimatedFinish && (
                 <div className="bg-teal-50/50 p-6 rounded-[2rem] border border-teal-100 flex items-center gap-5">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-2xl shadow-sm">🎯</div>
                    <div>
                       <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-0.5">BİTİŞ TAHMİNİ</p>
                       <p className="text-sm font-black text-teal-950">{estimatedFinish.date}</p>
                       <p className="text-[10px] font-bold text-teal-400 mt-0.5">{estimatedFinish.days} Gün Sonra</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-8 animate-in fade-in duration-500">
             {/* Total Oruç Stats Card */}
             <div className="bg-sky-950 rounded-[2.8rem] p-10 text-white relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(8,47,73,0.3)]">
                <div className="absolute right-[-10%] top-[-10%] p-8 opacity-[0.05] group-hover:scale-110 transition-transform text-[10rem] pointer-events-none rotate-6">🌙</div>
                <div className="relative z-10">
                   <p className="text-sky-300 text-[10px] font-black uppercase tracking-[0.25em] mb-2 leading-relaxed">TOPLAM ORUÇ BORCU</p>
                   <h3 className="text-6xl font-black tracking-tighter mb-4">{totalOruc} <span className="text-xl font-bold text-sky-400/60 uppercase tracking-normal">GÜN</span></h3>
                   <div className="flex gap-4 pt-4 border-t border-white/10">
                      <div>
                         <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-0.5">RAMAZAN</p>
                         <p className="text-lg font-black">{orucDebts.ramadan} G</p>
                      </div>
                      <div className="w-px h-8 bg-white/10"></div>
                      <div>
                         <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-0.5">KEFARET</p>
                         <p className="text-lg font-black">{orucDebts.kaffarah} G</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Detailed Fasting Cards */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2 mb-2">
                   <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.7)] animate-pulse"></div>
                   <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.45em]">BORÇ DETAYLARIM</h5>
                </div>

                {/* Ramadan Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.8rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-100 transition-all">
                   <div className="absolute right-6 top-6 w-12 h-12 bg-sky-50 dark:bg-sky-950/20 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-sky-100 group-hover:scale-110 transition-transform">🌙</div>
                   <div className="space-y-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.25em]">RAMAZAN ORUCU</p>
                         <h3 className="text-4xl font-black text-sky-950 tracking-tighter">Borç: {orucDebts.ramadan} Gün</h3>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => updateOruc('ramadan', -1)}
                           className="flex-[1] py-4.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:bg-rose-50 dark:bg-rose-950/20 hover:text-rose-500 hover:border-rose-100"
                         >
                           ÖDENDİ (-1)
                         </button>
                         <button 
                           onClick={() => updateOruc('ramadan', 1)}
                           className="flex-[1] py-4.5 bg-sky-600 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-sky-200"
                         >
                           BORÇ EKLE (+1)
                         </button>
                      </div>
                   </div>
                </div>

                {/* Kaffarah Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.8rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-100 transition-all">
                   <div className="absolute right-6 top-6 w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-rose-100 group-hover:scale-110 transition-transform">💎</div>
                   <div className="space-y-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.25em]">KEFARET ORUCU</p>
                         <h3 className="text-4xl font-black text-rose-950 tracking-tighter">Borç: {orucDebts.kaffarah} Gün</h3>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => updateOruc('kaffarah', -1)}
                           className="flex-[1] py-4.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:bg-rose-50 dark:bg-rose-950/20 hover:text-rose-500 hover:border-rose-100"
                         >
                           ÖDENDİ (-1)
                         </button>
                         <button 
                           onClick={() => updateOruc('kaffarah', 1)}
                           className="flex-[1] py-4.5 bg-rose-600 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-200"
                         >
                           BORÇ EKLE (+1)
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Fasting Tip Card */}
             <div className="bg-teal-50/50 p-8 rounded-[2.8rem] border border-dashed border-teal-200 flex items-start gap-5 group">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.5rem] flex flex-col items-center justify-center text-2xl shadow-sm border border-teal-100 group-hover:rotate-12 transition-transform shrink-0">
                  🍃
                </div>
                <div className="space-y-2">
                   <h6 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">ÖNEMLİ HATIRLATMA</h6>
                   <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic">
                     "Kefaret orucu, geçerli bir mazeret olmaksızın Ramazan orucunu bilerek bozmanın cezası olarak 60 gün ard arda tutulur."
                   </p>
                </div>
             </div>

             <div className="text-center py-6 opacity-30">
                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em]">AHİRET AZIĞINIZ OLSUN</p>
             </div>
          </div>
        )}
      </div>

      {/* Bulk Add / Calculator Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-[3rem] p-8 space-y-6 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
             <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Kaza Hesaplama</h3>
                <div className="flex justify-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mt-4">
                   <button 
                     onClick={() => setModalMode('quick')}
                     className={`flex-1 py-2 text-[9px] font-black rounded-xl transition-all ${modalMode === 'quick' ? 'bg-white dark:bg-slate-900 text-orange-700 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                   >HIZLI EKLE</button>
                   <button 
                     onClick={() => setModalMode('detailed')}
                     className={`flex-1 py-2 text-[9px] font-black rounded-xl transition-all ${modalMode === 'detailed' ? 'bg-white dark:bg-slate-900 text-orange-700 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                   >DETAYLI HESAPLA</button>
                </div>
             </div>
             
             <div className="space-y-6">
                {modalMode === 'quick' ? (
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">KAÇ GÜNLÜK EKLEYELİM?</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[30, 365, 1095].map(d => (
                         <button 
                           key={d} 
                           onClick={() => setBulkDays(d)}
                           className={`py-3 rounded-xl text-[10px] font-black transition-all ${bulkDays === d ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500'}`}
                         >
                           {d === 30 ? '1 AY' : d === 365 ? '1 YIL' : '3 YIL'}
                         </button>
                       ))}
                    </div>
                    <input 
                      type="number" 
                      value={bulkDays} 
                      onChange={e => setBulkDays(Number(e.target.value))} 
                      className="w-full mt-2 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white shadow-inner" 
                    />
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setGender('male')}
                         className={`py-3 rounded-xl text-[9px] font-black border transition-all ${gender === 'male' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}
                       >ERKEK</button>
                       <button 
                         onClick={() => setGender('female')}
                         className={`py-3 rounded-xl text-[9px] font-black border transition-all ${gender === 'female' ? 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 text-pink-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}
                       >KADIN</button>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">DOĞUM TARİHİ</label>
                       <input 
                         type="date" 
                         value={birthDate}
                         onChange={e => setBirthDate(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-3.5 outline-none font-bold text-slate-900 dark:text-white shadow-inner" 
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">AKİL-BALİĞ YAŞI ({pubertyAge})</label>
                       <div className="flex gap-3 items-center">
                          <input 
                            type="range" min="9" max="15" step="1"
                            value={pubertyAge}
                            onChange={e => setPubertyAge(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600"
                          />
                          <span className="w-8 text-center font-black text-orange-600">{pubertyAge}</span>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">İBADETE BAŞLADIĞINIZ TARİH</label>
                       <input 
                         type="date" 
                         value={startDate}
                         onChange={e => setStartDate(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-3.5 outline-none font-bold text-slate-900 dark:text-white shadow-inner" 
                       />
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-950/20 p-5 rounded-2xl border border-teal-100">
                       <div className="flex justify-between items-center mb-1">
                          <p className="text-[9px] font-black text-teal-800 uppercase tracking-widest">HESAPLANAN BORÇ GÜNÜ</p>
                          <p className="text-xl font-black text-teal-950">{calculateDetailed()}</p>
                       </div>
                       <p className="text-[8px] font-medium text-teal-600 leading-tight">
                         {gender === 'female' ? '* Namaz borcu için hayız muafiyetleri (yaklaşık %24) hesaptan düşülmüştür.' : '* Akil-baliğ yaşından bugüne kadarki tüm vakitleri kapsar.'}
                       </p>
                    </div>
                  </div>
                )}
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowBulkModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">İPTAL</button>
                <button 
                  onClick={addBulkDebt} 
                  disabled={modalMode === 'detailed' && (!birthDate || !startDate)}
                  className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all disabled:opacity-30"
                >EKLE</button>
             </div>
          </div>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10">
        <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.65em]">PRO+ İSLAMİ ASİSTAN V1.5</p>
      </div>
    </div>
  );
};

export default KazaTakibi;
