
import React, { useState, useEffect } from 'react';
import { getKibleDirection } from '../services/prayerService';

interface KibleCompassProps {
  lat: number;
  lng: number;
}

const KibleCompass: React.FC<KibleCompassProps> = ({ lat, lng }) => {
  const [heading, setHeading] = useState(0);
  const qiblaAngle = getKibleDirection(lat, lng);

  useEffect(() => {
    const handleOrientation = (e: any) => {
      if (e.webkitCompassHeading) {
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const diff = Math.abs(heading - qiblaAngle);
  const isTargeted = diff < 5 || diff > 355;

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-12 px-8 h-full bg-[#F8FAFC]">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kıble</h2>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Tam Yönünüzü Belirleyin</p>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Background Radial Glow */}
        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${isTargeted ? 'bg-gold-400' : 'bg-slate-300'}`}></div>
        
        {/* Compass Dial */}
        <div 
          className="relative w-72 h-72 bg-white dark:bg-slate-900 rounded-full shadow-2xl border-[12px] border-slate-100 dark:border-slate-800 flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          {/* Degree Ticks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <div key={deg} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${deg}deg)` }}>
              <div className={`h-full flex flex-col justify-between py-4 ${deg % 90 === 0 ? 'opacity-100' : 'opacity-20'}`}>
                <span className={`text-[10px] font-black ${deg === 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                   {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : '|'}
                </span>
                <span className="w-px h-2 bg-slate-200"></span>
              </div>
            </div>
          ))}

          {/* Qibla Marker */}
          <div 
            className="absolute w-20 h-20 flex flex-col items-center transition-all duration-300"
            style={{ transform: `rotate(${qiblaAngle}deg) translateY(-120px)` }}
          >
            <div className={`text-4xl drop-shadow-2xl transition-transform ${isTargeted ? 'scale-125 animate-bounce' : 'scale-100 opacity-60'}`}>🕋</div>
          </div>

          {/* Center Indicator */}
          <div className="w-1.5 h-40 bg-slate-100 dark:bg-slate-800 rounded-full relative">
            <div className="absolute top-0 w-3 h-20 bg-rose-500 rounded-t-full -left-0.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]"></div>
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-900 shadow-xl z-10"></div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className={`p-6 rounded-[2rem] border transition-all duration-700 text-center ${
          isTargeted 
            ? 'bg-gold-600 border-gold-500 text-white shadow-xl shadow-gold-200' 
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Durum</p>
          <p className="text-xl font-black">{isTargeted ? 'DOĞRU YÖNDESİNİZ' : 'YÖN ARANIYOR'}</p>
        </div>
        
        <div className="flex justify-between items-center px-4">
           <div className="text-center">
              <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Açı</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{qiblaAngle.toFixed(1)}°</p>
           </div>
           <div className="h-6 w-px bg-slate-100 dark:bg-slate-800"></div>
           <div className="text-center">
              <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Sapma</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{diff.toFixed(1)}°</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default KibleCompass;