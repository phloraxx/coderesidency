// Zustand auth store
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, logout as appwriteLogout, clearJWTCache } from '@/lib/appwrite';

interface AuthUser {
    $id: string;
    name: string;
    email: string;
    prefs?: Record<string, unknown>;
}

interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: AuthUser | null) => void;
    initialize: (forceRefresh?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            initialized: false,

            setUser: (user) => set({ user }),

            initialize: async (forceRefresh = false) => {
                if (get().initialized && !forceRefresh) return;
                set({ loading: true, initialized: false });
                try {
                    const user = await getCurrentUser();
                    set({ user: user as AuthUser | null, initialized: true });
                } catch {
                    set({ user: null, initialized: true });
                } finally {
                    set({ loading: false });
                }
            },

            logout: async () => {
                clearJWTCache();
                await appwriteLogout();
                set({ user: null, initialized: false });
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({ user: state.user }),
        },
    ),
);
