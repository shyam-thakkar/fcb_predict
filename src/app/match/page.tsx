'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Match, GoalEvent, CardEvent } from '@/types';

export default function MatchCenterPage() {
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatch();
        const interval = setInterval(fetchMatch, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchMatch = async () => {
        try {
            const res = await fetch('/api/match');
            const data = await res.json();
            if (data.success && data.data?.length > 0) {
                setMatch(data.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch match:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusDisplay = (status: string) => {
        const map: Record<string, { label: string; color: string }> = {
            upcoming: { label: 'Upcoming', color: 'text-blue-400 bg-blue-500/10' },
            live: { label: 'LIVE', color: 'text-red-400 bg-red-500/10' },
            halftime: { label: 'Half Time', color: 'text-yellow-400 bg-yellow-500/10' },
            extra_time: { label: 'Extra Time', color: 'text-orange-400 bg-orange-500/10' },
            penalties: { label: 'Penalties', color: 'text-purple-400 bg-purple-500/10' },
            finished: { label: 'Full Time', color: 'text-green-400 bg-green-500/10' },
        };
        return map[status] || { label: status, color: 'text-white/50 bg-white/5' };
    };

    if (loading) {
        return (
            <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="skeleton h-64 w-full" />
                    <div className="skeleton h-48 w-full" />
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen stadium-bg grid-pattern flex items-center justify-center">
                <p className="text-white/40">No match data available</p>
            </div>
        );
    }

    const statusInfo = getStatusDisplay(match.status);
    const goals = (match.goal_events || []) as GoalEvent[];
    const cards = (match.cards || []) as CardEvent[];

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Match <span className="text-gold-gradient">Center</span>
                    </h1>
                    <p className="text-white/40">FIFA World Cup 2026 Final</p>
                </motion.div>

                {/* Scoreboard */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-6 gradient-border">
                    {/* Status badge */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {match.status === 'live' && <span className="live-dot" />}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        {match.status === 'live' && match.match_minute > 0 && (
                            <span className="text-xs text-white/40">{match.match_minute}&apos;</span>
                        )}
                    </div>

                    {/* Score Display */}
                    <div className="flex items-center justify-center gap-2.5 sm:gap-6 md:gap-12">
                        {/* Argentina */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="flag-wave">
                                <img
                                    src="https://flagcdn.com/w160/ar.png"
                                    alt="Argentina Flag"
                                    className="w-10 h-7 sm:w-16 sm:h-10 object-cover rounded shadow border border-white/10"
                                />
                            </span>
                            <span className="text-sm sm:text-lg md:text-xl font-bold text-white">Argentina</span>
                        </div>

                        {/* Score */}
                        <div className="text-center min-w-[70px]">
                            <div className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-wider">
                                {match.score_home}
                                <span className="text-white/20 mx-1 sm:mx-2">-</span>
                                {match.score_away}
                            </div>
                        </div>

                        {/* Spain */}
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <span className="flag-wave">
                                <img
                                    src="https://flagcdn.com/w160/es.png"
                                    alt="Spain Flag"
                                    className="w-10 h-7 sm:w-16 sm:h-10 object-cover rounded shadow border border-white/10"
                                />
                            </span>
                            <span className="text-sm sm:text-lg md:text-xl font-bold text-white">Spain</span>
                        </div>
                    </div>

                    {/* Goal scorers summary */}
                    {goals.length > 0 && (
                        <div className="flex flex-col md:flex-row justify-center gap-4 mt-6 text-sm">
                            <div className="text-right flex-1">
                                {goals.filter(g => g.team === 'Argentina').map((g, i) => (
                                    <div key={i} className="text-white/60">
                                        {g.player} <span className="text-amber-400">{g.minute}&apos;</span>
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:block text-white/10">|</div>
                            <div className="text-left flex-1">
                                {goals.filter(g => g.team === 'Spain').map((g, i) => (
                                    <div key={i} className="text-white/60">
                                        <span className="text-amber-400">{g.minute}&apos;</span> {g.player}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Match Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Goal Timeline */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            ⚽ Goal Timeline
                        </h3>
                        {goals.length === 0 ? (
                            <p className="text-sm text-white/30 text-center py-4">No goals yet</p>
                        ) : (
                            <div className="space-y-3">
                                {goals.map((goal, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                                        <span className="text-xs font-bold text-amber-400 w-10">{goal.minute}&apos;</span>
                                        <span className="text-sm">⚽</span>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{goal.player}</div>
                                            <div className="text-xs text-white/40">{goal.team} {goal.type !== 'goal' ? `(${goal.type})` : ''}</div>
                                        </div>
                                        <img
                                            src={goal.team === 'Argentina' ? 'https://flagcdn.com/w160/ar.png' : 'https://flagcdn.com/w160/es.png'}
                                            alt={goal.team}
                                            className="w-6 h-4 object-cover rounded shadow border border-white/10"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Match Statistics */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            📊 Match Statistics
                        </h3>
                        <div className="space-y-4">
                            {/* Possession */}
                            <div>
                                <div className="flex justify-between text-sm text-white/60 mb-1">
                                    <span>{match.possession_home}%</span>
                                    <span className="text-white/30">Possession</span>
                                    <span>{match.possession_away}%</span>
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                                    <div className="bg-blue-400/60 transition-all" style={{ width: `${match.possession_home}%` }} />
                                    <div className="bg-red-400/60 transition-all" style={{ width: `${match.possession_away}%` }} />
                                </div>
                            </div>

                            {/* Corners */}
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-lg font-bold text-white">{match.corners_home}</span>
                                <span className="text-sm text-white/30">Corners</span>
                                <span className="text-lg font-bold text-white">{match.corners_away}</span>
                            </div>

                            {/* Shots */}
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-lg font-bold text-white">{match.shots_home}</span>
                                <span className="text-sm text-white/30">Shots</span>
                                <span className="text-lg font-bold text-white">{match.shots_away}</span>
                            </div>

                            {/* Cards */}
                            <div>
                                <div className="text-sm text-white/30 text-center mb-2">Cards</div>
                                {cards.length === 0 ? (
                                    <p className="text-xs text-white/20 text-center">No cards</p>
                                ) : (
                                    <div className="space-y-1">
                                        {cards.map((card, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                                                <span>{card.type === 'yellow' ? '🟨' : '🟥'}</span>
                                                <span>{card.player}</span>
                                                <span className="text-xs text-amber-400">{card.minute}&apos;</span>
                                                <span className="text-xs">({card.team})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Man of the Match */}
                {match.man_of_match && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5 text-center">
                        <span className="text-2xl mb-2 block">🌟</span>
                        <h3 className="text-lg font-semibold text-white mb-1">Man of the Match</h3>
                        <p className="text-xl font-bold text-gold-gradient">{match.man_of_match}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
