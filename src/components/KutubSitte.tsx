
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useUserData } from '../contexts/UserDataContext';

interface Hadith {
  id: number;
  text: string;
  translation: string;
  source: string;
  chapter: string;
}

interface HadithBook {
  id: string;
  name: string;
  author: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
}

// Tek renk ikon bileşenleri
const BookIcons = {
  Scroll: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
  ),
  Mosque: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c-3 0-5 2-5 5v1h10V9c0-3-2-5-5-5z"/><path d="M5 10h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z"/><path d="M12 20v-4"/></svg>
  ),
  Scales: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"/><rect width="8" height="4" x="8" y="3" rx="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
  ),
  Gem: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3l-4 6 5 12 5-12-4-6z"/></svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Key: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
  )
};

const BOOKS: HadithBook[] = [
  { id: 'bukhari', name: 'SAHİH-İ BUHÂRÎ', author: 'İmam Buhâri', icon: <BookIcons.Scroll />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'İslam dünyasındaki en sahih hadis kaynağı kabul edilir.' },
  { id: 'muslim', name: 'SAHİH-İ MÜSLİM', author: 'İmam Müslim', icon: <BookIcons.Mosque />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'Kur\'an\'dan sonraki en sağlam ikinci kaynak sayılır.' },
  { id: 'dawood', name: 'SÜNEN-İ EBU DÂVUD', author: 'Ebu Dâvud', icon: <BookIcons.Scales />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'Fıkhi hükümler içeren hadislerin en geniş koleksiyonudur.' },
  { id: 'tirmidhi', name: 'SÜNEN-İ TİRMİZÎ', author: 'İmam Tirmizî', icon: <BookIcons.Gem />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'Hadislerin derecelerini bildirmesiyle ünlüdür.' },
  { id: 'nasai', name: 'SÜNEN-İ NESÂÎ', author: 'İmam Nesâî', icon: <BookIcons.Shield />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'Hadis tenkidi ve titizliği ile öne çıkar.' },
  { id: 'majiah', name: 'SÜNEN-İ İBN MÂCE', author: 'İbn Mâce', icon: <BookIcons.Key />, color: 'text-gold-600', gradient: 'from-gold-50 to-gold-50', description: 'Kütüb-i Sitte\'nin altıncı kitabı olarak kabul edilir.' },
];

const HADITH_DATA: Record<string, Hadith[]> = {
  bukhari: [
    { id: 1, text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "Ameller ancak niyetlere göredir.", source: "BUHÂRÎ, BED'Ü'L-VAHY, 1", chapter: "İMAN KİTABI" },
    { id: 2, text: "المُسْلِمُ مَن سَلِمَ المُسْلِمُونَ من لِسانِهِ ويَدِهِ", translation: "Müslüman, dilinden ve elinden Müslümanların emin olduğu kimsedir.", source: "BUHÂRÎ, İMAN, 4", chapter: "İMAN KİTABI" },
  ],
  muslim: [
    { id: 1, text: "الدِّينُ النَّصِيحَةُ", translation: "Din samimiyettir (nasihattir).", source: "MÜSLİM, İMAN, 95", chapter: "NASİHAT KİTABI" },
  ],
  dawood: [],
  tirmidhi: [],
  nasai: [],
  majiah: [],
};

