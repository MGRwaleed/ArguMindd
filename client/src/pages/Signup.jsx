import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .arguemind-input {
    width: 100%;
    background: #1F2937 !important;
    border: 1px solid #4B5563 !important;
    color: #E5E7EB !important;
    -webkit-text-fill-color: #E5E7EB !important;
    caret-color: #B45309 !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 0.875rem !important;
    letter-spacing: 0.05em !important;
    padding: 12px 16px !important;
    outline: none !important;
    transition: border-color 0.2s, background-color 0.2s !important;
    border-radius: 4px !important;
  }
  
  .arguemind-input::placeholder {
    color: #9CA3AF !important;
    -webkit-text-fill-color: #9CA3AF !important;
    font-size: 0.8rem !important;
    letter-spacing: 0.1em !important;
  }
  
  .arguemind-input:focus {
    border-color: #B45309 !important;
    background: #374151 !important;
  }
  
  .arguemind-input:-webkit-autofill,
  .arguemind-input:-webkit-autofill:hover,
  .arguemind-input:-webkit-autofill:focus {
    -webkit-text-fill-color: #E5E7EB !important;
    -webkit-box-shadow: 0 0 0px 1000px #1F2937 inset !important;
    transition: background-color 5000s ease-in-out 0s !important;
  }
`;

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative',
    }}>
      <style>{styles}</style>

      {/* Background pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(#4B5563 1px, transparent 1px),
          linear-gradient(90deg, #4B5563 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        opacity: 0.03,
        pointerEvents: 'none',
      }}/>

      {/* Top navigation bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #4B5563',
        background: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#E5E7EB',
        }}>
          ARGUMIND
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          color: '#9CA3AF',
        }}>
          Registration Portal
        </div>
      </div>

      {/* Split layout container */}
      <div style={{
        display: 'flex',
        width: '100%',
        paddingTop: '80px',
        position: 'relative',
        zIndex: 5,
      }}>

        {/* LEFT PANEL - Hero Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 60px 80px 100px',
          borderRight: '1px solid #4B5563',
        }}>
          <div style={{
            width: '80px',
            height: '4px',
            background: '#B45309',
            marginBottom: '32px',
          }}/>
          
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '3.5rem',
            color: '#E5E7EB',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: '28px',
          }}>
            Join the<br />Arena
          </h1>
          
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.95rem',
            letterSpacing: '0.05em',
            color: '#9CA3AF',
            lineHeight: 1.8,
            maxWidth: '420px',
          }}>
            Submit your arguments. Let AI judge decide.<br />
            Fair analysis. Unbiased verdicts.
          </p>

          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: 'rgba(75, 85, 99, 0.2)',
            border: '1px solid #4B5563',
            borderRadius: '4px',
            maxWidth: '400px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: '#B45309',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}>
              Platform Features
            </div>
            {[
              'Real-time fact verification',
              'AI-powered claim analysis',
              'Performance tracking',
              'Debate history archive',
            ].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#B45309',
                  borderRadius: '50%',
                }}/>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.85rem',
                  color: '#9CA3AF',
                  letterSpacing: '0.03em',
                }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Form Section */}
        <div style={{
          width: '520px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 100px 80px 60px',
        }}>

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '12px 16px',
              background: 'rgba(180, 83, 9, 0.1)',
              border: '1px solid rgba(180, 83, 9, 0.3)',
              borderRadius: '4px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              color: '#B45309',
              textAlign: 'center',
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="arguemind-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="arguemind-input"
                placeholder="your.email@gmail.com"
                pattern="[a-zA-Z0-9._%+\-]+@gmail\.com"
                title="Only Gmail addresses are accepted"
                required
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                className="arguemind-input"
                placeholder="Create a strong password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#B45309',
                border: 'none',
                borderRadius: '4px',
                color: '#E5E7EB',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(180, 83, 9, 0.4)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#B45309';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
                color: '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = '#B45309'}
              onMouseLeave={e => e.target.style.color = '#9CA3AF'}
            >
              Already have an account? <span style={{ color: '#B45309', fontWeight: 600 }}>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}