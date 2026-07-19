'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home', icon: '🏟️' },
        { href: '/match', label: 'Match Center', icon: '⚽' },
        { href: '/predict', label: 'Predict', icon: '🎯', auth: true },
        { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        { href: '/rules', label: 'Rules', icon: '📋' },
        { href: '/hall-of-fame', label: 'Hall of Fame', icon: '🌟' },
        { href: '/cards', label: 'My Card', icon: '🎴', auth: true },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="FCB Ahmedabad Logo" className="w-10 h-10 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.15)]" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent leading-tight">
                                FCB AHMEDABD
                            </span>
                            <span className="text-[10px] text-white/40 leading-tight">FIFA WC 2026 Final</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            if (link.auth && !user) return null;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive(link.href)
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-sm">{link.icon}</span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-white/80">{user.username}</span>
                                </Link>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => {
                                if (link.auth && !user) return null;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                            ? 'bg-amber-500/20 text-amber-300'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="pt-3 border-t border-white/10">
                                {user ? (
                                    <>
                                        <Link
                                            href={user.role === 'admin' ? '/admin' : '/dashboard'}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5"
                                        >
                                            👤 Dashboard
                                        </Link>
                                        <button
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            🚪 Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 bg-white/5">
                                            Login
                                        </Link>
                                        <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
