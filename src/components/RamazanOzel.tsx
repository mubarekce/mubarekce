
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useUserData } from '../contexts/UserDataContext';

interface RamadanTask {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
}

interface RamadanPrayer {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  meaning: string;
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

const RAMADAN_PRAYERS: RamadanPrayer[] = [
  {
    id: 'iftar',
    title: 'İftar Duası',
    arabic: 'اَللّٰهُمَّ لَكَ صُمْتُ وَبِكَ اٰمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلٰى رِزْقِكَ اَفْطَرْتُ',
    translation: 'Allahümme leke sumtü ve bike âmentü ve aleyke tevekkeltü ve alâ rızkıke eftartü.',
    meaning: 'Allah’ım! Senin rızân için oruç tuttum, Sana inandım, Sana güvendim ve Senin verdiğin rızıkla iftar ettim.'
  },
  {
    id: 'sahur',
    title: 'Sahur Niyeti',
    arabic: 'نَوَيْتُ اَنْ اَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ',
    translation: 'Neveytü en esûme gaden min şehri ramadân.',
    meaning: 'Niyet ettim yarınki Ramazan orucunu tutmaya.'
  },
  {
    id: 'tesbih',
    title: 'Ramazan Tesbihi (İlk 10 Gün)',
    arabic: 'يَا اَرْحَمَ الرَّاحِم۪ينَ',
    translation: 'Yâ Erhamerrâhimîn.',
    meaning: 'Ey merhametlilerin en merhametlisi!'
  },
  {
    id: 'tesbih2',
    title: 'Ramazan Tesbihi (İkinci 10 Gün)',
    arabic: 'يَا غَفَّارَ الذُّنُوبِ',
    translation: 'Yâ Gaffâre’z-zünûb.',
    meaning: 'Ey günahları çokça bağışlayan!'
  }
];

const RAMADAN_ACTIONS = [
  { cat: 'İBADET', items: [
    { title: 'Teravih Namazı', desc: 'Sünnet-i müekkede olan bu namazı cemaatle veya münferit kılın.', icon: '🕌' },
    { title: 'Mukabele Dinlemek', desc: 'Günde en az bir cüz okuyarak veya dinleyerek hatim yapın.', icon: '📖' },
    { title: 'İtikaf Sünneti', desc: 'Ramazan’ın son 10 gününde imkan dahilinde itikafa girin.', icon: '🕋' }
  ]},
  { cat: 'SOSYAL & AHLAK', items: [
    { title: 'İftar Ettirmek', desc: 'Bir oruçluya iftar ettirmenin sevabı büyüktür.', icon: '🍲' },
    { title: 'Sıla-i Rahim', desc: 'Akraba ve komşuları arayıp sorarak gönüllerini alın.', icon: '🤝' },
    { title: 'Dili Korumak', desc: 'Gıybet, yalan ve boş sözden kaçınarak ruhunuzu dinlendirin.', icon: '🤫' }
  ]}
];

const RamazanOzel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { getField, setField } = useUserData();
  const [activePageTab, setActivePageTab] = useState<'sayac' | 'dualar' | 'amel'>('sayac');
  const [showFullImsakiye, setShowFullImsakiye] = useState(false);
  const [fastingDays, setFastingDays] = useState<number>(() => getField('ramadan_fasting_progress', 0));

  const DEFAULT_RAMADAN_TASKS: RamadanTask[] = [
    { id: 'teravih', label: 'Teravih Namazı', icon: '🕋', completed: false },
    { id: 'mukabele', label: 'Mukabele / Kuran', icon: '📖', completed: false },
    { id: 'iftar_duasi', label: 'İftar Duası', icon: '🤲', completed: false },
    { id: 'sahur', label: 'Sahur Bereketi', icon: '🍵', completed: false },
    { id: 'sadaka', label: 'Günün Sadakası', icon: '🪙', completed: false },
  ];

