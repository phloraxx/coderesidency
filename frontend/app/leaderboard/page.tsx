'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import Link from 'next/link';

interface LeaderEntry {
    $id: string;
    name: string;
    global_score: number;
    profile_picture_url?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard(30)
            .then((d) => setEntries(d.documents || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
            <div className="container" style={{ maxWidth: 700, paddingTop: 48 }}>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    ← Dashboard
                </Link>
                <div style={{ textAlign: 'center', marginBottom: 48, marginTop: 24 }}>
                    <h1 style={{ fontSize: '2.5rem' }}>🏆 Leaderboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Top residents by cumulative score</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                    </div>
                ) : (
                    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {entries.map((entry, i) => (
                            <div key={entry.$id} className="card" style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '16px 20px',
                                background: i === 0 ? 'rgba(251,191,36,0.08)' : i === 1 ? 'rgba(156,163,175,0.08)' : i === 2 ? 'rgba(180,83,9,0.08)' : 'var(--bg-card)',
                                borderColor: i === 0 ? 'rgba(251,191,36,0.3)' : i === 1 ? 'rgba(156,163,175,0.3)' : i === 2 ? 'rgba(180,83,9,0.3)' : 'var(--border)',
                            }}>
                                {/* Rank */}
                                <div style={{ width: 36, textAlign: 'center', fontSize: i < 3 ? '1.5rem' : '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                                }}>
                                    {entry.name?.charAt(0) || '?'}
                                </div>

                                {/* Name */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{entry.name}</div>
                                </div>

                                {/* Score */}
                                <div style={{
                                    fontWeight: 900, fontSize: '1.3rem',
                                    color: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--accent-blue)',
                                }}>
                                    {entry.global_score.toLocaleString()}
                                    <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>pts</span>
                                </div>
                            </div>
                        ))}
                        {entries.length === 0 && (
                            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏜️</div>
                                <p style={{ color: 'var(--text-muted)' }}>No scores yet. Be the first!</p>
                                <Link href="/dashboard" className="btn btn-solid" style={{ marginTop: 20, display: 'inline-flex' }}>
                                    Start Training →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
