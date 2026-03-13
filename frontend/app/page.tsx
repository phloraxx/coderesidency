'use client';

import Link from 'next/link';
import { loginWithGitHub, loginWithGoogle } from '@/lib/appwrite';

export default function LandingPage() {
  const modules = [
    {
      icon: '💬',
      title: 'The Difficult Client',
      tagline: 'Requirements Engineering',
      desc: 'Interview a frustrating, non-technical client. Extract hidden constraints before writing a single line of code.',
      color: '#6366f1',
      difficulty: 2,
    },
    {
      icon: '🔥',
      title: 'The War Room',
      tagline: 'Incident Response',
      desc: 'Your production server just crashed. Fix it in 15 minutes while the CTO sends you angry messages.',
      color: '#ef4444',
      difficulty: 4,
    },
    {
      icon: '🎯',
      title: 'The Gatekeeper',
      tagline: 'Technical Interview',
      desc: 'Upload your resume. Our AI will grill you on everything you claimed to know.',
      color: '#10b981',
      difficulty: 3,
    },
    {
      icon: '🕵️',
      title: 'The Imposter',
      tagline: 'Git Forensics',
      desc: 'A teammate secretly introduced a bug. Use git log, blame, and bisect to find and fix it.',
      color: '#f59e0b',
      difficulty: 5,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── NAV ──────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>⚕️</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Code<span style={{ color: 'var(--accent-blue)' }}>Residency</span>
          </span>
        </div>
        <Link href="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
          Start Training →
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse at top, #1a1a3e 0%, var(--bg-primary) 65%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="animate-fade-in" style={{ position: 'relative' }}>
          <div className="badge badge-purple" style={{ marginBottom: 24, fontSize: '0.8rem' }}>
            🏥 Clinical Rotation for Engineers
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 24,
          }}>
            Real Engineering Skills.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Safe to Fail.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: 680, margin: '0 auto 48px',
            lineHeight: 1.7,
          }}>
            Just as medical students do clinical rotations before treating real patients,
            CodeResidency gives CS students a safe environment to practice the skills that
            actually matter on Day 1 of the job.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Begin Your Residency →
            </Link>
            <a href="#modules" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              See the Modules
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 48, justifyContent: 'center', marginTop: 72,
            padding: '32px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
            flexWrap: 'wrap',
          }}>
            {[
              { val: '4', label: 'Simulation Modules' },
              { val: '73%', label: 'Improvement in Day-1 Readiness' },
              { val: '15min', label: 'Average Incident Resolution' },
              { val: 'AI', label: 'Powered Evaluation' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ──────────────────────── */}
      <section id="modules" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 16 }}>
            Four Modules. Four Real-World Crises.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Each scenario is powered by AI and based on situations engineers face every day.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {modules.map((m, i) => (
            <div
              key={m.title}
              className="card animate-fade-in"
              style={{
                animationDelay: `${i * 0.1}s`,
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                borderTop: `2px solid ${m.color}`,
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 80,
                background: `radial-gradient(ellipse at top, ${m.color}20, transparent)`,
              }} />
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{m.icon}</div>
              <div className={`badge badge-blue`} style={{ marginBottom: 12, color: m.color, background: `${m.color}20` }}>
                {m.tagline}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>{m.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
                {m.desc}
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 20, height: 4, borderRadius: 2,
                      background: j < m.difficulty ? m.color : 'var(--border)',
                    }}
                  />
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                  Difficulty
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.05) 50%, transparent)',
      }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 16 }}>
          Ready to start your residency?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: '1.05rem' }}>
          Free to use. No credit card required. Just your GitHub or Google account.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={loginWithGitHub} className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
          <button onClick={loginWithGoogle} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────── */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '0.8rem',
      }}>
        <p>CodeResidency — MuLearn SCET · Built with Next.js, FastAPI & Google Gemini</p>
      </footer>
    </div>
  );
}
