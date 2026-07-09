
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';

interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  desc: string;
  detailedDesc: string;
  type: 'dönüm noktası' | 'savaş' | 'bilim' | 'vahiy';
}

interface HistoryCategory {
  id: string;
  name: string;
  era: string;
  icon: React.ReactNode;
  color: string;
  events: HistoryEvent[];
}

const CATEGORIES: HistoryCategory[] = [
  {
    id: 'prophetic',
    name: 'Asr-ı Saadet',
    era: '571 - 632',
    color: 'text-teal-600',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>,
    events: [
      { id: 'birth', year: '571', title: 'Veladet (Doğum)', type: 'dönüm noktası', desc: 'Peygamber Efendimiz (sav) Mekke\'de dünyaya teşrif etti.', detailedDesc: 'İslam tarihindeki en büyük dönüm noktasıdır. Rebiülevvel ayının 12. gecesi gerçekleşmiştir.' },
      { id: 'first_vahy', year: '610', title: 'İlk Vahiy', type: 'vahiy', desc: 'Hira mağarasında Alak suresinin ilk ayetleri indirildi.', detailedDesc: 'Cebrail (as) aracılığıyla gelen "Oku!" emriyle Nübüvvet vazifesi başlamıştır.' },
      { id: 'hijrah', year: '622', title: 'Hicret', type: 'dönüm noktası', desc: 'Müslümanlar Mekke\'den Medine\'ye göç etti.', detailedDesc: 'İslam devletinin temellerinin atıldığı ve Hicri takvimin başlangıcı kabul edilen olaydır.' },
      { id: 'badr', year: '624', title: 'Bedir Gazvesi', type: 'savaş', desc: 'İslam ordusunun ilk büyük zaferi.', detailedDesc: 'Sayıca az olan Müslümanların, Kureyş ordusuna karşı kazandığı destansı savunma savaşıdır.' },
      { id: 'conquest', year: '630', title: 'Mekke\'nin Fethi', type: 'dönüm noktası', desc: 'Kan dökülmeden kazanılan büyük fetih.', detailedDesc: 'Putperestliğin sona erdiği ve Kabe\'nin putlardan temizlendiği kutlu gündür.' }
    ]
  },
  {
    id: 'rashidun',
    name: 'Dört Halife Devri',
    era: '632 - 661',
    color: 'text-sky-600',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    events: [
      { id: 'abu_bakr', year: '632', title: 'Hz. Ebubekir Dönemi', type: 'dönüm noktası', desc: 'İlk halife seçildi, Kuran toplandı.', detailedDesc: 'Riddet savaşlarıyla devlet birliği korunmuş ve Kuran-ı Kerim ilk kez kitap haline getirilmiştir.' },
      { id: 'umar', year: '634', title: 'Hz. Ömer Dönemi', type: 'dönüm noktası', desc: 'Adaletle büyüyen devlet teşkilatı.', detailedDesc: 'Kudüs fethedilmiş, devlet kurumları (divan, ordu, posta) kurulmuş ve fetihler hız kazanmıştır.' }
    ]
  },
  {
    id: 'golden_age',
    name: 'Bilim ve Medeniyet',
    era: '8. - 13. Yy',
    color: 'text-amber-600',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    events: [
      { id: 'hikmah', year: '830', title: 'Beytü\'l Hikme', type: 'bilim', desc: 'Bağdat\'ta Bilgelik Evi kuruldu.', detailedDesc: 'Antik Yunan, Hint ve Fars ilimleri Arapçaya çevrilerek modern bilimin temelleri atılmıştır.' },
      { id: 'khwarizmi', year: '850', title: 'Harezmi ve Algoritma', type: 'bilim', desc: 'Sıfırın keşfi ve cebrin doğuşu.', detailedDesc: 'Matematik tarihinde çığır açan El-Cebr ve\'l-Mukabele eseriyle cebir bilimi sistemleştirilmiştir.' }
    ]
  }
];

