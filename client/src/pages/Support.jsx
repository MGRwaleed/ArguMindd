import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, MessageSquare, FileText,
  Mail, Bug, Brain, Cpu, Mic
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PageLayout from '../components/PageLayout';

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
  { icon: Cpu,      title: 'PIPELINE EXPLANATION',       desc: 'Audio Input → STT Engine → Labeled Transcript → Groq Claim Extraction → Tavily Evidence Retrieval → Groq Verdict Generation → Scoring Module → Results Display.' },
];

const TABS = [
  { label: 'SUPPORT', sectionKey: null },
  { label: 'FAQ',     sectionKey: 'faq' },
  { label: 'DOCS',    sectionKey: 'docs' },
  { label: 'CONTACT', sectionKey: 'contact' },
];

export default function Support() {
  const { theme: t, mode } = useTheme();
  const [openFaq, setOpenFaq]         = useState(null);
  const [contactForm, setContactForm] = useState({ subject:'', message:'' });
  const [submitted, setSubmitted]     = useState(false);
  const [activeTab, setActiveTab]     = useState('SUPPORT');

  const mainRef = useRef(null);
  const sectionRefs = { faq: useRef(null), docs: useRef(null), contact: useRef(null) };

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    .faq-item { border-bottom:1px solid ${t.accentBorder}; }
    .faq-item:last-child { border-bottom:none; }
    .faq-question { width:100%; display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:transparent; border:none; cursor:pointer; text-align:left; transition:all 0.2s; }
    .faq-question:hover span { color:${t.text} !important; }

    .contact-btn { display:flex; align-items:center; gap:12px; padding:16px 20px; background:${t.accentSofter}; border:1px solid ${t.accentBorder}; cursor:pointer; transition:all 0.2s; width:100%; text-align:left; }
    .contact-btn:hover { background:${t.accentBg}; border-color:${t.accent}; }

    .doc-card { padding:20px 24px; background:${t.accentSofter}; border:1px solid ${t.accentBorder}; transition:all 0.2s; cursor:pointer; }
    .doc-card:hover { background:${t.accentBg}; border-color:${t.accent}; }

    .sup-tab { padding:0 20px; height:52px; display:flex; align-items:center; font-family:'DM Mono',monospace; font-size:0.6rem; letter-spacing:0.22em; cursor:pointer; border:none; background:transparent; border-right:1px solid ${t.accentBorder}; transition:color 0.2s; position:relative; }
    .sup-tab:hover { color:${t.text} !important; }
    .sup-tab.active { color:${t.text} !important; }
    .sup-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:${t.accent}; }

    .fade-1 { animation:fadeUp 0.8s 0.05s ease forwards; opacity:0; }
    .fade-2 { animation:fadeUp 0.8s 0.15s ease forwards; opacity:0; }
    .fade-3 { animation:fadeUp 0.8s 0.25s ease forwards; opacity:0; }
    .fade-4 { animation:fadeUp 0.8s 0.35s ease forwards; opacity:0; }
  `;

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (!tab.sectionKey) { window.scrollTo({ top:0, behavior:'smooth' }); mainRef.current?.scrollTo({ top:0, behavior:'smooth' }); return; }
    sectionRefs[tab.sectionKey]?.current?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  useEffect(() => {
    const handle = () => {
      const offset = 100;
      for (const key of ['contact','docs','faq']) {
        const el = sectionRefs[key]?.current;
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveTab(key === 'faq' ? 'FAQ' : key === 'docs' ? 'DOCS' : 'CONTACT');
          return;
        }
      }
      setActiveTab('SUPPORT');
    };
    window.addEventListener('scroll', handle, { passive:true });
    const c = mainRef.current;
    if (c) c.addEventListener('scroll', handle, { passive:true });
    return () => { window.removeEventListener('scroll', handle); if (c) c.removeEventListener('scroll', handle); };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipients = 'waleeddastagir1@gmail.com,asyedsameer31@gmail.com';
    const subject = encodeURIComponent(contactForm.subject);
    const body    = encodeURIComponent(contactForm.message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(recipients)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ subject:'', message:'' });
  };

  const SectionHeader = ({ title }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
      <div style={{ width:'3px', height:'18px', background:t.accent, borderRadius:'2px' }}/>
      <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.28em', color:t.textMuted }}>{title}</h2>
    </div>
  );

  const topbarContent = (
    <div style={{ display:'flex', height:'100%' }}>
      {TABS.map((tab) => (
        <button key={tab.label} className={`sup-tab${activeTab === tab.label ? ' active' : ''}`}
          onClick={() => handleTabClick(tab)}
          style={{ color: activeTab === tab.label ? t.text : t.textMuted }}>
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout topbarContent={topbarContent} returnPath="/dashboard">
      <style key={mode}>{css}</style>
      <div ref={mainRef}>
        <main style={{ padding:'40px 48px 0', display:'flex', flexDirection:'column', gap:'48px' }}>

          <div className="fade-1">
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.3em', color:t.textMuted, marginBottom:'8px' }}>// SUPPORT / HELP CENTER</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'2.2rem', color:t.text, letterSpacing:'0.06em', textTransform:'uppercase' }}>HOW CAN WE<br/>HELP YOU?</h1>
            <p style={{ marginTop:'10px', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.1em', color:t.textMuted, lineHeight:1.7 }}>
              FIND ANSWERS, READ DOCUMENTATION, OR REACH OUT TO THE TEAM.
            </p>
          </div>

          {/* FAQ */}
          <div ref={sectionRefs.faq} className="fade-2">
            <SectionHeader title="FREQUENTLY ASKED QUESTIONS" />
            <div style={{ border:`1px solid ${t.accentBorder}`, background:t.accentSofter }}>
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.15em', color: openFaq === i ? t.text : t.textMuted, textTransform:'uppercase', transition:'color 0.2s' }}>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={14} style={{ color:t.accent, flexShrink:0 }}/> : <ChevronDown size={14} style={{ color:t.textMuted, flexShrink:0 }}/>}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:'0 24px 20px 24px', paddingTop:'16px', fontFamily:"'Syne',sans-serif", fontSize:'0.85rem', color:t.textMuted, lineHeight:1.8, borderTop:`1px solid ${t.accentBorder}` }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DOCS */}
          <div ref={sectionRefs.docs} className="fade-3">
            <SectionHeader title="DOCUMENTATION" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px' }}>
              {docs.map(({ icon:Icon, title, desc }, i) => (
                <div key={i} className="doc-card">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ width:'32px', height:'32px', border:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:t.accentBg }}>
                      <Icon size={14} style={{ color:t.accent }}/>
                    </div>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:t.text, textTransform:'uppercase' }}>{title}</span>
                  </div>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.82rem', color:t.textMuted, lineHeight:1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div ref={sectionRefs.contact} className="fade-4">
            <SectionHeader title="CONTACT / REPORT" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { icon: Bug,           label: 'REPORT A BUG',   desc: 'Found something broken? Let us know.' },
                  { icon: MessageSquare, label: 'SUBMIT FEEDBACK', desc: 'Suggestions to improve ArguMind.' },
                  { icon: Mail,          label: 'CONTACT THE TEAM', desc: (
                    <div style={{ display:'flex', flexDirection:'column', gap:'3px', marginTop:'4px' }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:t.textMuted }}>waleeddastagir1@gmail.com</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', color:t.textMuted }}>asyedsameer31@gmail.com</span>
                    </div>
                  )},
                ].map(({ icon:Icon, label, desc }, i) => (
                  <button key={i} className="contact-btn">
                    <div style={{ width:'32px', height:'32px', border:`1px solid ${t.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:t.accentBg }}>
                      <Icon size={14} style={{ color:t.accent }}/>
                    </div>
                    <div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.15em', color:t.text, textTransform:'uppercase' }}>{label}</div>
                      <div style={{ marginTop:'3px' }}>{typeof desc === 'string' ? <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.78rem', color:t.textMuted }}>{desc}</span> : desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ border:`1px solid ${t.accentBorder}`, padding:'24px', background:t.accentSofter }}>
                {submitted ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'12px' }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.2em', color:t.accent }}>MESSAGE_TRANSMITTED</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.8rem', color:t.textMuted }}>The team will respond shortly.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom:'16px' }}>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:t.textMuted, marginBottom:'8px' }}>SUBJECT</div>
                      <input type="text" value={contactForm.subject} required
                        onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="[BRIEF_DESCRIPTION]"
                        style={{ width:'100%', background:'transparent', border:'none', borderBottom:`1px solid ${t.accentBorder}`, color:t.text, fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', padding:'8px 0', outline:'none', letterSpacing:'0.08em', caretColor:t.accent }}/>
                    </div>
                    <div style={{ marginBottom:'20px' }}>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.25em', color:t.textMuted, marginBottom:'8px' }}>MESSAGE</div>
                      <textarea value={contactForm.message} required rows={4}
                        onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="[DESCRIBE_YOUR_ISSUE_OR_FEEDBACK]"
                        style={{ width:'100%', background:'transparent', border:'none', borderBottom:`1px solid ${t.accentBorder}`, color:t.text, fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', padding:'8px 0', outline:'none', resize:'none', letterSpacing:'0.08em', caretColor:t.accent }}/>
                    </div>
                    <button type="submit" style={{ width:'100%', padding:'11px', background:'transparent', border:`1px solid ${t.accentBorder}`, color:t.accent, fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.accentBg; e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = t.accentBorder; e.currentTarget.style.color = t.accent; }}>
                      TRANSMIT_MESSAGE →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <footer style={{ marginTop:'24px', padding:'40px 0 32px', borderTop:`1px solid ${t.accentBorder}`, display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.2em', color:t.textMuted }}>Made with ❤️ by the ArguMind Team</span>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.70rem', letterSpacing:'0.2em', color:t.textFaint, textAlign:'center' }}>
              All rights reserved. ArguMind is a product of the ArguMind Team, © 2026.
            </div>
          </footer>

        </main>
      </div>
    </PageLayout>
  );
}