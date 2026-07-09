import React, { useState } from 'react';

type StreamType = 'mekke' | 'medine';

interface StreamInfo {
  id: StreamType;
  title: string;
  subTitle: string;
  embedUrl: string;
  description: string;
  icon: string;
  color: string;
}

const STREAMS: StreamInfo[] = [
  {
    id: 'mekke',
    title: 'Mekke Canlı',
    subTitle: 'Kabe-i Muazzama',
    // Using a reliable generic live URL for Saudi Quran TV
    embedUrl: 'https://www.youtube.com/embed/6iW_pWvV-sM?autoplay=1&mute=0',
    description: 'Yeryüzünün kalbi, müminlerin kıblesi Kabe-i Muazzama’dan 7/24 kesintisiz canlı yayın. Rabbimizin evini her an kalbinizde hissedin.',
    icon: '🕋',
    color: 'bg-gold-600'
  },
  {
    id: 'medine',
    title: 'Medine Canlı',
    subTitle: 'Mescid-i Nebevi',
    // Using a reliable generic live URL for Saudi Sunnah TV
    embedUrl: 'https://www.youtube.com/embed/M_n-X9lY70M?autoplay=1&mute=0',
    description: 'Peygamber Efendimiz (sav)’in huzuru, Ravza-i Mutahhara ve Mescid-i Nebevi’den canlı yayın. Gönüllerin sığınağına manevi bir yolculuk yapın.',
    icon: '🕌',
    color: 'bg-gold-600'
  }
];

const LiveStreams: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<StreamType>('mekke');
  const currentStream = STREAMS.find(s => s.id === activeTab)!;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-gold-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Premium Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-[#faf6f0]/80 dark:bg-[#0d1220]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Canlı Yayın</h2>
            <p className="text-[8px] font-black text-gold-600 uppercase tracking-[0.25em] mt-1">Haremeyn-i Şerifeyn</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-gold-50 dark:bg-navy-950/20 rounded-xl flex items-center justify-center text-lg border border-gold-100 text-gold-600 animate-pulse">📡</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-6 space-y-8">
        
        {/* Tab Switcher - Premium Style */}
        <div className="bg-slate-100/60 p-1.5 rounded-[2rem] flex border border-slate-200/50 shadow-inner">
          {STREAMS.map(stream => (
            <button 
              key={stream.id} 
              onClick={() => setActiveTab(stream.id)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.6rem] transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === stream.id ? 'bg-gold-600 text-white shadow-lg border border-gold-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}
            >
              <span className="text-base">{stream.icon}</span>
              {stream.title}
            </button>
          ))}
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl ring-4 ring-white border border-slate-100 dark:border-slate-800 group">
          <iframe 
            src={currentStream.embedUrl}
            title={currentStream.title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          
          {/* Overlay info that disappears on hover if possible, but keeping it simple for now */}
          <div className="absolute top-4 left-4 pointer-events-none">
             <div className="bg-rose-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-rose-500">
                <span className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full animate-ping"></span>
                <span className="text-[9px] font-black uppercase tracking-widest">CANLI</span>
             </div>
          </div>
        </div>

        {/* Stream Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden group">
          <div className="absolute right-[-10%] top-[-5%] opacity-[0.03] text-[10rem] pointer-events-none rotate-12 transition-transform group-hover:scale-110">🕋</div>
          
          <div className="relative z-10 space-y-4">
             <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{currentStream.title}</h3>
                <p className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em]">{currentStream.subTitle}</p>
             </div>
             
             <div className="h-px w-full bg-slate-50 dark:bg-slate-900"></div>
             
             <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-[1.8] italic">
               "{currentStream.description}"
             </p>

             {/* Spiritual Actions at the Bottom */}
             <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="bg-gold-50/50 p-5 rounded-3xl border border-gold-100/50 text-center hover:bg-gold-50 dark:bg-navy-950/20 transition-colors">
                   <p className="text-[9px] font-black text-gold-600 uppercase tracking-widest mb-1.5">MANEVİ NOT</p>
                   <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-tight">İbadetlerin en hayırlısı huzurla yapılandır.</p>
                </div>
                <div className="bg-sky-50/50 p-5 rounded-3xl border border-sky-100/50 text-center hover:bg-sky-50 dark:bg-sky-950/20 transition-colors">
                   <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1.5">PRO+ AYRICALIĞI</p>
                   <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-tight">Kesintisiz 4K kalitesinde izleme modu.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Prayer Quote Card */}
        <div className="bg-navy-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-navy-950/20 text-center">
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center">
              <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
           </div>
           <div className="relative z-10 space-y-4">
              <p className="text-gold-400 text-[9px] font-black uppercase tracking-[0.6em]">TEFEKKÜR VAKTİ</p>
              <h4 className="text-xl font-medium serif-text italic leading-relaxed px-2">
                "Kabe'ye bakmak ibadettir. Bakarken yapılan dualar geri çevrilmez."
              </h4>
              <div className="h-px w-12 bg-white/20 mx-auto"></div>
              <p className="text-[8px] font-black text-gold-500 uppercase tracking-widest">HAYIRLI TEFEKKÜRLER</p>
           </div>
        </div>

      </div>

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-40 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ CANLI YAYIN MODÜLÜ</p>
      </div>
    </div>
  );
};

export default LiveStreams;