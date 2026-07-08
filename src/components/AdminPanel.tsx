import React, { useEffect, useState } from 'react';
import { AppConfig, DEFAULT_APP_CONFIG, subscribeAppConfig, updateAppConfig } from '../services/appConfig';
import { LIBRARY_TOOLS, LIBRARY_CATEGORIES } from '../data/libraryTools';
import { fetchAllUsers, setUserPremium, AdminUserRow } from '../services/adminUsers';

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors shrink-0 ${checked ? 'bg-teal-600 justify-end' : 'bg-slate-200 justify-start'}`}
  >
    <div className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow" />
  </button>
);

type Tab = 'genel' | 'bolumler' | 'kullanicilar';

const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('genel');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeAppConfig(setConfig);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (tab === 'kullanicilar' && users === null) {
      setUsersLoading(true);
      fetchAllUsers()
        .then(setUsers)
        .catch(err => setUsersError(err.message || 'Kullanıcılar alınamadı. Firestore kurallarını kontrol edin.'))
        .finally(() => setUsersLoading(false));
    }
  }, [tab, users]);

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
    persist({
      ...config,
      lockedCategories: isLocked ? config.lockedCategories.filter(c => c !== cat) : [...config.lockedCategories, cat],
    });
  };

  const toggleTool = (id: string) => {
    const isLocked = config.lockedTools.includes(id);
    persist({
      ...config,
      lockedTools: isLocked ? config.lockedTools.filter(t => t !== id) : [...config.lockedTools, id],
    });
  };

  const toggleHidden = (id: string) => {
    const isHidden = config.hiddenTools.includes(id);
    persist({
      ...config,
      hiddenTools: isHidden ? config.hiddenTools.filter(t => t !== id) : [...config.hiddenTools, id],
    });
  };

  const toggleRamadan = () => persist({ ...config, ramadanModeEnabled: !config.ramadanModeEnabled });

  const togglePremium = async (u: AdminUserRow) => {
    setUsers(prev => prev ? prev.map(x => x.uid === u.uid ? { ...x, isPremium: !x.isPremium } : x) : prev);
    try {
      await setUserPremium(u.uid, !u.isPremium);
    } catch (err) {
      console.error('Premium güncellenemedi:', err);
      setUsers(prev => prev ? prev.map(x => x.uid === u.uid ? { ...x, isPremium: u.isPremium } : x) : prev);
    }
  };

  const filteredUsers = (users || []).filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col">
      <div className="h-[70px] px-5 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">←</button>
        <h2 className="text-[16px] font-black text-slate-900 dark:text-white uppercase">Yönetim Paneli</h2>
        {saving && <span className="text-[10px] text-teal-600 font-bold ml-auto">Kaydediliyor…</span>}
      </div>

      <div className="flex gap-2 px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {([
          ['genel', 'Genel'],
          ['bolumler', 'Bölümler'],
          ['kullanicilar', 'Kullanıcılar'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide ${tab === key ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-8 overflow-y-auto flex-1">
        {tab === 'genel' && (
          <>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">Ramazan Modu</p>
              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Ramazan Özel Bölümü</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {config.ramadanModeEnabled ? 'Şu an tüm kullanıcılara açık.' : 'Şu an kapalı, kullanıcılar erişemiyor.'}
                  </p>
                </div>
                <Toggle checked={config.ramadanModeEnabled} onChange={toggleRamadan} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">Kilitli Kategoriler (Premium)</p>
              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
                {LIBRARY_CATEGORIES.map(cat => {
                  const locked = config.lockedCategories.includes(cat);
                  return (
                    <div key={cat} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{locked ? '🔒' : '🔓'}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-600">{cat}</span>
                      </div>
                      <Toggle checked={locked} onChange={() => toggleCategory(cat)} />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 ml-1 leading-relaxed">
                Bir kategoriyi kilitlersen içindeki TÜM bölümler premium olmayan kullanıcılara kapanır. Sadece belirli bölümleri kilitlemek için "Bölümler" sekmesini kullan.
              </p>
            </div>
          </>
        )}

        {tab === 'bolumler' && (
          <div className="space-y-6">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 leading-relaxed">
              Her bölüm için iki ayrı anahtar var: <span className="font-black text-amber-500">🔒 Kilitli</span> (sadece premium olmayanlara kapalı, bölüm listede görünür ama tıklayınca premium ekranına yönlenir) ve <span className="font-black text-slate-500 dark:text-slate-400 dark:text-slate-500">🚫 Gizli</span> (herkesten, premium dahil, tamamen kaybolur — geliştirme aşamasındaki özellikleri saklamak için kullanışlı).
            </p>
            {LIBRARY_CATEGORIES.map(cat => (
              <div key={cat}>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">{cat}</p>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
                  {LIBRARY_TOOLS.filter(t => t.cat === cat).map(t => {
                    const locked = config.lockedTools.includes(t.id);
                    const hidden = config.hiddenTools.includes(t.id);
                    return (
                      <div key={t.id} className={`p-4 px-5 flex items-center justify-between gap-3 ${hidden ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-base shrink-0">{hidden ? '🚫' : locked ? '🔒' : '🔓'}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-600 truncate">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Kilitli</span>
                            <Toggle checked={locked} onChange={() => toggleTool(t.id)} />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Gizli</span>
                            <Toggle checked={hidden} onChange={() => toggleHidden(t.id)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'kullanicilar' && (
          <div className="space-y-4">
            <input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="İsim veya e-posta ara…"
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none"
            />
            {usersLoading && <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-10">Kullanıcılar yükleniyor…</p>}
            {usersError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-xs font-bold rounded-2xl">
                {usersError}
                <br />Firestore kurallarında `users` koleksiyonu için admin'e okuma izni verildiğinden emin olun.
              </div>
            )}
            {!usersLoading && !usersError && (
              <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
                {filteredUsers.length === 0 && <p className="text-center text-xs text-slate-300 dark:text-slate-600 py-10">Kullanıcı bulunamadı</p>}
                {filteredUsers.map(u => (
                  <div key={u.uid} className="p-4 px-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{u.email || u.uid}</p>
                    </div>
                    <button
                      onClick={() => togglePremium(u)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide ${u.isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}
                    >
                      {u.isPremium ? '★ Premium' : 'Standart'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
