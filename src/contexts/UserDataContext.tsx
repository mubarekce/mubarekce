import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * UserDataContext
 * ----------------
 * Daha önce her bileşenin kendi başına localStorage'a yazdığı kullanıcıya
 * özel veriler (namaz kayıtları, zikir sayaçları, kaza takibi, hatim
 * ilerlemesi, elifba ilerlemesi, aile modu, tercihler vb.) artık burada
 * TEK bir Firestore belgesinde (`users/{uid}`) tutulur.
 *
 * Nasıl çalışır:
 * 1. Kullanıcı giriş yapınca bu belge gerçek zamanlı dinlenir (onSnapshot).
 *    Böylece aynı hesapla başka bir cihazdan girildiğinde veriler orada da
 *    otomatik güncellenir.
 * 2. Her `setField` çağrısı önce yerel state'i (ve firebase.ts'teki kalıcı
 *    önbelleği) hemen günceller -> arayüz donmadan anında tepki verir.
 * 3. Firestore'a yazma işlemi 500ms "debounce" ile yapılır (örn. zikir
 *    sayacına art arda hızlı basıldığında her tıklamada değil, kullanıcı
 *    durduğunda tek seferde yazılır). Bu hem hızlı hem de gereksiz yazma
 *    maliyetini azaltır.
 * 4. İnternet yokken de setDoc çağrıları Firestore SDK'sının kendi
 *    kuyruğuna alınır ve bağlantı gelince otomatik gönderilir (firebase.ts
 *    içindeki persistentLocalCache sayesinde).
 */

interface UserDataContextType {
  /** Tüm alanların anlık halini içeren obje (ileri seviye kullanım için) */
  data: Record<string, any>;
  /** Firestore'dan ilk veri geldi mi / kullanıcı yoksa true (boş veriyle) */
  ready: boolean;
  /** Belirli bir alanı oku, yoksa varsayılan değeri döndür */
  getField: <T,>(key: string, defaultValue: T) => T;
  /** Belirli bir alanı yaz (yerelde anında, Firestore'a debounce ile) */
  setField: (key: string, value: any) => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

const cacheKey = (uid: string) => `ud_cache_${uid}`;

export const UserDataProvider: React.FC<{ uid: string | null; children: ReactNode }> = ({ uid, children }) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [ready, setReady] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!uid) {
      setData({});
      setReady(true);
      return;
    }

    setReady(false);

    // Anında göster: yerel önbellekte varsa (offline açılışta da veri kaybolmasın)
    try {
      const cached = localStorage.getItem(cacheKey(uid));
      if (cached) setData(JSON.parse(cached));
    } catch {
      // önbellek bozuksa yok say
    }

    // Firestore'u gerçek zamanlı dinle
    const ref = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const remote = snap.exists() ? snap.data() : {};
        setData(remote);
        try {
          localStorage.setItem(cacheKey(uid), JSON.stringify(remote));
        } catch {
          // yer kalmadıysa yok say
        }
        setReady(true);
      },
      (err) => {
        console.error('Kullanıcı verisi dinlenirken hata:', err);
        setReady(true);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const getField = useCallback(
    <T,>(key: string, defaultValue: T): T => {
      return data[key] !== undefined && data[key] !== null ? (data[key] as T) : defaultValue;
    },
    [data]
  );

  const setField = useCallback(
    (key: string, value: any) => {
      setData((prev) => {
        const next = { ...prev, [key]: value };
        if (uid) {
          try {
            localStorage.setItem(cacheKey(uid), JSON.stringify(next));
          } catch {
            // yok say
          }
        }
        return next;
      });

      if (!uid) return;

      clearTimeout(saveTimers.current[key]);
      saveTimers.current[key] = setTimeout(async () => {
        try {
          const ref = doc(db, 'users', uid);
          await setDoc(ref, { [key]: value }, { merge: true });
        } catch (err) {
          console.error(`"${key}" alanı Firestore'a yazılamadı:`, err);
        }
      }, 500);
    },
    [uid]
  );

  return (
    <UserDataContext.Provider value={{ data, ready, getField, setField }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData yalnızca UserDataProvider içinde kullanılabilir');
  return ctx;
};
