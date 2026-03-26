import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Zap, Star, BookOpen, Sparkles } from 'lucide-react';

// --- Authenticated Hero ---

const AuthenticatedHero: React.FC = () => {
    const { user, profile } = useAuth();
    const username = user?.email?.split('@')[0] || 'Acolyte';
    const isLowCredits = (profile?.credits ?? 50) < 10;

    return (
        <section className="px-6 py-20 md:py-32 lg:px-20 max-w-[1400px] mx-auto">
            <div className="flex flex-col gap-16">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="flex flex-col gap-6"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-ink/40 dark:text-white/40">
                        Welcome back
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-[1.05] text-ink dark:text-white">
                        The spirits<br />
                        <span className="font-bold italic">await you,</span><br />
                        <span className="text-4xl md:text-6xl opacity-60">{username}.</span>
                    </h1>
                    <p className="text-ink/50 dark:text-white/50 text-lg font-light max-w-md leading-relaxed">
                        Your path continues. Consult the oracles or review your archive of wisdom.
                    </p>
                </motion.div>

                {/* Quick Action Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {/* New Consultation CTA */}
                    <Link
                        to="/oracle"
                        className="group flex flex-col justify-between border border-ink/10 dark:border-white/10 hover:border-ink dark:hover:border-white p-8 rounded-2xl bg-paper/50 dark:bg-white/[0.03] transition-all duration-500 cursor-pointer"
                    >
                        <Sparkles
                            size={24}
                            className="text-ink/30 dark:text-white/30 group-hover:text-ink dark:group-hover:text-white transition-colors"
                        />
                        <div className="mt-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 dark:text-white/30 mb-2">
                                Begin
                            </p>
                            <h3 className="text-2xl font-serif font-light group-hover:italic transition-all duration-300 text-ink dark:text-white">
                                New Consultation
                            </h3>
                        </div>
                    </Link>

                    {/* Sanctum / Archive */}
                    <Link
                        to="/sanctum"
                        className="group flex flex-col justify-between border border-ink/10 dark:border-white/10 hover:border-ink dark:hover:border-white p-8 rounded-2xl bg-paper/50 dark:bg-white/[0.03] transition-all duration-500 cursor-pointer"
                    >
                        <BookOpen
                            size={24}
                            className="text-ink/30 dark:text-white/30 group-hover:text-ink dark:group-hover:text-white transition-colors"
                        />
                        <div className="mt-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 dark:text-white/30 mb-2">
                                Archive
                            </p>
                            <h3 className="text-2xl font-serif font-light group-hover:italic transition-all duration-300 text-ink dark:text-white">
                                My Sanctum
                            </h3>
                        </div>
                    </Link>

                    {/* Tokens / Credits */}
                    <Link
                        to="/tokens"
                        className={`group flex flex-col justify-between p-8 rounded-2xl transition-all duration-500 cursor-pointer border ${
                            isLowCredits
                                ? 'border-amber-400/30 bg-amber-400/5 hover:border-amber-400/60'
                                : 'border-ink/10 dark:border-white/10 hover:border-ink dark:hover:border-white bg-paper/50 dark:bg-white/[0.03]'
                        }`}
                    >
                        <Zap
                            size={24}
                            className={isLowCredits ? 'text-amber-500' : 'text-ink/30 dark:text-white/30 group-hover:text-ink dark:group-hover:text-white transition-colors'}
                        />
                        <div className="mt-8">
                            <p className={`text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${
                                isLowCredits ? 'text-amber-500' : 'text-ink/30 dark:text-white/30'
                            }`}>
                                {isLowCredits ? '↑ Low Balance' : 'Tokens'}
                            </p>
                            <h3 className="text-2xl font-serif font-light group-hover:italic transition-all duration-300 text-ink dark:text-white flex items-end gap-2">
                                <span className="text-4xl font-bold tabular-nums">
                                    {profile?.credits ?? '—'}
                                </span>
                                <span className="text-sm text-ink/40 dark:text-white/40 pb-1">remaining</span>
                            </h3>
                        </div>
                    </Link>
                </motion.div>

                {/* Level + XP strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex items-center gap-6 border-t border-ink/5 dark:border-white/5 pt-8"
                >
                    <div className="flex items-center gap-2">
                        <Star size={12} className="text-ink/40 dark:text-white/40" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 dark:text-white/40">
                            Level {profile?.level ?? 1}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
                        <div className="flex-1 h-px bg-ink/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((profile?.xp ?? 0) / ((profile?.level ?? 1) * 100)) * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                                className="h-full bg-ink dark:bg-white"
                            />
                        </div>
                        <span className="text-[9px] font-mono text-ink/25 dark:text-white/25 whitespace-nowrap">
                            {profile?.xp ?? 0} XP
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// --- Public Hero ---

const PublicHero: React.FC = () => (
    <section className="px-6 py-20 md:py-32 lg:px-20 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
                <div className="space-y-6">
                    <h1 className="text-ink dark:text-white text-5xl md:text-7xl font-light tracking-tight leading-[1.1] font-serif">
                        Ancestral Wisdom, <br />
                        <span className="font-bold font-serif">Artificial Insight.</span>
                    </h1>
                    <p className="text-ink/60 dark:text-white/60 text-lg md:text-xl font-light max-w-md leading-relaxed">
                        Bridging the gap between ancient divination and modern neural networks. Ask the digital spirits.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link to="/oracle" className="zen-btn-primary h-14">
                        Begin Journey
                    </Link>
                    <button className="flex items-center justify-center rounded-full border border-ink/20 dark:border-white/20 px-8 py-4 text-ink dark:text-white text-base font-medium transition-colors hover:border-ink dark:hover:border-white">
                        Learn More
                    </button>
                </div>
            </div>
            <div className="relative w-full aspect-square md:aspect-[4/5] bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden flex items-center justify-center group border border-ink/5">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-transparent dark:from-white dark:via-gray-900"></div>
                <span className="material-symbols-outlined text-[120px] md:text-[200px] text-ink/80 dark:text-white/80 opacity-20 group-hover:scale-110 transition-transform duration-700 ease-out font-thin">
                    filter_drama
                </span>
            </div>
        </div>
    </section>
);

// --- Main ---

const Home: React.FC = () => {
    const { isLoggedIn, isLoading } = useAuth();

    return (
        <div className="flex flex-col">
            {/* Hero: changes based on auth state */}
            {!isLoading && (isLoggedIn ? <AuthenticatedHero /> : <PublicHero />)}
            {isLoading && (
                <section className="px-6 py-20 md:py-32 lg:px-20 max-w-[1400px] mx-auto">
                    <div className="h-64 flex items-center justify-center opacity-10">
                        <div className="w-8 h-8 rounded-full border-2 border-ink dark:border-white animate-spin border-t-transparent" />
                    </div>
                </section>
            )}

            {/* Instruments / Services – always visible */}
            <section className="px-6 py-24 lg:px-20 max-w-[1400px] mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-ink dark:text-white text-3xl md:text-4xl font-bold mb-2 font-serif">Our Instruments</h2>
                        <p className="text-ink/60 dark:text-white/60">Choose your path of inquiry.</p>
                    </div>
                    <Link className="hidden md:flex items-center gap-2 text-ink dark:text-white font-medium hover:opacity-70 transition-opacity" to="/oracle">
                        Explore All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Link to="/oracle/runes" className="group flex flex-col justify-between border border-ink/10 dark:border-white/10 p-10 h-[400px] hover:border-ink dark:hover:border-white transition-all duration-500 bg-white dark:bg-ink rounded-3xl">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-4xl text-ink dark:text-white font-light">eco</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-ink dark:text-white">
                                <span className="material-symbols-outlined">north_east</span>
                            </span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-ink dark:text-white mb-3 font-serif">Futhark Runes</h3>
                            <p className="text-ink/60 dark:text-white/60 text-sm leading-relaxed">
                                Norse wisdom decoded by neural networks. Cast the stones into the digital stream.
                            </p>
                        </div>
                    </Link>

                    <Link to="/oracle/tarot" className="group flex flex-col justify-between border border-ink/10 dark:border-white/10 p-10 h-[400px] hover:border-ink dark:hover:border-white transition-all duration-500 bg-white dark:bg-ink rounded-3xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-4xl text-ink dark:text-white font-light">style</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-ink dark:text-white">
                                <span className="material-symbols-outlined">north_east</span>
                            </span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-ink dark:text-white mb-3 font-serif">Tarot Arcanum</h3>
                            <p className="text-ink/60 dark:text-white/60 text-sm leading-relaxed">
                                Archetypal imagery interpreted through deep learning. The fool's journey, digitized.
                            </p>
                        </div>
                    </Link>

                    <Link to="/oracle/iching" className="group flex flex-col justify-between border border-ink/10 dark:border-white/10 p-10 h-[400px] hover:border-ink dark:hover:border-white transition-all duration-500 bg-white dark:bg-ink rounded-3xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-4xl text-ink dark:text-white font-light">balance</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-ink dark:text-white">
                                <span className="material-symbols-outlined">north_east</span>
                            </span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-ink dark:text-white mb-3 font-serif">I Ching Hexagrams</h3>
                            <p className="text-ink/60 dark:text-white/60 text-sm leading-relaxed">
                                Ancient changes mapped by algorithms. Probability meets destiny.
                            </p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Access Portal */}
            <section className="bg-paper dark:bg-zinc-900/40 border-y border-ink/5 dark:border-white/5 py-24 transition-colors duration-300">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-20 flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="max-w-xl text-center lg:text-left">
                        <h2 className="text-ink dark:text-white text-3xl md:text-4xl font-bold mb-4 font-serif tracking-tight">Access the Journal</h2>
                        <p className="text-ink/60 dark:text-white/40 text-lg font-light">Deep dives into the intersection of technology and spirituality.</p>
                    </div>
                    <Link to="/blog" className="zen-btn-primary h-14 px-12">Visit Blog</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
