'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CountdownTimer from '@/components/CountdownTimer';
import { argentinaSquad, spainSquad, allPlayers } from '@/data/squads';
import toast from 'react-hot-toast';

export default function PredictPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [matchId, setMatchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingPrediction, setExistingPrediction] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const predictionLockDate = new Date('2026-07-20T00:30:00+05:30');

    const [prediction, setPrediction] = useState({
        winner: '',
        score_home: '',
        score_away: '',
        first_team_to_score: '',
        first_goal_scorer: '',
        man_of_match: '',
        total_goals: '',
        match_ends_in: '',
        both_teams_score: '',
        yellow_cards: '',
        red_card: '',
        possession: '',
        corners: '',
        last_goal_scorer: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Please login to make a prediction');
            router.push('/login');
            return;
        }

        // Check if locked
        if (new Date() >= predictionLockDate) {
            setIsLocked(true);
        }

        // Fetch match
        fetch('/api/match')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data?.length > 0) {
                    setMatchId(data.data[0].id);
                    if (data.data[0].predictions_locked) setIsLocked(true);
                }
            });

        // Check existing prediction
        if (user) {
            fetch('/api/predictions')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.data?.length > 0) {
                        setExistingPrediction(true);
                        // Populate form with existing data for read-only view
                        const p = data.data[0];
                        setPrediction({
                            winner: p.winner || '',
                            score_home: String(p.score_home ?? ''),
                            score_away: String(p.score_away ?? ''),
                            first_team_to_score: p.first_team_to_score || '',
                            first_goal_scorer: p.first_goal_scorer || '',
                            man_of_match: p.man_of_match || '',
                            total_goals: String(p.total_goals ?? ''),
                            match_ends_in: p.match_ends_in || '',
                            both_teams_score: p.both_teams_score || '',
                            yellow_cards: String(p.yellow_cards ?? ''),
                            red_card: p.red_card || '',
                            possession: p.possession || '',
                            corners: String(p.corners ?? ''),
                            last_goal_scorer: p.last_goal_scorer || '',
                        });
                    }
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked || existingPrediction) return;
        if (!matchId) {
            toast.error('Match not found. Please try again.');
            return;
        }

        // Validate all fields
        for (const [key, value] of Object.entries(prediction)) {
            if (value === '') {
                toast.error(`Please fill in all prediction fields (${key.replace(/_/g, ' ')})`);
                return;
            }
        }

        setLoading(true);
        try {
            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: matchId,
                    ...prediction,
                    score_home: parseInt(prediction.score_home),
                    score_away: parseInt(prediction.score_away),
                    yellow_cards: parseInt(prediction.yellow_cards),
                    corners: parseInt(prediction.corners),
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('🎯 Prediction submitted successfully!');
                setExistingPrediction(true);
            } else {
                toast.error(data.error || 'Failed to submit prediction');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    const readOnly = isLocked || existingPrediction;

    if (authLoading) {
        return (
            <div className="min-h-screen stadium-bg flex items-center justify-center">
                <div className="skeleton w-96 h-96" />
            </div>
        );
    }

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Make Your <span className="text-gold-gradient">Prediction</span>
                    </h1>
                    <p className="text-white/40 mb-4">
                        🇦🇷 Argentina vs Spain 🇪🇸 — FIFA World Cup 2026 Final
                    </p>

                    {/* Status */}
                    {existingPrediction && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            ✅ Your prediction has been submitted
                        </div>
                    )}
                    {isLocked && !existingPrediction && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            🔒 Predictions are now closed
                        </div>
                    )}
                    {!isLocked && !existingPrediction && (
                        <div className="mt-4">
                            <p className="text-xs text-white/30 mb-2">Predictions close in:</p>
                            <CountdownTimer targetDate={predictionLockDate} compact onComplete={() => setIsLocked(true)} />
                        </div>
                    )}
                </motion.div>

                {/* Prediction Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* 1. Match Winner */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">1</span>
                                    Who will win the FIFA World Cup Final?
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">15 pts</span>
                            </div>
                            <select className="form-select" value={prediction.winner} onChange={(e) => setPrediction({ ...prediction, winner: e.target.value })} disabled={readOnly}>
                                <option value="">Select winner</option>
                                <option value="Argentina">🇦🇷 Argentina</option>
                                <option value="Spain">🇪🇸 Spain</option>
                            </select>
                        </motion.div>

                        {/* 2. Exact Score */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">2</span>
                                    Predict the exact score
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-white/40 mb-1 block">🇦🇷 Argentina</label>
                                    <select className="form-select" value={prediction.score_home} onChange={(e) => setPrediction({ ...prediction, score_home: e.target.value })} disabled={readOnly}>
                                        <option value="">Goals</option>
                                        {Array.from({ length: 1001 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <span className="text-white/30 text-2xl font-bold mt-5">-</span>
                                <div className="flex-1">
                                    <label className="text-xs text-white/40 mb-1 block">🇪🇸 Spain</label>
                                    <select className="form-select" value={prediction.score_away} onChange={(e) => setPrediction({ ...prediction, score_away: e.target.value })} disabled={readOnly}>
                                        <option value="">Goals</option>
                                        {Array.from({ length: 1001 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. First Team To Score */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">3</span>
                                    First team to score
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <select className="form-select" value={prediction.first_team_to_score} onChange={(e) => setPrediction({ ...prediction, first_team_to_score: e.target.value })} disabled={readOnly}>
                                <option value="">Select team</option>
                                <option value="Argentina">🇦🇷 Argentina</option>
                                <option value="Spain">🇪🇸 Spain</option>
                            </select>
                        </motion.div>

                        {/* 4. First Goal Scorer */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">4</span>
                                    First goal scorer
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <select className="form-select" value={prediction.first_goal_scorer} onChange={(e) => setPrediction({ ...prediction, first_goal_scorer: e.target.value })} disabled={readOnly}>
                                <option value="">Select player</option>
                                <optgroup label="🇦🇷 Argentina">
                                    {argentinaSquad.players.filter(p => p.position !== 'GK').map(p => (
                                        <option key={`arg-fgs-${p.name}`} value={p.name}>{p.name} ({p.position})</option>
                                    ))}
                                </optgroup>
                                <optgroup label="🇪🇸 Spain">
                                    {spainSquad.players.filter(p => p.position !== 'GK').map(p => (
                                        <option key={`sp-fgs-${p.name}`} value={p.name}>{p.name} ({p.position})</option>
                                    ))}
                                </optgroup>
                            </select>
                        </motion.div>

                        {/* 5. Man of the Match */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">5</span>
                                    Man of the Match
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <select className="form-select" value={prediction.man_of_match} onChange={(e) => setPrediction({ ...prediction, man_of_match: e.target.value })} disabled={readOnly}>
                                <option value="">Select player</option>
                                <optgroup label="🇦🇷 Argentina">
                                    {argentinaSquad.players.map(p => (
                                        <option key={`arg-mom-${p.name}`} value={p.name}>{p.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="🇪🇸 Spain">
                                    {spainSquad.players.map(p => (
                                        <option key={`sp-mom-${p.name}`} value={p.name}>{p.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </motion.div>

                        {/* 6. Total Goals */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">6</span>
                                    Total goals in the match
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.total_goals} onChange={(e) => setPrediction({ ...prediction, total_goals: e.target.value })} disabled={readOnly}>
                                <option value="">Select total</option>
                                {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                <option value="7+">7+</option>
                            </select>
                        </motion.div>

                        {/* 7. Match Ends In */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">7</span>
                                    How will the match end?
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <select className="form-select" value={prediction.match_ends_in} onChange={(e) => setPrediction({ ...prediction, match_ends_in: e.target.value })} disabled={readOnly}>
                                <option value="">Select option</option>
                                <option value="90 Minutes">90 Minutes (Normal Time)</option>
                                <option value="Extra Time">Extra Time</option>
                                <option value="Penalties">Penalties</option>
                            </select>
                        </motion.div>

                        {/* 8. Both Teams Score */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">8</span>
                                    Both teams to score?
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.both_teams_score} onChange={(e) => setPrediction({ ...prediction, both_teams_score: e.target.value })} disabled={readOnly}>
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </motion.div>

                        {/* 9. Yellow Cards */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">9</span>
                                    Total yellow cards
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.yellow_cards} onChange={(e) => setPrediction({ ...prediction, yellow_cards: e.target.value })} disabled={readOnly}>
                                <option value="">Select</option>
                                {Array.from({ length: 1001 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </motion.div>

                        {/* 10. Red Card */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">10</span>
                                    Will there be a red card?
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.red_card} onChange={(e) => setPrediction({ ...prediction, red_card: e.target.value })} disabled={readOnly}>
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </motion.div>

                        {/* 11. Possession */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">11</span>
                                    Team with most possession
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.possession} onChange={(e) => setPrediction({ ...prediction, possession: e.target.value })} disabled={readOnly}>
                                <option value="">Select team</option>
                                <option value="Argentina">🇦🇷 Argentina</option>
                                <option value="Spain">🇪🇸 Spain</option>
                            </select>
                        </motion.div>

                        {/* 12. Corners */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">12</span>
                                    Total corners in the match
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">5 pts</span>
                            </div>
                            <select className="form-select" value={prediction.corners} onChange={(e) => setPrediction({ ...prediction, corners: e.target.value })} disabled={readOnly}>
                                <option value="">Select</option>
                                {Array.from({ length: 1001 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </motion.div>

                        {/* 13. Last Goal Scorer */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">13</span>
                                    Last goal scorer
                                </h3>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">10 pts</span>
                            </div>
                            <select className="form-select" value={prediction.last_goal_scorer} onChange={(e) => setPrediction({ ...prediction, last_goal_scorer: e.target.value })} disabled={readOnly}>
                                <option value="">Select player</option>
                                <optgroup label="🇦🇷 Argentina">
                                    {argentinaSquad.players.filter(p => p.position !== 'GK').map(p => (
                                        <option key={`arg-lgs-${p.name}`} value={p.name}>{p.name} ({p.position})</option>
                                    ))}
                                </optgroup>
                                <optgroup label="🇪🇸 Spain">
                                    {spainSquad.players.filter(p => p.position !== 'GK').map(p => (
                                        <option key={`sp-lgs-${p.name}`} value={p.name}>{p.name} ({p.position})</option>
                                    ))}
                                </optgroup>
                            </select>
                        </motion.div>

                        {/* Submit Button */}
                        {!readOnly && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.75 }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-4 text-lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : (
                                        '🎯 Submit My Prediction'
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
