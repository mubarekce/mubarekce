
import React, { useState, useMemo } from 'react';

interface Esma {
  id: number;
  name: string;
  arabic: string;
  meaning: string;
  merit: string;
  target?: number;
}

const ESMA_LIST: Esma[] = [
  { id: 1, name: "Allah", arabic: "الله", meaning: "Eşi benzeri olmayan, tek ilah.", merit: "HER TÜRLÜ İSTEK İÇİN", target: 66 },
  { id: 2, name: "Er-Rahmân", arabic: "الرحمن", meaning: "Dünyada bütün mahlukata şefkat gösteren.", merit: "GÖNÜL FERAHLIĞI İÇİN", target: 298 },
  { id: 3, name: "Er-Rahîm", arabic: "الرحيم", meaning: "Ahirette müminlere sonsuz merhamet eden.", merit: "RIZIK BOLLUĞU İÇİN", target: 258 },
  { id: 4, name: "El-Melik", arabic: "الملك", meaning: "Bütün kainatın mutlak sahibi ve hakimi.", merit: "MADDİ VE MANEVİ GÜÇ İÇİN", target: 90 },
  { id: 5, name: "El-Kuddûs", arabic: "القدوس", meaning: "Hata ve noksanlıklardan tamamen münezzeh.", merit: "GÜNAHLARDAN ARINMAK İÇİN", target: 170 },
  { id: 6, name: "Es-Selâm", arabic: "السلام", meaning: "Esenlik veren, tehlikelerden kurtaran.", merit: "KORKULARDAN EMİN OLMAK İÇİN", target: 131 },
  { id: 7, name: "El-Mü'min", arabic: "المؤمن", meaning: "Gönüllere iman veren, emniyet sağlayan.", merit: "KÖTÜ AHLAKTAN KORUNMAK İÇİN", target: 136 },
  { id: 8, name: "El-Müheymin", arabic: "المهيمن", meaning: "Gözeten, koruyan, her şeyi yöneten.", merit: "DUALARIN KABULÜ İÇİN", target: 145 },
  { id: 9, name: "El-Azîz", arabic: "العزيز", meaning: "İzzet sahibi, mağlup edilmesi imkansız.", merit: "DÜŞMANA GALİP GELMEK İÇİN", target: 94 },
  { id: 10, name: "El-Cebbâr", arabic: "الجبار", meaning: "Dilediğini zorla yaptıran, kırıkları onaran.", merit: "ZALİMLERDEN KORUNMAK İÇİN", target: 206 },
  { id: 11, name: "El-Mütekebbir", arabic: "المتكber", meaning: "Her şeyde büyüklüğünü gösteren.", merit: "İZZET VE REFAH İÇİN", target: 662 },
  { id: 12, name: "El-Hâlık", arabic: "الخالق", meaning: "Her şeyi yoktan var eden, yaratan.", merit: "İŞLERİN YOLUNA GİRMESİ İÇİN", target: 731 },
  { id: 13, name: "El-Bâri", arabic: "البارئ", meaning: "Her şeyi kusursuz ve uyumlu yaratan.", merit: "BAŞARI ELDE ETMEK İÇİN", target: 213 },
  { id: 14, name: "El-Musavvir", arabic: "المصور", meaning: "Her şeye bir şekil ve özellik veren.", merit: "MAKSADA ULAŞMAK İÇİN", target: 336 },
  { id: 15, name: "El-Gaffâr", arabic: "الغفار", meaning: "Mağfireti çok olan, günahları örten.", merit: "BAĞIŞLANMAK İÇİN", target: 1281 },
  { id: 16, name: "El-Kahhâr", arabic: "القهار", meaning: "Her şeye galip gelen, mutlak hakim.", merit: "NEFSİ YENMEK İÇİN", target: 306 },
  { id: 17, name: "El-Vahhâb", arabic: "الوهاب", meaning: "Karşılıksız bolca veren, ihsan sahibi.", merit: "HİDAYET VE RIZIK İÇİN", target: 14 },
  { id: 18, name: "Er-Rezzâk", arabic: "الرزاق", meaning: "Rızık veren, ihtiyacı karşılayan.", merit: "BOLLUK VE BEREKET İÇİN", target: 308 },
  { id: 19, name: "El-Fettâh", arabic: "الفتاح", meaning: "Kapıları açan, darlıkları gideren.", merit: "MADDİ-MANEVİ KAZANÇ İÇİN", target: 489 },
  { id: 20, name: "El-Alîm", arabic: "العليم", meaning: "Her şeyi en ince ayrıntısıyla bilen.", merit: "İLİM VE İRFAN İÇİN", target: 150 },
  { id: 21, name: "El-Kâbıd", arabic: "القابض", meaning: "Dilediğine darlık veren, sıkan.", merit: "ZULÜMDEN KURTULMAK İÇİN", target: 903 },
  { id: 22, name: "El-Bâsıt", arabic: "الباسط", meaning: "Dilediğine rızkı açan ve genişleten.", merit: "RIZIK GENİŞLİĞİ İÇİN", target: 72 },
  { id: 23, name: "El-Hâfıd", arabic: "الخافض", meaning: "Kafirleri alçaltan, aşağı indiren.", merit: "KÖTÜLÜKTEN KORUNMAK İÇİN", target: 1481 },
  { id: 24, name: "Er-Râfi", arabic: "الرافع", meaning: "Müminleri yükselten, yücelten.", merit: "DERECENİN YÜKSELMESİ İÇİN", target: 351 },
  { id: 25, name: "El-Muiz", arabic: "المعز", meaning: "İzzet veren, aziz kılan.", merit: "İZZET VE ŞEREF İÇİN", target: 117 },
  { id: 26, name: "El-Müzil", arabic: "المذل", meaning: "Zelil kılan, alçaltan.", merit: "DÜŞMANI DEF ETMEK İÇİN", target: 770 },
  { id: 27, name: "Es-Semi", arabic: "السميع", meaning: "Her şeyi en iyi işiten.", merit: "DUANIN KABULÜ İÇİN", target: 180 },
  { id: 28, name: "El-Basîr", arabic: "البصير", meaning: "Her şeyi en iyi gören.", merit: "BASİRETİN AÇILMASI İÇİN", target: 302 },
  { id: 29, name: "El-Hakem", arabic: "الحكم", meaning: "Mutlak hakim, hakkı batıldan ayıran.", merit: "HAKLI DAVAYI KAZANMAK İÇİN", target: 68 },
  { id: 30, name: "El-Adl", arabic: "العدل", meaning: "Mutlak adil, her şeyi yerli yerinde yapan.", merit: "ADALETİN TECELLİSİ İÇİN", target: 104 },
  { id: 31, name: "El-Latîf", arabic: "اللطيف", meaning: "En ince işleri bilen, lütfeden.", merit: "DİLEKLERİN OLMASI İÇİN", target: 129 },
  { id: 32, name: "El-Habîr", arabic: "الخبير", meaning: "Her şeyin iç yüzünden haberdar olan.", merit: "HAFIZANIN GÜÇLENMESİ İÇİN", target: 812 },
  { id: 33, name: "El-Halîm", arabic: "الحليم", meaning: "Cezalandırmada acele etmeyen.", merit: "GÜZEL AHLAK VE HİLM İÇİN", target: 88 },
  { id: 34, name: "El-Azîm", arabic: "العظيم", meaning: "Pek yüce, büyüklüğü sınırsız.", merit: "SÖZÜNÜN GEÇMESİ İÇİN", target: 1020 },
  { id: 35, name: "El-Gafûr", arabic: "الغفور", meaning: "Mağfireti çok, affı bol.", merit: "GÜNAHLARIN AFFI İÇİN", target: 1286 },
  { id: 36, name: "Eş-Şekûr", arabic: "الشكور", meaning: "Az amele çok sevap veren.", merit: "TALİHİN AÇILMASI İÇİN", target: 526 },
  { id: 37, name: "El-Aliyy", arabic: "العلي", meaning: "Yücelerin yücesi, en yüksek.", merit: "ZİLLETTEN KURTULMAK İÇİN", target: 110 },
  { id: 38, name: "El-Kebîr", arabic: "الكبير", meaning: "Büyüklükte kendisinden büyüğü olmayan.", merit: "HÜRMET GÖRMEK İÇİN", target: 232 },
  { id: 39, name: "El-Hafîz", arabic: "الحفيظ", meaning: "Her şeyi koruyan ve kollayan.", merit: "NEFSİN KORUNMASI İÇİN", target: 998 },
  { id: 40, name: "El-Mukît", arabic: "المقيت", meaning: "Her canlının gıdasını veren.", merit: "MUHTAÇ OLMAMAK İÇİN", target: 550 },
  { id: 41, name: "El-Hasîb", arabic: "الحسيب", meaning: "Herkesin hesabını en iyi gören.", merit: "KORKULARDAN EMİN OLMAK İÇİN", target: 80 },
  { id: 42, name: "El-Celîl", arabic: "الجليل", meaning: "Celal ve azamet sahibi.", merit: "ZALİMİ ZELİL ETMEK İÇİN", target: 73 },
  { id: 43, name: "El-Kerîm", arabic: "الكريم", meaning: "Lütfu ve keremi bol olan.", merit: "BOL RIZIK VE KOLAYLIK İÇİN", target: 270 },
  { id: 44, name: "Er-Rakîb", arabic: "الرقيب", meaning: "Her an gözeten, kontrol eden.", merit: "KORUNMAK VE EMNİYET İÇİN", target: 312 },
  { id: 45, name: "El-Mücîb", arabic: "المجيب", meaning: "Duaları kabul eden.", merit: "DUALARIN KABULÜ İÇİN", target: 55 },
  { id: 46, name: "El-Vâsi", arabic: "الواسع", meaning: "İlmi ve merhameti her şeyi kuşatan.", merit: "ÖMÜR VE RIZIK GENİŞLİĞİ İÇİN", target: 137 },
  { id: 47, name: "El-Hakîm", arabic: "الحكيم", meaning: "Her işi hikmetli olan.", merit: "BİLGELİK VE AKIL İÇİN", target: 78 },
  { id: 48, name: "El-Vedûd", arabic: "الودود", meaning: "Seven ve sevilmeye layık olan.", merit: "SEVGİ VE MUHABBET İÇİN", target: 20 },
  { id: 49, name: "El-Mecîd", arabic: "المجيد", meaning: "Şanı yüce, keremi bol.", merit: "İZZET VE ŞEREF İÇİN", target: 57 },
  { id: 50, name: "El-Bâis", arabic: "الباعث", meaning: "Ölüleri dirilten, peygamber gönderen.", merit: "KUVVETLİ İMAN İÇİN", target: 573 },
  { id: 51, name: "Eş-Şehîd", arabic: "الشهيد", meaning: "Her şeye şahit olan, her şeyi gören.", merit: "İTAATSİZLİĞİN GİDERİLMESİ İÇİN", target: 319 },
  { id: 52, name: "El-Hakk", arabic: "الحق", meaning: "Varlığı hiç değişmeyen, hakikat.", merit: "İMANIN SABİT KALMASI İÇİN", target: 108 },
  { id: 53, name: "El-Vekîl", arabic: "الوكيل", meaning: "Kendisine tevekkül edilenlerin vekili.", merit: "ALLAH'A TEVEKKÜL İÇİN", target: 66 },
  { id: 54, name: "El-Kaviyy", arabic: "القوي", meaning: "Pek kuvvetli, her şeye gücü yeten.", merit: "GÜÇ VE KUVVET İÇİN", target: 117 },
  { id: 55, name: "El-Metîn", arabic: "المتين", meaning: "Çok sağlam, sarsılmaz.", merit: "MADDİ VE MANEVİ SAĞLAMLIK İÇİN", target: 500 },
  { id: 56, name: "El-Veliyy", arabic: "الولي", meaning: "Müminlerin dostu ve yardımcısı.", merit: "HAYIRLI KAZANÇ İÇİN", target: 46 },
  { id: 57, name: "El-Hamîd", arabic: "الحميد", meaning: "Övgüye layık, hamdedilen.", merit: "KAZANCIN BEREKETLENMESİ İÇİN", target: 62 },
  { id: 58, name: "El-Muhsî", arabic: "المحصي", meaning: "Her şeyin sayısını bilen.", merit: "HAFIZANIN KUVVETLENMESİ İÇİN", target: 148 },
  { id: 59, name: "El-Mübdi", arabic: "المبدئ", meaning: "Varlıkları örneksiz yaratan.", merit: "İŞLERİN BAŞARILI OLMASI İÇİN", target: 56 },
  { id: 60, name: "El-Muîd", arabic: "المعيد", meaning: "Varlıkları yok ettikten sonra dirilten.", merit: "ELDEN ÇIKANIN DÖNMESİ İÇİN", target: 124 },
  { id: 61, name: "El-Muhyî", arabic: "المحيي", meaning: "Hayat veren, canlandıran.", merit: "İŞLERİN CANLANMASI İÇİN", target: 68 },
  { id: 62, name: "El-Mümît", arabic: "المميت", meaning: "Canlıları öldüren.", merit: "NEFSİ TERBİYE ETMEK İÇİN", target: 490 },
  { id: 63, name: "El-Hayy", arabic: "الحي", meaning: "Ezeli ve ebedi hayat sahibi.", merit: "UZUN VE SIHHATLİ ÖMÜR İÇİN", target: 18 },
  { id: 64, name: "El-Kayyûm", arabic: "القيوم", meaning: "Varlıkları ayakta tutan.", merit: "RÜTBENİN YÜKSELMESİ İÇİN", target: 156 },
  { id: 65, name: "El-Vâcid", arabic: "الواجد", meaning: "İstediğini istediği an bulan.", merit: "KAYBOLANIN BULUNMASI İÇİN", target: 14 },
  { id: 66, name: "El-Mâcid", arabic: "الماجد", meaning: "Şanı yüce, keremi bol.", merit: "KAZANCIN BOL OLMASI İÇİN", target: 48 },
  { id: 67, name: "El-Vâhid", arabic: "الواحد", meaning: "Tek ve eşsiz olan.", merit: "İSTEDİĞİNE KAVUŞMAK İÇİN", target: 19 },
  { id: 68, name: "Es-Samed", arabic: "الصمد", meaning: "Her şey O'na muhtaç, O hiç kimseye değil.", merit: "KİMSESİZLİKTEN KURTULMAK İÇİN", target: 134 },
  { id: 69, name: "El-Kâdir", arabic: "القادر", meaning: "İstediğini yapmaya gücü yeten.", merit: "ARZULARIN OLMASI İÇİN", target: 305 },
  { id: 70, name: "El-Muktedir", arabic: "المقتدر", meaning: "Kuvvet ve kudret sahipleri üzerinde hakim.", merit: "AKLIN AYDINLANMASI İÇİN", target: 744 },
  { id: 71, name: "El-Mukaddim", arabic: "المقدم", meaning: "Dilediğini öne alan.", merit: "DAİMA YÜKSELMEK İÇİN", target: 184 },
  { id: 72, name: "El-Muahhir", arabic: "المؤخر", meaning: "Dilediğini arkaya bırakan.", merit: "KÖTÜLÜĞÜN UZAKLAŞMASI İÇİN", target: 846 },
  { id: 73, name: "El-Evvel", arabic: "الأول", meaning: "Varlığının başlangıcı olmayan.", merit: "HAYIRLI İŞLERİN BAŞLAMASI İÇİN", target: 37 },
  { id: 74, name: "El-Âhir", arabic: "الآخر", meaning: "Varlığının sonu olmayan.", merit: "ÖMRÜN HAYIRLA BİTMESİ İÇİN", target: 801 },
  { id: 75, name: "Ez-Zâhir", arabic: "الظاهر", meaning: "Varlığı aşikar olan.", merit: "SIRLARIN AYDINLANMASI İÇİN", target: 1106 },
  { id: 76, name: "El-Bâtın", arabic: "الباطن", meaning: "Varlığı gizli olan, mahiyeti bilinmeyen.", merit: "NEFSİN ISLAHI İÇİN", target: 62 },
  { id: 77, name: "El-Vâlî", arabic: "الوالي", meaning: "Kainatı yöneten tek hakim.", merit: "SÖZÜNÜN DİNLENMESİ İÇİN", target: 47 },
  { id: 78, name: "El-Müteâlî", arabic: "المتعالي", meaning: "Noksanlıklardan yüce olan.", merit: "MERTEBENİN YÜKSELMESİ İÇİN", target: 551 },
  { id: 79, name: "El-Berr", arabic: "البر", meaning: "Kullarına iyilik ve ihsanı bol olan.", merit: "HER TÜRLÜ İYİLİK İÇİN", target: 202 },
  { id: 80, name: "Et-Tevvâb", arabic: "التواب", meaning: "Tövbeleri kabul eden.", merit: "TÖVBENİN KABULÜ İÇİN", target: 409 },
  { id: 81, name: "El-Müntakım", arabic: "المنتقم", meaning: "Suçluları adaletiyle cezalandıran.", merit: "ZULMÜN DURMASI İÇİN", target: 630 },
  { id: 82, name: "El-Afüvv", arabic: "العفو", meaning: "Affı çok olan.", merit: "RIZIK VE AFİYET İÇİN", target: 156 },
  { id: 83, name: "Er-Raûf", arabic: "الرؤوف", meaning: "Çok merhametli, pek şefkatli.", merit: "HİÇBİR ŞEYDEN KORKMAMAK İÇİN", target: 286 },
  { id: 84, name: "Mâlik-ül Mülk", arabic: "مالك الملك", meaning: "Mülkün gerçek sahibi.", merit: "DÜNYALIK VE AHİRETLİK İÇİN", target: 212 },
  { id: 85, name: "Zül-Celâli vel İkrâm", arabic: "ذو الجلال والإكرام", meaning: "Azamet ve kerem sahibi.", merit: "HER TÜRLÜ MURADA ERMEK İÇİN", target: 1100 },
  { id: 86, name: "El-Muksit", arabic: "المقسط", meaning: "Adaletle hükmeden.", merit: "BORÇLARDAN KURTULMAK İÇİN", target: 209 },
  { id: 87, name: "El-Câmi", arabic: "الجامع", meaning: "Varlıkları bir araya toplayan.", merit: "KAYBOLANI BULMAK İÇİN", target: 114 },
  { id: 88, name: "El-Ganiyy", arabic: "الغني", meaning: "Çok zengin, kimseye muhtaç olmayan.", merit: "GENİŞ RIZIK VE ZENGİNLİK İÇİN", target: 1060 },
  { id: 89, name: "El-Mugnî", arabic: "المغني", meaning: "Dilediğini zengin kılan.", merit: "KİMSESİZLİĞİ GİDERMEK İÇİN", target: 1100 },
  { id: 90, name: "El-Mâni", arabic: "المانع", meaning: "Bazı şeylerin olmasına engel olan.", merit: "KAZA VE BELALARDAN KORUNMAK İÇİN", target: 161 },
  { id: 91, name: "Ed-Dârr", arabic: "الضار", meaning: "Dilediğine zarar veren.", merit: "MUSİBETLERDEN KURTULMAK İÇİN", target: 1001 },
  { id: 92, name: "En-Nâfi", arabic: "النافع", meaning: "Dilediğine fayda veren.", merit: "HAYIRLI KAZANÇ İÇİN", target: 201 },
  { id: 93, name: "En-Nûr", arabic: "النور", meaning: "Alemleri nurlandıran.", merit: "DOĞRU YOLU BULMAK İÇİN", target: 256 },
  { id: 94, name: "El-Hâdî", arabic: "الهادي", meaning: "Hidayet veren.", merit: "HİDAYETE ERMEK İÇİN", target: 20 },
  { id: 95, name: "El-Bedî", arabic: "البديع", meaning: "Emsalsiz yaratan.", merit: "İLİM VE SANATTA BAŞARI İÇİN", target: 86 },
  { id: 96, name: "El-Bâkî", arabic: "الباقي", meaning: "Varlığının sonu olmayan.", merit: "HAYIRLI VE UZUN ÖMÜR İÇİN", target: 113 },
  { id: 97, name: "El-Vâris", arabic: "الوارث", meaning: "Her şeyin gerçek sahibi.", merit: "EVLAT SAHİBİ OLMAK İÇİN", target: 707 },
  { id: 98, name: "Er-Reşîd", arabic: "الرشيد", meaning: "Doğru yolu en iyi gösteren.", merit: "GÜZEL AHLAK SAHİBİ OLMAK İÇİN", target: 514 },
  { id: 99, name: "Es-Sabûr", arabic: "الصبور", meaning: "Çok sabırlı olan.", merit: "BAŞLADIĞI İŞİ BİTİRMEK İÇİN", target: 298 }
];

