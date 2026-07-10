
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const RuyaTabiri: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interpretation && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interpretation]);

  const interpretDream = async () => {
    if (!dreamText.trim() || loading) return;

    setLoading(true);
    setInterpretation(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: dreamText,
        config: {
          systemInstruction: "Sen uzman bir İslami rüya tabircisisin. Kullanıcının rüyalarını İmam Nablusi, İbn-i Şirin ve Cafer-i Sadık gibi sahih kaynaklar ışığında yorumla. Cevapların her zaman 'Hayırdır inşallah' diyerek başlasın. Eğer rüya korkutucu veya olumsuzsa, sadaka vermeyi ve dua etmeyi tavsiye eden nazik bir dil kullan. Yorumun sonunda bunun bir rehberlik olduğunu ve her şeyin en iyisini Allah'ın bileceğini belirt."
        }
      });

      setInterpretation(response.text || "Yorum getirilemedi. Lütfen tekrar deneyin.");
    } catch (error) {
      console.error(error);
      setInterpretation("Bağlantı sırasında bir hata oluştu. Lütfen internetinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-300 overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-5 bg-[#f3f7e9]/80 dark:bg-[#0a1f1a]/80 backdrop-blur-md sticky top-0 z-30 border-b border-fuchsia-50/50">
        <button onClick={onBack} className="w-11 h-11 bg-slate-50 dark:bg-navy-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-navy-900 active:scale-90 transition-transform">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h2 className="text-[20px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Rüya Tabiri</h2>
          <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em] mt-1">Sahih Kaynaklı AI Yorumu</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-10 pt-6">
        {/* Intro Illustration */}
        {!interpretation && !loading && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
             <div className="w-24 h-24 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-fuchsia-100 group">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                  <path d="M12 2l.642 2.006 2.108.022-1.693 1.25.66 2.097-1.717-1.218-1.717 1.218.66-2.097-1.693-1.25 2.108-.022L12 2z"/>
                  <path d="M21 15a3 3 0 0 0-3-3h-1v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8.5z"/>
                </svg>
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Rüyanızın Sırrını Çözün</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed px-10">
                  Gördüğünüz rüyayı detaylarıyla anlatın, yapay zekamız İslami literatüre uygun şekilde yorumlasın.
                </p>
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`space-y-4 transition-all duration-500 ${interpretation ? 'mt-0' : 'mt-4'}`}>
           <div className="relative">
              <textarea 
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                placeholder="Rüyanızı buraya yazın..."
                className="w-full min-h-[200px] bg-slate-50 dark:bg-navy-800 border-2 border-transparent focus:border-fuchsia-100 focus:bg-white dark:bg-navy-800 rounded-[2.5rem] p-8 outline-none font-bold text-sm text-slate-700 dark:text-slate-300 dark:text-slate-600 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-600 shadow-inner resize-none"
                disabled={loading}
              ></textarea>
              <div className="absolute bottom-6 right-8 flex items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${dreamText.length > 500 ? 'text-rose-500' : 'text-slate-200'}`}>
                   {dreamText.length} KARAKTER
                 </span>
              </div>
           </div>

           {!interpretation && (
             <button 
                onClick={interpretDream}
                disabled={!dreamText.trim() || loading}
                className="w-full py-5 bg-fuchsia-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-fuchsia-900/10 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
             >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    TABİR EDİLİYOR...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l.642 2.006 2.108.022-1.693 1.25.66 2.097-1.717-1.218-1.717 1.218.66-2.097-1.693-1.25 2.108-.022L12 2z"/><path d="M21 15a3 3 0 0 0-3-3h-1v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8.5z"/></svg>
                    TABİR ET
                  </>
                )}
             </button>
           )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-10 text-center space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-center gap-3">
                <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full animate-bounce delay-200"></div>
             </div>
             <p className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.4em]">Manevi Kaynaklar Taranıyor</p>
          </div>
        )}

        {/* Interpretation Result */}
        {interpretation && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
             <div className="flex items-center gap-3 ml-2">
                <div className="w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_12px_rgba(217,70,239,0.7)] animate-pulse"></div>
                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.45em]">RÜYA TABİRİ</h5>
             </div>

             <div className="bg-white dark:bg-navy-800 rounded-[3rem] p-10 border border-slate-50 dark:border-navy-900 shadow-xl shadow-fuchsia-900/5 relative overflow-hidden group">
                <div className="absolute right-[-5%] top-[-5%] p-8 opacity-[0.03] group-hover:scale-110 transition-transform text-[10rem] pointer-events-none rotate-6 text-fuchsia-900">✨</div>
                
                <div className="relative z-10 space-y-6">
                   <p className="text-[16px] font-medium text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {interpretation}
                   </p>
                </div>
             </div>

             <div className="bg-gold-50/50 p-8 rounded-[2.5rem] border border-dashed border-gold-200 flex items-start gap-5">
                <div className="w-12 h-12 bg-white dark:bg-navy-800 rounded-2xl flex items-center justify-center text-xl shadow-sm shrink-0">🛡️</div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic">
                  "Rüya anlatırken yalan söylemekten sakınınız. Görülen rüyalar müjdecidir veya birer uyarıdır. Hayra yormak esastır."
                </p>
             </div>

             <button 
                onClick={() => { setInterpretation(null); setDreamText(''); }}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
             >
                YENİ TABİR BAŞLAT
             </button>
          </div>
        )}
      </div>

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-20">
        <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.65em]">RÜYA-YI SADIKA V3.2</p>
      </div>
    </div>
  );
};

export default RuyaTabiri;
