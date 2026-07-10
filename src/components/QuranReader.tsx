
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';
import { useUserData } from '../contexts/UserDataContext';

// Ünlü Hocalar / Kâriler - API Uyumlu ID'ler
const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', sub: 'Kuveytli Kâri' },
  { id: 'ar.abdulbasitmurattal', name: 'AbdulBaset AbdulSamad', sub: 'Mısırlı Kâri' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman as-Sudais', sub: 'Kabe İmamı' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', sub: 'Medine İmamı' },
  { id: 'ar.husary', name: 'Khalil Al-Husary', sub: 'Klasik Tilavet' },
  { id: 'ar.minshawi', name: 'Mohamed El-Minshawi', sub: 'Duygusal Tilavet' },
];

// 114 Surenin Türkçe İsimleri ve Anlamları
const TURKISH_SURAH_DATA: { [key: number]: { name: string; meaning: string } } = {
  1: { name: "Fâtiha", meaning: "Açılış" },
  2: { name: "Bakara", meaning: "İnek" },
  3: { name: "Âl-i İmrân", meaning: "İmran Ailesi" },
  4: { name: "Nisâ", meaning: "Kadınlar" },
  5: { name: "Mâide", meaning: "Sofra" },
  6: { name: "En'âm", meaning: "Hayvanlar" },
  7: { name: "A'râf", meaning: "Yüksek Yerler" },
  8: { name: "Enfâl", meaning: "Ganimetler" },
  9: { name: "Tevbe", meaning: "Tövbe" },
  10: { name: "Yûnus", meaning: "Yunus Peygamber" },
  11: { name: "Hûd", meaning: "Hud Peygamber" },
  12: { name: "Yûsuf", meaning: "Yusuf Peygamber" },
  13: { name: "Ra'd", meaning: "Gök Gürültüsü" },
  14: { name: "İbrâhîm", meaning: "İbrahim Peygamber" },
  15: { name: "Hicr", meaning: "Hicr Bölgesi" },
  16: { name: "Nahl", meaning: "Bal Arısı" },
  17: { name: "İsrâ", meaning: "Gece Yürüyüşü" },
  18: { name: "Kehf", meaning: "Mağara" },
  19: { name: "Meryem", meaning: "Meryem Ana" },
  20: { name: "Tâhâ", meaning: "Taha" },
  21: { name: "Enbiyâ", meaning: "Peygamberler" },
  22: { name: "Hac", meaning: "Hac İbadeti" },
  23: { name: "Mü'minûn", meaning: "Müminler" },
  24: { name: "Nûr", meaning: "Nur (Işık)" },
  25: { name: "Furkân", meaning: "Ayırt Eden" },
  26: { name: "Şuarâ", meaning: "Şairler" },
  27: { name: "Neml", meaning: "Karınca" },
  28: { name: "Kasas", meaning: "Kıssalar" },
  29: { name: "Ankebût", meaning: "Örümcek" },
  30: { name: "Rûm", meaning: "Romalılar" },
  31: { name: "Lokmân", meaning: "Lokman Hekim" },
  32: { name: "Secde", meaning: "Secde Etmek" },
  33: { name: "Ahzâb", meaning: "Gruplar" },
  34: { name: "Sebe'", meaning: "Sebe Halkı" },
  35: { name: "Fâtır", meaning: "Yaratan" },
  36: { name: "Yâsîn", meaning: "Yasin" },
  37: { name: "Saffât", meaning: "Sıra Sıra Dizilenler" },
  38: { name: "Sâd", meaning: "Sad Harfi" },
  39: { name: "Zümer", meaning: "Zümreler" },
  40: { name: "Mü'min", meaning: "İnanan" },
  41: { name: "Fussilet", meaning: "Açıklanmış" },
  42: { name: "Şûrâ", meaning: "Danışma" },
  43: { name: "Zuhruf", meaning: "Mücevher" },
  44: { name: "Duhân", meaning: "Duman" },
  45: { name: "Câsiye", meaning: "Diz Çöken" },
  46: { name: "Ahkâf", meaning: "Kum Tepeleri" },
  47: { name: "Muhammed", meaning: "Muhammed Peygamber" },
  48: { name: "Fetih", meaning: "Zafer" },
  49: { name: "Hucurât", meaning: "Odalar" },
  50: { name: "Kâf", meaning: "Kaf Harfi" },
  51: { name: "Zâriyât", meaning: "Ezip Savuranlar" },
  52: { name: "Tûr", meaning: "Tur Dağı" },
  53: { name: "Necm", meaning: "Yıldız" },
  54: { name: "Kâmer", meaning: "Ay" },
  55: { name: "Rahmân", meaning: "Rahman" },
  56: { name: "Vâkıa", meaning: "Olay" },
  57: { name: "Hadîd", meaning: "Demir" },
  58: { name: "Mücâdele", meaning: "Tartışma" },
  59: { name: "Haşr", meaning: "Toplanma" },
  60: { name: "Mümtehine", meaning: "İmtihan Edilen" },
  61: { name: "Saff", meaning: "Saf Tutmak" },
  62: { name: "Cuma", meaning: "Cuma Günü" },
  63: { name: "Münâfikûn", meaning: "Münafıklar" },
  64: { name: "Tegâbun", meaning: "Aldanma" },
  65: { name: "Talâk", meaning: "Boşanma" },
  66: { name: "Tahrîm", meaning: "Haram Kılmak" },
  67: { name: "Mülk", meaning: "Mülk (Hükümranlık)" },
  68: { name: "Kalem", meaning: "Kalem" },
  69: { name: "Hâkka", meaning: "Gerçekleşen" },
  70: { name: "Meâric", meaning: "Yükseliş Yolları" },
  71: { name: "Nûh", meaning: "Nuh Peygamber" },
  72: { name: "Cin", meaning: "Cinler" },
  73: { name: "Müzzemmil", meaning: "Örtünüp Sarınan" },
  74: { name: "Müddessir", meaning: "Gizlenen" },
  75: { name: "Kıyâme", meaning: "Kıyamet" },
  76: { name: "İnsân", meaning: "İnsan" },
  77: { name: "Mürselât", meaning: "Gönderilenler" },
  78: { name: "Nebe'", meaning: "Haber" },
  79: { name: "Nâziât", meaning: "Söküp Çıkaranlar" },
  80: { name: "Abese", meaning: "Yüzünü Ekşitti" },
  81: { name: "Tekvîr", meaning: "Dürülme" },
  82: { name: "İnfitâr", meaning: "Yarılma" },
  83: { name: "Mutaffifîn", meaning: "Hile Yapanlar" },
  84: { name: "İnşikâk", meaning: "Yarılma" },
  85: { name: "Burûc", meaning: "Burçlar" },
  86: { name: "Târık", meaning: "Sabah Yıldızı" },
  87: { name: "A'lâ", meaning: "En Yüce" },
  88: { name: "Gâşiye", meaning: "Bürüyen" },
  89: { name: "Fecr", meaning: "Tan Vakti" },
  90: { name: "Beled", meaning: "Şehir" },
  91: { name: "Şems", meaning: "Güneş" },
  92: { name: "Leyl", meaning: "Gece" },
  93: { name: "Duhâ", meaning: "Kuşluk Vakti" },
  94: { name: "İnşirâh", meaning: "Ferahlamak" },
  95: { name: "Tîn", meaning: "İncir" },
  96: { name: "Alak", meaning: "Pıhtılaşmış Kan" },
  97: { name: "Kadir", meaning: "Kadir Gecesi" },
  98: { name: "Beyyine", meaning: "Apaçık Delil" },
  99: { name: "Zilzâl", meaning: "Deprem" },
  100: { name: "Âdiyât", meaning: "Koşan Atlar" },
  101: { name: "Kâria", meaning: "Vuran (Kıyamet)" },
  102: { name: "Tekâsür", meaning: "Çokluk Yarışı" },
  103: { name: "Asr", meaning: "Zaman" },
  104: { name: "Hümeze", meaning: "Çekiştiren" },
  105: { name: "Fîl", meaning: "Fil" },
  106: { name: "Kureyş", meaning: "Kureyş Kabilesi" },
  107: { name: "Mâûn", meaning: "Yardım" },
  108: { name: "Kevser", meaning: "Kevser Havuzu" },
  109: { name: "Kâfirûn", meaning: "İnkarcılar" },
  110: { name: "Nasr", meaning: "Yardım" },
  111: { name: "Mesed", meaning: "Kurumuş Dal" },
  112: { name: "İhlâs", meaning: "Samimiyet" },
  113: { name: "Felak", meaning: "Şafak Vakti" },
  114: { name: "Nâs", meaning: "İnsanlar" }
};

