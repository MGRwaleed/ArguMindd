import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, BookOpen, Shield, BarChart2, Archive,
  Settings, HelpCircle, LogOut, Edit2, Save, X,
  CheckCircle, Brain, Cpu, Database, AlertCircle
} from 'lucide-react';
import authService from '../services/authService';

const API_BASE = 'http://localhost:5000/api/auth';

const themeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes particleDrift {
    0%   { transform:translateY(0) translateX(0); opacity:0; }
    10%  { opacity:0.5; } 90% { opacity:0.15; }
    100% { transform:translateY(-80vh) translateX(30px); opacity:0; }
  }
  @keyframes gridPulse {
    0%,100% { opacity:0.04; } 50% { opacity:0.08; }
  }
  @keyframes scanline {
    0%   { transform:translateY(-100%); }
    100% { transform:translateY(100vh); }
  }
  @keyframes pulse {
    0%,100% { transform:scale(1); opacity:1; }
    50%      { transform:scale(1.2); opacity:0.7; }
  }

  .v-nav-btn {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:9px 16px; border:none; background:transparent;
    cursor:pointer; text-align:left; transition:all 0.2s;
    font-family:'Space Mono', monospace;
    border-left: 2px solid transparent;
  }
  .v-nav-btn:hover {
    background: rgba(180,83,9,0.12);
    border-left-color: rgba(180,83,9,0.4) !important;
    color: #E5E7EB !important;
  }

  .settings-input {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(156,163,175,0.25) !important;
    color: #E5E7EB !important;
    -webkit-text-fill-color: #E5E7EB !important;
    caret-color: #B45309 !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.78rem !important;
    letter-spacing: 0.1em !important;
    padding: 8px 0 !important;
    outline: none !important;
    transition: border-color 0.3s !important;
    width: 100%;
  }
  .settings-input:focus { border-bottom-color: #B45309 !important; }
  .settings-input:disabled {
    color: #9CA3AF !important;
    -webkit-text-fill-color: #9CA3AF !important;
    cursor: not-allowed !important;
  }
  .settings-input:-webkit-autofill,
  .settings-input:-webkit-autofill:hover,
  .settings-input:-webkit-autofill:focus {
    -webkit-text-fill-color: #E5E7EB !important;
    -webkit-box-shadow: 0 0 0px 1000px #1F2937 inset !important;
    transition: background-color 5000s ease-in-out 0s !important;
  }

  .top-tab {
    padding: 0 20px; height: 52px; display: flex; align-items: center;
    font-family: 'Space Mono', monospace; font-size: 0.6rem; letter-spacing: 0.22em;
    cursor: pointer; border: none; background: transparent;
    border-right: 1px solid rgba(180,83,9,0.12);
    transition: color 0.2s; position: relative;
  }
  .top-tab:hover { color: #E5E7EB !important; }
  .top-tab.active { color: #E5E7EB !important; }
  .top-tab.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: #B45309;
  }

  .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
  .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
  .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
  .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }
`;

const navItems = [
  { icon: BookOpen,  label: 'COMMAND',  sub: 'Dashboard',   path: '/dashboard' },
  { icon: Archive,   label: 'ARCHIVES', sub: 'History',     path: '/debates/history' },
  { icon: BarChart2, label: 'SYSTEMS',  sub: 'Analytics',   path: '/analytics' },
  { icon: Shield,    label: 'COUNCIL',  sub: 'Leaderboard', path: '/leaderboard' },
];

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

const getToken = () => localStorage.getItem('userToken');

export default function SettingsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]     = useState('SETTINGS');
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // Name
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [tempName, setTempName]       = useState(user?.name || '');
  const [nameSaved, setNameSaved]     = useState(false);
  const [nameError, setNameError]     = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Password
  const [pwForm, setPwForm]       = useState({ current:'', newPw:'', confirm:'' });
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm]     = useState('');
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deleteError, setDeleteError]         = useState('');
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const mainRef = useRef(null);
  const sectionRefs = {
    profile: useRef(null),
    system:  useRef(null),
    danger:  useRef(null),
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (!tab.sectionKey) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    sectionRefs[tab.sectionKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = 100;
      const order = ['danger', 'system', 'profile'];
      for (const key of order) {
        const el = sectionRefs[key]?.current;
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveTab(key === 'profile' ? 'PROFILE' : key === 'system' ? 'SYSTEM' : 'DANGER');
          return;
        }
      }
      setActiveTab('SETTINGS');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const container = mainRef.current;
    if (container) container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 30}%`,
    delay: `${Math.random() * 12}s`, duration: `${8 + Math.random() * 10}s`,
    size: `${1 + Math.random() * 1.5}px`,
  }));

  // ── Save Name ──
  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    setNameLoading(true);
    setNameError('');
    try {
      const res = await fetch(`${API_BASE}/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: tempName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update name');
      setDisplayName(data.user.name);
      const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...stored, name: data.user.name }));
      setEditingName(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) {
      setNameError(err.message.toUpperCase());
    } finally {
      setNameLoading(false);
    }
  };

  // ── Change Password ──
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('PASSWORDS DO NOT MATCH'); return; }
    if (pwForm.newPw.length < 6) { setPwError('MINIMUM 6 CHARACTERS REQUIRED'); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setPwSuccess(true);
      setPwForm({ current:'', newPw:'', confirm:'' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.message.toUpperCase());
    } finally {
      setPwLoading(false);
    }
  };

  // ── Delete Account ──
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_BASE}/delete-account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete account');
      authService.logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message.toUpperCase());
      setDeleteLoading(false);
    }
  };

  const SectionHeader = ({ title }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
      <div style={{ width:'3px', height:'18px', background:'#B45309', borderRadius:'2px' }}/>
      <h2 style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'#9CA3AF', textTransform:'uppercase' }}>{title}</h2>
    </div>
  );

  const FieldLabel = ({ children }) => (
    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:'#9CA3AF', textTransform:'uppercase', marginBottom:'8px' }}>
      {children}
    </div>
  );

  const ErrorMsg = ({ msg }) => msg ? (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.12em', color:'rgba(239,68,68,0.8)', marginTop:'8px' }}>
      <AlertCircle size={11}/> {msg}
    </div>
  ) : null;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#1F2937', fontFamily:"'Space Grotesk', sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{themeStyles}</style>

      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(180,83,9,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(180,83,9,0.05) 1px, transparent 1px)`, backgroundSize:'60px 60px', animation:'gridPulse 5s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', left:0, right:0, height:'2px', zIndex:1, pointerEvents:'none', background:'linear-gradient(transparent, rgba(180,83,9,0.06), transparent)', animation:'scanline 10s linear infinite' }}/>
      {particles.map(p => (
        <div key={p.id} style={{ position:'fixed', left:p.left, bottom:p.bottom, width:p.size, height:p.size, borderRadius:'50%', background:'#B45309', opacity:0, pointerEvents:'none', zIndex:1, animation:`particleDrift ${p.duration} ${p.delay} infinite linear` }}/>
      ))}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(180,83,9,0.08) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }}/>

      {/* ── SIDEBAR ── */}
      <aside style={{ position:'relative', zIndex:20, display:'flex', flexDirection:'column', width: sidebarOpen ? '200px' : '56px', minHeight:'100vh', flexShrink:0, background:'#111827', borderRight:'1px solid rgba(180,83,9,0.2)', transition:'width 0.3s ease' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(180,83,9,0.15)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', background:'#B45309', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(180,83,9,0.4)' }}>
            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', color:'#fff', fontWeight:700 }}>AM</span>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.25em', color:'#E5E7EB' }}>ARGUMIND</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.48rem', letterSpacing:'0.15em', color:'#9CA3AF', marginTop:'1px' }}>AI DEBATE ASSISTANT</div>
            </div>
          )}
        </div>
        <nav style={{ flex:1, padding:'12px 0' }}>
          {navItems.map(({ icon:Icon, label, sub, path }) => {
            const isActive = window.location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} className="v-nav-btn"
                style={{ color: isActive ? '#B45309' : '#9CA3AF', borderLeftColor: isActive ? '#B45309' : 'transparent', background: isActive ? 'rgba(180,83,9,0.1)' : 'transparent' }}
              >
                <Icon size={14} style={{ flexShrink:0 }}/>
                {sidebarOpen && (
                  <div>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.18em' }}>{label}</div>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.48rem', letterSpacing:'0.12em', color:'#4B5563', marginTop:'1px' }}>{sub}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:'8px 0', borderTop:'1px solid rgba(180,83,9,0.15)' }}>
          {sidebarOpen && (
            <div style={{ padding:'10px 16px 14px' }}>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:'#E5E7EB' }}>{(displayName || 'OPERATOR').toUpperCase()}</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.1em', color:'#9CA3AF', marginTop:'2px' }}>{user?.email || ''}</div>
            </div>
          )}
          <button className="v-nav-btn" style={{ color:'#E5E7EB', background:'rgba(180,83,9,0.1)', borderLeft:'2px solid #B45309' }}>
            <Settings size={13} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.18em' }}>SETTINGS</span>}
          </button>
          <button className="v-nav-btn" onClick={() => navigate('/support')} style={{ color:'#9CA3AF' }}>
            <HelpCircle size={13} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.18em' }}>SUPPORT</span>}
          </button>
          <button className="v-nav-btn" onClick={() => { authService.logout(); navigate('/login'); }} style={{ color:'#9CA3AF' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E5E7EB'; e.currentTarget.style.background = 'rgba(180,83,9,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={13} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.18em' }}>DISCONNECT</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position:'absolute', right:'-12px', top:'22px', width:'24px', height:'24px', border:'1px solid rgba(180,83,9,0.4)', background:'#111827', color:'#B45309', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:30, boxShadow:'0 0 8px rgba(180,83,9,0.2)' }}>
          <ChevronLeft size={11} style={{ transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s' }}/>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div ref={mainRef} style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', position:'relative', zIndex:10 }}>

        <header style={{ position:'sticky', top:0, zIndex:20, padding:'0 32px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(31,41,55,0.97)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(180,83,9,0.2)', height:'52px' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>
          <div style={{ display:'flex', height:'100%' }}>
            {TABS.map((tab) => (
              <button key={tab.label} className={`top-tab${activeTab === tab.label ? ' active' : ''}`}
                onClick={() => handleTabClick(tab)}
                style={{ color: activeTab === tab.label ? '#E5E7EB' : '#9CA3AF' }}
              >{tab.label}</button>
            ))}
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding:'8px 20px', background:'transparent', border:'1px solid rgba(180,83,9,0.3)', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.2em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,83,9,0.1)'; e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#E5E7EB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(180,83,9,0.3)'; e.currentTarget.style.color = '#9CA3AF'; }}
          >← RETURN TO COMMAND</button>
        </header>

        <main style={{ padding:'40px 48px', display:'flex', flexDirection:'column', gap:'48px' }}>

          <div className="fade-1">
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:'#9CA3AF', marginBottom:'8px' }}>// OPERATOR SETTINGS</div>
            <h1 style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'2.2rem', color:'#E5E7EB', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              MODIFY YOUR<br/>IDENTITY
            </h1>
            <p style={{ marginTop:'10px', fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:'#9CA3AF', lineHeight:1.7 }}>
              MANAGE YOUR PROFILE, MONITOR SYSTEM STATUS, AND CONTROL ACCESS.
            </p>
          </div>

          {/* ── PROFILE ── */}
          <div ref={sectionRefs.profile} className="fade-2">
            <SectionHeader title="PROFILE" />
            <div style={{ border:'1px solid rgba(180,83,9,0.2)', background:'rgba(75,85,99,0.15)', padding:'32px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'32px', paddingBottom:'28px', borderBottom:'1px solid rgba(180,83,9,0.1)' }}>
                <div style={{ width:'56px', height:'56px', background:'#B45309', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 20px rgba(180,83,9,0.3)' }}>
                  <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'1.4rem', fontWeight:700, color:'#fff' }}>
                    {(displayName || 'O')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'1.1rem', fontWeight:700, color:'#E5E7EB', letterSpacing:'0.05em' }}>{displayName || 'OPERATOR'}</div>
                  <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.12em', color:'#9CA3AF', marginTop:'4px' }}>{user?.email || ''}</div>
                </div>
                {nameSaved && (
                  <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px', fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.15em', color:'#B45309' }}>
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
                      <button onClick={() => { setEditingName(true); setTempName(displayName); }} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#9CA3AF', padding:'4px', transition:'color 0.2s', flexShrink:0 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#B45309'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                      ><Edit2 size={13}/></button>
                    ) : (
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        <button onClick={handleSaveName} disabled={nameLoading} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#B45309', padding:'4px' }}><Save size={13}/></button>
                        <button onClick={() => { setEditingName(false); setTempName(displayName); setNameError(''); }} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#9CA3AF', padding:'4px' }}><X size={13}/></button>
                      </div>
                    )}
                  </div>
                  <ErrorMsg msg={nameError}/>
                </div>
                <div>
                  <FieldLabel>OPERATOR EMAIL <span style={{ color:'#4B5563', fontSize:'0.48rem' }}>(READ ONLY)</span></FieldLabel>
                  <input className="settings-input" value={user?.email || ''} disabled/>
                </div>
              </div>

              <div style={{ marginTop:'32px', paddingTop:'28px', borderTop:'1px solid rgba(180,83,9,0.1)' }}>
                <FieldLabel>CHANGE ACCESS KEY</FieldLabel>
                {pwSuccess ? (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.15em', color:'#B45309', padding:'12px 0' }}>
                    <CheckCircle size={13}/> ACCESS_KEY_UPDATED
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginBottom:'20px' }}>
                      {[
                        { label:'CURRENT KEY', name:'current', value:pwForm.current },
                        { label:'NEW KEY',     name:'newPw',   value:pwForm.newPw },
                        { label:'CONFIRM KEY', name:'confirm', value:pwForm.confirm },
                      ].map(({ label, name, value }) => (
                        <div key={name}>
                          <FieldLabel>{label}</FieldLabel>
                          <input type="password" className="settings-input" value={value} placeholder="••••••••"
                            onChange={e => setPwForm(p => ({ ...p, [name]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                    {pwError && <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.12em', color:'rgba(239,68,68,0.8)', marginBottom:'16px' }}>⚠ {pwError}</div>}
                    <button type="submit" disabled={pwLoading} style={{ padding:'10px 24px', background:'transparent', border:'1px solid rgba(180,83,9,0.4)', color:'#B45309', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.6 : 1, transition:'all 0.2s' }}
                      onMouseEnter={e => { if (!pwLoading) { e.currentTarget.style.background = 'rgba(180,83,9,0.12)'; e.currentTarget.style.color = '#E5E7EB'; }}}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B45309'; }}
                    >{pwLoading ? 'UPDATING...' : 'UPDATE_ACCESS_KEY →'}</button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── SYSTEM STATUS ── */}
          <div ref={sectionRefs.system} className="fade-3">
            <SectionHeader title="SYSTEM STATUS" />
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {apiServices.map(({ icon:Icon, name, desc, status }, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'20px', padding:'18px 24px', border:'1px solid rgba(180,83,9,0.15)', background:'rgba(75,85,99,0.15)' }}>
                  <div style={{ width:'36px', height:'36px', border:'1px solid rgba(180,83,9,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(180,83,9,0.08)' }}>
                    <Icon size={15} style={{ color:'#B45309' }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.18em', color:'#E5E7EB', textTransform:'uppercase' }}>{name}</div>
                    <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.78rem', color:'#9CA3AF', marginTop:'3px' }}>{desc}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'rgba(52,211,153,0.9)', animation:'pulse 2s ease-in-out infinite', boxShadow:'0 0 8px rgba(52,211,153,0.5)' }}/>
                    <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.2em', color:'rgba(52,211,153,0.8)' }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DANGER ZONE ── */}
          <div ref={sectionRefs.danger} className="fade-4">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'3px', height:'18px', background:'rgba(239,68,68,0.7)', borderRadius:'2px' }}/>
              <h2 style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'rgba(239,68,68,0.7)', textTransform:'uppercase' }}>DANGER ZONE</h2>
            </div>
            <div style={{ border:'1px solid rgba(239,68,68,0.2)', padding:'28px', background:'rgba(239,68,68,0.03)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.18em', color:'rgba(239,68,68,0.7)', textTransform:'uppercase', marginBottom:'6px' }}>TERMINATE OPERATOR ACCOUNT</div>
                  <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.82rem', color:'#9CA3AF', lineHeight:1.6 }}>
                    This action is irreversible. All debate records, scores and session history will be permanently erased.
                  </div>
                </div>
                {!showDeleteInput ? (
                  <button onClick={() => setShowDeleteInput(true)} style={{ padding:'10px 24px', background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.7)', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  >TERMINATE_ACCOUNT →</button>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', minWidth:'260px' }}>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(239,68,68,0.5)' }}>TYPE "DELETE" TO CONFIRM</div>
                    <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value.toUpperCase())} placeholder="DELETE"
                      style={{ background:'transparent', border:'none', borderBottom:'1px solid rgba(239,68,68,0.3)', color:'rgba(239,68,68,0.8)', fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', padding:'6px 0', outline:'none', letterSpacing:'0.15em', caretColor:'rgba(239,68,68,0.8)' }}
                    />
                    {deleteError && <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.12em', color:'rgba(239,68,68,0.8)' }}>⚠ {deleteError}</div>}
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                        style={{ padding:'8px 16px', background: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.15)' : 'transparent', border:'1px solid rgba(239,68,68,0.3)', color: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)', fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor: deleteConfirm === 'DELETE' && !deleteLoading ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}
                      >{deleteLoading ? 'TERMINATING...' : 'CONFIRM'}</button>
                      <button onClick={() => { setShowDeleteInput(false); setDeleteConfirm(''); setDeleteError(''); }}
                        style={{ padding:'8px 16px', background:'transparent', border:'1px solid rgba(180,83,9,0.2)', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#E5E7EB'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                      >CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}