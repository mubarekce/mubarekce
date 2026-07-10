# Değişiklikler

## 10.07.2026 (3)

- **Ana sayfadaki tüm "Hızlı Erişim" kısayol butonları** (Kıble, Zikirmatik, Kuran,
  Camiler, Zekat, Hatim Organizatörü, Esmaül Hüsna, Cevşen, Sanal Bahçem, Kaza Takibi,
  Aile Modu, Radyo, Helal Tarayıcı, Namaz Rehberi — 13 buton) koyu modda hep aynı koyu
  yeşile (`#0f2b26`) gidiyordu; bu `src/data/homeShortcuts.ts` dosyasındaydı ve önceki
  taramalarda gözden kaçmıştı. Artık hepsi lacivert (`#141a2c`) ile bitiyor.
- Ayrıca birkaç kartın/butonun gölge (shadow) renginde saklı kalmış yeşil tonlar
  bulundu ve düzeltildi: Anasayfa hikaye ikonları, Kütüphane'deki "Elif Ba" ve
  "Sanal Bahçem" ikon parıltıları, Profil'deki cami/cuma sessiz mod göstergesi,
  Giriş ekranı ve birkaç büyük kartın (Kaza Takibi, Hatim Organizatörü) gölgesi —
  hepsi altın/lacivert tonuna çekildi.
- Uygulamanın tamamı (51 dosya) tek tek tarandı: artık hiçbir yerde yeşil/turkuaz
  Tailwind sınıfı, hex renk veya gölge rengi kalmadı; metin/ikon okunabilirliği
  (koyu kartlarda beyaz/altın metin, açık kartlarda koyu lacivert metin) korunarak
  tema bütünlüğü sağlandı.

## 10.07.2026 (2)

- Ana kabuktaki (App.tsx) yeni açık lacivert degrade beğenildiği için **tüm sayfalara**
  uygulandı: daha önce düz tek renk (`bg-[#fbf6ea]` açık modda / `bg-[#141a2c]` koyu modda,
  veya bazı ekranlarda sabit `#fdfdfd` beyaz) olan 22 dosyadaki 34 sayfa/panel arka planı,
  aynı yumuşak geçişli gradyanla değiştirildi:
  - Açık mod: beyazdan başlayıp krem ve hafif altın tonuna yumuşakça geçen bir degrade.
  - Koyu mod: App.tsx'teki gradyanla birebir aynı (açık lacivertten koyu laciverte).
  - Bonus: Daha önce koyu mod desteği hiç olmayan bazı alt araç ekranları (Ryya Tabiri,
    Kütüb-i Sitte, Kırk Hadis, Peygamberler, Zekat Hesapla, Namaz Rehberi vb.) artık koyu
    modda da düzgün görünüyor.

## 10.07.2026

- **Arka plan degradesi düzeltildi:** Uygulamanın tamamının arkasındaki (yükleme ekranı +
  ana kabuk) koyu yeşil, tek noktadan yayılan radyal degrade (`radial-gradient ... at 50% 35%`)
  kaldırıldı. Yerine yukarıdan aşağıya, ekranın tamamına yayılan (boydan boya) daha açık
  lacivert tonlarında bir `linear-gradient` kondu.
- Taramada aynı koyu/açık yeşil renk çiftinin (`#f3f7e9` açık yeşil / `#0a1f1a`, `#0f2b26`,
  `#153a33` koyu yeşil) neredeyse **her ekranın üst başlık çubuğunda ve birkaç büyük kartta**
  (Home, Profile, HatimOrganizatoru, SpiritualGarden, Library ve 20+ dosya daha) tekrar
  ettiği görüldü — toplam 95 yerde krem (`#fbf6ea`) / lacivert (`#141a2c`, `#1c2541`) /
  altın (`#a8895a`) karşılıklarıyla değiştirildi.

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