'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface LeaderEntry {
    $id: string;
    name: string;
    global_score: number;
    profile_picture_url?: string;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard(30)
            .then((d) => setEntries(d.documents || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getRankClass = (index: number) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return '';
    };

    return (
        <div className="page-container">
            <Navbar />

            <main className="page-content" style={{ maxWidth: 800 }}>
                {/* Page Hero */}
                <div className="page-hero animate-fade-in" style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f9ab00 0%, #ffcd38 100%)',
                        marginBottom: 'var(--space-md)',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9" />
                            <path d="M4 21V16a2 2 0 0 1 2-2h1" />
                            <path d="M17 21V16a2 2 0 0 1 2-2h1" />
                        </svg>
                    </div>
                    <h1 className="page-title" style={{ textAlign: 'center' }}>Leaderboard</h1>
                    <p className="page-subtitle" style={{ margin: '0 auto' }}>
                        Top residents ranked by cumulative score across all modules
                    </p>
                </div>

                {loading ? (
                    <div className="leaderboard-list stagger-children">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="leaderboard-item" style={{ opacity: 0.5 }}>
                                <div className="skeleton skeleton-box" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton skeleton-text" style={{ height: 20, marginBottom: 4 }} />
                                </div>
                                <div className="skeleton skeleton-box" style={{ width: 60, height: 32 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="leaderboard-list stagger-children">
                        {entries.map((entry, i) => (
                            <div 
                                key={entry.$id} 
                                className={`leaderboard-item ${getRankClass(i)} animate-fade-up`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {/* Rank */}
                                <div className="leaderboard-rank">
                                    <span className="leaderboard-rank-number">
                                        {i < 9 ? `0${i + 1}` : i + 1}
                                    </span>
                                </div>

                                {/* Avatar */}
                                <div className="leaderboard-avatar">
                                    {entry.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>

                                {/* Info */}
                                <div className="leaderboard-info">
                                    <div className="leaderboard-name">{entry.name}</div>
                                </div>

                                {/* Score */}
                                <div className="leaderboard-score">
                                    <div className="leaderboard-score-value">
                                        {entry.global_score.toLocaleString()}
                                    </div>
                                    <div className="leaderboard-score-label">points</div>
                                </div>
                            </div>
                        ))}

                        {entries.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">🏆</div>
                                <div className="empty-state-title">No Scores Yet</div>
                                <p className="empty-state-description">
                                    Complete a simulation to appear on the leaderboard.
                                </p>
                                <Link href="/dashboard" className="btn btn-solid" style={{ marginTop: 'var(--space-md)' }}>
                                    Start Training
                                </Link>
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
