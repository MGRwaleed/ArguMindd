import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, BookOpen, Shield, BarChart2, Archive,
  Settings, HelpCircle, LogOut
} from 'lucide-react';
import authService from '../services/authService';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  
  * { box-sizing: border-box; }

  .nav-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    font-family: 'Space Mono', monospace;
    border-left: 2px solid transparent;
  }
  
  .nav-btn:hover {
    background: rgba(180, 83, 9, 0.1);
    border-left-color: #B45309;
  }
`;

const navItems = [
  { icon: BookOpen, label: 'COMMAND', sub: 'Dashboard', path: '/dashboard' },
  { icon: Archive, label: 'ARCHIVES', sub: 'History', path: '/debates/history' },
  { icon: BarChart2, label: 'SYSTEMS', sub: 'Analytics', path: '/analytics' },
  { icon: Shield, label: 'COUNCIL', sub: 'Leaderboard', path: '/leaderboard' },
];

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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#1F2937',
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
        zIndex: 0,
      }}/>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        width: sidebarOpen ? '240px' : '60px',
        minHeight: '100vh',
        flexShrink: 0,
        background: '#111827',
        borderRight: '1px solid #4B5563',
        transition: 'width 0.3s ease',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#B45309',
        }}/>

        <div style={{
          padding: '24px 16px',
          borderBottom: '1px solid #4B5563',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#B45309',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#E5E7EB',
            }}>
              AM
            </span>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#E5E7EB',
              }}>
                ARGUMIND
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                color: '#9CA3AF',
                marginTop: '2px',
              }}>
                Leaderboard
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(({ icon: Icon, label, sub, path }) => {
            const isActive = window.location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-btn"
                style={{
                  color: isActive ? '#E5E7EB' : '#9CA3AF',
                  borderLeftColor: isActive ? '#B45309' : 'transparent',
                  background: isActive ? 'rgba(180, 83, 9, 0.1)' : 'transparent',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }}/>
                {sidebarOpen && (
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.65rem',
                      color: '#9CA3AF',
                      marginTop: '2px',
                    }}>
                      {sub}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '12px 0', borderTop: '1px solid #4B5563' }}>
          {sidebarOpen && (
            <div style={{ padding: '12px 16px 16px' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                color: '#E5E7EB',
                fontWeight: 600,
              }}>
                {(user?.name || 'Operator').toUpperCase()}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                color: '#9CA3AF',
                marginTop: '4px',
              }}>
                {user?.email || ''}
              </div>
            </div>
          )}
          
          <button
            className="nav-btn"
            onClick={() => navigate('/settings')}
            style={{ color: '#9CA3AF' }}
          >
            <Settings size={14} style={{ flexShrink: 0 }}/>
            {sidebarOpen && (
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
              }}>
                Settings
              </span>
            )}
          </button>
          
          <button
            className="nav-btn"
            onClick={() => navigate('/support')}
            style={{ color: '#9CA3AF' }}
          >
            <HelpCircle size={14} style={{ flexShrink: 0 }}/>
            {sidebarOpen && (
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
              }}>
                Support
              </span>
            )}
          </button>
          
          <button
            className="nav-btn"
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => e.currentTarget.style.color = '#B45309'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
          >
            <LogOut size={14} style={{ flexShrink: 0 }}/>
            {sidebarOpen && (
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
              }}>
                Logout
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '28px',
            width: '24px',
            height: '24px',
            border: '1px solid #4B5563',
            background: '#1F2937',
            color: '#9CA3AF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            zIndex: 30,
          }}
        >
          <ChevronLeft
            size={12}
            style={{
              transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)',
              transition: 'transform 0.3s',
            }}
          />
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Top bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111827',
          borderBottom: '1px solid #4B5563',
          height: '60px',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #B45309, transparent)',
          }}/>
          
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              color: '#E5E7EB',
              fontWeight: 600,
              paddingBottom: '2px',
              borderBottom: '2px solid #B45309',
            }}>
              Leaderboard
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              color: '#9CA3AF',
            }}>
              Future Scope
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #4B5563',
              borderRadius: '4px',
              color: '#9CA3AF',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#B45309';
              e.currentTarget.style.color = '#E5E7EB';
              e.currentTarget.style.background = 'rgba(180, 83, 9, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#4B5563';
              e.currentTarget.style.color = '#9CA3AF';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Return to Dashboard
          </button>
        </header>

        {/* Main content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 48px',
          gap: '60px',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: '#9CA3AF',
              marginBottom: '16px',
            }}>
              Module Status: Access Restricted
            </div>
            
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '2.5rem',
              color: '#E5E7EB',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}>
              Council Chamber<br/>Locked
            </h1>
            
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.95rem',
              letterSpacing: '0.03em',
              color: '#9CA3AF',
              lineHeight: 1.8,
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              The global leaderboard is currently restricted.<br/>
              Operator rankings and ELO scoring will be<br/>
              unlocked in the next protocol update.
            </p>
          </div>

          {/* Ghost leaderboard */}
          <div style={{ width: '100%', maxWidth: '700px' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.79rem',
              letterSpacing: '0.1em',
              color: '#4B5563',
              marginBottom: '16px',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}>
              Preview — Data Locked
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 100px 80px 100px',
              gap: '16px',
              padding: '12px 20px',
              borderBottom: '1px solid #4B5563',
              background: '#111827',
            }}>
              {['Rank', 'Operator', 'ELO', 'Wins', 'Ratio'].map(h => (
                <span
                  key={h}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Ghost rows */}
            <div style={{
              border: '1px solid #4B5563',
              borderTop: 'none',
              filter: 'blur(2px)',
              userSelect: 'none',
              pointerEvents: 'none',
              background: 'rgba(17, 24, 39, 0.5)',
            }}>
              {ghostRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px 80px 100px',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: i < ghostRows.length - 1 ? '1px solid #4B5563' : 'none',
                  }}
                >
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#4B5563',
                  }}>
                    {row.rank}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#4B5563',
                    letterSpacing: '0.05em',
                  }}>
                    {row.name}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#4B5563',
                  }}>
                    {row.elo}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#4B5563',
                  }}>
                    {row.wins}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#4B5563',
                  }}>
                    {row.ratio}
                  </span>
                </div>
              ))}
            </div>

            {/* Lock overlay */}
            <div style={{
              marginTop: '16px',
              padding: '14px',
              border: '1px solid #4B5563',
              background: 'rgba(75, 85, 99, 0.1)',
              textAlign: 'center',
              borderRadius: '4px',
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: '#9CA3AF',
              }}>
                🔒 Rankings Sealed · Clearance Level Insufficient
              </span>
            </div>
          </div>

          {/* Planned features */}
          <div style={{ width: '100%', maxWidth: '700px' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.79rem',
              letterSpacing: '0.1em',
              color: '#B45309',
              marginBottom: '24px',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}>
              Planned Capabilities
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              {plannedFeatures.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    border: '1px solid #4B5563',
                    background: 'rgba(75, 85, 99, 0.1)',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#B45309',
                    flexShrink: 0,
                  }}/>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    letterSpacing: '0.03em',
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated deployment */}
          <div style={{
            textAlign: 'center',
            paddingTop: '40px',
            borderTop: '1px solid #4B5563',
            maxWidth: '600px',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: '#9CA3AF',
            }}>
              Estimated Deployment: P3 2026 · ArguMind v3.0
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}