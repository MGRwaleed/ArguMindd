import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { theme: t, mode, toggle } = useTheme();

  const bubbles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left:     `${Math.random() * 100}%`,
    bottom:   `-${5 + Math.random() * 5}%`,
    size:     `${3 + Math.random() * 8}px`,
    delay:    `${Math.random() * 14}s`,
    duration: `${12 + Math.random() * 16}s`,
    opacity:  0.25 + Math.random() * 0.35,
  })), []);

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes floatBubble {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 0.4; }
      100% { transform: translateY(-105vh) translateX(12px); opacity: 0; }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlideLeft {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes gridPulse {
      0%, 100% { opacity: 0.04; }
      50%       { opacity: 0.07; }
    }
    @keyframes accentBar {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    .left-anim-1 { opacity:0; animation: fadeSlideUp 0.6s 0.1s ease forwards; }
    .left-anim-2 { opacity:0; animation: fadeSlideUp 0.6s 0.22s ease forwards; }
    .left-anim-3 { opacity:0; animation: fadeSlideUp 0.6s 0.36s ease forwards; }
    .left-anim-4 { opacity:0; animation: fadeSlideUp 0.6s 0.50s ease forwards; }

    .form-anim-1 { opacity:0; animation: fadeSlideLeft 0.6s 0.15s ease forwards; }
    .form-anim-2 { opacity:0; animation: fadeSlideLeft 0.6s 0.27s ease forwards; }
    .form-anim-3 { opacity:0; animation: fadeSlideLeft 0.6s 0.39s ease forwards; }
    .form-anim-4 { opacity:0; animation: fadeSlideLeft 0.6s 0.51s ease forwards; }
    .form-anim-5 { opacity:0; animation: fadeSlideLeft 0.6s 0.63s ease forwards; }
    .form-anim-6 { opacity:0; animation: fadeSlideLeft 0.6s 0.75s ease forwards; }

    .arguemind-input {
      width: 100%;
      background: ${t.bg} !important;
      border: 1px solid ${t.border} !important;
      color: ${t.text} !important;
      -webkit-text-fill-color: ${t.text} !important;
      caret-color: ${t.accent} !important;
      font-family: var(--font-body) !important;
      font-size: 0.875rem !important;
      font-weight: 400 !important;
      padding: 12px 16px !important;
      outline: none !important;
      transition: border-color 0.25s, box-shadow 0.25s !important;
      border-radius: 4px !important;
    }
    .arguemind-input::placeholder {
      color: ${t.textFaint} !important;
      -webkit-text-fill-color: ${t.textFaint} !important;
      font-weight: 300 !important;
    }
    .arguemind-input:focus {
      border-color: ${t.accent} !important;
      box-shadow: 0 0 0 3px ${t.accentGlow} !important;
    }
    .arguemind-input:-webkit-autofill,
    .arguemind-input:-webkit-autofill:hover,
    .arguemind-input:-webkit-autofill:focus {
      -webkit-text-fill-color: ${t.text} !important;
      -webkit-box-shadow: 0 0 0px 1000px ${t.bg} inset !important;
      transition: background-color 5000s ease-in-out 0s !important;
    }

    .submit-btn {
      width: 100%; padding: 13px;
      background: ${t.accent}; border: none; border-radius: 4px;
      color: #fff; font-family: var(--font-body);
      font-size: 0.8rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; transition: all 0.2s;
      position: relative; overflow: hidden;
    }
    .submit-btn::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      transform: translateX(-100%); transition: transform 0.4s;
    }
    .submit-btn:hover { background: ${t.accentHover}; transform: translateY(-1px); box-shadow: 0 4px 16px ${t.accentGlow}; }
    .submit-btn:hover::after { transform: translateX(100%); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    .feature-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${t.accent}; flex-shrink: 0;
      box-shadow: 0 0 6px ${t.accentGlow};
    }

    .theme-toggle {
      width: 44px; height: 24px; background: ${t.accentBg};
      border: 1px solid ${t.accent}; border-radius: 12px;
      cursor: pointer; display: flex; align-items: center; padding: 2px; transition: all 0.3s;
    }
    .theme-toggle-knob {
      width: 18px; height: 18px; background: ${t.accent}; border-radius: 50%;
      transition: transform 0.3s; transform: translateX(${mode === 'light' ? '20px' : '0px'});
      display: flex; align-items: center; justify-content: center;
    }
  `;

  const onChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authService.signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:t.bg, fontFamily:'var(--font-body)', position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
      <style key={mode}>{css}</style>

      {/* Grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`, backgroundSize:'60px 60px', animation:'gridPulse 6s ease-in-out infinite', pointerEvents:'none' }}/>

      {/* Scanline — barely visible */}
      <div style={{ position:'fixed', left:0, right:0, height:'1px', background:`linear-gradient(transparent, ${t.accent}18, transparent)`, animation:'scanline 14s linear infinite', pointerEvents:'none', zIndex:1 }}/>

      {/* Ambient glows */}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'440px', height:'440px', background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`, pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:'-80px', left:'-80px', width:'360px', height:'360px', background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`, pointerEvents:'none' }}/>

      {/* Small bubbles */}
      {bubbles.map(b => (
        <div key={b.id} style={{
          position:'fixed', left:b.left, bottom:b.bottom,
          width:b.size, height:b.size, borderRadius:'50%',
          border:`1px solid ${t.accent}${Math.round(b.opacity * 255).toString(16).padStart(2,'0')}`,
          background:`radial-gradient(circle at 35% 35%, ${t.accent}22, transparent)`,
          pointerEvents:'none', zIndex:1,
          animation:`floatBubble ${b.duration} ${b.delay} ease-in infinite`,
        }}/>
      ))}

      {/* Topbar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:20, padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${t.accentBorder}`, background: mode === 'dark' ? 'rgba(31,41,55,0.95)' : 'rgba(253,246,236,0.95)', backdropFilter:'blur(12px)', transition:'background 0.3s' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:t.topbarGradient }}/>
        <div style={{ fontFamily:'var(--font-heading)', fontSize:'1.4rem', color:t.text, lineHeight:1 }}>ArguMind</div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Sun size={13} style={{ color: mode === 'light' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
          <button className="theme-toggle" onClick={toggle}>
            <div className="theme-toggle-knob">
              {mode === 'dark' ? <Moon size={10} style={{ color:'#FEF9F3' }}/> : <Sun size={10} style={{ color:'#FEF9F3' }}/>}
            </div>
          </button>
          <Moon size={13} style={{ color: mode === 'dark' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
        </div>
      </div>

      {/* ── SPLIT LAYOUT ── */}
      <div style={{ display:'flex', width:'100%', paddingTop:'64px', position:'relative', zIndex:5 }}>

        {/* LEFT PANEL — Hero */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 60px 80px 100px', borderRight:`1px solid ${t.accentBorder}` }}>

          <div className="left-anim-1" style={{ width:'64px', height:'3px', background:t.topbarGradient, borderRadius:'2px', marginBottom:'28px', transformOrigin:'left', animation:'accentBar 0.5s 0.05s ease both, fadeSlideUp 0s 0s linear' }}/>

          <h1 className="left-anim-2" style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-3xl)', color:t.text, lineHeight:'var(--lh-tight)', marginBottom:'20px', fontWeight:400 }}>
            Join the<br/><span style={{ color:t.accent }}>Arena.</span>
          </h1>

          <p className="left-anim-3" style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:t.textMuted, lineHeight:'var(--lh-relaxed)', maxWidth:'380px', fontWeight:400, marginBottom:'40px' }}>
            Submit your arguments. Let the AI judge decide.<br/>Fair analysis. Unbiased verdicts.
          </p>

          <div className="left-anim-4" style={{ padding:'20px 24px', background:t.surface, border:`1px solid ${t.border}`, borderRadius:'4px', maxWidth:'360px' }}>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.14em', color:t.accent, textTransform:'uppercase', fontWeight:600, marginBottom:'14px' }}>
              Platform Features
            </div>
            {['Real-time fact verification','AI-powered claim analysis','Performance tracking','Debate history archive'].map((f) => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                <div className="feature-dot"/>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:t.textMuted, fontWeight:400 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div style={{ width:'480px', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 100px 80px 60px' }}>

          <div className="form-anim-1" style={{ marginBottom:'28px' }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-xl)', color:t.text, lineHeight:'var(--lh-tight)', fontWeight:400, marginBottom:'6px' }}>Create Account</h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:t.textMuted, fontWeight:400 }}>Start your debate journey today</p>
          </div>

          {error && (
            <div style={{ marginBottom:'20px', padding:'11px 14px', background:t.accentBg, border:`1px solid ${t.accentBorder}`, borderRadius:'4px', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:t.accent, fontWeight:500 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-anim-2" style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.68rem', letterSpacing:'0.12em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px', fontWeight:600 }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={onChange}
                className="arguemind-input" placeholder="Enter your full name" required/>
            </div>

            <div className="form-anim-3" style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.68rem', letterSpacing:'0.12em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px', fontWeight:600 }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={onChange}
                className="arguemind-input" placeholder="your.email@gmail.com"
                pattern="[a-zA-Z0-9._%+\-]+@gmail\.com" title="Only Gmail addresses are accepted" required/>
            </div>

            <div className="form-anim-4" style={{ marginBottom:'28px' }}>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.68rem', letterSpacing:'0.12em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px', fontWeight:600 }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={onChange}
                className="arguemind-input" placeholder="Create a strong password" required/>
            </div>

            <div className="form-anim-5">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="form-anim-6" style={{ marginTop:'24px', textAlign:'center' }}>
            <Link to="/login" style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:t.textMuted, textDecoration:'none', fontWeight:400, transition:'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = t.accent}
              onMouseLeave={e => e.target.style.color = t.textMuted}>
              Already have an account? <span style={{ color:t.accent, fontWeight:600 }}>Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.18em', color:t.textFaint, textTransform:'uppercase', whiteSpace:'nowrap', zIndex:10, fontWeight:500 }}>

      </div>
    </div>
  );
}