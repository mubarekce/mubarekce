import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';

interface MessageCard {
  id: string;
  category: 'hat' | 'güllü' | 'dualarlı' | 'kısa';
  content: string;
  imageUrl?: string;
  isCustom?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'TÜMÜ' },
  { id: 'hat', label: 'HAT SANATI' },
  { id: 'güllü', label: 'ÇİÇEKLİ' },
  { id: 'dualarlı', label: 'DUALAR' },
  { id: 'kısa', label: 'KISA & ÖZ' }
];

const STATIC_MESSAGES: MessageCard[] = [
  { id: '1', category: 'hat', content: 'Gönüller duada birleşince cumalar güzelleşir. Hayırlı Cumalar.', imageUrl: 'https://images.unsplash.com/photo-1542640244-7e672d6cef21?w=800&auto=format&fit=crop' },
  { id: '2', category: 'dualarlı', content: 'Rabbim bu mübarek gün hürmetine günahlarımızı af, dualarımızı kabul eylesin. Selam ve dua ile...', imageUrl: 'https://images.unsplash.com/photo-1590076214667-c0f3531682b8?w=800&auto=format&fit=crop' },
  { id: '3', category: 'güllü', content: 'Cumanız mübarek, kalbiniz huzurla dolsun. En güzel dualarda buluşmak dileğiyle.', imageUrl: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&auto=format&fit=crop' },
  { id: '4', category: 'kısa', content: 'Hayırlı bereketli Cumalar dilerim.', imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop' },
  { id: '5', category: 'dualarlı', content: 'Allahümme salli ala seyyidina Muhammedin ve ala ali seyyidina Muhammed. Hayırlı Cumalar.', imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&auto=format&fit=crop' },
  { id: '6', category: 'hat', content: 'Ya Rabbi! Sesimizi duyansın, hallerimizi bilensin. Dualarımızı kabul eyle. Cumanız mübarek olsun.', imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop' },
];

const FridayMessages: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeCat, setActiveCat] = useState('all');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTheme, setAiTheme] = useState('bereket');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [customMessages, setCustomMessages] = useState<MessageCard[]>([]);

  const filteredMessages = useMemo(() => {
    const combined = [...customMessages, ...STATIC_MESSAGES];
    if (activeCat === 'all') return combined;
    return combined.filter(m => m.category === activeCat);
  }, [activeCat, customMessages]);

  const generateAiMessage = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Bana ${aiTheme} temalı, nazik, kısa ve paylaşılabilir bir Hayırlı Cumalar mesajı yazar mısın? Sadece mesajın kendisini yaz.`,
        config: { systemInstruction: 'Sen nazik bir İslami içerik üreticisisin.' }
      });
      const text = response.text?.trim() || "Cumanız mübarek olsun.";
      setAiResult(text);
    } catch (e) {
      setAiResult("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setAiLoading(false);
    }
  };

  const addAiToCustom = () => {
    if (!aiResult) return;
    const newMessage: MessageCard = {
      id: Date.now().toString(),
      category: 'kısa',
      content: aiResult,
      isCustom: true,
      imageUrl: 'https://images.unsplash.com/photo-1520004434532-668416a08753?w=800&auto=format&fit=crop'
    };
    setCustomMessages([newMessage, ...customMessages]);
    setShowAiModal(false);
    setAiResult(null);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleShare = async (msg: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hayırlı Cumalar',
          text: msg,
          url: window.location.href,
        });
      } catch (e) { console.error(e); }
    } else {
      navigator.clipboard.writeText(msg);
      alert("Mesaj panoya kopyalandı!");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-cyan-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Compact Header */}
      <div className="px-5 pt-8 pb-3 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-none uppercase">Hayırlı Cumalar</h2>
            <p className="text-[7px] font-black text-cyan-600 uppercase tracking-[0.2em] mt-0.5">PAYLAŞILABİLİR KARTLAR</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAiModal(true)}
          className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center text-base border border-cyan-100 text-cyan-600 animate-pulse"
        >
          ✨
        </button>
      </div>

      {/* Tighter Category Tabs */}
      <div className="px-5 py-2 bg-white/80 sticky top-[66px] z-30 overflow-x-auto no-scrollbar flex gap-1.5 border-b border-slate-50">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCat === cat.id ? 'bg-cyan-600 text-white border-cyan-500 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar pt-3 space-y-4">
        {/* Tighter Intro Banner */}
        <div className="bg-[#ecfeff] rounded-[2rem] p-5 text-center border border-cyan-100 shadow-sm relative overflow-hidden group">
           <div className="absolute right-[-2%] top-[-5%] opacity-[0.05] text-[6rem] pointer-events-none rotate-12 transition-transform group-hover:scale-110 text-cyan-900">🕯️</div>
           <div className="relative z-10 space-y-1">
              <h3 className="text-base font-black text-cyan-950 tracking-tight">Sevginizi Paylaşın</h3>
              <p className="text-[11px] font-medium text-cyan-800/60 leading-tight italic">
                "Birbirinize dua edin, dua kardeşliktir."
              </p>
           </div>
        </div>

        {/* Message Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id}
              className="bg-white rounded-[2.2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 group relative"
            >
              <div className="aspect-[16/11] w-full relative overflow-hidden">
                <img src={msg.imageUrl} alt="Cuma Mesajı" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
                <div className="absolute bottom-4 left-5 right-5">
                   <p className="text-white text-sm md:text-base font-bold leading-relaxed serif-text italic drop-shadow-md">
                     "{msg.content}"
                   </p>
                </div>
                {msg.isCustom && (
                  <div className="absolute top-3 left-3 bg-cyan-600 text-white px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest shadow-lg">
                    AI ÜRETİMİ
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">🖼️</div>
                   <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{msg.category}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(msg.content); alert("Kopyalandı!"); }}
                    className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center active:scale-90 transition-all hover:bg-cyan-50 hover:text-cyan-600"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                  </button>
                  <button 
                    onClick={() => handleShare(msg.content)}
                    className="px-4 h-8 bg-cyan-600 text-white rounded-lg flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-cyan-900/10"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    PAYLAŞ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
           <div className="py-12 text-center space-y-3 opacity-30">
              <div className="text-4xl">🕊️</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bu kategoride mesaj bulunamadı</p>
           </div>
        )}
      </div>

      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-600"></div>
              <div className="text-center space-y-1">
                 <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-cyan-100">✨</div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">AI Mesaj Üreticisi</h3>
                 <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest">KİŞİYE ÖZEL CUMA MESAJI</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">TEMA SEÇİN</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['bereket', 'şükür', 'sabır', 'kardeşlik'].map(t => (
                         <button 
                           key={t}
                           onClick={() => setAiTheme(t)}
                           className={`py-2.5 rounded-xl text-[8px] font-black border transition-all ${aiTheme === t ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                         >
                           {t.toUpperCase()}
                         </button>
                       ))}
                    </div>
                 </div>

                 {aiLoading ? (
                    <div className="py-6 flex flex-col items-center gap-3">
                       <div className="w-6 h-6 border-2 border-slate-100 border-t-cyan-600 rounded-full animate-spin"></div>
                       <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">MESAJ YAZILIYOR...</p>
                    </div>
                 ) : aiResult ? (
                    <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100 shadow-inner animate-in fade-in duration-500">
                       <p className="text-[13px] font-bold text-cyan-900 leading-relaxed italic text-center">"{aiResult}"</p>
                    </div>
                 ) : (
                    <button 
                      onClick={generateAiMessage}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-xl"
                    >
                      AI İLE MESAJ OLUŞTUR
                    </button>
                 )}
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={() => { setShowAiModal(false); setAiResult(null); }}
                   className="flex-1 py-3.5 bg-slate-100 text-slate-400 font-black rounded-xl text-[8px] uppercase active:scale-95"
                 >
                   {aiResult ? 'VAZGEÇ' : 'KAPAT'}
                 </button>
                 {aiResult && (
                   <button 
                     onClick={addAiToCustom}
                     className="flex-[2] py-3.5 bg-cyan-600 text-white font-black rounded-xl text-[8px] uppercase shadow-lg shadow-cyan-900/10 active:scale-95"
                   >
                     KART OLARAK KAYDET
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.2rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-40 opacity-30">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ MESAJ MERKEZİ</p>
      </div>
    </div>
  );
};

export default FridayMessages;