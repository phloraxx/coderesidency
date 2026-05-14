'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function GatekeeperPage() {
    return (
        <div className="coming-soon-page">
            <Navbar showBack backHref="/dashboard" backLabel="Dashboard" />

            <div className="coming-soon-content">
                <div className="coming-soon-card animate-fade-in-scale">
                    <div 
                        className="coming-soon-icon"
                        style={{ 
                            background: 'linear-gradient(135deg, var(--google-yellow-light), #fef7e0)'
                        }}
                    >
                        🔐
                    </div>
                    <h1 className="coming-soon-title">The Gatekeeper</h1>
                    <span 
                        className="coming-soon-badge"
                        style={{ 
                            background: 'var(--google-yellow-light)', 
                            color: 'var(--google-yellow)' 
                        }}
                    >
                        Coming Soon — Phase 2
                    </span>
                    <p className="coming-soon-description">
                        A teammate secretly introduced a bug. Use <code style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em'
                        }}>git log</code>, <code style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em'
                        }}>git blame</code>, and <code style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em'
                        }}>git bisect</code> to find and undo it — without breaking the repository.
                    </p>
                    <Link href="/dashboard" className="btn btn-outline" style={{ marginTop: 'var(--space-sm)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="page-footer">
                <div className="page-footer-inner">
                    <div className="footer-brand">
                        <div className="footer-brand-squares">
                            <span style={{ background: 'var(--google-blue)' }} />
                            <span style={{ background: 'var(--google-red)' }} />
                            <span style={{ background: 'var(--google-yellow)' }} />
                            <span style={{ background: 'var(--google-green)' }} />
                        </div>
                        <span>CodeResidency</span>
                    </div>
                    <div className="footer-credit">
                        MuLearn SCET • Built with Next.js
                    </div>
                </div>
            </footer>
        </div>
    );
}
