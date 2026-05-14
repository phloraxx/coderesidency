'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getChallenge, generateChallenge, runChallengeCode, submitChallenge, generateEvaluation } from '@/lib/api';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TestResult {
    case_number: number;
    passed: boolean;
    your_output: string;
    expected_output?: string;
}

interface Challenge {
    challenge_id: string;
    task_description: string;
    function_signature: string;
    hints: string[];
    language: string;
    time_limit_minutes: number;
    test_case_count: number;
    sample_test_case?: {
        input: string;
        expected_output: string;
    };
    starter_code: string;
}

interface SubmitResult {
    test_results: TestResult[];
    passed_count: number;
    total_count: number;
    code_quality_score: number;
    total_score: number;
    feedback: string;
    all_passed: boolean;
}

export default function CodeCrucibleSessionPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [startTime] = useState(Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load or generate challenge
    useEffect(() => {
        const loadChallenge = async () => {
            try {
                // Try to get existing challenge
                const existing = await getChallenge(sessionId);
                if (existing.challenge_id) {
                    setChallenge(existing);
                    setCode(existing.starter_code || '');
                    setLanguage(existing.language || 'python');
                } else {
                    // Generate new challenge
                    const generated = await generateChallenge(sessionId);
                    setChallenge(generated);
                    setCode(generated.starter_code || '');
                    setLanguage(generated.language || 'python');
                }
            } catch (err) {
                console.error('Failed to load challenge:', err);
            } finally {
                setLoading(false);
            }
        };
        loadChallenge();
    }, [sessionId]);

    const handleRun = async () => {
        setRunning(true);
        setOutput('Running test case #1...');
        try {
            const result = await runChallengeCode(sessionId, code, language);
            if (result.error) {
                setOutput(`Error: ${result.error}`);
            } else {
                const status = result.passed ? 'PASS' : 'FAIL';
                const stderr = result.stderr && result.stderr.trim() ? `\n\nStderr:\n${result.stderr}` : '';
                setOutput(
                    `Run Result (${status}) - Test #${result.case_number}\n`
                    + `Input: ${result.input}\n`
                    + `Expected Output: ${result.expected_output}\n`
                    + `Your Output: ${result.your_output}${stderr}\n\n`
                    + 'Run checks only test case #1. Submit runs all hidden test cases.'
                );
            }
        } catch (err) {
            setOutput(`Execution failed: ${err}`);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setOutput('Submitting and running tests...');
        try {
            const result = await submitChallenge(sessionId, code, language);
            setSubmitResult(result);
            setOutput(`Tests: ${result.passed_count}/${result.total_count} passed\nScore: ${result.total_score}/100`);
        } catch (err) {
            setOutput(`Submission failed: ${err}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = async () => {
        try {
            await generateEvaluation(sessionId);
            router.push(`/evaluation/${sessionId}`);
        } catch (err) {
            console.error('Failed to generate evaluation:', err);
        }
    };

    const revealHint = () => {
        if (challenge && hintsRevealed < challenge.hints.length) {
            setHintsRevealed(hintsRevealed + 1);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: 48, height: 48, marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Generating your challenge...</p>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Failed to load challenge.</p>
                    <Link href="/modules/code-crucible" style={{ color: 'var(--google-blue)' }}>
                        &larr; Back to challenges
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* Top Bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    background: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border)',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
                    flexShrink: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link
                        href="/modules/code-crucible"
                        style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}
                    >
                        &larr;
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.25rem' }}>{'</>'}</span>
                        <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>The Code Crucible</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Time:</span>
                        <span
                            style={{
                                fontWeight: 700,
                                color: elapsedSeconds > challenge.time_limit_minutes * 60 ? 'var(--google-red)' : 'var(--text-primary)',
                                fontSize: '1.1rem',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                    {/* Score (after submit) */}
                    {submitResult && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Score:</span>
                                <span style={{ fontWeight: 700, color: 'var(--google-blue)', fontSize: '1.25rem' }}>{submitResult.total_score}</span>
                            </div>
                            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                            <button onClick={handleFinish} className="btn btn-solid" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                View Report &rarr;
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Challenge Description */}
                <div
                    style={{
                        width: '35%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>Challenge</h2>
                        <p style={{ lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 24 }}>{challenge.task_description}</p>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Function Signature</h3>
                            <pre
                                style={{
                                    background: 'var(--bg-elevated)',
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    fontSize: '0.9rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    overflow: 'auto',
                                }}
                            >
                                {challenge.function_signature}
                            </pre>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Test Cases: {challenge.test_case_count}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Run checks test case #1 only. Submit runs all {challenge.test_case_count} test cases.
                            </p>
                            {challenge.sample_test_case && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        fontSize: '0.84rem',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    <div><strong>Test #1 Input:</strong> {challenge.sample_test_case.input}</div>
                                    <div><strong>Expected Output:</strong> {challenge.sample_test_case.expected_output}</div>
                                </div>
                            )}
                        </div>

                        {/* Hints */}
                        {challenge.hints.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hints</h3>
                                    {hintsRevealed < challenge.hints.length && (
                                        <button
                                            onClick={revealHint}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--google-blue)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Reveal Hint ({hintsRevealed}/{challenge.hints.length})
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: 'color-mix(in srgb, var(--google-yellow) 10%, transparent)',
                                                border: '1px solid color-mix(in srgb, var(--google-yellow) 30%, transparent)',
                                                borderRadius: 8,
                                                padding: '10px 14px',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <span style={{ marginRight: 8 }}>💡</span>
                                            {hint}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Result Panel */}
                    {submitResult && (
                        <div
                            style={{
                                borderTop: '1px solid var(--border)',
                                padding: 16,
                                background: submitResult.all_passed ? 'color-mix(in srgb, var(--google-green) 10%, transparent)' : 'var(--bg-elevated)',
                            }}
                        >
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
                                {submitResult.all_passed ? '🎉 All Tests Passed!' : `Tests: ${submitResult.passed_count}/${submitResult.total_count}`}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflow: 'auto' }}>
                                {submitResult.test_results.map((t) => (
                                    <div
                                        key={t.case_number}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            fontSize: '0.85rem',
                                            padding: '6px 10px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: 6,
                                        }}
                                    >
                                        <span style={{ color: t.passed ? 'var(--google-green)' : 'var(--google-red)' }}>
                                            {t.passed ? '✓' : '✗'}
                                        </span>
                                        <span>Test {t.case_number}</span>
                                        {!t.passed && (
                                            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.8rem' }}>
                                                Got: {t.your_output.substring(0, 30)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {submitResult.feedback && (
                                <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{submitResult.feedback}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Editor + Output */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor Toolbar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            background: 'var(--bg-secondary)',
                            borderBottom: '1px solid var(--border)',
                        }}
                    >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Language:</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                padding: '4px 8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem',
                            }}
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                        </select>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                            <button onClick={handleRun} disabled={running || submitting} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                {running ? (
                                    <>
                                        <div className="spinner" style={{ width: 14, height: 14 }} /> Running...
                                    </>
                                ) : (
                                    '▶ Run Code'
                                )}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={running || submitting}
                                className="btn btn-solid"
                                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            >
                                {submitting ? (
                                    <>
                                        <div className="spinner" style={{ width: 14, height: 14 }} /> Submitting...
                                    </>
                                ) : (
                                    '✓ Submit'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <MonacoEditor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div
                        style={{
                            height: 160,
                            borderTop: '1px solid var(--border)',
                            background: '#0d1117',
                            overflow: 'auto',
                            padding: '12px 16px',
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>OUTPUT</div>
                        <pre
                            style={{
                                color: output.includes('Error') || output.includes('Traceback') || output.includes('failed') ? '#f87171' : '#4ade80',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.82rem',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {output || 'Run your code to see output here...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
