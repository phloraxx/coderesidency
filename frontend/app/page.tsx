'use client';

import Link from 'next/link';
import { loginWithGitHub, loginWithGoogle } from '@/lib/appwrite';

export default function LandingPage() {
  const modules = [
    {
      title: 'The Difficult Client',
      tagline: 'Requirements Engineering',
      desc: 'Interview an AI-driven "Client from Hell." Extract hidden constraints before writing a single line of code.',
      difficulty: 2,
      icon: '01',
      link: '/modules/difficult-client',
    },
    {
      title: 'The War Room',
      tagline: 'Incident Response & SRE',
      desc: 'A timed, high-pressure simulation mimicking a production server outage. Diagnose and fix the memory leak or disk full error.',
      difficulty: 4,
      icon: '02',
      link: '/modules/war-room',
    },
    {
      title: 'The Gatekeeper',
      tagline: 'Technical Interviewing',
      desc: 'An AI-powered technical interview that dynamically adapts to your actual resume claims. Defend your code under pressure.',
      difficulty: 3,
      icon: '03',
      link: '/modules/gatekeeper',
    },
    {
      title: 'The Imposter',
      tagline: 'Git & Team Collaboration',
      desc: 'Simulates a 4-person dev team where an "Imposter AI" introduces bugs. Use git blame and bisect to find the faulty commit.',
      difficulty: 4,
      icon: '04',
      link: '/modules/imposter',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── NAV ──────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px',
        background: 'rgba(253, 253, 253, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, background: 'var(--text-primary)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
            CodeResidency
          </span>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="#modules" className="link-hover mono" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Modules</a>
          <Link href="/login" className="btn btn-solid" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
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
      }}>
        {/* Minimalist Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          zIndex: -1
        }} />

        <div style={{ position: 'relative', maxWidth: 1100 }}>
          <div className="badge animate-fade-up" style={{ marginBottom: 40 }}>
            Clinical Rotation for Software Engineers
          </div>

          <h1 className="animate-fade-up delay-1" style={{
            fontSize: 'clamp(3.5rem, 9vw, 8rem)',
            fontWeight: 500,
            letterSpacing: '-0.06em',
            lineHeight: 0.9,
            marginBottom: 32,
            textTransform: 'uppercase'
          }}>
            Real Skills.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Safe to Fail.</span>
          </h1>

          <p className="animate-fade-up delay-2" style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'var(--text-secondary)',
            maxWidth: 680, margin: '0 auto 56px',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Just as medical students do clinical rotations before treating real patients,
            CodeResidency gives CS students a safe environment to practice the skills that
            actually matter on Day 1 of the job.
          </p>

          <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-solid">
              Begin Residency
            </Link>
            <a href="#modules" className="btn btn-outline">
              Explore Modules
            </a>
          </div>

          {/* Stats - Brutalist/Editorial */}
          <div className="animate-fade-up delay-3" style={{
            display: 'flex', gap: '6vw', justifyContent: 'center', marginTop: 140,
            flexWrap: 'wrap', borderTop: '1px solid var(--text-primary)', paddingTop: 48
          }}>
            {[
              { val: '4', label: 'Simulations' },
              { val: '73%', label: 'Day-1 Readiness' },
              { val: '15m', label: 'Avg Incident Fix' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'left', minWidth: 140 }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1 }}>{s.val}</div>
                <div className="mono" style={{ color: 'var(--text-secondary)', marginTop: 12, textTransform: 'uppercase', fontSize: '0.8rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ──────────────────────── */}
      <section id="modules" style={{ padding: '140px 24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: 24, lineHeight: 1, textTransform: 'uppercase' }}>
              Four Modules.<br/>Real Crises.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              Each scenario is powered by AI and based on situations engineers face every day in production.
            </p>
          </div>
          <div className="mono" style={{ color: 'var(--text-muted)', paddingBottom: 8 }}>
            [ SELECT A MODULE TO PREVIEW ]
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {modules.map((m, i) => (
            <Link
              key={m.title}
              href={m.link}
              className="card animate-fade-up"
              style={{
                animationDelay: `${i * 0.1}s`,
                display: 'flex', flexDirection: 'column',
                textDecoration: 'none', color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                <span className="mono" style={{ fontSize: '2rem', color: 'var(--text-muted)', lineHeight: 1 }}>{m.icon}</span>
                <span className="badge">{m.tagline}</span>
              </div>

              <h3 style={{ fontSize: '1.8rem', marginBottom: 16 }}>{m.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 48 }}>
                {m.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div
                      key={j}
                      style={{
                        width: 8, height: 8,
                        background: j < m.difficulty ? 'var(--text-primary)' : 'transparent',
                        border: '1px solid var(--text-primary)'
                      }}
                    />
                  ))}
                  <span className="mono" style={{ color: 'var(--text-primary)', marginLeft: 12, fontSize: '0.75rem' }}>
                    DIFFICULTY
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section style={{
        padding: '140px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.2,
          backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border-hover) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          zIndex: 0
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: 32, lineHeight: 1, textTransform: 'uppercase' }}>
            Ready for Day 1?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 56, fontSize: '1.2rem', maxWidth: 540, margin: '0 auto 56px' }}>
            Free to use. No credit card required. Authenticate with your developer account and start debugging.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={loginWithGitHub} className="btn btn-solid" style={{ minWidth: 220 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 12 }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
            <button onClick={loginWithGoogle} className="btn btn-outline" style={{ minWidth: 220 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────── */}
      <footer style={{
        padding: '48px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 12, height: 12, background: 'var(--text-primary)' }} />
          <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            CODERESIDENCY © 2026
          </span>
        </div>
        <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          MULEARN SCET · BUILT WITH NEXT.JS & GEMINI
        </div>
      </footer>
    </div>
  );
}
