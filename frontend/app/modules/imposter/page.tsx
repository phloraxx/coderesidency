'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ImposterPage() {
    return (
        <div className="coming-soon-page">
            <Navbar showBack backHref="/dashboard" backLabel="Dashboard" />

            <div className="coming-soon-content">
                <div className="coming-soon-card animate-fade-in-scale">
                    <div 
                        className="coming-soon-icon"
                        style={{ 
                            background: 'linear-gradient(135deg, var(--google-green-light), #e6f4ea)'
                        }}
                    >
                        🎯
                    </div>
                    <h1 className="coming-soon-title">The Imposter</h1>
                    <span 
                        className="coming-soon-badge"
                        style={{ 
                            background: 'var(--google-green-light)', 
                            color: 'var(--google-green)' 
                        }}
                    >
                        Coming Soon — Phase 2
                    </span>
                    <p className="coming-soon-description">
                        Upload your resume and face an AI interviewer who&apos;s read every line. 
                        Behavioral + technical questions, live coding, and lie detection coming in Phase 2.
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
