
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const AISor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      if (!process.env.API_KEY) {
        setMessages(prev => [...prev, { role: 'ai', text: "Yapay zeka servisi yapılandırılmamış. Lütfen .env dosyasına GEMINI_API_KEY ekleyin." }]);
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Sen bilge, nazik ve yardımsever bir İslam alimi asistanısın. Kullanıcıların ibadetler, dualar ve dini bilgiler hakkındaki sorularına Kur\'an ve Sünnet ışığında, kolay anlaşılır cevaplar ver. Cevapların her zaman saygılı ve birleştirici olsun.'
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Üzgünüm, şu an cevap veremiyorum." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-emerald-800">Dini Asistan</h2>
        <p className="text-xs text-gray-500">Aklınıza takılan dini soruları sorabilirsiniz.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-10">
            <div className="text-4xl mb-2">🕌</div>
            <p className="text-gray-400">Hangi konuda bilgi almak istersiniz?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Namazın şartları nelerdir?', 'Sabah namazı kaç rekat?', 'Zikir çekmenin fazileti nedir?'].map(q => (
                <button 
                  key={q} 
                  onClick={() => setInput(q)}
                  className="bg-white border border-emerald-100 text-emerald-700 text-xs px-3 py-2 rounded-full hover:bg-emerald-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Sorunuzu buraya yazın..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
          >
            ✈️
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISor;
