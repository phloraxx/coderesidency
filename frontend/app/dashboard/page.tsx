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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* ── NAVBAR ───────────────────────── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 32px',
                background: 'rgba(10,10,15,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.4rem' }}>⚕️</span>
                    <span style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.05rem' }}>
                        Code<span style={{ color: 'var(--accent-blue)' }}>Residency</span>
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href="/leaderboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        🏆 Leaderboard
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 700,
                        }}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
                    </div>
                    <button onClick={logout} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                        Sign out
                    </button>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
                {/* ── WELCOME ──────────────────────── */}
                <div className="animate-fade-in" style={{ marginBottom: 48 }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Resident'} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Choose a module and start your next simulation.
                    </p>
                </div>

                {/* ── STATS ────────────────────────── */}
                {stats && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 16, marginBottom: 48,
                    }}>
                        {[
                            { label: 'Global Score', val: stats.global_score ?? 0, icon: '⭐' },
                            { label: 'Sessions', val: stats.sessions_total ?? 0, icon: '🎮' },
                            { label: 'Completed', val: stats.modules_completed ?? 0, icon: '✅' },
                            { label: 'Avg Score', val: `${stats.average_score ?? 0}%`, icon: '📊' },
                        ].map((s) => (
                            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
                                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{s.val}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
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
                    <div className="stagger-children" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24,
                    }}>
                        {modules.map((mod) => {
                            const color = MODULE_COLORS[mod.slug] || '#6366f1';
                            const icon = MODULE_ICONS[mod.slug] || '📚';
                            const route = MODULE_ROUTES[mod.slug] || `/modules/${mod.slug}`;
                            return (
                                <Link
                                    key={mod.$id}
                                    href={route}
                                    style={{ textDecoration: 'none', display: 'block' }}
                                >
                                    <div className="card" style={{
                                        cursor: 'pointer',
                                        borderTop: `2px solid ${color}`,
                                        position: 'relative', overflow: 'hidden', height: '100%',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 60,
                                            background: `radial-gradient(ellipse at top, ${color}18, transparent)`,
                                        }} />
                                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{mod.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
                                            {mod.description}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 3 }}>
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <div key={j} style={{
                                                        width: 18, height: 4, borderRadius: 2,
                                                        background: j < mod.difficulty_level ? color : 'var(--border)',
                                                    }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {mod.estimated_duration_mins}min
                                            </span>
                                        </div>
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
                )}
            </div>
        </div>
    );
}
