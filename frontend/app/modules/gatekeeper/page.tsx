'use client';
import Link from 'next/link';

export default function GatekeeperPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: '4rem' }}>🎯</div>
            <h1 style={{ fontSize: '2rem' }}>The Gatekeeper</h1>
            <div className="badge badge-green">Coming Soon — Phase 2</div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400 }}>
                Upload your resume and face an AI interviewer who&apos;s read every line. Behavioral + technical questions,
                live coding, and lie detection coming in Phase 2.
            </p>
            <Link href="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>
    );
}
