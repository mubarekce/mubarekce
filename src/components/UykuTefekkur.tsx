
import React, { useState, useEffect, useRef } from 'react';

type TabType = 'sesler' | 'zikirler' | 'nefes' | 'tefekkur';

interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
  desc: string;
}

const SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rahmet Yağmuru', icon: '🌧️', color: 'bg-gold-50 dark:bg-navy-950/20 text-gold-500', url: 'https://assets.mixkit.co/active_storage/sfx/2407/2407-preview.mp3', desc: 'Derin odaklanma ve huzur' },
  { id: 'night', name: 'Gece Ormanı', icon: '🌲', color: 'bg-gold-50 dark:bg-navy-950/20 text-gold-600', url: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3', desc: 'Doğanın sakinleştirici sesi' },
  { id: 'wind', name: 'Sakin Rüzgar', icon: '🌬️', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500', url: 'https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3', desc: 'Zihni boşaltan esinti' },
  { id: 'ocean', name: 'Derin Deniz', icon: '🌊', color: 'bg-gold-50 dark:bg-navy-950/20 text-gold-600', url: 'https://assets.mixkit.co/active_storage/sfx/2412/2412-preview.mp3', desc: 'Ruhsal dinginlik ve ritim' },
  { id: 'fire', name: 'Huzur Ateşi', icon: '🔥', color: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600', url: 'https://assets.mixkit.co/active_storage/sfx/2400/2400-preview.mp3', desc: 'Sıcak ve güvenli atmosfer' },
  { id: 'tilawat', name: 'Sakin Tilavet', icon: '📖', color: 'bg-gold-50 dark:bg-navy-950/20 text-gold-600', url: 'https://server7.mp3quran.net/s_gmd/001.mp3', desc: 'Kalbi yumuşatan tilavet' },
];

const NIGHT_DHIKRS = [
  { name: 'SÜBHÂNALLAH', target: 33 },
  { name: 'ELHAMDÜLİLLAH', target: 33 },
  { name: 'ALLÂHU EKBER', target: 33 },
  { name: 'LÂ İLÂHE İLLALLÂH', target: 33 },
  { name: 'AMENERRESULÜ', target: 1 },
];

const TEFEKKUR_CARDS = [
  { text: "Geceyi bir örtü, uykuyu da bir dinlenme kılan O'dur.", source: "Furkan, 47" },
  { text: "Şüphesiz göklerin ve yerin yaratılışında, gece ile gündüzün birbiri ardınca gelişinde akıl sahipleri için ibretler vardır.", source: "Al-i İmran, 190" },
  { text: "Uykunuzu bir dinlenme kıldık.", source: "Nebe, 9" },
  { text: "Karanlığı aydınlığa çıkaran, kalplere huzur veren ancak O'dur.", source: "Tefekkür Notu" },
];

const UykuTefekkur: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('sesler');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [timer, setTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [activeDhikrIdx, setActiveDhikrIdx] = useState(0);
  const [dhikrCount, setDhikrCount] = useState(0);
  
  const [breathingPhase, setBreathingPhase] = useState<'hazır' | 'nefes al' | 'tut' | 'ver'>('hazır');
  const [breathProgress, setBreathProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const breathTimerRef = useRef<any>(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = volume;
    return () => {
      audio.pause();
      audio.src = '';
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    let interval: any;
    if (timer !== null && playingSoundId) {
        setTimeLeft(timer * 60);
        interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 0) {
                    try {
                      audioRef.current.pause();
                    } catch (e) {}
                    setPlayingSoundId(null);
                    setTimer(null);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, playingSoundId]);

  const toggleSound = async (sound: AmbientSound) => {
    const audio = audioRef.current;
    if (playingSoundId === sound.id) {
      audio.pause();
      setPlayingSoundId(null);
    } else {
      // Interruption errors occur when setting src or pausing during a pending play()
      // We explicitly pause first and then catch the error on play()
      try {
        audio.pause();
        audio.src = sound.url;
        await audio.play();
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Audio play error", e);
        }
      }
      setPlayingSoundId(sound.id);
    }
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const handleDhikr = () => {
    const current = NIGHT_DHIKRS[activeDhikrIdx];
    if (dhikrCount < current.target) {
        setDhikrCount(prev => prev + 1);
        if (window.navigator.vibrate) window.navigator.vibrate(30);
    } else {
        if (activeDhikrIdx < NIGHT_DHIKRS.length - 1) {
            setActiveDhikrIdx(prev => prev + 1);
            setDhikrCount(0);
            if (window.navigator.vibrate) window.navigator.vibrate([40, 60, 40]);
        }
    }
  };

  const startBreathing = () => {
    if (breathTimerRef.current) {
        clearInterval(breathTimerRef.current);
        setBreathingPhase('hazır');
        setBreathProgress(0);
        breathTimerRef.current = null;
        return;
    }

    const runCycle = () => {
        setBreathingPhase('nefes al');
        setBreathProgress(0);
        let elapsed = 0;
        
        const phaseTimer = setInterval(() => {
            elapsed += 100;
            if (elapsed <= 4000) {
                setBreathingPhase('nefes al');
                setBreathProgress((elapsed / 4000) * 100);
            } else if (elapsed <= 11000) {
                setBreathingPhase('tut');
                setBreathProgress(((elapsed - 4000) / 7000) * 100);
            } else if (elapsed <= 19000) {
                setBreathingPhase('ver');
                setBreathProgress(((elapsed - 11000) / 8000) * 100);
            } else {
                clearInterval(phaseTimer);
                runCycle();
            }
        }, 100);
        breathTimerRef.current = phaseTimer;
    };
    runCycle();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fcfcfd] text-slate-900 dark:text-white animate-in fade-in duration-500 overflow-hidden relative">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] w-[60%] aspect-square bg-gold-50 dark:bg-navy-950/20 blur-[100px] rounded-full opacity-60"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] aspect-square bg-gold-50 dark:bg-navy-950/20 blur-[80px] rounded-full opacity-60"></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-[#f3f7e9]/80 dark:bg-[#0a1f1a]/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[18px] font-black tracking-tight leading-none text-slate-900 dark:text-white uppercase">Gece Modu</h2>
            <p className="text-[9px] font-black text-gold-500 uppercase tracking-[0.3em] mt-1">Huzurlu Tefekkür</p>
          </div>
        </div>
        <div className="w-11 h-11 bg-gold-50 dark:bg-navy-950/20 rounded-2xl flex items-center justify-center text-lg border border-gold-100 shadow-sm animate-pulse">🌙</div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 relative z-20">
        <div className="bg-slate-100/50 p-1.5 rounded-[2rem] flex border border-slate-200/50 shadow-inner">
          {(['sesler', 'zikirler', 'nefes', 'tefekkur'] as TabType[]).map(tab => (
            <button 
              key={tab}
              onClick={() => {
                  setActiveTab(tab);
                  if (window.navigator.vibrate) window.navigator.vibrate(10);
              }}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[1.6rem] transition-all duration-300 relative ${activeTab === tab ? 'bg-gold-600 text-white shadow-lg border border-gold-50 scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 scale-95'}`}
            >
              {tab === 'sesler' ? 'SESLER' : tab === 'zikirler' ? 'ZİKİR' : tab === 'nefes' ? 'NEFES' : 'TEFEKKÜR'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar relative z-10 pt-4">
        {activeTab === 'sesler' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Volume Control Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex flex-col gap-6 shadow-sm mt-4">
               <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ses Seviyesi</p>
                  </div>
                  <span className="text-[11px] font-black text-gold-600 bg-gold-50 dark:bg-navy-950/20 px-3 py-1 rounded-lg shadow-sm border border-gold-100/30">%{Math.round(volume * 100)}</span>
               </div>
               <div className="flex items-center gap-5">
                  <span className="text-lg opacity-40">🔈</span>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={volume} 
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-gold-500" 
                  />
                  <span className="text-lg opacity-40">🔊</span>
               </div>
            </div>

            {/* Sounds Grid */}
            <div className="grid grid-cols-2 gap-4">
              {SOUNDS.map(sound => (
                <div 
                  key={sound.id}
                  onClick={() => toggleSound(sound)}
                  className={`p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer active:scale-95 group relative overflow-hidden ${playingSoundId === sound.id ? 'bg-gold-50/50 border-gold-200 shadow-md ring-2 ring-gold-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-gold-100 hover:bg-slate-50/30'}`}
                >
                  {playingSoundId === sound.id && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gold-500 w-full animate-pulse"></div>
                  )}
                  <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 transition-all duration-500 ${sound.color} ${playingSoundId === sound.id ? 'scale-110 shadow-sm' : 'opacity-70 group-hover:scale-105'}`}>
                    {sound.icon}
                  </div>
                  <h4 className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white leading-none">{sound.name}</h4>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${playingSoundId === sound.id ? 'text-gold-500' : 'text-slate-300 dark:text-slate-600'}`}>
                    {playingSoundId === sound.id ? 'OYNATILIYOR' : 'HAZIR'}
                  </p>
                </div>
              ))}
            </div>

            {/* Timer Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6 ml-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a668" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest">Kapanış Zamanlayıcı</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[15, 30, 45, 60].map(mins => (
                        <button 
                            key={mins}
                            onClick={() => {
                                setTimer(timer === mins ? null : mins);
                                if (window.navigator.vibrate) window.navigator.vibrate(20);
                            }}
                            className={`py-4 rounded-2xl font-black text-[10px] transition-all duration-300 border ${timer === mins ? 'bg-gold-600 border-gold-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800'}`}
                        >
                            {mins} DK
                        </button>
                    ))}
                </div>
                {timeLeft !== null && timer !== null && (
                    <div className="mt-8 flex items-center justify-center gap-4 animate-in fade-in zoom-in">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">KALAN: <span className="text-gold-600 text-xl tabular-nums tracking-tight ml-1.5">{formatTime(timeLeft)}</span></p>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                )}
            </div>
          </div>
        )}

        {activeTab === 'zikirler' && (
          <div className="space-y-12 animate-in fade-in duration-700 pt-10 flex flex-col items-center">
             <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-gold-50 dark:bg-navy-950/20 px-5 py-2 rounded-full border border-gold-100 mb-1 shadow-sm">
                   <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-ping"></div>
                   <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Kandil Modu</p>
                </div>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">{NIGHT_DHIKRS[activeDhikrIdx].name}</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">BÖLÜM {activeDhikrIdx + 1} / {NIGHT_DHIKRS.length}</p>
             </div>

             <div 
                onClick={handleDhikr}
                className="relative w-full max-w-[320px] aspect-square flex items-center justify-center cursor-pointer active:scale-95 transition-all group"
             >
                <div className="absolute inset-0 rounded-full bg-gold-500/5 blur-[40px] opacity-60"></div>
                
                <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle cx="160" cy="160" r="140" className="stroke-slate-100 fill-none" strokeWidth="16" />
                    <circle 
                        cx="160" cy="160" r="140" 
                        className="stroke-gold-600 fill-none transition-all duration-700 ease-out shadow-2xl" 
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={880}
                        strokeDashoffset={880 - (880 * (dhikrCount / NIGHT_DHIKRS[activeDhikrIdx].target))}
                    />
                </svg>

                <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
                    <div className="flex flex-col items-center justify-center -mt-2">
                        <span className="text-[8rem] font-black tracking-tighter tabular-nums text-slate-900 dark:text-white leading-none drop-shadow-sm">{dhikrCount}</span>
                        <div className="mt-2 py-1.5 px-5 bg-gold-50 dark:bg-navy-950/20 rounded-full border border-gold-100 shadow-sm">
                           <p className="text-[11px] font-black text-gold-500 uppercase tracking-[0.4em] leading-none">HEDEF {NIGHT_DHIKRS[activeDhikrIdx].target}</p>
                        </div>
                    </div>
                </div>
             </div>

             <div className="text-center pb-12 opacity-40">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em] animate-pulse">EKRANA DOKUNARAK DEVAM ET</p>
             </div>
          </div>
        )}

        {activeTab === 'nefes' && (
          <div className="space-y-12 animate-in fade-in duration-700 pt-10 flex flex-col items-center">
            <div className="text-center space-y-4">
                <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">4-7-8 Tekniği</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-[260px] mx-auto leading-relaxed">
                    Uykusuzluğu gideren ve sinir sistemini yatıştıran bilimsel nefes yöntemi.
                </p>
            </div>

            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gold-50/50 blur-3xl opacity-50"></div>
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[12px] border-gold-100 transition-all duration-[300ms] ease-linear origin-center"
                    style={{ 
                        width: breathingPhase === 'nefes al' ? `${120 + breathProgress * 1.5}px` : 
                               breathingPhase === 'tut' ? '280px' : 
                               breathingPhase === 'ver' ? `${280 - breathProgress * 1.5}px` : '160px',
                        height: breathingPhase === 'nefes al' ? `${120 + breathProgress * 1.5}px` : 
                                breathingPhase === 'tut' ? '280px' : 
                                breathingPhase === 'ver' ? `${280 - breathProgress * 1.5}px` : '160px',
                        opacity: breathingPhase === 'hazır' ? 0.3 : 1,
                        boxShadow: `0 0 ${breathingPhase !== 'hazır' ? '50px' : '0px'} rgba(99, 102, 241, 0.15)`
                    }}
                ></div>

                <div className="text-center z-10 relative flex flex-col items-center justify-center">
                    <p className="text-3xl font-black tracking-tighter text-gold-600 uppercase animate-pulse leading-none">{breathingPhase}</p>
                    {breathingPhase !== 'hazır' && (
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-3 uppercase tracking-widest opacity-80 text-center">Sakinleşin...</p>
                    )}
                </div>
            </div>

            <button 
                onClick={startBreathing}
                className={`px-16 py-5 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl active:scale-95 border-b-[4px] ${breathTimerRef.current ? 'bg-rose-500 border-rose-700 text-white shadow-rose-200' : 'bg-slate-900 border-slate-700 text-white shadow-slate-200'}`}
            >
                {breathTimerRef.current ? 'EGZERSİZİ DURDUR' : 'EGZERSİZİ BAŞLAT'}
            </button>

            <div className="grid grid-cols-3 gap-8 w-full px-8 pt-4">
                <div className="text-center space-y-2">
                    <div className="text-2xl">👃</div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">4 SN<br/>NEFES AL</p>
                </div>
                <div className="text-center space-y-2 border-x border-slate-100 dark:border-slate-800">
                    <div className="text-2xl">⏸️</div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">7 SN<br/>TUT</p>
                </div>
                <div className="text-center space-y-2">
                    <div className="text-2xl">🌬️</div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">8 SN<br/>NEFES VER</p>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'tefekkur' && (
          <div className="space-y-6 animate-in fade-in duration-700 pt-4">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2 mb-4">Günün Tefekkür Kartları</p>
            {TEFEKKUR_CARDS.map((card, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md hover:border-gold-100">
                   <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] text-[10rem] group-hover:scale-110 transition-transform duration-1000 rotate-6 text-navy-900 pointer-events-none">✨</div>
                   <div className="relative z-10 space-y-8 text-center">
                        <p className="text-xl font-medium leading-relaxed serif-text italic text-slate-700 dark:text-slate-300 dark:text-slate-600 px-2">
                            "{card.text}"
                        </p>
                        <div className="flex items-center justify-center gap-6">
                            <div className="w-10 h-px bg-slate-100 dark:bg-slate-800"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 whitespace-nowrap bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">{card.source}</span>
                            <div className="w-10 h-px bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                   </div>
                </div>
            ))}
            
            <div className="bg-gold-50/50 rounded-[3.5rem] p-10 border border-gold-100 text-center space-y-8 mt-10 relative overflow-hidden group">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.8rem] flex items-center justify-center mx-auto text-3xl shadow-sm border border-gold-50 transition-transform group-hover:scale-110 shadow-gold-100">📿</div>
                <div className="space-y-4">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Gece Tilaveti</h4>
                    <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed px-4 italic">
                        "Bakara suresinin son iki ayetini geceleyin okuyan kimseye onlar yeter."
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-gold-100 shadow-sm">RIYÂZÜ’S-SÂLIHÎN, 1017</span>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Audio Bar */}
      {playingSoundId && (
        <div className="fixed bottom-[110px] left-5 right-5 z-[50] bg-white dark:bg-slate-900 rounded-[2.8rem] p-4.5 flex items-center justify-between shadow-[0_15px_45px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex items-center gap-4 ml-2">
              <div className="w-12 h-12 bg-gold-50 dark:bg-navy-950/20 rounded-2xl flex items-center justify-center text-2xl animate-pulse shadow-sm border border-gold-100/50">
                {SOUNDS.find(s => s.id === playingSoundId)?.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest leading-none">Canlı Dinleti</p>
                <p className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">{SOUNDS.find(s => s.id === playingSoundId)?.name}</p>
              </div>
           </div>
           <button 
             onClick={() => { try { audioRef.current.pause(); } catch(e) {} setPlayingSoundId(null); }}
             className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform mr-1 hover:bg-slate-800"
           >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
           </button>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-40">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.75em]">99 BEREKET KAPISI V2.5</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default UykuTefekkur;
