'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    targetDate: Date;
    onComplete?: () => void;
    compact?: boolean;
}

export default function CountdownTimer({ targetDate, onComplete, compact = false }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    function calculateTimeLeft() {
        const difference = targetDate.getTime() - new Date().getTime();
        if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
                setIsExpired(true);
                clearInterval(timer);
                onComplete?.();
            }
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetDate]);

    if (isExpired) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xl">
                    <span>🔒</span>
                    <span>Predictions are now closed</span>
                </div>
            </motion.div>
        );
    }

    const units = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    if (compact) {
        return (
            <div className="flex items-center gap-1 text-sm font-mono">
                <span className="text-amber-400">⏱</span>
                <span className="text-white/80">
                    {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h{' '}
                    {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
            </div>
        );
    }

    return (
        <div className="flex gap-3 md:gap-4 justify-center">
            {units.map((unit, i) => (
                <motion.div
                    key={unit.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                            <motion.span
                                key={unit.value}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-2xl md:text-3xl font-bold text-white font-mono"
                            >
                                {String(unit.value).padStart(2, '0')}
                            </motion.span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full opacity-60" />
                    </div>
                    <span className="mt-3 text-xs md:text-sm text-white/50 uppercase tracking-wider">{unit.label}</span>
                </motion.div>
            ))}
        </div>
    );
}