const IslamHistory: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<HistoryCategory | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return CATEGORIES;
    return CATEGORIES.map(cat => ({
      ...cat,
      events: cat.events.filter(ev => 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ev.desc.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.events.length > 0 || cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const askAi = async (context?: string) => {
    setLoadingAi(true);
    setAiAnswer('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = context 
        ? `${context} olayı hakkında detaylı, eğitici ve İslami kaynaklara dayanan derinlemesine bilgi ver.`
        : aiQuestion;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "Sen bilge bir İslam tarihçisisin. Cevapların objektif, öğretici ve ilham verici olsun." }
      });
      setAiAnswer(response.text || "Cevap üretilemedi.");
    } catch (e) {
      setAiAnswer("Yapay zeka asistanına şu an ulaşılamıyor.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      {/* Premium Header - Compact */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between bg-[#faf6f0]/80 dark:bg-[#0d1220]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedEvent ? () => setSelectedEvent(null) : selectedCategory ? () => setSelectedCategory(null) : onBack}
            className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">İslam Tarihi</h2>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-1">ÖNEMLİ OLAYLAR</p>
          </div>
        </div>
        <div className="text-xl opacity-30">📜</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-4">
        {!selectedCategory && !selectedEvent ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search Bar - Compact */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Olay veya tarih ara..."
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-100 dark:border-slate-800 focus:bg-white dark:bg-slate-900 rounded-[1.2rem] pl-11 pr-4 py-3 outline-none font-bold text-sm text-slate-800 dark:text-slate-100 shadow-sm transition-all"
              />
            </div>

            {/* Featured Era Card - Updated to Pastel Blue as requested */}
            <div className="bg-[#f0f9ff] rounded-[2.2rem] p-8 text-sky-950 relative overflow-hidden group shadow-lg shadow-sky-900/5 border border-sky-100">
               <div className="absolute right-[-5%] top-[-10%] opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 text-[10rem] pointer-events-none rotate-12 text-sky-900">🕌</div>
               <div className="relative z-10 space-y-4 text-center">
                  <p className="text-sky-600 text-[9px] font-black uppercase tracking-[0.4em]">HAFTANIN DÖNEMİ</p>
                  <h3 className="text-2xl font-black tracking-tighter serif-text italic">Asr-ı Saadet</h3>
                  <p className="text-[13px] font-medium leading-relaxed text-sky-800/70">
                    Peygamber Efendimiz (sav) dönemini, İslam'ın doğuşunu ve sahabe hayatlarını keşfedin.
                  </p>
                  <button 
                    onClick={() => setSelectedCategory(CATEGORIES[0])}
                    className="bg-sky-600 text-white px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-md shadow-sky-200 transition-all border border-sky-500"
                  >
                    DÖNEMİ KEŞFET →
                  </button>
               </div>
            </div>

            {/* Category Grid - Compact */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                 <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                 <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">TARİHİ DÖNEMLER</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {filteredCategories.map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="p-5 bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-900 transition-all cursor-pointer group active:scale-[0.98] shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 ${cat.color} flex items-center justify-center transition-all group-hover:scale-110`}>
                         <div className="scale-90">{cat.icon}</div>
                      </div>
                      <div>
                         <h4 className="text-[14px] font-black text-slate-900 dark:text-white">{cat.name}</h4>
                         <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{cat.era}</p>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 group-hover:text-slate-400 dark:text-slate-500 transition-all">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedCategory && !selectedEvent ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
             {/* Category Info Header - Compact */}
             <div className="text-center space-y-3">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-900 ${selectedCategory.color} flex items-center justify-center shadow-md border border-white`}>
                   <div className="scale-125">{selectedCategory.icon}</div>
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedCategory.name}</h3>
                   <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1">{selectedCategory.era}</p>
                </div>
             </div>

             {/* Event List (Timeline Style) - Compact */}
             <div className="relative pl-5 space-y-6">
                <div className="absolute left-[6px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                
                {selectedCategory.events.map((ev) => (
                  <div 
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="relative bg-white dark:bg-slate-900 p-5 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-200 dark:border-slate-700 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                     <div className="absolute left-[-23px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-slate-900 rounded-full z-10 shadow-sm group-hover:scale-125 transition-transform"></div>
                     
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{ev.year}</span>
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                          ev.type === 'dönüm noktası' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-600' :
                          ev.type === 'savaş' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' :
                          ev.type === 'bilim' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                        }`}>
                          {ev.type}
                        </span>
                     </div>
                     <h4 className="text-[15px] font-black text-slate-900 dark:text-white mb-1">{ev.title}</h4>
                     <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">{ev.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        ) : selectedEvent ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
             {/* Event Detail Header - Compact */}
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-900/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 text-[7rem] pointer-events-none">📜</div>
                <div className="relative z-10 space-y-3">
                   <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-2">{selectedEvent.year}</div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedEvent.title}</h3>
                   <div className="h-px w-10 bg-slate-100 dark:bg-slate-800 mx-auto"></div>
                   <p className="text-[14px] font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic px-2">
                     "{selectedEvent.detailedDesc}"
                   </p>
                </div>
             </div>

             {/* AI Insight Box - Compact */}
             <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-lg shadow-sm border border-slate-200/50">🤖</div>
                   <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Yapay Zeka Analizi</h4>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DERİNLEMESİNE BİLGİ ALIN</p>
                   </div>
                </div>

                {!aiAnswer && !loadingAi ? (
                  <button 
                    onClick={() => askAi(selectedEvent.title)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-md"
                  >
                    AI ANALİZİ BAŞLAT
                  </button>
                ) : loadingAi ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-slate-700 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Kaynaklar Taranıyor...</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-1000 space-y-3">
                     <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 shadow-inner">
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-[1.7] whitespace-pre-wrap">
                           {aiAnswer}
                        </p>
                     </div>
                     <button 
                       onClick={() => setAiAnswer('')}
                       className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 hover:text-slate-900 dark:text-white transition-colors"
                     >
                       TEMİZLE
                     </button>
                  </div>
                )}
             </div>

             <div className="p-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center opacity-40">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">"Tarih, geleceğe tutulan bir aynadır."</p>
             </div>
          </div>
        ) : null}
      </div>

      {/* Brand Footer - Compact */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent pb-[calc(1.2rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ TARİH REHBERİ</p>
      </div>
    </div>
  );
};

export default IslamHistory;
