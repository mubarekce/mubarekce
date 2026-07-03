import React, { useState, useEffect } from 'react';

interface StoryContent {
  id: string;
  type: string;
  title: string;
  arabic?: string;
  content: string;
  source: string;
  bgGradient: string;
}

// Günlük içerik havuzu (Her gün tarih bazlı bir tanesi seçilir)
const STORY_DATA: Record<string, StoryContent[]> = {
  AYET: [
    { id: 'a1', type: 'AYET', title: 'GÜNÜN AYETİ', arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', content: 'Sabır ve namazla Allah’tan yardım isteyin.', source: 'Bakara, 45', bgGradient: 'from-teal-900 via-teal-800 to-teal-900' },
    { id: 'a2', type: 'AYET', title: 'GÜNÜN AYETİ', arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', content: 'Şüphesiz güçlükle beraber bir kolaylık vardır.', source: 'İnşirah, 6', bgGradient: 'from-teal-900 via-teal-800 to-teal-950' }
  ],
  HADİS: [
    { id: 'h1', type: 'HADİS', title: 'GÜNÜN HADİSİ', arabic: 'اَلدِّينُ النَّصِيحَةُ', content: 'Din samimiyettir (nasihattir).', source: 'Müslim, Îmân, 95', bgGradient: 'from-amber-800 via-orange-800 to-amber-950' },
    { id: 'h2', type: 'HADİS', title: 'GÜNÜN HADİSİ', arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', content: 'Güzel söz sadakadır.', source: 'Buhârî, Cihâd, 128', bgGradient: 'from-orange-900 via-amber-800 to-orange-950' }
  ],
  DUA: [
    { id: 'd1', type: 'DUA', title: 'GÜNÜN DUASI', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', content: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.', source: 'Bakara, 201', bgGradient: 'from-indigo-900 via-blue-800 to-indigo-950' },
    { id: 'd2', type: 'DUA', title: 'GÜNÜN DUASI', arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', content: 'Ey kalpleri evirip çeviren Allah’ım! Kalbimi dinin üzerinde sabit kıl.', source: 'Tirmizî, Deavât, 74', bgGradient: 'from-blue-900 via-indigo-800 to-blue-950' }
  ],
  SÜNNET: [
    { id: 's1', type: 'SÜNNET', title: 'GÜNÜN SÜNNETİ', content: 'Yemeğe tuzla başlamak ve sağ el ile yemek.', source: 'Sünnet-i Seniyye', bgGradient: 'from-rose-900 via-pink-800 to-rose-950' },
    { id: 's2', type: 'SÜNNET', title: 'GÜNÜN SÜNNETİ', content: 'Uyumadan önce sağ tarafına yatmak ve dua etmek.', source: 'Sünnet-i Seniyye', bgGradient: 'from-pink-900 via-rose-800 to-pink-950' }
  ]
};

interface StoryViewerProps {
  category: string;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ category, onClose }) => {
  const [progress, setProgress] = useState(0);
  
  // O güne özel hikayeyi seçen mantık (Tarih bazlı)
  const dailyStory = useMemo(() => {
    const list = STORY_DATA[category] || STORY_DATA['AYET'];
    const day = new Date().getDate();
    return list[day % list.length];
  }, [category]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onClose();
          return 100;
        }
        return prev + 0.5;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onClose]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const width = window.innerWidth;
    if (x < width / 3) {
      // Geri özelliği gerekirse burada resetlenebilir, şimdilik Instagram mantığı
      setProgress(0);
    } else if (x > (width / 3) * 2) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] bg-gradient-to-br ${dailyStory.bgGradient} flex flex-col animate-in fade-in duration-300 select-none`}
      onClick={handleTouch}
    >
      {/* Bars */}
      <div className="px-4 pt-12 flex gap-1.5 z-50">
        <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Top Info */}
      <div className="px-6 pt-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white font-black text-xs">
            {category[0]}
          </div>
          <div>
            <h4 className="text-white font-black text-[11px] tracking-widest uppercase">{dailyStory.title}</h4>
            <p className="text-white/50 text-[8px] font-bold uppercase tracking-widest">MÜBAREKÇE PRO+</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-white/70 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-12">
        {dailyStory.arabic && (
          <p className="arabic-text text-5xl leading-[1.8] text-white drop-shadow-2xl animate-in slide-in-from-bottom-10 duration-1000" dir="rtl">
            {dailyStory.arabic}
          </p>
        )}
        
        <div className="space-y-6 max-w-xs animate-in fade-in zoom-in duration-700 delay-300">
          <div className="w-12 h-[1px] bg-white/30 mx-auto"></div>
          <p className="text-white text-2xl font-bold leading-relaxed serif-text italic drop-shadow-lg">
            "{dailyStory.content}"
          </p>
          <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">{dailyStory.source}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pb-12 text-center opacity-20">
        <p className="text-[9px] font-black text-white uppercase tracking-[0.8em]">MÜBAREKÇE GÜNLÜK MANEVİYAT</p>
      </div>

      {/* Interaction Help Overlay (Faint) */}
      <div className="absolute inset-y-0 left-0 w-24 z-40"></div>
      <div className="absolute inset-y-0 right-0 w-24 z-40"></div>
    </div>
  );
};

export default StoryViewer;
import { useMemo } from 'react';