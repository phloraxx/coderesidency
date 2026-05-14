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

const MEDAL_COLORS = ['var(--google-yellow)', 'var(--text-muted)', 'var(--google-red)'];

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
            <div className="container" style={{ maxWidth: 800, paddingTop: 64 }}>
                <Link href="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ← BACK TO DASHBOARD
                </Link>
                
                <div style={{ textAlign: 'center', marginBottom: 64, marginTop: 40 }}>
                    <h1 className="title-massive" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: 16 }}>LEADERBOARD</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>Top residents by cumulative score</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="ticket-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: 'none' }}>
                                <div className="skeleton skeleton-box" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton skeleton-text" style={{ height: 24, marginBottom: 8 }} />
                                    <div className="skeleton skeleton-text short" style={{ height: 16 }} />
                                </div>
                                <div className="skeleton skeleton-box" style={{ width: 80, height: 40 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {entries.map((entry, i) => (
                            <div key={entry.$id} className="ticket-card" style={{
                                display: 'flex', alignItems: 'center', gap: 24,
                                padding: '24px 32px',
                                flexDirection: 'row',
                                background: i === 0 ? 'rgba(251,188,4,0.05)' : i === 1 ? 'rgba(128,134,139,0.05)' : i === 2 ? 'rgba(234,67,53,0.05)' : 'var(--bg-card)',
                                borderColor: i === 0 ? 'rgba(251,188,4,0.5)' : i === 1 ? 'rgba(128,134,139,0.5)' : i === 2 ? 'rgba(234,67,53,0.5)' : 'var(--border)',
                            }}>
                                {/* Rank */}
                                <div style={{ 
                                    width: 60, textAlign: 'center', 
                                    fontWeight: 900, fontFamily: 'Outfit, sans-serif',
                                    color: i < 3 ? MEDAL_COLORS[i] : 'var(--border-hover)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>RANK</span>
                                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>{i < 9 ? `0${i + 1}` : i + 1}</span>
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    width: 56, height: 56, borderRadius: '0',
                                    background: i < 3 ? MEDAL_COLORS[i] : 'var(--text-primary)',
                                    color: i === 1 ? '#000' : '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
                                }}>
                                    {entry.name?.charAt(0) || '?'}
                                </div>

                                {/* Name */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{entry.name}</div>
                                </div>

                                {/* Score */}
                                <div style={{
                                    fontWeight: 900, fontSize: '2rem', fontFamily: 'Outfit, sans-serif',
                                    color: i < 3 ? MEDAL_COLORS[i] : 'var(--google-blue)',
                                    textAlign: 'right'
                                }}>
                                    {entry.global_score.toLocaleString()}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textAlign: 'right', letterSpacing: '0.05em' }}>PTS</span>
                                </div>
                            </div>
                        ))}
                        {entries.length === 0 && (
                            <div className="ticket-card" style={{ textAlign: 'center', padding: 64 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 16 }}>NO SCORES RECORDED</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Execute a simulation to be the first.</p>
                                <Link href="/dashboard" className="btn btn-solid" style={{ marginTop: 32, display: 'inline-flex', padding: '16px 32px', borderRadius: '0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    START TRAINING
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
