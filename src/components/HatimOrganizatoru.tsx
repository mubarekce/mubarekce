
import React, { useState, useCallback, useMemo } from 'react';

interface JuzAssignment {
  status: 'available' | 'reserved' | 'completed';
  participantName?: string;
  isMe?: boolean;
}

interface HatimCircle {
  id: string;
  name: string;
  creator: string;
  type: 'Kuran' | 'Cevşen' | 'Tefsir';
  totalParts: number;
  completedParts: number;
  deadline: string;
  participants: string[]; // Havuzdaki katılımcı isimleri
  assignments: Record<number, JuzAssignment>;
}

const HatimOrganizatoru: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'halkalar' | 'istatistik'>('halkalar');
  const [selectedHalkalaId, setSelectedHalkalaId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<{ juzIndex: number } | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<{ juzIndex: number; assignment: JuzAssignment } | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  
  // Form States
  const [newHalkaName, setNewHalkaName] = useState('');
  const [newHalkaDate, setNewHalkaDate] = useState('');
  const [noTargetDate, setNoTargetDate] = useState(false);
  const [tempParticipantName, setTempParticipantName] = useState('');

  const [halkalar, setHalkalar] = useState<HatimCircle[]>([]);

  const selectedHalkala = halkalar.find(h => h.id === selectedHalkalaId);

  // İstatistik hesaplamaları
  const stats = useMemo(() => {
    const totalJuz = halkalar.reduce((acc, h) => acc + (Object.values(h.assignments) as JuzAssignment[]).filter(a => a.status === 'completed').length, 0);
    const activeCircles = halkalar.length;
    const myJuzCount = halkalar.reduce((acc, h) => acc + (Object.values(h.assignments) as JuzAssignment[]).filter(a => a.isMe).length, 0);
    const myCompletedJuz = halkalar.reduce((acc, h) => acc + (Object.values(h.assignments) as JuzAssignment[]).filter(a => a.isMe && a.status === 'completed').length, 0);
    
    return { totalJuz, activeCircles, myJuzCount, myCompletedJuz };
  }, [halkalar]);

  const handleCreateHalka = () => {
    if (!newHalkaName.trim()) return;
    
    const initialAssignments: Record<number, JuzAssignment> = {};
    for (let i = 0; i < 30; i++) {
      initialAssignments[i] = { status: 'available' };
    }

    const newHalka: HatimCircle = {
      id: Date.now().toString(),
      name: newHalkaName.toUpperCase(),
      creator: 'Siz',
      type: 'Kuran',
      totalParts: 30,
      completedParts: 0,
      deadline: noTargetDate ? 'Hedef Yok' : (newHalkaDate || 'Belirlenmedi'),
      participants: [],
      assignments: initialAssignments
    };

    setHalkalar([newHalka, ...halkalar]);
    setNewHalkaName('');
    setNewHalkaDate('');
    setNoTargetDate(false);
    setShowCreateModal(false);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleAddParticipantToPool = () => {
    if (!tempParticipantName.trim() || !selectedHalkalaId) return;
    
    setHalkalar(prev => prev.map(h => {
      if (h.id === selectedHalkalaId) {
        if (h.participants.includes(tempParticipantName.trim())) return h;
        return { ...h, participants: [...h.participants, tempParticipantName.trim()] };
      }
      return h;
    }));
    setTempParticipantName('');
  };

  const handleAssignJuz = (name: string, isMe: boolean = false) => {
    if (!selectedHalkalaId || !showAssignModal) return;

    setHalkalar(prev => prev.map(h => {
      if (h.id === selectedHalkalaId) {
        const newAssignments = { ...h.assignments };
        newAssignments[showAssignModal.juzIndex] = {
          status: 'reserved',
          participantName: isMe ? 'BEN' : name,
          isMe: isMe
        };
        return { ...h, assignments: newAssignments };
      }
      return h;
    }));

    setShowAssignModal(null);
    if (window.navigator.vibrate) window.navigator.vibrate(30);
  };

  const updateJuzStatus = (index: number, newStatus: 'available' | 'completed') => {
    if (!selectedHalkalaId) return;
    
    setHalkalar(prev => prev.map(h => {
      if (h.id === selectedHalkalaId) {
        const newAssignments = { ...h.assignments };
        if (newStatus === 'available') {
          newAssignments[index] = { status: 'available' };
        } else {
          newAssignments[index] = { ...newAssignments[index], status: 'completed' };
        }
        const completedCount = (Object.values(newAssignments) as JuzAssignment[]).filter(a => a.status === 'completed').length;
        return { ...h, assignments: newAssignments, completedParts: completedCount };
      }
      return h;
    }));
    setShowActionMenu(null);
    if (window.navigator.vibrate) window.navigator.vibrate(40);
  };

  const toggleJuzStatus = (index: number) => {
    if (!selectedHalkalaId || !selectedHalkala) return;
    
    const assignment = selectedHalkala.assignments[index] as JuzAssignment;
    if (assignment.status === 'available') {
      setShowAssignModal({ juzIndex: index });
    } else {
      setShowActionMenu({ juzIndex: index, assignment });
    }
  };

  const renderHalkalaDetail = () => {
    if (!selectedHalkala) return null;
    const completedCount = (Object.values(selectedHalkala.assignments) as JuzAssignment[]).filter(a => a.status === 'completed').length;
    const percent = Math.round((completedCount / 30) * 100);

    return (
      <div className="fixed inset-0 z-[260] bg-white flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        <div className="px-6 pt-12 pb-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedHalkalaId(null)}
              className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 active:scale-90 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <h2 className="text-[17px] font-black text-slate-900 tracking-tight leading-tight uppercase">{selectedHalkala.name}</h2>
              <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mt-0.5">Cüz Dağıtım Tablosu</p>
            </div>
          </div>
          <button 
            onClick={() => setShowParticipantsModal(true)}
            className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100 active:scale-90 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="12" y1="11" x2="12" y2="15"/><line x1="10" y1="13" x2="14" y2="13"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
          <div className="mt-8 mb-10 p-8 bg-teal-50/50 rounded-[2.8rem] border border-teal-100 relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12 text-[12rem] pointer-events-none">📖</div>
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-5">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">İLERLEME DURUMU</p>
                      <h4 className="text-[2.8rem] font-black text-teal-950 leading-none tracking-tighter">%{percent}</h4>
                   </div>
                   <div className="text-right pb-1">
                      <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">HEDEF TARİH</p>
                      <p className="text-xs font-black text-teal-800">{selectedHalkala.deadline}</p>
                   </div>
                </div>
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-teal-100/50 shadow-inner">
                   <div 
                     className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all duration-1000 ease-out"
                     style={{ width: `${percent}%` }}
                   ></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-5 gap-3.5 mb-12">
            {[...Array(30)].map((_, i) => {
              const assignment = selectedHalkala.assignments[i] as JuzAssignment;
              return (
                <button 
                  key={i}
                  onClick={() => toggleJuzStatus(i)}
                  className={`aspect-square rounded-[1.2rem] flex flex-col items-center justify-center border-2 transition-all active:scale-90 overflow-hidden ${
                    assignment.status === 'completed' 
                      ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/10' 
                      : assignment.isMe
                        ? 'bg-[#fef3c7] border-[#fbbf24] text-[#92400e] shadow-sm'
                        : assignment.status === 'reserved' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm' 
                          : 'bg-white border-slate-50 text-slate-300 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  <span className="text-[13px] font-black">{i + 1}</span>
                  <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5 px-1 truncate w-full text-center">
                    {assignment.status === 'completed' ? 'BİTTİ' : assignment.status === 'reserved' ? (assignment.participantName || 'ALINDI') : 'BOŞ'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <button 
            onClick={() => alert("Halka daveti yakında paylaşım menüsüne bağlanacaktır!")}
            className="w-full py-5 bg-teal-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-teal-900/10 active:scale-95 transition-all hover:bg-teal-800"
          >
            HALKAYA DAVET ET
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FCFDFD] h-full relative animate-in fade-in duration-500 overflow-hidden">
      {selectedHalkalaId && renderHalkalaDetail()}
      
      {/* Main Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-white border-b border-slate-100/50 sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 active:scale-90 transition-transform">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Hatim Organizatörü</h2>
            <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1">Grup Hatim Yönetimi</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm active:scale-90 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 pb-2">
        <div className="bg-slate-100/80 p-1.5 rounded-[1.8rem] flex border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('halkalar')}
            className={`flex-1 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${activeTab === 'halkalar' ? 'bg-white text-teal-700 shadow-md ring-1 ring-teal-500/10' : 'text-slate-400'}`}
          >
            Halkalarım
          </button>
          <button 
            onClick={() => setActiveTab('istatistik')}
            className={`flex-1 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'istatistik' ? 'bg-white text-teal-700 shadow-md ring-1 ring-teal-500/10' : 'text-slate-400'}`}
          >
            İstatistikler
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {activeTab === 'halkalar' ? (
          <div className="py-6 space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#022e2c] rounded-[2.8rem] p-10 text-white relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(4,47,46,0.3)]">
               <div className="absolute right-[-10%] top-[-10%] p-8 opacity-[0.08] group-hover:scale-110 transition-transform text-[12rem] pointer-events-none rotate-6">🕌</div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter mb-2">Yeni Hatim Başlat</h3>
                  <p className="text-teal-400/80 text-[10px] font-black uppercase tracking-[0.25em] mb-10 leading-relaxed">Sevdiklerinle beraber<br/>tilavetin bereketini paylaş</p>
                  <button onClick={() => setShowCreateModal(true)} className="bg-teal-500 hover:bg-teal-400 text-white font-black text-[10px] px-10 py-4.5 rounded-[1.5rem] uppercase tracking-widest shadow-[0_15px_30px_rgba(20,184,166,0.3)] transition-all active:scale-95 border border-teal-400/20">
                    Halka Oluştur
                  </button>
               </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 ml-2 mb-3">
                 <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.7)] animate-pulse"></div>
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.45em]">AKTİF HALKALARIM</h5>
              </div>

              {halkalar.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.8rem] border border-slate-100 border-dashed text-center space-y-4">
                   <div className="text-4xl opacity-20">📿</div>
                   <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Henüz aktif bir halkanız yok.<br/>Yukarıdan hemen oluşturun!</p>
                </div>
              ) : (
                halkalar.map((halkala) => (
                  <div 
                    key={halkala.id}
                    onClick={() => setSelectedHalkalaId(halkala.id)}
                    className="bg-white p-7 rounded-[2.8rem] border border-slate-100 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.06)] hover:border-teal-100 transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                       <div className="space-y-1">
                          <h4 className="text-[16px] font-black text-slate-950 group-hover:text-teal-700 transition-colors tracking-tight">{halkala.name}</h4>
                          <div className="flex items-center gap-2">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kuran Hatmi</p>
                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                             <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">{(Object.values(halkala.assignments) as JuzAssignment[]).filter(a => a.participantName).length} Katılımcı</p>
                          </div>
                       </div>
                       <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 transition-all group-hover:translate-x-1 shadow-sm border border-teal-100/50">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="9 18 15 12 9 6"/></svg>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                       <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                            style={{ width: `${(halkala.completedParts / halkala.totalParts) * 100}%` }}
                          ></div>
                       </div>
                       <span className="text-[11px] font-black text-teal-600 tabular-nums">%{Math.round((halkala.completedParts / halkala.totalParts) * 100)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-6 animate-in fade-in duration-500">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOPLAM CÜZ</p>
                   <p className="text-3xl font-black text-teal-700 tracking-tighter">{stats.totalJuz}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AKTİF HALKA</p>
                   <p className="text-3xl font-black text-teal-700 tracking-tighter">{stats.activeCircles}</p>
                </div>
             </div>

             <div className="bg-teal-900 rounded-[2.8rem] p-8 text-white relative overflow-hidden shadow-xl shadow-teal-950/20">
                <div className="absolute right-0 bottom-0 p-6 opacity-10 text-7xl">📈</div>
                <div className="relative z-10 space-y-6">
                   <div>
                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">ŞAHSİ TAMAMLANAN</p>
                      <h3 className="text-4xl font-black tracking-tighter">{stats.myCompletedJuz} <span className="text-lg text-teal-500/60 font-bold tracking-normal">/ {stats.myJuzCount} CÜZ</span></h3>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-400 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.myJuzCount > 0 ? (stats.myCompletedJuz / stats.myJuzCount) * 100 : 0}%` }}
                      ></div>
                   </div>
                   <p className="text-[10px] font-medium text-teal-300/80 leading-relaxed italic">"İki günü eşit olan ziyandadır." - Tebrikler, manevi yolculuğun devam ediyor!</p>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.8rem] border border-slate-100 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">HALKA BAZLI DAĞILIM</p>
                {halkalar.length === 0 ? (
                  <p className="text-xs text-center text-slate-300 py-10">Henüz veri bulunmuyor.</p>
                ) : (
                  halkalar.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-2">
                       <span className="text-xs font-bold text-slate-700">{h.name}</span>
                       <span className="text-xs font-black text-teal-600">%{Math.round((h.completedParts / 30) * 100)}</span>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Create Halka Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl">
             <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Yeni Hatim Halkası</h3>
                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Halkayı Kur ve Başlat</p>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">HALKA ADI</label>
                   <input 
                     type="text" 
                     value={newHalkaName} 
                     onChange={e => setNewHalkaName(e.target.value)} 
                     placeholder="Örn: Ramazan Hazırlık" 
                     className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 placeholder:text-slate-300 shadow-inner" 
                   />
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between items-center ml-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HEDEF TARİH</label>
                      <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="noDate" 
                           checked={noTargetDate} 
                           onChange={e => setNoTargetDate(e.target.checked)}
                           className="w-3 h-3 rounded border-slate-300 text-teal-600 focus:ring-teal-500" 
                         />
                         <label htmlFor="noDate" className="text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">TARİH YOK</label>
                      </div>
                   </div>
                   <input 
                     type="date" 
                     disabled={noTargetDate}
                     value={newHalkaDate} 
                     onChange={e => setNewHalkaDate(e.target.value)} 
                     className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 shadow-inner disabled:opacity-30" 
                   />
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">İPTAL</button>
                <button onClick={handleCreateHalka} className="flex-1 py-4 bg-teal-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-teal-200 active:scale-95 transition-all">KAYDET</button>
             </div>
          </div>
        </div>
      )}

      {/* Assign Juz Modal */}
      {showAssignModal && selectedHalkala && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl max-h-[80vh] flex flex-col">
             <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{showAssignModal.juzIndex + 1}. Cüz Dağıtımı</h3>
                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Hoca / Katılımcı Seçin</p>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                {/* Me Option */}
                <button 
                  onClick={() => handleAssignJuz('BEN', true)}
                  className="w-full flex items-center justify-between p-5 bg-[#fef3c7] border border-[#fbbf24] rounded-2xl group active:scale-[0.98] transition-all"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm border border-[#fbbf24]">👤</div>
                      <span className="font-black text-sm text-[#92400e]">BEN (KENDİM)</span>
                   </div>
                   <span className="text-[10px] font-black text-[#d97706] uppercase tracking-widest">SEÇ</span>
                </button>

                {/* Pool Participants */}
                {selectedHalkala.participants.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAssignJuz(p)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group active:scale-[0.98] transition-all hover:bg-teal-50 hover:border-teal-200"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xs font-bold text-teal-600 shadow-sm border border-slate-100">{p[0]}</div>
                        <span className="font-bold text-sm text-slate-700">{p}</span>
                     </div>
                     <span className="text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">SEÇ</span>
                  </button>
                ))}

                {selectedHalkala.participants.length === 0 && (
                   <div className="text-center py-10 opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest">Henüz katılımcı eklenmemiş</p>
                      <p className="text-[8px] mt-2">Sağ üstteki "+" butonu ile ekleyebilirsiniz</p>
                   </div>
                )}
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowAssignModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">VAZGEÇ</button>
             </div>
          </div>
        </div>
      )}

      {/* NEW: Action Menu Modal for Reserved/Completed Juz */}
      {showActionMenu && (
        <div className="fixed inset-0 z-[450] bg-slate-900/70 backdrop-blur-md flex items-end justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500 shadow-2xl">
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner border border-teal-100">
                    {showActionMenu.assignment.isMe ? '👤' : '📖'}
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{showActionMenu.juzIndex + 1}. Cüz İşlemleri</h3>
                 <div className="flex items-center justify-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OKUYAN:</p>
                    <p className="text-[11px] font-black text-teal-600 uppercase tracking-widest">{showActionMenu.assignment.participantName}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <button 
                   onClick={() => updateJuzStatus(showActionMenu.juzIndex, 'completed')}
                   className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-lg shadow-teal-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    OKUNDU / BİTTİ
                 </button>
                 
                 <button 
                   onClick={() => updateJuzStatus(showActionMenu.juzIndex, 'available')}
                   className="w-full py-5 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    İPTAL ET / SERBEST BIRAK
                 </button>
              </div>

              <button 
                onClick={() => setShowActionMenu(null)}
                className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                KAPAT
              </button>
           </div>
        </div>
      )}

      {/* Participants Management Modal */}
      {showParticipantsModal && selectedHalkala && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 animate-in zoom-in duration-300 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="text-center space-y-1">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Katılımcı Yönetimi</h3>
                 <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Halka İçin Havuz Oluşturun</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">KATILIMCI ADI</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={tempParticipantName} 
                         onChange={e => setTempParticipantName(e.target.value)} 
                         placeholder="Örn: Hatice Çelik" 
                         className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-bold text-slate-900 shadow-inner" 
                       />
                       <button 
                         onClick={handleAddParticipantToPool}
                         className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200 active:scale-90 transition-transform"
                       >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                       </button>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">HAVUZDAKİLER ({selectedHalkala.participants.length})</p>
                 {selectedHalkala.participants.map((p, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-teal-600 border border-slate-100">
                            {p[0]}
                         </div>
                         <p className="text-xs font-black text-slate-900">{p}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setHalkalar(prev => prev.map(h => {
                            if (h.id === selectedHalkalaId) {
                              return { ...h, participants: h.participants.filter(name => name !== p) };
                            }
                            return h;
                          }));
                        }}
                        className="text-rose-400 p-2 active:scale-90 transition-transform"
                      >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                   </div>
                 ))}
                 {selectedHalkala.participants.length === 0 && (
                   <p className="text-center text-xs text-slate-400 py-10">Henüz kimse eklenmemiş.</p>
                 )}
              </div>

              <button 
                onClick={() => setShowParticipantsModal(false)} 
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                KAPAT
              </button>
           </div>
        </div>
      )}

      {/* Brand Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-10">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.65em]">Grup İbadet Platformu V1.2</p>
      </div>
    </div>
  );
};

export default HatimOrganizatoru;
