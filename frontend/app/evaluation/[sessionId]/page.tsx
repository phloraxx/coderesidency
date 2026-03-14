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
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{value}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${value}%`,
                    background: value >= 80 ? 'var(--accent-green)' : value >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)',
                    transition: 'width 1s ease',
                }} />
            </div>
        </div>
    );
}

const GRADE_COLORS: Record<string, string> = {
    'A+': '#10b981', 'A': '#10b981', 'B+': '#6366f1', 'B': '#6366f1',
    'C+': '#f59e0b', 'C': '#f59e0b', 'D': '#ef4444', 'F': '#ef4444',
};

export default function EvaluationPage() {
    const params = useParams();
    const sessionId = params?.sessionId as string;
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) return;
        // Try to get existing report, if not found generate it
        getEvaluation(sessionId)
            .then(setReport)
            .catch(() => {
                // Generate new one
                return generateEvaluation(sessionId).then(setReport);
            })
            .catch((e) => setError(e.message || 'Failed to load evaluation'))
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 16 }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                <p style={{ color: 'var(--text-secondary)' }}>🤖 AI is generating your evaluation report...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 16 }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <p style={{ color: 'var(--text-secondary)' }}>{error || 'Report not available'}</p>
                <Link href="/dashboard" className="btn btn-ghost">Back to Dashboard</Link>
            </div>
        );
    }

    const gradeColor = GRADE_COLORS[report.letter_grade] || '#6366f1';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
            <div className="container" style={{ maxWidth: 800, paddingTop: 48 }}>
                {/* Header */}
                <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
                        background: `radial-gradient(circle, ${gradeColor}30, transparent)`,
                        border: `3px solid ${gradeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse-glow 2s infinite',
                    }}>
                        <span style={{ fontSize: '3rem', fontWeight: 900, color: gradeColor }}>
                            {report.letter_grade}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Session Complete!</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You scored <strong style={{ color: gradeColor }}>{report.overall_score}/100</strong> in this simulation.
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.1s', marginBottom: 24 }}>
                    <h2 style={{ marginBottom: 24, fontSize: '1.2rem' }}>📊 Score Breakdown</h2>
                    <ScoreBar label="Overall Score" value={report.overall_score} />
                    <ScoreBar label="Communication" value={report.communication_score} />
                    <ScoreBar label="Technical Quality" value={report.technical_score} />
                    <ScoreBar label="Efficiency" value={report.efficiency_score} />
                </div>

                {/* Strengths + Improvements */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s', borderTop: '2px solid var(--accent-green)' }}>
                        <h3 style={{ marginBottom: 12, fontSize: '1rem', color: 'var(--accent-green)' }}>✅ Strengths</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            {report.strengths || 'Good work overall!'}
                        </p>
                    </div>
                    <div className="card animate-fade-in" style={{ animationDelay: '0.3s', borderTop: '2px solid var(--accent-orange)' }}>
                        <h3 style={{ marginBottom: 12, fontSize: '1rem', color: 'var(--accent-orange)' }}>💡 Improve On</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            {report.areas_for_improvement || 'Keep practicing!'}
                        </p>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                {report.detailed_breakdown && Object.keys(report.detailed_breakdown).length > 0 && (
                    <div className="card animate-fade-in" style={{ animationDelay: '0.4s', marginBottom: 24 }}>
                        <h2 style={{ marginBottom: 20, fontSize: '1.2rem' }}>🔍 Detailed Breakdown</h2>
                        {Object.entries(report.detailed_breakdown).map(([category, items]) => (
                            <div key={category} style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                                    {category}
                                </h3>
                                {Object.entries(items).map(([key, item]) => (
                                    <div key={key} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontWeight: 700, color: item.score >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                                                {item.score}/100
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="animate-fade-in" style={{ animationDelay: '0.5s', display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Link href="/modules/difficult-client" className="btn btn-ghost">
                        Try Another Scenario
                    </Link>
                    <Link href="/dashboard" className="btn btn-solid">
                        Back to Dashboard →
                    </Link>
                </div>
            </div>
        </div>
    );
}