interface QuranReaderProps {
  onBack: () => void;
}

const QuranReader: React.FC<QuranReaderProps> = ({ onBack }) => {
  const { getField, setField } = useUserData();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<(Ayah & { audio: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'surahList' | 'ayahList'>('surahList');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [selectedReciter, setSelectedReciter] = useState(() => getField('selected_reciter', 'ar.alafasy'));
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const previewAudioRef = useRef<HTMLAudioElement>(new Audio());

  const [progress, setProgress] = useState<{ [key: number]: number }>(() =>
    getField('quran_progress', {} as { [key: number]: number })
  );

  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number } | null>(() =>
    getField('quran_last_read', null as { surah: number; ayah: number } | null)
  );

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        }
      } catch (error) {
        console.error("Sura list error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
      previewAudioRef.current.pause();
      previewAudioRef.current.src = "";
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = async () => {
      if (playingAyah !== null && playingAyah < ayahs.length - 1) {
        const nextIdx = playingAyah + 1;
        const nextAyah = ayahs[nextIdx];
        
        try {
          audio.pause();
          audio.src = nextAyah.audio;
          await audio.play();
          
          markAyahAsRead(selectedSurah!.number, nextAyah.numberInSurah);
          setPlayingAyah(nextIdx);

          const el = document.getElementById(`ayah-${nextAyah.numberInSurah}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e: any) {
          if (e.name !== 'AbortError') {
             console.error("Auto-play error:", e);
          }
          setPlayingAyah(null);
        }
      } else {
        setPlayingAyah(null);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [ayahs, selectedSurah, playingAyah]);

  useEffect(() => {
    const previewAudio = previewAudioRef.current;
    
    const handlePreviewEnded = () => {
      setPlayingPreviewId(null);
    };

    const handlePreviewError = () => {
      console.error("Preview source error");
      setPlayingPreviewId(null);
      setPreviewLoading(null);
    };

    previewAudio.addEventListener('ended', handlePreviewEnded);
    previewAudio.addEventListener('error', handlePreviewError);
    
    return () => {
      previewAudio.removeEventListener('ended', handlePreviewEnded);
      previewAudio.removeEventListener('error', handlePreviewError);
    };
  }, []);

  const loadAyahs = async (surahNumber: number) => {
    setLoading(true);
    try {
      const [arRes, trRes, audioRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/tr.diyanet`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${selectedReciter}`)
      ]);
      
      const arData = await arRes.json();
      const trData = await trRes.json();
      const audioData = await audioRes.json();

      if (arData.code === 200 && trData.code === 200 && audioData.code === 200) {
        const combined = arData.data.ayahs.map((ayah: any, index: number) => ({
          number: ayah.number,
          text: ayah.text,
          translation: trData.data.ayahs[index].text,
          numberInSurah: ayah.numberInSurah,
          audio: audioData.data.ayahs[index].audio
        }));
        setAyahs(combined);
        setView('ayahList');
        
        if (lastRead?.surah === surahNumber) {
           setTimeout(() => {
              const el = document.getElementById(`ayah-${lastRead.ayah}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
           }, 200);
        }
      }
    } catch (error) {
      console.error("Ayah fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAyahAsRead = (surahNum: number, ayahNum: number) => {
    const newLastRead = { surah: surahNum, ayah: ayahNum };
    setLastRead(newLastRead);
    setField('quran_last_read', newLastRead);

    setProgress(prev => {
      const currentProg = prev[surahNum] || 0;
      if (ayahNum > currentProg) {
        const newProgress = { ...prev, [surahNum]: ayahNum };
        setField('quran_progress', newProgress);
        return newProgress;
      }
      return prev;
    });
  };

  const playAudio = async (index: number) => {
    const ayah = ayahs[index];
    const audio = audioRef.current;

    previewAudioRef.current.pause();
    setPlayingPreviewId(null);

    if (playingAyah === index) {
      audio.pause();
      setPlayingAyah(null);
    } else {
      try {
        audio.pause();
        audio.src = ayah.audio;
        await audio.play();
        setPlayingAyah(index);
        markAyahAsRead(selectedSurah!.number, ayah.numberInSurah);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Playback error:", e);
        }
      }
    }
  };

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    loadAyahs(surah.number);
  };

  const playReciterPreview = async (e: React.MouseEvent, reciterId: string) => {
    e.stopPropagation();
    const previewAudio = previewAudioRef.current;
    
    audioRef.current.pause();
    setPlayingAyah(null);

    if (playingPreviewId === reciterId) {
      previewAudio.pause();
      setPlayingPreviewId(null);
    } else {
      try {
        previewAudio.pause();
        setPlayingPreviewId(reciterId);
        setPreviewLoading(reciterId);
        
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/1/${reciterId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.data.audio) {
          previewAudio.src = data.data.audio;
          await previewAudio.play();
        } else {
          throw new Error("Audio link not found for this reciter");
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Preview playback failed:", err);
          alert("Bu hocanın önizleme sesi şu an yüklenemiyor.");
        }
        setPlayingPreviewId(null);
      } finally {
        setPreviewLoading(null);
      }
    }
  };

  const changeReciter = (reciterId: string) => {
    previewAudioRef.current.pause();
    setPlayingPreviewId(null);
    
    setSelectedReciter(reciterId);
    setField('selected_reciter', reciterId);
    setShowReciterModal(false);
    
    if (selectedSurah) {
       loadAyahs(selectedSurah.number);
    }
  };

  if (loading && view === 'surahList') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-navy-800 p-6 h-full">
        <div className="w-16 h-16 border-4 border-gold-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-navy-900 font-black uppercase tracking-widest text-xs">Kuran-ı Kerim Hazırlanıyor</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-navy-800 h-full relative animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-slate-50 dark:border-navy-900 flex items-center justify-between bg-white dark:bg-navy-800 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={view === 'ayahList' ? () => { setView('surahList'); setPlayingAyah(null); audioRef.current.pause(); previewAudioRef.current.pause(); } : onBack}
            className="w-10 h-10 bg-slate-50 dark:bg-navy-800 rounded-xl flex items-center justify-center text-lg active:scale-90 transition-transform"
          >
            ←
          </button>
          <div className={view === 'ayahList' ? 'flex flex-col items-center flex-1' : ''}>
            {view === 'ayahList' ? (
              <>
                <h2 className="arabic-text text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {selectedSurah?.name}
                </h2>
                <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">
                  {TURKISH_SURAH_DATA[selectedSurah!.number].name} • {selectedSurah?.numberOfAyahs} Ayet
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Kuran-ı Kerim</h2>
                <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Hidayet Rehberi</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - Sadece ayet görünümünde gösteriliyor */}
        {view === 'ayahList' && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            {/* Speaking Person Icon (Reciter Selection) */}
            <button 
              onClick={() => setShowReciterModal(true)}
              className="w-10 h-10 bg-gold-50 dark:bg-navy-950/20 rounded-xl flex items-center justify-center text-gold-600 active:scale-90 transition-transform hover:bg-gold-100"
              title="Hoca Seçimi"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>

            {/* Eye Icon (Toggle Translation) - Göz Simgesi ile Güncellendi */}
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform ${showTranslation ? 'bg-gold-50 dark:bg-navy-950/20 text-gold-600 hover:bg-gold-100' : 'bg-gold-600 text-white shadow-md shadow-gold-200'}`}
              title={showTranslation ? "Meali Gizle" : "Meali Göster"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showTranslation ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {view === 'surahList' && lastRead && (
          <div 
            onClick={() => {
              const surah = surahs.find(s => s.number === lastRead.surah);
              if (surah) handleSurahClick(surah);
            }}
            className="mt-6 mb-4 p-6 bg-navy-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-navy-900/10 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-xl">📖</div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gold-300 mb-0.5">OKUMAYA DEVAM ET</p>
                <h4 className="font-bold text-sm">{TURKISH_SURAH_DATA[lastRead.surah]?.name}, {lastRead.ayah}. Ayet</h4>
              </div>
            </div>
            <span className="text-xl">→</span>
          </div>
        )}

        {loading && view === 'ayahList' ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-gold-100 border-t-gold-600 rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">Ayetler Ve Ses Dosyaları Hazırlanıyor</p>
          </div>
        ) : view === 'surahList' ? (
          <div className="grid grid-cols-1 gap-3 py-6">
            {surahs.map(surah => {
              const completed = progress[surah.number] || 0;
              const percent = Math.min(100, Math.round((completed / surah.numberOfAyahs) * 100));
              return (
                <div 
                  key={surah.number}
                  onClick={() => handleSurahClick(surah)}
                  className="p-5 rounded-[2.5rem] border border-gold-100 flex items-center justify-between bg-[#fbf6ea] hover:bg-gold-100/50 transition-all cursor-pointer group active:scale-[0.98] shadow-sm shadow-navy-900/5"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 bg-white dark:bg-navy-800 text-gold-400 font-black text-xs flex items-center justify-center rounded-2xl group-hover:bg-gold-600 group-hover:text-white transition-all shadow-sm">
                      {surah.number}
                    </div>
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{TURKISH_SURAH_DATA[surah.number].name}</h4>
                        <span className="text-[9px] font-black text-gold-600 bg-white/50 px-1.5 py-0.5 rounded-md">%{percent}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gold-200/50 rounded-full overflow-hidden border border-white/50">
                        <div 
                          className="h-full bg-gold-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(201,166,104,0.3)]"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right flex-shrink-0">
                    <p className="text-lg font-bold text-navy-900 mb-0.5 font-serif truncate">{surah.name}</p>
                    <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{surah.numberOfAyahs} AYET</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 space-y-16">
            {/* Surah Progress Bar */}
            <div className="fixed top-[108px] left-0 w-full h-1 bg-slate-100 dark:bg-navy-900 z-30">
               <div 
                 className="h-full bg-gold-500 transition-all duration-500"
                 style={{ width: `${Math.round(((progress[selectedSurah!.number] || 0) / selectedSurah!.numberOfAyahs) * 100)}%` }}
               ></div>
            </div>

            {/* Besmele - Düzenlenmiş ve Bozukluk Giderilmiş */}
            {selectedSurah?.number !== 1 && selectedSurah?.number !== 9 && (
               <div className="text-center pt-8 pb-12">
                  <p className="arabic-text text-[2.8rem] text-navy-950 mb-4 drop-shadow-sm leading-tight">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
                  {showTranslation && (
                    <>
                      <div className="flex items-center justify-center gap-3 opacity-30 mb-3">
                        <div className="w-6 h-[1px] bg-slate-900"></div>
                        <div className="w-1 h-1 rotate-45 border border-slate-900"></div>
                        <div className="w-6 h-[1px] bg-slate-900"></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                        Rahmân ve Rahîm olan Allah'ın ismiyle
                      </p>
                    </>
                  )}
               </div>
            )}
            
            {/* Ayah List */}
            {ayahs.map((ayah, idx) => {
              const isRead = (progress[selectedSurah!.number] || 0) >= ayah.numberInSurah;
              const isPlaying = playingAyah === idx;
              
              // Bazı API yanıtlarında Besmele Ayet 1'in içine dahil olabiliyor, temizliyoruz
              const cleanArabicText = ayah.numberInSurah === 1 && selectedSurah?.number !== 1 && selectedSurah?.number !== 9
                ? ayah.text.replace(/بِسْمِ [^ ]+ [^ ]+ [^ ]+/, '').trim()
                : ayah.text;

              return (
                <div 
                  id={`ayah-${ayah.numberInSurah}`}
                  key={ayah.number} 
                  className={`relative transition-all duration-500 ${isPlaying ? 'scale-[1.01]' : ''}`}
                  onClick={() => markAyahAsRead(selectedSurah!.number, ayah.numberInSurah)}
                >
                  <div className="flex gap-4">
                    {/* Side Controls */}
                    <div className="flex flex-col gap-3 pt-2">
                       <div className={`w-9 h-9 rounded-xl font-black text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm border transition-all ${
                         isPlaying ? 'bg-gold-600 border-gold-500 text-white shadow-gold-200' : 
                         isRead ? 'bg-gold-100 border-gold-200 text-gold-700' : 'bg-slate-50 dark:bg-navy-800 border-slate-100 dark:border-navy-900 text-slate-400 dark:text-slate-500'
                       }`}>
                          {ayah.numberInSurah}
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); playAudio(idx); }}
                         className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                           isPlaying ? 'bg-gold-600 text-white animate-pulse shadow-lg shadow-gold-200' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 hover:bg-gold-50 dark:bg-navy-950/20 hover:text-gold-600'
                         }`}
                       >
                         {isPlaying ? (
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                         ) : (
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                         )}
                       </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col items-center gap-8">
                       {/* Arabic Text */}
                       <p className={`arabic-text text-4xl text-right w-full leading-[2.2] transition-colors ${isPlaying ? 'text-gold-600' : isRead ? 'text-navy-900/60' : 'text-slate-900 dark:text-white'}`}>
                          {cleanArabicText}
                       </p>

                       {/* Turkish Translation (Diyanet Meal) - Conditionally rendered */}
                       {showTranslation && (
                        <div className={`w-full rounded-2xl px-8 py-7 text-center transition-all duration-500 shadow-[0_15px_40px_-10px_rgba(186,230,253,0.4)] border ${
                          isPlaying ? 'bg-[#f5ead0] border-gold-200 ring-4 ring-gold-100' : 
                          isRead ? 'bg-[#fbf6ea]/80 border-gold-100' : 'bg-[#fbf6ea] border border-gold-50'
                        }`}>
                            <p className={`text-[15px] leading-relaxed font-semibold ${isPlaying ? 'text-navy-950' : isRead ? 'text-navy-900/70' : 'text-navy-900/80'}`}>
                              {ayah.translation}
                            </p>
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center py-20 opacity-30">
               <span className="text-5xl">📿</span>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Sadaqallahul Azim</p>
               <p className="text-[8px] font-bold mt-2">Diyanet İşleri Başkanlığı Meali Kullanılmıştır</p>
            </div>
          </div>
        )}
      </div>

      {/* Reciter Selection Modal */}
      {showReciterModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
           <div className="bg-white dark:bg-navy-800 w-full max-w-md rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom-20 duration-500 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hoca Seçimi</h3>
                    <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest mt-1">Tilaveti kimden dinlemek istersiniz?</p>
                 </div>
                 <button 
                   onClick={() => { setShowReciterModal(false); previewAudioRef.current.pause(); setPlayingPreviewId(null); setPreviewLoading(null); }}
                   className="w-10 h-10 bg-slate-50 dark:bg-navy-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500"
                 >
                   ✕
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {RECITERS.map(reciter => {
                  const isCurrent = selectedReciter === reciter.id;
                  const isPreviewPlaying = playingPreviewId === reciter.id;
                  const isLoadingThis = previewLoading === reciter.id;
                  
                  return (
                    <div 
                      key={reciter.id}
                      onClick={() => changeReciter(reciter.id)}
                      className={`p-5 rounded-[2.2rem] border flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${
                        isCurrent 
                          ? 'bg-gold-600 border-gold-500 text-white shadow-xl shadow-navy-900/10' 
                          : 'bg-slate-50 dark:bg-navy-800 border-slate-100 dark:border-navy-900 text-slate-900 dark:text-white hover:bg-gold-50 dark:bg-navy-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-5 flex-1">
                         <div className="relative group/reciter">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all duration-500 ${isCurrent ? 'bg-white/20' : 'bg-white dark:bg-navy-800'}`}>
                               {isLoadingThis ? (
                                  <div className="w-6 h-6 border-2 border-gold-600 border-t-transparent rounded-full animate-spin"></div>
                               ) : "👤"}
                            </div>
                            <button 
                              onClick={(e) => playReciterPreview(e, reciter.id)}
                              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                isPreviewPlaying ? 'bg-white dark:bg-navy-800 text-rose-500 animate-pulse' : isCurrent ? 'bg-white dark:bg-navy-800 text-gold-600' : 'bg-gold-600 text-white hover:scale-110'
                              }`}
                              disabled={isLoadingThis}
                            >
                              {isPreviewPlaying ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              )}
                            </button>
                         </div>
                         <div className="ml-1">
                            <p className="font-bold text-[15px] tracking-tight leading-tight">{reciter.name}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isCurrent ? 'text-gold-100/60' : 'text-slate-400 dark:text-slate-500'}`}>
                               {reciter.sub}
                            </p>
                         </div>
                      </div>
                      {isCurrent && (
                        <div className="w-6 h-6 bg-white dark:bg-navy-800 rounded-full flex items-center justify-center text-gold-600 text-[10px] font-black shadow-sm">
                           ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <p className="text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-8">Ses Files Çevrimiçi Oynatılır</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default QuranReader;
