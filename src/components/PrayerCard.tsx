
import React from 'react';

interface PrayerCardProps {
  name: string;
  time: string;
  isActive: boolean;
  icon: string;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isActive, icon }) => {
  return (
    <div className={`group relative px-6 py-5 rounded-[2.2rem] flex items-center justify-between transition-all duration-500 border cursor-pointer ${
      isActive 
        ? 'bg-white border-teal-500 shadow-xl shadow-teal-900/5 ring-1 ring-teal-500 scale-[1.03] z-10' 
        : 'bg-white border-slate-100 hover:border-teal-100 hover:bg-slate-50/50'
    }`}>
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 ${
          isActive 
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 rotate-3' 
            : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'
        }`}>
          <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        </div>
        <div>
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-1 ${isActive ? 'text-teal-600' : 'text-slate-300'}`}>
            {name}
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{time}</p>
        </div>
      </div>
      
      {isActive ? (
        <div className="flex flex-col items-end gap-1">
          <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">Aktif</span>
          <span className="text-[9px] font-bold text-teal-600/40 uppercase tracking-tighter">Vakit Çıkıyor</span>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full border border-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 bg-white shadow-sm">
          <span className="text-teal-600 text-sm font-bold">→</span>
        </div>
      )}
    </div>
  );
};

export default PrayerCard;