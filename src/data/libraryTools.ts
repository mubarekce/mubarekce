export interface ToolMeta {
  id: string;
  title: string;
  cat: string;
}

// Library.tsx'teki araçlarla birebir aynı id/title/cat değerleri
export const LIBRARY_TOOLS: ToolMeta[] = [
  { id: 'quran', title: 'Kuran-ı Kerim', cat: 'Kuran Akademisi' },
  { id: 'tecvid-hoca', title: 'Tecvid Hocası', cat: 'Kuran Akademisi' },
  { id: 'hafizlik-modu', title: 'Hafızlık Modu', cat: 'Kuran Akademisi' },
  { id: 'elifba', title: 'Elif Ba', cat: 'Kuran Akademisi' },
  { id: 'ayet-bul', title: 'Ayet Bulucu', cat: 'Kuran Akademisi' },
  { id: 'zikir', title: 'Zikirmatik', cat: 'İbadet Merkezi' },
  { id: 'hatim-org', title: 'Hatim Organizatörü', cat: 'İbadet Merkezi' },
  { id: 'kaza', title: 'Kaza Takibi', cat: 'İbadet Merkezi' },
  { id: 'esma', title: 'Esmaül Hüsna', cat: 'İbadet Merkezi' },
  { id: 'cevsen', title: 'Cevşen-ül Kebir', cat: 'İbadet Merkezi' },
  { id: 'sanal-bahce', title: 'Sanal Bahçem', cat: 'Manevi Gelişim' },
  { id: 'ruya-tabiri', title: 'Rüya Tabiri', cat: 'Manevi Gelişim' },
  { id: 'uyku-modu', title: 'Uyku & Tefekkür', cat: 'Manevi Gelişim' },
  { id: 'aile-modu', title: 'Aile Modu', cat: 'Manevi Gelişim' },
  { id: 'hadis', title: 'Kütüb-i Sitte', cat: 'Bilgi Hazinesi' },
  { id: 'peygamberler', title: 'Peygamberler', cat: 'Bilgi Hazinesi' },
  { id: 'tarih', title: 'İslam Tarihi', cat: 'Bilgi Hazinesi' },
  { id: '40-hadis', title: '40 Hadis', cat: 'Bilgi Hazinesi' },
  { id: 'helal-tarayici', title: 'Helal Tarayıcı', cat: 'Günlük Yaşam' },
  { id: 'zekat', title: 'Zekat Hesapla', cat: 'Günlük Yaşam' },
  { id: 'ramazan', title: 'Ramazan Özel', cat: 'Günlük Yaşam' },
  { id: 'abdest', title: 'Namaz Rehberi', cat: 'Günlük Yaşam' },
  { id: 'kible', title: 'Kıble Pusulası', cat: 'Lokasyon & Media' },
  { id: 'camiler', title: 'Yakın Camiler', cat: 'Lokasyon & Media' },
  { id: 'kabe-canli', title: 'Kabe Canlı', cat: 'Lokasyon & Media' },
  { id: 'radyo', title: 'Dini Radyolar', cat: 'Lokasyon & Media' },
  { id: 'mesajlar', title: 'Hayırlı Cumalar', cat: 'Lokasyon & Media' },
];

export const LIBRARY_CATEGORIES = [
  'Kuran Akademisi',
  'İbadet Merkezi',
  'Manevi Gelişim',
  'Bilgi Hazinesi',
  'Günlük Yaşam',
  'Lokasyon & Media',
];
