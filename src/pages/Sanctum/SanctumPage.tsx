import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHistory, deleteReading, toggleFavorite } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { SkeletonText } from '../../components/Skeleton';
import {
    User,
    Cloud,
    Droplets,
    X,
    Sun as SunIcon,
    Sparkles,
    Calendar,
    History,
    ArrowRight,
    Loader2,
    MessageSquare,
    Zap,
    Star,
    Trash2,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react';

// --- Helpers ---

const getOracleIcon = (type: string) => {
    switch (type) {
        case 'tarot': return <SunIcon size={20} />;
        case 'runes': return <Cloud size={20} />;
        case 'iching': return <Droplets size={20} />;
        default: return <Sparkles size={20} />;
    }
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).toUpperCase();
};

// XP thresholds per level (simple linear for now)
const xpForNextLevel = (level: number) => level * 100;

// --- Dashboard Strip ---

interface DashboardStripProps {
    credits: number;
    level: number;
    xp: number;
    username: string;
}

const DashboardStrip: React.FC<DashboardStripProps> = ({ credits, level, xp, username }) => {
    const nextLevelXp = xpForNextLevel(level);
    const xpPercent = Math.min((xp / nextLevelXp) * 100, 100);
    const isLowCredits = credits < 10;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full border border-ink/8 dark:border-white/8 rounded-3xl bg-paper/60 dark:bg-white/[0.03] backdrop-blur-sm p-8 lg:p-10 mb-16"
        >
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">

                {/* Left: Greeting + Level */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-ink/40 dark:text-white/40">
                        Sanctum — Personal Archive
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-serif font-light text-ink dark:text-white leading-tight">
                        Welcome back,{' '}
                        <span className="font-bold italic">{username}</span>
                    </h1>
                    {/* Level badge */}
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5">
                            <Star size={12} className="text-ink/60 dark:text-white/60" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/70 dark:text-white/70">
                                Level {level}
                            </span>
                        </div>
                        {/* XP bar */}
                        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                            <div className="flex-1 h-1 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpPercent}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                    className="h-full bg-ink dark:bg-white rounded-full"
                                />
                            </div>
                            <span className="text-[9px] font-mono text-ink/30 dark:text-white/30 whitespace-nowrap">
                                {xp} / {nextLevelXp} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Credits + CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Credits block */}
                    <div className={`flex flex-col gap-1 px-6 py-5 rounded-2xl border transition-all duration-500 ${
                        isLowCredits
                            ? 'border-amber-400/40 bg-amber-400/5 dark:border-amber-400/30 dark:bg-amber-400/[0.03]'
                            : 'border-ink/8 dark:border-white/8 bg-ink/[0.02] dark:bg-white/[0.02]'
                    }`}>
                        <div className="flex items-center gap-2">
                            <Zap
                                size={14}
                                className={isLowCredits ? 'text-amber-500' : 'text-ink/40 dark:text-white/40'}
                            />
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-ink/40 dark:text-white/40">
                                Consultation Tokens
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`text-5xl font-serif font-bold leading-none tabular-nums ${
                                isLowCredits ? 'text-amber-500' : 'text-ink dark:text-white'
                            }`}>
                                {credits}
                            </span>
                            <span className="text-xs text-ink/30 dark:text-white/30 pb-1 font-mono">remaining</span>
                        </div>
                        {isLowCredits && (
                            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mt-1">
                                ↑ Low balance
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/tokens"
                            className="zen-btn-primary flex items-center gap-2 px-6 py-4"
                        >
                            <ShoppingBag size={14} />
                            Get More Tokens
                        </Link>
                        <Link
                            to="/oracle"
                            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 dark:text-white/40 hover:text-ink dark:hover:text-white transition-colors"
                        >
                            <TrendingUp size={12} />
                            New Consultation
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

const SanctumPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [readings, setReadings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReading, setSelectedReading] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'tarot' | 'runes' | 'iching'>('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistory();
                setReadings(data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredReadings = selectedFilter === 'all' 
        ? readings 
        : readings.filter(r => r.oracle === selectedFilter);

    const filterLabels = [
        { key: 'all', label: 'All Readings' },
        { key: 'tarot', label: 'Tarot' },
        { key: 'runes', label: 'Runes' },
        { key: 'iching', label: 'I Ching' },
    ] as const;

    const handleOpenReading = (reading: any) => {
        setSelectedReading(reading);
        setIsDrawerOpen(true);
        setShowDialogue(false);
    };

    const handleToggleFavorite = async (sessionId: string) => {
        try {
            const result = await toggleFavorite(sessionId);
            setReadings(prev => prev.map(r => 
                r.id === sessionId ? { ...r, is_favorite: result.is_favorite } : r
            ));
            if (selectedReading?.id === sessionId) {
                setSelectedReading(prev => ({ ...prev, is_favorite: result.is_favorite }));
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    const handleDeleteReading = async (sessionId: string) => {
        if (!confirm("Are you sure you want to delete this reading?")) return;
        try {
            await deleteReading(sessionId);
            setReadings(prev => prev.filter(r => r.id !== sessionId));
            setIsDrawerOpen(false);
        } catch (err) {
            console.error("Error deleting reading:", err);
        }
    };

    const username = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'Acolyte';

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">

            {/* Dashboard Strip */}
            <DashboardStrip
                credits={profile?.credits ?? 0}
                level={profile?.level ?? 1}
                xp={profile?.xp ?? 0}
                username={username}
            />

            <div className="flex flex-col lg:flex-row gap-16">

                {/* Archive */}
                <div className="flex-1">
                    {/* Section Header */}
                    <section className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-ink/5 dark:border-white/5 pb-12 mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-px w-10 bg-ink/20 dark:bg-white/20" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-ink/40 dark:text-white/40">
                                    Oracle Cache
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight leading-tight text-ink dark:text-white">
                                Your Reading <br />
                                <span className="font-bold italic">Archive</span>
                            </h2>
                        </motion.div>
                        <div className="flex items-center gap-2 text-ink/40 dark:text-white/40">
                            <Sparkles size={14} />
                            <span className="text-2xl font-serif italic text-ink/80 dark:text-white/80">
                                {readings.length} Consultations
                            </span>
                        </div>
                    </section>

                    {/* Filters */}
                    <section className="space-y-12">
                        <div className="flex flex-wrap gap-8 md:gap-12 border-b border-ink/5 dark:border-white/5 pb-6">
                            {filterLabels.map((filter, i) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setSelectedFilter(filter.key)}
                                    className={`relative pb-2 text-sm uppercase tracking-[0.2em] font-bold transition-all duration-300
                                        ${selectedFilter === filter.key
                                            ? 'text-ink dark:text-white'
                                            : 'text-ink/30 dark:text-white/30 hover:text-ink dark:hover:text-white'}`}
                                >
                                    {filter.label}
                                    {selectedFilter === filter.key && (
                                        <motion.div
                                            layoutId="sanctumFilter"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink dark:bg-white"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 dark:text-white/30">
                                <div className="col-span-3 lg:col-span-2 flex items-center gap-2"><Calendar size={12} /> Date</div>
                                <div className="col-span-6 lg:col-span-7 flex items-center gap-2"><History size={12} /> Inquiry</div>
                                <div className="col-span-3 text-right lg:text-left">Oracle</div>
                            </div>

                            <div className="space-y-4 pt-4">
                                {isLoading ? (
                                    <div className="py-20 space-y-6 px-6">
                                        <SkeletonText lines={1} className="h-20 w-full" />
                                        <SkeletonText lines={1} className="h-20 w-full" />
                                        <SkeletonText lines={1} className="h-20 w-full" />
                                    </div>
                                ) : readings.length === 0 ? (
                                    <div className="py-20 text-center opacity-30 font-serif italic text-xl">
                                        The archive is empty. Begin your journey.
                                    </div>
                                ) : (
                                    filteredReadings.map((reading, index) => (
                                        <motion.div
                                            key={reading.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleOpenReading(reading)}
                                            className="group grid grid-cols-12 gap-4 px-6 py-8 bg-paper/50 dark:bg-white/5 hover:bg-ink dark:hover:bg-white border border-transparent hover:border-ink/10 dark:hover:border-white/10 rounded-2xl transition-all duration-500 cursor-pointer items-center overflow-hidden"
                                        >
                                            <div className="col-span-3 lg:col-span-2 text-xs font-mono text-ink/40 dark:text-white/40 group-hover:text-white/60 dark:group-hover:text-ink/60 transition-colors">
                                                {formatDate(reading.date)}
                                            </div>
                                            <div className="col-span-6 lg:col-span-7 text-xl md:text-2xl font-serif font-light group-hover:italic group-hover:text-white dark:group-hover:text-ink transition-all duration-500 line-clamp-1">
                                                {reading.inquiry}
                                            </div>
                                            <div className="col-span-3 lg:col-span-2 text-[10px] uppercase tracking-[0.2em] font-bold text-ink/40 dark:text-white/40 group-hover:text-white/60 dark:group-hover:text-ink/60 text-right lg:text-left transition-colors pt-1">
                                                {reading.oracle}
                                            </div>
                                            <div className="hidden lg:flex lg:col-span-1 justify-end">
                                                <div className="w-10 h-10 rounded-full border border-ink/5 dark:border-white/5 flex items-center justify-center text-ink/20 dark:text-white/20 group-hover:text-white dark:group-hover:text-ink group-hover:border-white/20 dark:group-hover:border-ink/20 transition-all">
                                                    <ArrowRight size={18} strokeWidth={1.5} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Reading Drawer */}
                <AnimatePresence>
                    {isDrawerOpen && (
                        <>
                            {/* Mobile Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDrawerOpen(false)}
                                className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100] lg:hidden"
                            />

                            {/* Drawer */}
                            <motion.aside
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-ink border-l border-ink/10 dark:border-white/10 z-[110] shadow-2xl flex flex-col"
                            >
                                {/* Drawer Header */}
                                <div className="p-8 lg:p-12 border-b border-ink/5 dark:border-white/5 flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-bold text-ink/40 dark:text-white/40 uppercase tracking-[0.3em] mb-3 block">
                                            Reading Archive
                                        </span>
                                        <h3 className="text-3xl lg:text-4xl text-ink dark:text-white font-serif italic leading-tight">
                                            {selectedReading?.inquiry}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => selectedReading && handleToggleFavorite(selectedReading.id)}
                                            className="p-3 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink/40 dark:text-white/40 hover:text-amber-500 dark:hover:text-amber-400"
                                            title="Toggle favorite"
                                        >
                                            <Star 
                                                size={20} 
                                                className={selectedReading?.is_favorite ? "fill-amber-500 text-amber-500" : ""} 
                                            />
                                        </button>
                                        <button
                                            onClick={() => selectedReading && handleDeleteReading(selectedReading.id)}
                                            className="p-3 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400"
                                            title="Delete reading"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="p-3 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink/40 dark:text-white/40 hover:text-ink dark:hover:text-white"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Drawer Body */}
                                <div className="flex-1 overflow-y-auto zen-scrollbar p-8 lg:p-12 space-y-12">
                                    {/* Visual Symbol */}
                                    <div className="aspect-[4/5] w-full rounded-3xl bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group p-8">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ink/5 via-transparent to-transparent dark:from-white/5 opacity-50" />
                                        <motion.div
                                            key={selectedReading?.id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative z-10 flex flex-col items-center gap-8 w-full"
                                        >
                                            <div className="text-ink dark:text-white opacity-40 group-hover:opacity-80 transition-opacity duration-700 w-full flex justify-center">
                                                {selectedReading?.oracle === 'tarot' && (
                                                    <div className="flex gap-4">
                                                        <div className="text-center">
                                                            <div className="text-[8px] uppercase tracking-widest mb-2 opacity-50">Past</div>
                                                            <div className="text-xs italic font-serif truncate w-24">{selectedReading.details.past.name}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[8px] uppercase tracking-widest mb-2 opacity-50">Present</div>
                                                            <div className="text-xs italic font-serif truncate w-24 font-bold">{selectedReading.details.present.name}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[8px] uppercase tracking-widest mb-2 opacity-50">Future</div>
                                                            <div className="text-xs italic font-serif truncate w-24">{selectedReading.details.future.name}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedReading?.oracle === 'runes' && (
                                                    <div className="flex gap-6 text-4xl font-serif">
                                                        <span className="opacity-40">{selectedReading.details.past.symbol}</span>
                                                        <span className="font-bold">{selectedReading.details.present.symbol}</span>
                                                        <span className="opacity-40">{selectedReading.details.future.symbol}</span>
                                                    </div>
                                                )}
                                                {selectedReading?.oracle === 'iching' && (
                                                    <div className="text-center">
                                                        <div className="text-6xl mb-4 font-serif font-light">
                                                            {selectedReading.details.primary_hex}
                                                        </div>
                                                        <div className="text-[10px] uppercase tracking-widest opacity-50">Hexagram Number</div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs uppercase tracking-[0.4em] text-ink dark:text-white font-bold">
                                                Chronicle: {selectedReading?.oracle}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Interpretation */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px w-10 bg-ink dark:bg-white" />
                                            <span className="text-[10px] uppercase tracking-[0.3em] text-ink dark:text-white font-bold">Wisdom Interpretation</span>
                                        </div>
                                        <div className="text-ink/70 dark:text-white/70 font-serif text-xl leading-relaxed markdown-body">
                                            <ReactMarkdown>{selectedReading?.interpretation}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Dialogue History */}
                                    {selectedReading?.chat_history?.length > 0 && (
                                        <div className="space-y-6">
                                            <button
                                                onClick={() => setShowDialogue(v => !v)}
                                                className="flex items-center gap-4 group w-full"
                                            >
                                                <div className="h-px w-10 bg-ink/30 dark:bg-white/30 group-hover:bg-ink dark:group-hover:bg-white transition-colors" />
                                                <span className="text-[10px] uppercase tracking-[0.3em] text-ink/40 dark:text-white/40 group-hover:text-ink dark:group-hover:text-white transition-colors font-bold flex items-center gap-2">
                                                    <MessageSquare size={12} /> Dialogue
                                                    <span className="ml-auto text-[9px] opacity-40 normal-case tracking-normal">
                                                        {showDialogue ? '↑ hide' : '↓ show'}
                                                    </span>
                                                </span>
                                            </button>

                                            <AnimatePresence>
                                                {showDialogue && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                                                        className="overflow-hidden space-y-5"
                                                    >
                                                        {selectedReading.chat_history.map((msg: any, i: number) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, y: 6 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.04 }}
                                                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                                            >
                                                                <div
                                                                    className={`max-w-[85%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                                                                        msg.role === 'user'
                                                                            ? 'rounded-tr-none bg-ink dark:bg-white text-white dark:text-ink'
                                                                            : 'rounded-tl-none bg-paper dark:bg-white/5 border border-ink/8 dark:border-white/8 text-ink/80 dark:text-white/80 font-serif'
                                                                    }`}
                                                                >
                                                                    <div className="markdown-body text-sm">
                                                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[8px] uppercase tracking-tighter opacity-30 mt-2 px-1">
                                                                    {msg.role === 'user' ? 'Seeker' : 'Oracle'}
                                                                </span>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* Metadata Footer */}
                                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-ink/5 dark:border-white/5">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-ink/30 dark:text-white/30">Trace ID</span>
                                            <p className="text-[10px] font-mono text-ink/40 dark:text-white/40 truncate">{selectedReading?.id}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-ink/30 dark:text-white/30">Sign</span>
                                            <p className="text-sm font-serif italic text-ink dark:text-white uppercase">{selectedReading?.oracle}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SanctumPage;
