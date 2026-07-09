
import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';

interface LessonItem {
  ar: string;
  tr: string;
  audio?: string;
}

interface Lesson {
  id: number;
  title: string;
  desc: string;
  items: LessonItem[];
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Harfler",
    desc: "Kuran Alfabesi - Temel Harfler",
    items: [
      { ar: "ا", tr: "Elif" }, { ar: "ب", tr: "Be" }, { ar: "ت", tr: "Te" }, { ar: "ث", tr: "Se" },
      { ar: "ج", tr: "Cim" }, { ar: "ح", tr: "Ha" }, { ar: "خ", tr: "Hı" }, { ar: "د", tr: "Dal" },
      { ar: "ذ", tr: "Zel" }, { ar: "ر", tr: "Ra" }, { ar: "ز", tr: "Ze" }, { ar: "س", tr: "Sin" },
      { ar: "ش", tr: "Şın" }, { ar: "ص", tr: "Sad" }, { ar: "ض", tr: "Dad" }, { ar: "ط", tr: "Tı" },
      { ar: "ظ", tr: "Zı" }, { ar: "ع", tr: "Ayın" }, { ar: "غ", tr: "Gayın" }, { ar: "ف", tr: "Fe" },
      { ar: "ق", tr: "Kaf" }, { ar: "ك", tr: "Kef" }, { ar: "ل", tr: "Lam" }, { ar: "م", tr: "Mim" },
      { ar: "ن", tr: "Nun" }, { ar: "و", tr: "Vav" }, { ar: "ه", tr: "He" }, { ar: "لا", tr: "Lamelif" },
      { ar: "ي", tr: "Ye" }
    ]
  },
  {
    id: 2,
    title: "Harekerler: Üstün (E-A)",
    desc: "Harflerin üzerine gelen düz çizgi.",
    items: [
      { ar: "اَ", tr: "E" }, { ar: "بَ", tr: "Be" }, { ar: "تَ", tr: "Te" }, { ar: "ثَ", tr: "Se" },
      { ar: "جَ", tr: "Ce" }, { ar: "حَ", tr: "Ha" }, { ar: "خَ", tr: "Ha" }
    ]
  },
  {
    id: 3,
    title: "Harekerler: Esre (İ-I)",
    desc: "Harflerin altına gelen düz çizgi.",
    items: [
      { ar: "اِ", tr: "İ" }, { ar: "بِ", tr: "Bi" }, { ar: "تِ", tr: "Ti" }, { ar: "ثِ", tr: "Si" }
    ]
  },
  {
    id: 4,
    title: "Harekerler: Ötre (Ü-U)",
    desc: "Harflerin üzerine gelen küçük vav şekli.",
    items: [
      { ar: "اُ", tr: "Ü" }, { ar: "بُ", tr: "Bü" }, { ar: "تُ", tr: "Tü" }, { ar: "ثُ", tr: "Sü" }
    ]
  }
];

const ElifBa: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { getField, setField } = useUserData();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>(() =>
    getField('elifba_progress', [] as number[])
  );

  const toggleComplete = (id: number) => {
    setCompletedLessons(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setField('elifba_progress', next);
      return next;
    });
  };

  const playSound = (text: string) => {
    // Burada ileride gerçek ses API'sı bağlanabilir
    // Şu an sadece görsel geri bildirim veriyoruz
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 h-full relative animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#faf6f0]/80 dark:bg-[#0d1220]/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={selectedLesson ? () => setSelectedLesson(null) : onBack} 
          className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 transition-transform"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {selectedLesson ? selectedLesson.title : "Elif Ba"}
          </h2>
          <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">
            {selectedLesson ? "DERS İÇERİĞİ" : "Kuran Öğreniyorum"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {!selectedLesson ? (
          <div className="py-6 space-y-4">
            {/* Progress Card */}
            <div className="bg-gold-50 dark:bg-navy-950/20 rounded-[2.5rem] p-8 border border-gold-100 mb-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-6xl">📖</div>
               <h3 className="text-lg font-black text-navy-900 mb-1">Öğrenme Yolculuğun</h3>
               <p className="text-xs text-gold-700/60 font-medium mb-6">Toplam {LESSONS.length} dersten {completedLessons.length} tanesini tamamladın.</p>
               <div className="w-full h-2.5 bg-white/50 rounded-full overflow-hidden border border-gold-100">
                  <div 
                    className="h-full bg-gold-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-1000"
                    style={{ width: `${(completedLessons.length / LESSONS.length) * 100}%` }}
                  ></div>
               </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2 mb-4">DERS MÜFREDATI</p>
              {LESSONS.map((lesson) => (
                <div 
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="p-5 bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-5 hover:bg-gold-50 dark:bg-navy-950/20 hover:border-gold-100 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${completedLessons.includes(lesson.id) ? 'bg-gold-500 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-gold-100'}`}>
                    {completedLessons.includes(lesson.id) ? "✓" : lesson.id}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{lesson.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{lesson.desc}</p>
                  </div>
                  <div className="text-slate-200 group-hover:text-gold-500 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
              
              <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] text-center opacity-60">
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Diğer dersler yakında eklenecek</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-8 animate-in slide-in-from-bottom-6">
            <div className="grid grid-cols-4 gap-4">
              {selectedLesson.items.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => playSound(item.ar)}
                  className="aspect-square bg-[#fcfdfd] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-gold-200 hover:bg-gold-50 dark:bg-navy-950/20 transition-all cursor-pointer active:scale-90 group"
                >
                  <span className="arabic-text text-3xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-gold-700 transition-colors">{item.ar}</span>
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-gold-600 transition-colors">{item.tr}</span>
                </div>
              ))}
            </div>

            <div className="pt-10">
               <button 
                 onClick={() => { toggleComplete(selectedLesson.id); setSelectedLesson(null); }}
                 className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${completedLessons.includes(selectedLesson.id) ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-gold-600 text-white shadow-gold-200'}`}
               >
                 {completedLessons.includes(selectedLesson.id) ? "Ders Tamamlandı Olarak İşaretlendi" : "Dersi Bitirdim"}
               </button>
            </div>

            <div className="p-6 bg-gold-50/50 rounded-[2.2rem] border border-dashed border-gold-200 flex items-center gap-4">
               <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm text-gold-500">💡</div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">
                 <span className="text-gold-600">Öneri:</span> Harflerin çıkış yerlerine (mahreç) dikkat ederek tekrar etmen, Kuran tilavetini daha güzel kılacaktır.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElifBa;