const EsmaulHusna: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDhikrId, setActiveDhikrId] = useState<number | null>(null);
  const [counter, setCounter] = useState(0);

  const filtered = useMemo(() => {
    return ESMA_LIST.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.merit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const startDhikr = (id: number) => {
    setActiveDhikrId(id);
    setCounter(0);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleIncrement = () => {
    setCounter(prev => prev + 1);
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  const activeEsma = ESMA_LIST.find(e => e.id === activeDhikrId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-300 overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-50/50">
        <button onClick={onBack} className="w-11 h-11 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h2 className="text-[20px] font-black text-slate-900 dark:text-white tracking-tight leading-none">Esmaül Hüsna</h2>
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mt-1">ALLAH'IN 99 İSMİ</p>
        </div>
      </div>

      {/* Search Bar - Exactly matching screenshot style */}
      <div className="px-6 py-6 bg-white/50">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl group-focus-within:scale-110 transition-transform">🔍</div>
          <input 
            type="text" 
            placeholder="İsim veya anlam ara..."
            className="w-full bg-[#f1f5f9] border-none rounded-[1.6rem] pl-14 pr-6 py-5 outline-none font-bold text-[14px] text-slate-700 dark:text-slate-300 dark:text-slate-600 placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-600 transition-all focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-purple-50 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-6 pb-36 space-y-5 no-scrollbar">
        {filtered.map((esma) => (
          <div 
            key={esma.id} 
            className="bg-[#f1f5f9]/50 rounded-[2.8rem] p-8 border border-slate-50 dark:border-slate-800 shadow-sm hover:border-purple-100 hover:bg-white dark:bg-slate-900 transition-all group relative overflow-hidden active:scale-[0.99]"
            onClick={() => startDhikr(esma.id)}
          >
            {/* Pill Number - Top Left as in screenshot */}
            <div className="absolute top-7 left-7">
               <div className="px-4 py-1.5 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-full font-black text-[11px] shadow-sm border border-purple-100/50">
                 {esma.id}
               </div>
            </div>

            {/* Arabic - Top Right as in screenshot - Slightly smaller to avoid overlap */}
            <div className="absolute top-6 right-8 opacity-90 group-hover:scale-110 transition-transform duration-700">
               <p className="arabic-text text-[2.2rem] text-slate-800 dark:text-slate-100 drop-shadow-sm">{esma.arabic}</p>
            </div>

            {/* Content - Middle */}
            <div className="mt-12 space-y-2">
              <h4 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">{esma.name}</h4>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-[85%]">{esma.meaning}</p>
            </div>

            {/* Merit Badge - Bottom as in screenshot */}
            <div className="mt-8">
               <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-950/80 border border-purple-50 px-6 py-3 rounded-[1.4rem] shadow-sm group-hover:bg-purple-50/50 group-hover:border-purple-200 transition-colors">
                  <span className="text-sm">✨</span>
                  <p className="text-[10px] font-black text-purple-700 uppercase tracking-[0.15em]">{esma.merit}</p>
               </div>
            </div>
            
            {/* Visual Indicator for Tappability */}
            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
           <div className="py-20 text-center space-y-4 opacity-30">
              <div className="text-6xl">🔎</div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sonuç Bulunamadı</p>
           </div>
        )}
        
        <p className="text-center text-[9px] font-black text-slate-200 uppercase tracking-[0.5em] py-10">Mübarekçe Digital Library</p>
      </div>

      {/* Dhikr Mode Modal - Unique feature for "developing" the page */}
      {activeDhikrId && activeEsma && (
        <div className="fixed inset-0 z-[400] bg-[#fdfdfd] flex flex-col items-center animate-in slide-in-from-bottom duration-500">
           <div className="w-full px-6 pt-12 pb-6 flex items-center justify-between">
              <button 
                onClick={() => setActiveDhikrId(null)}
                className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="text-center">
                 <p className="text-[9px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1">ESMA ZİKRİ</p>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{activeEsma.name}</h3>
              </div>
              <button 
                onClick={() => setCounter(0)}
                className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform"
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
           </div>

           <div className="flex-1 w-full flex flex-col items-center justify-center px-10 space-y-12">
              <div className="text-center space-y-6">
                 {/* Arabic Text in Dhikr Mode - Reduced size to prevent merging with title */}
                 <p className="arabic-text text-[4.5rem] text-slate-900 dark:text-white leading-none drop-shadow-xl animate-pulse">{activeEsma.arabic}</p>
                 <p className="text-sm font-bold text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto italic leading-relaxed">
                   "{activeEsma.meaning}"
                 </p>
              </div>

              <div 
                onClick={handleIncrement}
                className="relative w-72 h-72 rounded-full bg-slate-50 dark:bg-slate-900 border-[12px] border-white shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all group overflow-hidden"
              >
                 {/* Wave effect background */}
                 <div 
                   className="absolute bottom-0 left-0 right-0 bg-purple-600/10 transition-all duration-700 ease-out"
                   style={{ height: `${Math.min(100, (counter / (activeEsma.target || 33)) * 100)}%` }}
                 ></div>

                 <div className="relative z-10 text-center">
                    <span className="text-[7.5rem] font-black text-slate-900 dark:text-white leading-none tracking-tighter tabular-nums drop-shadow-sm">
                       {counter}
                    </span>
                    <div className="mt-2 flex flex-col items-center gap-1">
                       <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">TEKRAR</p>
                       <div className="px-3 py-1 bg-purple-50 dark:bg-purple-950/20 rounded-full border border-purple-100">
                          <span className="text-[9px] font-bold text-purple-400">HEDEF: {activeEsma.target}</span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Visual pulse ring */}
                 <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full animate-ping pointer-events-none"></div>
              </div>

              <div className="text-center pb-12">
                 <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em] animate-bounce">EKRANA DOKUNUN</p>
                 <div className="mt-8 flex gap-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (counter % 5) + 1 ? 'bg-purple-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="w-full p-8 bg-purple-50 dark:bg-purple-950/20 border-t border-purple-100/50 text-center rounded-t-[3rem] shadow-[0_-10px_30px_rgba(168,85,247,0.05)]">
              <p className="text-[11px] font-black text-purple-800 uppercase tracking-widest mb-1">FAZİLETİ</p>
              <p className="text-[13px] font-bold text-purple-900 leading-relaxed italic">{activeEsma.merit}</p>
           </div>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10">
        <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.65em]">99 BEREKET KAPISI V2.5</p>
      </div>
    </div>
  );
};

export default EsmaulHusna;
