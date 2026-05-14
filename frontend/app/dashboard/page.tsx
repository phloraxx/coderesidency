'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getModules, getMyStats } from '@/lib/api';
import Link from 'next/link';
import MarqueeText from '@/components/MarqueeText';

interface Module {
    $id: string;
    title: string;
    slug: string;
    description: string;
    difficulty_level: number;
    estimated_duration_mins: number;
    icon?: string;
}

interface Stats {
    global_score?: number;
    sessions_total?: number;
    modules_completed?: number;
    average_score?: number;
}

const MODULE_ICONS: Record<string, string> = {
    'difficult-client': '01',
    'war-room': '02',
    'gatekeeper': '03',
    'imposter': '04',
    'code-crucible': '05',
};
const MODULE_COLORS: Record<string, string> = {
    'difficult-client': 'var(--google-blue)',
    'war-room': 'var(--google-red)',
    'gatekeeper': 'var(--google-yellow)',
    'imposter': 'var(--google-green)',
    'code-crucible': 'var(--google-orange)',
};
const MODULE_ROUTES: Record<string, string> = {
    'difficult-client': '/modules/difficult-client',
    'war-room': '/modules/war-room',
    'gatekeeper': '/modules/gatekeeper',
    'imposter': '/modules/imposter',
    'code-crucible': '/modules/code-crucible',
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, initialize, initialized } = useAuthStore();
    const [modules, setModules] = useState<Module[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    // Run auth check once on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Only fetch data once we know the user is authenticated
    useEffect(() => {
        if (!initialized) return; // still checking session
        if (!user) {
            router.replace('/login'); // not logged in → redirect
            return;
        }
        Promise.all([getModules(), getMyStats()])
            .then(([modsData, statsData]) => {
                setModules(modsData.modules || []);
                setStats(statsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [initialized, user, router]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
            {/* ── NAVBAR ───────────────────────── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '2px solid var(--text-primary)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 16, height: 16, background: 'var(--google-blue)' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        CodeResidency
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Link href="/leaderboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ fontWeight: 800 }}>LEADERBOARD</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '2px dashed var(--border)', paddingLeft: 24 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '0',
                            background: 'var(--text-primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', fontWeight: 800,
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 800, textTransform: 'uppercase' }}>{user?.name || 'USER'}</span>
                        <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', marginLeft: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: 64, paddingBottom: 80, maxWidth: 1200, flexGrow: 1 }}>
                {/* ── WELCOME ──────────────────────── */}
                <div className="animate-fade-in" style={{ marginBottom: 64 }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: 16, fontWeight: 800, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        Welcome back,<br /><span style={{ color: 'var(--google-blue)' }}>{user?.name?.split(' ')[0] || 'Resident'}</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>
                        Resume your training or start a new clinical simulation.
                    </p>
                </div>

                {/* ── STATS ────────────────────────── */}
                {stats && (
                    <div style={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 24, marginBottom: 80,
                    }}>
                        {[
                            { label: 'Global Score', val: stats.global_score ?? 0, color: 'var(--google-blue)' },
                            { label: 'Simulations', val: stats.sessions_total ?? 0, color: 'var(--text-primary)' },
                            { label: 'Avg Score', val: stats.average_score?.toFixed(1) || '0.0', color: 'var(--text-primary)' },
                        ].map((s) => (
                            <div key={s.label} className="ticket-card" style={{ flex: '1 1 200px', padding: '32px' }}>
                                <div className="ticket-label" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{s.label}</div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.val}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MODULES GRID ─────────────────── */}
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: 32, color: 'var(--text-primary)' }}>Available Modules</h2>

                {loading ? (
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="ticket-card" style={{ flex: '1 1 320px', height: 260, opacity: 0.2 }} />
                        ))}
                    </div>
                ) : (
                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 40 }}>
                        {modules.map((mod, i) => {
                            const color = MODULE_COLORS[mod.slug] || 'var(--google-blue)';
                            const icon = MODULE_ICONS[mod.slug] || `0${(i % 4) + 1}`;
                            const route = MODULE_ROUTES[mod.slug] || `/modules/${mod.slug}`;
                            return (
                                <Link
                                    key={mod.$id}
                                    href={route}
                                    className="ticket-card animate-fade-up"
                                    style={{
                                        display: 'flex', flexDirection: 'column',
                                        textDecoration: 'none', color: 'inherit',
                                    }}
                                >
                                    {/* Event Ticket Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '2px dashed var(--border-hover)', paddingBottom: 24 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="ticket-label" style={{ color: color }}>MODULE {icon}</span>
                                            <span className="ticket-label" style={{ color: 'var(--text-muted)' }}>{mod.estimated_duration_mins} MINS</span>
                                        </div>
                                        <div style={{
                                            width: 64, height: 64, borderRadius: '0',
                                            background: color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 800,
                                            color: '#fff',
                                            transform: 'rotate(10deg)'
                                        }}>
                                            {icon}
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 16 }}>{mod.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 40, fontWeight: 500 }}>
                                        {mod.description}
                                    </p>

                                    {/* Event Ticket Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '16px 20px', border: '1px solid var(--border)', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <div
                                                    key={j}
                                                    style={{
                                                        width: 10, height: 10, borderRadius: '50%',
                                                        background: j < mod.difficulty_level ? color : 'var(--border)',
                                                    }}
                                                />
                                            ))}
                                            <span className="ticket-label" style={{ marginLeft: 12 }}>
                                                DIFFICULTY
                                            </span>
                                        </div>
                                        <div style={{ width: 16, height: 16, borderRight: '2px solid var(--text-primary)', borderTop: '2px solid var(--text-primary)', transform: 'rotate(45deg)' }}></div>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Fallback if no modules from DB yet */}
                        {modules.length === 0 && (
                            <div className="ticket-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 64 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 16, fontWeight: 800, color: 'var(--text-secondary)' }}>NO SIMULATIONS FOUND</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>
                                    No modules loaded yet. Run the database setup script first:
                                </p>
                                <code style={{ display: 'inline-block', marginTop: 24, padding: '16px 24px', background: 'var(--text-primary)', borderRadius: 0, color: 'var(--bg-primary)', fontSize: '1rem', fontWeight: 800 }}>
                                    cd backend && python scripts/setup_db.py
                                </code>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── FOOTER ───────────────────────── */}
            <footer style={{
                padding: '32px 48px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
                background: '#000',
                color: '#fff',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        CodeResidency
                    </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                    MULEARN SCET // BUILT WITH NEXT.JS
                </div>
            </footer>
        </div>
    );
}