const KutubSitte: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { getField, setField } = useUserData();
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeHadith, setActiveHadith] = useState<Hadith | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => getField('hadith_favorites', [] as number[]));

  const filteredBooks = useMemo(() => 
    BOOKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      setField('hadith_favorites', next);
      return next;
    });
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  };

  const getAiExplanation = async (hadith: Hadith) => {
    setLoadingAi(true);
    setAiExplanation(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aşağıdaki hadis-i şerifi manevi derinliğiyle açıkla: "${hadith.translation}"`,
        config: { systemInstruction: 'Sen bilge bir İslam alimi ve rehberisin.' }
      });
      setAiExplanation(response.text || "Açıklama getirilemedi.");
    } catch (e) {
      setAiExplanation("AI bağlantısı hatası.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white via-[#fbf6ea] to-[#f5ead0] dark:from-[#3e5878] dark:via-[#243a58] dark:to-[#141a2c] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      {/* Premium Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl sticky top-0 z-40 border-b border-gold-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedBook ? () => setSelectedBook(null) : onBack} 
            className="w-10 h-10 bg-gold-50 dark:bg-navy-950/20 rounded-xl flex items-center justify-center border border-gold-100 active:scale-90 transition-transform text-gold-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0.5">
            <h2 className="text-[16px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">
              {selectedBook ? selectedBook.name : "KÜTÜB-İ SİTTE"}
            </h2>
            <p className="text-[8px] font-black text-gold-500 uppercase tracking-[0.2em]">
              {selectedBook ? "KAYNAK KİTAP" : "HADİS KÜLLİYATI"}
            </p>
          </div>
        </div>
        <div className="text-gold-400 opacity-40">
           {selectedBook ? <BookIcons.Scroll /> : <BookIcons.Key />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-3">
        {!selectedBook ? (
          <div className="space-y-6">
            {/* Portatif Search */}
            <div className="relative group">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Hadis kaynağı ara..."
                className="w-full bg-gold-50/50 border border-gold-100 focus:bg-white dark:bg-navy-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none font-bold text-sm text-slate-700 dark:text-slate-300 dark:text-slate-600 placeholder:text-gold-300 shadow-sm transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            {/* Daily Feature Card - Pastel Blue */}
            <div className="bg-[#fbf6ea] rounded-[2.2rem] p-8 text-navy-900 border border-gold-100 relative overflow-hidden group shadow-sm">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
                     <p className="text-[8px] font-black text-gold-500 uppercase tracking-[0.3em]">GÜNÜN HADİS-İ ŞERİFİ</p>
                  </div>
                  <p className="arabic-text text-2xl leading-[1.8] text-center text-navy-950" dir="rtl">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ</p>
                  <p className="text-[15px] font-bold leading-relaxed text-center italic text-navy-800/80">"Ameller ancak niyetlere göredir."</p>
                  <div className="pt-2 flex justify-center">
                     <p className="text-[8px] font-black text-gold-400 uppercase tracking-widest border-t border-gold-200/50 pt-2 px-4">BUHÂRÎ, 1</p>
                  </div>
               </div>
            </div>

            {/* Compact Book List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                 <div className="w-1 h-1 bg-gold-400 rounded-full"></div>
                 <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">KİTAP LİSTESİ</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className="p-5 bg-white dark:bg-navy-800 rounded-3xl border border-slate-100 dark:border-navy-900 flex items-center justify-between hover:bg-gold-50/50 hover:border-gold-100 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-2xl bg-gold-50 dark:bg-navy-950/20 text-gold-500 flex items-center justify-center transition-transform group-hover:scale-110">
                          {book.icon}
                       </div>
                       <div>
                          <h4 className="text-[14px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">{book.name}</h4>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{book.author}</p>
                       </div>
                    </div>
                    <div className="text-gold-200 group-hover:text-gold-500 transition-colors">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Compact Intro */}
            <div className="bg-gold-50/30 rounded-[2.2rem] p-8 border border-gold-100 text-center relative overflow-hidden">
               <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-navy-800 text-gold-500 flex items-center justify-center mb-4 shadow-sm border border-gold-50">
                 {selectedBook.icon}
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{selectedBook.name}</h3>
               <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] mb-4">{selectedBook.author}</p>
               <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic px-4">
                 "{selectedBook.description}"
               </p>
            </div>

            {/* Hadith List Header */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                   <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">HADİSLER</h5>
                 </div>
               </div>

               {HADITH_DATA[selectedBook.id]?.length > 0 ? (
                 <div className="space-y-4">
                   {HADITH_DATA[selectedBook.id].map((hadith) => (
                     <div 
                      key={hadith.id}
                      className="bg-white dark:bg-navy-800 p-7 rounded-[2rem] border border-slate-100 dark:border-navy-900 hover:border-gold-100 transition-all relative"
                     >
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[8px] font-black text-gold-600 bg-gold-50 dark:bg-navy-950/20 px-3 py-1 rounded-full border border-gold-100 uppercase tracking-widest">
                             {hadith.chapter}
                           </span>
                           <button 
                             onClick={() => toggleFavorite(hadith.id)}
                             className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${favorites.includes(hadith.id) ? 'text-rose-500' : 'text-slate-200'}`}
                           >
                             <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites.includes(hadith.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                           </button>
                        </div>
                        
                        <div className="space-y-6 text-center">
                           <p className="arabic-text text-3xl text-slate-900 dark:text-white leading-[1.8]" dir="rtl">{hadith.text}</p>
                           <div className="space-y-3">
                              <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-relaxed px-2">
                                "{hadith.translation}"
                              </p>
                              <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">
                                {hadith.source}
                              </p>
                           </div>
                        </div>
                        
                        <div className="mt-8 flex gap-2">
                           <button 
                             onClick={() => setActiveHadith(hadith)}
                             className="flex-1 py-3.5 bg-gold-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-md shadow-gold-100 flex items-center justify-center gap-2"
                           >
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M12 7v5l3 3"/></svg>
                             AI ANALİZİ
                           </button>
                           <button 
                             className="w-11 h-11 bg-slate-50 dark:bg-navy-800 border border-slate-100 dark:border-navy-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 transition-all hover:bg-gold-50 dark:bg-navy-950/20 hover:text-gold-600"
                             onClick={() => alert("Kopyalandı")}
                           >
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                           </button>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-16 bg-slate-50/50 dark:bg-navy-800/50 border border-dashed border-slate-200 dark:border-navy-700 rounded-3xl opacity-60">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">VERİ HAZIRLANIYOR</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* AI Detail Modal */}
      {activeHadith && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-500"></div>
              
              <div className="text-center">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Hadis Şerhi</h3>
                 <p className="text-[8px] font-black text-gold-500 uppercase tracking-[0.4em] mt-1">MÜBAREKÇE AI ANALİZ</p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                 <div className="bg-gold-50/50 p-6 rounded-2xl border border-gold-100/50 text-center italic">
                    <p className="text-[13px] font-bold text-navy-900">"{activeHadith.translation}"</p>
                 </div>

                 {loadingAi ? (
                    <div className="py-8 flex flex-col items-center gap-6">
                       <div className="w-10 h-10 border-4 border-gold-100 border-t-gold-500 rounded-full animate-spin"></div>
                       <p className="text-[9px] font-black text-gold-400 uppercase tracking-widest animate-pulse">ANALİZ EDİLİYOR</p>
                    </div>
                 ) : aiExplanation ? (
                    <div className="space-y-4 animate-in fade-in duration-700">
                       <p className="text-[14px] font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-[1.8] whitespace-pre-wrap">
                          {aiExplanation}
                       </p>
                    </div>
                 ) : (
                    <button 
                      onClick={() => getAiExplanation(activeHadith)}
                      className="w-full py-5 bg-gold-50 dark:bg-navy-950/20 text-gold-700 border border-gold-200/50 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95"
                    >
                      BİLGELİK ANALİZİ BAŞLAT
                    </button>
                 )}
              </div>

              <button 
                onClick={() => { setActiveHadith(null); setAiExplanation(null); }}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] active:scale-95 transition-all"
              >
                HUZURLA KAPAT
              </button>
           </div>
        </div>
      )}

      {/* Decorative Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-30 opacity-40 text-center">
        <p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.8em]">PRO+ KÜLLİYAT PLATFORMU</p>
      </div>
    </div>
  );
};

export default KutubSitte;
