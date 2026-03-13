'use client';
import Link from 'next/link';

export default function ImposterPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: '4rem' }}>🕵️</div>
            <h1 style={{ fontSize: '2rem' }}>The Imposter</h1>
            <div className="badge badge-purple">Coming Soon — Phase 2</div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400 }}>
                A teammate secretly introduced a bug. Use <code>git log</code>, <code>git blame</code>, and{' '}
                <code>git bisect</code> to find and undo it — without breaking the repository.
            </p>
            <Link href="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>
    );
}
