'use client';

import { loginWithGitHub, loginWithGoogle } from '@/lib/appwrite';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';

function LoginContent() {
    const params = useSearchParams();
    const error = params?.get('error');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isGitHubLoading, setIsGitHubLoading] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await loginWithGoogle();
        } catch {
            setIsGoogleLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setIsGitHubLoading(true);
        try {
            await loginWithGitHub();
        } catch {
            setIsGitHubLoading(false);
        }
    };

    const features = [
        { icon: '🎯', title: '5 Modules', desc: 'Real-world scenarios' },
        { icon: '🤖', title: 'AI Feedback', desc: 'Instant analysis' },
        { icon: '♾️', title: 'Unlimited', desc: 'Practice attempts' },
        { icon: '🔒', title: 'Safe Space', desc: 'Fail without fear' },
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'var(--text-primary)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorations */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '50%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(26, 115, 232, 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '50%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(52, 168, 83, 0.1) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Left Panel - Features (hidden on mobile) */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '64px',
                    position: 'relative',
                    zIndex: 1,
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateX(0)' : 'translateX(-30px)',
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                }}
                className="hidden-mobile"
            >
                <div style={{ maxWidth: '400px' }}>
                    <div
                        style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.75rem',
                            color: 'var(--google-blue)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            marginBottom: '24px',
                            fontWeight: 600,
                        }}
                    >
                        Why CodeResidency?
                    </div>
                    
                    <h2
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                            fontWeight: 700,
                            color: 'var(--bg-primary)',
                            lineHeight: 1.2,
                            marginBottom: '16px',
                        }}
                    >
                        Train like a surgeon.
                        <br />
                        <span style={{ color: 'var(--text-muted)' }}>Ship like an engineer.</span>
                    </h2>
                    
                    <p
                        style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.7,
                            marginBottom: '48px',
                        }}
                    >
                        Master production-level skills through AI-powered simulations
                        in a safe, risk-free environment.
                    </p>

                    {/* Feature Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '24px',
                        }}
                    >
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                style={{
                                    opacity: isLoaded ? 1 : 0,
                                    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                                    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + i * 0.1}s`,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '8px',
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'Outfit, sans-serif',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'var(--bg-primary)',
                                        marginBottom: '4px',
                                    }}
                                >
                                    {feature.title}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    {feature.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Card */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
                        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
                    }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            textDecoration: 'none',
                            marginBottom: '32px',
                        }}
                    >
                        <h1
                            style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                fontWeight: 800,
                                color: 'var(--bg-primary)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Code<span style={{ color: 'var(--google-blue)' }}>Residency</span>
                        </h1>
                    </Link>

                    {/* Auth Card */}
                    <div
                        className="card"
                        style={{
                            padding: 'clamp(32px, 6vw, 48px)',
                            background: '#ffffff',
                            borderRadius: 'var(--radius-xl)',
                            border: 'none',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        }}
                    >
                        {/* Card Header */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2
                                style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    marginBottom: '8px',
                                }}
                            >
                                Start Your Residency
                            </h2>
                            <p
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Sign in with your developer account
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div
                                className="animate-fade-in"
                                style={{
                                    background: 'rgba(234, 67, 53, 0.08)',
                                    border: '1px solid rgba(234, 67, 53, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '14px 16px',
                                    marginBottom: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    animation: 'shake 0.5s ease-in-out',
                                }}
                            >
                                <div
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'var(--google-red)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M6 3v3M6 8h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <span
                                    style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '0.9rem',
                                        color: 'var(--google-red)',
                                        fontWeight: 500,
                                    }}
                                >
                                    Authentication failed. Please try again.
                                </span>
                            </div>
                        )}

                        {/* OAuth Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading || isGitHubLoading}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    background: 'var(--google-blue)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: isGoogleLoading || isGitHubLoading ? 'not-allowed' : 'pointer',
                                    opacity: isGitHubLoading ? 0.6 : 1,
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                }}
                            >
                                {isGoogleLoading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleGitHubLogin}
                                disabled={isGoogleLoading || isGitHubLoading}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: isGoogleLoading || isGitHubLoading ? 'not-allowed' : 'pointer',
                                    opacity: isGoogleLoading ? 0.6 : 1,
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                }}
                            >
                                {isGitHubLoading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                        </svg>
                                        Continue with GitHub
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                margin: '28px 0',
                            }}
                        >
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                Secure Authentication
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>

                        {/* Security badges */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '16px',
                                marginBottom: '24px',
                            }}
                        >
                            {['OAuth 2.0', 'Encrypted', 'No passwords'].map((badge, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        background: 'var(--bg-secondary)',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-pill)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>

                        {/* Terms */}
                        <p
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                lineHeight: 1.6,
                            }}
                        >
                            By signing in, you agree to use your account data for
                            educational simulations only. No real code is deployed.
                        </p>
                    </div>

                    {/* Back to home link */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Link
                            href="/"
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'color 0.3s ease',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS for shake animation and mobile styles */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                @media (max-width: 900px) {
                    .hidden-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--text-primary)',
            }}>
                <div className="spinner" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
