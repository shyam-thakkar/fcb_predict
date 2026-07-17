'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '', username: '', mobile: '', password: '', confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const passwordChecks = [
        { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
        { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?/\\]/.test(p) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen stadium-bg grid-pattern flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 mb-4"
                    >
                        <span className="text-3xl">🏆</span>
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
                    <p className="text-sm text-white/40">Join the prediction challenge and compete!</p>
                </div>

                {/* Form */}
                <div className="glass-card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Choose a unique username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <p className="mt-1 text-xs text-white/30">Must be unique. This is how you&apos;ll appear on the leaderboard.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Mobile Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="Enter your mobile number"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                required
                            />
                            <p className="mt-1 text-xs text-white/30">One account per mobile number.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input pr-12"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 text-sm"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {/* Password strength indicators */}
                            {formData.password && (
                                <div className="mt-2 space-y-1">
                                    {passwordChecks.map(check => (
                                        <div key={check.label} className="flex items-center gap-2 text-xs">
                                            <span className={check.test(formData.password) ? 'text-green-400' : 'text-white/30'}>
                                                {check.test(formData.password) ? '✅' : '○'}
                                            </span>
                                            <span className={check.test(formData.password) ? 'text-green-400' : 'text-white/30'}>
                                                {check.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Confirm your password"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                required
                            />
                            {formData.confirm_password && formData.password !== formData.confirm_password && (
                                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                '🚀 Register'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/40">
                            Already have an account?{' '}
                            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
