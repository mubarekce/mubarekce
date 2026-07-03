
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface TajwidRule {
  id: string;
  title: string;
  desc: string;
  example: string;
  audio?: string;
}

const TAJWID_RULES: TajwidRule[] = [
  { id: 'medd', title: 'Medd Kuralları', desc: 'Harfleri uzatarak okuma kaideleri.', example: 'قَالَ - يَقُولُ' },
  { id: 'idgham', title: 'İdgam Kuralları', desc: 'Harfleri birbirine katarak okuma.', example: 'مَنْ يَقُولُ' },
  { id: 'ihfa', title: 'İhfa', desc: 'Nun-i sakini gizleyerek genizden okuma.', example: 'أَنْزَلْنَا' },
  { id: 'izhar', title: 'İzhar', desc: 'Harfleri açık ve net okuma.', example: 'مِنْ عِلْمٍ' },
  { id: 'iqlab', title: 'İklab', desc: 'Nun harfini Mim harfine dönüştürme.', example: 'مِنْ بَعْدِ' },
];

const TecvidHocasi: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; notes: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'practice' | 'rules'>('practice');
  
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
        analyzeRecitation(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Mikrofon hatası:", err);
      alert("Mikrofon izni verilmedi veya bir hata oluştu.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeRecitation = async (blob: Blob) => {
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
                text: "Sen uzman bir tecvid hocasısın. Bu ses kaydındaki Kur'an tilavetini analiz et. Tecvid kurallarına (medd, ihfa, idgam vb.) uyumu, mahreçleri ve genel akışı değerlendir. 100 üzerinden bir puan ver ve yapıcı geri bildirimler sun. Çıktıyı JSON formatında ver."
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
                score: { type: Type.NUMBER, description: 'Tilavet puanı (0-100)' },
                feedback: { type: Type.STRING, description: 'Genel değerlendirme cümlesi' },
                notes: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'Geliştirilmesi gereken teknik noktalar'
                }
              },
              required: ['score', 'feedback', 'notes']
            }
          }
        });

        const jsonStr = response.text?.trim() || '{}';
        const data = JSON.parse(jsonStr);
        setResult(data);
        setLoading(false);
      };
    } catch (err) {
      console.error("Analiz Hatası:", err);
      setLoading(false);
      alert("Analiz sırasında bir sorun oluştu.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-50">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Tecvid Hocası</h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-blue-500">AI İLE SES ANALİZİ</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-2">
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400'}`}
        >
          Tilavet Analizi
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400'}`}
        >
          Tecvid Kuralları
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {activeTab === 'practice' ? (
          <div className="py-6 space-y-10 animate-in fade-in duration-500">
            {!result && !loading && (
              <div className="text-center space-y-8">
                <div className="bg-blue-50/50 rounded-[3rem] p-10 border border-blue-100 shadow-inner">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-blue-900 mb-2">Okuyuşunu Analiz Et</h3>
                  <p className="text-xs text-blue-700/60 font-medium leading-relaxed">
                    Mikrofon düğmesine bas ve bir ayet oku. Yapay zeka tecvid kurallarını ve mahreçlerini analiz edip puanlasın.
                  </p>
                </div>

                <div className="relative flex items-center justify-center">
                   <div className={`absolute w-32 h-32 rounded-full blur-2xl opacity-20 transition-all duration-1000 ${isRecording ? 'bg-rose-500 animate-pulse scale-150' : 'bg-blue-400 scale-100'}`}></div>
                   <button 
                     onClick={isRecording ? stopRecording : startRecording}
                     className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90 z-10 ${isRecording ? 'bg-rose-500 text-white animate-subtle' : 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40'}`}
                   >
                     {isRecording ? (
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                         <rect x="6" y="6" width="12" height="12" rx="2" />
                       </svg>
                     ) : (
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                         <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                         <line x1="12" y1="19" x2="12" y2="23"/>
                       </svg>
                     )}
                   </button>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isRecording ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                  {isRecording ? 'Dinleniyor...' : 'Kayıt İçin Dokun'}
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in">
                 <div className="relative w-20 h-20">
                   <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-black text-slate-900">Ses Analiz Ediliyor</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Müfredat Kontrolü</p>
                 </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                   <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square bg-blue-50 rounded-full blur-[60px] opacity-50"></div>
                   
                   <div className="relative z-10 text-center space-y-6">
                      <div className="inline-flex flex-col items-center">
                         <div className="text-[3.5rem] font-black text-blue-600 leading-none tracking-tighter tabular-nums drop-shadow-sm">
                           {result.score}
                         </div>
                         <div className="text-[9px] font-black text-blue-300 uppercase tracking-[0.4em] mt-1">SKOR</div>
                      </div>

                      <div className="h-px w-12 bg-slate-100 mx-auto"></div>

                      <p className="text-sm font-bold text-slate-800 leading-relaxed px-4 italic">
                        "{result.feedback}"
                      </p>

                      <div className="space-y-3 text-left">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">AI NOTLARI</p>
                         {result.notes.map((note, i) => (
                           <div key={i} className="flex gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <p className="text-xs font-semibold text-slate-600 leading-normal">{note}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  YENİ ANALİZ BAŞLAT
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 space-y-4 animate-in fade-in duration-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 mb-2">TEMEL KAİDELER</p>
            {TAJWID_RULES.map((rule) => (
              <div key={rule.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-900">{rule.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{rule.desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/></svg>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-50 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                   <span className="arabic-text text-xl font-bold text-slate-900">{rule.example}</span>
                   <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs text-blue-600 shadow-sm active:scale-90">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-8 text-center opacity-30 sticky bottom-0 bg-gradient-to-t from-white to-transparent pointer-events-none">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">AI SES TANIMA MOTORU V2.1</p>
      </div>
    </div>
  );
};

export default TecvidHocasi;
