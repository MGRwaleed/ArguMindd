import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, BookOpen, Shield, BarChart2, Archive,
  Settings, HelpCircle, LogOut, Trophy, Calendar,
  ChevronDown, ChevronUp, FileText, Brain, Zap,
  CheckCircle, XCircle, AlertCircle, Minus, Clock,
  BarChart, User, RefreshCw
} from 'lucide-react';
import authService from '../services/authService';

const BASE = 'http://localhost:3001';

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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes barFill {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }

  .v-nav-btn {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:9px 16px; border:none; background:transparent;
    cursor:pointer; text-align:left; transition:all 0.2s;
    font-family:'Space Mono', monospace; border-left:2px solid transparent;
  }
  .v-nav-btn:hover { background:rgba(180,83,9,0.12); border-left-color:rgba(180,83,9,0.4) !important; color:#E5E7EB !important; }

  .debate-card {
    border: 1px solid rgba(180,83,9,0.18);
    background: rgba(75,85,99,0.1);
    transition: all 0.25s;
    overflow: hidden;
  }
  .debate-card:hover { border-color: rgba(180,83,9,0.4); background: rgba(75,85,99,0.16); }

  .tab-btn {
    padding: 8px 18px; border: none; background: transparent;
    font-family: 'Space Mono', monospace; font-size: 0.58rem;
    letter-spacing: 0.2em; cursor: pointer; transition: all 0.2s;
    border-bottom: 2px solid transparent; color: #9CA3AF;
  }
  .tab-btn:hover { color: #E5E7EB; }
  .tab-btn.active { color: #B45309; border-bottom-color: #B45309; }

  .score-bar {
    height: 6px; background: rgba(180,83,9,0.15); border-radius: 3px; overflow: hidden;
  }
  .score-bar-fill {
    height: 100%; border-radius: 3px;
    animation: barFill 1s ease forwards;
  }

  .skeleton {
    background: linear-gradient(90deg, rgba(75,85,99,0.2) 25%, rgba(180,83,9,0.08) 50%, rgba(75,85,99,0.2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .verdict-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; font-family: 'Space Mono', monospace;
    font-size: 0.5rem; letter-spacing: 0.15em; border-radius: 2px;
  }

  .fade-1 { animation: fadeUp 0.8s 0.05s ease forwards; opacity:0; }
  .fade-2 { animation: fadeUp 0.8s 0.15s ease forwards; opacity:0; }
  .fade-3 { animation: fadeUp 0.8s 0.25s ease forwards; opacity:0; }
`;

const navItems = [
  { icon: BookOpen,  label: 'COMMAND',  sub: 'Dashboard',   path: '/dashboard' },
  { icon: Archive,   label: 'ARCHIVES', sub: 'History',     path: '/debates/history' },
  { icon: BarChart2, label: 'SYSTEMS',  sub: 'Analytics',   path: '/analytics' },
  { icon: Shield,    label: 'COUNCIL',  sub: 'Leaderboard', path: '/leaderboard' },
];

const verdictColor = (v) => {
  if (!v) return '#9CA3AF';
  if (v === 'TRUE') return 'rgba(52,211,153,0.9)';
  if (v === 'FALSE') return 'rgba(239,68,68,0.8)';
  if (v === 'PARTIALLY TRUE') return 'rgba(251,191,36,0.9)';
  return '#9CA3AF';
};

const verdictBg = (v) => {
  if (v === 'TRUE') return 'rgba(52,211,153,0.1)';
  if (v === 'FALSE') return 'rgba(239,68,68,0.1)';
  if (v === 'PARTIALLY TRUE') return 'rgba(251,191,36,0.1)';
  return 'rgba(156,163,175,0.1)';
};

const VerdictIcon = ({ v, size = 11 }) => {
  if (v === 'TRUE') return <CheckCircle size={size} />;
  if (v === 'FALSE') return <XCircle size={size} />;
  if (v === 'PARTIALLY TRUE') return <AlertCircle size={size} />;
  return <Minus size={size} />;
};

const performanceColor = (p) => {
  if (p === 'Strong') return 'rgba(52,211,153,0.9)';
  if (p === 'Moderate') return 'rgba(251,191,36,0.9)';
  if (p === 'Weak') return 'rgba(239,68,68,0.8)';
  return '#9CA3AF';
};

export default function ArchivesPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const [debates, setDebates]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab]   = useState({});   // debateId -> 'summary'|'transcript'|'factcheck'|'deep'
  const [detailData, setDetailData] = useState({});   // debateId -> { summary, transcript, factchecks, deep }
  const [detailLoading, setDetailLoading] = useState({});

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 30}%`,
    delay: `${Math.random() * 12}s`, duration: `${8 + Math.random() * 10}s`,
    size: `${1 + Math.random() * 1.5}px`,
  }));

  // ── Fetch all debates ──
  const fetchDebates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/debates`);
      if (!res.ok) throw new Error('Failed to fetch debates');
      const data = await res.json();
      setDebates(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDebates(); }, []);

  // ── Fetch detail for a debate ──
  const fetchDetail = async (debateId) => {
    if (detailData[debateId]) return; // already loaded
    setDetailLoading(p => ({ ...p, [debateId]: true }));
    try {
      const [summaryRes, transcriptRes, factcheckRes] = await Promise.all([
        fetch(`${BASE}/debate-summary/${debateId}`),
        fetch(`${BASE}/transcripts/${debateId}`),
        fetch(`${BASE}/factchecks/${debateId}`),
      ]);
      const [summary, transcript, factchecks] = await Promise.all([
        summaryRes.json(), transcriptRes.json(), factcheckRes.json(),
      ]);
      setDetailData(p => ({ ...p, [debateId]: { summary, transcript, factchecks, deep: null } }));
    } catch (e) {
      setDetailData(p => ({ ...p, [debateId]: { error: e.message } }));
    } finally {
      setDetailLoading(p => ({ ...p, [debateId]: false }));
    }
  };

  // ── Fetch deep summary on demand ──
  const fetchDeepSummary = async (debateId) => {
    if (detailData[debateId]?.deep) return;
    setDetailLoading(p => ({ ...p, [`deep_${debateId}`]: true }));
    try {
      const res = await fetch(`${BASE}/deep-summary/${debateId}`);
      const deep = await res.json();
      setDetailData(p => ({ ...p, [debateId]: { ...p[debateId], deep } }));
    } catch (e) {
      setDetailData(p => ({ ...p, [debateId]: { ...p[debateId], deep: { error: e.message } } }));
    } finally {
      setDetailLoading(p => ({ ...p, [`deep_${debateId}`]: false }));
    }
  };

  const toggleExpand = (debateId) => {
    if (expandedId === debateId) {
      setExpandedId(null);
    } else {
      setExpandedId(debateId);
      if (!activeTab[debateId]) setActiveTab(p => ({ ...p, [debateId]: 'summary' }));
      fetchDetail(debateId);
    }
  };

  const setTab = (debateId, tab) => {
    setActiveTab(p => ({ ...p, [debateId]: tab }));
    if (tab === 'deep') fetchDeepSummary(debateId);
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  };

  // ── SUB-COMPONENTS ──

  const SummaryTab = ({ debateId }) => {
    const d = detailData[debateId];
    if (!d || detailLoading[debateId]) return <LoadingBlock />;
    if (d.error) return <ErrorBlock msg={d.error} />;
    const { summary } = d;
    const s1 = summary?.speaker1Avg ?? 0;
    const s2 = summary?.speaker2Avg ?? 0;
    const winner = summary?.winner || (s1 > s2 ? 'speaker1' : s2 > s1 ? 'speaker2' : 'Draw');
    const rounds = summary?.rounds || [];

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        {/* Score bars */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[['SPEAKER 1', s1, '#B45309'], ['SPEAKER 2', s2, 'rgba(99,102,241,0.8)']].map(([label, score, color]) => (
            <div key={label} style={{ padding:'16px 20px', border:'1px solid rgba(180,83,9,0.12)', background:'rgba(75,85,99,0.1)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.18em', color:'#9CA3AF' }}>{label}</span>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', fontWeight:700, color }}>{Math.round(score)}</span>
              </div>
              <div className="score-bar">
                <div className="score-bar-fill" style={{ '--target-width': `${score}%`, width:`${score}%`, background: color }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Winner */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 20px', border:'1px solid rgba(180,83,9,0.2)', background:'rgba(180,83,9,0.05)' }}>
          <Trophy size={16} style={{ color:'#B45309', flexShrink:0 }}/>
          <div>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.2em', color:'#9CA3AF' }}>WINNER</div>
            <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'1rem', fontWeight:700, color:'#E5E7EB', marginTop:'2px' }}>
              {winner === 'Draw' ? 'DRAW' : winner === 'speaker1' ? 'SPEAKER 1' : 'SPEAKER 2'}
            </div>
          </div>
        </div>

        {/* Rounds breakdown */}
        {rounds.length > 0 && (
          <div>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.22em', color:'#9CA3AF', marginBottom:'10px' }}>ROUND BREAKDOWN</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {rounds.map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', border:'1px solid rgba(180,83,9,0.1)', background:'rgba(75,85,99,0.08)', fontSize:'0.78rem' }}>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', color:'#B45309', width:'60px' }}>RND {r.round}</span>
                  <span style={{ color:'#9CA3AF', flex:1 }}>S1: <strong style={{ color:'#E5E7EB' }}>{Math.round(r.speaker1Score ?? 0)}</strong></span>
                  <span style={{ color:'#9CA3AF', flex:1 }}>S2: <strong style={{ color:'#E5E7EB' }}>{Math.round(r.speaker2Score ?? 0)}</strong></span>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', color: r.roundWinner === 'speaker1' ? '#B45309' : r.roundWinner === 'speaker2' ? 'rgba(99,102,241,0.8)' : '#9CA3AF' }}>
                    {r.roundWinner === 'Draw' ? 'DRAW' : r.roundWinner === 'speaker1' ? 'S1 WINS' : 'S2 WINS'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TranscriptTab = ({ debateId }) => {
    const d = detailData[debateId];
    if (!d || detailLoading[debateId]) return <LoadingBlock />;
    if (d.error) return <ErrorBlock msg={d.error} />;
    const entries = (d.transcript || []).sort((a, b) => a.round - b.round || (a.speaker > b.speaker ? 1 : -1));
    if (!entries.length) return <EmptyBlock msg="No transcript available." />;

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display:'flex', gap:'14px', padding:'14px 18px', border:'1px solid rgba(180,83,9,0.1)', background: e.speaker === 'speaker1' ? 'rgba(180,83,9,0.05)' : 'rgba(99,102,241,0.05)' }}>
            <div style={{ flexShrink:0, textAlign:'center', minWidth:'52px' }}>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.15em', color: e.speaker === 'speaker1' ? '#B45309' : 'rgba(99,102,241,0.8)', marginBottom:'2px' }}>
                {e.speaker === 'speaker1' ? 'S1' : 'S2'}
              </div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.48rem', color:'#4B5563' }}>RND {e.round}</div>
            </div>
            <p style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.85rem', color:'#E5E7EB', lineHeight:1.7, margin:0 }}>{e.text}</p>
          </div>
        ))}
      </div>
    );
  };

  const FactCheckTab = ({ debateId }) => {
    const d = detailData[debateId];
    if (!d || detailLoading[debateId]) return <LoadingBlock />;
    if (d.error) return <ErrorBlock msg={d.error} />;
    const entries = (d.factchecks || []).sort((a, b) => a.round - b.round);
    if (!entries.length) return <EmptyBlock msg="No fact-checks available." />;

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {entries.map((e, i) => (
          <div key={i} style={{ padding:'16px 20px', border:'1px solid rgba(180,83,9,0.12)', background:'rgba(75,85,99,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.15em', color: e.speaker === 'speaker1' ? '#B45309' : 'rgba(99,102,241,0.8)' }}>
                  {e.speaker === 'speaker1' ? 'SPEAKER 1' : 'SPEAKER 2'} · RND {e.round}
                </span>
                <span className="verdict-badge" style={{ color: verdictColor(e.verdict), background: verdictBg(e.verdict) }}>
                  <VerdictIcon v={e.verdict} /> {e.verdict || 'UNVERIFIED'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', color: performanceColor(e.performance) }}>{e.performance}</span>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', fontWeight:700, color:'#E5E7EB' }}>{e.score}</span>
              </div>
            </div>
            {e.claim && <p style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.82rem', color:'#9CA3AF', lineHeight:1.65, margin:'0 0 10px' }}>{e.claim}</p>}
            {e.reasoning && (
              <div style={{ padding:'10px 14px', background:'rgba(180,83,9,0.04)', borderLeft:'2px solid rgba(180,83,9,0.3)', fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.78rem', color:'#9CA3AF', lineHeight:1.65 }}>
                {e.reasoning}
              </div>
            )}
            <div style={{ display:'flex', gap:'16px', marginTop:'10px' }}>
              {[['TRUE', e.trueCount], ['FALSE', e.falseCount], ['PARTIAL', e.partialCount]].map(([label, count]) => (
                count !== undefined && (
                  <span key={label} style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.12em', color:'#4B5563' }}>
                    {label}: <strong style={{ color:'#9CA3AF' }}>{count}</strong>
                  </span>
                )
              ))}
              {e.totalClaims !== undefined && (
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.12em', color:'#4B5563' }}>
                  TOTAL: <strong style={{ color:'#9CA3AF' }}>{e.totalClaims}</strong>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DeepSummaryTab = ({ debateId }) => {
    const d = detailData[debateId];
    const isLoading = detailLoading[`deep_${debateId}`];
    if (isLoading) return <LoadingBlock msg="GENERATING AI ANALYSIS..." />;
    if (!d?.deep) return <EmptyBlock msg="Click to load AI deep analysis." />;
    if (d.deep.error) return <ErrorBlock msg={d.deep.error} />;
    const { overview, key_points, speaker1, speaker2 } = d.deep;

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        {overview && (
          <div style={{ padding:'20px 24px', border:'1px solid rgba(180,83,9,0.15)', background:'rgba(180,83,9,0.04)' }}>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.22em', color:'#B45309', marginBottom:'10px' }}>OVERVIEW</div>
            <p style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.88rem', color:'#E5E7EB', lineHeight:1.8, margin:0 }}>{overview}</p>
          </div>
        )}
        {key_points?.length > 0 && (
          <div>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.22em', color:'#9CA3AF', marginBottom:'10px' }}>KEY POINTS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {key_points.map((kp, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', padding:'10px 14px', border:'1px solid rgba(180,83,9,0.1)', background:'rgba(75,85,99,0.08)' }}>
                  <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', color:'#B45309', flexShrink:0, marginTop:'2px' }}>{'>'}</span>
                  <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.82rem', color:'#9CA3AF', lineHeight:1.6 }}>{kp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[['SPEAKER 1', speaker1, '#B45309'], ['SPEAKER 2', speaker2, 'rgba(99,102,241,0.8)']].map(([label, data, color]) => data && (
            <div key={label} style={{ padding:'18px 20px', border:'1px solid rgba(180,83,9,0.12)', background:'rgba(75,85,99,0.08)' }}>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.18em', color, marginBottom:'14px' }}>{label}</div>
              {data.strengths?.length > 0 && (
                <div style={{ marginBottom:'12px' }}>
                  <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.15em', color:'rgba(52,211,153,0.7)', marginBottom:'6px' }}>STRENGTHS</div>
                  {data.strengths.map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'4px' }}>
                      <CheckCircle size={11} style={{ color:'rgba(52,211,153,0.7)', flexShrink:0, marginTop:'3px' }}/>
                      <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.78rem', color:'#9CA3AF' }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {data.weaknesses?.length > 0 && (
                <div>
                  <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.15em', color:'rgba(239,68,68,0.7)', marginBottom:'6px' }}>WEAKNESSES</div>
                  {data.weaknesses.map((w, i) => (
                    <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'4px' }}>
                      <XCircle size={11} style={{ color:'rgba(239,68,68,0.7)', flexShrink:0, marginTop:'3px' }}/>
                      <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.78rem', color:'#9CA3AF' }}>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LoadingBlock = ({ msg }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'24px', justifyContent:'center' }}>
      <RefreshCw size={14} style={{ color:'#B45309', animation:'spin 1s linear infinite' }}/>
      <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.2em', color:'#9CA3AF' }}>{msg || 'LOADING...'}</span>
    </div>
  );

  const ErrorBlock = ({ msg }) => (
    <div style={{ padding:'16px 20px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', color:'rgba(239,68,68,0.7)', letterSpacing:'0.12em' }}>
      ⚠ {msg}
    </div>
  );

  const EmptyBlock = ({ msg }) => (
    <div style={{ padding:'24px', textAlign:'center', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', color:'#4B5563', letterSpacing:'0.15em' }}>
      {msg}
    </div>
  );

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
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.48rem', letterSpacing:'0.15em', color:'#9CA3AF', marginTop:'1px' }}>THE VOID PROTOCOL</div>
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
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:'#E5E7EB' }}>{(user?.name || 'OPERATOR').toUpperCase()}</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.1em', color:'#9CA3AF', marginTop:'2px' }}>{user?.email || ''}</div>
            </div>
          )}
          <button className="v-nav-btn" onClick={() => navigate('/settings')} style={{ color:'#9CA3AF' }}>
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
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', position:'relative', zIndex:10 }}>

        {/* Topbar */}
        <header style={{ position:'sticky', top:0, zIndex:20, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(31,41,55,0.97)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(180,83,9,0.2)', height:'52px' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>
          <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.25em', color:'#E5E7EB', borderBottom:'2px solid #B45309', height:'52px', display:'flex', alignItems:'center', paddingRight:'20px' }}>
            ARCHIVES
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button onClick={fetchDebates} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'transparent', border:'1px solid rgba(180,83,9,0.3)', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(180,83,9,0.3)'; e.currentTarget.style.color = '#9CA3AF'; }}
            >
              <RefreshCw size={11}/> REFRESH
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ padding:'8px 20px', background:'transparent', border:'1px solid rgba(180,83,9,0.3)', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.2em', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,83,9,0.1)'; e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#E5E7EB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(180,83,9,0.3)'; e.currentTarget.style.color = '#9CA3AF'; }}
            >← RETURN TO COMMAND</button>
          </div>
        </header>

        <main style={{ padding:'40px 48px', display:'flex', flexDirection:'column', gap:'32px' }}>

          {/* Page header */}
          <div className="fade-1">
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:'#9CA3AF', marginBottom:'8px' }}>// DEBATE ARCHIVES</div>
            <h1 style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'2.2rem', color:'#E5E7EB', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              SESSION<br/>RECORDS
            </h1>
            <p style={{ marginTop:'10px', fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:'#9CA3AF', lineHeight:1.7 }}>
              {debates.length > 0 ? `${debates.length} DEBATE${debates.length > 1 ? 'S' : ''} ON RECORD` : 'ALL PAST DEBATES AND VERDICTS'}
            </p>
          </div>

          {/* ── DEBATE LIST ── */}
          <div className="fade-2" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height:'80px', borderRadius:'2px' }} className="skeleton"/>
              ))
            ) : error ? (
              <div style={{ padding:'24px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', color:'rgba(239,68,68,0.7)', letterSpacing:'0.12em' }}>
                ⚠ {error} — Make sure the debate server is running on port 3001.
              </div>
            ) : debates.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center', border:'1px solid rgba(180,83,9,0.1)', background:'rgba(75,85,99,0.08)' }}>
                <Archive size={32} style={{ color:'#4B5563', marginBottom:'12px' }}/>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.2em', color:'#4B5563' }}>NO DEBATES ON RECORD</div>
              </div>
            ) : (
              debates.map((debate) => {
                const id = debate.debateId || debate._id || debate.id;
                const isOpen = expandedId === id;
                const tab = activeTab[id] || 'summary';
                const detail = detailData[id];
                const isDetailLoading = detailLoading[id];
                const s1 = detail?.summary?.speaker1Avg ?? debate.speaker1Avg ?? null;
                const s2 = detail?.summary?.speaker2Avg ?? debate.speaker2Avg ?? null;
                const winner = detail?.summary?.winner ?? debate.winner ?? (s1 != null && s2 != null ? (s1 > s2 ? 'speaker1' : s2 > s1 ? 'speaker2' : 'Draw') : null);

                return (
                  <div key={id} className="debate-card">
                    {/* Card header — always visible */}
                    <button onClick={() => toggleExpand(id)} style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', padding:'20px 24px', display:'flex', alignItems:'center', gap:'16px', textAlign:'left' }}>
                      {/* Debate ID badge */}
                      <div style={{ width:'48px', height:'48px', border:'1px solid rgba(180,83,9,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(180,83,9,0.08)' }}>
                        <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.48rem', letterSpacing:'0.1em', color:'#B45309', textTransform:'uppercase' }}>{String(id).slice(0,5)}</span>
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'5px', flexWrap:'wrap' }}>
                          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.18em', color:'#E5E7EB' }}>DEBATE_{String(id).toUpperCase()}</span>
                          {winner && (
                            <span style={{ display:'flex', alignItems:'center', gap:'4px', fontFamily:"'Space Mono', monospace", fontSize:'0.5rem', letterSpacing:'0.12em', color:'#B45309', border:'1px solid rgba(180,83,9,0.3)', padding:'2px 8px' }}>
                              <Trophy size={9}/> {winner === 'Draw' ? 'DRAW' : winner === 'speaker1' ? 'S1 WINS' : 'S2 WINS'}
                            </span>
                          )}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.12em', color:'#9CA3AF' }}>
                            <Calendar size={10}/> {formatDate(debate.createdAt)} {formatTime(debate.createdAt)}
                          </span>
                          {s1 != null && s2 != null && (
                            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.12em', color:'#9CA3AF' }}>
                              S1: <strong style={{ color:'#E5E7EB' }}>{Math.round(s1)}</strong> · S2: <strong style={{ color:'#E5E7EB' }}>{Math.round(s2)}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {isOpen
                        ? <ChevronUp size={14} style={{ color:'#B45309', flexShrink:0 }}/>
                        : <ChevronDown size={14} style={{ color:'#9CA3AF', flexShrink:0 }}/>
                      }
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ borderTop:'1px solid rgba(180,83,9,0.12)' }}>
                        {/* Tabs */}
                        <div style={{ display:'flex', borderBottom:'1px solid rgba(180,83,9,0.1)', padding:'0 24px', background:'rgba(75,85,99,0.06)' }}>
                          {[
                            { key:'summary',    label:'SCORES',     icon: BarChart },
                            { key:'transcript', label:'TRANSCRIPT', icon: FileText },
                            { key:'factcheck',  label:'FACT CHECK', icon: CheckCircle },
                            { key:'deep',       label:'AI ANALYSIS',icon: Brain },
                          ].map(({ key, label, icon:Icon }) => (
                            <button key={key} className={`tab-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(id, key)}>
                              <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                                <Icon size={10}/> {label}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Tab content */}
                        <div style={{ padding:'24px' }}>
                          {isDetailLoading && !detail ? <LoadingBlock /> :
                            tab === 'summary'    ? <SummaryTab debateId={id} /> :
                            tab === 'transcript' ? <TranscriptTab debateId={id} /> :
                            tab === 'factcheck'  ? <FactCheckTab debateId={id} /> :
                            tab === 'deep'       ? <DeepSummaryTab debateId={id} /> : null
                          }
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </main>
      </div>
    </div>
  );
}