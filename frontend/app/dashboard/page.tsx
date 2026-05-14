'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getModules, getMyStats } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
    'code-crucible': '⚡',
    'gatekeeper': '🔐',
    'war-room': '🚨',
    'imposter': '🎯',
};

const MODULE_COLORS: Record<string, string> = {
    'difficult-client': 'var(--google-blue)',
    'code-crucible': 'var(--google-orange)',
    'gatekeeper': 'var(--google-yellow)',
    'war-room': 'var(--google-red)',
    'imposter': 'var(--google-green)',
};

const MODULE_ROUTES: Record<string, string> = {
    'difficult-client': '/modules/difficult-client',
    'code-crucible': '/modules/code-crucible',
    'gatekeeper': '/modules/gatekeeper',
    'war-room': '/modules/war-room',
    'imposter': '/modules/imposter',
};

const MODULE_TAGLINES: Record<string, string> = {
    'difficult-client': 'Requirements Engineering',
    'code-crucible': 'Coding Challenges',
    'gatekeeper': 'Git & Version Control',
    'war-room': 'Incident Response',
    'imposter': 'Technical Interviewing',
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, initialize, initialized } = useAuthStore();
    const [modules, setModules] = useState<Module[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            router.replace('/login');
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
        <div className="page-container">
            <Navbar />

            <main className="page-content">
                {/* Welcome Hero */}
                <div className="page-hero animate-fade-in">
                    <p style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: 'var(--google-blue)', 
                        marginBottom: 'var(--space-xs)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Welcome back
                    </p>
                    <h1 className="page-title">
                        {user?.name?.split(' ')[0] || 'Resident'}
                    </h1>
                    <p className="page-subtitle">
                        Resume your training or start a new simulation module. Track your progress and climb the leaderboard.
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="stats-grid stagger-children">
                        <div className="stat-card" style={{ '--stat-color': 'var(--google-blue)' } as React.CSSProperties}>
                            <span className="stat-label">Global Score</span>
                            <span className="stat-value">{stats.global_score ?? 0}</span>
                            <span className="stat-subtext">total points earned</span>
                        </div>
                        <div className="stat-card" style={{ '--stat-color': 'var(--google-green)' } as React.CSSProperties}>
                            <span className="stat-label">Simulations</span>
                            <span className="stat-value">{stats.sessions_total ?? 0}</span>
                            <span className="stat-subtext">sessions completed</span>
                        </div>
                        <div className="stat-card" style={{ '--stat-color': 'var(--google-orange)' } as React.CSSProperties}>
                            <span className="stat-label">Average Score</span>
                            <span className="stat-value">{stats.average_score?.toFixed(1) || '0.0'}</span>
                            <span className="stat-subtext">per session</span>
                        </div>
                    </div>
                )}

                {/* Modules Section */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h2 className="section-title">Training Modules</h2>
                </div>

                {loading ? (
                    <div className="loading-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="loading-card">
                                <div className="skeleton skeleton-box" style={{ width: 56, height: 56, marginBottom: 16, borderRadius: 16 }} />
                                <div className="skeleton skeleton-text" style={{ height: 24, marginBottom: 12 }} />
                                <div className="skeleton skeleton-text short" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="module-grid stagger-children">
                        {modules.map((mod, i) => {
                            const color = MODULE_COLORS[mod.slug] || 'var(--google-blue)';
                            const icon = MODULE_ICONS[mod.slug] || '📚';
                            const route = MODULE_ROUTES[mod.slug] || `/modules/${mod.slug}`;
                            const tagline = MODULE_TAGLINES[mod.slug] || 'Technical Simulation';
                            
                            return (
                                <Link
                                    key={mod.$id}
                                    href={route}
                                    className="module-card animate-fade-up"
                                    style={{ 
                                        '--card-accent': color,
                                        animationDelay: `${i * 0.05}s`
                                    } as React.CSSProperties}
                                >
                                    <div className="module-card-header">
                                        <div 
                                            className="module-card-icon"
                                            style={{ background: color }}
                                        >
                                            {icon}
                                        </div>
                                        <span className="module-card-badge">{tagline}</span>
                                    </div>
                                    
                                    <h3 className="module-card-title">{mod.title}</h3>
                                    <p className="module-card-description">{mod.description}</p>
                                    
                                    <div className="module-card-footer">
                                        <div className="module-card-difficulty">
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <span
                                                    key={j}
                                                    className={j < mod.difficulty_level ? 'active' : ''}
                                                    style={j < mod.difficulty_level ? { background: color } : {}}
                                                />
                                            ))}
                                        </div>
                                        <div className="module-card-arrow">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {modules.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <div className="empty-state-icon">📚</div>
                                <div className="empty-state-title">No Modules Found</div>
                                <p className="empty-state-description">
                                    No training modules loaded yet. Run the setup script to get started.
                                </p>
                                <code style={{ 
                                    display: 'inline-block',
                                    padding: '12px 20px',
                                    background: 'var(--text-primary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.9rem',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    cd backend && python scripts/setup_db.py
                                </code>
                            </div>
                        )}
                    </div>
                )}
            </main>

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
