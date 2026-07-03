import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Uygulama genelinde (tüm kullanıcılar için) geçerli ayarlar.
 * Admin panelinden değiştirilir, `app_config/global` belgesinde tutulur ve
 * gerçek zamanlı olarak tüm cihazlara yansır.
 */
export interface AppConfig {
  /** Premium olmayan kullanıcılara kilitli gösterilecek kategori adları (Library.tsx'teki `cat` değerleri) */
  lockedCategories: string[];
  /** Premium olmayan kullanıcılara kilitli gösterilecek TEK TEK bölüm id'leri (kategoriden bağımsız, ince ayar) */
  lockedTools: string[];
  /** HERKESTEN tamamen gizlenecek bölüm id'leri (premium/standart fark etmeksizin, kütüphanede hiç görünmez) */
  hiddenTools: string[];
  /** Ramazan Özel bölümünün herkese açık olup olmadığı */
  ramadanModeEnabled: boolean;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  lockedCategories: [],
  lockedTools: [],
  hiddenTools: [],
  ramadanModeEnabled: false,
};

const configRef = () => doc(db, 'app_config', 'global');

export const subscribeAppConfig = (cb: (config: AppConfig) => void) => {
  return onSnapshot(
    configRef(),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        cb({
          lockedCategories: Array.isArray(data.lockedCategories) ? data.lockedCategories : [],
          lockedTools: Array.isArray(data.lockedTools) ? data.lockedTools : [],
          hiddenTools: Array.isArray(data.hiddenTools) ? data.hiddenTools : [],
          ramadanModeEnabled: !!data.ramadanModeEnabled,
        });
      } else {
        cb(DEFAULT_APP_CONFIG);
      }
    },
    (err) => {
      console.error('Uygulama ayarları alınamadı:', err);
      cb(DEFAULT_APP_CONFIG);
    }
  );
};

export const updateAppConfig = async (partial: Partial<AppConfig>) => {
  await setDoc(configRef(), partial, { merge: true });
};
