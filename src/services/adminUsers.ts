import { collection, getDocs, doc, setDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';

export interface AdminUserRow {
  uid: string;
  name: string;
  email: string;
  isPremium: boolean;
}

// Tüm kullanıcıları getirir (sadece admin mailleri firestore.rules sayesinde okuyabilir)
export const fetchAllUsers = async (): Promise<AdminUserRow[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name || '(isimsiz)',
      email: data.email || '',
      isPremium: !!data.is_premium_user,
    };
  });
};

// Belirli bir kullanıcıya premium ver / kaldır
export const setUserPremium = async (uid: string, isPremium: boolean) => {
  await setDoc(doc(db, 'users', uid), { is_premium_user: isPremium }, { merge: true });
};
