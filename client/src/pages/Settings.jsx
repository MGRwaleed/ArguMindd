import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2, Save, X, CheckCircle, Brain, Cpu, Database, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PageLayout from '../components/PageLayout';
import authService from '../services/authService';

const API_BASE = 'http://localhost:5000/api/auth';
const getToken = () => localStorage.getItem('userToken');

const apiServices = [
  { icon: Brain,    name: 'GEMINI 2.5 FLASH', desc: 'Claim extraction & verdict generation', status: 'ONLINE' },
  { icon: Cpu,      name: 'TAVILY RESEARCH',   desc: 'Real-time evidence retrieval',          status: 'ONLINE' },
  { icon: Database, name: 'MONGODB ATLAS',     desc: 'Debate session storage',                status: 'ONLINE' },
];

const TABS = [
  { label: 'SETTINGS', sectionKey: null },
  { label: 'PROFILE',  sectionKey: 'profile' },
  { label: 'SYSTEM',   sectionKey: 'system' },
  { label: 'DANGER',   sectionKey: 'danger' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme: t, mode } = useTheme();
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const [activeTab, setActiveTab] = useState('SETTINGS');

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [tempName, setTempName]       = useState(user?.name || '');
  const [nameSaved, setNameSaved]     = useState(false);
  const [nameError, setNameError]     = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [pwForm, setPwForm]       = useState({ current:'', newPw:'', confirm:'' });
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm]     = useState('');
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deleteError, setDeleteError]         = useState('');
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const mainRef = useRef(null);
  const sectionRefs = { profile: useRef(null), system: useRef(null), danger: useRef(null) };

  const css = `
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:0.7} }

    .settings-input {
      background: transparent !important; border: none !important;
      border-bottom: 1px solid ${t.border} !important;
      color: ${t.text} !important; -webkit-text-fill-color: ${t.text} !important;
      caret-color: ${t.accent} !important;
      font-family: 'DM Mono', monospace !important; font-size: 0.78rem !important;
      letter-spacing: 0.1em !important; padding: 8px 0 !important;
      outline: none !important; transition: border-color 0.3s !important; width: 100%;
    }
    .settings-input:focus { border-bottom-color: ${t.accent} !important; }
    .settings-input:disabled { color: ${t.textMuted} !important; -webkit-text-fill-color: ${t.textMuted} !important; cursor: not-allowed !important; }
    .settings-input:-webkit-autofill,
    .settings-input:-webkit-autofill:hover,
    .settings-input:-webkit-autofill:focus {
      -webkit-text-fill-color: ${t.text} !important;
      -webkit-box-shadow: 0 0 0px 1000px ${t.bg} inset !important;
      transition: background-color 5000s ease-in-out 0s !important;
    }

    .s-tab { padding:0 20px; height:52px; display:flex; align-items:center; font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.22em; cursor:pointer; border:none; background:transparent; border-right:1px solid ${t.accentBorder}; transition:color 0.2s; position:relative; }
    .s-tab:hover { color:${t.text} !important; }
    .s-tab.active { color:${t.text} !important; }
    .s-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:${t.accent}; }

    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
    .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }
  `;

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (!tab.sectionKey) { window.scrollTo({ top:0, behavior:'smooth' }); mainRef.current?.scrollTo({ top:0, behavior:'smooth' }); return; }
    sectionRefs[tab.sectionKey]?.current?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  useEffect(() => {
    const handle = () => {
      const offset = 100;
      for (const key of ['danger','system','profile']) {
        const el = sectionRefs[key]?.current;
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveTab(key === 'profile' ? 'PROFILE' : key === 'system' ? 'SYSTEM' : 'DANGER');
          return;
        }
      }
      setActiveTab('SETTINGS');
    };
    window.addEventListener('scroll', handle, { passive:true });
    const c = mainRef.current;
    if (c) c.addEventListener('scroll', handle, { passive:true });
    return () => { window.removeEventListener('scroll', handle); if (c) c.removeEventListener('scroll', handle); };
  }, []);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    setNameLoading(true); setNameError('');
    try {
      const res  = await fetch(`${API_BASE}/update-name`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` }, body: JSON.stringify({ name: tempName.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update name');
      setDisplayName(data.user.name);
      localStorage.setItem('userInfo', JSON.stringify({ ...JSON.parse(localStorage.getItem('userInfo') || '{}'), name: data.user.name }));
      setEditingName(false); setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) { setNameError(err.message.toUpperCase()); }
    finally { setNameLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('PASSWORDS DO NOT MATCH'); return; }
    if (pwForm.newPw.length < 6) { setPwError('MINIMUM 6 CHARACTERS REQUIRED'); return; }
    setPwLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/change-password`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` }, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setPwSuccess(true); setPwForm({ current:'', newPw:'', confirm:'' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) { setPwError(err.message.toUpperCase()); }
    finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true); setDeleteError('');
    try {
      const res  = await fetch(`${API_BASE}/delete-account`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete account');
      authService.logout(); navigate('/login');
    } catch (err) { setDeleteError(err.message.toUpperCase()); setDeleteLoading(false); }
  };

  const SectionHeader = ({ title }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
      <div style={{ width:'3px', height:'18px', background:t.accent, borderRadius:'2px' }}/>
      <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:t.textMuted, textTransform:'uppercase' }}>{title}</h2>
    </div>
  );

  const FieldLabel = ({ children }) => (
    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px' }}>{children}</div>
  );

  const ErrorMsg = ({ msg }) => msg ? (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.12em', color:'rgba(239,68,68,0.8)', marginTop:'8px' }}>
      <AlertCircle size={11}/> {msg}
    </div>
  ) : null;

  const topbarContent = (
    <div style={{ display:'flex', height:'100%' }}>
      {TABS.map((tab) => (
        <button key={tab.label} className={`s-tab${activeTab === tab.label ? ' active' : ''}`}
          onClick={() => handleTabClick(tab)}
          style={{ color: activeTab === tab.label ? t.text : t.textMuted }}>
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout topbarContent={topbarContent} returnPath="/dashboard">
      <style key={mode}>{css}</style>
      <div ref={mainRef} style={{ overflowY:'auto' }}>
        <main style={{ padding:'40px 48px', display:'flex', flexDirection:'column', gap:'48px' }}>

          <div className="fade-1">
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:t.textMuted, marginBottom:'8px' }}>// OPERATOR SETTINGS</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'2.2rem', color:t.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>MODIFY YOUR<br/>IDENTITY</h1>
            <p style={{ marginTop:'10px', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:t.textMuted, lineHeight:1.7 }}>
              MANAGE YOUR PROFILE, MONITOR SYSTEM STATUS, AND CONTROL ACCESS.
            </p>
          </div>

          {/* PROFILE */}
          <div ref={sectionRefs.profile} className="fade-2">
            <SectionHeader title="PROFILE" />
            <div style={{ border:`1px solid ${t.accentBorder}`, background:t.accentSofter, padding:'32px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'32px', paddingBottom:'28px', borderBottom:`1px solid ${t.accentBorder}` }}>
                <div style={{ width:'56px', height:'56px', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 0 20px ${t.accentGlow}` }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'#fff' }}>{(displayName || 'O')[0].toUpperCase()}</span>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:700, color:t.text, letterSpacing:'0.05em' }}>{displayName || 'OPERATOR'}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.12em', color:t.textMuted, marginTop:'4px' }}>{user?.email || ''}</div>
                </div>
                {nameSaved && (
                  <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px', fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.15em', color:t.accent }}>
                    <CheckCircle size={12}/> PROFILE_UPDATED
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'28px' }}>
                <div>
                  <FieldLabel>DISPLAY NAME</FieldLabel>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <input className="settings-input" value={editingName ? tempName : displayName} disabled={!editingName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setTempName(displayName); setNameError(''); } }}
                    />
                    {!editingName ? (
                      <button onClick={() => { setEditingName(true); setTempName(displayName); }} style={{ background:'transparent', border:'none', cursor:'pointer', color:t.textMuted, padding:'4px', transition:'color 0.2s', flexShrink:0 }}
                        onMouseEnter={e => e.currentTarget.style.color = t.accent}
                        onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
                        <Edit2 size={13}/>
                      </button>
                    ) : (
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        <button onClick={handleSaveName} disabled={nameLoading} style={{ background:'transparent', border:'none', cursor:'pointer', color:t.accent, padding:'4px' }}><Save size={13}/></button>
                        <button onClick={() => { setEditingName(false); setTempName(displayName); setNameError(''); }} style={{ background:'transparent', border:'none', cursor:'pointer', color:t.textMuted, padding:'4px' }}><X size={13}/></button>
                      </div>
                    )}
                  </div>
                  <ErrorMsg msg={nameError}/>
                </div>
                <div>
                  <FieldLabel>OPERATOR EMAIL <span style={{ color:t.textFaint, fontSize:'0.48rem' }}>(READ ONLY)</span></FieldLabel>
                  <input className="settings-input" value={user?.email || ''} disabled/>
                </div>
              </div>

              <div style={{ marginTop:'32px', paddingTop:'28px', borderTop:`1px solid ${t.accentBorder}` }}>
                <FieldLabel>CHANGE ACCESS KEY</FieldLabel>
                {pwSuccess ? (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.15em', color:t.accent, padding:'12px 0' }}>
                    <CheckCircle size={13}/> ACCESS_KEY_UPDATED
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginBottom:'20px' }}>
                      {[['CURRENT KEY','current',pwForm.current],['NEW KEY','newPw',pwForm.newPw],['CONFIRM KEY','confirm',pwForm.confirm]].map(([label,name,value]) => (
                        <div key={name}>
                          <FieldLabel>{label}</FieldLabel>
                          <input type="password" className="settings-input" value={value} placeholder="••••••••"
                            onChange={e => setPwForm(p => ({ ...p, [name]: e.target.value }))}/>
                        </div>
                      ))}
                    </div>
                    {pwError && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.12em', color:'rgba(239,68,68,0.8)', marginBottom:'16px' }}>⚠ {pwError}</div>}
                    <button type="submit" disabled={pwLoading} style={{ padding:'10px 24px', background:'transparent', border:`1px solid ${t.accentBorder}`, color:t.accent, fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.6 : 1, transition:'all 0.2s' }}
                      onMouseEnter={e => { if (!pwLoading) { e.currentTarget.style.background = t.accentBg; e.currentTarget.style.color = t.text; }}}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.accent; }}>
                      {pwLoading ? 'UPDATING...' : 'UPDATE_ACCESS_KEY →'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div ref={sectionRefs.system} className="fade-3">
            <SectionHeader title="SYSTEM STATUS" />
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {apiServices.map(({ icon:Icon, name, desc, status }, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'20px', padding:'18px 24px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
                  <div style={{ width:'36px', height:'36px', border:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:t.accentBg }}>
                    <Icon size={15} style={{ color:t.accent }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.18em', color:t.text, textTransform:'uppercase' }}>{name}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', color:t.textMuted, marginTop:'3px' }}>{desc}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'rgba(52,211,153,0.9)', animation:'pulse 2s ease-in-out infinite', boxShadow:'0 0 8px rgba(52,211,153,0.5)' }}/>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.2em', color:'rgba(52,211,153,0.8)' }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DANGER ZONE */}
          <div ref={sectionRefs.danger} className="fade-4">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'3px', height:'18px', background:'rgba(239,68,68,0.7)', borderRadius:'2px' }}/>
              <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'rgba(239,68,68,0.7)', textTransform:'uppercase' }}>DANGER ZONE</h2>
            </div>
            <div style={{ border:'1px solid rgba(239,68,68,0.2)', padding:'28px', background:'rgba(239,68,68,0.03)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.18em', color:'rgba(239,68,68,0.7)', textTransform:'uppercase', marginBottom:'6px' }}>TERMINATE OPERATOR ACCOUNT</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.82rem', color:t.textMuted, lineHeight:1.6 }}>
                    This action is irreversible. All debate records, scores and session history will be permanently erased.
                  </div>
                </div>
                {!showDeleteInput ? (
                  <button onClick={() => setShowDeleteInput(true)} style={{ padding:'10px 24px', background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.7)', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}>
                    TERMINATE_ACCOUNT →
                  </button>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', minWidth:'260px' }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(239,68,68,0.5)' }}>TYPE "DELETE" TO CONFIRM</div>
                    <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value.toUpperCase())} placeholder="DELETE"
                      style={{ background:'transparent', border:'none', borderBottom:'1px solid rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.8)', fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', padding:'6px 0', outline:'none', letterSpacing:'0.15em', caretColor:'rgba(239,68,68,0.8)' }}/>
                    {deleteError && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:'rgba(239,68,68,0.8)' }}>⚠ {deleteError}</div>}
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                        style={{ padding:'8px 16px', background: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.15)' : 'transparent', border:'1px solid rgba(239,68,68,0.3)', color: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)', fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor: deleteConfirm === 'DELETE' && !deleteLoading ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                        {deleteLoading ? 'TERMINATING...' : 'CONFIRM'}
                      </button>
                      <button onClick={() => { setShowDeleteInput(false); setDeleteConfirm(''); setDeleteError(''); }}
                        style={{ padding:'8px 16px', background:'transparent', border:`1px solid ${t.accentBorder}`, color:t.textMuted, fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = t.text}
                        onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </PageLayout>
  );
}