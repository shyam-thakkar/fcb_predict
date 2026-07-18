'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const predictionLockDate = new Date('2026-07-20T00:30:00+05:30');

  return (
    <div className="stadium-bg grid-pattern">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-20">
          {/* FCB Ahmedabad Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.05 }}
            className="flex justify-center mb-6"
          >
            <img
              src="/logo.png"
              alt="FCB Ahmedabad Logo"
              className="w-32 md:w-40 h-32 md:h-40 object-contain filter drop-shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 transition-transform duration-300"
            />
          </motion.div>

          {/* Tournament Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8"
          >
            <span className="live-dot" />
            FIFA World Cup 2026 Final
          </motion.div>

          {/* Match Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-6">
              {/* Argentina */}
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <motion.div
                  className="flag-wave"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <img
                    src="https://flagcdn.com/w160/ar.png"
                    alt="Argentina Flag"
                    className="w-12 h-8 md:w-16 md:h-10 object-cover rounded shadow-lg border border-white/10"
                  />
                </motion.div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-4xl font-bold text-white">Argentina</div>
                  <div className="text-sm text-white/40">Defending Champions</div>
                </div>
              </div>

              {/* VS */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-md border border-amber-500/20 flex items-center justify-center shrink-0"
              >
                <span className="text-xl md:text-2xl font-black text-gold-gradient">VS</span>
              </motion.div>

              {/* Spain */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-3 md:gap-4">
                <div className="text-center md:text-right">
                  <div className="text-2xl md:text-4xl font-bold text-white">Spain</div>
                  <div className="text-sm text-white/40">Euro 2024 Champions</div>
                </div>
                <motion.div
                  className="flag-wave"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <img
                    src="https://flagcdn.com/w160/es.png"
                    alt="Spain Flag"
                    className="w-12 h-8 md:w-16 md:h-10 object-cover rounded shadow-lg border border-white/10"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto"
          >
            Predict the outcome. Compete with fans worldwide. Climb the leaderboard and prove you&apos;re the ultimate football oracle.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <p className="text-sm text-white/40 mb-4 uppercase tracking-widest">Predictions close in</p>
            <CountdownTimer targetDate={predictionLockDate} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <>
                <Link href="/predict" className="btn-primary text-lg px-8 py-3 shadow-lg shadow-amber-500/20">
                  🎯 Make Your Prediction
                </Link>
                <Link href="/leaderboard" className="btn-secondary text-lg px-8 py-3">
                  🏆 View Leaderboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-lg px-8 py-3 shadow-lg shadow-amber-500/20">
                  🚀 Register & Predict
                </Link>
                <Link href="/login" className="btn-secondary text-lg px-8 py-3">
                  Already have an account?
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            How It <span className="text-gold-gradient">Works</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/40 mb-16 max-w-xl mx-auto"
          >
            Three simple steps to join the ultimate prediction challenge
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📝',
                title: 'Register',
                description: 'Create your account with a unique username. One account per person, fair and square.',
                color: 'from-blue-500/20 to-cyan-500/10',
              },
              {
                icon: '🎯',
                title: 'Predict',
                description: 'Predict the match winner, exact score, first goal scorer, and 10 more categories. Up to 105 points!',
                color: 'from-amber-500/20 to-orange-500/10',
              },
              {
                icon: '🏆',
                title: 'Compete',
                description: 'Watch the live leaderboard update as the match unfolds. Earn badges and claim your spot!',
                color: 'from-green-500/20 to-emerald-500/10',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Points Breakdown */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Points <span className="text-gold-gradient">Breakdown</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/40 mb-12"
          >
            Maximum 105 points available across 13 prediction categories
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { category: 'Match Winner', points: 15, icon: '👑' },
              { category: 'Exact Score', points: 10, icon: '🎯' },
              { category: 'First Team To Score', points: 10, icon: '⚡' },
              { category: 'First Goal Scorer', points: 10, icon: '⚽' },
              { category: 'Man of the Match', points: 10, icon: '🌟' },
              { category: 'Match Ends In', points: 10, icon: '⏱️' },
              { category: 'Last Goal Scorer', points: 10, icon: '🎯' },
              { category: 'Total Goals', points: 5, icon: '📊' },
              { category: 'Both Teams Score', points: 5, icon: '🤝' },
              { category: 'Yellow Cards', points: 5, icon: '🟨' },
              { category: 'Red Card', points: 5, icon: '🟥' },
              { category: 'Possession', points: 5, icon: '📈' },
              { category: 'Total Corners', points: 5, icon: '🏁' },
            ].map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-white/70">{item.category}</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{item.points} pts</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-center p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          >
            <span className="text-2xl font-bold text-gold-gradient">Total: 105 Points</span>
          </motion.div>
        </div>
      </section>

      {/* FCB Ahmedabad Supporters Club Section */}
      <section className="py-20 px-4 border-t border-white/5 bg-slate-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Flag Image Display */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="md:col-span-6 relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img
                src="/flag.png"
                alt="FCB Ahmedabad Flag"
                className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold text-lg">FCB Ahmedabad Official Flag</p>
              </div>
            </motion.div>

            {/* Club Description info text */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="md:col-span-6 flex flex-col gap-4 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold w-fit uppercase tracking-widest">
                Supporters Club
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Culés of Ahmedabad
              </h2>
              <p className="text-white/60 leading-relaxed">
                FCB Ahmedabad is the heartbeat of FC Barcelona supporters in Ahmedabad, Gujarat. We unite fans across the city to celebrate football, witness historic matchdays together, and share our deep passion for the Blaugrana philosophy.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-2xl mb-1">🔴🔵</div>
                  <div className="text-sm font-semibold text-white">Blaugrana Spirit</div>
                  <div className="text-xs text-white/40">Més que un club</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-2xl mb-1">🏟️</div>
                  <div className="text-sm font-semibold text-white">Local Hub</div>
                  <div className="text-xs text-white/40">Screenings & Events</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
