import React, { useState, useEffect, useMemo } from 'react';
import {
  StoryCategory,
  StoriesConfig,
  DEFAULT_STORIES,
  CATEGORY_TITLES,
  CATEGORY_GRADIENTS,
  subscribeStories,
  pickDailyStory,
} from '../services/storyConfig';

interface StoryViewerProps {
  category: string;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ category, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [storiesConfig, setStoriesConfig] = useState<StoriesConfig>(DEFAULT_STORIES);

  useEffect(() => {
    const unsub = subscribeStories(setStoriesConfig);
    return () => unsub();
  }, []);

  const cat = (category in storiesConfig ? category : 'AYET') as StoryCategory;

  // O güne özel hikayeyi seçen mantık (admin "günlük otomatik değişsin" dediyse
  // tarihe göre döner, kapattıysa admin'in sabitlediği içerik herkese gösterilir)
  const dailyStory = useMemo(() => {
    const categoryData = storiesConfig[cat] || DEFAULT_STORIES.AYET;
    return pickDailyStory(categoryData);
  }, [storiesConfig, cat]);

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
      setProgress(0);
    } else if (x > (width / 3) * 2) {
      onClose();
    }
  };

  if (!dailyStory) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-900 flex items-center justify-center" onClick={onClose}>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">İçerik bulunamadı</p>
      </div>
    );
  }

  const title = CATEGORY_TITLES[cat] || 'GÜNÜN İÇERİĞİ';
  const bgGradient = CATEGORY_GRADIENTS[cat] || CATEGORY_GRADIENTS.AYET;

  return (
    <div 
      className={`fixed inset-0 z-[1000] bg-gradient-to-br ${bgGradient} flex flex-col animate-in fade-in duration-300 select-none`}
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
            {cat[0]}
          </div>
          <div>
            <h4 className="text-white font-black text-[11px] tracking-widest uppercase">{title}</h4>
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
