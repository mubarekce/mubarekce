/**
 * Admin paneline erişebilecek e-postalar.
 * Kendi hesabınızın e-postasını buraya ekleyin, aksi halde "Yönetim Paneli"
 * girişi Profil sekmesinde görünmez.
 */
export const ADMIN_EMAILS: string[] = [
  // 'admin@mubarekce.com',
];

export const isAdminEmail = (email?: string | null): boolean =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());
