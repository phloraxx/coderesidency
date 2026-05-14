'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEvaluation, generateEvaluation } from '@/lib/api';
import Link from 'next/link';

interface Report {
    overall_score: number;
    letter_grade: string;
    communication_score: number;
    technical_score: number;
    efficiency_score: number;
    strengths: string;
    areas_for_improvement: string;
    detailed_breakdown?: Record<string, Record<string, { score: number; feedback: string }>>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>{value}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 0, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 0,
                    width: `${value}%`,
                    background: value >= 80 ? 'var(--google-green)' : value >= 60 ? 'var(--google-yellow)' : 'var(--google-red)',
                    transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)',
                }} />
            </div>
        </div>
    );
}

const GRADE_COLORS: Record<string, string> = {
    'A+': 'var(--google-green)', 'A': 'var(--google-green)', 'B+': 'var(--google-blue)', 'B': 'var(--google-blue)',
    'C+': 'var(--google-yellow)', 'C': 'var(--google-yellow)', 'D': 'var(--google-red)', 'F': 'var(--google-red)',
};

export default function EvaluationPage() {
    const params = useParams();
    const sessionId = params?.sessionId as string;
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) return;
        getEvaluation(sessionId)
            .then(setReport)
            .catch(() => {
                return generateEvaluation(sessionId).then(setReport);
            })
            .catch((e) => setError(e.message || 'Failed to load evaluation'))
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
                <div className="container animate-fade-in" style={{ maxWidth: 800, paddingTop: 64 }}>
                     {/* Loading Header Skeleton */}
                     <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <div className="skeleton skeleton-box" style={{ width: 140, height: 140, borderRadius: '50%', margin: '0 auto 32px' }} />
                        <div className="skeleton skeleton-text" style={{ height: 48, width: 300, margin: '0 auto 16px' }} />
                        <div className="skeleton skeleton-text short" style={{ height: 20, margin: '0 auto' }} />
                     </div>

                     {/* Breakdown Skeletons */}
                     <div className="ticket-card" style={{ marginBottom: 32 }}>
                        <div className="skeleton skeleton-text" style={{ height: 24, width: 150, marginBottom: 32 }} />
                        <div className="skeleton skeleton-text" style={{ height: 16, marginBottom: 24 }} />
                        <div className="skeleton skeleton-text" style={{ height: 16, marginBottom: 24 }} />
                        <div className="skeleton skeleton-text" style={{ height: 16 }} />
                     </div>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 24 }}>
                <div style={{ padding: '32px', border: '3px dashed var(--google-red)', background: '#fff' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--google-red)', textTransform: 'uppercase', marginBottom: 16 }}>Error loading report</div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.1rem', marginBottom: 32 }}>{error || 'Report not available'}</p>
                    <Link href="/dashboard" className="btn btn-solid" style={{ borderRadius: 0, padding: '16px 24px', fontWeight: 800, textTransform: 'uppercase' }}>
                        BACK TO DASHBOARD
                    </Link>
                </div>
            </div>
        );
    }

    const gradeColor = GRADE_COLORS[report.letter_grade] || 'var(--text-primary)';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
            <div className="container" style={{ maxWidth: 800, paddingTop: 64, paddingBottom: 64 }}>
                <Link href="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ← BACK TO DASHBOARD
                </Link>

                {/* Header */}
                <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 64, marginTop: 40 }}>
                    <div style={{
                        width: 140, height: 140, borderRadius: '0', margin: '0 auto 32px',
                        background: '#fff',
                        border: `4px solid ${gradeColor}`,
                        boxShadow: `8px 8px 0px ${gradeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: gradeColor, lineHeight: 1 }}>
                            {report.letter_grade}
                        </span>
                    </div>
                    <h1 className="title-massive" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: 16 }}>SESSION COMPLETE</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>
                        Overall Score: <strong style={{ color: gradeColor, fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>{report.overall_score}/100</strong>
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="ticket-card animate-fade-up delay-1" style={{ marginBottom: 32 }}>
                    <h2 style={{ marginBottom: 32, fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 24, height: 24, background: 'var(--text-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>01</div>
                        Score Breakdown
                    </h2>
                    <ScoreBar label="Overall Score" value={report.overall_score} />
                    <ScoreBar label="Communication" value={report.communication_score} />
                    <ScoreBar label="Technical Quality" value={report.technical_score} />
                    <ScoreBar label="Efficiency" value={report.efficiency_score} />
                </div>

                {/* Strengths + Improvements */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 32, marginBottom: 32 }}>
                    <div className="ticket-card animate-fade-up delay-2" style={{ borderTop: '6px solid var(--google-green)' }}>
                        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 800, color: 'var(--google-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Strengths</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 500 }}>
                            {report.strengths || 'Performance met baseline expectations.'}
                        </p>
                    </div>
                    <div className="ticket-card animate-fade-up delay-3" style={{ borderTop: '6px solid var(--google-yellow)' }}>
                        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 800, color: 'var(--google-yellow)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Areas for Growth</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 500 }}>
                            {report.areas_for_improvement || 'Continue refining core mechanics.'}
                        </p>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                {report.detailed_breakdown && Object.keys(report.detailed_breakdown).length > 0 && (
                    <div className="ticket-card animate-fade-up delay-4" style={{ marginBottom: 48 }}>
                        <h2 style={{ marginBottom: 32, fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 24, height: 24, background: 'var(--text-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>02</div>
                            Detailed Feedback
                        </h2>
                        {Object.entries(report.detailed_breakdown).map(([category, items], idx) => (
                            <div key={category} style={{ marginBottom: idx === Object.entries(report.detailed_breakdown!).length - 1 ? 0 : 40 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--google-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, borderBottom: '2px dashed var(--border-hover)', paddingBottom: 12 }}>
                                    {category}
                                </h3>
                                {Object.entries(items).map(([key, item]) => (
                                    <div key={key} style={{ marginBottom: 20, paddingLeft: 16, borderLeft: '4px solid var(--bg-secondary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'capitalize' }}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: item.score >= 70 ? 'var(--google-green)' : 'var(--google-yellow)' }}>
                                                {item.score}/100
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>{item.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="animate-fade-in" style={{ animationDelay: '0.5s', display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <Link href="/modules/difficult-client" className="btn btn-outline" style={{ borderRadius: 0, padding: '16px 32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '2px dashed var(--text-primary)', color: 'var(--text-primary)' }}>
                        RETRY SCENARIO
                    </Link>
                    <Link href="/dashboard" className="btn btn-solid" style={{ borderRadius: 0, padding: '16px 32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        BACK TO DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    );
}
