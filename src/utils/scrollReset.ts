// Sayfa/sekme değiştiğinde HER olası kaydırma alanını en üste sıfırlar.
// Sadece ana kaydırma kutusunu değil, içindeki iç içe scroll alanlarını ve
// pencerenin kendisini de sıfırlar — hangi öğe gerçekten kayıyor olursa olsun çalışır.
export const resetAllScroll = () => {
  window.scrollTo(0, 0);
  document.getElementById('app-main-scroll')?.scrollTo({ top: 0 });
  document.querySelectorAll('.overflow-y-auto, .overflow-auto').forEach(el => {
    (el as HTMLElement).scrollTop = 0;
  });
};
