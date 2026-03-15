'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { sendChatMessage, getChatHistory, executeCode, generateEvaluation, startScenario, getScenarios } from '@/lib/api';
import Link from 'next/link';

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
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
                <div className="container" style={{ paddingTop: 48 }}>
                    <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ marginTop: 24, marginBottom: 8, fontSize: '2rem' }}>💬 The Difficult Client</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
                        Choose a scenario and practice extracting real requirements from a challenging client.
                    </p>
                    {loadingScenarios ? (
                        <div className="spinner" />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                            {scenarios.map((s) => (
                                <div key={s.$id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleStartScenario(s.$id)}>
                                    <h3 style={{ marginBottom: 8 }}>{s.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>{s.description}</p>
                                    <button className="btn btn-solid" style={{ width: '100%', justifyContent: 'center' }}>
                                        Start Scenario →
                                    </button>
                                </div>
                            ))}
                            {scenarios.length === 0 && (
                                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No scenarios found. Run <code>python scripts/setup_db.py</code></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Active Session ────────────────────────────────
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/modules/difficult-client" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>←</Link>
                    <span style={{ fontSize: '1.1rem' }}>💬</span>
                    <span style={{ fontWeight: 700 }}>The Difficult Client</span>
                    <div className="badge badge-blue">{phase === 'chat' ? 'Discovery Phase' : 'Coding Phase'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Constraint progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Constraints:</span>
                        <div style={{ display: 'flex', gap: 3 }}>
                            {Array.from({ length: constraintsTotal || 4 }).map((_, i) => (
                                <div key={i} style={{
                                    width: 24, height: 6, borderRadius: 3,
                                    background: i < constraintsDisc ? 'var(--accent-green)' : 'var(--border)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{constraintsDisc}/{constraintsTotal || '?'}</span>
                    </div>
                    {/* Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score:</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1.1rem' }}>{score}</span>
                    </div>
                    {phase === 'code' && (
                        <button onClick={handleSubmit} disabled={evaluating} className="btn btn-solid" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            {evaluating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Evaluating...</> : 'Submit & Get Report →'}
                        </button>
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
