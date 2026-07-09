
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ZekatAsset {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'nakit' | 'altin' | 'ticaret' | 'borc';
}

const GOLD_PRICE_GRAM = 3200; // Örnek güncel gram altın fiyatı
const NISAB_GOLD_GRAMS = 80.18;
const NISAB_VALUE = GOLD_PRICE_GRAM * NISAB_GOLD_GRAMS;

const ZekatHesapla: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [assets, setAssets] = useState<ZekatAsset[]>([
    { id: '1', name: 'Nakit & Banka', amount: 0, unit: 'TL', category: 'nakit' },
    { id: '2', name: 'Altın (Gr)', amount: 0, unit: 'Gr', category: 'altin' },
    { id: '3', name: 'Ticari Mallar', amount: 0, unit: 'TL', category: 'ticaret' },
    { id: '4', name: 'Borçlar (Düşülür)', amount: 0, unit: 'TL', category: 'borc' },
  ]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const totalValue = useMemo(() => {
    return assets.reduce((acc, asset) => {
      let val = asset.amount;
      if (asset.category === 'altin') val *= GOLD_PRICE_GRAM;
      if (asset.category === 'borc') return acc - val;
      return acc + val;
    }, 0);
  }, [assets]);

  const zekatAmount = useMemo(() => {
    if (totalValue < NISAB_VALUE) return 0;
    return totalValue * 0.025; // %2.5 or 1/40
  }, [totalValue]);

  const updateAsset = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setAssets(prev => prev.map(a => a.id === id ? { ...a, amount: num } : a));
  };

  const askAi = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Benim için zekat hükümlerini açıkla. Toplam varlığım ${totalValue} TL. Zekat düşen miktar ${zekatAmount} TL. Nisab miktarı ${NISAB_VALUE} TL. Durumumu değerlendir, nelere dikkat etmeliyim? Kimlere verebilirim? Kısa ve öz olsun.`,
        config: { systemInstruction: "Sen bir fıkıh uzmanı ve zekat danışmanısın. Kullanıcının durumunu İslami kurallara göre nazikçe yorumla." }
      });
      setAiResponse(response.text || "Şu an yanıt üretilemiyor.");
    } catch (e) {
      setAiResponse("Bağlantı hatası oluştu.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      {/* Background Decor - Changed to Sky Blue */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-gold-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Premium Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-[#f3f7e9]/80 dark:bg-[#0a1f1a]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Zekat Hesapla</h2>
            <p className="text-[8px] font-black text-gold-600 uppercase tracking-[0.25em] mt-1">VARLIK HESAP MODÜLÜ</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-gold-50 dark:bg-navy-950/20 rounded-xl flex items-center justify-center text-lg border border-gold-100 text-gold-500 font-black">$</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar pt-6 space-y-8">
        
        {/* Result Card - Now Pastel Sky Blue */}
        <div className="bg-[#fbf6ea] rounded-[2.5rem] p-8 text-navy-950 border border-gold-100 relative overflow-hidden shadow-2xl shadow-navy-900/5">
           <div className="absolute right-[-5%] top-[-5%] opacity-[0.05] text-[10rem] pointer-events-none rotate-12">💰</div>
           <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                 <p className="text-gold-600 text-[9px] font-black uppercase tracking-[0.4em]">ÖDENMESİ GEREKEN ZEKAT</p>
                 {totalValue >= NISAB_VALUE && (
                    <span className="bg-gold-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">NİSAB ÜSTÜ</span>
                 )}
              </div>
              <h3 className="text-5xl font-black tracking-tighter leading-none">₺{zekatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
              
              <div className="flex items-center gap-3 pt-2">
                 <div className="flex-1 h-1.5 bg-gold-200/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (totalValue / NISAB_VALUE) * 100)}%` }}
                    ></div>
                 </div>
                 <span className="text-[10px] font-bold text-navy-800 uppercase tracking-widest">
                    {totalValue < NISAB_VALUE ? 'NİSABA KALAN: ' + (NISAB_VALUE - totalValue).toLocaleString() + ' TL' : 'MÜKELLEFSİNİZ'}
                 </span>
              </div>
           </div>
        </div>

        {/* Assets Form */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 ml-2 mb-2">
              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(201,166,104,0.5)]"></div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">VARLIK LİSTESİ</h4>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {assets.map(asset => (
                <div key={asset.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group focus-within:border-gold-200 transition-all">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{asset.name}</p>
                      <div className="flex items-center gap-2">
                         <input 
                           type="number" 
                           onChange={(e) => updateAsset(asset.id, e.target.value)}
                           placeholder="0.00"
                           className="text-xl font-black text-slate-900 dark:text-white bg-transparent outline-none w-24 border-b border-transparent focus:border-gold-100"
                         />
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{asset.unit}</span>
                      </div>
                   </div>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                     asset.category === 'borc' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-400' : 'bg-gold-50 dark:bg-navy-950/20 text-gold-500'
                   }`}>
                      {asset.category === 'nakit' ? '💵' : asset.category === 'altin' ? '💍' : asset.category === 'ticaret' ? '📦' : '📉'}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* AI Recommendation Section */}
        <div className="space-y-4">
           <button 
             onClick={askAi}
             disabled={aiLoading}
             className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  HESAPLANIP YORUMLANIYOR...
                </>
              ) : (
                <>
                  <span className="text-lg">🤖</span> AI FIKIH REHBERİNE SOR
                </>
              )}
           </button>

           {aiResponse && (
             <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-gold-100 shadow-lg animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse"></div>
                   <p className="text-[9px] font-black text-gold-600 uppercase tracking-widest">AI REHBER NOTU</p>
                </div>
                <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-[1.8] whitespace-pre-wrap italic">
                   "{aiResponse}"
                </p>
             </div>
           )}
        </div>

        {/* Information Table */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 space-y-4">
           <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">GÜNCEL REFERANS VERİLERİ</p>
           <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                 <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">GR Altın (Ref)</p>
                 <p className="text-xs font-black text-gold-700">₺{GOLD_PRICE_GRAM.toLocaleString()}</p>
              </div>
              <div className="text-center">
                 <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nisab (80.18gr)</p>
                 <p className="text-xs font-black text-gold-700">₺{NISAB_VALUE.toLocaleString()}</p>
              </div>
           </div>
        </div>

      </div>

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ MÜLK REHBERİ</p>
      </div>
    </div>
  );
};

export default ZekatHesapla;
