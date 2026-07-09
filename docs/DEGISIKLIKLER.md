# Değişiklikler

## 09.07.2026 (2)

- Ana sayfanın en üstündeki gereksiz boşluk azaltıldı (pt-6 → pt-2, ay-yıldız ayracının
  fazla üst/alt boşlukları temizlendi).
- **Uygulama genelinde tema birleştirmesi:** Tüm ekranlardaki yeşil/teal tonlar
  (emerald-*, green-*, teal-*, lime-*) — 28 dosyada toplam 541+ değişiklik — ana sayfadaki
  lacivert/altın temayla uyumlu hale getirildi:
  - Açık/orta tonlar (50-700) → altın (`gold-*`) skalasına.
  - Koyu tonlar (800-950, genelde karanlık mod arka planları) → lacivert (`navy-*`) skalasına.
  - Cami haritasındaki işaretçi ve "Manevi Bahçe" (SpiritualGarden) bileşenindeki inline
    yeşil/mavi hex renkler de altın/lacivert paletine çevrildi.
  - `tailwind.config` (index.html içinde) tam bir `gold` (50-900) ve `navy` (50-950) renk
    skalasıyla genişletildi.
- Not: Bazı ekranlarda (Kütüphane araç kategorileri, Admin Panel durum rozetleri gibi)
  mavi/kırmızı/mor gibi başka vurgu renkleri hâlâ duruyor — bunlar kategori ayrımı veya
  durum bildirimi (hata/başarı) amacıyla kullanıldığı için bu turda dokunulmadı. İstenirse
  bunlar da tamamen altın/lacivert paletine indirgenebilir.

## 09.07.2026

- Ana sayfa (Home.tsx) daha belirgin İslami bir temaya kavuşturuldu:
  - Arka planda ince, sekiz kollu geometrik yıldız deseni (önceden düz nokta desendi).
  - Üstte küçük bir ay motifli ayraç eklendi.
  - "Sıradaki Vakit" artık kendi büyük panelinde: vakit adı, ezan saati, iki vakit
    arasındaki ilerlemeyi gösteren çubuk ve **"X saat Y dakika kaldı"** şeklinde net,
    sade bir geri sayım metni.
  - Hikaye ikonları (Ayet/Hadis/Dua/Sünnet/AI Hocam) ve İmsakiye takvimindeki dağınık
    renk paleti (teal/amber/indigo/rose/sky) kaldırıldı; hepsi tutarlı altın/lacivert
    marka rengine çekildi — daha sade ve göz yormayan bir görünüm.
  - Üst bilgi kutusu sadeleştirildi (tekrarlayan Hicri tarih kutusu kaldırıldı, Hicri
    tarih artık tek bir yerde, zikir kutusunun yanında gösteriliyor).

## 03.08.2026

- GitHub oluşturuldu.
- Repository hazırlandı.