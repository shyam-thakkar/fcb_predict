'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface CardData {
    id: string;
    user_id: string;
    card_design: string;
    card_number: string;
    is_collected: boolean;
    assigned_at: string;
    collected_at: string | null;
}

const CARD_INFO: Record<string, { name: string; front: string; description: string; gradient: string }> = {
    messi_white: {
        name: 'Messi — The Last Dance',
        front: '/cards/card_messi_white.png',
        description: 'Tango — The Last Dance of the GOAT',
        gradient: 'from-slate-300 via-white to-slate-200',
    },
    messi_barca: {
        name: 'Messi — Barça Legend',
        front: '/cards/card_messi_barca.png',
        description: 'Blaugrana Forever — FCB Ahmedabad',
        gradient: 'from-[#a50044] via-[#004d98] to-[#a50044]',
    },
    messi_goat: {
        name: 'Messi — G.O.A.T.',
        front: '/cards/card_messi_goat.png',
        description: '#10 — The Greatest of All Time',
        gradient: 'from-sky-400 via-blue-500 to-cyan-400',
    },
};

export default function CardsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [card, setCard] = useState<CardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [revealComplete, setRevealComplete] = useState(false);
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchCard();
        }
    }, [user, authLoading, router]);

    // Sparkle effect generator
    useEffect(() => {
        if (revealComplete) {
            const newSparkles = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2,
                size: Math.random() * 4 + 2,
            }));
            setSparkles(newSparkles);
        }
    }, [revealComplete]);

    const fetchCard = async () => {
        try {
            const res = await fetch('/api/cards');
            const data = await res.json();
            if (data.success && data.data) {
                setCard(data.data);
                setRevealComplete(true);
            }
        } catch {
            console.error('Failed to fetch card');
        } finally {
            setLoading(false);
        }
    };

    const claimCard = async () => {
        setClaiming(true);
        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                setCard(data.data);
                setShowReveal(true);
                // Start reveal animation sequence
                setTimeout(() => {
                    setIsFlipped(true);
                    setTimeout(() => {
                        setRevealComplete(true);
                    }, 1200);
                }, 800);
            } else {
                toast.error(data.error || 'Failed to claim card');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    const cardInfo = card ? CARD_INFO[card.card_design] : null;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen stadium-bg grid-pattern flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm">Loading your card...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen stadium-bg grid-pattern py-8 px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.02] blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        SCREENING EXCLUSIVE
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        FCB Ahmedabad <span className="text-gold-gradient">Cards</span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Claim your exclusive collector&apos;s card and pick it up at the screening event
                    </p>
                </motion.div>

                {/* Card Display Area */}
                {!card && !showReveal && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        {/* Preview of card backs */}
                        <div className="relative mb-12">
                            <div className="flex items-center justify-center gap-[-20px]">
                                {/* Stacked card backs */}
                                <motion.div
                                    animate={{ rotate: [-8, -8], y: [0, -5, 0] }}
                                    transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                                    className="relative w-[200px] h-[280px] md:w-[240px] md:h-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 -mr-16"
                                    style={{ zIndex: 1 }}
                                >
                                    <Image src="/cards/card_back.png" alt="Card Back" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: [0, 0], y: [0, -8, 0] }}
                                    transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }}
                                    className="relative w-[220px] h-[310px] md:w-[260px] md:h-[370px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
                                    style={{ zIndex: 2 }}
                                >
                                    <Image src="/cards/card_back.png" alt="Card Back" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                                    {/* Glowing border */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/30" />
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: [8, 8], y: [0, -5, 0] }}
                                    transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } }}
                                    className="relative w-[200px] h-[280px] md:w-[240px] md:h-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 -ml-16"
                                    style={{ zIndex: 1 }}
                                >
                                    <Image src="/cards/card_back.png" alt="Card Back" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Claim Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={claimCard}
                            disabled={claiming}
                            className="relative group px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-[#0a0e1a] shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {claiming ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                                        Assigning Your Card...
                                    </>
                                ) : (
                                    <>
                                        🎴 Claim Your Card
                                    </>
                                )}
                            </span>
                            {/* Button glow animation */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
                        </motion.button>

                        <p className="text-white/30 text-xs mt-4 text-center max-w-sm">
                            You&apos;ll be randomly assigned one of 3 exclusive Messi collector&apos;s cards.
                            Collect your physical card at the screening venue.
                        </p>

                        {/* Card Designs Preview */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-16 w-full"
                        >
                            <h3 className="text-center text-sm font-medium text-white/30 mb-6 uppercase tracking-wider">3 Exclusive Designs</h3>
                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                {Object.entries(CARD_INFO).map(([key, info], i) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.15 }}
                                        className="relative aspect-[2/3] rounded-xl overflow-hidden opacity-40 hover:opacity-70 transition-opacity duration-300"
                                    >
                                        <Image src={info.front} alt={info.name} fill className="object-cover blur-sm hover:blur-none transition-all duration-500" />
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="absolute bottom-0 inset-x-0 p-2">
                                            <p className="text-[10px] text-white/60 text-center font-medium">???</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Card Reveal Animation */}
                {showReveal && card && cardInfo && !revealComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative" style={{ perspective: '1200px' }}>
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 1.2, ease: [0.68, -0.6, 0.32, 1.6] }}
                                className="relative w-[280px] h-[400px] md:w-[320px] md:h-[460px]"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Back of card */}
                                <div
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <Image src="/cards/card_back.png" alt="Card Back" fill className="object-cover" />
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/40" />
                                </div>

                                {/* Front of card */}
                                <div
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <Image src={cardInfo.front} alt={cardInfo.name} fill className="object-cover" />
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/40" />
                                </div>
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/40 text-sm mt-6"
                        >
                            {isFlipped ? 'Revealing your card...' : 'Shuffling...'}
                        </motion.p>
                    </motion.div>
                )}

                {/* Card Revealed - Final State */}
                {revealComplete && card && cardInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex flex-col items-center"
                    >
                        {/* Sparkle effects */}
                        <div className="absolute inset-0 pointer-events-none">
                            {sparkles.map((sparkle) => (
                                <motion.div
                                    key={sparkle.id}
                                    className="absolute w-1 h-1 bg-amber-400 rounded-full"
                                    style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, sparkle.size / 2, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: sparkle.delay,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Card with holographic effect */}
                        <motion.div
                            className="relative group cursor-pointer"
                            whileHover={{ scale: 1.02, rotateY: 5 }}
                            style={{ perspective: '1000px' }}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div
                                className="relative w-[280px] h-[400px] md:w-[320px] md:h-[460px]"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                            >
                                {/* Front of card */}
                                <div
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <Image src={cardInfo.front} alt={cardInfo.name} fill className="object-cover" />
                                    {/* Holographic overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />
                                </div>

                                {/* Back of card */}
                                <div
                                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <Image src="/cards/card_back.png" alt="Card Back" fill className="object-cover" />
                                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/30" />
                                </div>
                            </div>

                            {/* Card glow */}
                            <div className="absolute -inset-4 rounded-3xl bg-amber-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                        </motion.div>

                        <p className="text-white/30 text-xs mt-2 mb-6">Tap card to flip</p>

                        {/* Card Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 w-full max-w-md text-center"
                        >
                            <h2 className="text-xl font-bold text-white mb-1">{cardInfo.name}</h2>
                            <p className="text-white/40 text-sm mb-4">{cardInfo.description}</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <span className="text-sm text-white/50">Card Number</span>
                                    <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">{card.card_number}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <span className="text-sm text-white/50">Status</span>
                                    <span className={`text-sm font-semibold flex items-center gap-2 ${card.is_collected ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${card.is_collected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                                        {card.is_collected ? 'Collected ✓' : 'Ready for Pickup'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <span className="text-sm text-white/50">Assigned</span>
                                    <span className="text-sm text-white/70">{new Date(card.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            {!card.is_collected && (
                                <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-amber-400 text-sm font-medium">📍 Show this card at the screening venue</p>
                                    <p className="text-amber-400/60 text-xs mt-1">Present your card number to collect the physical card</p>
                                </div>
                            )}

                            {card.is_collected && (
                                <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-emerald-400 text-sm font-medium">🎉 Card Collected!</p>
                                    <p className="text-emerald-400/60 text-xs mt-1">
                                        Collected on {card.collected_at ? new Date(card.collected_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
