import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  const onChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authService.login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:t.bg, fontFamily:'var(--font-body)', position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes floatBubble {
          0%   { transform: translateY(0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 0.4; }
          100% { transform: translateY(-105vh); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
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

        .login-anim-1 { animation: fadeSlideUp 0.55s 0.05s ease both; }
        .login-anim-2 { animation: fadeSlideUp 0.55s 0.18s ease both; }
        .login-anim-3 { animation: fadeSlideUp 0.55s 0.31s ease both; }
        .login-anim-4 { animation: fadeSlideUp 0.55s 0.44s ease both; }
        .login-anim-5 { animation: fadeSlideUp 0.55s 0.57s ease both; }
        .login-anim-6 { animation: fadeSlideUp 0.55s 0.70s ease both; }

        .arguemind-input {
          width: 100%;
          background: ${t.surface} !important;
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
          -webkit-box-shadow: 0 0 0px 1000px ${t.surface} inset !important;
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

        .login-theme-toggle {
          width: 44px; height: 24px; background: ${t.accentBg};
          border: 1px solid ${t.accent}; border-radius: 12px;
          cursor: pointer; display: flex; align-items: center; padding: 2px; transition: all 0.3s;
        }
        .login-theme-knob {
          width: 18px; height: 18px; background: ${t.accent}; border-radius: 50%;
          transition: transform 0.3s; transform: translateX(${mode === 'light' ? '20px' : '0px'});
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      {/* Grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`, backgroundSize:'60px 60px', animation:'gridPulse 6s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>

      {/* Scanline */}
      <div style={{ position:'fixed', left:0, right:0, height:'1px', background:`linear-gradient(transparent, ${t.accent}20, transparent)`, animation:'scanline 14s linear infinite', pointerEvents:'none', zIndex:1 }}/>

      {/* Ambient glows */}
      <div style={{ position:'fixed', top:'-100px', right:'-100px', width:'440px', height:'440px', background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`, pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:'-80px', left:'-80px', width:'360px', height:'360px', background:`radial-gradient(circle, ${t.ambient} 0%, transparent 65%)`, pointerEvents:'none', zIndex:0 }}/>

      {/* Bubbles */}
      {bubbles.map(b => (
        <div key={b.id} style={{
          position:'fixed', left:b.left, bottom:b.bottom,
          width:b.size, height:b.size, borderRadius:'50%',
          border:`1px solid ${t.accentBorder}`,
          background:`radial-gradient(circle at 35% 35%, ${t.accentBg}, transparent)`,
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
          <button className="login-theme-toggle" onClick={toggle}>
            <div className="login-theme-knob">
              {mode === 'dark' ? <Moon size={10} style={{ color:'#FEF9F3' }}/> : <Sun size={10} style={{ color:'#FEF9F3' }}/>}
            </div>
          </button>
          <Moon size={13} style={{ color: mode === 'dark' ? t.accent : t.textFaint, transition:'color 0.3s' }}/>
        </div>
      </div>

      {/* ── LOGIN CARD ── */}
      <div style={{ position:'relative', zIndex:5, width:'100%', maxWidth:'420px', margin:'80px 24px 24px' }}>

        {/* Accent top bar */}
        <div style={{ height:'3px', background:t.topbarGradient, borderRadius:'4px 4px 0 0', transformOrigin:'left', animation:'accentBar 0.5s 0.05s ease both' }}/>

        {/* Card body */}
        <div style={{ background:t.surface, border:`1px solid ${t.accentBorder}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'40px 36px' }}>

          {/* Heading */}
          <div className="login-anim-1" style={{ textAlign:'center', marginBottom:'32px' }}>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-xl)', color:t.text, lineHeight:'var(--lh-tight)', fontWeight:400, marginBottom:'8px' }}>
              Welcome Back
            </h1>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:t.textMuted, fontWeight:400 }}>
              Enter your credentials to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:'20px', padding:'11px 14px', background:t.accentBg, border:`1px solid ${t.accentBorder}`, borderRadius:'4px', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:t.accent, fontWeight:500 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="login-anim-2" style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.68rem', letterSpacing:'0.12em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px', fontWeight:600 }}>
                Email Address
              </label>
              <input type="email" name="email" value={formData.email} onChange={onChange}
                className="arguemind-input" placeholder="your.email@gmail.com"
                pattern="[a-zA-Z0-9._%+\-]+@gmail\.com" title="Only Gmail addresses are accepted" required/>
            </div>

            <div className="login-anim-3" style={{ marginBottom:'28px' }}>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.68rem', letterSpacing:'0.12em', color:t.textMuted, textTransform:'uppercase', marginBottom:'8px', fontWeight:600 }}>
                Password
              </label>
              <input type="password" name="password" value={formData.password} onChange={onChange}
                className="arguemind-input" placeholder="Enter your password" required/>
            </div>

            <div className="login-anim-4">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="login-anim-5" style={{ marginTop:'24px', textAlign:'center' }}>
            <Link to="/signup" style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:t.textMuted, textDecoration:'none', fontWeight:400, transition:'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = t.accent}
              onMouseLeave={e => e.target.style.color = t.textMuted}>
              Don't have an account? <span style={{ color:t.accent, fontWeight:600 }}>Sign Up</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-body)', fontSize:'0.65rem', letterSpacing:'0.18em', color:t.textFaint, textTransform:'uppercase', whiteSpace:'nowrap', zIndex:10, fontWeight:500 }}>
        Powered by AI · Engineered for Truth
      </div>
    </div>
  );
}