
import React, { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../contexts/UserDataContext';

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  points: number;
  prayersToday: boolean[]; // [fajr, dhuhr, asr, maghrib, isha]
}

interface SharedGoal {
  id: string;
  title: string; // Orijinal başlık (örn: HATİM)
  target: number;
  icon: string; // Id ile eşleşen anahtar
  color: string;
  unit: string;
}

interface ContributionMap {
  [goalId: string]: {
    [memberId: string]: number;
  };
}

type Timeframe = 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK' | 'YILLIK';

// Neon efektli modern ikon bileşeni
const GoalIcon = ({ id, className }: { id: string; className?: string }) => {
  const neonStyle = { filter: 'drop-shadow(0 0 2px currentColor)' };
  
  switch (id) {
    case 'hatim':
      return (
        <svg className={className} style={neonStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'sadaka':
      return (
        <svg className={className} style={neonStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'esma':
      return (
        <svg className={className} style={neonStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return <span>❓</span>;
  }
};

const AileModu: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { getField, setField } = useUserData();
  const [timeframe, setTimeframe] = useState<Timeframe>('HAFTALIK');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    let list: FamilyMember[] = getField('family_members_v5', [] as FamilyMember[]);

    if (!list.some(m => m.id === 'me')) {
      const me: FamilyMember = {
        id: 'me',
        name: 'BEN',
        role: 'Siz',
        avatar: '👤',
        points: 0,
        prayersToday: [false, false, false, false, false]
      };
      list = [me, ...list];
    }
    return list;
  });

  const [goals, setGoals] = useState<SharedGoal[]>(() =>
    getField('family_goals_v5', [
      { id: 'hatim', title: 'HATİM', target: 30, icon: 'hatim', color: 'bg-emerald-500', unit: 'Cüz' },
      { id: 'sadaka', title: 'SADAKA', target: 1000, icon: 'sadaka', color: 'bg-amber-500', unit: 'TL' },
      { id: 'esma', title: 'ESMA EZBER', target: 99, icon: 'esma', color: 'bg-purple-500', unit: 'İsim' },
    ] as SharedGoal[])
  );

  const [contributions, setContributions] = useState<ContributionMap>(() =>
    getField('family_contributions_v5', { hatim: {}, sadaka: {}, esma: {} } as ContributionMap)
  );

  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Çocuk');
  const [activeGoalPanel, setActiveGoalPanel] = useState<string | null>(null);

  // Hatim & Esma Hedef Düzenleme State'leri
  const [editMainCount, setEditMainCount] = useState(0); // Hatim/Esma Tekrar Sayısı
  const [editExtraCount, setEditExtraCount] = useState(0); // Ekstra Cüz/İsim

  useEffect(() => {
    setField('family_members_v5', familyMembers);
  }, [familyMembers]);

  useEffect(() => {
    setField('family_contributions_v5', contributions);
    setField('family_goals_v5', goals);
  }, [contributions, goals]);

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const avatars: Record<string, string> = { 'Baba': '🧔', 'Anne': '🧕', 'Çocuk': '👦', 'Dede': '👴', 'Nene': '👵' };
    const member: FamilyMember = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      avatar: avatars[newRole] || '👤',
      points: 0,
      prayersToday: [false, false, false, false, false]
    };
    setFamilyMembers([...familyMembers, member]);
    setNewName('');
    setShowAddMember(false);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const updateContributionManually = (goalId: string, memberId: string) => {
    const valStr = manualAmounts[`${goalId}_${memberId}`];
    if (!valStr || isNaN(Number(valStr))) return;
    const val = Number(valStr);
    setContributions(prev => {
      const goalData = prev[goalId] || {};
      const currentVal = goalData[memberId] || 0;
      return { ...prev, [goalId]: { ...goalData, [memberId]: currentVal + val } };
    });
    setManualAmounts(prev => ({ ...prev, [`${goalId}_${memberId}`]: '' }));
    if (window.navigator.vibrate) window.navigator.vibrate(25);
  };

  const getGoalProgress = (goalId: string): number => {
    const goalData = contributions[goalId] || {};
    return (Object.values(goalData) as number[]).reduce((acc: number, val: number) => acc + val, 0);
  };

  const updateGoalTarget = (goalId: string, newTarget: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, target: Math.max(1, newTarget) } : g));
    setShowEditGoal(null);
  };

  const handleHatimGoalSave = () => {
    const totalTarget = (editMainCount * 30) + editExtraCount;
    updateGoalTarget('hatim', totalTarget);
  };

  const handleEsmaGoalSave = () => {
    const totalTarget = (editMainCount * 99) + editExtraCount;
    updateGoalTarget('esma', totalTarget);
  };

  const deleteContribution = (goalId: string, memberId: string) => {
    setContributions(prev => {
      const goalData = { ...prev[goalId] };
      goalData[memberId] = 0;
      return { ...prev, [goalId]: goalData };
    });
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const formatProgressLabel = (goal: SharedGoal, value: number) => {
    if (goal.id === 'hatim') {
      const hatims = Math.floor(value / 30);
      const remainder = value % 30;
      if (hatims > 0) return `${hatims} Hatim ${remainder > 0 ? `+ ${remainder} Cüz` : ''}`;
      return `${remainder} Cüz`;
    }
    if (goal.id === 'esma') {
      const repeats = Math.floor(value / 99);
      const remainder = value % 99;
      if (repeats > 0) return `${repeats} Tekrar ${remainder > 0 ? `+ ${remainder} İsim` : ''}`;
      return `${remainder} İsim`;
    }
    return `${value} ${goal.unit}`;
  };

  const formatTargetLabel = (goal: SharedGoal, value: number) => {
    if (goal.id === 'hatim') {
      const hatims = Math.floor(value / 30);
      const remainder = value % 30;
      if (hatims > 0) return `${hatims} Hatim ${remainder > 0 ? `+ ${remainder} Cüz` : ''}`;
      return `${remainder} Cüz`;
    }
    if (goal.id === 'esma') {
      const repeats = Math.floor(value / 99);
      const remainder = value % 99;
      if (repeats > 0) return `${repeats} Tekrar ${remainder > 0 ? `+ ${remainder} İsim` : ''}`;
      return `${remainder} İsim`;
    }
    return `${value} ${goal.unit}`;
  };

  useEffect(() => {
    if (showEditGoal === 'hatim') {
      const goal = goals.find(g => g.id === 'hatim');
      if (goal) {
        setEditMainCount(Math.floor(goal.target / 30));
        setEditExtraCount(goal.target % 30);
      }
    } else if (showEditGoal === 'esma') {
      const goal = goals.find(g => g.id === 'esma');
      if (goal) {
        setEditMainCount(Math.floor(goal.target / 99));
        setEditExtraCount(goal.target % 99);
      }
    }
  }, [showEditGoal]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/40 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[19px] font-black text-slate-900 tracking-tight leading-none uppercase">Aile Modu</h2>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.25em] mt-1">PRO+ ÖZEL PLATFORM</p>
          </div>
        </div>
        <div className="w-11 h-11 bg-emerald-100/50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-emerald-200/50">🏘️</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-8 pt-4">
        
        {/* Statistics Board */}
        <div className="bg-[#e0f2fe] rounded-[2.8rem] p-5 text-sky-950 relative overflow-hidden shadow-2xl shadow-sky-200/30 border border-white/80">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 px-1">
               <p className="text-sky-500 text-[8px] font-black uppercase tracking-[0.35em]">AİLE İLERLEME MERKEZİ</p>
               <div className="flex items-center gap-1.5 opacity-60">
                   <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                   <p className="text-[9px] font-bold text-sky-900 leading-none">{familyMembers.length} Üye</p>
                </div>
            </div>
            
            <div className="bg-sky-900/5 backdrop-blur-sm p-1 rounded-2xl flex border border-white/20 shadow-inner w-full mb-5">
              {(['GÜNLÜK', 'HAFTALIK', 'AYLIK', 'YILLIK'] as Timeframe[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`flex-1 py-1.5 text-[7.5px] font-black rounded-xl transition-all duration-300 ${timeframe === t ? 'bg-[#0070b1] text-white shadow-md' : 'text-sky-500/60 hover:text-sky-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              {goals.map(goal => {
                const currentProgress = getGoalProgress(goal.id);
                const percent = Math.min(100, Math.round((currentProgress / goal.target) * 100));
                
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm shrink-0 ${goal.color}`}>
                          <GoalIcon id={goal.id} className="text-white" />
                        </div>
                        <div className="space-y-0">
                          <h4 className="text-[11px] font-black text-sky-900 uppercase tracking-tight leading-none">
                            {timeframe} {goal.title}
                          </h4>
                          <p className="text-[7.5px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">
                            {formatProgressLabel(goal, currentProgress)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[16px] font-black text-sky-950 tabular-nums leading-none">%{percent}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-sky-200/40 rounded-full overflow-hidden border border-white/40 shadow-inner">
                        <div 
                          className={`h-full ${goal.color} transition-all duration-[1200ms] rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <button 
                        onClick={() => setShowEditGoal(goal.id)}
                        className="bg-white/60 hover:bg-white text-sky-600 px-3 py-1.5 rounded-xl text-[7.5px] font-black uppercase tracking-widest shadow-sm border border-white active:scale-95 transition-all"
                      >
                        HEDEF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Member List Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">AİLE ÜYELERİ</h4>
            </div>
            <button 
              onClick={() => setShowAddMember(true)}
              className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-3 py-2 rounded-full border border-amber-100 shadow-sm active:scale-95 transition-all"
            >
              + ÜYE EKLE
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {familyMembers.map(member => {
              const isMe = member.id === 'me';
              let totalPct = 0;
              goals.forEach(goal => {
                const val = contributions[goal.id]?.[member.id] || 0;
                totalPct += (val / goal.target);
              });
              const overallProgress = Math.min(100, Math.round((totalPct / goals.length) * 100));
              
              return (
                <div key={member.id} className={`pl-4 pr-5 py-3.5 rounded-[1.6rem] border flex items-center justify-between group transition-all shadow-sm ${isMe ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-50'}`}>
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base shadow-inner border transition-all flex-shrink-0 ${isMe ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-50 border-white'}`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-black text-slate-900 tracking-tight text-[13px] truncate">{isMe ? 'BEN' : member.name}</h5>
                        <span className={`text-[6px] font-black px-1.5 py-0.5 rounded uppercase border flex-shrink-0 ${
                          isMe ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {isMe ? 'SİZ' : member.role}
                        </span>
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">%{overallProgress} HEDEF İLERLEMESİ</p>
                      
                      <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden border border-white/50 shadow-inner">
                         <div 
                           className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_6px_rgba(16,185,129,0.2)]"
                           style={{ width: `${overallProgress}%` }}
                         ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-[15px] font-black tracking-tighter ${overallProgress > 50 ? 'text-emerald-600' : 'text-slate-300'}`}>
                       %{overallProgress}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared Goals Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 ml-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">ORTAK AİLE HEDEFLERİ</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {goals.map(goal => {
              const currentProgress = getGoalProgress(goal.id);
              const percent = Math.min(100, Math.round((currentProgress / goal.target) * 100));
              const isOpen = activeGoalPanel === goal.id;
              const isExceeded = currentProgress > goal.target;
              
              return (
                <div key={goal.id} className="bg-white rounded-[2.2rem] border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
                  <div 
                    onClick={() => setActiveGoalPanel(isOpen ? null : goal.id)}
                    className={`p-6 space-y-4 relative group cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/30' : 'active:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full ${goal.color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
                          <GoalIcon id={goal.id} className="text-white" />
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 tracking-tight uppercase text-[14px]">{goal.title}</h5>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${isExceeded ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {formatProgressLabel(goal, currentProgress)} / {formatTargetLabel(goal, goal.target)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-slate-900 leading-none">%{percent}</span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-2.5">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-white shadow-inner">
                        <div 
                          className={`h-full ${goal.color} transition-all duration-[1000ms] shadow-lg`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center px-1">
                        <div className="flex -space-x-1">
                           {familyMembers.map(m => {
                             const val = contributions[goal.id]?.[m.id] || 0;
                             if (val === 0) return null;
                             return (
                               <div key={m.id} className="w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[8px] shadow-sm">
                                 {m.avatar}
                               </div>
                             );
                           })}
                        </div>
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                          {isOpen ? 'KATKILARI GİZLE' : 'KATKIDA BULUN'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                      <div className="pt-3 flex items-center justify-between px-1 mb-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KATILIM LİSTESİ</p>
                      </div>
                      
                      <div className="flex flex-col">
                        {familyMembers.map((member) => {
                          const isMe = member.id === 'me';
                          const memberContribution = contributions[goal.id]?.[member.id] || 0;
                          const inputKey = `${goal.id}_${member.id}`;
                          const manualVal = manualAmounts[inputKey] || '';

                          return (
                            <div key={member.id} className="flex flex-col gap-2 py-2.5 border-b border-slate-50 last:border-0 group">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 flex-shrink-0">{member.avatar}</div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1">
                                      <p className="text-[11px] font-black text-slate-900 truncate">{isMe ? 'BEN' : member.name}</p>
                                      {isMe && <span className="text-[6px] font-black bg-amber-100 text-amber-600 px-1 py-0.5 rounded uppercase border border-amber-200 flex-shrink-0">SİZ</span>}
                                    </div>
                                    <p className="text-[9px] font-black text-emerald-600 leading-none">{formatProgressLabel(goal, memberContribution)}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="relative w-20">
                                    <input 
                                      type="number" 
                                      value={manualVal}
                                      onChange={(e) => setManualAmounts(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                      placeholder="Miktar..."
                                      className="w-full h-8 bg-slate-50 border-none rounded-lg px-2 text-[9px] font-black outline-none shadow-inner border border-slate-100"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => updateContributionManually(goal.id, member.id)}
                                      disabled={!manualVal}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${manualVal ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-100 active:scale-90' : 'bg-slate-50 text-slate-300 border-slate-100'}`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </button>

                                    <button 
                                      onClick={() => deleteContribution(goal.id, member.id)}
                                      className="w-8 h-8 bg-rose-50 text-rose-400 rounded-lg flex items-center justify-center active:scale-90 border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Family Suggestion Card */}
        <div className="bg-[#ecfdf5] p-7 rounded-[2.5rem] border border-emerald-100 flex items-start gap-5 group hover:bg-[#dcfce7] transition-colors relative overflow-hidden shadow-sm">
          <div className="absolute bottom-[-10px] right-[-10px] opacity-[0.03] rotate-12">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200 shrink-0">🕌</div>
          <div className="space-y-1 relative z-10">
            <h6 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">GÜNLÜK MANEVİ ÖNERİ</h6>
            <p className="text-[12px] font-semibold text-slate-600 leading-relaxed italic">"Bugün ailece akşam namazından sonra 10 dakika Kur'an-ı Kerim okuma saati yapmaya ne dersiniz?"</p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Üye Ekle</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em] mt-1.5">AİLE HALKASINI GENİŞLETİN</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">İSİM SOYİSİM</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Ayşe" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">AİLE ROLÜ</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Baba', 'Anne', 'Çocuk', 'Dede', 'Nene'].map(role => (
                    <button key={role} onClick={() => setNewRole(role)} className={`py-4 rounded-2xl text-[10px] font-black border flex items-center justify-center gap-2 ${newRole === role ? 'bg-emerald-950 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowAddMember(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase active:scale-95">VAZGEÇ</button>
              <button onClick={handleAddMember} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-xl active:scale-95">KAYDET</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${showEditGoal === 'hatim' ? 'bg-emerald-600' : showEditGoal === 'esma' ? 'bg-purple-600' : 'bg-sky-600'}`}></div>
              <div className="text-center">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hedefi Belirle</h3>
                 <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.25em] mt-1.5">{goals.find(g => g.id === showEditGoal)?.title}</p>
              </div>
              
              <div className="space-y-6">
                 {showEditGoal === 'hatim' ? (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">HATİM (TEKRAR)</label>
                         <input 
                           type="number" 
                           value={editMainCount}
                           onChange={(e) => setEditMainCount(Number(e.target.value))}
                           className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">EKSTRA CÜZ</label>
                         <input 
                           type="number" 
                           max="29"
                           value={editExtraCount}
                           onChange={(e) => setEditExtraCount(Math.min(29, Number(e.target.value)))}
                           className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                         />
                      </div>
                   </div>
                 ) : showEditGoal === 'esma' ? (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">ESMA (TEKRAR)</label>
                        <input 
                          type="number" 
                          value={editMainCount}
                          onChange={(e) => setEditMainCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">EKSTRA İSİM</label>
                        <input 
                          type="number" 
                          max="98"
                          value={editExtraCount}
                          onChange={(e) => setEditExtraCount(Math.min(98, Number(e.target.value)))}
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                        />
                     </div>
                  </div>
                 ) : (
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">YENİ HEDEF MİKTARI</label>
                      <input 
                        type="number" 
                        defaultValue={goals.find(g => g.id === showEditGoal)?.target}
                        onBlur={(e) => updateGoalTarget(showEditGoal!, Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                      />
                   </div>
                 )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={showEditGoal === 'hatim' ? handleHatimGoalSave : showEditGoal === 'esma' ? handleEsmaGoalSave : () => setShowEditGoal(null)} 
                  className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase active:scale-95"
                >
                  KAYDET
                </button>
                <button onClick={() => setShowEditGoal(null)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase active:scale-95">İPTAL</button>
              </div>
           </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.7em]">MÜBAREKÇE PRO+ AİLE PLATFORMU</p>
      </div>
    </div>
  );
};

export default AileModu;
