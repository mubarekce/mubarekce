
import React, { useState, useEffect } from 'react';
import { resetAllScroll } from '../utils/scrollReset';
import QuranReader from './QuranReader';
import Zikirmatik from './Zikirmatik';
import KibleCompass from './KibleCompass';
import EsmaulHusna from './EsmaulHusna';
import AyetBulucu from './AyetBulucu';
import HafizlikModu from './HafizlikModu';
import ElifBa from './ElifBa';
import TecvidHocasi from './TecvidHocasi';
import HatimOrganizatoru from './HatimOrganizatoru';
import KazaTakibi from './KazaTakibi';
import CevsenKebir from './CevsenKebir';
import RuyaTabiri from './RuyaTabiri';
import UykuTefekkur from './UykuTefekkur';
import AileModu from './AileModu';
import KutubSitte from './KutubSitte';
import ProphetsList from './ProphetsList';
import IslamHistory from './IslamHistory';
import FortyHadith from './FortyHadith';
import HelalScanner from './HelalScanner';
import ZekatHesapla from './ZekatHesapla';
import RamazanOzel from './RamazanOzel';
import NamazRehberi from './NamazRehberi';
import LiveStreams from './LiveStreams';
import ReligiousRadios from './ReligiousRadios';
import FridayMessages from './FridayMessages';
import CamiBul from './CamiBul';
import { LocationData } from '../types';
import { useUserData } from '../contexts/UserDataContext';
import { AppConfig, DEFAULT_APP_CONFIG, subscribeAppConfig } from '../services/appConfig';

interface LibraryTool {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cat: string;
  color: string;
  glowColor: string;
}

