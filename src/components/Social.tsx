
import React, { useState, useMemo, useEffect } from 'react';
import { User, DuaRequest } from '../types';
import { GoogleGenAI } from '@google/genai';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

interface SocialProps {
  user: User;
}

// Firestore'daki ham belge şekli (timestamp burada Timestamp/null olabilir,
// arayüzde kullanılan DuaRequest tipine dönüştürülüyor)
interface DuaRequestDoc extends Omit<DuaRequest, 'timestamp' | 'aminCount'> {
  timestamp: Timestamp | null;
  aminUsers?: string[];
}

const CATEGORIES = [
  { id: 'all', label: 'TÜMÜ', icon: '🌍' },
  { id: 'şifa', label: 'ŞİFA', icon: '🌿' },
  { id: 'sınav', label: 'SINAV', icon: '📝' },
  { id: 'huzur', label: 'HUZUR', icon: '🕊️' },
  { id: 'hidayet', label: 'HİDAYET', icon: '✨' },
];

const Social: React.FC<SocialProps> = ({ user }) => {
  // Bu koleksiyon HERKESE AÇIKTIR: burada paylaşılan dua istekleri tüm
  // kullanıcılar tarafından gerçek zamanlı görülür (Firestore "duaRequests"
  // koleksiyonu). Auth zorunlu olduğu için yalnızca giriş yapmış kullanıcılar
  // görebilir/yazabilir (bkz. Firestore güvenlik kuralları).
  const [requests, setRequests] = useState<(DuaRequest & { aminUsers: string[] })[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [posting, setPosting] = useState(false);

  const [newRequest, setNewRequest] = useState({ title: '', content: '', category: 'şifa' });
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState('all');
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'duaRequests'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as DuaRequestDoc;
          return {
            id: d.id,
            userName: data.userName,
            title: data.title,
            content: data.content,
            category: data.category,
            aminCount: data.aminUsers?.length || 0,
            aminUsers: data.aminUsers || [],
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          };
        });
        setRequests(list);
        setLoadingFeed(false);
      },
      (err) => {
        console.error('Dua akışı alınamadı:', err);
        setLoadingFeed(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredRequests = useMemo(() => {
    if (selectedCat === 'all') return requests;
    return requests.filter(r => r.category === selectedCat);
  }, [requests, selectedCat]);

  const handlePost = async () => {
    if (!newRequest.title || !newRequest.content || posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'duaRequests'), {
        userName: user.name,
        userEmail: user.email,
        title: newRequest.title,
        content: newRequest.content,
        category: newRequest.category,
        aminUsers: [],
        timestamp: serverTimestamp(),
      });
      setNewRequest({ title: '', content: '', category: 'şifa' });
      setShowModal(false);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    } catch (err) {
      console.error('Dua isteği paylaşılamadı:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleAmin = async (id: string) => {
    const target = requests.find(r => r.id === id);
    // Aynı kullanıcı bir isteğe yalnızca bir kez "Amin" diyebilir
    if (target?.aminUsers.includes(user.email)) return;
    try {
      await updateDoc(doc(db, 'duaRequests', id), {
        aminUsers: arrayUnion(user.email),
      });
      if (window.navigator.vibrate) window.navigator.vibrate(20);
    } catch (err) {
      console.error('Amin gönderilemedi:', err);
    }
  };

  const getAiComfort = async (req: DuaRequest) => {
    setAiLoadingId(req.id);
    setAiResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aşağıdaki dua isteğine manevi bir destek mesajı yaz. Kısa, samimi ve motive edici olsun. İçinde konuya uygun bir ayet veya hadis meali de geçsin: "${req.content}"`,
        config: {
          systemInstruction: 'Sen Müslüman kardeşlerine manevi destek veren, nazik ve bilge bir rehbersin.'
        }
      });
      setAiResponse({ id: req.id, text: response.text || "Rabbim dualarınızı kabul eylesin." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoadingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-40 pt-12 space-y-8 bg-gradient-to-b from-white via-[#fbf6ea] to-[#f5ead0] dark:from-[#3e5878] dark:via-[#243a58] dark:to-[#141a2c] relative no-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Kardeşlik</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Müminin Silahı Duadır</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-14 h-14 bg-gold-600 text-white rounded-[1.8rem] shadow-xl shadow-gold-200 flex items-center justify-center text-3xl active:scale-90 transition-transform border-4 border-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              selectedCat === cat.id 
                ? 'bg-gold-600 text-white border-gold-500 shadow-lg shadow-gold-100' 
                : 'bg-white dark:bg-navy-800 text-slate-400 border-slate-100 dark:border-navy-900 hover:bg-slate-50 dark:bg-navy-900/60'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dua Feed */}
      <div className="space-y-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white dark:bg-navy-800 p-7 rounded-[2.8rem] border border-slate-100 dark:border-navy-900 shadow-xl shadow-slate-900/5 space-y-5 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${
                  req.userName === user.name ? 'bg-gold-50 text-gold-600 border-gold-100' : 'bg-gold-50 text-gold-600 border-gold-100'
                }`}>
                  {req.userName[0]}
                </div>
                <div>
                  <h5 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">{req.userName === user.name ? 'Ben' : req.userName}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gold-500 bg-gold-50 px-2 py-0.5 rounded uppercase tracking-wider">{req.category}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      {req.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-navy-900/60 text-slate-300 flex items-center justify-center hover:bg-gold-50 hover:text-gold-500 transition-colors"
                onClick={() => alert("Yakında...")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[17px] font-black text-slate-800 dark:text-slate-200 leading-tight">{req.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 text-[14px] leading-relaxed font-medium">"{req.content}"</p>
            </div>

            {/* AI Response Area */}
            {(aiLoadingId === req.id || (aiResponse && aiResponse.id === req.id)) && (
              <div className="bg-gold-50/50 p-5 rounded-[1.8rem] border border-gold-100 animate-in fade-in zoom-in duration-300">
                {aiLoadingId === req.id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest animate-pulse">Manevi destek hazırlanıyor...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✨</span>
                      <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">AI KARDEŞLİK DESTEĞİ</p>
                    </div>
                    <p className="text-[12px] font-bold text-navy-900 leading-relaxed italic">{aiResponse?.text}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-5 border-t border-slate-50 dark:border-navy-900 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAmin(req.id)}
                  disabled={req.aminUsers.includes(user.email)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm border ${
                    req.aminUsers.includes(user.email)
                      ? 'bg-gold-600 text-white border-gold-600'
                      : 'bg-gold-50 text-gold-600 border-gold-100/50 group-hover:bg-gold-600 group-hover:text-white group-hover:border-gold-600'
                  }`}
                >
                  🤲 Amin ({req.aminCount})
                </button>
                <button 
                  onClick={() => getAiComfort(req)}
                  className="w-11 h-11 bg-gold-50 text-gold-500 rounded-2xl flex items-center justify-center border border-gold-100/50 active:scale-90 transition-all"
                  title="Manevi Destek Al"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M12 7v5l3 3"/></svg>
                </button>
              </div>
              <button className="w-11 h-11 bg-slate-50 dark:bg-navy-900/60 text-slate-300 rounded-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-gold-50 hover:text-gold-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        ))}

        {loadingFeed && (
          <div className="py-20 text-center opacity-30 space-y-4">
            <div className="w-8 h-8 mx-auto border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black uppercase tracking-widest">Dua akışı yükleniyor...</p>
          </div>
        )}

        {!loadingFeed && filteredRequests.length === 0 && (
          <div className="py-20 text-center opacity-30 space-y-4">
             <div className="text-6xl">🤲</div>
             <p className="text-sm font-black uppercase tracking-widest">Henüz dua isteği yok.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gold-600"></div>
             <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dua İsteği Paylaş</h3>
                <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Kardeşlerinin dualarına ortak ol</p>
             </div>

             <div className="space-y-5">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 ml-4 uppercase tracking-widest">KATEGORİ</label>
                   <div className="grid grid-cols-2 gap-2">
                     {CATEGORIES.slice(1).map(cat => (
                       <button
                         key={cat.id}
                         onClick={() => setNewRequest({...newRequest, category: cat.id})}
                         className={`py-3 rounded-2xl text-[9px] font-black transition-all border ${
                           newRequest.category === cat.id ? 'bg-gold-600 text-white border-gold-500 shadow-md' : 'bg-slate-50 dark:bg-navy-900/60 text-slate-400 border-slate-100 dark:border-navy-900'
                         }`}
                       >
                         {cat.label}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 ml-4 uppercase tracking-widest">BAŞLIK</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Şifa Bekliyoruz" 
                    className="w-full bg-slate-50 dark:bg-navy-900/60 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-inner"
                    value={newRequest.title}
                    onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 ml-4 uppercase tracking-widest">DUANIZ</label>
                  <textarea 
                    placeholder="Duanızı buraya yazın..." 
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-navy-900/60 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-inner resize-none"
                    value={newRequest.content}
                    onChange={e => setNewRequest({...newRequest, content: e.target.value})}
                  ></textarea>
                </div>
             </div>

             <div className="flex gap-4">
               <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 dark:bg-navy-900 text-slate-400 dark:text-slate-500 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">VAZGEÇ</button>
               <button onClick={handlePost} disabled={posting} className="flex-1 bg-gold-600 disabled:opacity-60 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-navy-900/10 active:scale-95 transition-all">{posting ? 'PAYLAŞILIYOR...' : 'PAYLAŞ'}</button>
             </div>
          </div>
        </div>
      )}

      {/* Daily Spiritual Quote */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden mt-12 mb-20">
         <div className="absolute top-0 left-0 w-full h-1 bg-gold-500 opacity-50"></div>
         <p className="text-gold-400 text-[10px] font-black uppercase tracking-[0.5em]">GÜNÜN KARDEŞLİK NOTU</p>
         <p className="text-white font-medium text-[16px] italic leading-relaxed px-4 opacity-90">"Bir Müslüman'ın, yanında bulunmayan din kardeşi için yaptığı dua kabul olunur."</p>
         <div className="flex flex-col items-center gap-2">
            <div className="h-px w-8 bg-slate-700"></div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">- Hadis-i Şerif (Müslim)</p>
         </div>
      </div>
    </div>
  );
};

export default Social;
