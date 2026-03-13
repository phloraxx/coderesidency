'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AuthProvider — initializes auth on mount, handles redirects.
 * Wrap in root layout.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { initialize, initialized, user, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Redirect unauthenticated users away from protected pages
    useEffect(() => {
        if (!initialized || loading) return;

        const isPublicPage = pathname === '/' || pathname === '/login' || pathname?.startsWith('/auth/');
        if (!user && !isPublicPage) {
            router.replace('/login');
        }
        if (user && pathname === '/login') {
            router.replace('/dashboard');
        }
    }, [initialized, loading, user, pathname, router]);

    if (!initialized) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return <>{children}</>;
}
