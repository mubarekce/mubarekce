import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Ana sayfadaki "Hikayeler" (AYET / HADİS / DUA / SÜNNET) çemberlerinin
 * içeriğini yönetir. Yönetim Paneli > Hikayeler sekmesinden düzenlenir,
 * `app_config/stories` belgesinde tutulur ve tüm kullanıcılara gerçek
 * zamanlı yansır.
 */

export interface StoryItem {
  id: string;
  arabic?: string;
  content: string;
  source: string;
}

export interface CategoryStories {
  /** true ise her gün havuzdaki bir sonraki içerik otomatik gösterilir (tarihe göre döner) */
  autoRotate: boolean;
  /** autoRotate kapalıyken HERKESE gösterilecek sabit içeriğin id'si */
  pinnedId: string | null;
  items: StoryItem[];
}

export type StoryCategory = 'AYET' | 'HADİS' | 'DUA' | 'SÜNNET';

export const STORY_CATEGORIES: StoryCategory[] = ['AYET', 'HADİS', 'DUA', 'SÜNNET'];

export const CATEGORY_TITLES: Record<StoryCategory, string> = {
  AYET: 'GÜNÜN AYETİ',
  HADİS: 'GÜNÜN HADİSİ',
  DUA: 'GÜNÜN DUASI',
  SÜNNET: 'GÜNÜN SÜNNETİ',
};

export const CATEGORY_GRADIENTS: Record<StoryCategory, string> = {
  AYET: 'from-teal-900 via-teal-800 to-teal-950',
  HADİS: 'from-amber-800 via-orange-800 to-amber-950',
  DUA: 'from-indigo-900 via-blue-800 to-indigo-950',
  SÜNNET: 'from-rose-900 via-pink-800 to-rose-950',
};

export type StoriesConfig = Record<StoryCategory, CategoryStories>;

export const DEFAULT_STORIES: StoriesConfig = {
  AYET: {
    autoRotate: true,
    pinnedId: null,
    items: [
      { id: 'a1', arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', content: 'Sabır ve namazla Allah’tan yardım isteyin.', source: 'Bakara, 45' },
      { id: 'a2', arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', content: 'Şüphesiz güçlükle beraber bir kolaylık vardır.', source: 'İnşirah, 6' },
    ],
  },
  HADİS: {
    autoRotate: true,
    pinnedId: null,
    items: [
      { id: 'h1', arabic: 'اَلدِّينُ النَّصِيحَةُ', content: 'Din samimiyettir (nasihattir).', source: 'Müslim, Îmân, 95' },
      { id: 'h2', arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', content: 'Güzel söz sadakadır.', source: 'Buhârî, Cihâd, 128' },
    ],
  },
  DUA: {
    autoRotate: true,
    pinnedId: null,
    items: [
      { id: 'd1', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', content: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.', source: 'Bakara, 201' },
      { id: 'd2', arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', content: 'Ey kalpleri evirip çeviren Allah’ım! Kalbimi dinin üzerinde sabit kıl.', source: 'Tirmizî, Deavât, 74' },
    ],
  },
  SÜNNET: {
    autoRotate: true,
    pinnedId: null,
    items: [
      { id: 's1', content: 'Yemeğe tuzla başlamak ve sağ el ile yemek.', source: 'Sünnet-i Seniyye' },
      { id: 's2', content: 'Uyumadan önce sağ tarafına yatmak ve dua etmek.', source: 'Sünnet-i Seniyye' },
    ],
  },
};

const storiesRef = () => doc(db, 'app_config', 'stories');

export const subscribeStories = (cb: (config: StoriesConfig) => void) => {
  return onSnapshot(
    storiesRef(),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<StoriesConfig>;
        // Firestore'da henüz olmayan kategoriler için varsayılanla doldur
        const merged = { ...DEFAULT_STORIES, ...data } as StoriesConfig;
        cb(merged);
      } else {
        cb(DEFAULT_STORIES);
      }
    },
    (err) => {
      console.error('Hikaye ayarları alınamadı:', err);
      cb(DEFAULT_STORIES);
    }
  );
};

export const updateCategoryStories = async (category: StoryCategory, data: CategoryStories) => {
  await setDoc(storiesRef(), { [category]: data }, { merge: true });
};

/** O günün (tarihe göre) gösterilecek içeriğini seçer */
export const pickDailyStory = (cat: CategoryStories): StoryItem | null => {
  if (!cat.items.length) return null;
  if (!cat.autoRotate && cat.pinnedId) {
    const pinned = cat.items.find(i => i.id === cat.pinnedId);
    if (pinned) return pinned;
  }
  const day = new Date().getDate();
  return cat.items[day % cat.items.length];
};
