// Gerekli malzemeleri çağırıyoruz
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// "mubarekceapp" Firebase Proje Ayarları
const firebaseConfig = {
  apiKey: "AIzaSyAiJ8sG0vljfu5U98on2NQYXgH-wXeXAnc",
  authDomain: "mubarekceapp.firebaseapp.com",
  projectId: "mubarekceapp",
  storageBucket: "mubarekceapp.firebasestorage.app",
  messagingSenderId: "158403220088",
  appId: "1:158403220088:web:356577b13f8999fb63538d",
  measurementId: "G-MSKTKHKH5G",
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);

// 1. Kimlik Doğrulama (Auth) servisi
export const auth = getAuth(app);

// 2. Veritabanı (Firestore) servisi
// Not: Analytics kaldırıldı çünkü Capacitor/Android WebView içinde
// çalışmıyor ve gereksiz hata üretiyor. Gerekirse ileride
// "firebase/analytics" + platform kontrolü ile geri eklenebilir.
//
// Çevrimdışı önbellek (persistentLocalCache) açıldı: kullanıcı internetsizken
// bile uygulama son senkronize veriyle çalışmaya devam eder, bağlantı
// gelince otomatik senkronize olur. Birden fazla sekme/pencere desteği
// için persistentMultipleTabManager kullanıldı.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
