import React from 'react';
import { useTheme } from '../context/ThemeContext';
import PageLayout from '../components/PageLayout';

const plannedFeatures = [
  'Global ELO Ranking System',
  'Win/Loss Ratio Tracking',
  'Top Debater Profiles',
  'Weekly Ranking Resets',
  'Subject-Based Leaderboards',
  'Institutional Rankings',
];

const ghostRows = [
  { rank: '#01', name: '??? OPERATOR', elo: '—', wins: '—', ratio: '—' },
  { rank: '#02', name: '??? OPERATOR', elo: '—', wins: '—', ratio: '—' },
  { rank: '#03', name: '??? OPERATOR', elo: '—', wins: '—', ratio: '—' },
  { rank: '#04', name: '??? OPERATOR', elo: '—', wins: '—', ratio: '—' },
  { rank: '#05', name: '??? OPERATOR', elo: '—', wins: '—', ratio: '—' },
];

export default function Council() {
  const { theme: t, mode } = useTheme();

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
    .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }

    .feature-card {
      display:flex; align-items:center; gap:12px;
      padding:16px 20px;
      border:1px solid ${t.border};
      background:${t.accentSofter};
      border-radius:4px;
      transition:all 0.2s;
    }
    .feature-card:hover { border-color:${t.accentBorder}; background:${t.accentBg}; }
  `;

  const topbarContent = (
    <div style={{ display:'flex', gap:'32px', height:'100%', alignItems:'center', paddingLeft:'24px' }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.875rem', letterSpacing:'0.05em', color:t.text, fontWeight:600, paddingBottom:'2px', borderBottom:`2px solid ${t.accent}` }}>
        Leaderboard
      </div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.875rem', letterSpacing:'0.05em', color:t.textMuted }}>
        Future Scope
      </div>
    </div>
  );

  return (
    <PageLayout topbarContent={topbarContent} returnPath="/dashboard" returnLabel="← Return to Dashboard">
      <style key={mode}>{css}</style>
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 48px', gap:'60px' }}>

        {/* Header */}
        <div className="fade-1" style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:t.textMuted, marginBottom:'16px' }}>
            Module Status: Access Restricted
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'2.5rem', color:t.text, letterSpacing:'0.05em', textTransform:'uppercase', lineHeight:1.2, marginBottom:'20px' }}>
            Council Chamber<br/>Locked
          </h1>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.95rem', letterSpacing:'0.03em', color:t.textMuted, lineHeight:1.8, maxWidth:'500px', margin:'0 auto' }}>
            The global leaderboard is currently restricted.<br/>
            Operator rankings and ELO scoring will be<br/>
            unlocked in the next protocol update.
          </p>
        </div>

        {/* Ghost leaderboard */}
        <div className="fade-2" style={{ width:'100%', maxWidth:'700px' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.79rem', letterSpacing:'0.1em', color:t.textFaint, marginBottom:'16px', textAlign:'center', textTransform:'uppercase' }}>
            Preview — Data Locked
          </div>

          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 100px 80px 100px', gap:'16px', padding:'12px 20px', borderBottom:`1px solid ${t.border}`, background:t.surface }}>
            {['Rank','Operator','ELO','Wins','Ratio'].map(h => (
              <span key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.1em', color:t.textMuted, textTransform:'uppercase' }}>{h}</span>
            ))}
          </div>

          {/* Blurred rows */}
          <div style={{ border:`1px solid ${t.border}`, borderTop:'none', filter:'blur(2px)', userSelect:'none', pointerEvents:'none', background:t.accentSofter }}>
            {ghostRows.map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr 100px 80px 100px', gap:'16px', padding:'16px 20px', borderBottom: i < ghostRows.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                {[row.rank, row.name, row.elo, row.wins, row.ratio].map((val, j) => (
                  <span key={j} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.85rem', color:t.textFaint }}>{val}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Lock badge */}
          <div style={{ marginTop:'16px', padding:'14px', border:`1px solid ${t.border}`, background:t.accentSofter, textAlign:'center', borderRadius:'4px' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:t.textMuted }}>
              🔒 Rankings Sealed · Clearance Level Insufficient
            </span>
          </div>
        </div>

        {/* Planned features */}
        <div className="fade-3" style={{ width:'100%', maxWidth:'700px' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.79rem', letterSpacing:'0.1em', color:t.accent, marginBottom:'24px', textAlign:'center', textTransform:'uppercase' }}>
            Planned Capabilities
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {plannedFeatures.map((feature, i) => (
              <div key={i} className="feature-card">
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:t.accent, flexShrink:0 }}/>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.8rem', color:t.textMuted, letterSpacing:'0.03em' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="fade-4" style={{ textAlign:'center', paddingTop:'40px', borderTop:`1px solid ${t.border}`, maxWidth:'600px', width:'100%' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:t.textMuted }}>
            Estimated Deployment: P3 2026 · ArguMind v3.0
          </div>
        </div>

      </main>
    </PageLayout>
  );
}