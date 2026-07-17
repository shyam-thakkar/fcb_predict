'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
    prediction: Record<string, unknown> | null;
    leaderboard: { points: number; rank: number; correct_predictions: number; badges: string[] } | null;
    totalParticipants: number;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData>({ prediction: null, leaderboard: null, totalParticipants: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) fetchDashboard();
    }, [user, authLoading, router]);

    const fetchDashboard = async () => {
        try {
            const [predRes, lbRes] = await Promise.all([
                fetch('/api/predictions'),
                fetch('/api/leaderboard'),
            ]);
            const predData = await predRes.json();
            const lbData = await lbRes.json();

            const myLb = lbData.data?.find((e: Record<string, unknown>) => e.user_id === user?.id);
            setData({
                prediction: predData.data?.[0] || null,
                leaderboard: myLb ? { points: myLb.points as number, rank: myLb.rank as number, correct_predictions: myLb.correct_predictions as number, badges: myLb.badges as string[] } : null,
                totalParticipants: lbData.data?.length || 0,
            });
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="skeleton h-32 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    const maxPoints = 105;
    const progressPercent = data.leaderboard ? Math.min((data.leaderboard.points / maxPoints) * 100, 100) : 0;

    const predictionLabels: Record<string, string> = {
        winner: '👑 Match Winner',
        score_home: '🇦🇷 Argentina Goals',
        score_away: '🇪🇸 Spain Goals',
        first_team_to_score: '⚡ First Team to Score',
        first_goal_scorer: '⚽ First Goal Scorer',
        man_of_match: '🌟 Man of the Match',
        total_goals: '📊 Total Goals',
        match_ends_in: '⏱️ Match Ends In',
        both_teams_score: '🤝 Both Teams Score',
        yellow_cards: '🟨 Yellow Cards',
        red_card: '🟥 Red Card',
        possession: '📈 Most Possession',
        corners: '🏁 Total Corners',
        last_goal_scorer: '🎯 Last Goal Scorer',
    };

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Welcome */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white">
                            {user?.username[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Welcome, {user?.full_name}!</h1>
                            <p className="text-sm text-white/40">@{user?.username}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 text-center">
                        <div className="text-3xl font-bold text-gold-gradient mb-1">{data.leaderboard?.rank || '—'}</div>
                        <div className="text-sm text-white/40">Current Rank</div>
                        <div className="text-xs text-white/20 mt-1">out of {data.totalParticipants}</div>
                    </motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5 text-center">
                        <div className="text-3xl font-bold text-amber-400 mb-1">{data.leaderboard?.points || 0}</div>
                        <div className="text-sm text-white/40">Total Points</div>
                        <div className="text-xs text-white/20 mt-1">of {maxPoints} possible</div>
                    </motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">{data.leaderboard?.correct_predictions || 0}</div>
                        <div className="text-sm text-white/40">Correct Predictions</div>
                        <div className="text-xs text-white/20 mt-1">of 13 categories</div>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5 mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-white/60">Score Progress</h3>
                        <span className="text-sm text-amber-400 font-bold">{data.leaderboard?.points || 0}/{maxPoints}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                        />
                    </div>
                </motion.div>

                {/* Badges */}
                {data.leaderboard?.badges && data.leaderboard.badges.length > 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">🏅 Achievement Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.leaderboard.badges.map((badge, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Prediction History */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">📋 Your Predictions</h3>
                    {data.prediction ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(predictionLabels).map(([key, label]) => {
                                const val = data.prediction?.[key];
                                if (val === undefined || val === null) return null;
                                return (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                                        <span className="text-sm text-white/50">{label}</span>
                                        <span className="text-sm font-medium text-white">{String(val)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <span className="text-3xl mb-2 block">🎯</span>
                            <p className="text-white/40 mb-3">You haven&apos;t made a prediction yet</p>
                            <a href="/predict" className="btn-primary">Make Your Prediction</a>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
