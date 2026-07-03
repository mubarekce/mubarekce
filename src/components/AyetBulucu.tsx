
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

const AyetBulucu: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<{ surah: string; ayah: string; text: string; translation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        identifyAyah(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Mikrofon hatası:", err);
      alert("Mikrofon izni verilmedi.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const identifyAyah = async (blob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: {
            parts: [
              {
                text: "Analyze this Quranic audio recording. Identify the surah name, ayah number, original Arabic text, and a Turkish translation."
              },
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: base64Audio
                }
              }
            ]
          },
          config: {
             responseMimeType: "application/json",
             responseSchema: {
               type: Type.OBJECT,
               properties: {
                 surah: { type: Type.STRING, description: 'The name of the Surah' },
                 ayah: { type: Type.STRING, description: 'The Ayah number' },
                 text: { type: Type.STRING, description: 'The original Arabic text' },
                 translation: { type: Type.STRING, description: 'The Turkish translation' },
               },
               required: ['surah', 'ayah', 'text', 'translation'],
             }
          }
        });

        const jsonStr = response.text?.trim() || '{}';
        const data = JSON.parse(jsonStr);
        if (data.surah) {
          setResult(data);
        } else {
          alert("Ayet tanımlanamadı. Lütfen daha net bir sesle tekrar deneyin.");
        }
        setLoading(false);
      };
    } catch (err) {
      console.error("AI Hatası:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] text-white animate-in fade-in duration-500 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-5 relative z-20">
        <button 
          onClick={onBack} 
          className="w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight">Akıllı Ayet Bulucu</h2>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">YAPAY ZEKA DESTEKLİ</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {!result && !loading && (
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700">
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              {/* Outer Pulse Rings */}
              <div className={`absolute inset-0 rounded-full border border-blue-500/10 transition-all duration-1000 ${isRecording ? 'animate-ping opacity-100' : 'opacity-0'}`}></div>
              <div className={`absolute inset-4 rounded-full border border-blue-400/20 transition-all duration-1000 delay-150 ${isRecording ? 'animate-ping opacity-100' : 'opacity-0'}`}></div>
              <div className={`absolute inset-0 rounded-full bg-blue-500/5 blur-3xl transition-transform duration-1000 ${isRecording ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
              
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 relative z-10 group ${isRecording ? 'bg-rose-500 shadow-rose-900/40' : 'bg-blue-600 shadow-blue-900/40 hover:bg-blue-500'}`}
              >
                {isRecording ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:scale-110 transition-transform">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight">{isRecording ? 'Dinleniyor...' : 'Dinlemeye Başla'}</h3>
              <p className="text-slate-400 text-[13px] font-medium max-w-[280px] mx-auto leading-relaxed">
                Ortamda okunan Kuran-ı Kerim ayetini yakalayıp hangi sure olduğunu bulur.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
             <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
               <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full"></div>
               <div className="absolute inset-0 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
               <div className="text-3xl animate-pulse">🔎</div>
             </div>
             <div>
               <p className="text-xl font-black tracking-tight">Analiz Ediliyor</p>
               <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Mübarekçe AI Bulut Sunucuları</p>
             </div>
          </div>
        )}

        {result && (
          <div className="w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-10 animate-in slide-in-from-bottom-12 duration-700 shadow-2xl relative overflow-hidden">
             {/* Gradient glow behind result */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="text-center relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] mb-6 border border-blue-500/20 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                  AYET BULUNDU
                </div>
                <h3 className="text-4xl font-black tracking-tighter mb-1">{result.surah}</h3>
                <p className="text-blue-500 font-bold uppercase tracking-widest text-[11px]">{result.ayah}. Ayet</p>
             </div>

             <div className="space-y-8 relative z-10">
                <p className="arabic-text text-[2.4rem] leading-[1.8] text-center text-white/95" dir="rtl">{result.text}</p>
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <div className="text-white/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
                <p className="text-slate-300 text-sm italic text-center font-medium leading-relaxed px-2">
                  "{result.translation}"
                </p>
             </div>

             <button 
              onClick={() => setResult(null)} 
              className="w-full py-4.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-inner active:scale-95 relative z-10"
             >
               YENİ AYET DİNLET
             </button>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-10 text-center opacity-20 relative z-20">
        <p className="text-[9px] font-black uppercase tracking-[0.6em]">AKUSTİK PARMAK İZİ TEKNOLOJİSİ V4.0</p>
      </div>
    </div>
  );
};

export default AyetBulucu;
