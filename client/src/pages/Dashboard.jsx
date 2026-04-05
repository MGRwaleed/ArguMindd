import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, LogOut, Settings, HelpCircle,
  BookOpen, Shield, BarChart2, Archive,
  Plus, ChevronRight, Sun, Moon,
  MessageSquare, Trophy, TrendingUp, Clock
} from 'lucide-react';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, mode, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('RECENT');
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const t = theme;

  const SIDEBAR_W = sidebarOpen ? 200 : 56;

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const css = `
    * { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes particleDrift {
      0%   { transform:translateY(0) translateX(0); opacity:0; }
      10%  { opacity:0.5; } 90% { opacity:0.15; }
      100% { transform:translateY(-80vh) translateX(30px); opacity:0; }
    }
    @keyframes scanline {
      0%   { transform:translateY(-100%); }
      100% { transform:translateY(100vh); }
    }
    @keyframes modalIn {
      from { opacity:0; transform:scale(0.95) translateY(8px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }

    .nav-btn {
      width:100%; display:flex; align-items:center; gap:12px;
      padding:10px 16px; border:none; background:transparent;
      cursor:pointer; text-align:left; transition:all 0.2s;
      font-family: var(--font-body);
      font-size: 0.75rem; font-weight: 500; letter-spacing: 0.04em;
      border-left:2px solid transparent; color: ${t.textMuted};
    }
    .nav-btn:hover { background: ${t.accentBg}; border-left-color: ${t.accent}; color: ${t.text}; }

    .stat-card {
      padding: 28px 24px; background: ${t.surface}; border: 1px solid ${t.border};
      border-radius: 4px; transition: all 0.25s ease; cursor: default;
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: ${t.accent}; transform:scaleX(0); transition:transform 0.3s ease; transform-origin:left;
    }
    .stat-card:hover { border-color:${t.accentBorder}; box-shadow:${t.cardHoverShadow}; transform:translateY(-2px); }
    .stat-card:hover::before { transform:scaleX(1); }

    .top-tab {
      padding: 8px 20px; background: transparent; border: 1px solid ${t.border};
      border-radius: 4px; font-family: var(--font-body); font-size: 0.7rem;
      font-weight: 600; letter-spacing: 0.1em; color: ${t.textMuted};
      cursor: pointer; transition: all 0.2s; text-transform: uppercase;
    }
    .top-tab:hover { border-color:${t.accent}; color:${t.text}; background:${t.accentSoft}; }
    .top-tab.active { background:${t.accentBg}; border-color:${t.accent}; color:${t.accent}; font-weight:700; }

    .debate-row {
      display:grid; grid-template-columns:1fr 140px 100px 90px 32px;
      gap:16px; align-items:center; padding:16px 20px;
      cursor:pointer; border-bottom:1px solid ${t.border}; transition:all 0.2s;
    }
    .debate-row:hover { background: ${t.accentSofter}; }
    .debate-row:last-child { border-bottom:none; }

    .theme-toggle {
      width:44px; height:24px; background:${t.accentBg}; border:1px solid ${t.accent};
      border-radius:12px; cursor:pointer; position:relative; transition:all 0.3s;
      display:flex; align-items:center; padding:2px;
    }
    .theme-toggle-knob {
      width:18px; height:18px; background:${t.accent}; border-radius:50%;
      transition:transform 0.3s; transform:translateX(${mode === 'light' ? '20px' : '0px'});
      display:flex; align-items:center; justify-content:center;
    }

    .modal-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,0.6);
      backdrop-filter:blur(4px); z-index:100;
      display:flex; align-items:center; justify-content:center;
    }
    .modal-box {
      background:${t.surface}; border:1px solid ${t.accentBorder};
      border-radius:8px; padding:36px 32px; width:100%; max-width:400px;
      position:relative; animation:modalIn 0.2s ease forwards;
    }
    .modal-box::before {
      content:''; position:absolute; top:0; left:0; right:0;
      height:3px; background:${t.accent}; border-radius:8px 8px 0 0;
    }
    .btn-cancel {
      flex:1; padding:12px; background:transparent;
      border:1px solid ${t.border}; border-radius:4px;
      color:${t.textMuted}; font-family:var(--font-body);
      font-size:0.8rem; font-weight:500; letter-spacing:0.06em;
      text-transform:uppercase; cursor:pointer; transition:all 0.2s;
    }
    .btn-cancel:hover { border-color:${t.accentBorder}; color:${t.text}; background:${t.accentBg}; }
    .btn-confirm {
      flex:1; padding:12px; background:${t.accent};
      border:none; border-radius:4px;
      color:#fff; font-family:var(--font-body);
      font-size:0.8rem; font-weight:600; letter-spacing:0.06em;
      text-transform:uppercase; cursor:pointer; transition:all 0.2s;
    }
    .btn-confirm:hover { background:#c2410c; transform:translateY(-1px); box-shadow:0 4px 12px rgba(180,83,9,0.4); }

    .fade-1 { animation:fadeUp 0.7s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.7s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.7s 0.25s ease forwards; opacity:0; }
    .fade-4 { animation:fadeUp 0.7s 0.35s ease forwards; opacity:0; }
  `;

  const navItems = [
    { icon: BookOpen,  label: 'COMMAND',  sub: 'Dashboard',   path: '/dashboard' },
    { icon: Archive,   label: 'ARCHIVES', sub: 'History',     path: '/debates/history' },
    { icon: BarChart2, label: 'SYSTEMS',  sub: 'Analytics',   path: '/analytics' },
    { icon: Shield,    label: 'COUNCIL',  sub: 'Leaderboard', path: '/leaderboard' },
  ];

  const topTabs = [
    { label: 'OVERVIEW',  path: '/dashboard' },
    { label: 'HISTORY',   path: '/debates/history' },
    { label: 'ANALYTICS', path: '/analytics' },
  ];

  const statCards = [
    { icon: MessageSquare, value: '42',    label: 'Active Sessions',  sub: '+4 this week' },
    { icon: Trophy,        value: '89.4%', label: 'Avg Score',        sub: 'Top 7% globally' },
    { icon: TrendingUp,    value: '12',    label: 'Active Protocols', sub: 'Ongoing debates' },
    { icon: Clock,         value: '742',   label: 'ELO Ranking',      sub: 'Global standing' },
  ];

  const mockDebates = [
    { id:1, topic:'The Ethics of Neural Link Integration',          opponent:'ZAID MENCHO',    score:'92/100', outcome:'VICTORY' },
    { id:2, topic:'Decentralized Governance in Mars Colonies',      opponent:'SAMEER RONALDO', score:'41/100', outcome:'DEFEAT'  },
    { id:3, topic:'Consciousness via Computational Work',           opponent:'MOSES MESSI',    score:'78/100', outcome:'VICTORY' },
    { id:4, topic:'Quantum Entanglement as Communication Protocol', opponent:'SAFFAN SMARTIE', score:'85/100', outcome:'VICTORY' },
  ];

  const particles = React.useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 30}%`,
    delay: `${Math.random() * 12}s`, duration: `${8 + Math.random() * 10}s`,
    size: `${1 + Math.random() * 1.5}px`,
  })), []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: t.bg, position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{css}</style>

      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`, backgroundSize:'80px 80px', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', left:0, right:0, height:'2px', zIndex:1, pointerEvents:'none', background:`linear-gradient(transparent, ${t.scanline}, transparent)`, animation:'scanline 10s linear infinite' }}/>
      {particles.map(p => (
        <div key={p.id} style={{ position:'fixed', left:p.left, bottom:p.bottom, width:p.size, height:p.size, borderRadius:'50%', background: t.particle, opacity:0, pointerEvents:'none', zIndex:1, animation:`particleDrift ${p.duration} ${p.delay} infinite linear` }}/>
      ))}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'500px', height:'500px', background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`, pointerEvents:'none', zIndex:0 }}/>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:`rgba(180,83,9,0.12)`, border:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <LogOut size={20} style={{ color: t.accent }}/>
              </div>
            </div>
            <div style={{ textAlign:'center', marginBottom:'28px' }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-lg)', color: t.text, fontWeight:400, marginBottom:'10px' }}>Leaving the Arena?</h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color: t.textMuted, lineHeight:'var(--lh-normal)', fontWeight:400 }}>
                Your session will be terminated.<br/>You'll need to sign in again to continue.
              </p>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Stay In</button>
              <button className="btn-confirm" onClick={handleLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        position:'fixed', top:0, left:0, zIndex:20,
        display:'flex', flexDirection:'column',
        width: `${SIDEBAR_W}px`, height:'100vh', flexShrink:0,
        background: t.surface, borderRight:`1px solid ${t.border}`,
        transition:'width 0.3s ease, background 0.3s ease',
        overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: t.accent }}/>

        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'32px', height:'32px', background: t.accent, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px', boxShadow:`0 0 12px ${t.accentGlow}` }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.55rem', fontWeight:700, color:'#FEF9F3' }}>AM</span>
          </div>
          {sidebarOpen && (
            <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', color: t.text, lineHeight:1.1 }}>ArguMind</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0', overflowY:'auto' }}>
          {navItems.map(({ icon:Icon, label, sub, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} className="nav-btn"
                style={{ color: isActive ? t.accent : t.textMuted, borderLeftColor: isActive ? t.accent : 'transparent', background: isActive ? t.accentBg : 'transparent' }}>
                <Icon size={14} style={{ flexShrink:0 }}/>
                {sidebarOpen && (
                  <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
                    <div style={{ fontSize:'0.7rem', letterSpacing:'0.1em', fontWeight:600 }}>{label}</div>
                    <div style={{ fontSize:'0.6rem', color: t.textMuted, marginTop:'1px', fontWeight:400 }}>{sub}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'8px 0', borderTop:`1px solid ${t.border}`, flexShrink:0 }}>
          {sidebarOpen && (
            <div style={{ padding:'10px 16px 14px', overflow:'hidden', whiteSpace:'nowrap' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', letterSpacing:'0.06em', color: t.text, fontWeight:600 }}>{(user?.name || 'Operator').toUpperCase()}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', color: t.textMuted, marginTop:'2px', fontWeight:400 }}>{user?.email || ''}</div>
            </div>
          )}
          <button className="nav-btn" onClick={() => navigate('/settings')}><Settings size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Settings</span>}</button>
          <button className="nav-btn" onClick={() => navigate('/support')}><HelpCircle size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Support</span>}</button>
          <button className="nav-btn" onClick={() => setShowLogoutModal(true)}
            onMouseEnter={e => e.currentTarget.style.color = t.accent}
            onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
            <LogOut size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle — moved inside sidebar, no negative right */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position:'absolute', bottom:'50%', right:0, width:'20px', height:'40px', border:`1px solid ${t.border}`, borderRight:'none', background: t.surface, color: t.textMuted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px 0 0 4px', zIndex:30, transition:'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = t.accentBg}
          onMouseLeave={e => e.currentTarget.style.background = t.surface}>
          <ChevronLeft size={11} style={{ transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s' }}/>
        </button>
      </aside>

      {/* ── MAIN — offset by sidebar width ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', position:'relative', zIndex:10, marginLeft:`${SIDEBAR_W}px`, transition:'margin-left 0.3s ease' }}>

        <header style={{ position:'sticky', top:0, zIndex:20, padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', background: t.surface, borderBottom:`2px solid ${t.accent}`, height:'60px', transition:'background 0.3s ease' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: t.topbarGradient }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {topTabs.map(({ label, path }) => (
              <button key={path} onClick={() => navigate(path)} className={`top-tab${location.pathname === path ? ' active' : ''}`}>{label}</button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Sun size={13} style={{ color: mode === 'light' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
              <button className="theme-toggle" onClick={toggle}>
                <div className="theme-toggle-knob">
                  {mode === 'dark' ? <Moon size={10} style={{ color:'#FEF9F3' }}/> : <Sun size={10} style={{ color:'#FEF9F3' }}/>}
                </div>
              </button>
              <Moon size={13} style={{ color: mode === 'dark' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
            </div>
            <button onClick={() => navigate('/debate/new')}
              style={{ padding:'10px 24px', background: t.accent, border:'none', borderRadius:'4px', color:'#FEF9F3', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${t.accentGlow}`; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              New Debate
            </button>
          </div>
        </header>

        <main style={{ padding:'48px 48px 80px', display:'flex', flexDirection:'column', gap:'48px' }}>

          <div className="fade-1">
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-2xl)', color: t.text, lineHeight:'var(--lh-tight)', letterSpacing:'var(--ls-tight)', fontWeight:400 }}>
              Welcome Back, <span style={{ color: t.accent }}>{(user?.name || 'Operator').toUpperCase()}</span>
            </h1>
          </div>

          <div className="fade-2" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }}>
            {statCards.map(({ icon:Icon, value, label, sub }, i) => (
              <div key={i} className="stat-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <div style={{ width:'36px', height:'36px', background: t.accentBg, border:`1px solid ${t.accentBorder}`, borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={16} style={{ color: t.accent }}/>
                  </div>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.6rem', letterSpacing:'0.1em', color: t.textFaint, textTransform:'uppercase', fontWeight:500 }}>{sub}</span>
                </div>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-2xl)', color: t.text, lineHeight:1 }}>{value}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.08em', color: t.textMuted, marginTop:'10px', textTransform:'uppercase', fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="fade-3" style={{ position:'relative', padding:'56px 48px', overflow:'hidden', border:`1px solid ${t.border}`, background: t.bannerGradient, borderRadius:'4px' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: t.topbarGradient }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'48px', flexWrap:'wrap' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                  <div style={{ width:'8px', height:'8px', background: t.accent, borderRadius:'50%', boxShadow:`0 0 8px ${t.accentGlow}` }}/>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', letterSpacing:'0.1em', color: t.accent, textTransform:'uppercase', fontWeight:600 }}>AI Judge Ready</span>
                </div>
                <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-3xl)', color: t.text, textTransform:'uppercase', lineHeight:'var(--lh-tight)', fontWeight:400 }}>
                  Ready to<br/>Debate?
                </h2>
                <p style={{ marginTop:'20px', fontFamily:'var(--font-body)', fontSize:'0.9rem', color: t.textMuted, lineHeight:'var(--lh-relaxed)', maxWidth:'480px', fontWeight:400 }}>
                  Submit your argument. Let the AI judge decide.<br/>Fair analysis. Unbiased verdicts.
                </p>
              </div>
              <button onClick={() => navigate('/debate/new')}
                style={{ padding:'16px 36px', background: t.accent, border:'none', borderRadius:'4px', color:'#FEF9F3', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${t.accentGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                Start Session →
              </button>
            </div>
          </div>

          <div className="fade-4">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-lg)', color: t.text, fontWeight:400 }}>Session History</h3>
                <div style={{ display:'flex', gap:'8px' }}>
                  {['RECENT','VICTORY','DEFEAT'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      style={{ padding:'6px 14px', background: activeFilter === f ? t.accentBg : 'transparent', border:'1px solid', borderColor: activeFilter === f ? t.accent : t.border, borderRadius:'4px', fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.08em', color: activeFilter === f ? t.accent : t.textMuted, cursor:'pointer', transition:'all 0.2s', fontWeight: activeFilter === f ? 600 : 400 }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', letterSpacing:'0.08em', color: t.textMuted, background:'transparent', border:'none', cursor:'pointer', transition:'color 0.2s', fontWeight:500 }}
                onMouseEnter={e => e.target.style.color = t.accent}
                onMouseLeave={e => e.target.style.color = t.textMuted}>VIEW ALL →</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px 32px', gap:'16px', padding:'12px 20px', borderBottom:`1px solid ${t.border}`, background: t.surface }}>
              {['Debate Subject','Opponent','Score','Outcome',''].map((h, i) => (
                <span key={i} style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.12em', color: t.textMuted, textTransform:'uppercase', fontWeight:600 }}>{h}</span>
              ))}
            </div>

            <div style={{ border:`1px solid ${t.border}`, borderTop:'none' }}>
              {mockDebates.map(d => (
                <div key={d.id} className="debate-row">
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:500, color: t.text, lineHeight:1.4 }}>{d.topic}</p>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color: t.textMuted, fontWeight:400 }}>{d.opponent}</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color: t.text, fontWeight:600 }}>{d.score}</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color: d.outcome === 'VICTORY' ? t.victory : t.defeat, fontWeight:700 }}>{d.outcome}</span>
                  <ChevronRight size={14} style={{ color: t.textMuted }}/>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/debate/new')}
              style={{ marginTop:'20px', width:'100%', padding:'14px', background:'transparent', border:`1px solid ${t.border}`, borderRadius:'4px', color: t.textMuted, fontFamily:'var(--font-body)', fontSize:'0.75rem', letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s', fontWeight:500 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; e.currentTarget.style.background = t.accentSoft; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent'; }}>
              <Plus size={14}/> Initiate New Debate
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}