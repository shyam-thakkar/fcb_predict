export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">⚽</span>
                            <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                                FCB AHMEDABD
                            </span>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed">
                            The ultimate prediction platform for the FIFA World Cup 2026 Final.
                            Predict, compete, and win!
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Quick Links</h3>
                        <div className="space-y-2">
                            {[
                                { href: '/predict', label: 'Make Prediction' },
                                { href: '/leaderboard', label: 'Leaderboard' },
                                { href: '/rules', label: 'Rules' },
                                { href: '/hall-of-fame', label: 'Hall of Fame' },
                            ].map(link => (
                                <a key={link.href} href={link.href} className="block text-sm text-white/40 hover:text-amber-400 transition-colors">
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Match Info</h3>
                        <div className="space-y-2 text-sm text-white/40">
                            <p>🇦🇷 Argentina vs Spain 🇪🇸</p>
                            <p>FIFA World Cup 2026 Final</p>
                            <p>MetLife Stadium, New Jersey</p>
                            <p>July 19, 2026</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/30">
                    <p>© 2026 FCB AHMEDABD. Made with ❤️ for football fans.</p>
                </div>
            </div>
        </footer>
    );
}
