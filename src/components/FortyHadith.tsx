
import React, { useState, useMemo } from 'react';

interface HadithItem {
  id: number;
  arabic: string;
  turkish: string;
  source: string;
}

const HADITH_LIST: HadithItem[] = [
  { id: 1, arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", turkish: "Ameller ancak niyetlere göredir.", source: "Buhârî, Bed'ü'l-vahy, 1" },
  { id: 2, arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", turkish: "Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe (gerçek manada) iman etmiş olmaz.", source: "Buhârî, Îmân, 7" },
  { id: 3, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", turkish: "Müslüman, dilinden ve elinden Müslümanların emin olduğu kimsedir.", source: "Buhârî, Îmân, 4" },
  { id: 4, arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", turkish: "Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir.", source: "Buhârî, Fedâilü'l-Kur'ân, 21" },
  { id: 5, arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", turkish: "Nerede olursan ol, Allah'tan kork (takva üzere ol).", source: "Tirmizî, Birr, 55" },
  { id: 6, arabic: "الدِّينُ النَّصِيحَةُ", turkish: "Din samimiyettir (nasihattir).", source: "Müslim, Îmân, 95" },
  { id: 7, arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", turkish: "Merhamet etmeyene merhamet olunmaz.", source: "Müslim, Fedâil, 66" },
  { id: 8, arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", turkish: "Güzel söz sadakadır.", source: "Buhârî, Cihâd, 128" },
  { id: 9, arabic: "الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ", turkish: "Haya, imandan bir şubedir.", source: "Müslim, Îmân, 57" },
  { id: 10, arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوEMَهَا وَإِنْ قَلَّ", turkish: "Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.", source: "Müslim, Müsâfirîn, 218" },
  { id: 11, arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", turkish: "Müslüman kardeşine tebessüm etmen bir sadakadır.", source: "Tirmizî, Birr, 36" },
  { id: 12, arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", turkish: "Her iyilik bir sadakadır.", source: "Buhârî, Edeb, 33" },
  { id: 13, arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا", turkish: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.", source: "Buhârî, İlim, 11" },
  { id: 14, arabic: "مَنْ قَضَى لِأَخِيهِ حَاجَةً كَانَ اللَّهُ فِي حَاجَتِهِ", turkish: "Kim bir kardeşinin ihtiyacını giderirse, Allah da onun ihtiyacını giderir.", source: "Müslim, Birr, 58" },
  { id: 15, arabic: "إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا", turkish: "Şüphesiz Allah tayyibdir (temizdir/güzeldir), ancak temiz olanı kabul eder.", source: "Müslim, Zekât, 65" },
  { id: 16, arabic: "لاَ يَدْخُلُ الْجَنَّةَ نَمَّامٌ", turkish: "Söz taşıyan (koğuculuk yapan) cennete giremez.", source: "Müslim, Îmân, 168" },
  { id: 17, arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", turkish: "Allah'a ve ahiret gününe inanan ya hayır söylesin ya da sussun.", source: "Buhârî, Edeb, 31" },
  { id: 18, arabic: "الْبِرُّ حُسْنُ الْخُلُقِ", turkish: "İyilik güzel ahlaktır.", source: "Müslim, Birr, 14" },
  { id: 19, arabic: "الصَّلَاةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ", turkish: "Namaz nurdur, sadaka ise burhandır (delildir).", source: "Müslim, Tahâret, 1" },
  { id: 20, arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ", turkish: "Temizlik imanın yarısıdır.", source: "Müslim, Tahâret, 1" },
  { id: 21, arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", turkish: "Zulüm, kıyamet gününde (zâlim için) karanlıklardır.", source: "Müslim, Birr, 56" },
  { id: 22, arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", turkish: "Bizi aldatan bizden değildir.", source: "Müslim, Îmân, 164" },
  { id: 23, arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ", turkish: "Allah rıfk (nezaket/yumuşaklık) sahibidir ve rıfkı sever.", source: "Müslim, Birr, 77" },
  { id: 24, arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ", turkish: "Hayra vesile olan, onu yapan gibidir.", source: "Müslim, İmâre, 133" },
  { id: 25, arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", turkish: "Dua ibadetin özüdür (kendisidir).", source: "Tirmizî, Tefsîr, 2" },
  { id: 26, arabic: "مَنْ صَمَتَ نَجَا", turkish: "Susan kurtuldu.", source: "Tirmizî, Kıyâmet, 50" },
  { id: 27, arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ", turkish: "Yarım hurma ile de olsa kendinizi ateşten koruyun.", source: "Buhârî, Zekât, 9" },
  { id: 28, arabic: "لَا تَغْضَبْ", turkish: "Öfkelenme.", source: "Buhârî, Edeb, 76" },
  { id: 29, arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", turkish: "Pehlivan başkasını yıkan değil, öfke anında kendine hâkim olandır.", source: "Buhârî, Edeb, 76" },
  { id: 30, arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", turkish: "Zulüm, kıyamet gününde kapkaranlık zindanlar olacaktır.", source: "Buhârî, Mezâlim, 8" },
  { id: 31, arabic: "مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ", turkish: "İnsanlara teşekkür etmeyen, Allah'a da şükretmez.", source: "Tirmizî, Birr, 35" },
  { id: 32, arabic: "مَا مَلأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ", turkish: "İnsanoğlu karnından daha kötü bir kap doldurmamıştır.", source: "Tirmizî, Zühd, 47" },
  { id: 33, arabic: "أَفْشُوا السَّلَامَ بَيْنَكُمْ", turkish: "Aranızda selamı yayın.", source: "Müslim, Îmân, 93" },
  { id: 34, arabic: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", turkish: "Allah güzeldir, güzelliği sever.", source: "Müslim, Îmân, 147" },
  { id: 35, arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", turkish: "Kim ilim tahsili için bir yola girerse, Allah ona cennet yolunu kolaylaştırır.", source: "Müslim, Zikir, 38" },
  { id: 36, arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", turkish: "Mümin mümin için bir binanın birbirine kenetlenmiş tuğlaları gibidir.", source: "Buhârî, Salât, 88" },
  { id: 37, arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", turkish: "Allah sizin suretlerinize ve mallarınıza bakmaz, kalplerinize ve amellerinize bakar.", source: "Müslim, Birr, 33" },
  { id: 38, arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ", turkish: "Doğruluk iyiliğe, iyilik de cennete götürür.", source: "Buhârî, Edeb, 69" },
  { id: 39, arabic: "تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ", turkish: "Size iki şey bırakıyorum, onlara sarıldığınız sürece sapmazsınız: Allah'ın kitabı ve Resulü'nün sünneti.", source: "Muvatta, Kader, 3" },
  { id: 40, arabic: "يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللَّهِ", turkish: "Ey insanlar, Allah'a tövbe edin.", source: "Müslim, Zikir, 42" }
];

const FortyHadith: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHadith, setSelectedHadith] = useState<HadithItem | null>(null);

  const filteredHadiths = useMemo(() => 
    HADITH_LIST.filter(h => 
      h.turkish.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.id.toString().includes(searchTerm) ||
      h.source.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Hadis kopyalandı!");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white via-[#fbf6ea] to-[#f5ead0] dark:from-[#3e5878] dark:via-[#243a58] dark:to-[#141a2c] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      {/* Background Decor - Pastel Light Blue */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-gold-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Premium Compact Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between bg-[#fbf6ea]/80 dark:bg-[#141a2c]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedHadith ? () => setSelectedHadith(null) : onBack} 
            className="w-10 h-10 bg-slate-50 dark:bg-navy-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-navy-900 active:scale-90 transition-transform text-slate-900 dark:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0">
            <h2 className="text-[16px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">
              {selectedHadith ? `HADİS #${selectedHadith.id}` : "40 HADİS"}
            </h2>
            <p className="text-[8px] font-black text-gold-500 uppercase tracking-[0.25em] mt-1">ÖZEL SEÇKİ KOLEKSİYON</p>
          </div>
        </div>
        <div className="text-xl opacity-30">💎</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar pt-3">
        {!selectedHadith ? (
          <div className="space-y-5 animate-in fade-in duration-500">
            {/* Daily Card - Compact & Light Blue */}
            <div className="bg-[#fbf6ea] rounded-[2.2rem] p-6 text-navy-950 border border-gold-100 relative overflow-hidden group shadow-lg shadow-navy-900/5">
               <div className="absolute right-[-5%] top-[-10%] opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 text-[8rem] pointer-events-none rotate-12 text-navy-900">📖</div>
               <div className="relative z-10 space-y-3 text-center">
                  <p className="text-gold-600 text-[8px] font-black uppercase tracking-[0.4em]">HAFTANIN HADİSİ</p>
                  <p className="arabic-text text-xl leading-relaxed text-navy-900" dir="rtl">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
                  <p className="text-[13px] font-bold leading-relaxed text-navy-800/80 italic px-2">
                    "Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir."
                  </p>
                  <button 
                    onClick={() => setSelectedHadith(HADITH_LIST[3])}
                    className="bg-gold-600 text-white px-5 py-2 rounded-full font-black text-[8px] uppercase tracking-widest active:scale-95 shadow-md shadow-gold-100 transition-all border border-gold-500"
                  >
                    OKU →
                  </button>
               </div>
            </div>

            {/* Search - More portable */}
            <div className="relative group">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ara (niyet, selam)..."
                className="w-full bg-slate-50 dark:bg-navy-800 border-2 border-transparent focus:border-gold-100 focus:bg-white dark:bg-navy-800 rounded-2xl pl-11 pr-4 py-3 outline-none font-bold text-sm text-slate-800 dark:text-slate-100 shadow-sm transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-600"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>

            {/* List - Compacted as per screenshot */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 ml-1 mb-2">
                 <div className="w-1.5 h-1.5 bg-gold-500 rounded-full"></div>
                 <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">HADİS-İ ŞERİFLER</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {filteredHadiths.map(hadith => (
                  <div 
                    key={hadith.id}
                    onClick={() => setSelectedHadith(hadith)}
                    className="p-3.5 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-900 flex items-center justify-between hover:bg-slate-50 dark:bg-navy-800 transition-all cursor-pointer group active:scale-[0.98] shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                       {/* Fixed Size Consistent Number Circle */}
                       <div className="w-9 h-9 rounded-full bg-[#f1f5f9] text-gold-600 flex-shrink-0 flex items-center justify-center text-[13px] font-black shadow-inner border border-slate-100 dark:border-navy-900 group-hover:bg-gold-50 dark:bg-navy-950/20">
                          {hadith.id}
                       </div>
                       <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug truncate">{hadith.turkish}</h4>
                          <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-0.5">{hadith.source}</p>
                       </div>
                    </div>
                    <div className="text-slate-200 group-hover:text-slate-400 dark:text-slate-500 transition-colors">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700 space-y-6">
             {/* Hadith Detail Card */}
             <div className="bg-white dark:bg-navy-800 rounded-[2.2rem] p-8 border border-slate-100 dark:border-navy-900 shadow-xl shadow-slate-900/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 text-[7rem] pointer-events-none">📿</div>
                <div className="relative z-10 space-y-6">
                   <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-md">BİSMİLLAH</div>
                   
                   <p className="arabic-text text-[2rem] leading-[1.8] text-slate-900 dark:text-white px-2" dir="rtl">{selectedHadith.arabic}</p>
                   
                   <div className="h-px w-10 bg-slate-100 dark:bg-navy-900 mx-auto"></div>
                   
                   <div className="space-y-3">
                      <p className="text-[15px] font-medium text-slate-700 dark:text-slate-300 dark:text-slate-600 leading-relaxed italic px-2">
                        "{selectedHadith.turkish}"
                      </p>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{selectedHadith.source}</p>
                   </div>

                   <div className="flex gap-2 justify-center pt-2">
                      <button 
                        onClick={() => copyToClipboard(`${selectedHadith.turkish}\n\n${selectedHadith.source}`)}
                        className="w-11 h-11 bg-slate-50 dark:bg-navy-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-navy-900 active:scale-90 transition-all hover:bg-white dark:bg-navy-800"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                      </button>
                      <button 
                        className="w-11 h-11 bg-slate-50 dark:bg-navy-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-navy-900 active:scale-90 transition-all hover:bg-white dark:bg-navy-800"
                        onClick={() => alert("Paylaşım yakında.")}
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      </button>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-white dark:bg-navy-800 border border-dashed border-slate-200 dark:border-navy-700 rounded-[2rem] text-center opacity-40">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">"Hadis, müminin yolunu aydınlatan nurdur."</p>
             </div>
          </div>
        )}
      </div>

      {/* Compact Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent pb-[calc(1.2rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ SÜNNET REHBERİ</p>
      </div>
    </div>
  );
};

export default FortyHadith;
