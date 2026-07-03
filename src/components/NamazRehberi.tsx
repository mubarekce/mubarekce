
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

type RehberTab = 'rehber' | 'faydalari' | 'sartlari' | 'dikkat';

interface Step {
  title: string;
  arabic: string;
  meaning: string;
  description: string;
  icon: string;
}

interface PrayerInfo {
  id: string;
  name: string;
  rakats: string;
  total: number;
  icon: React.ReactNode;
  steps: Step[];
}

const COMMON_STEPS = {
  niyet: (namaz: string) => ({ title: 'Niyet', arabic: 'نَوَيْتُ اَنْ اَصَلِّيَ', meaning: `Niyet ettim Allah rızası için ${namaz} kılmaya.`, description: 'Kalben niyet edilir, eller kulak memesine kaldırılır.', icon: '🤲' }),
  tekbir: { title: 'İftitah Tekbiri', arabic: 'اَللّٰهُ اَكْبَرُ', meaning: 'Allah en büyüktür.', description: 'Eller bağlanır (erkekler göbek altında, kadınlar göğüs üstünde).', icon: '🙌' },
  kiyam: { title: 'Kıyam ve Kıraat', arabic: 'بِسْمِ اللّٰهِ...', meaning: 'Fatiha ve sure okunur.', description: 'Ayakta durulur, gözler secde yerine bakacak şekilde kıraat yapılır.', icon: '🧍' },
  ruku: { title: 'Rükû', arabic: 'سُبْحَانَ رَبِّيَ الْعَظ۪يمِ', meaning: 'Büyük olan Rabbimi her türlü noksan sıfatlardan tenzih ederim.', description: 'Eğilerek diz kapakları tutulur (3 kez söylenir).', icon: '📐' },
  secde: { title: 'Secde', arabic: 'سُبْحَانَ رَبِّيَ الْاَعْلٰى', meaning: 'Yüce olan Rabbimi her türlü noksanlıktan tenzih ederim.', description: 'Yere kapanılır, alın ve burun yere değer (3 kez söylenir).', icon: '🙇' },
  oturus: { title: 'Kaade-i Ahire', arabic: 'اَلتَّحِيَّاتُ لِلّٰهِ...', meaning: 'Her türlü hürmet ve dua Allah içindir.', description: 'Son oturuşta dualar (Ettehiyyatü, Salli-Barik, Rabbena) okunur.', icon: '🛐' },
  selam: { title: 'Selam', arabic: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ', meaning: 'Allah’ın selâmı ve rahmeti üzerinize olsun.', description: 'Önce sağa, sonra sola selam verilerek namaz bitirilir.', icon: '👋' }
};

const PRAYER_DATA: PrayerInfo[] = [
  {
    id: 'sabah',
    name: 'SABAH NAMAZI',
    rakats: '2 Sün. + 2 Farz',
    total: 4,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-7.925 0"/><path d="M3 20h18"/></svg>,
    steps: [COMMON_STEPS.niyet('Sabah namazının farzını'), COMMON_STEPS.tekbir, COMMON_STEPS.kiyam, COMMON_STEPS.ruku, COMMON_STEPS.secde, COMMON_STEPS.oturus, COMMON_STEPS.selam]
  },
  {
    id: 'ogle',
    name: 'ÖĞLE NAMAZI',
    rakats: '4 Sün. + 4 Farz + 2 S. Sün.',
    total: 10,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
    steps: [COMMON_STEPS.niyet('Öğle namazının farzını'), COMMON_STEPS.tekbir, COMMON_STEPS.kiyam, COMMON_STEPS.ruku, COMMON_STEPS.secde, COMMON_STEPS.oturus, COMMON_STEPS.selam]
  },
  {
    id: 'ikindi',
    name: 'İKİNDİ NAMAZI',
    rakats: '4 Sün. + 4 Farz',
    total: 8,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="12" x="3" y="4" rx="2"/><circle cx="12" cy="10" r="2"/></svg>,
    steps: [COMMON_STEPS.niyet('İkindi namazının farzını'), COMMON_STEPS.tekbir, COMMON_STEPS.kiyam, COMMON_STEPS.ruku, COMMON_STEPS.secde, COMMON_STEPS.oturus, COMMON_STEPS.selam]
  },
  {
    id: 'aksam',
    name: 'AKŞAM NAMAZI',
    rakats: '3 Farz + 2 Sün.',
    total: 5,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
    steps: [COMMON_STEPS.niyet('Akşam namazının farzını'), COMMON_STEPS.tekbir, COMMON_STEPS.kiyam, COMMON_STEPS.ruku, COMMON_STEPS.secde, COMMON_STEPS.oturus, COMMON_STEPS.selam]
  },
  {
    id: 'yatsi',
    name: 'YATSI NAMAZI',
    rakats: '4 Sün. + 4 Farz + 2 S. Sün. + 3 Vitir',
    total: 13,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3h.01"/><path d="M19 10h.01"/><path d="M5 10h.01"/><path d="M12 21h.01"/><path d="M7 16h.01"/><path d="M17 16h.01"/><path d="M12 12c-4.42 0-8 3.58-8 8h16c0-4.42-3.58-8-8-8z"/><path d="M12 8v4"/><path d="m15 11-3 3-3-3"/></svg>,
    steps: [COMMON_STEPS.niyet('Yatsı namazının farzını'), COMMON_STEPS.tekbir, COMMON_STEPS.kiyam, COMMON_STEPS.ruku, COMMON_STEPS.secde, COMMON_STEPS.oturus, COMMON_STEPS.selam]
  }
];

const NAMAZ_FAYDALARI = [
  { 
    t: 'Kalp Huzuru', 
    d: 'Namaz, zihni dünyevi karmaşadan uzaklaştırıp Allah\'a odaklayarak stresi azaltır ve ruhsal bir denge sağlar.', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  },
  { 
    t: 'Disiplin', 
    d: 'Günde beş vakit namaz kılmak, zaman yönetimini geliştirir ve kişinin iradesini güçlendirerek hayatına düzen getirir.', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
  { 
    t: 'Beden Sağlığı', 
    d: 'Namazdaki rükû, secde ve kıyam gibi hareketler eklemleri esnetir, kan dolaşımını düzenler ve vücudu zinde tutar.', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1.9-1.9"/><path d="m3 3 1.9 1.9"/><path d="m11 4 2 2"/><path d="m20 11-2 2"/><path d="m13 20-2-2"/><path d="m4 13 2-2"/></svg>
  }
];

const NAMAZIN_DISINDAKI_FARZLAR = [
  { t: 'Hadesten Taharet', d: 'Gusül, abdest veya teyemmüm alarak manevi kirlilikten temizlenmektir.' },
  { t: 'Necasetten Taharet', d: 'Vücudun, elbisenin ve namaz kılınacak yerin maddi pisliklerden temiz olmasıdır.' },
  { t: 'Setr-i Avret', d: 'Namazda örtülmesi farz olan yerleri örtmektir.' },
  { t: 'İstikbal-i Kıble', d: 'Namaz kılarken Kabe yönüne (Kıbleye) dönmektir.' },
  { t: 'Vakit', d: 'Namazı kendi vakti girdikten sonra ve vakti çıkmadan önce kılmaktır.' },
  { t: 'Niyet', d: 'Kılınacak namazın hangisi olduğunu bilmek ve kalben belirlemektir.' }
];

const NAMAZIN_ICINDEKI_FARZLAR = [
  { t: 'İftitah Tekbiri', d: 'Namaza başlarken "Allahü Ekber" diyerek tekbir almaktır.' },
  { t: 'Kıyam', d: 'Ayakta durmaya gücü yetenlerin namazı ayakta kılmasıdır.' },
  { t: 'Kıraat', d: 'Namazda ayaktayken Kur\'an-ı Kerim\'den bir miktar okumaktır.' },
  { t: 'Rükû', d: 'Kıraatten sonra eller dizlere gelecek şekilde öne doğru eğilmektir.' },
  { t: 'Sücud (Secde)', d: 'Rükûdan sonra alın, burun, eller, dizler ve ayaklar yere değecek şekilde yere kapanmaktır.' },
  { t: 'Kaade-i Ahire', d: 'Namazın sonunda "Ettehiyyatü" okuyacak kadar oturmaktır.' }
];

const NAMAZ_DIKKAT = [
  { 
    t: 'Tadil-i Erkan', 
    d: 'Rükû, secde ve kıyamda her bir rüknün hakkını vererek, organlar sükunete erene kadar beklemektir.', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"/><rect width="8" height="4" x="8" y="3" rx="1"/><path d="M12 11h4"/><path d="M12 16h4"/></svg>
  }
];

const NamazRehberi: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<RehberTab>('rehber');
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  const [expandedDikkat, setExpandedDikkat] = useState<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const playStepAudio = async (text: string) => {
    if (audioLoading) return;
    setAudioLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Lütfen tane tane oku: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error(e); } finally { setAudioLoading(false); }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
    }
  };

  const nextStep = () => {
    if (selectedPrayer && currentStep < selectedPrayer.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button onClick={selectedPrayer ? () => setSelectedPrayer(null) : onBack} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-transform text-sky-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0.5">
            <h2 className="text-[17px] font-black text-slate-900 tracking-tight leading-none uppercase">Namaz Rehberi</h2>
            <p className="text-[8px] font-black text-sky-500 uppercase tracking-[0.25em]">İBADET REHBERİ PRO+</p>
          </div>
        </div>
      </div>

      {!selectedPrayer && (
        <div className="px-6 py-4 bg-white/50 border-b border-slate-50 flex justify-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'rehber', label: 'REHBER' },
            { id: 'faydalari', label: 'FAYDALARI' },
            { id: 'sartlari', label: 'ŞARTLARI' },
            { id: 'dikkat', label: 'DİKKAT' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as RehberTab)}
              className={`px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-36 no-scrollbar pt-6">
        {!selectedPrayer ? (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'rehber' && (
              <div className="space-y-2">
                {PRAYER_DATA.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => { setSelectedPrayer(p); setCurrentStep(0); if (window.navigator.vibrate) window.navigator.vibrate(20); }}
                    className="bg-white p-3 rounded-[1.4rem] border border-slate-50 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-[1rem] flex items-center justify-center shadow-inner border border-sky-100/50 group-hover:scale-105 transition-transform shrink-0">
                        {p.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[11.5px] font-bold text-slate-800 leading-none mb-1 uppercase tracking-wide truncate">{p.name}</h5>
                        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest truncate">{p.rakats}</p>
                      </div>
                    </div>
                    <div className="bg-sky-50/70 px-2.5 py-1 rounded-xl border border-sky-100/50 shrink-0">
                      <p className="text-sky-600 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{p.total} REKAT</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faydalari' && (
              <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500">
                {NAMAZ_FAYDALARI.map((f, i) => {
                  const isOpen = expandedBenefit === i;
                  return (
                    <div key={i} onClick={() => setExpandedBenefit(isOpen ? null : i)} className={`bg-white rounded-[1.4rem] border transition-all duration-300 overflow-hidden cursor-pointer ${isOpen ? 'border-sky-200 shadow-md' : 'border-slate-50 shadow-sm'}`}>
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-[1rem] flex items-center justify-center shadow-inner border border-sky-100/50 shrink-0">{f.icon}</div>
                          <h5 className="font-bold text-slate-800 text-[11.5px] uppercase tracking-wide">{f.t}</h5>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${isOpen ? 'rotate-180 bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-300'}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                      {isOpen && <div className="px-4 pb-4 animate-in fade-in"><p className="text-slate-500 text-[11px] font-medium leading-relaxed italic border-l-2 border-sky-100 pl-3">{f.d}</p></div>}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Diğer tablar benzer korumalarla buraya eklenebilir */}
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-500 space-y-8">
            {selectedPrayer.steps && selectedPrayer.steps.length > 0 ? (
              <div className="rounded-[3.5rem] p-10 text-center border transition-all duration-700 relative overflow-hidden group shadow-2xl bg-white border-sky-50 text-slate-900">
                <div className="absolute top-6 left-10 opacity-10 font-black text-6xl pointer-events-none">{selectedPrayer.steps[currentStep].icon}</div>
                <div className="relative z-10 space-y-10">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] leading-none text-sky-500">ADIM {currentStep + 1} / {selectedPrayer.steps.length}</h4>
                    <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{selectedPrayer.steps[currentStep].title}</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="arabic-text text-[3.2rem] leading-[1.4] transition-all duration-500 text-slate-800" dir="rtl">{selectedPrayer.steps[currentStep].arabic}</p>
                    <div className="h-px w-10 mx-auto bg-sky-100"></div>
                    <p className="text-[15px] font-bold leading-relaxed italic px-4 text-sky-800">"{selectedPrayer.steps[currentStep].meaning}"</p>
                  </div>
                  <div className="p-6 rounded-[2.5rem] bg-sky-50 border border-sky-100">
                    <p className="text-[12px] font-medium leading-relaxed text-slate-500">{selectedPrayer.steps[currentStep].description}</p>
                  </div>
                  <button onClick={() => playStepAudio(selectedPrayer.steps[currentStep].title + ". " + selectedPrayer.steps[currentStep].description)} disabled={audioLoading} className="w-14 h-14 rounded-full mx-auto flex items-center justify-center transition-all active:scale-90 bg-sky-50 text-sky-600 border border-sky-100 shadow-sm">
                    {audioLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Bu vakit için rehber henüz hazır değil.</p>
                <button onClick={() => setSelectedPrayer(null)} className="mt-4 text-sky-600 font-black text-xs uppercase underline">GERİ DÖN</button>
              </div>
            )}
            
            {selectedPrayer.steps && selectedPrayer.steps.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <button disabled={currentStep === 0} onClick={prevStep} className="py-5 bg-white border border-slate-100 rounded-[2.2rem] font-black text-[10px] text-slate-400 uppercase tracking-widest active:scale-95 disabled:opacity-30 transition-all shadow-sm">ÖNCEKİ ADIM</button>
                <button disabled={currentStep === selectedPrayer.steps.length - 1} onClick={nextStep} className="py-5 bg-sky-600 text-white rounded-[2.2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-sky-900/10">SONRAKİ ADIM</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ PLATFORM</p>
      </div>
    </div>
  );
};

export default NamazRehberi;
