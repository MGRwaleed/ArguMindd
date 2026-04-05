import React, { useState, useEffect } from 'react';
import {
  Trophy, Calendar, ChevronDown, ChevronUp, FileText,
  Brain, CheckCircle, XCircle, AlertCircle, Minus,
  RefreshCw, Archive, BarChart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PageLayout from '../components/PageLayout';

const BASE = 'http://localhost:3001';

const verdictColor = (v) => {
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
  const { theme: t, mode } = useTheme();
  const [debates, setDebates]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [expandedId, setExpandedId]       = useState(null);
  const [activeTab, setActiveTab]         = useState({});
  const [detailData, setDetailData]       = useState({});
  const [detailLoading, setDetailLoading] = useState({});

  const css = `
    @keyframes spin    { to { transform:rotate(360deg); } }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes barFill { from{width:0%} to{width:var(--target-width)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    .debate-card { border:1px solid ${t.accentBorder}; background:${t.accentSofter}; transition:all 0.25s; overflow:hidden; }
    .debate-card:hover { border-color:${t.accent}; background:${t.accentSoft}; }

    .arch-tab { padding:8px 16px; border:none; background:transparent; font-family:'DM Mono',monospace; font-size:0.58rem; letter-spacing:0.2em; cursor:pointer; transition:all 0.2s; border-bottom:2px solid transparent; color:${t.textMuted}; display:flex; align-items:center; gap:5px; }
    .arch-tab:hover { color:${t.text}; }
    .arch-tab.active { color:${t.accent}; border-bottom-color:${t.accent}; }

    .score-bar { height:6px; background:${t.accentBg}; border-radius:3px; overflow:hidden; }
    .score-bar-fill { height:100%; border-radius:3px; animation:barFill 1s ease forwards; }

    .skeleton { background:linear-gradient(90deg,${t.accentBg} 25%,${t.accentSoft} 50%,${t.accentBg} 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px; }

    .verdict-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; font-family:'DM Mono',monospace; font-size:0.5rem; letter-spacing:0.15em; border-radius:2px; }

    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
  `;

  const fetchDebates = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}/debates`);
      if (!res.ok) throw new Error('Failed to fetch debates');
      setDebates(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDebates(); }, []);

  const fetchDetail = async (id) => {
    if (detailData[id]) return;
    setDetailLoading(p => ({ ...p, [id]: true }));
    try {
      const [sR, tR, fR] = await Promise.all([
        fetch(`${BASE}/debate-summary/${id}`),
        fetch(`${BASE}/transcripts/${id}`),
        fetch(`${BASE}/factchecks/${id}`),
      ]);
      const [summary, transcript, factchecks] = await Promise.all([sR.json(), tR.json(), fR.json()]);
      setDetailData(p => ({ ...p, [id]: { summary, transcript, factchecks, deep: null } }));
    } catch (e) {
      setDetailData(p => ({ ...p, [id]: { error: e.message } }));
    } finally { setDetailLoading(p => ({ ...p, [id]: false })); }
  };

  const fetchDeep = async (id) => {
    if (detailData[id]?.deep) return;
    setDetailLoading(p => ({ ...p, [`deep_${id}`]: true }));
    try {
      const deep = await (await fetch(`${BASE}/deep-summary/${id}`)).json();
      setDetailData(p => ({ ...p, [id]: { ...p[id], deep } }));
    } catch (e) {
      setDetailData(p => ({ ...p, [id]: { ...p[id], deep: { error: e.message } } }));
    } finally { setDetailLoading(p => ({ ...p, [`deep_${id}`]: false })); }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!activeTab[id]) setActiveTab(p => ({ ...p, [id]: 'summary' }));
    fetchDetail(id);
  };

  const setTab = (id, tab) => {
    setActiveTab(p => ({ ...p, [id]: tab }));
    if (tab === 'deep') fetchDeep(id);
  };

  const fmt = (ts) => ts ? new Date(ts).toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  const Spinner = ({ msg }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'24px', justifyContent:'center' }}>
      <RefreshCw size={14} style={{ color:t.accent, animation:'spin 1s linear infinite' }}/>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.2em', color:t.textMuted }}>{msg || 'LOADING...'}</span>
    </div>
  );
  const ErrBlock = ({ msg }) => (
    <div style={{ padding:'14px 18px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'rgba(239,68,68,0.7)' }}>⚠ {msg}</div>
  );
  const Empty = ({ msg }) => (
    <div style={{ padding:'24px', textAlign:'center', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:t.textFaint }}>{msg}</div>
  );

  const SummaryTab = ({ id }) => {
    const d = detailData[id];
    if (!d || detailLoading[id]) return <Spinner />;
    if (d.error) return <ErrBlock msg={d.error} />;
    const s1 = d.summary?.speaker1Avg ?? 0;
    const s2 = d.summary?.speaker2Avg ?? 0;
    const winner = d.summary?.winner || (s1 > s2 ? 'speaker1' : s2 > s1 ? 'speaker2' : 'Draw');
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[['SPEAKER 1', s1, t.accent], ['SPEAKER 2', s2, 'rgba(99,102,241,0.8)']].map(([lbl, score, color]) => (
            <div key={lbl} style={{ padding:'14px 18px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:t.textMuted }}>{lbl}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', fontWeight:700, color }}>{Math.round(score)}</span>
              </div>
              <div className="score-bar"><div className="score-bar-fill" style={{ '--target-width':`${score}%`, width:`${score}%`, background:color }}/></div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 18px', border:`1px solid ${t.accentBorder}`, background:t.accentBg }}>
          <Trophy size={15} style={{ color:t.accent }}/>
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', letterSpacing:'0.18em', color:t.textMuted }}>WINNER</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.95rem', fontWeight:700, color:t.text, marginTop:'2px' }}>
              {winner === 'Draw' ? 'DRAW' : winner === 'speaker1' ? 'SPEAKER 1' : 'SPEAKER 2'}
            </div>
          </div>
        </div>
        {(d.summary?.rounds || []).map((r, i) => (
          <div key={i} style={{ display:'flex', gap:'12px', padding:'10px 16px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter, alignItems:'center' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:t.accent, width:'55px' }}>RND {r.round}</span>
            <span style={{ color:t.textMuted, flex:1, fontSize:'0.78rem' }}>S1: <strong style={{ color:t.text }}>{Math.round(r.speaker1Score ?? 0)}</strong></span>
            <span style={{ color:t.textMuted, flex:1, fontSize:'0.78rem' }}>S2: <strong style={{ color:t.text }}>{Math.round(r.speaker2Score ?? 0)}</strong></span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', color: r.roundWinner === 'speaker1' ? t.accent : r.roundWinner === 'speaker2' ? 'rgba(99,102,241,0.8)' : t.textMuted }}>
              {r.roundWinner === 'Draw' ? 'DRAW' : r.roundWinner === 'speaker1' ? 'S1 WINS' : 'S2 WINS'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const TranscriptTab = ({ id }) => {
    const d = detailData[id];
    if (!d || detailLoading[id]) return <Spinner />;
    if (d.error) return <ErrBlock msg={d.error} />;
    const entries = (d.transcript || []).sort((a, b) => a.round - b.round);
    if (!entries.length) return <Empty msg="No transcript available." />;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display:'flex', gap:'12px', padding:'12px 16px', border:`1px solid ${t.accentBorder}`, background: e.speaker === 'speaker1' ? t.accentSofter : 'rgba(99,102,241,0.04)' }}>
            <div style={{ flexShrink:0, minWidth:'48px', textAlign:'center' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', color: e.speaker === 'speaker1' ? t.accent : 'rgba(99,102,241,0.8)' }}>{e.speaker === 'speaker1' ? 'S1' : 'S2'}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.45rem', color:t.textFaint }}>RND {e.round}</div>
            </div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.85rem', color:t.text, lineHeight:1.7, margin:0 }}>{e.text}</p>
          </div>
        ))}
      </div>
    );
  };

  const FactCheckTab = ({ id }) => {
    const d = detailData[id];
    if (!d || detailLoading[id]) return <Spinner />;
    if (d.error) return <ErrBlock msg={d.error} />;
    const entries = (d.factchecks || []).sort((a, b) => a.round - b.round);
    if (!entries.length) return <Empty msg="No fact-checks available." />;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {entries.map((e, i) => (
          <div key={i} style={{ padding:'14px 18px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', color: e.speaker === 'speaker1' ? t.accent : 'rgba(99,102,241,0.8)' }}>
                  {e.speaker === 'speaker1' ? 'S1' : 'S2'} · RND {e.round}
                </span>
                <span className="verdict-badge" style={{ color:verdictColor(e.verdict), background:verdictBg(e.verdict) }}>
                  <VerdictIcon v={e.verdict}/> {e.verdict || 'UNVERIFIED'}
                </span>
              </div>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', color:performanceColor(e.performance) }}>{e.performance}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.68rem', fontWeight:700, color:t.text }}>{e.score}</span>
              </div>
            </div>
            {e.claim && <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.8rem', color:t.textMuted, margin:'0 0 8px', lineHeight:1.6 }}>{e.claim}</p>}
            {e.reasoning && <div style={{ padding:'8px 12px', background:t.accentSofter, borderLeft:`2px solid ${t.accentBorder}`, fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', color:t.textMuted, lineHeight:1.6 }}>{e.reasoning}</div>}
          </div>
        ))}
      </div>
    );
  };

  const DeepTab = ({ id }) => {
    const d = detailData[id];
    if (detailLoading[`deep_${id}`]) return <Spinner msg="GENERATING AI ANALYSIS..." />;
    if (!d?.deep) return <Empty msg="Click AI ANALYSIS to generate." />;
    if (d.deep.error) return <ErrBlock msg={d.deep.error} />;
    const { overview, key_points, speaker1, speaker2 } = d.deep;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {overview && (
          <div style={{ padding:'18px 22px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.2em', color:t.accent, marginBottom:'8px' }}>OVERVIEW</div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.86rem', color:t.text, lineHeight:1.8, margin:0 }}>{overview}</p>
          </div>
        )}
        {key_points?.length > 0 && (
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.2em', color:t.textMuted, marginBottom:'8px' }}>KEY POINTS</div>
            {key_points.map((kp, i) => (
              <div key={i} style={{ display:'flex', gap:'10px', padding:'8px 12px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter, marginBottom:'4px' }}>
                <span style={{ color:t.accent, fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', flexShrink:0, marginTop:'2px' }}>{'>'}</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.82rem', color:t.textMuted, lineHeight:1.6 }}>{kp}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {[['SPEAKER 1', speaker1, t.accent], ['SPEAKER 2', speaker2, 'rgba(99,102,241,0.8)']].map(([lbl, data, color]) => data && (
            <div key={lbl} style={{ padding:'16px 18px', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.56rem', letterSpacing:'0.16em', color, marginBottom:'12px' }}>{lbl}</div>
              {data.strengths?.length > 0 && (
                <div style={{ marginBottom:'10px' }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.48rem', color:'rgba(52,211,153,0.7)', marginBottom:'5px' }}>STRENGTHS</div>
                  {data.strengths.map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'3px' }}>
                      <CheckCircle size={10} style={{ color:'rgba(52,211,153,0.7)', flexShrink:0, marginTop:'3px' }}/>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', color:t.textMuted }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {data.weaknesses?.length > 0 && (
                <div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.48rem', color:'rgba(239,68,68,0.7)', marginBottom:'5px' }}>WEAKNESSES</div>
                  {data.weaknesses.map((w, i) => (
                    <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'3px' }}>
                      <XCircle size={10} style={{ color:'rgba(239,68,68,0.7)', flexShrink:0, marginTop:'3px' }}/>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', color:t.textMuted }}>{w}</span>
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

  return (
    <PageLayout pageTitle="ARCHIVES">
      <style key={mode}>{css}</style>
      <main style={{ padding:'40px 48px', display:'flex', flexDirection:'column', gap:'32px' }}>

        <div className="fade-1">
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:t.textMuted, marginBottom:'8px' }}>// DEBATE ARCHIVES</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'2.2rem', color:t.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>SESSION<br/>RECORDS</h1>
          <p style={{ marginTop:'10px', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:t.textMuted, lineHeight:1.7 }}>
            {debates.length > 0 ? `${debates.length} DEBATE${debates.length !== 1 ? 'S' : ''} ON RECORD` : 'ALL PAST DEBATES AND VERDICTS'}
          </p>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={fetchDebates} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'transparent', border:`1px solid ${t.accentBorder}`, color:t.textMuted, fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.accentBorder; e.currentTarget.style.color = t.textMuted; }}>
            <RefreshCw size={11}/> REFRESH
          </button>
        </div>

        <div className="fade-2" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {loading ? (
            Array.from({ length:4 }).map((_, i) => <div key={i} style={{ height:'80px' }} className="skeleton"/>)
          ) : error ? (
            <div style={{ padding:'20px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'rgba(239,68,68,0.7)' }}>
              ⚠ {error} — Make sure the debate server is running on port 3001.
            </div>
          ) : debates.length === 0 ? (
            <div style={{ padding:'48px', textAlign:'center', border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
              <Archive size={32} style={{ color:t.textFaint, marginBottom:'12px' }}/>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.2em', color:t.textFaint }}>NO DEBATES ON RECORD</div>
            </div>
          ) : debates.map((debate) => {
            const id = debate.debateId || debate._id || debate.id;
            const isOpen = expandedId === id;
            const tab = activeTab[id] || 'summary';
            const detail = detailData[id];
            const s1 = detail?.summary?.speaker1Avg ?? debate.speaker1Avg ?? null;
            const s2 = detail?.summary?.speaker2Avg ?? debate.speaker2Avg ?? null;
            const winner = detail?.summary?.winner ?? debate.winner ?? (s1 != null && s2 != null ? (s1 > s2 ? 'speaker1' : s2 > s1 ? 'speaker2' : 'Draw') : null);

            return (
              <div key={id} className="debate-card">
                <button onClick={() => toggleExpand(id)} style={{ width:'100%', background:'transparent', border:'none', cursor:'pointer', padding:'20px 24px', display:'flex', alignItems:'center', gap:'16px', textAlign:'left' }}>
                  <div style={{ width:'46px', height:'46px', border:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:t.accentBg }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.46rem', color:t.accent }}>{String(id).slice(0,5).toUpperCase()}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px', flexWrap:'wrap' }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.16em', color:t.text }}>DEBATE_{String(id).toUpperCase()}</span>
                      {winner && (
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontFamily:"'DM Mono',monospace", fontSize:'0.48rem', color:t.accent, border:`1px solid ${t.accentBorder}`, padding:'2px 7px' }}>
                          <Trophy size={8}/> {winner === 'Draw' ? 'DRAW' : winner === 'speaker1' ? 'S1 WINS' : 'S2 WINS'}
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'4px', fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', color:t.textMuted }}>
                        <Calendar size={9}/> {fmt(debate.createdAt)}
                      </span>
                      {s1 != null && s2 != null && (
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', color:t.textMuted }}>
                          S1: <strong style={{ color:t.text }}>{Math.round(s1)}</strong> · S2: <strong style={{ color:t.text }}>{Math.round(s2)}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={13} style={{ color:t.accent, flexShrink:0 }}/> : <ChevronDown size={13} style={{ color:t.textMuted, flexShrink:0 }}/>}
                </button>

                {isOpen && (
                  <div style={{ borderTop:`1px solid ${t.accentBorder}` }}>
                    <div style={{ display:'flex', borderBottom:`1px solid ${t.accentBorder}`, padding:'0 20px', background:t.accentSofter }}>
                      {[
                        { key:'summary',    label:'SCORES',      Icon: BarChart },
                        { key:'transcript', label:'TRANSCRIPT',  Icon: FileText },
                        { key:'factcheck',  label:'FACT CHECK',  Icon: CheckCircle },
                        { key:'deep',       label:'AI ANALYSIS', Icon: Brain },
                      ].map(({ key, label, Icon }) => (
                        <button key={key} className={`arch-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(id, key)}>
                          <Icon size={10}/> {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding:'22px' }}>
                      {detailLoading[id] && !detail ? <Spinner /> :
                        tab === 'summary'    ? <SummaryTab id={id} /> :
                        tab === 'transcript' ? <TranscriptTab id={id} /> :
                        tab === 'factcheck'  ? <FactCheckTab id={id} /> :
                        <DeepTab id={id} />
                      }
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </PageLayout>
  );
}