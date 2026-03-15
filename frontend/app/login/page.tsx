'use client';

import { loginWithGitHub, loginWithGoogle } from '@/lib/appwrite';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const params = useSearchParams();
    const error = params?.get('error');

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #1a1a3e 0%, var(--bg-primary) 70%)',
            padding: '24px',
        }}>
            <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 8 }}>⚕️</div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                            Code<span style={{ color: 'var(--accent-blue)' }}>Residency</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                            The Clinical Rotation for Engineers
                        </p>
                    </Link>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: 36 }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.3rem' }}>
                        Start Your Residency
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>
                        Sign in to access all simulation modules
                    </p>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24,
                            color: '#f87171', fontSize: '0.85rem', textAlign: 'center',
                        }}>
                            Authentication failed. Please try again.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button
                            onClick={loginWithGitHub}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </button>

                        <button
                            onClick={loginWithGoogle}
                            className="btn btn-solid"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 24, lineHeight: 1.6 }}>
                        By signing in, you agree to use your account data for educational
                        simulations only. No real code is deployed.
                    </p>
                </div>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                    {['Free to use — no credit card required', '4 AI-powered simulation modules', 'Instant AI feedback and scoring'].map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--accent-green)' }}>✓</span> {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