const IconWrapper = ({ children }: { children?: React.ReactNode }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

import { User } from '../types';
  const Library: React.FC<{ location?: LocationData | null; user: User }> = ({ location, user }) => {
  const { getField } = useUserData();
  const isPremium = getField('is_premium_user', false);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [lockedAttempt, setLockedAttempt] = useState<LibraryTool | null>(null);
  const [showRamadanLocked, setShowRamadanLocked] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppConfig(setAppConfig);
    return () => unsub();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'quran' | 'zikir' | 'kible' | 'esma' | 'ayet-bul' | 'hafizlik' | 'elifba' | 'tecvid' | 'hatim-org' | 'kaza' | 'cevsen' | 'ruya' | 'uyku' | 'aile' | 'kutubsitte' | 'peygamberler' | 'tarih' | 'forty-hadis' | 'helal-scanner' | 'zekat-hesapla' | 'ramazan-ozel' | 'abdest' | 'live-streams' | 'radyo' | 'friday-messages' | 'camiler' | 'detail'>('grid');

  useEffect(() => {
    resetAllScroll();
    const id = requestAnimationFrame(resetAllScroll);
    return () => cancelAnimationFrame(id);
  }, [view]);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [selectedTool, setSelectedTool] = useState<LibraryTool | null>(null);

  // Ana navigasyon sıfırlama sinyalini dinle
  useEffect(() => {
    const handleReset = () => setView('grid');
    window.addEventListener('resetLibraryView', handleReset);
    return () => window.removeEventListener('resetLibraryView', handleReset);
  }, []);

  // Ana sayfadaki zikir kartından yönlendirme gelip gelmediğini kontrol et
  useEffect(() => {
    const shouldGoToZikir = localStorage.getItem('goto_zikirmatik');
    if (shouldGoToZikir === 'true') {
      setView('zikir');
      localStorage.removeItem('goto_zikirmatik');
    }
  }, []);

  const tools: LibraryTool[] = [
    // --- KURAN AKADEMİSİ ---
    { 
      id: 'quran', 
      icon: <IconWrapper><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></IconWrapper>, 
      title: 'Kuran-ı Kerim', desc: 'Sesli, Meal & Arapça', cat: 'Kuran Akademisi', color: 'text-teal-500', glowColor: 'rgba(20,184,166,0.5)' 
    },
    { 
      id: 'tecvid-hoca', 
      icon: <IconWrapper><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></IconWrapper>, 
      title: 'Tecvid Hocası', desc: 'AI ile Ses Analizi', cat: 'Kuran Akademisi', color: 'text-blue-500', glowColor: 'rgba(59,130,246,0.5)' 
    },
    { 
      id: 'hafizlik-modu', 
      icon: <IconWrapper><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconWrapper>, 
      title: 'Hafızlık Modu', desc: 'Akıllı Ezber Algoritması', cat: 'Kuran Akademisi', color: 'text-sky-500', glowColor: 'rgba(14,165,233,0.5)' 
    },
    { 
      id: 'elifba', 
      icon: <IconWrapper><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></IconWrapper>, 
      title: 'Elif Ba', desc: 'Kuran Öreniyorum', cat: 'Kuran Akademisi', color: 'text-green-600', glowColor: 'rgba(22,163,74,0.5)' 
    },
    { 
      id: 'ayet-bul', 
      icon: <IconWrapper><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IconWrapper>, 
      title: 'Ayet Bulucu', desc: 'Sesli Ayet Tanıma', cat: 'Kuran Akademisi', color: 'text-indigo-500', glowColor: 'rgba(99,102,241,0.5)' 
    },

    // --- İBADET MERKEZİ ---
    { 
      id: 'zikir', 
      icon: <IconWrapper><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></IconWrapper>, 
      title: 'Zikirmatik', desc: 'Akıllı Tesbihat', cat: 'İbadet Merkezi', color: 'text-teal-500', glowColor: 'rgba(20,184,166,0.5)' 
    },
    { 
      id: 'hatim-org', 
      icon: <IconWrapper><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconWrapper>, 
      title: 'Hatim Organizatörü', desc: 'Grup Hatim Yönetimi', cat: 'İbadet Merkezi', color: 'text-teal-500', glowColor: 'rgba(20,184,166,0.5)' 
    },
    { 
      id: 'kaza', 
      icon: <IconWrapper><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></IconWrapper>, 
      title: 'Kaza Takibi', desc: 'Namaz & Oruç Çetelesi', cat: 'İbadet Merkezi', color: 'text-orange-500', glowColor: 'rgba(249,115,22,0.5)' 
    },
    { 
      id: 'esma', 
      icon: <IconWrapper><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></IconWrapper>, 
      title: 'Esmaül Hüsna', desc: '99 İsim ve Fazileti', cat: 'İbadet Merkezi', color: 'text-purple-500', glowColor: 'rgba(168,85,247,0.5)' 
    },
    { 
      id: 'cevsen', 
      icon: <IconWrapper><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>, 
      title: 'Cevşen-ül Kebir', desc: 'Koruyucu Dualar', cat: 'İbadet Merkezi', color: 'text-indigo-500', glowColor: 'rgba(99,102,241,0.5)' 
    },

    // --- MANEVİ GELİŞİM & AI ---
    { 
      id: 'sanal-bahce', 
      icon: <IconWrapper><path d="M12 2L12 12"/><path d="M12 22V12"/><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10-10-4.48-10-10z"/></IconWrapper>, 
      title: 'Sanal Bahçem', desc: 'İbadetle Büyüyen Bahçe', cat: 'Manevi Gelişim', color: 'text-green-500', glowColor: 'rgba(34,197,94,0.5)' 
    },
    { 
      id: 'ruya-tabiri', 
      icon: <IconWrapper><path d="M12 2l.642 2.006 2.108.022-1.693 1.25.66 2.097-1.717-1.218-1.717 1.218.66-2.097-1.693-1.25 2.108-.022L12 2z"/><path d="M21 15a3 3 0 0 0-3-3h-1v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8.5z"/></IconWrapper>, 
      title: 'Rüya Tabiri', desc: 'Sahih Kaynaklı AI Yorumu', cat: 'Manevi Gelişim', color: 'text-fuchsia-500', glowColor: 'rgba(217,70,239,0.5)' 
    },
    { 
      id: 'uyku-modu', 
      icon: <IconWrapper><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></IconWrapper>, 
      title: 'Uyku & Tefekkür', desc: 'Gece Zikirleri ve Sesler', cat: 'Manevi Gelişim', color: 'text-indigo-600', glowColor: 'rgba(79,70,229,0.5)' 
    },
    { 
      id: 'aile-modu', 
      icon: <IconWrapper><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></IconWrapper>, 
      title: 'Aile Modu', desc: 'Ortak İbadet Takibi', cat: 'Manevi Gelişim', color: 'text-amber-500', glowColor: 'rgba(245,158,11,0.5)' 
    },

    // --- BİLGİ HAZİNESİ ---
    { 
      id: 'hadis', 
      icon: <IconWrapper><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></IconWrapper>, 
      title: 'Kütüb-i Sitte', desc: 'Sahih Hadis Kaynakları', cat: 'Bilgi Hazinesi', color: 'text-amber-600', glowColor: 'rgba(217,119,6,0.5)' 
    },
    { 
      id: 'peygamberler', 
      icon: <IconWrapper><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="12" cy="10" r="2"/></IconWrapper>, 
      title: 'Peygamberler', desc: 'Kıssalar ve Hayatlar', cat: 'Bilgi Hazinesi', color: 'text-yellow-600', glowColor: 'rgba(202,138,4,0.5)' 
    },
    { 
      id: 'tarih', 
      icon: <IconWrapper><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></IconWrapper>, 
      title: 'İslam Tarihi', desc: 'Önemli Olaylar', cat: 'Bilgi Hazinesi', color: 'text-slate-600', glowColor: 'rgba(71,85,105,0.5)' 
    },
    { 
      id: '40-hadis', 
      icon: <IconWrapper><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3l-4 6 5 12 5-12-4-6z"/><path d="M2 9h20"/></IconWrapper>, 
      title: '40 Hadis', desc: 'Özel Seçki Koleksiyon', cat: 'Bilgi Hazinesi', color: 'text-rose-500', glowColor: 'rgba(244,63,94,0.5)' 
    },

    // --- GÜNKÜK YAŞAM ARAÇLARI ---
    { 
      id: 'helal-tarayici', 
      icon: <IconWrapper><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></IconWrapper>, 
      title: 'Helal Tarayıcı', desc: 'Barkod & İçerik Analizi', cat: 'Günlük Yaşam', color: 'text-rose-600', glowColor: 'rgba(225,29,72,0.5)' 
    },
    { 
      id: 'zekat', 
      icon: <IconWrapper><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconWrapper>, 
      title: 'Zekat Hesapla', desc: 'Varlık Hesap Modülü', cat: 'Günlük Yaşam', color: 'text-yellow-500', glowColor: 'rgba(234,179,8,0.5)' 
    },
    { 
      id: 'ramazan', 
      icon: <IconWrapper><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></IconWrapper>, 
      title: 'Ramazan Özel', desc: 'İftar & Sahur Sayacı', cat: 'Günlük Yaşam', color: 'text-orange-600', glowColor: 'rgba(234,88,12,0.5)' 
    },
    { 
      id: 'abdest', 
      icon: <IconWrapper><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-5c-.5 1-2 3.4-4 5s-3 3.5-3 5.5a7 7 0 0 0 7 7z"/></IconWrapper>, 
      title: 'Namaz Rehberi', desc: 'Sesli Anlatımlar', cat: 'Günlük Yaşam', color: 'text-sky-500', glowColor: 'rgba(14,165,233,0.5)' 
    },

    // --- LOKASYON & MEDYA ---
    { 
      id: 'kible', 
      icon: <IconWrapper><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></IconWrapper>, 
      title: 'Kıble Pusulası', desc: 'Hassas Yön Bulucu', cat: 'Lokasyon & Media', color: 'text-rose-500', glowColor: 'rgba(244,63,94,0.5)' 
    },
    { 
      id: 'camiler', 
      icon: <IconWrapper><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></IconWrapper>, 
      title: 'Yakın Camiler', desc: 'En Yakın Mescitleri Bul', cat: 'Lokasyon & Media', color: 'text-teal-500', glowColor: 'rgba(20,184,166,0.5)' 
    },
    { 
      id: 'kabe-canli', 
      icon: <IconWrapper><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></IconWrapper>, 
      title: 'Kabe Canlı', desc: '7/24 Canlı İzle', cat: 'Lokasyon & Media', color: 'text-slate-900', glowColor: 'rgba(15,23,42,0.5)' 
    },
    { 
      id: 'radyo', 
      icon: <IconWrapper><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><circle cx="12" cy="12" r="2"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></IconWrapper>, 
      title: 'Dini Radyolar', desc: 'Kesintisiz Yayın', cat: 'Lokasyon & Media', color: 'text-pink-500', glowColor: 'rgba(236,72,153,0.5)' 
    },
    { 
      id: 'mesajlar', 
      icon: <IconWrapper><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconWrapper>, 
      title: 'Hayırlı Cumalar', desc: 'Paylaşılabilir Kartlar', cat: 'Lokasyon & Media', color: 'text-cyan-500', glowColor: 'rgba(6,182,212,0.5)' 
    },
  ];

  const categories = [
    'Kuran Akademisi',
    'İbadet Merkezi',
    'Manevi Gelişim',
    'Bilgi Hazinesi',
    'Günlük Yaşam',
    'Lokasyon & Media'
  ];

  const handleToolClick = (tool: LibraryTool) => {
    // Premium kilidi: kategori VEYA tek tek bölüm kilitliyse ve kullanıcı premium değilse durdur
    if ((appConfig.lockedCategories.includes(tool.cat) || appConfig.lockedTools.includes(tool.id)) && !isPremium) {
      setLockedAttempt(tool);
      return;
    }
    // Ramazan Özel: admin panelinden açılmadıysa erişimi engelle
    if (tool.id === 'ramazan' && !appConfig.ramadanModeEnabled) {
      setShowRamadanLocked(true);
      return;
    }
    if (tool.id === 'quran') setView('quran');
    else if (tool.id === 'zikir') setView('zikir');
    else if (tool.id === 'kible') setView('kible');
    else if (tool.id === 'esma') setView('esma');
    else if (tool.id === 'ayet-bul') setView('ayet-bul');
    else if (tool.id === 'hafizlik-modu') setView('hafizlik');
    else if (tool.id === 'elifba') setView('elifba');
    else if (tool.id === 'tecvid-hoca') setView('tecvid');
    else if (tool.id === 'hatim-org') setView('hatim-org');
    else if (tool.id === 'kaza') setView('kaza');
    else if (tool.id === 'cevsen') setView('cevsen');
    else if (tool.id === 'ruya-tabiri') setView('ruya');
    else if (tool.id === 'uyku-modu') setView('uyku');
    else if (tool.id === 'hadis') setView('kutubsitte');
    else if (tool.id === 'peygamberler') setView('peygamberler');
    else if (tool.id === 'tarih') setView('tarih');
    else if (tool.id === '40-hadis') setView('forty-hadis');
    else if (tool.id === 'aile-modu') setView('aile');
    else if (tool.id === 'helal-tarayici') setView('helal-scanner');
    else if (tool.id === 'zekat') setView('zekat-hesapla');
    else if (tool.id === 'ramazan') setView('ramazan-ozel');
    else if (tool.id === 'abdest') setView('abdest');
    else if (tool.id === 'kabe-canli') setView('live-streams');
    else if (tool.id === 'radyo') setView('radyo');
    else if (tool.id === 'mesajlar') setView('friday-messages');
    else if (tool.id === 'camiler') setView('camiler');
    else {
      setSelectedTool(tool);
      setView('detail');
    }
  };

  const filteredTools = tools.filter(t => 
    !appConfig.hiddenTools.includes(t.id) && (
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cat.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const ToolListItem: React.FC<{ tool: LibraryTool }> = ({ tool }) => {
    const locked = (appConfig.lockedCategories.includes(tool.cat) || appConfig.lockedTools.includes(tool.id)) && !isPremium;
    return (
    <div 
      onClick={() => handleToolClick(tool)}
      className="flex items-center gap-5 p-5 bg-gradient-to-br from-teal-50/60 to-white rounded-[2rem] border border-teal-100/40 hover:from-teal-50 hover:border-teal-200 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
    >
      <div 
        className={`transition-all duration-500 group-hover:scale-110 flex-shrink-0 flex items-center justify-center w-12 h-12 ${tool.color}`}
        style={{ filter: `drop-shadow(0 0 8px ${tool.glowColor})` }}
      >
        {tool.icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-black text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">{tool.title} {locked && <span className="text-amber-500 text-xs">🔒</span>}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider opacity-70 mt-0.5">{tool.desc}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  );
  };

  const ToolGridItem: React.FC<{ tool: LibraryTool }> = ({ tool }) => {
    const locked = (appConfig.lockedCategories.includes(tool.cat) || appConfig.lockedTools.includes(tool.id)) && !isPremium;
    return (
    <div 
      onClick={() => handleToolClick(tool)}
      className="bg-gradient-to-br from-teal-50/60 to-white p-6 rounded-[2.5rem] border border-teal-100/40 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.03)] hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer group active:scale-95 text-center flex flex-col items-center relative"
    >
      {locked && <span className="absolute top-4 right-4 text-amber-500 text-xs">🔒</span>}
      <div 
        className={`transition-all duration-500 group-hover:scale-110 flex items-center justify-center w-14 h-14 mb-4 ${tool.color}`}
        style={{ filter: `drop-shadow(0 0 10px ${tool.glowColor})` }}
      >
        <div className="scale-125">{tool.icon}</div>
      </div>
      <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">{tool.title}</h4>
      <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-wider opacity-70 line-clamp-2">{tool.desc}</p>
    </div>
  );
  };

  if (view === 'quran') return <QuranReader onBack={() => setView('grid')} />;
  if (view === 'zikir') return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <button onClick={() => setView('grid')} className="absolute top-12 left-6 z-50 w-10 h-10 bg-white/80 backdrop-blur shadow-sm rounded-xl flex items-center justify-center border border-slate-100">←</button>
      <Zikirmatik />
    </div>
  );
  if (view === 'kible') return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <button onClick={() => setView('grid')} className="absolute top-12 left-6 z-50 w-10 h-10 bg-white/80 backdrop-blur shadow-sm rounded-xl flex items-center justify-center border border-slate-100">←</button>
      <KibleCompass lat={location?.latitude ?? 41.0082} lng={location?.longitude ?? 28.9784} />
    </div>
  );
  if (view === 'esma') return <EsmaulHusna onBack={() => setView('grid')} />;
  if (view === 'ayet-bul') return <AyetBulucu onBack={() => setView('grid')} />;
  if (view === 'hafizlik') return <HafizlikModu onBack={() => setView('grid')} />;
  if (view === 'elifba') return <ElifBa onBack={() => setView('grid')} />;
  if (view === 'tecvid') return <TecvidHocasi onBack={() => setView('grid')} />;
  if (view === 'hatim-org') return <HatimOrganizatoru user={user} onBack={() => setView('grid')} />;
  if (view === 'kaza') return <KazaTakibi onBack={() => setView('grid')} />;
  if (view === 'cevsen') return <CevsenKebir onBack={() => setView('grid')} />;
  if (view === 'ruya') return <RuyaTabiri onBack={() => setView('grid')} />;
  if (view === 'uyku') return <UykuTefekkur onBack={() => setView('grid')} />;
  if (view === 'aile') return <AileModu user={user} onBack={() => setView('grid')} />;
  if (view === 'kutubsitte') return <KutubSitte onBack={() => setView('grid')} />;
  if (view === 'peygamberler') return <ProphetsList onBack={() => setView('grid')} />;
  if (view === 'tarih') return <IslamHistory onBack={() => setView('grid')} />;
  if (view === 'forty-hadis') return <FortyHadith onBack={() => setView('grid')} />;
  if (view === 'helal-scanner') return <HelalScanner onBack={() => setView('grid')} />;
  if (view === 'zekat-hesapla') return <ZekatHesapla onBack={() => setView('grid')} />;
  if (view === 'ramazan-ozel') return <RamazanOzel onBack={() => setView('grid')} />;
  if (view === 'abdest') return <NamazRehberi onBack={() => setView('grid')} />;
  if (view === 'live-streams') return <LiveStreams onBack={() => setView('grid')} />;
  if (view === 'radyo') return <ReligiousRadios onBack={() => setView('grid')} />;
  if (view === 'friday-messages') return <FridayMessages onBack={() => setView('grid')} />;
  if (view === 'camiler') return <CamiBul onBack={() => setView('grid')} />;

  if (view === 'detail' && selectedTool) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <button onClick={() => setView('grid')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-8">←</button>
        <div className="text-center space-y-4">
          <div className={`w-24 h-24 mx-auto flex items-center justify-center ${selectedTool.color}`} style={{ filter: `drop-shadow(0 0 15px ${selectedTool.glowColor})` }}>
            <div className="scale-[2.5]">{selectedTool.icon}</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedTool.title}</h2>
          <p className="text-slate-500 font-medium px-4">{selectedTool.desc}</p>
        </div>
        <div className="mt-12 bg-slate-50 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mb-6 shadow-sm">🚀</div>
           <p className="text-slate-600 text-sm font-black uppercase tracking-widest mb-2">Geliştiriliyor</p>
           <p className="text-slate-400 text-xs font-bold leading-relaxed px-2">
             "{selectedTool.title}" özelliği çok yakında Pro+ üyeleri için aktif edilecektir.
           </p>
           <div className="mt-8 flex gap-2.5">
             <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse"></div>
             <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse delay-75"></div>
             <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse delay-150"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-36 pt-12 space-y-8 bg-white animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Kütüphane</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">İslami Yaşam Rehberi</p>
        </div>
        <button 
          onClick={() => setLayoutMode(prev => prev === 'list' ? 'grid' : 'list')}
          className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 active:scale-90 transition-transform"
        >
          {layoutMode === 'list' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r=".5"/><circle cx="3" cy="12" r=".5"/><circle cx="3" cy="18" r=".5"/>
            </svg>
          )}
        </button>
      </div>

      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="İçerik, dua veya araç ara..."
          className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-100 focus:bg-white rounded-[1.8rem] pl-14 pr-6 py-4.5 outline-none font-bold text-sm text-slate-900 transition-all placeholder:text-slate-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
        />
      </div>

      <div className="space-y-14">
        {searchTerm.trim() === '' ? (
          categories.map(cat => (
            <div key={cat} className="space-y-4">
              <div className="flex items-center gap-3 ml-2 mb-4">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                <h3 className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.4em]">{cat}</h3>
              </div>
              <div className={layoutMode === 'list' ? "flex flex-col gap-3" : "grid grid-cols-2 gap-4"}>
                {tools.filter(t => t.cat === cat && !appConfig.hiddenTools.includes(t.id)).map((tool, i) => (
                  layoutMode === 'list' 
                    ? <ToolListItem key={i} tool={tool} /> 
                    : <ToolGridItem key={i} tool={tool} />
                ))}
              </div>
            </div>
          ))
        ) : filteredTools.length > 0 ? (
          <div className={layoutMode === 'list' ? "flex flex-col gap-3" : "grid grid-cols-2 gap-4"}>
            {filteredTools.map((tool, i) => (
              layoutMode === 'list' 
                ? <ToolListItem key={i} tool={tool} /> 
                : <ToolGridItem key={i} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
             <div className="text-4xl mb-4 opacity-20">🔎</div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sonuç Bulunamadı</p>
          </div>
        )}
      </div>

      <div className="text-center py-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.6em]">TÜM İÇERİKLER DİYANET UYUMLUDUR</p>
      </div>

      {(lockedAttempt || showRamadanLocked) && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-end justify-center" onClick={() => { setLockedAttempt(null); setShowRamadanLocked(false); }}>
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] p-8 text-center space-y-3" onClick={e => e.stopPropagation()}>
            <div className="text-4xl">{lockedAttempt ? '🔒' : '🌙'}</div>
            <h3 className="text-lg font-black text-slate-900">
              {lockedAttempt ? `${lockedAttempt.title} Premium'a Özel` : 'Ramazan Özel Henüz Açılmadı'}
            </h3>
            <p className="text-sm text-slate-400">
              {lockedAttempt
                ? 'Bu bölüme erişmek için Mübarekçe PRO+ üyeliğine geçmeniz gerekiyor.'
                : 'Bu bölüm Ramazan ayı boyunca aktif edilir. Şimdilik erişime kapalı.'}
            </p>
            <button
              onClick={() => { setLockedAttempt(null); setShowRamadanLocked(false); }}
              className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest mt-2"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
