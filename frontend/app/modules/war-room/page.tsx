'use client';
import Link from 'next/link';

export default function WarRoomPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: '4rem' }}>🔥</div>
            <h1 style={{ fontSize: '2rem' }}>The War Room</h1>
            <div className="badge badge-orange">Coming Soon — Phase 2</div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400 }}>
                This module simulates live production incidents. Fix a crashing server before the CTO fires you.
                Docker-based terminal environment with fault injection coming in Phase 2.
            </p>
            <Link href="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>
    );
}
