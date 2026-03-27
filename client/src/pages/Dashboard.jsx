import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, LogOut, Settings, HelpCircle,
  BookOpen, Shield, BarChart2, Archive,
  Plus, ChevronRight, Search, Bell,
  MessageSquare, Trophy, TrendingUp, Clock
} from 'lucide-react';
import authService from '../services/authService';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
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

  .nav-btn {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:10px 16px; border:none; background:transparent;
    cursor:pointer; text-align:left; transition:all 0.2s;
    font-family:'Space Mono', monospace; border-left:2px solid transparent;
  }
  .nav-btn:hover { background:rgba(180,83,9,0.1); border-left-color:#B45309; }

  .stat-card {
    padding: 28px 24px;
    background: #111827;
    border: 1px solid #4B5563;
    border-radius: 4px;
    transition: all 0.25s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: #B45309;
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
  }
  .stat-card:hover {
    border-color: rgba(180,83,9,0.6);
    box-shadow: 0 0 24px rgba(180,83,9,0.15), 0 4px 16px rgba(0,0,0,0.3);
    transform: translateY(-2px);
  }
  .stat-card:hover::before { transform: scaleX(1); }

  .top-tab {
    padding: 8px 20px;
    background: transparent;
    border: 1px solid #4B5563;
    border-radius: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: #9CA3AF;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .top-tab:hover { border-color: #B45309; color: #E5E7EB; background: rgba(180,83,9,0.06); }
  .top-tab.active {
    background: rgba(180,83,9,0.12);
    border-color: #B45309;
    color: #B45309;
    font-weight: 600;
  }

  .debate-row {
    display:grid; grid-template-columns:1fr 140px 100px 90px 32px;
    gap:16px; align-items:center; padding:16px 20px;
    cursor:pointer; border-bottom:1px solid #4B5563; transition:all 0.2s;
  }
  .debate-row:hover { background:rgba(180,83,9,0.05); }
  .debate-row:last-child { border-bottom:none; }

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
  { icon: MessageSquare, value: '42',    label: 'Active Sessions',   sub: '+4 this week' },
  { icon: Trophy,        value: '89.4%', label: 'Avg Score',         sub: 'Top 7% globally' },
  { icon: TrendingUp,    value: '12',    label: 'Active Protocols',  sub: 'Ongoing debates' },
  { icon: Clock,         value: '742',   label: 'ELO Ranking',       sub: 'Global standing' },
];

const mockDebates = [
  { id:1, topic:'The Ethics of Neural Link Integration',           opponent:'ZAID MENCHO',    score:'92/100', outcome:'VICTORY' },
  { id:2, topic:'Decentralized Governance in Mars Colonies',       opponent:'SAMEER RONALDO', score:'41/100', outcome:'DEFEAT'  },
  { id:3, topic:'Consciousness via Computational Work',            opponent:'MOSES MESSI',    score:'78/100', outcome:'VICTORY' },
  { id:4, topic:'Quantum Entanglement as Communication Protocol',  opponent:'SAFFAN SMARTIE', score:'85/100', outcome:'VICTORY' },
];

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('RECENT');
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 30}%`,
    delay: `${Math.random() * 12}s`, duration: `${8 + Math.random() * 10}s`,
    size: `${1 + Math.random() * 1.5}px`,
  }));

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#1F2937', fontFamily:"'Space Grotesk', sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{styles}</style>

      {/* Grid BG */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(rgba(180,83,9,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(180,83,9,0.04) 1px, transparent 1px)`, backgroundSize:'80px 80px', pointerEvents:'none', zIndex:0 }}/>

      {/* Scanline */}
      <div style={{ position:'fixed', left:0, right:0, height:'2px', zIndex:1, pointerEvents:'none', background:'linear-gradient(transparent, rgba(180,83,9,0.05), transparent)', animation:'scanline 10s linear infinite' }}/>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{ position:'fixed', left:p.left, bottom:p.bottom, width:p.size, height:p.size, borderRadius:'50%', background:'#B45309', opacity:0, pointerEvents:'none', zIndex:1, animation:`particleDrift ${p.duration} ${p.delay} infinite linear` }}/>
      ))}

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(180,83,9,0.07) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }}/>

      {/* ── SIDEBAR ── */}
      <aside style={{ position:'relative', zIndex:20, display:'flex', flexDirection:'column', width: sidebarOpen ? '240px' : '60px', minHeight:'100vh', flexShrink:0, background:'#111827', borderRight:'1px solid #4B5563', transition:'width 0.3s ease' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'#B45309' }}/>

        {/* Logo */}
        <div style={{ padding:'24px 16px', borderBottom:'1px solid #4B5563', display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'32px', height:'32px', background:'#B45309', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px', boxShadow:'0 0 12px rgba(180,83,9,0.4)' }}>
            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', fontWeight:700, color:'#E5E7EB' }}>AM</span>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.875rem', fontWeight:700, letterSpacing:'0.1em', color:'#E5E7EB' }}>ARGUMIND</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', letterSpacing:'0.05em', color:'#9CA3AF', marginTop:'2px' }}>Command Center</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 0' }}>
          {navItems.map(({ icon:Icon, label, sub, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} className="nav-btn"
                style={{ color: isActive ? '#E5E7EB' : '#9CA3AF', borderLeftColor: isActive ? '#B45309' : 'transparent', background: isActive ? 'rgba(180,83,9,0.1)' : 'transparent' }}
              >
                <Icon size={16} style={{ flexShrink:0 }}/>
                {sidebarOpen && (
                  <div>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.05em' }}>{label}</div>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', color:'#9CA3AF', marginTop:'2px' }}>{sub}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'12px 0', borderTop:'1px solid #4B5563' }}>
          {sidebarOpen && (
            <div style={{ padding:'12px 16px 16px' }}>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', color:'#E5E7EB', fontWeight:600 }}>{(user?.name || 'Operator').toUpperCase()}</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', color:'#9CA3AF', marginTop:'4px' }}>{user?.email || ''}</div>
            </div>
          )}
          <button className="nav-btn" onClick={() => navigate('/settings')} style={{ color:'#9CA3AF' }}>
            <Settings size={14} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem' }}>Settings</span>}
          </button>
          <button className="nav-btn" onClick={() => navigate('/support')} style={{ color:'#9CA3AF' }}>
            <HelpCircle size={14} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem' }}>Support</span>}
          </button>
          <button className="nav-btn" onClick={() => { authService.logout(); navigate('/login'); }} style={{ color:'#9CA3AF' }}
            onMouseEnter={e => e.currentTarget.style.color = '#B45309'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
          >
            <LogOut size={14} style={{ flexShrink:0 }}/>
            {sidebarOpen && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem' }}>Logout</span>}
          </button>
        </div>

        {/* Collapse */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position:'absolute', right:'-12px', top:'28px', width:'24px', height:'24px', border:'1px solid #4B5563', background:'#1F2937', color:'#9CA3AF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'4px', zIndex:30 }}>
          <ChevronLeft size={12} style={{ transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s' }}/>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', position:'relative', zIndex:10 }}>

        {/* Topbar */}
        <header style={{ position:'sticky', top:0, zIndex:20, padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#111827', borderBottom:'1px solid #4B5563', height:'60px' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>

          {/* Tab pills — NOT grid style */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {topTabs.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`top-tab${location.pathname === path ? ' active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <Search size={16} style={{ color:'#9CA3AF', cursor:'pointer' }}/>
            <Bell size={16} style={{ color:'#9CA3AF', cursor:'pointer' }}/>
            <button
              onClick={() => navigate('/debate/new')}
              style={{ padding:'10px 24px', background:'#B45309', border:'none', borderRadius:'4px', color:'#E5E7EB', fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D97706'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(180,83,9,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#B45309'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              New Debate
            </button>
          </div>
        </header>

        <main style={{ padding:'48px 48px 80px', display:'flex', flexDirection:'column', gap:'48px' }}>

          {/* Welcome */}
          <div className="fade-1">
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.85rem', letterSpacing:'0.1em', color:'#9CA3AF', marginBottom:'6px' }}>
              // OPERATOR DASHBOARD
            </div>
            <h1 style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'1.6rem', fontWeight:700, color:'#E5E7EB', letterSpacing:'0.04em' }}>
              Welcome Back, <span style={{ color:'#B45309' }}>{(user?.name || 'Operator').toUpperCase()}</span>
            </h1>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="fade-2" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }}>
            {statCards.map(({ icon:Icon, value, label, sub }, i) => (
              <div key={i} className="stat-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <div style={{ width:'36px', height:'36px', background:'rgba(180,83,9,0.1)', border:'1px solid rgba(180,83,9,0.25)', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={16} style={{ color:'#B45309' }}/>
                  </div>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:'#4B5563', textTransform:'uppercase' }}>{sub}</span>
                </div>
                <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'2.2rem', fontWeight:700, color:'#E5E7EB', letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', letterSpacing:'0.08em', color:'#9CA3AF', marginTop:'10px', textTransform:'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="fade-3" style={{ position:'relative', padding:'56px 48px', overflow:'hidden', border:'1px solid #4B5563', background:'linear-gradient(135deg, rgba(180,83,9,0.06) 0%, rgba(75,85,99,0.04) 100%)', borderRadius:'4px' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'48px', flexWrap:'wrap' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                  <div style={{ width:'8px', height:'8px', background:'#B45309', borderRadius:'50%', boxShadow:'0 0 8px rgba(180,83,9,0.6)' }}/>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:'#B45309', textTransform:'uppercase' }}>AI Judge Ready</span>
                </div>
                <h2 style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'3rem', fontWeight:700, color:'#E5E7EB', letterSpacing:'0.03em', textTransform:'uppercase', lineHeight:1.1 }}>
                  Ready to<br/>Debate?
                </h2>
                <p style={{ marginTop:'20px', fontFamily:"'Space Mono', monospace", fontSize:'0.85rem', letterSpacing:'0.03em', color:'#9CA3AF', lineHeight:1.7, maxWidth:'480px' }}>
                  Submit your argument. Let the AI judge decide.<br/>
                  Fair analysis. Unbiased verdicts.
                </p>
              </div>
              <button
                onClick={() => navigate('/debate/new')}
                style={{ padding:'16px 36px', background:'#B45309', border:'none', borderRadius:'4px', color:'#E5E7EB', fontFamily:"'Space Mono', monospace", fontSize:'0.875rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#D97706'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(180,83,9,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#B45309'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Start Session →
              </button>
            </div>
          </div>

          {/* Session History */}
          <div className="fade-4">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.875rem', letterSpacing:'0.1em', color:'#E5E7EB', fontWeight:600, textTransform:'uppercase' }}>Session History</span>
                <div style={{ display:'flex', gap:'8px' }}>
                  {['RECENT','VICTORY','DEFEAT'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} style={{ padding:'6px 14px', background: activeFilter === f ? 'rgba(180,83,9,0.1)' : 'transparent', border:'1px solid', borderColor: activeFilter === f ? '#B45309' : '#4B5563', borderRadius:'4px', fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.05em', color: activeFilter === f ? '#B45309' : '#9CA3AF', cursor:'pointer', transition:'all 0.2s' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.05em', color:'#9CA3AF', background:'transparent', border:'none', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#B45309'}
                onMouseLeave={e => e.target.style.color = '#9CA3AF'}
              >VIEW ALL →</button>
            </div>

            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px 32px', gap:'16px', padding:'12px 20px', borderBottom:'1px solid #4B5563', background:'#111827' }}>
              {['Debate Subject','Opponent','Score','Outcome',''].map((h, i) => (
                <span key={i} style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.1em', color:'#9CA3AF', textTransform:'uppercase' }}>{h}</span>
              ))}
            </div>

            <div style={{ border:'1px solid #4B5563', borderTop:'none' }}>
              {mockDebates.map(d => (
                <div key={d.id} className="debate-row">
                  <p style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.95rem', fontWeight:500, color:'#E5E7EB', lineHeight:1.4 }}>{d.topic}</p>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.8rem', letterSpacing:'0.05em', color:'#9CA3AF' }}>{d.opponent}</span>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.85rem', color:'#E5E7EB', fontWeight:600 }}>{d.score}</span>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.05em', color: d.outcome === 'VICTORY' ? '#B45309' : '#9CA3AF', fontWeight:600 }}>{d.outcome}</span>
                  <ChevronRight size={14} style={{ color:'#9CA3AF' }}/>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/debate/new')}
              style={{ marginTop:'20px', width:'100%', padding:'14px', background:'transparent', border:'1px solid #4B5563', borderRadius:'4px', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#B45309'; e.currentTarget.style.background = 'rgba(180,83,9,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#4B5563'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Plus size={14}/> Initiate New Debate
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}