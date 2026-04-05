import React from 'react';
import { useTheme } from '../context/ThemeContext';
import PageLayout from '../components/PageLayout';

const plannedFeatures = [
  'Real-time Argument Heatmaps',
  'Claim Accuracy Trend Graphs',
  'Speaker Performance Insights',
  'Debate Duration Analytics',
  'Verdict Distribution Charts',
  'Weekly Performance Reports',
];

export default function Systems() {
  const { theme: t, mode } = useTheme();

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }

    .feature-card {
      display:flex; align-items:center; gap:12px;
      padding:16px 20px;
      border:1px solid ${t.border};
      background:${t.accentSofter};
      border-radius:4px;
      transition: all 0.2s;
    }
    .feature-card:hover { border-color:${t.accentBorder}; background:${t.accentBg}; }
  `;

  const topbarContent = (
    <div style={{ display:'flex', gap:'32px', height:'100%', alignItems:'center', paddingLeft:'24px' }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.875rem', letterSpacing:'0.05em', color:t.text, fontWeight:600, paddingBottom:'2px', borderBottom:`2px solid ${t.accent}` }}>
        Analytics
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

        {/* Status */}
        <div className="fade-1" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'32px', textAlign:'center' }}>
          <div style={{ width:'120px', height:'120px', border:`2px dashed ${t.border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'80px', height:'80px', border:`1px solid ${t.border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:t.textMuted, letterSpacing:'0.1em' }}>OFFLINE</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:t.textMuted, marginBottom:'16px' }}>
              Module Status: Development Pending
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'2.5rem', color:t.text, letterSpacing:'0.05em', textTransform:'uppercase', lineHeight:1.2, marginBottom:'20px' }}>
              Analytics Engine<br/>Coming Soon
            </h1>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.95rem', letterSpacing:'0.03em', color:t.textMuted, lineHeight:1.8, maxWidth:'500px', margin:'0 auto' }}>
              This module is currently under development.<br/>
              Advanced analytics and performance insights<br/>
              will be available in the next release.
            </p>
          </div>
        </div>

        {/* Planned features */}
        <div className="fade-2" style={{ width:'100%', maxWidth:'700px' }}>
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
        <div className="fade-3" style={{ textAlign:'center', paddingTop:'40px', borderTop:`1px solid ${t.border}`, maxWidth:'600px', width:'100%' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.1em', color:t.textMuted }}>
            Estimated Deployment: P3 2026 · ArguMind v3.0
          </div>
        </div>

      </main>
    </PageLayout>
  );
}