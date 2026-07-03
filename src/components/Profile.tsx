import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../types';
import { useUserData } from '../contexts/UserDataContext';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onLogout: () => void;
}

type ProfileView = 'main' | 'notif_detail' | 'mosque_detail';
type SettingType = 'notifications' | 'location' | 'language' | 'theme' | 'rate' | 'sound' | 'none';

interface SoundItem {
  id: string;
  name: string;
  sub: string;
  icon: string;
  url: string;
  category: 'doğa' | 'ezan' | 'klasik';
  // Added optional label property to fix line 30 error
  label?: string;
}

// Added missing AVATAR_OPTIONS constant for line 419
const AVATAR_OPTIONS = ['👤', '🧔', '🧕', '👦', '👧', '👴', '👵', '🕌', '🌙', '✨'];

const NOTIF_SOUNDS: SoundItem[] = [
  { id: 'bird', name: 'Kuş Cıvıltısı', sub: 'Sabah Tazeliği', icon: '🐦', category: 'doğa', url: 'https://assets.mixkit.co/active_storage/sfx/131/131-preview.mp3' },
  { id: 'water', name: 'Şelale', sub: 'Huzurlu Akış', icon: '💧', category: 'doğa', url: 'https://assets.mixkit.co/active_storage/sfx/2407/2407-preview.mp3' },
  { id: 'wind', name: 'Rüzgar Sesi', sub: 'Dağ Esintisi', icon: '🌬️', category: 'doğa', url: 'https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3' },
  { id: 'ussak', name: 'Uşşak Ezanı', sub: 'İstanbul Usulü', icon: '🕌', category: 'ezan', url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Azan+Istanbul&filename=mt/mtyzodkzmtm3mtyzodk0_vOQ_2buK_2blO0.MP3' },
  { id: 'saba', name: 'Saba Ezanı', sub: 'Huzur ve Huşu', icon: '✨', category: 'ezan', url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Azan+Saba&filename=mt/mtyzodkzmtm3mtyzodk0_vOQ_2buK_2blO0.MP3' },
  { id: 'mekke', name: 'Hicaz Ezanı', label: 'Mekke Usulü', sub: 'Haremeyn Esintisi', icon: '🕋', category: 'ezan', url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Azan+Makkah&filename=mt/mtyzodkzmtm3mtyzodk0_vOQ_2buK_2blO0.MP3' },
  { id: 'ding', name: 'Klasik Ding', sub: 'Yalın Bildirim', icon: '🔔', category: 'klasik', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
];

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, isDark, setIsDark, onLogout }) => {
  const { getField, setField } = useUserData();
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [selectedSoundId, setSelectedSoundId] = useState(() => getField('pref_notif_sound_id', 'ussak'));
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const [zikirCount] = useState(() => Number(getField('serbest_count', 0)));

  // --- ÜYELİK DURUMU ---
  // NOT: Satın alma akışı şu an simülasyon (aşağıdaki handleStartPurchase).
  // Play Store'a çıkmadan önce bunun yerine Google Play Billing (uygulama
  // içi satın alma) entegre edilmeli — aksi halde gerçek para tahsilatı
  // yapılamaz. premiumManager.ts içindeki checkIsPremium/addTwelveHours
  // fonksiyonları gerçek ödeme onayı geldiğinde (ör. bir sunucu/Cloud
  // Function üzerinden) çağrılmalı.
  const [isPremium, setIsPremium] = useState(() => getField('is_premium_user', false));
  const [showPremiumPage, setShowPremiumPage] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'1m' | '3m' | '6m'>('6m');

  // --- BİLDİRİM AYARLARI ---
  const [notifMaster, setNotifMaster] = useState(() => getField('notif_master', true));
  const [notifPush, setNotifPush] = useState(() => getField('notif_push', true));
  const [notifVibrate, setNotifVibrate] = useState(() => getField('notif_vibrate', true));

  // --- AKILLI İBADET MODU ---
  const [mosqueGeofencing, setMosqueGeofencing] = useState(() => getField('mode_mosque_gps', false));
  const [fridaySilence, setFridaySilence] = useState(() => getField('mode_friday_silence', false));
  const [locationPermitted, setLocationPermitted] = useState(false);

  // Ayar Durumları
  const [locationPref, setLocationPref] = useState(() => getField('pref_loc', 'Otomatik'));
  const [languagePref, setLanguagePref] = useState(() => getField('pref_lang', 'Türkçe'));

  // Modal Durumları
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<SettingType>('none');

  // Düzenleme Formu Durumları
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editAvatar, setEditAvatar] = useState(user.avatar || user.name[0]?.toUpperCase() || '👤');

  // Removed 'location' from settingItems as requested
  const settingItems = useMemo(() => [
    { id: 'notifications' as SettingType, label: 'Ses & Bildirim', icon: '🔔', color: 'bg-indigo-500', val: selectedSoundId, options: [] },
    { id: 'language' as SettingType, label: 'Dil Seçimi', icon: '🌍', color: 'bg-blue-500', val: languagePref, options: ['Türkçe', 'English', 'Arabic', 'Urdu'] },
    { id: 'theme' as SettingType, label: 'Gece Modu', icon: '🌙', color: 'bg-slate-800', val: isDark ? 'Açık' : 'Kapalı', options: [] },
    { id: 'rate' as SettingType, label: 'Bizi Puanlayın', icon: '⭐', color: 'bg-amber-500', val: 'V5.0', isLink: true, options: [] },
  ], [selectedSoundId, languagePref, isDark]);

  // Added handleStartPurchase function for line 389 fix
  const handleStartPurchase = () => {
    setIsPurchasing(true);
    setTimeout(() => {
      setIsPurchasing(false);
      setPurchaseSuccess(true);
      setIsPremium(true);
      setField('is_premium_user', true);
    }, 1500);
  };

  // Added handleSaveProfile function for line 425 fix
  const handleSaveProfile = () => {
    onUpdateUser({ ...user, name: editName, email: editEmail, avatar: editAvatar });
    setIsEditModalOpen(false);
  };

  // Added requestLocation function for lines 480, 492 fix
  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermitted(true);
        setMosqueGeofencing(true);
      },
      () => {
        setLocationPermitted(false);
      }
    );
  };

  useEffect(() => {
    setField('notif_master', notifMaster);
    setField('notif_push', notifPush);
    setField('notif_vibrate', notifVibrate);
    setField('mode_mosque_gps', mosqueGeofencing);
    setField('mode_friday_silence', fridaySilence);
    setField('pref_notif_sound_id', selectedSoundId);
  }, [notifMaster, notifPush, notifVibrate, mosqueGeofencing, fridaySilence, selectedSoundId]);

  useEffect(() => {
    setField('pref_loc', locationPref);
    setField('pref_lang', languagePref);
  }, [locationPref, languagePref]);

  const togglePreview = (sound: SoundItem) => {
    if (previewingId === sound.id) {
      audioRef.current.pause();
      setPreviewingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = sound.url;
      audioRef.current.play().catch(e => console.log("Audio play error:", e));
      setPreviewingId(sound.id);
      audioRef.current.onended = () => setPreviewingId(null);
    }
  };

  const selectSound = (id: string) => {
    setSelectedSoundId(id);
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  const renderNotifDetail = () => (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] dark:bg-slate-950 animate-in slide-in-from-right duration-500 overflow-hidden">
       {/* Compact Header */}
       <div className="px-6 pt-12 pb-4 flex items-center gap-5 border-b border-slate-50 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => { setCurrentView('main'); audioRef.current.pause(); setPreviewingId(null); }} className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Ses & Bildirim</h2>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Gelişmiş Ses Kütüphanesi</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-6 pt-6 pb-40 space-y-10 no-scrollbar">
          
          {/* Main Toggle Card */}
          <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between ${notifMaster ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-900/20 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}>
             <div className="space-y-1">
                <h4 className="text-[15px] font-black tracking-tight leading-none uppercase">Bildirimleri Yönet</h4>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${notifMaster ? 'opacity-70' : 'opacity-40'}`}>Tüm Uygulama Sesleri</p>
             </div>
             <button 
               onClick={() => setNotifMaster(!notifMaster)}
               className={`w-14 h-8 rounded-full transition-all relative ${notifMaster ? 'bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
             >
                <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${notifMaster ? 'right-1 bg-emerald-600 shadow-md' : 'left-1 bg-white opacity-40'}`}></div>
             </button>
          </div>

          <div className={`space-y-10 transition-all duration-500 ${!notifMaster ? 'opacity-30 grayscale pointer-events-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
             
             {/* Sound Library Grid */}
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">SES KÜTÜPHANESİ</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   {['ezan', 'doğa', 'klasik'].map(cat => (
                      <div key={cat} className="space-y-3">
                         <h5 className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] ml-2 mt-4">{cat === 'ezan' ? 'MÜEZZİN MAKAMLARI' : cat === 'doğa' ? 'ATMOSFERİK SESLER' : 'STANDART'}</h5>
                         {NOTIF_SOUNDS.filter(s => s.category === cat).map(sound => {
                            const isSelected = selectedSoundId === sound.id;
                            const isPlaying = previewingId === sound.id;
                            return (
                               <div 
                                 key={sound.id}
                                 onClick={() => selectSound(sound.id)}
                                 className={`p-4 rounded-[1.8rem] border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.99] ${isSelected ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-lg ring-4 ring-emerald-500/5' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800'}`}
                               >
                                  <div className="flex items-center gap-4">
                                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30 shadow-inner' : 'bg-slate-50 dark:bg-slate-800/50 opacity-50'}`}>
                                        {sound.icon}
                                     </div>
                                     <div>
                                        <h6 className={`text-[14px] font-black tracking-tight leading-none ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{sound.name}</h6>
                                        <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">{sound.sub}</p>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); togglePreview(sound); }}
                                       className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500'}`}
                                     >
                                        {isPlaying ? (
                                           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                        ) : (
                                           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                        )}
                                     </button>
                                     {isSelected && (
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-300">
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   ))}
                </div>
             </div>

             {/* Haptic & Feedback */}
             <div className="space-y-4">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2">GERİ BİLDİRİM</p>
                <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-50 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden shadow-sm">
                   <div className="flex items-center justify-between p-5 px-6">
                      <div className="flex items-center gap-4"><div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 rounded-xl flex items-center justify-center text-lg">📳</div><span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Titreşimle Uyarma</span></div>
                      <input type="checkbox" checked={notifVibrate} onChange={() => setNotifVibrate(!notifVibrate)} className="w-5 h-5 rounded-lg border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800" />
                   </div>
                </div>
             </div>

          </div>

          <div className="text-center pb-10 opacity-20">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.6em]">MÜBAREKÇE AUDIO ENGINE V5.0</p>
          </div>
       </div>
    </div>
  );

  const renderMainView = () => (
    <div className="flex-1 overflow-y-auto px-6 pt-12 pb-40 space-y-8 bg-[#fdfdfd] dark:bg-slate-950 transition-colors duration-300 no-scrollbar relative animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Hesabım</h2>
        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>

      {/* DİNAMİK MÜBAREKÇE KİMLİK KARTI */}
      <div 
        className={`aspect-[1.58/1] w-full rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-700 border border-white/10 group ${
          isPremium 
            ? 'bg-gradient-to-br from-emerald-900 to-[#022c22] shadow-emerald-900/40' 
            : 'bg-gradient-to-br from-slate-800 to-slate-950 shadow-slate-900/40'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25Z' fill='%23ffffff'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none transition-transform duration-1000 group-hover:translate-x-20"></div>
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700 ${isPremium ? 'bg-amber-400 opacity-30' : 'bg-slate-400 opacity-20'}`}></div>
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className={`w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl transition-all duration-700 ${isPremium ? 'ring-2 ring-amber-400/40' : 'ring-2 ring-white/10'}`}>
               <span className={`text-2xl font-black ${isPremium ? 'text-amber-400' : 'text-white'}`}>{user.avatar || user.name[0]?.toUpperCase()}</span>
            </div>
            {isPremium ? (
              <div className="bg-amber-400 text-emerald-950 text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-black/20 flex items-center gap-1.5 border border-white/20">
                <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-pulse"></span>PREMİUM ÜYE
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-white/10">STANDART</div>
            )}
          </div>
          
          <div className="space-y-0.5">
            <h3 className="text-xl font-black tracking-tight uppercase leading-none drop-shadow-md truncate">{user.name}</h3>
            <p className={`text-[10px] font-medium tracking-widest truncate ${isPremium ? 'text-emerald-300/80' : 'text-slate-400'}`}>{user.email}</p>
            {isPremium && (
              <div className="pt-2 flex items-center gap-2 animate-in fade-in slide-in-from-left duration-700">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wide">Premium bitimine <span className="text-amber-400 font-black">214 Gün</span> kaldı</p>
              </div>
            )}
          </div>

          <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 w-11 h-11 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-90 group/edit shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/edit:rotate-12 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          
          <div className="absolute right-[-15px] bottom-8 opacity-[0.04] scale-[2.5] pointer-events-none rotate-[-15deg] transition-colors duration-700"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg></div>
        </div>
      </div>

      {/* MANEVİ İSTATİSTİKLER */}
      <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
         <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 text-center space-y-1">
            <p className="text-[18px] font-black text-emerald-600 tracking-tighter tabular-nums">7</p>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">İSTİKRAR</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 text-center space-y-1">
            <p className="text-[18px] font-black text-sky-600 tracking-tighter tabular-nums">%12</p>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">HATİM</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800 text-center space-y-1">
            <p className="text-[18px] font-black text-amber-600 tracking-tighter tabular-nums">{zikirCount}</p>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ZİKİR</p>
         </div>
      </div>

      {/* AKILLI İBADET MODU SHORTCUT CARD */}
      <div 
        onClick={() => setCurrentView('mosque_detail')}
        className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-900/10 text-white flex items-center justify-between gap-4 animate-in slide-in-from-left duration-700 delay-150 border border-white/10 relative overflow-hidden group cursor-pointer active:scale-95 transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="space-y-1 relative z-10 flex-1">
           <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60">PRO+ ÖZELLİK</p>
           </div>
           <h4 className="text-[15px] font-black tracking-tight leading-none uppercase">İbadet Modu</h4>
           <p className="text-[10px] font-medium text-emerald-300/80 leading-tight mt-1.5">GPS destekli akıllı sessiz modu keşfedin.</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 transition-transform group-hover:rotate-12 relative z-10">📍</div>
      </div>

      {/* PREMIUM UPSELL CARD */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-[2.5rem] shadow-xl shadow-orange-500/20 text-white flex items-center justify-between gap-4 animate-in slide-in-from-right duration-700 delay-200 border-b-4 border-orange-700 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
           <div className="space-y-1 relative z-10">
              <h4 className="text-[14px] font-black tracking-tight leading-none">Mübarekçe PRO+ ile Sınırsız Erişim!</h4>
              <p className="text-[10px] font-medium opacity-80 leading-tight">Reklamsız deneyim, Hafızlık modu ve detaylı analizler.</p>
           </div>
           <button onClick={() => setShowPremiumPage(true)} className="px-6 py-3 bg-white text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-90 transition-transform hover:bg-orange-50 relative z-10">YÜKSELT</button>
        </div>
      )}

      {/* AYARLAR MENÜSÜ */}
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4">GENEL AYARLAR</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 shadow-sm divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
           {settingItems.map((item) => (
             <div 
               key={item.id} 
               onClick={() => { 
                 if (item.id === 'theme') { setIsDark(!isDark); if (window.navigator.vibrate) window.navigator.vibrate(20); } 
                 else if (item.id === 'notifications') { setCurrentView('notif_detail'); }
                 else if ('isLink' in item && item.isLink) alert("Desteğiniz için teşekkürler!"); 
                 else { setActiveModal(item.id); } 
               }} 
               className="flex items-center justify-between p-4 px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer active:bg-slate-100"
             >
               <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>{item.icon}</div>
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${item.id === 'theme' && isDark ? 'text-emerald-500' : 'text-slate-400'}`}>{item.val}</span>
                  {item.id !== 'theme' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-800"><polyline points="9 18 15 12 9 6"/></svg>}
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* ÇIKIŞ BUTONU */}
      <div className="pt-4 flex justify-center animate-in fade-in duration-1000">
         <button onClick={onLogout} className="px-10 py-3.5 bg-rose-50 dark:bg-rose-950/10 text-rose-500 hover:text-rose-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100 dark:border-rose-900/30 active:scale-95 transition-all shadow-sm">Oturumu Kapat</button>
      </div>

      {/* PREMIUM PURCHASE PAGE */}
      {showPremiumPage && (
        <div className="fixed inset-0 z-[1000] bg-[#fdfdfd] dark:bg-slate-950 flex flex-col h-full overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-500">
           {/* Success Overlay */}
           {purchaseSuccess && (
             <div className="absolute inset-0 bg-emerald-700 z-[1100] flex flex-col items-center justify-center text-white p-10 animate-in fade-in zoom-in duration-500 text-center">
               <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-6xl animate-bounce mb-8 shadow-2xl">💎</div>
               <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">HAYIRLI OLSUN!</h2>
               <p className="text-emerald-100 text-sm font-bold leading-relaxed mb-12">Artık Mübarekçe Pro+ üyesisiniz. Tüm özellikler hesabınıza tanımlandı.</p>
               <button onClick={() => { setShowPremiumPage(false); setPurchaseSuccess(false); }} className="w-full py-5 bg-white text-emerald-700 font-black rounded-[2rem] text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">KİMLİK KARTIMI GÖSTER</button>
             </div>
           )}

           {/* 1. COMPACT ELITE HEADER */}
           <div className="pt-8 px-6 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowPremiumPage(false)} 
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 active:scale-90 shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50 flex items-center gap-2 shadow-sm">
                   <span className="text-amber-600 text-xs animate-pulse">👑</span>
                   <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">ELİTE ÜYELİK</span>
                </div>
              </div>
              <div className="text-left">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Mübarekçe Premium</h2>
                 <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1">Reklamsız ve sınırsız maneviyat deneyimi.</p>
              </div>
           </div>

           {/* 2. COMPACT ELITE PRICING CARDS */}
           <div className="px-6 flex-1 flex flex-col justify-center gap-2 py-4">
              <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] ml-1 mb-1">PAKETİNİZİ BELİRLEYİN</p>
              <div onClick={() => setSelectedPlan('6m')} className={`h-[88px] rounded-[1.8rem] border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between px-5 ${selectedPlan === '6m' ? 'bg-[#064e3b] border-[#064e3b] shadow-xl shadow-emerald-900/20 ring-4 ring-emerald-500/5' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                <div className="absolute top-0 right-6 bg-[#fbbf24] text-[#064e3b] text-[6.5px] font-black px-3 py-0.5 rounded-b-lg uppercase tracking-widest z-10 shadow-md">EN ÇOK TERCİH EDİLEN</div>
                <div className="space-y-0.5">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${selectedPlan === '6m' ? 'text-emerald-300' : 'text-emerald-600'}`}>6 AYLIK PLAN</p>
                  <h4 className={`text-2xl font-black tracking-tighter ${selectedPlan === '6m' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>₺149</h4>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === '6m' ? 'border-white bg-white text-emerald-700' : 'border-slate-100 dark:border-slate-700'}`}>{selectedPlan === '6m' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              </div>
              <div onClick={() => setSelectedPlan('3m')} className={`h-[88px] rounded-[1.8rem] border-2 transition-all cursor-pointer flex items-center justify-between px-5 ${selectedPlan === '3m' ? 'bg-[#064e3b] border-[#064e3b] shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                <div className="space-y-0.5">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${selectedPlan === '3m' ? 'text-emerald-300' : 'text-emerald-600'}`}>3 AYLIK PLAN</p>
                  <h4 className={`text-2xl font-black tracking-tighter ${selectedPlan === '3m' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>₺99</h4>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === '3m' ? 'border-white bg-white text-emerald-700' : 'border-slate-100 dark:border-slate-700'}`}>{selectedPlan === '3m' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><polyline points="20 6 9 17 4 12"/></svg>}</div>
              </div>
           </div>

           {/* 4. MAIN CTA BUTTON */}
           <div className="px-6 space-y-3 pt-4 shrink-0">
              <button onClick={handleStartPurchase} disabled={isPurchasing} className="w-full h-16 bg-[#064e3b] hover:bg-[#042f24] text-white font-black text-[14px] uppercase tracking-[0.25em] rounded-[2rem] shadow-2xl shadow-emerald-900/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isPurchasing ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'PREMİUM\'A GEÇ VE BAŞLA'}
              </button>
              <div className="flex items-center justify-center gap-2 text-slate-300 dark:text-slate-700"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span className="text-[7.5px] font-black uppercase tracking-[0.2em]">Güvenli Ödeme • App Store & Play Store</span></div>
           </div>
        </div>
      )}

      {/* Modals for settings */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[3.5rem] p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500 shadow-2xl border-t border-white/5">
              <div className="flex justify-center mb-2"><div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"></div></div>
              <div className="text-center"><h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{settingItems.find(s => s.id === activeModal)?.label}</h3></div>
              <div className="grid grid-cols-1 gap-2.5 pb-8">
                 {settingItems.find(s => s.id === activeModal)?.options?.map(opt => (
                   <button key={opt} onClick={() => { if (activeModal === 'language') setLanguagePref(opt); setActiveModal('none'); }} className={`p-5 rounded-[1.8rem] border-2 text-left flex items-center justify-between transition-all active:scale-95 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400`}><span className="font-black text-[11px] uppercase tracking-widest">{opt}</span></button>
                 ))}
              </div>
              <button onClick={() => setActiveModal('none')} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-lg">KAPAT</button>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-8 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative border border-white/10">
            <div className="text-center"><h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">KİMLİĞİ DÜZENLE</h3></div>
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto no-scrollbar py-1">{AVATAR_OPTIONS.map(ava => ( <button key={ava} onClick={() => setEditAvatar(ava)} className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all border-2 ${editAvatar === ava ? 'bg-emerald-50 border-emerald-600 scale-110 shadow-lg' : 'bg-slate-50 border-transparent dark:bg-slate-800 opacity-60'}`}>{ava}</button> ))}</div>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white shadow-inner" placeholder="İsim..." />
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 dark:text-white shadow-inner" placeholder="E-posta..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black rounded-3xl text-[10px] uppercase">İPTAL</button>
              <button onClick={handleSaveProfile} className="flex-[2] py-4.5 bg-emerald-600 text-white font-black rounded-3xl text-[10px] uppercase shadow-xl">GÜNCELLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMosqueDetail = () => (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] dark:bg-slate-950 animate-in slide-in-from-right duration-500">
       <div className="px-6 pt-12 pb-6 flex items-center gap-5 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => setCurrentView('main')} className="w-11 h-11 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 active:scale-90 transition-transform">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">İbadet Modu</h2>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Akıllı Cami Algoritması</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-10 no-scrollbar">
          {/* Main Visual Header */}
          <div className="bg-[#064e3b] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
             <div className="absolute right-[-10%] top-[-10%] text-[12rem] opacity-[0.04] pointer-events-none rotate-12">🕌</div>
             <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                   <h4 className="text-2xl font-black tracking-tighter leading-none">Huzurlu İbadet</h4>
                   <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest italic opacity-80">"Namaz müminin miracıdır."</p>
                </div>
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 space-y-4">
                   <p className="text-[12px] font-medium leading-relaxed">Bu mod, camiye girdiğinizde veya belirli vakitlerde telefonunuzu otomatik olarak sessize alarak ibadetinize odaklanmanızı sağlar.</p>
                   <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${mosqueGeofencing || fridaySilence ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-400'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{mosqueGeofencing || fridaySilence ? 'SİSTEM AKTİF' : 'BEKLEMEDE'}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Features Section */}
          <div className="space-y-5">
             <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2">AKILLI ÖZELLİKLER</p>
             
             {/* GPS Geofencing Feature */}
             <div className={`p-8 rounded-[2.8rem] border-2 transition-all group ${mosqueGeofencing ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-900/5' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale opacity-60'}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-emerald-100/50">📍</div>
                      <div>
                         <h5 className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight">Akıllı Cami Takibi</h5>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPS TABANLI SESSİZE ALMA</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => {
                        if (!mosqueGeofencing) requestLocation();
                        setMosqueGeofencing(!mosqueGeofencing);
                     }}
                     className={`w-14 h-8 rounded-full transition-all relative ${mosqueGeofencing ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${mosqueGeofencing ? 'right-1 bg-white shadow-md' : 'left-1 bg-white opacity-40'}`}></div>
                   </button>
                </div>
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed px-1">Cami veya mescit alanına girdiğinizde uygulama bildirimleri otomatik olarak sessize alınır. (Konum izni gerektirir)</p>
                {mosqueGeofencing && !locationPermitted && (
                   <div className="mt-5 p-3.5 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                      <span className="animate-bounce">⚠️</span>
                      <button onClick={requestLocation} className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest underline decoration-2">KONUM İZNİ VERİN</button>
                   </div>
                )}
             </div>

             {/* Friday Silence Feature */}
             <div className={`p-8 rounded-[2.8rem] border-2 transition-all group ${fridaySilence ? 'bg-white dark:bg-slate-900 border-sky-500 shadow-xl shadow-sky-900/5' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale opacity-60'}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-sky-50 dark:bg-sky-950/30 text-sky-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-sky-100/50">🕊️</div>
                      <div>
                         <h5 className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight">Cuma Günü Modu</h5>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HAFTALIK OTOMATİK SESSİZ</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setFridaySilence(!fridaySilence)}
                     className={`w-14 h-8 rounded-full transition-all relative ${fridaySilence ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${fridaySilence ? 'right-1 bg-white shadow-md' : 'left-1 bg-white opacity-40'}`}></div>
                   </button>
                </div>
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed px-1">Cuma günleri (00:00 - 23:59 arası) telefonunuzun bildirim sesleri uygulama üzerinden otomatik olarak kısıtlanır.</p>
             </div>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-5">
             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">💎</div>
             <div className="space-y-1">
                <h6 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">BİLGİ NOTU</h6>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "Bu özelliklerin tam verimli çalışması için telefonunuzun ayarlarından 'Rahatsız Etme' (Do Not Disturb) erişimine izin vermeniz önerilir."
                </p>
             </div>
          </div>
       </div>
    </div>
  );

  // Switch View Rendering
  switch (currentView) {
    case 'notif_detail': return renderNotifDetail();
    case 'mosque_detail': return renderMosqueDetail();
    default: return renderMainView();
  }
};

export default Profile;