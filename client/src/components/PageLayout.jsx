import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, BookOpen, Shield, BarChart2, Archive,
  Settings, HelpCircle, LogOut, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';

const navItems = [
  { icon: BookOpen,  label: 'COMMAND',  sub: 'Dashboard',   path: '/dashboard' },
  { icon: Archive,   label: 'ARCHIVES', sub: 'History',     path: '/debates/history' },
  { icon: BarChart2, label: 'SYSTEMS',  sub: 'Analytics',   path: '/analytics' },
  { icon: Shield,    label: 'COUNCIL',  sub: 'Leaderboard', path: '/leaderboard' },
];

export default function PageLayout({ children, pageTitle, returnPath = '/dashboard', returnLabel = '← RETURN TO COMMAND', topbarContent }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme: t, toggle, mode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const SIDEBAR_W = sidebarOpen ? 200 : 56;

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const particles = React.useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bottom: `${Math.random() * 30}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 10}s`,
    size: `${1 + Math.random() * 1.5}px`,
  })), []);

  const css = `
    * { box-sizing: border-box; }

    @keyframes particleDrift {
      0%   { transform:translateY(0) translateX(0); opacity:0; }
      10%  { opacity:0.5; } 90% { opacity:0.15; }
      100% { transform:translateY(-80vh) translateX(30px); opacity:0; }
    }
    @keyframes gridPulse { 0%,100% { opacity:0.04; } 50% { opacity:0.08; } }
    @keyframes scanline  { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
    @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes modalIn   { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }

    .v-nav-btn {
      width:100%; display:flex; align-items:center; gap:12px;
      padding:9px 16px; border:none; background:transparent;
      cursor:pointer; text-align:left; transition:all 0.2s;
      font-family: var(--font-body);
      font-size: 0.75rem; font-weight: 500; letter-spacing: 0.04em;
      border-left:2px solid transparent;
    }
    .v-nav-btn:hover {
      background: ${t.accentBg};
      border-left-color: ${t.accentBorder} !important;
      color: ${t.text} !important;
    }

    .theme-toggle {
      width:44px; height:24px; background:${t.accentBg};
      border:1px solid ${t.accent}; border-radius:12px;
      cursor:pointer; position:relative; transition:all 0.3s;
      display:flex; align-items:center; padding:2px;
    }
    .theme-toggle-knob {
      width:18px; height:18px; background:${t.accent}; border-radius:50%;
      transition:transform 0.3s;
      transform:translateX(${mode === 'light' ? '20px' : '0px'});
      display:flex; align-items:center; justify-content:center;
    }

    .top-tab {
      padding:0 20px; height:52px; display:flex; align-items:center;
      font-family: var(--font-body);
      font-size: 0.65rem; font-weight: 600; letter-spacing: 0.18em;
      cursor:pointer; border:none; background:transparent;
      border-right:1px solid ${t.accentBorder};
      transition:color 0.2s; position:relative; color:${t.textMuted};
      text-transform: uppercase;
    }
    .top-tab:hover { color:${t.text}; }
    .top-tab.active { color:${t.text}; }
    .top-tab.active::after {
      content:''; position:absolute; bottom:0; left:0; right:0;
      height:2px; background:${t.accent};
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
      border:none; border-radius:4px; color:#fff;
      font-family:var(--font-body); font-size:0.8rem; font-weight:600;
      letter-spacing:0.06em; text-transform:uppercase; cursor:pointer; transition:all 0.2s;
    }
    .btn-confirm:hover { background:#c2410c; transform:translateY(-1px); box-shadow:0 4px 12px rgba(180,83,9,0.4); }

    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
    .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }
    .fade-5 { animation:fadeUp 0.8s 0.45s ease forwards; opacity:0; }
    .fade-6 { animation:fadeIn  1s   0.5s  ease forwards; opacity:0; }

    .skeleton {
      background: linear-gradient(90deg, ${t.accentBg} 25%, ${t.accentSoft} 50%, ${t.accentBg} 75%);
      background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;
    }
  `;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:t.bg, position:'relative', overflow:'hidden', transition:'background 0.3s, color 0.3s' }}>
      <style>{css}</style>

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

      {/* Grid */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:`linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
        backgroundSize:'60px 60px', animation:'gridPulse 5s ease-in-out infinite' }}/>

      {/* Scanline */}
      <div style={{ position:'fixed', left:0, right:0, height:'2px', zIndex:1, pointerEvents:'none',
        background:`linear-gradient(transparent, ${t.scanline}, transparent)`,
        animation:'scanline 10s linear infinite' }}/>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{ position:'fixed', left:p.left, bottom:p.bottom, width:p.size, height:p.size,
          borderRadius:'50%', background:t.particle, opacity:0, pointerEvents:'none', zIndex:1,
          animation:`particleDrift ${p.duration} ${p.delay} infinite linear` }}/>
      ))}

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'500px', height:'500px',
        background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`,
        pointerEvents:'none', zIndex:0 }}/>

      {/* ── SIDEBAR — fixed position ── */}
      <aside style={{
        position:'fixed', top:0, left:0, zIndex:20,
        display:'flex', flexDirection:'column',
        width:`${SIDEBAR_W}px`, height:'100vh',
        background:t.surface, borderRight:`1px solid ${t.accentBorder}`,
        transition:'width 0.3s ease', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:t.topbarGradient }}/>

        {/* Logo */}
        <div style={{ padding:'24px 16px', borderBottom:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <div style={{ width:'32px', height:'32px', background:t.accent, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px', boxShadow:`0 0 16px ${t.accentGlow}` }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:'#fff', fontWeight:700 }}>AM</span>
          </div>
          {sidebarOpen && (
            <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', color:t.text, lineHeight:1.1 }}>ArguMind</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 0', overflowY:'auto' }}>
          {navItems.map(({ icon:Icon, label, sub, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} className="v-nav-btn"
                style={{ color: isActive ? t.accent : t.textMuted, borderLeftColor: isActive ? t.accent : 'transparent', background: isActive ? t.accentBg : 'transparent' }}>
                <Icon size={16} style={{ flexShrink:0 }}/>
                {sidebarOpen && (
                  <div style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
                    <div style={{ fontSize:'0.7rem', letterSpacing:'0.1em', fontWeight:600 }}>{label}</div>
                    <div style={{ fontSize:'0.6rem', color:t.textFaint, marginTop:'2px', fontWeight:400 }}>{sub}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'12px 0', borderTop:`1px solid ${t.accentBorder}`, flexShrink:0 }}>
          {sidebarOpen && (
            <div style={{ padding:'12px 16px 16px', overflow:'hidden', whiteSpace:'nowrap' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', letterSpacing:'0.06em', color:t.text, fontWeight:600 }}>{(user?.name || 'OPERATOR').toUpperCase()}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', color:t.textMuted, marginTop:'4px', fontWeight:400 }}>{user?.email || ''}</div>
            </div>
          )}
          <button className="v-nav-btn" onClick={() => navigate('/settings')}
            style={{ color: location.pathname === '/settings' ? t.accent : t.textMuted, borderLeftColor: location.pathname === '/settings' ? t.accent : 'transparent', background: location.pathname === '/settings' ? t.accentBg : 'transparent' }}>
            <Settings size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Settings</span>}
          </button>
          <button className="v-nav-btn" onClick={() => navigate('/support')}
            style={{ color: location.pathname === '/support' ? t.accent : t.textMuted, borderLeftColor: location.pathname === '/support' ? t.accent : 'transparent', background: location.pathname === '/support' ? t.accentBg : 'transparent' }}>
            <HelpCircle size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Support</span>}
          </button>
          <button className="v-nav-btn" onClick={() => setShowLogoutModal(true)} style={{ color:t.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.color = t.accent; e.currentTarget.style.background = t.accentBg; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent'; }}>
            <LogOut size={14} style={{ flexShrink:0 }}/>{sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle — sits on right edge of sidebar, no overflow */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position:'absolute', bottom:'50%', right:0, width:'20px', height:'40px', border:`1px solid ${t.border}`, borderRight:'none', background: t.surface, color: t.textMuted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px 0 0 4px', zIndex:30, transition:'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = t.accentBg}
          onMouseLeave={e => e.currentTarget.style.background = t.surface}>
          <ChevronLeft size={11} style={{ transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s' }}/>
        </button>
      </aside>

      {/* ── MAIN — offset by sidebar width ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', position:'relative', zIndex:10, marginLeft:`${SIDEBAR_W}px`, transition:'margin-left 0.3s ease' }}>

        {/* Topbar */}
        <header style={{ position:'sticky', top:0, zIndex:19, padding:'0 32px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between', background: mode === 'dark' ? 'rgba(31,41,55,0.97)' : 'rgba(253,246,236,0.97)', backdropFilter:'blur(10px)', borderBottom:`2px solid ${t.accent}`, height:'52px' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:t.topbarGradient }}/>

          <div style={{ height:'100%', display:'flex', alignItems:'center' }}>
            {pageTitle && (
              <div style={{ padding:'0 24px', height:'52px', display:'flex', alignItems:'center', borderRight:`1px solid ${t.accentBorder}`, fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.18em', fontWeight:600, textTransform:'uppercase', color:t.text }}>
                {pageTitle}
              </div>
            )}
            {topbarContent}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Sun size={13} style={{ color: mode === 'light' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
              <button className="theme-toggle" onClick={toggle} title="Toggle theme">
                <div className="theme-toggle-knob">
                  {mode === 'dark' ? <Moon size={10} style={{ color:'#FEF9F3' }}/> : <Sun size={10} style={{ color:'#FEF9F3' }}/>}
                </div>
              </button>
              <Moon size={13} style={{ color: mode === 'dark' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
            </div>

            <button onClick={() => navigate(returnPath || '/dashboard')}
              style={{ padding:'8px 20px', background:'transparent', border:`1px solid ${t.accentBorder}`, color:t.textMuted, fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.15em', fontWeight:500, textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accentBg; e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = t.accentBorder; e.currentTarget.style.color = t.textMuted; }}>
              {returnLabel}
            </button>
          </div>
        </header>

        <div style={{ flex:1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}