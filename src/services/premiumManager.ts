import { db } from "../firebase"; // Firebase ayarlarını çağırıyoruz
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

// KULLANICIYA 12 SAAT EKLEME FONKSİYONU
export const addTwelveHours = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    let newExpiryDate = new Date(); // Şu anki zaman

    // Eğer kullanıcının zaten süresi varsa ve bitmemişse, KALDIĞI YERDEN ekle
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.premiumExpiry) {
        const currentExpiry = data.premiumExpiry.toDate();
        if (currentExpiry > new Date()) {
          newExpiryDate = currentExpiry; // Süresi bitmemişse üzerine ekle
        }
      }
    }

    // 12 Saat Ekleme İşlemi
    newExpiryDate.setHours(newExpiryDate.getHours() + 12);

    // Veritabanına Yaz
    await setDoc(userRef, {
      premiumExpiry: Timestamp.fromDate(newExpiryDate),
      lastUpdated: Timestamp.now()
    }, { merge: true });

    console.log("12 Saat başarıyla eklendi! Yeni bitiş:", newExpiryDate);
    return true;

  } catch (error) {
    console.error("Süre eklenirken hata oluştu:", error);
    return false;
  }
};

// KULLANICI PREMIUM MU DİYE KONTROL ETME FONKSİYONU
export const checkIsPremium = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.premiumExpiry) {
        const expiryDate = data.premiumExpiry.toDate();
        const now = new Date();
        // Eğer bitiş tarihi şu andan ilerideyse PREMIUMDUR
        return expiryDate > now;
      }
    }
    return false; // Kayıt yoksa veya süre bittiyse premium değil
  } catch (error) {
    console.error("Kontrol hatası:", error);
    return false;
  }
};