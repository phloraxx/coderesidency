'use client';

import Link from 'next/link';
import { loginWithGitHub, loginWithGoogle } from '@/lib/appwrite';
import MarqueeText from '@/components/MarqueeText';

export default function LandingPage() {
  const modules = [
    {
      title: 'The Difficult Client',
      tagline: 'Requirements Engineering',
      desc: 'Interview an AI-driven "Client from Hell." Extract hidden constraints before writing a single line of code.',
      difficulty: 2,
      icon: '01',
      link: '/modules/difficult-client',
      color: 'var(--google-blue)'
    },
    {
      title: 'The War Room',
      tagline: 'Incident Response & SRE',
      desc: 'A timed, high-pressure simulation mimicking a production server outage. Diagnose and fix the memory leak or disk full error.',
      difficulty: 4,
      icon: '02',
      link: '/modules/war-room',
      color: 'var(--google-red)'
    },
    {
      title: 'The Gatekeeper',
      tagline: 'Technical Interviewing',
      desc: 'An AI-powered technical interview that dynamically adapts to your actual resume claims. Defend your code under pressure.',
      difficulty: 3,
      icon: '03',
      link: '/modules/gatekeeper',
      color: 'var(--google-yellow)'
    },
    {
      title: 'The Imposter',
      tagline: 'Git & Team Collaboration',
      desc: 'Simulates a 4-person dev team where an "Imposter AI" introduces bugs. Use git blame and bisect to find the faulty commit.',
      difficulty: 4,
      icon: '04',
      link: '/modules/imposter',
      color: 'var(--google-green)'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── NAV ──────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '2px solid var(--text-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 16, height: 16, background: 'var(--google-blue)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CodeResidency
          </span>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="#modules" className="link-hover mono" style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Modules</a>
          <Link href="/login" className="btn btn-solid" style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Start Training
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '160px 24px 80px',
        position: 'relative', overflow: 'hidden',
        background: '#ffffff'
      }}>
        {/* Background Marquees */}
        <div style={{ position: 'absolute', top: '15%', left: 0, width: '100%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(-2deg) scale(1.1)', color: 'var(--google-blue)' }}>
          <MarqueeText text="CLINICAL ROTATIONS FOR ENGINEERS -" speed={120} className="title-massive" />
        </div>
        <div style={{ position: 'absolute', top: '45%', left: 0, width: '100%', opacity: 0.03, pointerEvents: 'none', transform: 'rotate(2deg) scale(1.1)', color: 'var(--google-blue)' }}>
          <MarqueeText text="DEBUGGING PRODUCTION SYSTEMS -" speed={150} direction="right" className="title-massive" />
        </div>
        <div style={{ position: 'absolute', top: '75%', left: 0, width: '100%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(-1deg) scale(1.1)', color: 'var(--google-blue)' }}>
          <MarqueeText text="INCIDENT RESPONSE SIMULATION -" speed={135} className="title-massive" />
        </div>

        <div style={{ position: 'relative', maxWidth: 1200, zIndex: 10 }}>
          <div className="badge animate-fade-up animate-float" style={{ marginBottom: 40, background: 'transparent', border: '2px solid var(--text-primary)', color: 'var(--text-primary)', padding: '6px 16px', fontWeight: 700 }}>
            CLINICAL ROTATIONS
          </div>

          <h1 className="title-massive animate-fade-up delay-1" style={{ marginBottom: 24 }}>
            Real <span style={{ color: 'transparent', WebkitTextStroke: '3px var(--text-primary)' }}>Skills.</span><br />
            Safe to <span style={{ color: 'var(--google-blue)' }}>Fail.</span>
          </h1>

          <p className="animate-fade-up delay-2" style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: 720, margin: '0 auto 48px',
            lineHeight: 1.6,
            fontWeight: 500,
            fontFamily: 'Outfit, sans-serif'
          }}>
            Just as medical students do clinical rotations before treating real patients,
            CodeResidency gives CS students a safe environment to practice the skills that
            actually matter on Day 1 of the job.
          </p>

          <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-solid" style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Begin Residency
            </Link>
            <a href="#modules" className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '0', textTransform: 'uppercase', letterSpacing: '0.05em', border: '2px solid var(--text-primary)', color: 'var(--text-primary)' }}>
              Explore Modules
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-3" style={{
            display: 'flex', gap: '8vw', justifyContent: 'center', marginTop: 120,
            flexWrap: 'wrap', paddingTop: 64, borderTop: '2px dashed var(--border)'
          }}>
            {[
              { val: '4', label: 'Simulations', color: 'var(--google-blue)' },
              { val: '73%', label: 'Day-1 Readiness', color: 'var(--google-red)' },
              { val: '15m', label: 'Avg Incident Fix', color: 'var(--google-green)' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', minWidth: 140 }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                <div className="ticket-label" style={{ color: 'var(--text-secondary)', marginTop: 16 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Divider */}
      <div style={{ background: 'var(--google-blue)', color: '#fff', padding: '24px 0', borderTop: '2px solid var(--text-primary)', borderBottom: '2px solid var(--text-primary)' }}>
        <MarqueeText text="THE WAR ROOM ✽ THE GATEKEEPER ✽ THE IMPOSTER ✽ THE DIFFICULT CLIENT ✽ " speed={60} className="title-section" />
      </div>

      {/* ── MODULES ──────────────────────── */}
      <section id="modules" style={{ padding: '140px 24px', maxWidth: 1400, margin: '0 auto', width: '100%', background: 'var(--bg-secondary)' }}>
        <div style={{ marginBottom: 80, textAlign: 'center' }}>
          <h2 className="title-section" style={{ marginBottom: 24, color: 'var(--text-primary)' }}>
            Four <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--text-primary)' }}>Modules.</span><br />Real Crises.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: 640, margin: '0 auto', fontWeight: 500 }}>
            Each scenario is powered by AI and based on situations engineers face every day in production. No multiple choice.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40 }}>
          {modules.map((m, i) => (
            <Link
              key={m.title}
              href={m.link}
              className="ticket-card animate-fade-up"
              style={{
                animationDelay: `${i * 0.1}s`,
                textDecoration: 'none', color: 'inherit',
              }}
            >
              {/* Event Ticket Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '2px dashed var(--border-hover)', paddingBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="ticket-label" style={{ color: m.color }}>MODULE {m.icon}</span>
                  <span className="ticket-label" style={{ color: 'var(--text-muted)' }}>{m.tagline}</span>
                </div>
                <div style={{
                  width: 64, height: 64, borderRadius: '0',
                  background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800,
                  color: '#fff',
                  transform: 'rotate(10deg)'
                }}>
                  {m.icon}
                </div>
              </div>

              <h3 style={{ fontSize: '2rem', marginBottom: 16, fontWeight: 800, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.title}</h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 40, fontWeight: 500 }}>
                {m.desc}
              </p>

              {/* Event Ticket Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '16px 20px', border: '1px solid var(--border)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: j < m.difficulty ? m.color : 'var(--border)',
                      }}
                    />
                  ))}
                  <span className="ticket-label" style={{ marginLeft: 12 }}>
                    DIFFICULTY
                  </span>
                </div>
                <div style={{ width: 16, height: 16, borderRight: '2px solid var(--text-primary)', borderTop: '2px solid var(--text-primary)', transform: 'rotate(45deg)' }}></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section style={{
        padding: '160px 24px', textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--text-primary)',
        color: 'var(--bg-primary)'
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', opacity: 0.07, pointerEvents: 'none', transform: 'translateY(-50%) scale(1.5)', color: 'var(--google-blue)' }}>
          <MarqueeText text="AUTHENTICATE ✽ AUTHORIZE ✽ " speed={90} className="title-massive" />
        </div>
        
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 className="title-section" style={{ marginBottom: 32 }}>
            Ready for Day 1?
          </h2>
          <p style={{ color: 'var(--border)', marginBottom: 56, fontSize: '1.2rem', maxWidth: 600, margin: '0 auto 56px', fontWeight: 400 }}>
            Free to use. No credit card required. Authenticate with your developer account and start debugging.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={loginWithGitHub} className="btn btn-outline" style={{ minWidth: 240, padding: '16px 32px', borderRadius: '0', background: '#fff', color: '#000', border: 'none', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 12 }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Sign In with GitHub
            </button>
            <button onClick={loginWithGoogle} className="btn btn-solid" style={{ minWidth: 240, padding: '16px 32px', borderRadius: '0', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign In with Google
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────── */}
      <footer style={{
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
        background: '#000',
        color: '#fff',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CodeResidency
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
          MULEARN SCET // BUILT WITH NEXT.JS
        </div>
      </footer>
    </div>
  );
}
