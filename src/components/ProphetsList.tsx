
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Prophet {
  id: number;
  name: string;
  arabicName: string;
  title: string;
  miracles: string[];
  summary: string;
  lessons: string[];
  category: string;
  era: string;
  order: number;
}

const PROPHETS_DATA: Prophet[] = [
  { id: 1, order: 1, name: "Hz. Adem", arabicName: "آدم", title: "Safiyyullah", era: "İnsanlığın Atası", category: "İlk İnsan", summary: "Allah'ın yoktan var ettiği ilk insan ve ilk peygamberdir. Meleklerin secde ettiği, eşyanın isimlerinin öğretildiği yüce şahsiyet.", miracles: ["Eşyanın isimlerini bilmesi", "Çamurdan can bulması"], lessons: ["Tövbe kapısının açıklığı", "İlmin üstünlüğü"] },
  { id: 2, order: 2, name: "Hz. İdris", arabicName: "إدريس", title: "Hekimlerin Üstadı", era: "Hz. Şit'ten Sonra", category: "Sanat Öncüsü", summary: "Terzilik, yazı yazma ve astronomi gibi ilimleri insanlığa öğreten, göklere yükseltilen hikmet sahibi peygamber.", miracles: ["Yazıyı bulması", "Terzilik"], lessons: ["Çalışmanın kutsallığı", "Hikmetle bakış"] },
  { id: 3, order: 3, name: "Hz. Nuh", arabicName: "نوح", title: "Neciyyullah", era: "Tufan Dönemi", category: "Ulul Azm", summary: "Asırlar süren tebliğ mücadelesi ve Allah'ın emriyle inşa ettiği gemiyle inananları büyük tufandan kurtaran sabır abidesi.", miracles: ["Büyük Tufan'dan kurtuluş", "Gemi inşası"], lessons: ["Sonsuz sabır", "Tevekkül"] },
  { id: 4, order: 4, name: "Hz. Hud", arabicName: "هود", title: "Âd Kavminin Elçisi", era: "Âd Kavmi", category: "Sabır Ehli", summary: "Yüksek binalarıyla ünlü Âd kavmini tevhide çağırmış, halkının kibri sonucu gelen büyük kasırgadan inananlarla kurtulmuştur.", miracles: ["Kasırgadan korunması"], lessons: ["Kibrin sonu", "Dürüstlük"] },
  { id: 5, order: 5, name: "Hz. Salih", arabicName: "صالح", title: "Semud'un Uyarıcısı", era: "Semud Kavmi", category: "İnşa Eden", summary: "Kayadan mucizevi bir deve çıkararak halkını imana davet eden, taşları yontarak evler yapan Semud kavmine gönderilen peygamber.", miracles: ["Kayadan deve çıkması"], lessons: ["Emanete riayet", "Görgüsüzlüğün zararı"] },
  { id: 6, order: 6, name: "Hz. İbrahim", arabicName: "إبراهيم", title: "Halilullah", era: "Nemrut Devri", category: "Ulul Azm", summary: "Tevhid mücadelesinin önderi, Nemrut'un ateşinin gül bahçesine döndüğü, Kabe'yi inşa eden teslimiyet sembolü.", miracles: ["Ateşin yakmaması", "Kuşların canlanması"], lessons: ["Tam teslimiyet", "Sarsılmaz iman"] },
  { id: 7, order: 7, name: "Hz. Lût", arabicName: "لوط", title: "Sıddık", era: "Sodom/Gomore", category: "Ahlak Öncüsü", summary: "Hz. İbrahim'in yeğeni, ahlaki çöküntü içindeki Sodom halkını uyararak doğru yola davet eden sabırlı elçi.", miracles: ["Meleklerin ziyareti"], lessons: ["Ahlaki sebat", "Kötülükten kaçınma"] },
  { id: 8, order: 8, name: "Hz. İsmail", arabicName: "إسماعيل", title: "Zebihullah", era: "Kabe İnşası", category: "Sabır Timsali", summary: "Hz. İbrahim'in oğlu, zemzem suyunun ikram edildiği ve babasıyla Kabe'yi inşa eden, kurban imtihanının kahramanı.", miracles: ["Zemzem suyunun çıkışı"], lessons: ["Sözünde durmak", "Babaya itaat"] },
  { id: 9, order: 9, name: "Hz. İshak", arabicName: "إسحاق", title: "Müjde", era: "Kenan Diyarı", category: "Bereket Ehli", summary: "Hz. İbrahim'in ikinci oğlu, soyundan pek çok peygamberin geldiği, salih ve mübarek kılınan büyük elçi.", miracles: ["Yaşlılıkta doğumu"], lessons: ["Allah'ın müjdesine güven", "Salih amel"] },
  { id: 10, order: 10, name: "Hz. Yakub", arabicName: "يعقوب", title: "İsrail", era: "Yusuf'un Hasreti", category: "Hüzün ve Sabır", summary: "Oğlu Yusuf'un hasretiyle gözleri kapanan ama ümidini asla kesmeyen, sabrın ve evlat sevgisinin en büyük örneği.", miracles: ["Yusuf'un gömleğiyle gözlerinin açılması"], lessons: ["Ümidi kesmemek", "Güzel sabır"] },
  { id: 11, order: 11, name: "Hz. Yusuf", arabicName: "يوسف", title: "Sıddık", era: "Mısır Sarayı", category: "İffet Timsali", summary: "Kuyudan saraya uzanan, iffetiyle imtihan edilen ve Mısır'ın hazinesine hükmeden rüya tabircisi ve güzellik abidesi.", miracles: ["Rüya tabiri", "Eşsiz güzellik"], lessons: ["İffet", "Affedicilik"] },
  { id: 12, order: 12, name: "Hz. Eyyub", arabicName: "أيوب", title: "Sabır Dağı", era: "İmtihan Dönemi", category: "Şifa Ehli", summary: "Ağır hastalık ve kayıplara rağmen 'Hamdolsun' diyen, sabrıyla meşhur olmuş ve sonunda sağlığına kavuşmuş peygamber.", miracles: ["Ayağını yere vurunca çıkan şifalı su"], lessons: ["Şükür", "Hastalığa sabır"] },
  { id: 13, order: 13, name: "Hz. Şuayb", arabicName: "شعيب", title: "Hatibü'l Enbiya", era: "Medyen/Eyke", category: "Adalet Öncüsü", summary: "Ölçü ve tartıda hile yapan Medyen halkına adaleti ve dürüstlüğü en güzel hitabetle anlatan peygamber.", miracles: ["Sözlerinin etkisi"], lessons: ["Ticari ahlak", "Adalet"] },
  { id: 14, order: 14, name: "Hz. Musa", arabicName: "موسى", title: "Kelimullah", era: "Firavun Devri", category: "Ulul Azm", summary: "Allah ile Tur dağında konuşan, Kızıldeniz'i asasıyla ikiye bölen, zulme karşı hakkın en sert savunucusu.", miracles: ["Asanın yılana dönüşmesi", "Kızıldeniz'in yarılması"], lessons: ["Zulme boyun eğmeme", "Cesaret"] },
  { id: 15, order: 15, name: "Hz. Harun", arabicName: "هارون", title: "Yardımcı", era: "Tevrat Dönemi", category: "Fesahat Sahibi", summary: "Hz. Musa'nın kardeşi ve yardımcısı, hitabeti güçlü, İsrailoğulları'na rehberlik eden mübarek elçi.", miracles: ["Musa'nın duasıyla peygamber olması"], lessons: ["Kardeşlik", "Destek olmak"] },
  { id: 16, order: 16, name: "Hz. Davud", arabicName: "داوود", title: "Halife", era: "Zebur Dönemi", category: "Zikir Ehli", summary: "Sesiyle dağları ve kuşları zikre getiren, demiri hamur gibi şekillendiren, Zebur kitabının verildiği hükümdar peygamber.", miracles: ["Demiri elle şekillendirme", "Eşsiz ses"], lessons: ["Zikir", "Emekle geçinme"] },
  { id: 17, order: 17, name: "Hz. Süleyman", arabicName: "سليمان", title: "Büyük Hükümdar", era: "Altın Çağ", category: "İlim ve Kudret", summary: "Cinlere, rüzgara ve hayvanlara hükmeden, ihtişamlı krallığına rağmen tevazusunu kaybetmeyen en büyük hükümdar.", miracles: ["Hayvanlarla konuşma", "Rüzgar emri"], lessons: ["Şükreden zenginlik", "Adaletli güç"] },
  { id: 18, order: 18, name: "Hz. İlyas", arabicName: "إلياس", title: "İman Muhafızı", era: "Baal Dönemi", category: "Tevhid Savunucusu", summary: "Baal putuna tapan halkını uyaran, darlık ve kıtlık döneminde mucizeleriyle bilinen sarsılmaz iman sahibi elçi.", miracles: ["Kıtlığı bitirmesi"], lessons: ["Sebat", "Tevhid"] },
  { id: 19, order: 19, name: "Hz. Elyasa", arabicName: "اليسع", title: "Varis", era: "Hidayet Yolcusu", category: "Rehber", summary: "Hz. İlyas'ın öğrencisi ve halefi, İsrailoğulları'nı kötülüklerden uzak tutmak için çabalayan mübarek peygamber.", miracles: ["Bereket mucizeleri"], lessons: ["Liyakat", "Sadakat"] },
  { id: 20, order: 20, name: "Hz. Yunus", arabicName: "يونس", title: "Zünnûn", era: "Ninova", category: "Tövbe Kapısı", summary: "Balığın karnında 40 gün boyunca 'Lâ ilâhe illâ ente sübhâneke...' zikriyle tövbe eden ve halkı toptan iman eden peygamber.", miracles: ["Balığın karnında yaşaması"], lessons: ["Sabırsızlığın zararı", "Zikrin gücü"] },
  { id: 21, order: 21, name: "Hz. Zülkifl", arabicName: "ذو الكفل", title: "Kefil", era: "Vaat Ehli", category: "Söz Üstadı", summary: "Verdiği sözü her ne pahasına olursa olsun tutan, sabrı ve adaletiyle bilinen mübarek peygamber.", miracles: ["Sözünde durma kararlılığı"], lessons: ["Sözün senet olması", "Dürüstlük"] },
  { id: 22, order: 22, name: "Hz. Zekeriya", arabicName: "زكريا", title: "İhtiyar Müjde", era: "Meryem'in Hamisi", category: "İbadet Aşığı", summary: "Yaşlılığında Yahya ile müjdelenen, Hz. Meryem'e hâmilik yapan, mabette zikirle meşgul olan büyük peygamber.", miracles: ["Yaşlılıkta çocuk sahibi olma"], lessons: ["Dualarda ısrar", "Hizmet aşkı"] },
  { id: 23, order: 23, name: "Hz. Yahya", arabicName: "يحيى", title: "Şehit", era: "İsa'nın Müjdecisi", category: "Zühd Ehli", summary: "Hz. İsa'nın gelişini müjdeleyen, iffeti, zühdü ve Allah korkusuyla bilinen, daha çocukken hikmet verilen peygamber.", miracles: ["Çocuk yaşta hikmet"], lessons: ["Iffet", "Dünya malına meyletmeme"] },
  { id: 24, order: 24, name: "Hz. İsa", arabicName: "عيسى", title: "Ruhullah", era: "İncil Dönemi", category: "Ulul Azm", summary: "Mucizevi bir şekilde babasız doğan, beşikte konuşan, ölüleri dirilten ve göğe yükseltilen merhamet peygamberi.", miracles: ["Beşikte konuşma", "Ölü diriltme"], lessons: ["Maneviyat", "Şefkat"] },
  { id: 25, order: 25, name: "Hz. Muhammed (SAV)", arabicName: "محمد", title: "Hatemü'l Enbiya", era: "Asr-ı Saadet", category: "Ulul Azm", summary: "Alemlere rahmet olarak gönderilen, Kur'an-ı Kerim'in kendisine indirildiği son peygamber ve güzel ahlakın tamamlayıcısı.", miracles: ["Kur'an-ı Kerim", "Miraç Hadisesi"], lessons: ["Evrensel kardeşlik", "Eşsiz ahlak"] }
];

