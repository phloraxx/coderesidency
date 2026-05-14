'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScenarios, startScenario } from '@/lib/api';

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
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '24px' }}>
            <div className="container" style={{ paddingTop: 48, maxWidth: 1000 }}>
                <Link
                    href="/dashboard"
                    style={{
                        color: 'var(--google-blue)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <span>&larr;</span> Back to Dashboard
                </Link>

                <div style={{ marginTop: 32, marginBottom: 48 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'color-mix(in srgb, var(--google-yellow) 10%, transparent)',
                            color: 'var(--google-yellow)',
                            fontSize: '1.5rem',
                            marginBottom: 16,
                        }}
                    >
                        {'</>'}
                    </div>
                    <h1 style={{ marginBottom: 12, fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        The Code Crucible
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600 }}>
                        Implement solutions to real-world coding challenges. Write clean, correct code that passes all test cases.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {scenarios.map((s) => (
                            <div
                                key={s.$id}
                                className="card"
                                style={{
                                    cursor: starting ? 'wait' : 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    opacity: starting && starting !== s.$id ? 0.6 : 1,
                                }}
                                onClick={() => !starting && handleStart(s.$id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 500, flex: 1 }}>{s.title}</h3>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            background: `color-mix(in srgb, ${getDifficultyColor(s.difficulty)} 15%, transparent)`,
                                            color: getDifficultyColor(s.difficulty),
                                            fontWeight: 500,
                                        }}
                                    >
                                        {getDifficultyLabel(s.difficulty)}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24, flexGrow: 1, lineHeight: 1.5 }}>
                                    {s.description}
                                </p>
                                <div
                                    style={{
                                        borderTop: '1px solid var(--border)',
                                        paddingTop: 16,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {s.time_limit_seconds ? `${Math.round(s.time_limit_seconds / 60)} min` : '20-30 min'}
                                    </span>
                                    <span style={{ color: 'var(--google-blue)', fontWeight: 500, fontSize: '0.9rem' }}>
                                        {starting === s.$id ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="spinner" style={{ width: 14, height: 14 }} />
                                                Starting...
                                            </span>
                                        ) : (
                                            'Start Challenge \u2192'
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {scenarios.length === 0 && (
                            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{'</>'}</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                    No challenges found. Run the setup script first.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
