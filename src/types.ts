
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  day: string;
  month: { tr: string; en: string };
  year: string;
}

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  avatar?: string;
  bio?: string;
}

export enum AppTab {
  Home = 'Anasayfa',
  Library = 'Kütüphane',
  Worship = 'İbadet',
  Social = 'Kardeşlik',
  Profile = 'Profil'
}

export interface DuaRequest {
  id: string;
  userName: string;
  title: string;
  content: string;
  category: string;
  aminCount: number;
  timestamp: Date;
}

export interface Story {
  id: string;
  type: 'ayet' | 'hadis' | 'dua';
  content: string;
  source: string;
  image: string;
}

export interface Ayah {
  number: number;
  text: string;
  translation: string;
  numberInSurah: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export type PrayerStatus = 'not_yet' | 'done' | 'congregation' | 'late' | 'missed';

export interface HabitTask {
  id: string;
  label: string;
  icon: string;
  category: 'ilm' | 'ihsan' | 'zikir' | 'sosyal';
}
