'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getModules, getMyStats } from '@/lib/api';
import Link from 'next/link';

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
    'difficult-client': '💬',
    'war-room': '🔥',
    'gatekeeper': '🎯',
    'imposter': '🕵️',
};
const MODULE_COLORS: Record<string, string> = {
    'difficult-client': '#6366f1',
    'war-room': '#ef4444',
    'gatekeeper': '#10b981',
    'imposter': '#f59e0b',
};
const MODULE_ROUTES: Record<string, string> = {
    'difficult-client': '/modules/difficult-client',
    'war-room': '/modules/war-room',
    'gatekeeper': '/modules/gatekeeper',
    'imposter': '/modules/imposter',
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            {/* ── NAVBAR ───────────────────────── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        Code<span style={{ color: 'var(--google-blue)' }}>Residency</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Link href="/leaderboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🏆</span> Leaderboard
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--google-blue)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', fontWeight: 500,
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name}</span>
                        <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem', marginLeft: 8 }}>
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 1200 }}>
                {/* ── WELCOME ──────────────────────── */}
                <div className="animate-fade-in" style={{ marginBottom: 48 }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Resident'} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Resume your training or start a new simulation.
                    </p>
                </div>

                {/* ── STATS ────────────────────────── */}
                {stats && (
                    <div style={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 24, marginBottom: 56,
                    }}>
                        {[
                            { label: 'Global Score', val: stats.global_score ?? 0, color: 'var(--google-blue)' },
                            { label: 'Simulations', val: stats.sessions_total ?? 0, color: 'var(--text-primary)' },
                            { label: 'Avg Score', val: stats.average_score?.toFixed(1) || '0.0', color: 'var(--text-primary)' },
                        ].map((s) => (
                            <div key={s.label} className="card" style={{ flex: '1 1 200px', padding: '24px 32px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MODULES GRID ─────────────────── */}
                <h2 style={{ fontSize: '1.3rem', marginBottom: 24, fontWeight: 700 }}>Simulation Modules</h2>

                {loading ? (
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card" style={{ flex: '1 1 260px', height: 220, opacity: 0.4, background: 'var(--bg-elevated)' }} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Available Modules</h2>
                        </div>

                        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                            {modules.map((mod) => {
                            const color = MODULE_COLORS[mod.slug] || 'var(--google-blue)';
                            const icon = MODULE_ICONS[mod.slug] || '📚';
                            const route = MODULE_ROUTES[mod.slug] || `/modules/${mod.slug}`;
                            return (
                                <Link
                                    key={mod.$id}
                                    href={route}
                                    className="card link-hover-none"
                                    style={{
                                        display: 'flex', flexDirection: 'column',
                                        borderTop: `4px solid ${color}`,
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        padding: '32px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            background: `color-mix(in srgb, ${color} 10%, transparent)`,
                                            color: color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.75rem'
                                        }}>
                                            {icon}
                                        </div>
                                        <span className="badge" style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                            {mod.estimated_duration_mins} MINS
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: 12 }}>{mod.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 32 }}>
                                        {mod.description}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <div
                                                    key={j}
                                                    style={{
                                                        width: 8, height: 8, borderRadius: '50%',
                                                        background: j < mod.difficulty_level ? color : 'var(--border)',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: color }}>
                                            Start Module →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Fallback if no modules from DB yet */}
                        {modules.length === 0 && (
                            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    No modules loaded yet. Run the database setup script first:
                                </p>
                                <code style={{ display: 'block', marginTop: 12, padding: '8px 16px', background: 'var(--bg-elevated)', borderRadius: 8, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                                    cd backend && python scripts/setup_db.py
                                </code>
                            </div>
                        )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
