'use client';
import { motion } from 'framer-motion';

export default function RulesPage() {
    const rules = [
        { icon: '📝', title: 'Registration Required', description: 'Every user must register before participating. One account per mobile number.' },
        { icon: '👤', title: 'Unique Username', description: 'Every username must be unique. No two users can have the same username.' },
        { icon: '🎯', title: 'One Prediction', description: 'One prediction per registered account. Choose wisely!' },
        { icon: '🔒', title: 'Prediction Deadline', description: 'Predictions automatically close on 20 July 2026 at 12:30 AM IST. No late entries accepted.' },
        { icon: '✏️', title: 'No Edits After Submission', description: 'Predictions cannot be edited after submission or after the lock time.' },
        { icon: '🚫', title: 'Fair Play', description: 'Duplicate or fraudulent accounts may be removed by admin.' },
        { icon: '📊', title: 'Live Updates', description: 'The leaderboard updates automatically during the match as results come in.' },
        { icon: '⚖️', title: 'Admin Decisions', description: 'Admin decisions are final in all matters.' },
    ];

    const tieBreakRules = [
        { priority: 1, rule: 'Exact Score Prediction' },
        { priority: 2, rule: 'Match Winner Prediction' },
        { priority: 3, rule: 'First Goal Scorer Prediction' },
        { priority: 4, rule: 'Man of the Match Prediction' },
        { priority: 5, rule: 'Earlier Submission Time' },
    ];

    const pointsTable = [
        { category: 'Match Winner', points: 15 },
        { category: 'Exact Score Prediction', points: 10 },
        { category: 'First Team To Score', points: 10 },
        { category: 'First Goal Scorer', points: 10 },
        { category: 'Man of the Match', points: 10 },
        { category: 'Match Ends In', points: 10 },
        { category: 'Last Goal Scorer', points: 10 },
        { category: 'Total Goals', points: 5 },
        { category: 'Both Teams To Score', points: 5 },
        { category: 'Total Yellow Cards', points: 5 },
        { category: 'Red Card', points: 5 },
        { category: 'Team With Most Possession', points: 5 },
        { category: 'Total Corners', points: 5 },
    ];

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Contest <span className="text-gold-gradient">Rules</span>
                    </h1>
                    <p className="text-white/40">Read carefully before making your prediction</p>
                </motion.div>

                {/* Rules */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">📋 General Rules</h2>
                    <div className="space-y-4">
                        {rules.map((rule, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                            >
                                <span className="text-2xl">{rule.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">{rule.title}</h3>
                                    <p className="text-sm text-white/50">{rule.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Points Table */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">🏆 Points System</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-white/50">Category</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-white/50">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {pointsTable.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 text-sm text-white/70">{item.category}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-bold text-amber-400">{item.points} pts</span>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-amber-500/5">
                                    <td className="px-4 py-3 text-base font-bold text-white">Total Maximum</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-base font-bold text-gold-gradient">105 pts</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Tie-Break */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-6">⚖️ Tie-Break Rules</h2>
                    <p className="text-sm text-white/40 mb-4">If multiple users finish with the same points, ranking is decided in this order:</p>
                    <div className="space-y-3">
                        {tieBreakRules.map((tb, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]"
                            >
                                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                                    {tb.priority}
                                </span>
                                <span className="text-sm text-white/70">{tb.rule}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
