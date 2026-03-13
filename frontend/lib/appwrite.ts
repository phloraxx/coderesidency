// Appwrite client-side SDK singleton
import { Client, Account, Databases, Storage, OAuthProvider } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://backend.ieeesahrdaya.com/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'coderesidency');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'coderesidency';

// ─── OAuth Login ─────────────────────────────────────────────────────────────
// We use createOAuth2Token (not createOAuth2Session) because:
//   - createOAuth2Session sets a cookie on the Appwrite domain (cross-site, blocked by
//     SameSite rules when frontend is on http://localhost)
//   - createOAuth2Token passes userId+secret as URL params to the success page, so
//     we can call createSession() locally (same-site) and then createJWT() without
//     any cross-site cookie complications.
export function loginWithGitHub() {
    account.createOAuth2Token(
        OAuthProvider.Github,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login?error=oauth_failed`,
    );
}

export function loginWithGoogle() {
    account.createOAuth2Token(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login?error=oauth_failed`,
    );
}

// Exchange the one-time userId+secret (from token flow) for a real session
export async function createSessionFromToken(userId: string, secret: string) {
    return await account.createSession(userId, secret);
}

export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

// Cache JWT for 14 minutes (Appwrite JWTs expire after 15 min)
let _jwtCache: { token: string; expiresAt: number } | null = null;

export async function getJWT(): Promise<string | null> {
    try {
        const now = Date.now();
        if (_jwtCache && now < _jwtCache.expiresAt) {
            return _jwtCache.token;
        }
        const jwt = await account.createJWT();
        _jwtCache = { token: jwt.jwt, expiresAt: now + 14 * 60 * 1000 };
        return jwt.jwt;
    } catch {
        _jwtCache = null;
        return null;
    }
}

/** Call this on logout so the cached JWT is invalidated immediately. */
export function clearJWTCache() {
    _jwtCache = null;
}

export async function logout() {
    clearJWTCache();
    await account.deleteSession('current');
}

export { client };
