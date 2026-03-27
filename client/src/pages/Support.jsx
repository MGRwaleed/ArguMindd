import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, BookOpen, Shield, BarChart2, Archive,
  Settings, HelpCircle, LogOut, ChevronDown, ChevronUp,
  MessageSquare, FileText, Mail, Bug, Brain, Cpu, Mic
} from 'lucide-react';
import authService from '../services/authService';

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

  .v-nav-btn {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:9px 16px; border:none; background:transparent;
    cursor:pointer; text-align:left; transition:all 0.2s;
    font-family:'Space Mono', monospace; border-left:2px solid transparent;
  }
  .v-nav-btn:hover { background:rgba(180,83,9,0.12); border-left-color:rgba(180,83,9,0.4) !important; color:#E5E7EB !important; }

  .faq-item { border-bottom:1px solid rgba(180,83,9,0.1); }
  .faq-item:last-child { border-bottom:none; }
  .faq-question {
    width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; background:transparent; border:none; cursor:pointer; text-align:left; transition:all 0.2s;
  }
  .faq-question:hover span { color:#E5E7EB !important; }

  .contact-btn {
    display:flex; align-items:center; gap:12px; padding:16px 20px;
    background:rgba(75,85,99,0.15); border:1px solid rgba(180,83,9,0.15);
    cursor:pointer; transition:all 0.2s; width:100%; text-align:left;
  }
  .contact-btn:hover { background:rgba(180,83,9,0.08); border-color:rgba(180,83,9,0.35); }

  .doc-card {
    padding:20px 24px; background:rgba(75,85,99,0.15);
    border:1px solid rgba(180,83,9,0.12); transition:all 0.2s; cursor:pointer;
  }
  .doc-card:hover { background:rgba(180,83,9,0.06); border-color:rgba(180,83,9,0.3); }

  /* ── Same pill style as Dashboard ── */
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

  .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
  .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
  .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
  .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }
  .fade-6 { animation:fadeIn 1s 0.5s ease forwards; opacity:0; }
`;

const navItems = [
  { icon: BookOpen,  label: 'COMMAND',  sub: 'Dashboard',   path: '/dashboard' },
  { icon: Archive,   label: 'ARCHIVES', sub: 'History',     path: '/debates/history' },
  { icon: BarChart2, label: 'SYSTEMS',  sub: 'Analytics',   path: '/analytics' },
  { icon: Shield,    label: 'COUNCIL',  sub: 'Leaderboard', path: '/leaderboard' },
];

const faqs = [
  { q: 'HOW DOES CLAIM EXTRACTION WORK?', a: 'ArguMind uses Groq llama-3.3-70b-versatile to analyze debate transcripts and extract all factual claims made by each speaker. The model identifies checkable assertions and separates them from opinions or rhetorical statements.' },
  { q: 'HOW IS THE DEBATE SCORED?', a: 'Each extracted claim is fact-checked using Tavily research API to retrieve real-time evidence. Groq llama-3.3-70b-versatile then generates a verdict — TRUE, FALSE, or PARTIALLY TRUE — with a confidence score between 0.0 and 1.0. Final scores are calculated per speaker based on claim accuracy and confidence weighted averages.' },
  { q: 'WHAT AI MODELS POWER ARGUMIND?', a: 'ArguMind uses Groq llama-3.3-70b-versatile for claim extraction and verdict generation, Tavily API for real-time evidence retrieval and web research, and Whisper / Google STT for speech-to-text transcription of live debate audio.' },
  { q: 'HOW ACCURATE IS THE FACT CHECKING?', a: 'Accuracy depends on the availability of public information about the claim topic. For well-documented topics, Groq + Tavily achieves high reliability. Each verdict includes a confidence score so you always know how certain the system is about its judgment.' },
  { q: 'WHAT LANGUAGES ARE SUPPORTED?', a: 'ArguMind currently supports English as the primary language. The Groq prompt includes translation instructions, so non-English input is automatically translated before claim extraction. Full multilingual support is planned for future versions.' },
  { q: 'HOW ARE SPEAKER TRANSCRIPTS SEPARATED?', a: 'The frontend labels audio from each participant as Speaker 1 or Speaker 2. The combined labeled transcript is sent to the /analyze-debate endpoint where it is split by speaker prefix and processed independently, enabling per-speaker scoring.' },
];

const docs = [
  { icon: Mic,      title: 'HOW TO START A DEBATE',      desc: 'Navigate to ARENA from the sidebar. Two participants join the session. Audio is captured and converted to text in real time via the STT engine. Both speakers are labeled automatically.' },
  { icon: FileText, title: 'HOW TO READ YOUR SCORE',     desc: 'After a debate ends, each speaker receives an accuracy score (0-100) based on how many of their claims were verified as TRUE. Confidence weights are applied — higher confidence verdicts impact the score more.' },
  { icon: Brain,    title: 'HOW VERDICTS ARE GENERATED', desc: 'Claims are sent to Tavily for evidence retrieval. The retrieved evidence is passed to Groq along with the original claim. Groq returns TRUE, FALSE, or PARTIALLY TRUE with an explanation and confidence float.' },
  { icon: Cpu,      title: 'PIPELINE EXPLANATION',       desc: 'Audio Input → STT Engine → Labeled Transcript → Groq Claim Extraction → Tavily Evidence Retrieval → Groq Verdict Generation → Scoring Module → Results Display. Each stage is modular and independently testable.' },
];

const contacts = [
  { icon: Bug,           label: 'REPORT A BUG',    desc: 'Found something broken? Let us know.' },
  { icon: MessageSquare, label: 'SUBMIT FEEDBACK',  desc: 'Suggestions to improve ArguMind.' },
  {
    icon: Mail, label: 'CONTACT THE TEAM',
    desc: (
      <div style={{ display:'flex', flexDirection:'column', gap:'3px', marginTop:'4px' }}>
        <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.1em', color:'#9CA3AF' }}>waleeddastagir1@gmail.com</span>
        <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.55rem', letterSpacing:'0.1em', color:'#9CA3AF' }}>asyedsameer31@gmail.com</span>
      </div>
    )
  },
];

const TABS = [
  { label: 'SUPPORT', sectionKey: null },
  { label: 'FAQ',     sectionKey: 'faq' },
  { label: 'DOCS',    sectionKey: 'docs' },
  { label: 'CONTACT', sectionKey: 'contact' },
];

export default function Support() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openFaq, setOpenFaq]         = useState(null);
  const [contactForm, setContactForm] = useState({ subject:'', message:'' });
  const [submitted, setSubmitted]     = useState(false);
  const [activeTab, setActiveTab]     = useState('SUPPORT');
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const sectionRefs = {
    faq:     useRef(null),
    docs:    useRef(null),
    contact: useRef(null),
  };
  const mainRef = useRef(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (!tab.sectionKey) {
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = sectionRefs[tab.sectionKey]?.current;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = 100;
      const order = ['contact', 'docs', 'faq'];
      for (const key of order) {
        const el = sectionRefs[key]?.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveTab(key === 'faq' ? 'FAQ' : key === 'docs' ? 'DOCS' : 'CONTACT');
            return;
          }
        }
      }
      setActiveTab('SUPPORT');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipients = 'waleeddastagir1@gmail.com,asyedsameer31@gmail.com';
    const subject = encodeURIComponent(contactForm.subject);
    const body = encodeURIComponent(contactForm.message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(recipients)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ subject:'', message:'' });
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#1F2937', fontFamily:"'Space Grotesk', sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{themeStyles}</style>

      {/* Grid */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(180,83,9,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(180,83,9,0.05) 1px, transparent 1px)`, backgroundSize:'60px 60px', animation:'gridPulse 5s ease-in-out infinite' }}/>

      {/* Scanline */}
      <div style={{ position:'fixed', left:0, right:0, height:'2px', zIndex:1, pointerEvents:'none', background:'linear-gradient(transparent, rgba(180,83,9,0.06), transparent)', animation:'scanline 10s linear infinite' }}/>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{ position:'fixed', left:p.left, bottom:p.bottom, width:p.size, height:p.size, borderRadius:'50%', background:'#B45309', opacity:0, pointerEvents:'none', zIndex:1, animation:`particleDrift ${p.duration} ${p.delay} infinite linear` }}/>
      ))}

      {/* Ambient glow */}
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
          <button className="v-nav-btn" style={{ color:'#E5E7EB', background:'rgba(180,83,9,0.1)', borderLeft:'2px solid #B45309' }}>
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

        {/* ── TOPBAR with pill tabs ── */}
        <header style={{ position:'sticky', top:0, zIndex:20, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(31,41,55,0.97)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(180,83,9,0.2)', height:'60px' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, #B45309, transparent)' }}/>

          {/* Pill tabs — same as Dashboard */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {TABS.map((tab) => (
              <button
                key={tab.label}
                className={`top-tab${activeTab === tab.label ? ' active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/dashboard')} style={{ padding:'8px 20px', background:'transparent', border:'1px solid rgba(180,83,9,0.3)', color:'#9CA3AF', fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.2em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,83,9,0.1)'; e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#E5E7EB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(180,83,9,0.3)'; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            ← RETURN TO COMMAND
          </button>
        </header>

        <main style={{ padding:'40px 48px 0', display:'flex', flexDirection:'column', gap:'48px' }}>

          {/* Page header */}
          <div className="fade-1">
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:'#9CA3AF', marginBottom:'8px' }}>// SUPPORT / HELP CENTER</div>
            <h1 style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, fontSize:'2.2rem', color:'#E5E7EB', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              HOW CAN WE<br/>HELP YOU?
            </h1>
            <p style={{ marginTop:'10px', fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:'#9CA3AF', lineHeight:1.7 }}>
              FIND ANSWERS, READ DOCUMENTATION, OR REACH OUT TO THE TEAM.
            </p>
          </div>

          {/* ── FAQ ── */}
          <div ref={sectionRefs.faq} className="fade-2">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'3px', height:'18px', background:'#B45309', borderRadius:'2px' }}/>
              <h2 style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'#9CA3AF' }}>FREQUENTLY ASKED QUESTIONS</h2>
            </div>
            <div style={{ border:'1px solid rgba(180,83,9,0.2)', background:'rgba(75,85,99,0.1)' }}>
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.15em', color: openFaq === i ? '#E5E7EB' : '#9CA3AF', textTransform:'uppercase', transition:'color 0.2s' }}>{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={14} style={{ color:'#B45309', flexShrink:0 }}/>
                      : <ChevronDown size={14} style={{ color:'#9CA3AF', flexShrink:0 }}/>
                    }
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:'0 24px 20px', paddingTop:'16px', fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.85rem', color:'#9CA3AF', lineHeight:1.8, borderTop:'1px solid rgba(180,83,9,0.08)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── DOCUMENTATION ── */}
          <div ref={sectionRefs.docs} className="fade-3">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'3px', height:'18px', background:'#B45309', borderRadius:'2px' }}/>
              <h2 style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'#9CA3AF' }}>DOCUMENTATION</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px' }}>
              {docs.map(({ icon:Icon, title, desc }, i) => (
                <div key={i} className="doc-card">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ width:'32px', height:'32px', border:'1px solid rgba(180,83,9,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(180,83,9,0.08)' }}>
                      <Icon size={14} style={{ color:'#B45309' }}/>
                    </div>
                    <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:'#E5E7EB', textTransform:'uppercase' }}>{title}</span>
                  </div>
                  <p style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.82rem', color:'#9CA3AF', lineHeight:1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CONTACT ── */}
          <div ref={sectionRefs.contact} className="fade-4">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'3px', height:'18px', background:'#B45309', borderRadius:'2px' }}/>
              <h2 style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:'#9CA3AF' }}>CONTACT / REPORT</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {contacts.map(({ icon:Icon, label, desc }, i) => (
                  <button key={i} className="contact-btn">
                    <div style={{ width:'32px', height:'32px', border:'1px solid rgba(180,83,9,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(180,83,9,0.08)' }}>
                      <Icon size={14} style={{ color:'#B45309' }}/>
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:'#E5E7EB', textTransform:'uppercase' }}>{label}</div>
                      <div style={{ marginTop:'3px' }}>{typeof desc === 'string'
                        ? <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.78rem', color:'#9CA3AF' }}>{desc}</span>
                        : desc
                      }</div>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ border:'1px solid rgba(180,83,9,0.2)', padding:'24px', background:'rgba(75,85,99,0.1)' }}>
                {submitted ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'12px' }}>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', letterSpacing:'0.2em', color:'#B45309' }}>MESSAGE_TRANSMITTED</div>
                    <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:'0.8rem', color:'#9CA3AF' }}>The team will respond shortly.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom:'16px' }}>
                      <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:'#9CA3AF', marginBottom:'8px' }}>SUBJECT</div>
                      <input type="text" value={contactForm.subject} required
                        onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="[BRIEF_DESCRIPTION]"
                        style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(180,83,9,0.25)', color:'#E5E7EB', fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', padding:'8px 0', outline:'none', letterSpacing:'0.08em', caretColor:'#B45309' }}
                      />
                    </div>
                    <div style={{ marginBottom:'20px' }}>
                      <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:'#9CA3AF', marginBottom:'8px' }}>MESSAGE</div>
                      <textarea value={contactForm.message} required rows={4}
                        onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="[DESCRIBE_YOUR_ISSUE_OR_FEEDBACK]"
                        style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(180,83,9,0.25)', color:'#E5E7EB', fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', padding:'8px 0', outline:'none', resize:'none', letterSpacing:'0.08em', caretColor:'#B45309' }}
                      />
                    </div>
                    <button type="submit" style={{ width:'100%', padding:'11px', background:'transparent', border:'1px solid rgba(180,83,9,0.4)', color:'#B45309', fontFamily:"'Space Mono', monospace", fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,83,9,0.1)'; e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#E5E7EB'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(180,83,9,0.4)'; e.currentTarget.style.color = '#B45309'; }}
                    >
                      TRANSMIT_MESSAGE →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer style={{ marginTop:'24px', padding:'40px 0 32px', borderTop:'1px solid rgba(180,83,9,0.15)', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.75rem', letterSpacing:'0.2em', color:'#9CA3AF' }}>
              Made with ❤️ by the ArguMind Team
            </span>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'0.65rem', letterSpacing:'0.2em', color:'#4B5563', textAlign:'center' }}>
              All rights reserved. ArguMind is a product of the ArguMind Team, © 2026.
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}