  const [dailyTasks, setDailyTasks] = useState<RamadanTask[]>(() =>
    getField('ramadan_daily_tasks', DEFAULT_RAMADAN_TASKS)
  );

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const imsakiye = {
    imsak: "05:24",
    gunes: "06:52",
    ogle: "13:12",
    ikindi: "16:45",
    aksam: "19:24",
    yatsi: "20:48"
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setField('ramadan_daily_tasks', dailyTasks);
  }, [dailyTasks]);

  const calculateTimeLeft = (targetTimeStr: string) => {
    const [hours, minutes] = targetTimeStr.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target < currentTime) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - currentTime.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { h, m, s };
  };

  const status = useMemo(() => {
    const nowStr = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const isAfterImsak = nowStr >= imsakiye.imsak;
    const isBeforeIftar = nowStr < imsakiye.aksam;
    if (isAfterImsak && isBeforeIftar) return { label: "İFTARA KALAN", target: imsakiye.aksam, icon: "🍽️" };
    return { label: "SAHURA KALAN", target: imsakiye.imsak, icon: "🌙" };
  }, [currentTime]);

  const timeLeft = calculateTimeLeft(status.target);

  const askAi = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Ramazan ayı için bugün bana manevi bir tavsiye, kısa bir hadis ve oruçla ilgili ilginç bir fıkhi bilgi ver.",
        config: { systemInstruction: "Sen uzman bir ramazan rehberi ve din kültürü hocasısın. Üslubun nazik, teşvik edici ve bilgece olsun." }
      });
      setAiResponse(response.text || "Şu an bağlantı kurulamıyor.");
    } catch (e) {
      setAiResponse("AI servisi şu an meşgul.");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const renderSayac = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dynamic Hero Countdown */}
      <div className="bg-[#f0f9ff] rounded-[3rem] p-10 text-sky-950 border border-sky-100 relative overflow-hidden shadow-2xl shadow-sky-900/5 text-center">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center scale-150">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
        </div>
        <div className="relative z-10 space-y-7">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-3xl shadow-md mb-1 border border-white">{status.icon}</div>
            <p className="text-sky-600 text-[10px] font-black uppercase tracking-[0.5em] leading-none">{status.label}</p>
          </div>
          <div className="flex justify-center items-center gap-5">
            <div className="flex flex-col"><span className="text-[4.2rem] font-black tracking-tighter leading-none">{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[9px] font-black text-sky-400 mt-2">SAAT</span></div>
            <span className="text-3xl font-black text-sky-200/50 mb-4 animate-pulse">:</span>
            <div className="flex flex-col"><span className="text-[4.2rem] font-black tracking-tighter leading-none">{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[9px] font-black text-sky-400 mt-2">DAKİKA</span></div>
            <span className="text-3xl font-black text-sky-200/50 mb-4 animate-pulse">:</span>
            <div className="flex flex-col"><span className="text-[4.2rem] font-black tracking-tighter leading-none">{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[9px] font-black text-sky-400 mt-2">SANİYE</span></div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-black text-sky-800 uppercase tracking-widest">HEDEF VAKİT: {status.target}</p>
            <button 
              onClick={() => setShowFullImsakiye(true)}
              className="bg-white/60 hover:bg-white dark:bg-slate-900 text-sky-600 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-sky-100 transition-all active:scale-95 flex items-center gap-2"
            >
              TAM İMSAKİYE LİSTESİ <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Imsakiye Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {[
          { label: 'İMSAK', time: imsakiye.imsak, icon: '🌅', color: 'bg-orange-50 dark:bg-orange-950/20 text-orange-500' },
          { label: 'GÜNEŞ', time: imsakiye.gunes, icon: '☀️', color: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500' },
          { label: 'ÖĞLE', time: imsakiye.ogle, icon: '🌤️', color: 'bg-sky-50 dark:bg-sky-950/20 text-sky-500' },
          { label: 'İKİNDİ', time: imsakiye.ikindi, icon: '🌥️', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' },
          { label: 'AKŞAM', time: imsakiye.aksam, icon: '🌙', color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500' },
          { label: 'YATSI', time: imsakiye.yatsi, icon: '✨', color: 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-between group active:scale-95 cursor-pointer">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-sky-400">{item.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{item.time}</p>
            </div>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner ${item.color}`}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Daily AI Guide */}
      <div className="space-y-4">
        <button onClick={askAi} disabled={aiLoading} className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
          {aiLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>✨</span> AI REHBERE SOR</>}
        </button>
        {aiResponse && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-sky-100 shadow-2xl shadow-sky-900/10 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">GÜNÜN MANEVİ NOTU</p>
            </div>
            <p className="text-[16px] font-medium text-slate-800 dark:text-slate-100 leading-[1.9] italic whitespace-pre-wrap">"{aiResponse}"</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDualar = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#f0f9ff] rounded-[2.5rem] p-8 border border-sky-100 mb-2">
        <h3 className="text-lg font-black text-sky-900 mb-1">Ramazan Duaları</h3>
        <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">MANEVİ ZIRHLAR VE ZİKİRLER</p>
      </div>
      
      {RAMADAN_PRAYERS.map((prayer) => (
        <div key={prayer.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden group">
          <div className="absolute right-[-5%] top-[-5%] opacity-[0.03] text-[8rem] group-hover:scale-110 transition-transform pointer-events-none">🤲</div>
          <div className="relative z-10 space-y-5">
            <div className="inline-block px-4 py-1.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-100">{prayer.title}</div>
            <p className="arabic-text text-3xl text-right leading-[2.2] text-slate-900 dark:text-white" dir="rtl">{prayer.arabic}</p>
            <div className="h-px w-full bg-slate-50 dark:bg-slate-900"></div>
            <p className="text-[13px] font-black text-sky-700 tracking-tight leading-relaxed italic">"{prayer.translation}"</p>
            <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">{prayer.meaning}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAmel = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Daily Checklist Integrated */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-50 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">BUGÜNKÜ HEDEFLERİM</h4>
          </div>
          <span className="text-[10px] font-black text-teal-600 bg-teal-50 dark:bg-teal-950/20 px-3 py-1 rounded-full">{dailyTasks.filter(t => t.completed).length} / {dailyTasks.length}</span>
        </div>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-500 cursor-pointer border ${task.completed ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50/30 border-slate-100 dark:border-slate-800 hover:border-sky-100'}`}>
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-transform ${task.completed ? 'scale-110' : 'grayscale opacity-40'}`}>{task.icon}</span>
                <span className={`text-[13px] font-black uppercase tracking-tight ${task.completed ? 'text-teal-900' : 'text-slate-400 dark:text-slate-500'}`}>{task.label}</span>
              </div>
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${task.completed ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Actions List */}
      <div className="space-y-8">
        {RAMADAN_ACTIONS.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{group.cat}</h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-start gap-5 shadow-sm group hover:border-sky-100 transition-all">
                  <div className="w-14 h-14 bg-sky-50 dark:bg-sky-950/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner border border-sky-100/50">{item.icon}</div>
                  <div className="space-y-1 pt-1">
                    <h5 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-none">{item.title}</h5>
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-100/30 via-sky-50/10 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90 transition-transform text-sky-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0.5">
            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Ramazan Özel</h2>
            <p className="text-[8px] font-black text-sky-500 uppercase tracking-[0.25em]">PRO+ PREMİUM REHBER</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/20 rounded-2xl flex items-center justify-center text-lg border border-sky-100 text-sky-500 shadow-sm transition-transform hover:rotate-12 cursor-pointer">🌙</div>
      </div>

      {/* Internal Tabs */}
      <div className="px-6 py-4 bg-white/40 sticky top-[76px] z-40">
        <div className="bg-slate-100/60 p-1.5 rounded-[2rem] flex border border-slate-200/50 shadow-inner">
          {(['sayac', 'dualar', 'amel'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActivePageTab(tab)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.6rem] transition-all duration-300 ${activePageTab === tab ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}
            >
              {tab === 'sayac' ? 'SAYAC' : tab === 'dualar' ? 'DUALAR' : 'AMEL'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar pt-2">
        {activePageTab === 'sayac' && renderSayac()}
        {activePageTab === 'dualar' && renderDualar()}
        {activePageTab === 'amel' && renderAmel()}
      </div>

      {/* Full Imsakiye Modal */}
      {showFullImsakiye && (
        <div className="fixed inset-0 z-[600] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden">
           <div className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setShowFullImsakiye(false)}
                   className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                 </button>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">30 GÜNLÜK İMSAKİYE</h3>
                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">RAMAZAN-I ŞERİF 2025</p>
                 </div>
              </div>
              <div className="bg-sky-50 dark:bg-sky-950/20 px-3 py-1.5 rounded-full border border-sky-100">
                 <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">TÜRKİYE / GENEL</span>
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
                            className={`transition-all rounded-2xl ${day.day === fastingDays + 1 ? 'bg-sky-600 text-white shadow-xl scale-[1.02] relative z-20' : 'bg-slate-50/50 dark:bg-slate-900/50 hover:bg-sky-50 dark:bg-sky-950/20'}`}
                          >
                             <td className="px-4 py-4 rounded-l-2xl">
                                <p className={`text-[10px] font-black ${day.day === fastingDays + 1 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{day.day}. Gün</p>
                             </td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold">{day.imsak}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40">{day.gunes}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40">{day.ogle}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold opacity-40">{day.ikindi}</td>
                             <td className={`px-2 py-4 tabular-nums text-xs font-black ${day.day === fastingDays + 1 ? 'text-white' : 'text-sky-600'}`}>{day.aksam}</td>
                             <td className="px-2 py-4 tabular-nums text-[11px] font-bold text-right pr-4 rounded-r-2xl opacity-40">{day.yatsi}</td>
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

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-40 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ RAMAZAN ÖZEL</p>
      </div>
    </div>
  );
};

export default RamazanOzel;
