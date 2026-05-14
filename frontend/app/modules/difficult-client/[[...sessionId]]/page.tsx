'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { sendChatMessage, getChatHistory, executeCode, generateEvaluation, startScenario, getScenarios } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Dynamic import — Monaco Editor requires browser
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Message {
    sender: 'user' | 'actor_ai' | 'system';
    message: string;
    timestamp?: string;
}

interface Scenario {
    $id: string;
    title: string;
    description: string;
}

export default function DifficultClientPage() {
    const params = useParams();
    const router = useRouter();
    // [[...sessionId]] is a catch-all route — params.sessionId is string[] at runtime
    const rawParam = params?.sessionId;
    const sessionId = Array.isArray(rawParam) ? rawParam[0] : (rawParam as string | undefined);

    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [code, setCode] = useState('# Write your solution here\nprint("Hello, client!")');
    const [language, setLanguage] = useState('python');
    const [sending, setSending] = useState(false);
    const [running, setRunning] = useState(false);
    const [codeOutput, setCodeOutput] = useState('');
    const [score, setScore] = useState(0);
    const [constraintsDisc, setConstraintsDisc] = useState(0);
    const [constraintsTotal, setConstraintsTotal] = useState(0);
    const [phase, setPhase] = useState<'chat' | 'code'>('chat');
    const [evaluating, setEvaluating] = useState(false);
    const [loadingScenarios, setLoadingScenarios] = useState(true);
    const [activeSessionId, setActiveSessionId] = useState(sessionId);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // If no sessionId, show scenario selector
    useEffect(() => {
        if (!sessionId) {
            getScenarios('mod-001').then((d) => setScenarios(d.scenarios || [])).finally(() => setLoadingScenarios(false));
        }
    }, [sessionId]);

    // Load existing session
    useEffect(() => {
        if (!sessionId) return;
        setActiveSessionId(sessionId);
        getChatHistory(sessionId).then((d) => {
            const docs = d.documents || [];
            const VALID_SENDERS = ['user', 'actor_ai', 'system'] as const;
            setMessages(docs.map((doc: Record<string, unknown>) => ({
                sender: VALID_SENDERS.includes(doc.sender as Message['sender'])
                    ? (doc.sender as Message['sender'])
                    : 'system',
                message: doc.message as string,
                timestamp: doc.$createdAt as string,
            })));
        }).catch(console.error);
    }, [sessionId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStartScenario = async (scenarioId: string) => {
        try {
            const data = await startScenario(scenarioId);
            router.push(`/modules/difficult-client/${data.session_id}`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !activeSessionId) return;
        const userMsg: Message = { sender: 'user', message: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSending(true);
        try {
            const res = await sendChatMessage(activeSessionId, input);
            setMessages((prev) => [...prev, { sender: 'actor_ai', message: res.message }]);
            setScore(res.current_score);
            setConstraintsDisc(res.constraints_discovered);
            setConstraintsTotal(res.constraints_total);
            if (res.constraints_discovered / Math.max(res.constraints_total, 1) >= 0.8) {
                setPhase('code');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const handleRunCode = async () => {
        if (!activeSessionId) return;
        setRunning(true);
        setCodeOutput('Running...');
        try {
            const res = await executeCode(activeSessionId, code, language);
            setCodeOutput(
                res.stdout || res.stderr || (res.exit_code === 0 ? '(no output)' : `Exit code: ${res.exit_code}`)
            );
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!activeSessionId) return;
        setEvaluating(true);
        try {
            await generateEvaluation(activeSessionId);
            router.push(`/evaluation/${activeSessionId}`);
        } catch (e) {
            console.error(e);
            setEvaluating(false);
        }
    };

    // ── Scenario Selector ─────────────────────────────
    if (!sessionId) {
        return (
            <div className="page-container">
                <Navbar showBack backHref="/dashboard" backLabel="Dashboard" />

                <main className="page-content">
                    {/* Module Hero */}
                    <div className="module-hero animate-fade-in" style={{ '--hero-color': 'var(--google-blue)' } as React.CSSProperties}>
                        <div className="module-hero-icon" style={{ background: 'linear-gradient(135deg, var(--google-blue), #4285f4)' }}>
                            💬
                        </div>
                        <h1 className="module-hero-title">The Difficult Client</h1>
                        <p className="module-hero-description">
                            Choose a scenario and practice extracting real requirements from a challenging client. 
                            Master the art of asking the right questions to uncover hidden constraints.
                        </p>
                        <div className="module-hero-meta">
                            <span className="module-hero-tag">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                                15-30 min per scenario
                            </span>
                            <span className="module-hero-tag">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                AI-powered conversations
                            </span>
                        </div>
                    </div>

                    {/* Scenarios */}
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <h2 className="section-title">Available Scenarios</h2>
                    </div>

                    {loadingScenarios ? (
                        <div className="loading-center">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="scenario-grid stagger-children">
                            {scenarios.map((s, i) => (
                                <div 
                                    key={s.$id} 
                                    className="scenario-card animate-fade-up"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                    onClick={() => handleStartScenario(s.$id)}
                                >
                                    <div className="scenario-card-header">
                                        <h3 className="scenario-card-title">{s.title}</h3>
                                    </div>
                                    <p className="scenario-card-description">{s.description}</p>
                                    <div className="scenario-card-footer">
                                        <span className="scenario-card-time">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12,6 12,12 16,14" />
                                            </svg>
                                            15-30 min
                                        </span>
                                        <span className="scenario-card-action">
                                            Start Scenario
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {scenarios.length === 0 && (
                                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                    <div className="empty-state-icon">💬</div>
                                    <div className="empty-state-title">No Scenarios Found</div>
                                    <p className="empty-state-description">
                                        Run the setup script to load client scenarios.
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

    // ── Active Session ────────────────────────────────
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
                flexShrink: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href="/modules/difficult-client" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
                        ←
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.25rem' }}>💬</span>
                        <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>The Difficult Client</span>
                    </div>
                    <div className="badge badge-blue" style={{ marginLeft: 8 }}>{phase === 'chat' ? 'Discovery Phase' : 'Coding Phase'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Constraint progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Constraints:</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {Array.from({ length: constraintsTotal || 4 }).map((_, i) => (
                                <div key={i} style={{
                                    width: 32, height: 6, borderRadius: 3,
                                    background: i < constraintsDisc ? 'var(--google-green)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{constraintsDisc}/{constraintsTotal || '?'}</span>
                    </div>
                    <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                    {/* Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Score:</span>
                        <span style={{ fontWeight: 700, color: 'var(--google-blue)', fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
                    </div>
                    {phase === 'code' && (
                        <>
                            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                            <button onClick={handleSubmit} disabled={evaluating} className="btn btn-solid" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                {evaluating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Evaluating...</> : 'Submit & Get Report →'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Chat Panel */}
                <div style={{
                    width: phase === 'code' ? '40%' : '100%',
                    display: 'flex', flexDirection: 'column',
                    borderRight: phase === 'code' ? '1px solid var(--border)' : 'none',
                    transition: 'width 0.3s ease',
                }}>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
                                <p>Loading conversation...</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.sender !== 'user' && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 4 }}>
                                        {msg.sender === 'actor_ai' ? '🧑 Client' : '⚙️ System'}
                                    </span>
                                )}
                                <div className={`chat-bubble ${msg.sender === 'user' ? 'user' : msg.sender === 'actor_ai' ? 'ai' : 'system'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <div className="chat-bubble ai" style={{ opacity: 0.6 }}>
                                    <span style={{ letterSpacing: 2, animation: 'blink 1s infinite' }}>●●●</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Phase transition banner */}
                    {phase === 'code' && (
                        <div style={{
                            padding: '10px 16px', background: 'rgba(16,185,129,0.1)',
                            borderTop: '1px solid rgba(16,185,129,0.2)',
                            fontSize: '0.8rem', color: 'var(--accent-green)', textAlign: 'center',
                        }}>
                            ✅ 80%+ requirements discovered! Coding phase unlocked. You can still chat.
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '16px', borderTop: '1px solid var(--border)',
                        display: 'flex', gap: 10,
                    }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Ask the client a question..."
                            disabled={sending}
                            style={{
                                flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)',
                                fontSize: '0.9rem', outline: 'none',
                            }}
                        />
                        <button onClick={handleSend} disabled={sending || !input.trim()} className="btn btn-solid" style={{ padding: '10px 16px' }}>
                            {sending ? <div className="spinner" style={{ width: 16, height: 16 }} /> : '→'}
                        </button>
                    </div>
                </div>

                {/* Code Panel (visible only in code phase) */}
                {phase === 'code' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Editor toolbar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                            background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                        }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Language:</span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: '0.8rem',
                                }}
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                            </select>
                            <button onClick={handleRunCode} disabled={running} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem', marginLeft: 'auto' }}>
                                {running ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Running...</> : '▶ Run Code'}
                            </button>
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

                        {/* Output */}
                        <div style={{
                            height: 160, borderTop: '1px solid var(--border)',
                            background: '#0d1117', overflow: 'auto',
                            padding: '12px 16px',
                        }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>OUTPUT</div>
                            <pre style={{
                                color: codeOutput.includes('Error') || codeOutput.includes('Traceback') ? '#f87171' : '#4ade80',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.82rem',
                                whiteSpace: 'pre-wrap',
                            }}>
                                {codeOutput || 'Run your code to see output here...'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
