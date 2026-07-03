import React, { useEffect, useState } from 'react';
import { AppConfig, DEFAULT_APP_CONFIG, subscribeAppConfig, updateAppConfig } from '../services/appConfig';

// Library.tsx'teki kategori adlarıyla birebir aynı olmalı
const CATEGORIES = [
  'Kuran Akademisi',
  'İbadet Merkezi',
  'Manevi Gelişim',
  'Bilgi Hazinesi',
  'Günlük Yaşam',
  'Lokasyon & Media',
];

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors shrink-0 ${checked ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'}`}
  >
    <div className="w-5 h-5 bg-white rounded-full shadow" />
  </button>
);

const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppConfig(setConfig);
    return () => unsub();
  }, []);

  const persist = async (next: AppConfig) => {
    setConfig(next);
    setSaving(true);
    try {
      await updateAppConfig(next);
    } catch (err) {
      console.error('Ayarlar kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    const isLocked = config.lockedCategories.includes(cat);
    const nextLocked = isLocked
      ? config.lockedCategories.filter(c => c !== cat)
      : [...config.lockedCategories, cat];
    persist({ ...config, lockedCategories: nextLocked });
  };

  const toggleRamadan = () => {
    persist({ ...config, ramadanModeEnabled: !config.ramadanModeEnabled });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col">
      <div className="h-[70px] px-5 flex items-center gap-4 bg-white border-b border-slate-100 shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">←</button>
        <h2 className="text-[16px] font-black text-slate-900 uppercase">Yönetim Paneli</h2>
        {saving && <span className="text-[10px] text-emerald-600 font-bold ml-auto">Kaydediliyor…</span>}
      </div>

      <div className="p-5 space-y-8 overflow-y-auto">
        {/* Ramazan Modu */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-1">Ramazan Modu</p>
          <div className="bg-white rounded-[1.5rem] border border-slate-100 p-5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-900">Ramazan Özel Bölümü</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {config.ramadanModeEnabled ? 'Şu an tüm kullanıcılara açık.' : 'Şu an kapalı, kullanıcılar erişemiyor.'}
              </p>
            </div>
            <Toggle checked={config.ramadanModeEnabled} onChange={toggleRamadan} />
          </div>
        </div>

        {/* Kategori Kilitleri */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-1">Kilitli Kategoriler (Premium)</p>
          <div className="bg-white rounded-[1.5rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {CATEGORIES.map(cat => {
              const locked = config.lockedCategories.includes(cat);
              return (
                <div key={cat} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{locked ? '🔒' : '🔓'}</span>
                    <span className="text-sm font-bold text-slate-700">{cat}</span>
                  </div>
                  <Toggle checked={locked} onChange={() => toggleCategory(cat)} />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 ml-1 leading-relaxed">
            Kilitli işaretlenen kategorilerdeki bölümler, premium olmayan kullanıcılara kilitli görünür ve açılmak istendiğinde yükseltme ekranına yönlendirilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
