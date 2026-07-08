
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface AnalysisResult {
  status: 'HELAL' | 'HARAM' | 'ŞÜPHELİ';
  productName: string;
  detectedIngredients: string[];
  haramIngredients: string[];
  doubtfulIngredients: string[];
  explanation: string;
}

const HelalScanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setIsCapturing(true);
    setResult(null);
    try {
      let s: MediaStream;
      try {
        // Önce arka kamerayı deniyoruz
        s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: 'environment' } }, 
          audio: false 
        });
      } catch (e) {
        // Arka kamera yoksa herhangi bir kamerayı açıyoruz
        console.warn("Arka kamera bulunamadı, varsayılan kamera deneniyor.");
        s = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
      }
      
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Kamera hatası:", err);
      alert("Kamera başlatılamadı. Lütfen tarayıcı izinlerini kontrol edin.");
      setIsCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    stopCamera();
    analyzeIngredients(base64Image);
  };

  const analyzeIngredients = async (base64Data: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            parts: [
              { text: "Sen bir Helal Gıda uzmanısın. Bu görseldeki içerik listesini oku. İçindeki katkı maddelerini (E-kodları dahil) incele. İslam fıkhına göre (Diyanet ve uluslararası helal sertifikasyon kuruluşları standartlarında) ürünün helal olup olmadığını belirle. Haram veya şüpheli maddeleri tek tek belirt. Sonucu JSON formatında ver." },
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['HELAL', 'HARAM', 'ŞÜPHELİ'] },
              productName: { type: Type.STRING },
              detectedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              haramIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              doubtfulIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING }
            },
            required: ['status', 'explanation']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data as AnalysisResult);
    } catch (err) {
      console.error("Analiz hatası:", err);
      alert("Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 animate-in fade-in duration-500 overflow-hidden relative">
      {/* Premium Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={result ? () => setResult(null) : onBack}
            className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Helal Tarayıcı</h2>
            <p className="text-[8px] font-black text-sky-500 uppercase tracking-[0.25em] mt-1">BARKOD & İÇERİK ANALİZİ</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/20 rounded-xl flex items-center justify-center text-lg border border-sky-100 text-sky-500">🔍</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-6">
        {!isCapturing && !loading && !result && (
          <div className="space-y-10 animate-in fade-in duration-500 flex flex-col items-center justify-center py-12">
            <div className="relative">
               {/* Frame Corners - Now Pastel Sky Blue */}
               <div className="w-48 h-48 border-[6px] border-sky-500/10 rounded-[2.5rem] flex items-center justify-center relative">
                  <div className="absolute top-[-3px] left-[-3px] w-12 h-12 border-t-[6px] border-l-[6px] border-sky-400 rounded-tl-[2rem]"></div>
                  <div className="absolute top-[-3px] right-[-3px] w-12 h-12 border-t-[6px] border-r-[6px] border-sky-400 rounded-tr-[2rem]"></div>
                  <div className="absolute bottom-[-3px] left-[-3px] w-12 h-12 border-b-[6px] border-l-[6px] border-sky-400 rounded-bl-[2rem]"></div>
                  <div className="absolute bottom-[-3px] right-[-3px] w-12 h-12 border-b-[6px] border-r-[6px] border-sky-400 rounded-br-[2rem]"></div>
                  <div className="text-6xl text-sky-500/20">📷</div>
               </div>
            </div>

            <div className="text-center space-y-3">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Güvenle Tüketin</h3>
               <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed px-10">
                 Gıdaların içerik listesini fotoğraflayın, yapay zeka saniyeler içinde helallik durumunu analiz etsin.
               </p>
            </div>

            <button 
              onClick={startCamera}
              className="w-full max-w-[280px] py-5 bg-sky-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-sky-900/10 active:scale-95 transition-all"
            >
              TARAMAYI BAŞLAT
            </button>
            
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 max-w-[320px]">
               <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-sm">💎</div>
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-tight uppercase tracking-wider">
                 Bu özellik Pro+ üyeleri için sınırsızdır.
               </p>
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="fixed inset-0 z-[50] bg-black flex flex-col animate-in fade-in duration-300">
            <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-48 border-2 border-white/30 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-400/50 animate-scanner-bar"></div>
              </div>
            </div>

            <div className="bg-black/90 p-8 pb-12 flex flex-col items-center gap-8">
               <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">İÇERİK LİSTESİNİ KADRAJA ALIN</p>
               <div className="flex items-center gap-12">
                  <button onClick={stopCamera} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-sm">✕</button>
                  <button 
                    onClick={captureImage}
                    className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-1"
                  >
                    <div className="w-full h-full border-4 border-black rounded-full bg-sky-500"></div>
                  </button>
                  <div className="w-12 h-12 opacity-0"></div>
               </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🧪</div>
             </div>
             <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">İçerik Analiz Ediliyor</p>
                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mt-1">FIKHİ KAYNAKLAR TARANIYOR</p>
             </div>
          </div>
        )}

        {result && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 pb-20">
             {/* Result Card */}
             <div className={`p-8 rounded-[2.8rem] text-center relative overflow-hidden border shadow-xl ${
               result.status === 'HELAL' ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 text-teal-950 shadow-teal-900/5' :
               result.status === 'HARAM' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 text-rose-950 shadow-rose-900/5' :
               'bg-amber-50 dark:bg-amber-950/20 border-amber-100 text-amber-950 shadow-amber-900/5'
             }`}>
                <div className="relative z-10 space-y-6">
                   <div className={`inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm ${
                     result.status === 'HELAL' ? 'bg-teal-600 text-white' :
                     result.status === 'HARAM' ? 'bg-rose-600 text-white' :
                     'bg-amber-600 text-white'
                   }`}>
                      {result.status} ÜRÜN
                   </div>

                   <h3 className="text-3xl font-black tracking-tighter leading-tight">
                     {result.productName || "Ürün Analizi"}
                   </h3>
                   
                   <p className="text-[15px] font-bold opacity-80 leading-relaxed px-2">
                     {result.explanation}
                   </p>
                </div>
                
                {/* Visual Watermark */}
                <div className="absolute right-[-10%] top-[-5%] text-[10rem] opacity-[0.03] pointer-events-none rotate-12">
                  {result.status === 'HELAL' ? '🍃' : result.status === 'HARAM' ? '⚠️' : '❓'}
                </div>
             </div>

             {/* Details Section */}
             <div className="space-y-4">
                {(result.haramIngredients?.length ?? 0) > 0 && (
                  <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">HARAM MADDELER</p>
                    <div className="flex flex-wrap gap-2">
                      {result.haramIngredients.map((ing, i) => (
                        <span key={i} className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.doubtfulIngredients?.length ?? 0) > 0 && (
                  <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">ŞÜPHELİ MADDELER</p>
                    <div className="flex flex-wrap gap-2">
                      {result.doubtfulIngredients.map((ing, i) => (
                        <span key={i} className="bg-amber-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <button 
                onClick={() => { setResult(null); startCamera(); }}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
             >
                YENİ ÜRÜN TARA
             </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ HELAL REHBERİ</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanner-bar {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scanner-bar {
          animation: scanner-bar 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default HelalScanner;
