'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const modules = [
    {
      title: 'The Difficult Client',
      tagline: 'Requirements Engineering',
      desc: 'Interview an AI-driven "Client from Hell." Extract hidden constraints before writing a single line of code.',
      difficulty: 2,
      icon: '01',
      link: '/modules/difficult-client',
      color: 'var(--google-blue)',
      iconSymbol: '💬'
    },
    {
      title: 'The Code Crucible',
      tagline: 'Coding Challenges',
      desc: 'Implement solutions to real-world coding challenges. Write clean, correct code that passes all test cases.',
      difficulty: 3,
      icon: '02',
      link: '/modules/code-crucible',
      color: 'var(--google-yellow)',
      iconSymbol: '⚡'
    },
    {
      title: 'The Gatekeeper',
      tagline: 'Git & Team Collaboration',
      desc: 'A teammate secretly introduced a bug. Use git log, git blame, and git bisect to find and undo it.',
      difficulty: 5,
      icon: '03',
      link: '/modules/gatekeeper',
      color: 'var(--google-green)',
      iconSymbol: '🔍'
    },
    {
      title: 'The War Room',
      tagline: 'Incident Response & SRE',
      desc: 'A timed, high-pressure simulation mimicking a production server outage. Diagnose and fix in real-time.',
      difficulty: 4,
      icon: '04',
      link: '/modules/war-room',
      color: 'var(--google-red)',
      iconSymbol: '🚨'
    },
    {
      title: 'The Imposter',
      tagline: 'Technical Interviewing',
      desc: 'An AI-powered technical interview that dynamically adapts to your resume. Defend your code under pressure.',
      difficulty: 3,
      icon: '05',
      link: '/modules/imposter',
      color: 'var(--google-blue)',
      iconSymbol: '🎯'
    },
  ];

  const DifficultyDots = ({ level }: { level: number }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dot <= level ? 'var(--text-primary)' : 'var(--border)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section
        className="bg-mesh"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 'clamp(200px, 30vw, 400px)',
            height: 'clamp(200px, 30vw, 400px)',
            background: 'linear-gradient(135deg, rgba(26, 115, 232, 0.08), rgba(52, 168, 83, 0.05))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: 'clamp(150px, 25vw, 300px)',
            height: 'clamp(150px, 25vw, 300px)',
            background: 'linear-gradient(135deg, rgba(251, 188, 4, 0.06), rgba(234, 67, 53, 0.04))',
            borderRadius: '50%',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '900px',
            textAlign: 'center',
            zIndex: 1,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Badge */}
          <div
            className="badge badge-blue"
            style={{
              marginBottom: '32px',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <span style={{ width: '6px', height: '6px', background: 'var(--google-blue)', borderRadius: '50%' }} />
            CLINICAL ROTATIONS FOR ENGINEERS
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '24px',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            Real Skills.
            <br />
            <span style={{ color: 'var(--google-blue)' }}>Safe to Fail.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '600px',
              margin: '0 auto 48px',
              fontWeight: 400,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(25px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            Just as medical students do clinical rotations before treating patients,
            CodeResidency makes it safe to master production-level engineering skills.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            }}
          >
            <Link
              href="/login"
              className="btn btn-solid"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
              }}
            >
              Begin Residency
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="#modules"
              className="btn btn-outline"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
              }}
            >
              Explore Modules
            </a>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(32px, 6vw, 64px)',
              marginTop: '64px',
              flexWrap: 'wrap',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            }}
          >
            {[
              { value: '5', label: 'Simulation Modules' },
              { value: 'AI', label: 'Powered Feedback' },
              { value: '∞', label: 'Practice Attempts' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  fontWeight: 500,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: isLoaded ? 0.6 : 0,
            transition: 'opacity 0.8s ease 1s',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* Modules Section */}
      <section
        id="modules"
        style={{
          padding: 'clamp(64px, 10vw, 120px) 24px',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div
              className="badge"
              style={{
                background: 'rgba(52, 168, 83, 0.1)',
                color: 'var(--google-green)',
                marginBottom: '16px',
              }}
            >
              TRAINING MODULES
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '16px',
              }}
            >
              Master Real-World Scenarios
            </h2>
            <p
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              Five immersive simulations designed by senior engineers from top tech companies.
            </p>
          </div>

          {/* Module Grid */}
          <div
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {modules.map((m, idx) => (
              <Link
                key={m.title}
                href={m.link}
                className="card"
                style={{
                  padding: '32px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-card)',
                  animationDelay: `${idx * 0.08}s`,
                  cursor: 'pointer',
                }}
              >
                {/* Card Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}>
                  <div>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: m.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      MODULE {m.icon}
                    </span>
                    <p style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      fontWeight: 500,
                    }}>
                      {m.tagline}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    {m.iconSymbol}
                  </div>
                </div>

                {/* Card Title */}
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  lineHeight: 1.3,
                }}>
                  {m.title}
                </h3>

                {/* Card Description */}
                <p style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {m.desc}
                </p>

                {/* Card Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                    }}>
                      Difficulty
                    </span>
                    <DifficultyDots level={m.difficulty} />
                  </div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section
        style={{
          padding: 'clamp(80px, 12vw, 140px) 24px',
          background: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}
          >
            Ready for Day 1?
          </h2>
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '48px',
            }}
          >
            Free to use. No credit card required. Authenticate with your developer
            account and start hands-on simulation training today.
          </p>

          {/* Value Props */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '32px',
              marginBottom: '48px',
            }}
          >
            {[
              { icon: '✓', text: 'No credit card required' },
              { icon: '✓', text: 'Instant AI feedback' },
              { icon: '✓', text: 'Practice unlimited times' },
            ].map((prop, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(52, 168, 83, 0.1)',
                  color: 'var(--google-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {prop.icon}
                </div>
                <span style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}>
                  {prop.text}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="btn btn-solid"
            style={{
              padding: '16px 40px',
              fontSize: '1.05rem',
            }}
          >
            Start Your Residency
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '6px' }}>
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer
        style={{
          padding: '32px 24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <p style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}>
          © {new Date().getFullYear()} CodeResidency. Built for engineers who ship.
        </p>
      </footer>
    </div>
  );
}
