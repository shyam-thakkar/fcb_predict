'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
    id: string;
    user_id: string;
    points: number;
    rank: number;
    correct_predictions: number;
    badges: string[];
    users: { id: string; full_name: string; username: string } | null;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('rank');

    useEffect(() => {
        fetchLeaderboard();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (data.success) {
                setEntries(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter(e => {
        if (!search) return true;
        const s = search.toLowerCase();
        return e.users?.username?.toLowerCase().includes(s) || e.users?.full_name?.toLowerCase().includes(s);
    }).sort((a, b) => {
        if (sortBy === 'points') return b.points - a.points;
        if (sortBy === 'rank') return a.rank - b.rank;
        return 0;
    });

    const topThree = filteredEntries.filter(e => e.rank <= 3 && e.rank > 0);

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'from-yellow-600 to-amber-400';
        if (rank === 2) return 'from-gray-400 to-gray-300';
        if (rank === 3) return 'from-orange-700 to-orange-500';
        return 'from-slate-600 to-slate-500';
    };

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Live <span className="text-gold-gradient">Leaderboard</span>
                    </h1>
                    <p className="text-white/40 flex items-center justify-center gap-2">
                        <span className="live-dot" />
                        Updates automatically during the match
                    </p>
                </motion.div>

                {/* Podium for top 3 */}
                {topThree.length > 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center items-end gap-4 mb-12">
                        {/* 2nd Place */}
                        {topThree.find(e => e.rank === 2) && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-300 flex items-center justify-center text-2xl md:text-3xl mb-2 shadow-lg">
                                    🥈
                                </div>
                                <div className="text-sm font-bold text-white">{topThree.find(e => e.rank === 2)?.users?.username}</div>
                                <div className="text-xs text-amber-400 font-bold">{topThree.find(e => e.rank === 2)?.points} pts</div>
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-b from-gray-500/30 to-gray-600/10 rounded-t-lg mt-2 flex items-center justify-center">
                                    <span className="text-3xl font-black text-white/20">2</span>
                                </div>
                            </div>
                        )}
                        {/* 1st Place */}
                        {topThree.find(e => e.rank === 1) && (
                            <div className="flex flex-col items-center -mt-8">
                                <div className="text-3xl mb-1">👑</div>
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-500 to-amber-400 flex items-center justify-center text-3xl md:text-4xl mb-2 shadow-lg pulse-glow">
                                    🥇
                                </div>
                                <div className="text-base font-bold text-white">{topThree.find(e => e.rank === 1)?.users?.username}</div>
                                <div className="text-sm text-amber-400 font-bold">{topThree.find(e => e.rank === 1)?.points} pts</div>
                                <div className="w-24 h-28 md:w-28 md:h-32 bg-gradient-to-b from-amber-500/30 to-amber-600/10 rounded-t-lg mt-2 flex items-center justify-center">
                                    <span className="text-4xl font-black text-white/20">1</span>
                                </div>
                            </div>
                        )}
                        {/* 3rd Place */}
                        {topThree.find(e => e.rank === 3) && (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-2xl md:text-3xl mb-2 shadow-lg">
                                    🥉
                                </div>
                                <div className="text-sm font-bold text-white">{topThree.find(e => e.rank === 3)?.users?.username}</div>
                                <div className="text-xs text-amber-400 font-bold">{topThree.find(e => e.rank === 3)?.points} pts</div>
                                <div className="w-20 h-16 md:w-24 md:h-20 bg-gradient-to-b from-orange-500/30 to-orange-600/10 rounded-t-lg mt-2 flex items-center justify-center">
                                    <span className="text-3xl font-black text-white/20">3</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Search & Sort */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="🔍 Search by username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="form-select w-full sm:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="rank">Sort by Rank</option>
                        <option value="points">Sort by Points</option>
                    </select>
                </motion.div>

                {/* Leaderboard Table */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton h-14 w-full" />
                            ))}
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="text-4xl mb-4 block">🏆</span>
                            <p className="text-white/40">No predictions yet. Be the first to predict!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Rank</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Points</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:table-cell">Correct</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Badges</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {filteredEntries.map((entry, i) => (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`hover:bg-white/[0.02] transition-colors ${entry.rank <= 3 ? 'bg-white/[0.01]' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${entry.rank <= 3 ? `bg-gradient-to-br ${getRankColor(entry.rank)} text-white` : 'bg-white/5 text-white/50'}`}>
                                                    {entry.rank <= 3 ? getRankEmoji(entry.rank) : entry.rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {entry.users?.username?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{entry.users?.username}</div>
                                                        <div className="text-xs text-white/30">{entry.users?.full_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-lg font-bold text-amber-400">{entry.points}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                <span className="text-sm text-white/50">{entry.correct_predictions}/13</span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(entry.badges || []).slice(0, 3).map((badge, idx) => (
                                                        <span key={idx} className="text-sm" title={badge}>{badge.split(' ')[0]}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Total Participants */}
                <div className="mt-4 text-center text-sm text-white/30">
                    {entries.length} participant{entries.length !== 1 ? 's' : ''} total
                </div>
            </div>
        </div>
    );
}
