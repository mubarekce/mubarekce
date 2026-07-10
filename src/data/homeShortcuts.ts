// Ana ekrandaki "Hızlı Erişim" bölümünde kullanıcının seçip
// kişiselleştirebileceği kısayol kataloğu. `id` alanları Library.tsx
// içindeki araç id'leriyle birebir eşleşir (goToLibraryTool bu id'yi kullanır).

export interface HomeShortcut {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  bg: string;
  ring: string;
}

export const SHORTCUT_CATALOG: HomeShortcut[] = [
  { id: 'kible', label: 'Kıble Bulucu', desc: 'Yönünü Bul', emoji: '🧭', bg: 'from-[#f2ead9] to-white dark:from-[#1c2438] dark:to-[#141a2c]', ring: 'border-[#c9a668]/25 dark:border-[#c9a668]/15' },
  { id: 'zikir', label: 'Zikirmatik', desc: 'Zikir Çek', emoji: '📿', bg: 'from-amber-50 to-white dark:from-amber-950/20 dark:to-[#141a2c]', ring: 'border-amber-100 dark:border-amber-900/30' },
  { id: 'quran', label: 'Kuran-ı Kerim', desc: 'Oku & Dinle', emoji: '📖', bg: 'from-gold-50/70 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
  { id: 'camiler', label: 'Yakın Camiler', desc: 'Mescit Bul', emoji: '🕌', bg: 'from-gold-50/70 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
  { id: 'zekat', label: 'Zekat Hesapla', desc: 'Varlık Hesabı', emoji: '💰', bg: 'from-yellow-50 to-white dark:from-yellow-950/20 dark:to-[#141a2c]', ring: 'border-yellow-100 dark:border-yellow-900/30' },
  { id: 'hatim-org', label: 'Hatim Organizatörü', desc: 'Grup Hatim', emoji: '🤝', bg: 'from-gold-50 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
  { id: 'esma', label: 'Esmaül Hüsna', desc: '99 İsim', emoji: '✨', bg: 'from-purple-50 to-white dark:from-purple-950/20 dark:to-[#141a2c]', ring: 'border-purple-100 dark:border-purple-900/30' },
  { id: 'cevsen', label: 'Cevşen-ül Kebir', desc: 'Koruyucu Dua', emoji: '🤲', bg: 'from-gold-50 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
  { id: 'sanal-bahce', label: 'Sanal Bahçem', desc: 'İbadet Takibi', emoji: '🌿', bg: 'from-gold-50 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
  { id: 'kaza', label: 'Kaza Takibi', desc: 'Namaz & Oruç', emoji: '📋', bg: 'from-orange-50 to-white dark:from-orange-950/20 dark:to-[#141a2c]', ring: 'border-orange-100 dark:border-orange-900/30' },
  { id: 'aile-modu', label: 'Aile Modu', desc: 'Ortak İbadet', emoji: '👨‍👩‍👧', bg: 'from-amber-50 to-white dark:from-amber-950/20 dark:to-[#141a2c]', ring: 'border-amber-100 dark:border-amber-900/30' },
  { id: 'radyo', label: 'Dini Radyolar', desc: 'Kesintisiz Yayın', emoji: '📻', bg: 'from-pink-50 to-white dark:from-pink-950/20 dark:to-[#141a2c]', ring: 'border-pink-100 dark:border-pink-900/30' },
  { id: 'helal-tarayici', label: 'Helal Tarayıcı', desc: 'Barkod Analizi', emoji: '🔍', bg: 'from-rose-50 to-white dark:from-rose-950/20 dark:to-[#141a2c]', ring: 'border-rose-100 dark:border-rose-900/30' },
  { id: 'abdest', label: 'Namaz Rehberi', desc: 'Sesli Anlatım', emoji: '💧', bg: 'from-gold-50 to-white dark:from-navy-950/20 dark:to-[#141a2c]', ring: 'border-gold-100 dark:border-navy-900/30' },
];

export const DEFAULT_SHORTCUT_IDS = ['kible', 'zikir', 'quran', 'camiler'];
export const MAX_SHORTCUTS = 6;
export const MIN_SHORTCUTS = 2;
