'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HoFEntry {
    rank: number;
    username: string;
    full_name: string;
    points: number;
    correct_predictions: number;
    badges: string[];
}

export default function HallOfFamePage() {
    const [entries, setEntries] = useState<HoFEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHallOfFame();
    }, []);

    const fetchHallOfFame = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (data.success) {
                const topEntries = (data.data || [])
                    .filter((e: Record<string, unknown>) => (e.rank as number) > 0)
                    .slice(0, 10)
                    .map((e: Record<string, unknown>) => ({
                        rank: e.rank as number,
                        username: (e.users as Record<string, string>)?.username || 'Unknown',
                        full_name: (e.users as Record<string, string>)?.full_name || 'Unknown',
                        points: e.points as number,
                        correct_predictions: e.correct_predictions as number,
                        badges: (e.badges as string[]) || [],
                    }));
                setEntries(topEntries);
            }
        } catch (error) {
            console.error('Failed to fetch hall of fame:', error);
        } finally {
            setLoading(false);
        }
    };

    const trophyColors = ['from-yellow-400 to-amber-600', 'from-gray-300 to-gray-500', 'from-orange-400 to-orange-700'];

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-6xl mb-4 block"
                    >
                        🏆
                    </motion.span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Hall of <span className="text-gold-gradient">Fame</span>
                    </h1>
                    <p className="text-white/40">FIFA World Cup 2026 Final — Argentina vs Spain</p>
                    <p className="text-xs text-white/20 mt-2">Prediction Contest — July 2026</p>
                </motion.div>

                {/* Top 3 Showcase */}
                {entries.length >= 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {entries.slice(0, 3).map((entry, i) => (
                            <motion.div
                                key={entry.rank}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.15 }}
                                className={`glass-card p-6 text-center ${i === 0 ? 'md:order-2 ring-1 ring-amber-500/20' : i === 1 ? 'md:order-1' : 'md:order-3'}`}
                            >
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${trophyColors[i]} mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg`}>
                                    {['🥇', '🥈', '🥉'][i]}
                                </div>
                                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">
                                    {['Champion', 'Runner-Up', 'Third Place'][i]}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{entry.username}</h3>
                                <p className="text-sm text-white/40 mb-3">{entry.full_name}</p>
                                <div className="text-3xl font-bold text-gold-gradient mb-2">{entry.points}</div>
                                <p className="text-xs text-white/30">points • {entry.correct_predictions}/13 correct</p>
                                {entry.badges.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 mt-3">
                                        {entry.badges.map((b, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400">{b}</span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Top 10 Table */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-5">
                    <h2 className="text-xl font-bold text-white mb-4">🌟 Top 10 Predictors</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl block mb-3">🏟️</span>
                            <p className="text-white/40">The Hall of Fame will be populated after the match</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry.rank}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 + i * 0.05 }}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                >
                                    <span className="w-8 text-center text-sm font-bold text-white/50">
                                        {['🥇', '🥈', '🥉'][i] || `#${entry.rank}`}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                                        {entry.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">{entry.username}</div>
                                        <div className="text-xs text-white/30">{entry.full_name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-amber-400">{entry.points} pts</div>
                                        <div className="text-xs text-white/30">{entry.correct_predictions}/13</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Total Participants', value: entries.length || '—', icon: '👥' },
                        { label: 'Highest Score', value: entries[0]?.points || '—', icon: '🏆' },
                        { label: 'Perfect Predictors', value: entries.filter(e => e.points >= 105).length, icon: '🎯' },
                        { label: 'Contest Date', value: 'July 2026', icon: '📅' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-4 text-center">
                            <span className="text-2xl mb-2 block">{stat.icon}</span>
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-white/30">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
