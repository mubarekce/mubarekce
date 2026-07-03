import React, { useState, useRef, useEffect } from 'react';

interface RadioStation {
  id: string;
  name: string;
  slogan: string;
  url: string;
  logo: string;
  color: string;
}

const STATIONS: RadioStation[] = [
  { id: 'diyanet', name: 'Diyanet Radyo', slogan: 'Sizin Sesiniz', url: 'https://dd7928.radioca.st/stream', logo: '📡', color: 'bg-sky-600' },
  { id: 'diyanet_kuran', name: 'Diyanet Kur\'an', slogan: 'Kur\'an Sesi', url: 'https://dd7928.radioca.st/kuran', logo: '📖', color: 'bg-emerald-600' },
  { id: 'diyanet_risalet', name: 'Diyanet Risalet', slogan: 'Sünnetin Sesi', url: 'https://dd7928.radioca.st/risalet', logo: '🛡️', color: 'bg-amber-600' },
  { id: 'mevlana', name: 'Radyo Mevlana', slogan: 'Gönül Bahçesi', url: 'https://yayin.radyomevlana.com:8020/stream', logo: '🕌', color: 'bg-emerald-700' },
  { id: 'moral', name: 'Moral FM', slogan: 'Ailenizin Radyosu', url: 'https://yayin1.yayindes.com:1082/stream', logo: '✨', color: 'bg-indigo-600' },
  { id: 'akra', name: 'Akra FM', slogan: 'Hakka Çağrı', url: 'https://akra.canliyayin.org/akra-64', logo: '🎙️', color: 'bg-sky-700' },
];

const ReligiousRadios: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    
    const handleCanPlay = () => setLoading(false);
    const handleWaiting = () => setLoading(true);
    const handleError = () => {
      setLoading(false);
      setPlayingId(null);
      alert("Yayın şu an kullanılamıyor.");
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = (station: RadioStation) => {
    const audio = audioRef.current;
    if (playingId === station.id) {
      audio.pause();
      setPlayingId(null);
      setLoading(false);
    } else {
      setLoading(true);
      setPlayingId(station.id);
      audio.pause();
      audio.src = station.url;
      audio.play().catch(e => {
        console.error(e);
        setLoading(false);
        setPlayingId(null);
      });
    }
    if (window.navigator.vibrate) window.navigator.vibrate(25);
  };

  const currentStation = STATIONS.find(s => s.id === playingId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-pink-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 tracking-tight leading-none uppercase">Dini Radyolar</h2>
            <p className="text-[8px] font-black text-pink-500 uppercase tracking-[0.25em] mt-1">KESİNTİSİZ YAYIN</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-lg border border-pink-100 text-pink-500 animate-pulse">📻</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar pt-6 space-y-6">
        
        {/* Intro Card */}
        <div className="bg-[#fdf2f8] rounded-[2.5rem] p-8 text-center border border-pink-100 shadow-sm relative overflow-hidden group">
           <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] text-[10rem] pointer-events-none rotate-12 transition-transform group-hover:scale-110 text-pink-900">📡</div>
           <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black text-pink-950 tracking-tighter">Manevi Bir Yolculuk</h3>
              <p className="text-[13px] font-medium text-pink-800/60 leading-relaxed italic px-6">
                "En sevilen dini radyo kanalları tek bir dokunuşla, her an cebinizde."
              </p>
           </div>
        </div>

        {/* Radio List */}
        <div className="grid grid-cols-1 gap-3.5">
          {STATIONS.map((station) => (
            <div 
              key={station.id}
              onClick={() => togglePlay(station)}
              className={`p-5 rounded-[2.2rem] border flex items-center justify-between transition-all duration-500 cursor-pointer active:scale-[0.98] group ${playingId === station.id ? 'bg-pink-50/50 border-pink-200 shadow-md ring-2 ring-pink-500/10' : 'bg-white border-slate-50 hover:border-pink-100 hover:bg-slate-50/30'}`}
            >
              <div className="flex items-center gap-5">
                 <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl transition-all duration-500 shadow-inner border border-white/50 ${station.color} text-white group-hover:scale-110`}>
                    {station.logo}
                 </div>
                 <div className="space-y-0.5">
                    <h4 className="text-[15px] font-black text-slate-900 group-hover:text-pink-700 transition-colors">{station.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{station.slogan}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 {playingId === station.id && loading && (
                    <div className="w-5 h-5 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                 )}
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playingId === station.id ? 'bg-pink-600 text-white shadow-lg rotate-[360deg]' : 'bg-slate-50 text-slate-300'}`}>
                    {playingId === station.id ? (
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip Card */}
        <div className="bg-white border border-dashed border-pink-200 rounded-[2.5rem] p-8 flex items-start gap-5">
           <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 border border-pink-100">💡</div>
           <div className="space-y-1">
              <h6 className="text-[10px] font-black text-pink-600 uppercase tracking-widest">REHBER NOTU</h6>
              <p className="text-[12px] font-semibold text-slate-500 leading-relaxed italic">
                "Sesin olduğu yerde kalp huzur bulur. Çalışırken veya dinlenirken maneviyat dolu yayınları dinleyebilirsiniz."
              </p>
           </div>
        </div>

      </div>

      {/* Floating Player Bar */}
      {playingId && currentStation && (
        <div className="fixed bottom-[110px] left-5 right-5 z-[50] bg-white/95 backdrop-blur-xl rounded-[2.8rem] p-4.5 flex items-center justify-between shadow-[0_20px_50px_rgba(236,72,153,0.15)] border border-pink-100 animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex items-center gap-4 ml-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl animate-pulse shadow-sm border border-white/50 ${currentStation.color} text-white`}>
                 {currentStation.logo}
              </div>
              <div className="space-y-0.5">
                 <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest leading-none">CANLI YAYIN</p>
                 <p className="text-[14px] font-bold text-slate-900 tracking-tight">{currentStation.name}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 mr-1">
              <div className="hidden md:flex items-center gap-3 w-24">
                 <span className="text-xs opacity-40">🔈</span>
                 <input 
                   type="range" min="0" max="1" step="0.01" 
                   value={volume} 
                   onChange={e => setVolume(parseFloat(e.target.value))}
                   className="flex-1 h-1 bg-pink-100 rounded-full appearance-none cursor-pointer accent-pink-500" 
                 />
              </div>
              <button 
                onClick={() => { audioRef.current.pause(); setPlayingId(null); }}
                className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
           </div>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-40 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ RADYO MERKEZİ</p>
      </div>
    </div>
  );
};

export default ReligiousRadios;