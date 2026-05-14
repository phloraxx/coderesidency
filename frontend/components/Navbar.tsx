'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
    showBack?: boolean;
    backHref?: string;
    backLabel?: string;
}

export default function Navbar({ showBack = false, backHref = '/dashboard', backLabel = 'Dashboard' }: NavbarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Left: Logo & Back */}
                <div className="navbar-left">
                    {showBack ? (
                        <Link href={backHref} className="navbar-back">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>{backLabel}</span>
                        </Link>
                    ) : (
                        <Link href="/dashboard" className="navbar-brand">
                            <div className="navbar-logo">
                                <div className="navbar-logo-squares">
                                    <span style={{ background: 'var(--google-blue)' }} />
                                    <span style={{ background: 'var(--google-red)' }} />
                                    <span style={{ background: 'var(--google-yellow)' }} />
                                    <span style={{ background: 'var(--google-green)' }} />
                                </div>
                            </div>
                            <span className="navbar-title">CodeResidency</span>
                        </Link>
                    )}
                </div>

                {/* Center: Navigation Links */}
                <div className="navbar-center">
                    <Link
                        href="/dashboard"
                        className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Modules</span>
                    </Link>
                    <Link
                        href="/leaderboard"
                        className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9" />
                            <path d="M4 21V16a2 2 0 0 1 2-2h1" />
                            <path d="M17 21V16a2 2 0 0 1 2-2h1" />
                        </svg>
                        <span>Leaderboard</span>
                    </Link>
                </div>

                {/* Right: User Profile */}
                <div className="navbar-right">
                    {user ? (
                        <div className="navbar-user">
                            <div className="navbar-avatar">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="navbar-user-info">
                                <span className="navbar-user-name">{user.name || 'User'}</span>
                            </div>
                            <button onClick={logout} className="navbar-signout">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16,17 21,12 16,7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-solid" style={{ padding: '8px 20px' }}>
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
