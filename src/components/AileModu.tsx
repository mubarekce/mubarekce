import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';

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

const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

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

const AileModu: React.FC<{ user: User; onBack: () => void }> = ({ user, onBack }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('HAFTALIK');

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [goals, setGoals] = useState<SharedGoal[]>([
    { id: 'hatim', title: 'HATİM', target: 30, icon: 'hatim', color: 'bg-gold-500', unit: 'Cüz' },
    { id: 'sadaka', title: 'SADAKA', target: 1000, icon: 'sadaka', color: 'bg-amber-500', unit: 'TL' },
    { id: 'esma', title: 'ESMA EZBER', target: 99, icon: 'esma', color: 'bg-purple-500', unit: 'İsim' },
  ]);
  const [contributions, setContributions] = useState<ContributionMap>({ hatim: {}, sadaka: {}, esma: {} });

  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Çocuk');
  const [activeGoalPanel, setActiveGoalPanel] = useState<string | null>(null);

  // Hatim & Esma Hedef Düzenleme State'leri
  const [editMainCount, setEditMainCount] = useState(0); // Hatim/Esma Tekrar Sayısı
  const [editExtraCount, setEditExtraCount] = useState(0); // Ekstra Cüz/İsim

  // --- Kullanıcının ailesini bul ya da oluştur, sonra gerçek zamanlı dinle ---
  useEffect(() => {
    let unsubscribeFamily: (() => void) | null = null;

    const init = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let fid = userSnap.exists() ? userSnap.data().familyId : null;

      if (!fid) {
        const meMember: FamilyMember = {
          id: user.uid,
          name: user.name || 'BEN',
          role: 'Siz',
          avatar: '👤',
          points: 0,
          prayersToday: [false, false, false, false, false],
        };
        const familyRef = doc(collection(db, 'families'));
        await setDoc(familyRef, {
          memberUids: [user.uid],
          inviteCode: generateInviteCode(),
          familyMembers: [meMember],
          goals: [
            { id: 'hatim', title: 'HATİM', target: 30, icon: 'hatim', color: 'bg-gold-500', unit: 'Cüz' },
            { id: 'sadaka', title: 'SADAKA', target: 1000, icon: 'sadaka', color: 'bg-amber-500', unit: 'TL' },
            { id: 'esma', title: 'ESMA EZBER', target: 99, icon: 'esma', color: 'bg-purple-500', unit: 'İsim' },
          ],
          contributions: { hatim: {}, sadaka: {}, esma: {} },
          createdAt: serverTimestamp(),
        });
        await updateDoc(userRef, { familyId: familyRef.id });
        fid = familyRef.id;
      }

      setFamilyId(fid);

      unsubscribeFamily = onSnapshot(doc(db, 'families', fid), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        let members: FamilyMember[] = data.familyMembers || [];
        if (!members.some(m => m.id === user.uid)) {
          members = [{ id: user.uid, name: user.name || 'BEN', role: 'Siz', avatar: '👤', points: 0, prayersToday: [false, false, false, false, false] }, ...members];
        }
        setFamilyMembers(members);
        setGoals(data.goals || []);
        setContributions(data.contributions || { hatim: {}, sadaka: {}, esma: {} });
        setInviteCode(data.inviteCode || '');
        setDataLoaded(true);
      });
    };

    init();
    return () => { if (unsubscribeFamily) unsubscribeFamily(); };
  }, [user.uid]);

  // --- Yerel değişiklikleri Firestore'a geri yaz ---
  useEffect(() => {
    if (!dataLoaded || !familyId) return;
    updateDoc(doc(db, 'families', familyId), { familyMembers }).catch(err => console.error('Üyeler kaydedilemedi:', err));
  }, [familyMembers, dataLoaded, familyId]);

  useEffect(() => {
    if (!dataLoaded || !familyId) return;
    updateDoc(doc(db, 'families', familyId), { contributions, goals }).catch(err => console.error('İlerleme kaydedilemedi:', err));
  }, [contributions, goals, dataLoaded, familyId]);

  const handleJoinFamily = async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    setJoinError(null);
    try {
      const q = query(collection(db, 'families'), where('inviteCode', '==', code));
      const snap = await getDocs(q);
      if (snap.empty) {
        setJoinError('Bu kodla eşleşen bir aile bulunamadı.');
        return;
      }
      const targetFamily = snap.docs[0];
      await updateDoc(doc(db, 'users', user.uid), { familyId: targetFamily.id });
      setJoinCodeInput('');
      setShowJoinModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Aileye katılınamadı:', err);
      setJoinError('Bir hata oluştu, tekrar dener misin?');
    } finally {
      setJoining(false);
    }
  };

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
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white via-[#fbf6ea] to-[#f5ead0] dark:from-[#3e5878] dark:via-[#243a58] dark:to-[#141a2c] animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gold-50/40 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-white dark:bg-navy-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-navy-900 active:scale-90 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c2541" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-[19px] font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Aile Modu</h2>
            <p className="text-[9px] font-black text-gold-600 uppercase tracking-[0.25em] mt-1">PRO+ ÖZEL PLATFORM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowJoinModal(true)} className="w-11 h-11 bg-white dark:bg-navy-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-navy-900 active:scale-90 transition-transform text-slate-500 dark:text-slate-400 dark:text-slate-500" title="Kod ile Katıl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          </button>
          <button onClick={() => setShowInviteModal(true)} className="w-11 h-11 bg-gold-100/50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-gold-200/50">🏘️</button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl text-center">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Aileni Davet Et</h3>
              <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Bu kodu paylaştığın kişi kendi telefonundan "Kod ile Katıl" diyerek ailene katılabilir</p>
            </div>
            <div className="bg-gold-50 dark:bg-navy-950/20 border-2 border-dashed border-gold-200 rounded-[2rem] py-8 px-4">
              <p className="text-4xl font-black text-gold-700 tracking-[0.3em]">{inviteCode}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(inviteCode); }} className="flex-1 py-4 bg-gold-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">KODU KOPYALA</button>
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-navy-900 text-slate-400 dark:text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">KAPAT</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Aileye Katıl</h3>
              <p className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Sana gönderilen davet kodunu gir</p>
              <p className="text-[9px] font-bold text-amber-500 mt-2">Not: Bir aileye katılınca, kendi kurduğun aile verisinden çıkmış olursun.</p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => { setJoinCodeInput(e.target.value); setJoinError(null); }}
                placeholder="Örn: A1B2C3"
                maxLength={6}
                className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4 outline-none font-black text-center text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-600 shadow-inner uppercase tracking-[0.3em]"
              />
              {joinError && <p className="text-[10px] font-bold text-rose-500 text-center">{joinError}</p>}
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowJoinModal(false); setJoinError(null); setJoinCodeInput(''); }} className="flex-1 py-4 bg-slate-100 dark:bg-navy-900 text-slate-400 dark:text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">VAZGEÇ</button>
              <button onClick={handleJoinFamily} disabled={joining} className="flex-1 py-4 bg-gold-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-gold-200 active:scale-95 transition-all disabled:opacity-60">{joining ? 'KATILIYOR...' : 'KATIL'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-8 pt-4">
        
        {/* Statistics Board */}
        <div className="bg-[#f5ead0] rounded-[2.8rem] p-5 text-navy-950 relative overflow-hidden shadow-2xl shadow-gold-200/30 border border-white/80">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 px-1">
               <p className="text-gold-500 text-[8px] font-black uppercase tracking-[0.35em]">AİLE İLERLEME MERKEZİ</p>
               <div className="flex items-center gap-1.5 opacity-60">
                   <span className="w-1 h-1 bg-gold-400 rounded-full animate-pulse"></span>
                   <p className="text-[9px] font-bold text-navy-900 leading-none">{familyMembers.length} Üye</p>
                </div>
            </div>
            
            <div className="bg-navy-900/5 backdrop-blur-sm p-1 rounded-2xl flex border border-white/20 shadow-inner w-full mb-5">
              {(['GÜNLÜK', 'HAFTALIK', 'AYLIK', 'YILLIK'] as Timeframe[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`flex-1 py-1.5 text-[7.5px] font-black rounded-xl transition-all duration-300 ${timeframe === t ? 'bg-[#a8895a] text-white shadow-md' : 'text-gold-500/60 hover:text-gold-700'}`}
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
                          <h4 className="text-[11px] font-black text-navy-900 uppercase tracking-tight leading-none">
                            {timeframe} {goal.title}
                          </h4>
                          <p className="text-[7.5px] font-bold text-gold-400 uppercase tracking-widest mt-0.5">
                            {formatProgressLabel(goal, currentProgress)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[16px] font-black text-navy-950 tabular-nums leading-none">%{percent}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gold-200/40 rounded-full overflow-hidden border border-white/40 shadow-inner">
                        <div 
                          className={`h-full ${goal.color} transition-all duration-[1200ms] rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <button 
                        onClick={() => setShowEditGoal(goal.id)}
                        className="bg-white/60 hover:bg-white dark:bg-navy-800 text-gold-600 px-3 py-1.5 rounded-xl text-[7.5px] font-black uppercase tracking-widest shadow-sm border border-white active:scale-95 transition-all"
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
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">AİLE ÜYELERİ</h4>
            </div>
            <button 
              onClick={() => setShowAddMember(true)}
              className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-full border border-amber-100 shadow-sm active:scale-95 transition-all"
            >
              + ÜYE EKLE
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {familyMembers.map(member => {
              const isMe = member.id === user.uid;
              let totalPct = 0;
              goals.forEach(goal => {
                const val = contributions[goal.id]?.[member.id] || 0;
                totalPct += (val / goal.target);
              });
              const overallProgress = Math.min(100, Math.round((totalPct / goals.length) * 100));
              
              return (
                <div key={member.id} className={`pl-4 pr-5 py-3.5 rounded-[1.6rem] border flex items-center justify-between group transition-all shadow-sm ${isMe ? 'bg-gold-50/20 border-gold-100' : 'bg-white dark:bg-navy-800 border-slate-100 dark:border-navy-900 hover:border-gold-50'}`}>
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base shadow-inner border transition-all flex-shrink-0 ${isMe ? 'bg-gold-600 border-gold-500 text-white' : 'bg-slate-50 dark:bg-navy-800 border-white'}`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-black text-slate-900 dark:text-white tracking-tight text-[13px] truncate">{isMe ? 'BEN' : member.name}</h5>
                        <span className={`text-[6px] font-black px-1.5 py-0.5 rounded uppercase border flex-shrink-0 ${
                          isMe ? 'bg-gold-600 text-white border-gold-500' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-navy-900'
                        }`}>
                          {isMe ? 'SİZ' : member.role}
                        </span>
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">%{overallProgress} HEDEF İLERLEMESİ</p>
                      
                      <div className="w-full h-1 bg-slate-50 dark:bg-navy-800 rounded-full overflow-hidden border border-white/50 shadow-inner">
                         <div 
                           className="h-full bg-gold-500 rounded-full transition-all duration-1000 shadow-[0_0_6px_rgba(201,166,104,0.2)]"
                           style={{ width: `${overallProgress}%` }}
                         ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-[15px] font-black tracking-tighter ${overallProgress > 50 ? 'text-gold-600' : 'text-slate-300 dark:text-slate-600'}`}>
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
            <div className="w-2 h-2 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(201,166,104,0.3)]"></div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">ORTAK AİLE HEDEFLERİ</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {goals.map(goal => {
              const currentProgress = getGoalProgress(goal.id);
              const percent = Math.min(100, Math.round((currentProgress / goal.target) * 100));
              const isOpen = activeGoalPanel === goal.id;
              const isExceeded = currentProgress > goal.target;
              
              return (
                <div key={goal.id} className="bg-white dark:bg-navy-800 rounded-[2.2rem] border border-slate-100 dark:border-navy-900 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
                  <div 
                    onClick={() => setActiveGoalPanel(isOpen ? null : goal.id)}
                    className={`p-6 space-y-4 relative group cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/30' : 'active:bg-slate-50 dark:bg-navy-800'}`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full ${goal.color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
                          <GoalIcon id={goal.id} className="text-white" />
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-[14px]">{goal.title}</h5>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${isExceeded ? 'text-gold-600' : 'text-slate-400 dark:text-slate-500'}`}>
                             {formatProgressLabel(goal, currentProgress)} / {formatTargetLabel(goal, goal.target)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-slate-900 dark:text-white leading-none">%{percent}</span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-2.5">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-navy-900 rounded-full overflow-hidden border border-white shadow-inner">
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
                               <div key={m.id} className="w-5 h-5 rounded-full bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-900 flex items-center justify-center text-[8px] shadow-sm">
                                 {m.avatar}
                               </div>
                             );
                           })}
                        </div>
                        <p className="text-[8px] font-black text-gold-600 uppercase tracking-widest">
                          {isOpen ? 'KATKILARI GİZLE' : 'KATKIDA BULUN'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 bg-white dark:bg-navy-800 border-t border-slate-50 dark:border-navy-900 animate-in slide-in-from-top-2 duration-300">
                      <div className="pt-3 flex items-center justify-between px-1 mb-2">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">KATILIM LİSTESİ</p>
                      </div>
                      
                      <div className="flex flex-col">
                        {familyMembers.map((member) => {
                          const isMe = member.id === user.uid;
                          const memberContribution = contributions[goal.id]?.[member.id] || 0;
                          const inputKey = `${goal.id}_${member.id}`;
                          const manualVal = manualAmounts[inputKey] || '';

                          return (
                            <div key={member.id} className="flex flex-col gap-2 py-2.5 border-b border-slate-50 dark:border-navy-900 last:border-0 group">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <div className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-navy-800 flex items-center justify-center text-sm border border-slate-100 dark:border-navy-900 flex-shrink-0">{member.avatar}</div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1">
                                      <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">{isMe ? 'BEN' : member.name}</p>
                                      {isMe && <span className="text-[6px] font-black bg-amber-100 text-amber-600 px-1 py-0.5 rounded uppercase border border-amber-200 flex-shrink-0">SİZ</span>}
                                    </div>
                                    <p className="text-[9px] font-black text-gold-600 leading-none">{formatProgressLabel(goal, memberContribution)}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="relative w-20">
                                    <input 
                                      type="number" 
                                      value={manualVal}
                                      onChange={(e) => setManualAmounts(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                      placeholder="Miktar..."
                                      className="w-full h-8 bg-slate-50 dark:bg-navy-800 border-none rounded-lg px-2 text-[9px] font-black outline-none shadow-inner border border-slate-100 dark:border-navy-900"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => updateContributionManually(goal.id, member.id)}
                                      disabled={!manualVal}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${manualVal ? 'bg-gold-600 text-white border-gold-500 shadow-md shadow-gold-100 active:scale-90' : 'bg-slate-50 dark:bg-navy-800 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-navy-900'}`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </button>

                                    <button 
                                      onClick={() => deleteContribution(goal.id, member.id)}
                                      className="w-8 h-8 bg-rose-50 dark:bg-rose-950/20 text-rose-400 rounded-lg flex items-center justify-center active:scale-90 border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors"
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
        <div className="bg-[#fbf6ea] p-7 rounded-[2.5rem] border border-gold-100 flex items-start gap-5 group hover:bg-[#fbf6ea] transition-colors relative overflow-hidden shadow-sm">
          <div className="absolute bottom-[-10px] right-[-10px] opacity-[0.03] rotate-12">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="w-12 h-12 bg-white dark:bg-navy-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gold-200 shrink-0">🕌</div>
          <div className="space-y-1 relative z-10">
            <h6 className="text-[10px] font-black text-navy-800 uppercase tracking-widest">GÜNLÜK MANEVİ ÖNERİ</h6>
            <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed italic">"Bugün ailece akşam namazından sonra 10 dakika Kur'an-ı Kerim okuma saati yapmaya ne dersiniz?"</p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[3.5rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold-600"></div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Üye Ekle</h3>
              <p className="text-[10px] font-black text-gold-600 uppercase tracking-[0.25em] mt-1.5">AİLE HALKASINI GENİŞLETİN</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">İSİM SOYİSİM</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Ayşe" className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4 outline-none font-bold shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">AİLE ROLÜ</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Baba', 'Anne', 'Çocuk', 'Dede', 'Nene'].map(role => (
                    <button key={role} onClick={() => setNewRole(role)} className={`py-4 rounded-2xl text-[10px] font-black border flex items-center justify-center gap-2 ${newRole === role ? 'bg-navy-950 text-white' : 'bg-white dark:bg-navy-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-navy-900'}`}>
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowAddMember(false)} className="flex-1 py-5 bg-slate-100 dark:bg-navy-900 text-slate-400 dark:text-slate-500 font-black rounded-2xl text-[10px] uppercase active:scale-95">VAZGEÇ</button>
              <button onClick={handleAddMember} className="flex-1 py-5 bg-gold-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-xl active:scale-95">KAYDET</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-navy-800 w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${showEditGoal === 'hatim' ? 'bg-gold-600' : showEditGoal === 'esma' ? 'bg-purple-600' : 'bg-gold-600'}`}></div>
              <div className="text-center">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hedefi Belirle</h3>
                 <p className="text-[10px] font-black text-gold-600 uppercase tracking-[0.25em] mt-1.5">{goals.find(g => g.id === showEditGoal)?.title}</p>
              </div>
              
              <div className="space-y-6">
                 {showEditGoal === 'hatim' ? (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">HATİM (TEKRAR)</label>
                         <input 
                           type="number" 
                           value={editMainCount}
                           onChange={(e) => setEditMainCount(Number(e.target.value))}
                           className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">EKSTRA CÜZ</label>
                         <input 
                           type="number" 
                           max="29"
                           value={editExtraCount}
                           onChange={(e) => setEditExtraCount(Math.min(29, Number(e.target.value)))}
                           className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                         />
                      </div>
                   </div>
                 ) : showEditGoal === 'esma' ? (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">ESMA (TEKRAR)</label>
                        <input 
                          type="number" 
                          value={editMainCount}
                          onChange={(e) => setEditMainCount(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">EKSTRA İSİM</label>
                        <input 
                          type="number" 
                          max="98"
                          value={editExtraCount}
                          onChange={(e) => setEditExtraCount(Math.min(98, Number(e.target.value)))}
                          className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
                        />
                     </div>
                  </div>
                 ) : (
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">YENİ HEDEF MİKTARI</label>
                      <input 
                        type="number" 
                        defaultValue={goals.find(g => g.id === showEditGoal)?.target}
                        onBlur={(e) => updateGoalTarget(showEditGoal!, Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-navy-800 border-none rounded-2xl px-6 py-4.5 outline-none font-bold shadow-inner" 
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
                <button onClick={() => setShowEditGoal(null)} className="flex-1 py-5 bg-slate-100 dark:bg-navy-900 text-slate-400 dark:text-slate-500 font-black rounded-2xl text-[10px] uppercase active:scale-95">İPTAL</button>
              </div>
           </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.7em]">MÜBAREKÇE PRO+ AİLE PLATFORMU</p>
      </div>
    </div>
  );
};

export default AileModu;