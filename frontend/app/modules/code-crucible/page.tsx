'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getScenarios, startScenario } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Scenario {
    $id: string;
    title: string;
    description: string;
    difficulty: number;
    time_limit_seconds?: number;
}

export default function CodeCruciblePage() {
    const router = useRouter();
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState<string | null>(null);

    useEffect(() => {
        getScenarios('mod-005')
            .then((data) => setScenarios(data.scenarios || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleStart = async (scenarioId: string) => {
        setStarting(scenarioId);
        try {
            const data = await startScenario(scenarioId);
            router.push(`/modules/code-crucible/${data.session_id}`);
        } catch (e) {
            console.error(e);
            setStarting(null);
        }
    };

    const getDifficultyLabel = (level: number) => {
        const labels = ['', 'Beginner', 'Easy', 'Intermediate', 'Challenging', 'Advanced'];
        return labels[level] || 'Unknown';
    };

    const getDifficultyColor = (level: number) => {
        const colors = ['', 'var(--google-green)', 'var(--google-green)', 'var(--google-yellow)', 'var(--google-orange)', 'var(--google-red)'];
        return colors[level] || 'var(--text-secondary)';
    };

    return (
        <div className="page-container">
            <Navbar showBack backHref="/dashboard" backLabel="Dashboard" />

            <main className="page-content">
                {/* Module Hero */}
                <div className="module-hero animate-fade-in" style={{ '--hero-color': 'var(--google-orange)' } as React.CSSProperties}>
                    <div className="module-hero-icon" style={{ background: 'linear-gradient(135deg, var(--google-orange), #fa7b17)' }}>
                        ⚡
                    </div>
                    <h1 className="module-hero-title">The Code Crucible</h1>
                    <p className="module-hero-description">
                        Implement solutions to real-world coding challenges. Write clean, correct code that passes all test cases. 
                        Race against time and climb the leaderboard.
                    </p>
                    <div className="module-hero-meta">
                        <span className="module-hero-tag">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                            </svg>
                            20-30 min per challenge
                        </span>
                        <span className="module-hero-tag">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            Multiple languages supported
                        </span>
                    </div>
                </div>

                {/* Scenarios */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h2 className="section-title">Available Challenges</h2>
                </div>

                {loading ? (
                    <div className="loading-center">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="scenario-grid stagger-children">
                        {scenarios.map((s, i) => (
                            <div
                                key={s.$id}
                                className="scenario-card animate-fade-up"
                                style={{ 
                                    cursor: starting ? 'wait' : 'pointer',
                                    opacity: starting && starting !== s.$id ? 0.6 : 1,
                                    animationDelay: `${i * 0.05}s`
                                }}
                                onClick={() => !starting && handleStart(s.$id)}
                            >
                                <div className="scenario-card-header">
                                    <h3 className="scenario-card-title">{s.title}</h3>
                                    <span
                                        className="scenario-card-difficulty"
                                        style={{
                                            background: `color-mix(in srgb, ${getDifficultyColor(s.difficulty)} 15%, transparent)`,
                                            color: getDifficultyColor(s.difficulty),
                                        }}
                                    >
                                        {getDifficultyLabel(s.difficulty)}
                                    </span>
                                </div>
                                <p className="scenario-card-description">{s.description}</p>
                                <div className="scenario-card-footer">
                                    <span className="scenario-card-time">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12,6 12,12 16,14" />
                                        </svg>
                                        {s.time_limit_seconds ? `${Math.round(s.time_limit_seconds / 60)} min` : '20-30 min'}
                                    </span>
                                    <span className="scenario-card-action">
                                        {starting === s.$id ? (
                                            <>
                                                <div className="spinner" style={{ width: 14, height: 14 }} />
                                                Starting...
                                            </>
                                        ) : (
                                            <>
                                                Start Challenge
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {scenarios.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <div className="empty-state-icon">⚡</div>
                                <div className="empty-state-title">No Challenges Found</div>
                                <p className="empty-state-description">
                                    Run the setup script to load coding challenges.
                                </p>
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
