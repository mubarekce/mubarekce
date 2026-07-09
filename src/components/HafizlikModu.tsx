
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';

const HafizlikModu: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<(Ayah & { audio: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [showArabic, setShowArabic] = useState(true);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        if (data.code === 200) setSurahs(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSurahs();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      if (isAutoPlaying) {
        if (currentRepeat < repeatCount - 1) {
          setCurrentRepeat(prev => prev + 1);
          audio.currentTime = 0;
          audio.play();
        } else {
          setCurrentRepeat(0);
          // Auto move to next ayah if within range
          if (currentAyahIdx < ayahs.length - 1) {
            setCurrentAyahIdx(prev => prev + 1);
          } else {
            setIsAutoPlaying(false);
          }
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isAutoPlaying, currentRepeat, repeatCount, currentAyahIdx, ayahs]);

  useEffect(() => {
    if (ayahs.length > 0 && isAutoPlaying) {
      audioRef.current.src = ayahs[currentAyahIdx].audio;
      audioRef.current.play();
    }
  }, [currentAyahIdx, ayahs, isAutoPlaying]);

  const loadSurah = async (surahNum: number) => {
    setLoading(true);
    try {
      const [arRes, trRes, audioRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/tr.diyanet`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`)
      ]);
      const [ar, tr, au] = await Promise.all([arRes.json(), trRes.json(), audioRes.json()]);

      const combined = ar.data.ayahs.map((a: any, i: number) => ({
        ...a,
        translation: tr.data.ayahs[i].text,
        audio: au.data.ayahs[i].audio
      }));

      setAyahs(combined);
      setCurrentAyahIdx(0);
      setCurrentRepeat(0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSurahSelect = (s: Surah) => {
    setSelectedSurah(s);
    loadSurah(s.number);
  };

  if (loading && !selectedSurah) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-8 h-full">
        <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sky-900 font-black uppercase tracking-widest text-xs">Sureler Hazırlanıyor</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 h-full relative animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#faf6f0]/80 dark:bg-[#0d1220]/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-50 dark:border-slate-800">
        <button onClick={selectedSurah ? () => { setSelectedSurah(null); setIsAutoPlaying(false); audioRef.current.pause(); } : onBack} className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">←</button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Hafızlık Modu</h2>
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Akıllı Ezber Algoritması</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {!selectedSurah ? (
          <div className="py-6 space-y-4">
            <div className="bg-sky-50 dark:bg-sky-950/20 rounded-[2.5rem] p-8 text-center border border-sky-100 mb-8">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">📖</div>
              <h3 className="text-lg font-black text-sky-900 mb-2">Ezber Başlat</h3>
              <p className="text-xs text-sky-600/60 font-medium leading-relaxed">Ezberlemek istediğiniz sureyi seçin, algoritma size en uygun tekrar sayısını sunsun.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {surahs.map(s => (
                <div 
                  key={s.number}
                  onClick={() => handleSurahSelect(s)}
                  className="p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-sky-50 dark:bg-sky-950/20 hover:border-sky-200 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 dark:text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all">{s.number}</div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{s.englishName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.numberOfAyahs} Ayet</p>
                    </div>
                  </div>
                  <div className="arabic-text text-xl font-bold text-slate-400 dark:text-slate-500 group-hover:text-sky-900 transition-colors">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ayetler Hazırlanıyor</p>
          </div>
        ) : (
          <div className="py-8 space-y-8 animate-in slide-in-from-bottom-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">{selectedSurah.englishName}</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">%{Math.round(((currentAyahIdx + 1) / ayahs.length) * 100)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-white">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  style={{ width: `${((currentAyahIdx + 1) / ayahs.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Display Card */}
            <div className="bg-[#f0f9ff] rounded-[3rem] p-10 text-center border border-sky-100 shadow-xl shadow-sky-900/5 relative overflow-hidden group">
               {/* Watermark Icon */}
               <div className="absolute top-10 right-10 opacity-[0.03] text-8xl pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">📖</div>
               
               <div className="relative z-10 space-y-8">
                  <div className="inline-block bg-sky-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-sky-200">Ayet {ayahs[currentAyahIdx]?.numberInSurah}</div>
                  
                  <div className="min-h-[120px] flex items-center justify-center">
                    <p className={`arabic-text text-4xl leading-[2.2] transition-all duration-700 ${showArabic ? 'text-slate-900 dark:text-white opacity-100 scale-100' : 'text-slate-300 dark:text-slate-600 opacity-0 scale-90 select-none blur-xl'}`}>
                      {ayahs[currentAyahIdx]?.text}
                    </p>
                    {!showArabic && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="text-sky-500 mb-2 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        </div>
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">METİN GİZLİ</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-sky-200/40">
                    <p className="text-sm font-semibold text-sky-900/60 leading-relaxed italic">
                      "{ayahs[currentAyahIdx]?.translation}"
                    </p>
                  </div>
               </div>
            </div>

            {/* Control Center */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">TEKRAR SAYISI</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{repeatCount} Kez</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 active:scale-90 transition-transform">-</button>
                  <button onClick={() => setRepeatCount(repeatCount + 1)} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 active:scale-90 transition-transform">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowArabic(!showArabic)}
                  className={`flex-1 flex flex-col items-center gap-2 py-6 rounded-[2rem] border transition-all duration-300 active:scale-95 ${showArabic ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500' : 'bg-sky-600 border-sky-500 text-white shadow-xl shadow-sky-200'}`}
                >
                  <div className={showArabic ? 'text-slate-400 dark:text-slate-500' : 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]'}>
                    {showArabic ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{showArabic ? 'GİZLE' : 'GÖSTER'}</span>
                </button>

                <button 
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`flex-[2] flex items-center justify-center gap-4 py-6 rounded-[2rem] text-white font-black transition-all active:scale-95 shadow-xl ${isAutoPlaying ? 'bg-rose-500 border-rose-400 shadow-rose-200 animate-pulse' : 'bg-sky-900 border-sky-800 shadow-sky-900/20'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    {isAutoPlaying ? '⏹️' : '▶️'}
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em]">{isAutoPlaying ? 'DURDUR' : 'AKILLI TEKRAR'}</span>
                  {isAutoPlaying && (
                    <div className="ml-2 bg-white dark:bg-slate-900 text-rose-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                      {currentRepeat + 1}
                    </div>
                  )}
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  disabled={currentAyahIdx === 0}
                  onClick={() => { setCurrentAyahIdx(prev => prev - 1); setCurrentRepeat(0); }}
                  className="flex-1 py-5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-3xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 border border-slate-100 dark:border-slate-800"
                >
                  ÖNCEKİ
                </button>
                <button 
                  disabled={currentAyahIdx === ayahs.length - 1}
                  onClick={() => { setCurrentAyahIdx(prev => prev + 1); setCurrentRepeat(0); }}
                  className="flex-1 py-5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-teal-100"
                >
                  SIRADAKİ
                </button>
              </div>
            </div>

            {/* Algorithm Info */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-4">
               <div className="text-sky-500 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
               </div>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">
                 <span className="text-sky-600">Akıllı İpucu:</span> Bir ayeti en az {repeatCount} kez dinledikten sonra metni gizleyerek kendinizi test etmeniz kalıcılığı %40 artırır.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HafizlikModu;
