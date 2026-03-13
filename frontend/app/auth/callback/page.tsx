'use client';

/**
 * OAuth Callback Handler — /auth/callback
 *
 * When using account.createOAuth2Token(), Appwrite redirects here after OAuth
 * with ?userId=...&secret=... in the URL. We exchange those for a local session
 * (via account.createSession), which sets the session cookie on localhost
 * (same-site, no cross-origin cookie issues). Then we redirect to /dashboard.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSessionFromToken } from '@/lib/appwrite';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
    const router = useRouter();
    const params = useSearchParams();
    const { initialize } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userId = params.get('userId');
        const secret = params.get('secret');

        if (!userId || !secret) {
            setError('Missing auth parameters. Please try logging in again.');
            return;
        }

        createSessionFromToken(userId, secret)
            .then(async () => {
                // Re-initialize auth store with the new session (force refresh)
                await initialize(true);
                router.replace('/dashboard');
            })
            .catch((err) => {
                console.error('Session creation failed:', err);
                setError('Authentication failed. The link may have expired.');
            });
    }, [params, router, initialize]);

    if (error) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', gap: 16,
            }}>
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <p style={{ color: '#f87171', fontSize: '1rem' }}>{error}</p>
                <button
                    onClick={() => router.replace('/login')}
                    className="btn btn-primary"
                    style={{ marginTop: 8 }}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', gap: 16,
        }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>
                Completing sign-in…
            </p>
        </div>
    );
}
