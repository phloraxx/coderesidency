'use client';
import Link from 'next/link';

export default function WarRoomPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '24px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 600, width: '100%', textAlign: 'center', padding: '48px 32px' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'color-mix(in srgb, var(--google-red) 10%, transparent)', color: 'var(--google-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    🚨
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>The War Room</h1>
                <div className="badge" style={{ background: '#fce8e6', color: 'var(--google-red)' }}>Coming Soon — Phase 2</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                    This module simulates live production incidents. Fix a crashing server before the CTO fires you.
                    Docker-based terminal environment with fault injection coming in Phase 2.
                </p>
                <Link href="/dashboard" className="btn btn-outline" style={{ marginTop: 16 }}>
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
