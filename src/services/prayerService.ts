
import { PrayerTimes, HijriDate } from '../types';

const hijriMonthTr: { [key: number]: string } = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebiülevvel',
  4: 'Rebiülahir',
  5: 'Cemaziyelevvel',
  6: 'Cemaziyelahir',
  7: 'Recep',
  8: 'Şaban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce'
};

export const fetchPrayerTimes = async (lat: number, lng: number): Promise<{ times: PrayerTimes; hijri: HijriDate; city: string }> => {
  try {
    const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`); // 13 is Diyanet equivalent or close
    const data = await response.json();
    
    if (data.code !== 200) throw new Error("API hatası");

    const timings = data.data.timings;
    const hijri = data.data.date.hijri;
    const meta = data.data.meta;

    return {
      times: {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha
      },
      hijri: {
        day: hijri.day,
        month: { 
          tr: hijriMonthTr[hijri.month.number] || hijri.month.en, 
          en: hijri.month.en 
        },
        year: hijri.year
      },
      city: meta.timezone.split('/')[1]?.replace('_', ' ') || 'Konum Belirleniyor'
    };
  } catch (error) {
    console.error("Prayer fetch error:", error);
    throw error;
  }
};

export const getKibleDirection = (lat: number, lng: number): number => {
  // Kaaba coordinates: 21.4225° N, 39.8262° E
  const phiK = 21.4225 * Math.PI / 180.0;
  const lambdaK = 39.8262 * Math.PI / 180.0;
  const phi = lat * Math.PI / 180.0;
  const lambda = lng * Math.PI / 180.0;

  const numerator = Math.sin(lambdaK - lambda);
  const denominator = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  
  let qibla = Math.atan2(numerator, denominator) * 180.0 / Math.PI;
  if (qibla < 0) qibla += 360;
  return qibla;
};
