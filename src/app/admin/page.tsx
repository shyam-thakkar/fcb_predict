'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { argentinaSquad, spainSquad, allPlayers } from '@/data/squads';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'match' | 'users' | 'analytics';

interface AnalyticsData {
    totalUsers: number;
    totalPredictions: number;
    argentinaPredictions: number;
    spainPredictions: number;
    mostCommonScore: { score: string; count: number } | null;
    mostSelectedFGS: { player: string; count: number } | null;
    mostSelectedMOM: { player: string; count: number } | null;
    avgPredictedGoals: string;
    matchEndsInDistribution: Record<string, number>;
}

interface UserEntry {
    id: string;
    full_name: string;
    username: string;
    mobile: string;
    role: string;
    created_at: string;
    last_login: string | null;
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [match, setMatch] = useState<Record<string, unknown> | null>(null);
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [fotmobMatchId, setFotmobMatchId] = useState('4653858');
    const [syncing, setSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(false);

    // Match edit form
    const [matchForm, setMatchForm] = useState({
        status: 'upcoming',
        score_home: 0,
        score_away: 0,
        match_minute: 0,
        possession_home: 50,
        possession_away: 50,
        corners_home: 0,
        corners_away: 0,
        shots_home: 0,
        shots_away: 0,
        man_of_match: '',
        winner: '',
        final_result: '',
        predictions_locked: false,
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            toast.error('Admin access required');
            router.push('/');
            return;
        }
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!autoSync || !match || !fotmobMatchId) return;

        // Trigger once immediately when turned on
        syncFromFotmob(true);

        const interval = setInterval(() => {
            syncFromFotmob(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [autoSync, fotmobMatchId, match]);

    const loadData = async (silent: boolean = false) => {
        if (!silent) setLoadingData(true);
        try {
            const [matchRes, usersRes, statsRes] = await Promise.all([
                fetch('/api/match'),
                fetch('/api/admin/users'),
                fetch('/api/admin/stats'),
            ]);
            const matchData = await matchRes.json();
            const usersData = await usersRes.json();
            const statsData = await statsRes.json();

            if (matchData.success && matchData.data?.[0]) {
                setMatch(matchData.data[0]);
                const m = matchData.data[0];
                setMatchForm({
                    status: m.status || 'upcoming',
                    score_home: m.score_home || 0,
                    score_away: m.score_away || 0,
                    match_minute: m.match_minute || 0,
                    possession_home: m.possession_home || 50,
                    possession_away: m.possession_away || 50,
                    corners_home: m.corners_home || 0,
                    corners_away: m.corners_away || 0,
                    shots_home: m.shots_home || 0,
                    shots_away: m.shots_away || 0,
                    man_of_match: m.man_of_match || '',
                    winner: m.winner || '',
                    final_result: m.final_result || '',
                    predictions_locked: m.predictions_locked || false,
                });
            }
            if (usersData.success) setUsers(usersData.data || []);
            if (statsData.success) setAnalytics(statsData.data);
        } catch (error) {
            console.error('Failed to load admin data:', error);
            if (!silent) toast.error('Failed to load dashboard data');
        } finally {
            if (!silent) setLoadingData(false);
        }
    };

    const updateMatch = async () => {
        if (!match) return;
        setSaving(true);
        try {
            const res = await fetch('/api/match', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: (match as Record<string, unknown>).id, ...matchForm }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Match updated successfully');
                setMatch(data.data);
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch {
            toast.error('Failed to update match');
        }
        setSaving(false);
    };

    const recalculateLeaderboard = async (silent: boolean = false) => {
        if (!match) return;
        if (!silent) setSaving(true);
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ match_id: (match as Record<string, unknown>).id }),
            });
            const data = await res.json();
            if (data.success) {
                if (!silent) toast.success(data.message || 'Leaderboard recalculated');
            } else {
                if (!silent) toast.error(data.error || 'Recalculation failed');
            }
        } catch {
            if (!silent) toast.error('Failed to recalculate');
        }
        if (!silent) setSaving(false);
    };

    const syncFromFotmob = async (silent: boolean = false) => {
        if (!match || !fotmobMatchId) {
            if (!silent) toast.error('Please enter a valid FotMob Match ID');
            return;
        }
        if (!silent) setSyncing(true);
        try {
            const res = await fetch('/api/admin/match/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: (match as Record<string, unknown>).id,
                    fotmob_match_id: fotmobMatchId
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (!silent) toast.success('Match stats successfully synced from FotMob!');
                await loadData(silent);
                await recalculateLeaderboard(silent);
            } else {
                if (!silent) toast.error(data.error || 'Sync failed');
            }
        } catch {
            if (!silent) toast.error('Failed to connect to sync API');
        }
        if (!silent) setSyncing(false);
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('User deleted');
                setUsers(users.filter(u => u.id !== userId));
            } else {
                toast.error(data.error || 'Delete failed');
            }
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u => {
        if (!userSearch) return true;
        const s = userSearch.toLowerCase();
        return u.username.toLowerCase().includes(s) || u.full_name.toLowerCase().includes(s) || u.mobile.includes(s);
    });

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'match', label: 'Match Control', icon: '⚽' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
    ];

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="skeleton h-16 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin <span className="text-gold-gradient">Dashboard</span></h1>
                        <p className="text-sm text-white/40">Manage match, users, and predictions</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                        ADMIN
                    </span>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && analytics && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: 'text-blue-400' },
                                { label: 'Predictions', value: analytics.totalPredictions, icon: '🎯', color: 'text-green-400' },
                                { label: 'Argentina Picks', value: analytics.argentinaPredictions, icon: '🇦🇷', color: 'text-sky-400' },
                                { label: 'Spain Picks', value: analytics.spainPredictions, icon: '🇪🇸', color: 'text-red-400' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card p-5">
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-white/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-medium text-white/60 mb-3">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between"><span className="text-sm text-white/40">Most Common Score</span><span className="text-sm font-bold text-amber-400">{analytics.mostCommonScore?.score || '—'} ({analytics.mostCommonScore?.count || 0}x)</span></div>
                                    <div className="flex justify-between"><span className="text-sm text-white/40">Top First Goal Scorer Pick</span><span className="text-sm font-bold text-amber-400">{analytics.mostSelectedFGS?.player || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-sm text-white/40">Top MOTM Pick</span><span className="text-sm font-bold text-amber-400">{analytics.mostSelectedMOM?.player || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-sm text-white/40">Avg Predicted Goals</span><span className="text-sm font-bold text-amber-400">{analytics.avgPredictedGoals}</span></div>
                                </div>
                            </div>
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-medium text-white/60 mb-3">Match Ending Predictions</h3>
                                {analytics.matchEndsInDistribution && Object.entries(analytics.matchEndsInDistribution).map(([key, val]) => {
                                    const total = Object.values(analytics.matchEndsInDistribution).reduce((a, b) => a + b, 0);
                                    const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={key} className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white/50">{key}</span>
                                                <span className="text-amber-400 font-bold">{pct}%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Match Control Tab */}
                {activeTab === 'match' && match && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Auto Sync Box */}
                        <div className="glass-card p-6 mb-6">
                            <h3 className="text-lg font-bold text-white mb-2">🔄 Auto Sync Match Data</h3>
                            <p className="text-xs text-white/40 mb-4">
                                Sync real-time statistics (score, corners, possession, shots, events, cards) directly from a match on FotMob using its unique Match ID.
                            </p>
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm text-white/60 mb-1">FotMob Match ID</label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        placeholder="e.g. 4023412"
                                        value={fotmobMatchId}
                                        onChange={(e) => setFotmobMatchId(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => syncFromFotmob()}
                                    disabled={syncing || !fotmobMatchId}
                                    className="btn-primary w-full md:w-auto px-6 py-2.5 h-[42px] disabled:opacity-50 cursor-pointer"
                                >
                                    {syncing ? 'Syncing...' : 'Fetch & Sync Data'}
                                </button>
                            </div>

                            {/* Auto Sync Toggle */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoSync}
                                        onChange={(e) => setAutoSync(e.target.checked)}
                                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        ⏱️ Auto-Sync (Every 10 Seconds)
                                        {autoSync && (
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                        )}
                                    </span>
                                </label>
                                {autoSync && (
                                    <span className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-widest animate-pulse">
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 mb-6">
                            <h3 className="text-lg font-bold text-white mb-6">⚽ Match Control Panel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Match Status</label>
                                    <select className="form-select" value={matchForm.status} onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="live">Live</option>
                                        <option value="halftime">Half Time</option>
                                        <option value="extra_time">Extra Time</option>
                                        <option value="penalties">Penalties</option>
                                        <option value="finished">Finished</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Match Minute</label>
                                    <input type="number" className="form-input" value={matchForm.match_minute} onChange={(e) => setMatchForm({ ...matchForm, match_minute: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">🇦🇷 Argentina Score</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.score_home} onChange={(e) => setMatchForm({ ...matchForm, score_home: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">🇪🇸 Spain Score</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.score_away} onChange={(e) => setMatchForm({ ...matchForm, score_away: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Possession 🇦🇷</label>
                                    <input type="number" className="form-input" min="0" max="100" value={matchForm.possession_home} onChange={(e) => setMatchForm({ ...matchForm, possession_home: parseInt(e.target.value) || 50, possession_away: 100 - (parseInt(e.target.value) || 50) })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Possession 🇪🇸</label>
                                    <input type="number" className="form-input" min="0" max="100" value={matchForm.possession_away} disabled />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Corners 🇦🇷</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.corners_home} onChange={(e) => setMatchForm({ ...matchForm, corners_home: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Corners 🇪🇸</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.corners_away} onChange={(e) => setMatchForm({ ...matchForm, corners_away: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Shots 🇦🇷</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.shots_home} onChange={(e) => setMatchForm({ ...matchForm, shots_home: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Shots 🇪🇸</label>
                                    <input type="number" className="form-input" min="0" value={matchForm.shots_away} onChange={(e) => setMatchForm({ ...matchForm, shots_away: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Winner</label>
                                    <select className="form-select" value={matchForm.winner} onChange={(e) => setMatchForm({ ...matchForm, winner: e.target.value })}>
                                        <option value="">Not decided</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Spain">Spain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Final Result</label>
                                    <select className="form-select" value={matchForm.final_result} onChange={(e) => setMatchForm({ ...matchForm, final_result: e.target.value })}>
                                        <option value="">Not decided</option>
                                        <option value="90 Minutes">90 Minutes</option>
                                        <option value="Extra Time">Extra Time</option>
                                        <option value="Penalties">Penalties</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-white/60 mb-1">Man of the Match</label>
                                    <select className="form-select" value={matchForm.man_of_match} onChange={(e) => setMatchForm({ ...matchForm, man_of_match: e.target.value })}>
                                        <option value="">Select player</option>
                                        <optgroup label="🇦🇷 Argentina">
                                            {argentinaSquad.players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        </optgroup>
                                        <optgroup label="🇪🇸 Spain">
                                            {spainSquad.players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={matchForm.predictions_locked} onChange={(e) => setMatchForm({ ...matchForm, predictions_locked: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                                        <span className="text-sm text-white/60">🔒 Lock Predictions</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={updateMatch} disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : '💾 Save Match Data'}
                                </button>
                                <button onClick={() => recalculateLeaderboard()} disabled={saving} className="btn-secondary flex-1">
                                    🔄 Recalculate Leaderboard
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="mb-4">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="🔍 Search by name, username, or mobile..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </div>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Username</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase hidden md:table-cell">Full Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase hidden md:table-cell">Mobile</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase hidden lg:table-cell">Registered</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-white/[0.02]">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                                                            {u.username[0].toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-white">{u.username}</span>
                                                        {u.role === 'admin' && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Admin</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white/50 hidden md:table-cell">{u.full_name}</td>
                                                <td className="px-4 py-3 text-sm text-white/50 hidden md:table-cell">{u.mobile}</td>
                                                <td className="px-4 py-3 text-sm text-white/30 hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10">
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-8 text-white/40 text-sm">No users found</div>
                            )}
                        </div>
                        <div className="mt-2 text-sm text-white/30">{filteredUsers.length} users</div>
                    </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Winner Distribution */}
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-medium text-white/60 mb-4">🏆 Winner Predictions</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">🇦🇷 Argentina</span>
                                            <span className="text-amber-400 font-bold">
                                                {analytics.totalPredictions > 0 ? ((analytics.argentinaPredictions / analytics.totalPredictions) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all" style={{ width: `${analytics.totalPredictions > 0 ? (analytics.argentinaPredictions / analytics.totalPredictions) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/60">🇪🇸 Spain</span>
                                            <span className="text-amber-400 font-bold">
                                                {analytics.totalPredictions > 0 ? ((analytics.spainPredictions / analytics.totalPredictions) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all" style={{ width: `${analytics.totalPredictions > 0 ? (analytics.spainPredictions / analytics.totalPredictions) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-medium text-white/60 mb-4">📊 Key Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 rounded bg-white/[0.02]">
                                        <span className="text-sm text-white/50">Most Common Score</span>
                                        <span className="text-sm font-bold text-white">{analytics.mostCommonScore?.score || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded bg-white/[0.02]">
                                        <span className="text-sm text-white/50">Top FGS Pick</span>
                                        <span className="text-sm font-bold text-white">{analytics.mostSelectedFGS?.player || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded bg-white/[0.02]">
                                        <span className="text-sm text-white/50">Top MOTM Pick</span>
                                        <span className="text-sm font-bold text-white">{analytics.mostSelectedMOM?.player || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded bg-white/[0.02]">
                                        <span className="text-sm text-white/50">Avg Goals Predicted</span>
                                        <span className="text-sm font-bold text-white">{analytics.avgPredictedGoals}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Match End Distribution */}
                            <div className="glass-card p-5 md:col-span-2">
                                <h3 className="text-sm font-medium text-white/60 mb-4">⏱️ Match Ending Predictions</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(analytics.matchEndsInDistribution || {}).map(([key, val]) => {
                                        const total = Object.values(analytics.matchEndsInDistribution).reduce((a, b) => a + b, 0);
                                        const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
                                        const icons: Record<string, string> = { '90 Minutes': '⏱️', 'Extra Time': '⏳', 'Penalties': '🎯' };
                                        return (
                                            <div key={key} className="text-center p-4 rounded-xl bg-white/[0.02]">
                                                <div className="text-3xl mb-2">{icons[key] || '📊'}</div>
                                                <div className="text-2xl font-bold text-amber-400">{pct}%</div>
                                                <div className="text-xs text-white/40 mt-1">{key}</div>
                                                <div className="text-xs text-white/20">{val} votes</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