const ProphetsList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProphet, setSelectedProphet] = useState<Prophet | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'miracles' | 'lessons' | 'ai'>('info');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const filteredProphets = useMemo(() => {
    return PROPHETS_DATA.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.order - b.order);
  }, [searchTerm]);

  const askAi = async () => {
    if (!aiQuestion.trim() || loadingAi || !selectedProphet) return;
    setLoadingAi(true);
    setAiResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Benim için ${selectedProphet.name} hakkında şu soruyu detaylı ve İslami kaynaklara uygun şekilde cevapla: ${aiQuestion}`,
        config: { systemInstruction: "Sen uzman bir din kültürü ve siyer hocasısın. Cevapların akademik ama anlaşılır olsun." }
      });
      setAiResponse(response.text || "Cevap üretilemedi.");
    } catch (e) {
      setAiResponse("Yapay zeka şu an cevap veremiyor.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-sky-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedProphet ? () => { setSelectedProphet(null); setAiResponse(''); setAiQuestion(''); } : onBack} 
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform text-sky-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0.5">
            <h2 className="text-[17px] font-black text-slate-800 tracking-tight leading-none uppercase">
              {selectedProphet ? selectedProphet.name : "PEYGAMBERLER"}
            </h2>
            <p className="text-[8px] font-black text-sky-600 uppercase tracking-[0.25em] mt-1">
              KRONOLOJİK REHBER
            </p>
          </div>
        </div>
        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-lg border border-sky-100">📖</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-4">
        {!selectedProphet ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Daily Quote Card - UPDATED TO PASTEL LIGHT BLUE */}
            <div className="bg-[#f0f9ff] rounded-[2.2rem] p-8 text-sky-900 border border-sky-100 relative overflow-hidden group shadow-sm">
               <div className="absolute right-[-5%] top-[-10%] opacity-[0.05] text-[12rem] pointer-events-none rotate-12">🕯️</div>
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                     <p className="text-[9px] font-black text-sky-600 uppercase tracking-[0.4em]">HAFTANIN KISSASI</p>
                  </div>
                  <h3 className="text-xl font-black tracking-tighter serif-text italic leading-tight">"Rabbim, doğrusu bana indireceğin her hayra muhtacım."</h3>
                  <p className="text-[11px] font-medium text-sky-800/70 leading-relaxed italic">Hz. Musa'nın (as) Medyen yolundaki samimi ve mahcup duası.</p>
                  <button 
                    onClick={() => setSelectedProphet(PROPHETS_DATA.find(p => p.id === 14) || null)}
                    className="bg-sky-600 text-white text-[9px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-lg shadow-sky-100 mt-2 active:scale-95 transition-all"
                  >
                    MUSA (AS) OKU →
                  </button>
               </div>
            </div>

            {/* Search */}
            <div className="relative group">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Peygamber ara..."
                className="w-full bg-white border border-slate-100 focus:bg-white focus:border-sky-200 rounded-[1.4rem] pl-12 pr-4 py-3.5 outline-none font-bold text-sm text-slate-700 shadow-sm transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            {/* List Grid - PORTABLE DESIGN */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-1">
                 <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SİLSİLE-İ ENBİYA</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {filteredProphets.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedProphet(p)}
                    className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-sky-50/50 hover:border-sky-100 transition-all cursor-pointer group active:scale-[0.98] shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg font-serif font-black shadow-inner border border-sky-100/50 group-hover:scale-110 transition-transform">
                          {p.name.replace("Hz. ", "")[0]}
                       </div>
                       <div>
                          <h4 className="text-[15px] font-black text-slate-900 group-hover:text-sky-800 transition-colors tracking-tight leading-none mb-1">{p.name}</h4>
                          <div className="flex items-center gap-1.5 opacity-60">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.title}</p>
                             <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                             <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest">{p.era}</p>
                          </div>
                       </div>
                    </div>
                    <div className="text-sky-200 group-hover:text-sky-500 transition-colors group-hover:translate-x-0.5">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
             {/* Prophet Hero Section */}
             <div className="text-center space-y-4">
                <div className="relative inline-block">
                   <div className="w-20 h-20 bg-sky-600 text-white rounded-[1.8rem] flex items-center justify-center text-4xl font-serif font-black shadow-2xl shadow-sky-900/20 rotate-3 mx-auto relative z-10 border-4 border-white">
                      {selectedProphet.name.replace("Hz. ", "")[0]}
                   </div>
                   <div className="absolute inset-0 bg-sky-400/20 rounded-[1.8rem] blur-2xl -z-10 animate-pulse"></div>
                </div>
                <div className="space-y-0.5">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase serif-text italic">{selectedProphet.name}</h3>
                   <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">{selectedProphet.title}</p>
                </div>
                <p className="arabic-text text-2xl text-slate-400 opacity-60">عليه السلام</p>
             </div>

             {/* Tab Menu - Portable */}
             <div className="bg-slate-100/50 p-1 rounded-2xl flex border border-slate-200/40">
                {['info', 'miracles', 'lessons', 'ai'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab === 'info' ? 'ÖZET' : tab === 'miracles' ? 'MUCİZE' : tab === 'lessons' ? 'HİKMET' : 'ASK AI'}
                  </button>
                ))}
             </div>

             {/* Content Area */}
             <div className="min-h-[300px]">
                {activeTab === 'info' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                     <div className="bg-white p-7 rounded-[2.2rem] border border-slate-100 shadow-sm leading-relaxed">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KISSASI</h5>
                        </div>
                        <p className="text-[14px] font-medium text-slate-700 leading-[1.8] italic">"{selectedProphet.summary}"</p>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-sky-50/50 p-5 rounded-3xl border border-sky-100 text-center">
                           <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-1">DÖNEMİ</p>
                           <p className="text-xs font-black text-slate-800">{selectedProphet.era}</p>
                        </div>
                        <div className="bg-sky-50/50 p-5 rounded-3xl border border-sky-100 text-center">
                           <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest mb-1">VASFI</p>
                           <p className="text-xs font-black text-slate-800">{selectedProphet.category}</p>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'miracles' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                     {selectedProphet.miracles.map((m, i) => (
                       <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 transition-all shadow-sm">
                          <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center text-lg shadow-inner">✨</div>
                          <p className="text-[14px] font-black text-slate-700 tracking-tight">{m}</p>
                       </div>
                     ))}
                  </div>
                )}

                {activeTab === 'lessons' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                     {selectedProphet.lessons.map((l, i) => (
                       <div key={i} className="bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100 flex items-start gap-4">
                          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm shrink-0 border border-emerald-100">{i+1}</div>
                          <p className="text-[13.5px] font-bold text-emerald-950 leading-relaxed">{l}</p>
                       </div>
                     ))}
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 pt-2">
                     <div className="relative group">
                        <textarea 
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          placeholder="Merak ettiğiniz bir detayı sorun..."
                          className="w-full min-h-[120px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-sky-200 rounded-[1.8rem] p-6 outline-none font-bold text-sm text-slate-800 shadow-inner resize-none"
                        />
                        <button 
                          onClick={askAi}
                          disabled={!aiQuestion.trim() || loadingAi}
                          className="absolute bottom-3 right-3 w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"
                        >
                           {loadingAi ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "✈️"}
                        </button>
                     </div>

                     {aiResponse && (
                       <div className="bg-white p-7 rounded-[2.2rem] border border-slate-100 shadow-xl animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 mb-4">
                             <div className="w-1 h-1 bg-sky-400 rounded-full animate-pulse"></div>
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REHBER YORUMU</h4>
                          </div>
                          <p className="text-[14px] font-medium text-slate-700 leading-[1.8] whitespace-pre-wrap">{aiResponse}</p>
                       </div>
                     )}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Brand Decor */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ ENBİYA REHBERİ</p>
      </div>
    </div>
  );
};

export default ProphetsList;
