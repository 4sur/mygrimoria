import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getHistory } from '../../services/api';
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
    MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GrimorioPage: React.FC = () => {
    const { user } = useAuth();
    const [readings, setReadings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReading, setSelectedReading] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);

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

    const handleOpenReading = (reading: any) => {
        setSelectedReading(reading);
        setIsDrawerOpen(true);
        setShowDialogue(false); // reset collapsible state on each new reading
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-16">

                {/* Main Content */}
                <div className="flex-1">
                    {/* Profile Header */}
                    <section className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-ink/5 dark:border-white/5 pb-12 mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-ink/5 dark:bg-white/5 border border-ink/10 dark:border-white/10 flex items-center justify-center">
                                    <User className="text-ink dark:text-white" size={28} strokeWidth={1.5} />
                                </div>
                                <div className="h-px w-12 bg-ink/10 dark:bg-white/10" />
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-ink/40 dark:text-white/40">Registered Acolyte</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-none text-ink dark:text-white">
                                Your path, <br />
                                <span className="font-bold italic text-ink dark:text-white">
                                    {user?.email?.split('@')[0] || 'Acolyte'}
                                </span>
                            </h1>
                        </motion.div>

                        <div className="flex flex-col items-end gap-2 text-right">
                            <p className="text-2xl font-serif italic text-ink/80 dark:text-white/80">{readings.length} Consultations</p>
                            <div className="flex items-center gap-2 text-ink/40 dark:text-white/40">
                                <Sparkles size={14} />
                                <span className="text-xs uppercase tracking-widest font-bold">Frequent Archive: Oracle Cache</span>
                            </div>
                        </div>
                    </section>

                    {/* Wisdom Filters & Timeline */}
                    <section className="space-y-12">
                        <div className="flex flex-wrap gap-8 md:gap-12 border-b border-ink/5 dark:border-white/5 pb-6">
                            {['All Readings', 'Tarot', 'Runes', 'I Ching', 'Favorites'].map((filter, i) => (
                                <button
                                    key={filter}
                                    className={`relative pb-2 text-sm uppercase tracking-[0.2em] font-bold transition-all duration-300
                    ${i === 0
                                            ? 'text-ink dark:text-white'
                                            : 'text-ink/30 dark:text-white/30 hover:text-ink dark:hover:text-white'}`}
                                >
                                    {filter}
                                    {i === 0 && <motion.div layoutId="activeFilter" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink dark:bg-white" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-1">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 dark:text-white/30">
                                <div className="col-span-3 lg:col-span-2 flex items-center gap-2"><Calendar size={12} /> Date</div>
                                <div className="col-span-6 lg:col-span-7 flex items-center gap-2"><History size={12} /> Inquiry</div>
                                <div className="col-span-3 lg:col-span-3 text-right lg:text-left">Oracle</div>
                            </div>

                            {/* Rows */}
                            <div className="space-y-4 pt-4">
                                {isLoading ? (
                                    <div className="py-20 flex justify-center opacity-20">
                                        <Loader2 className="animate-spin" size={32} />
                                    </div>
                                ) : readings.length === 0 ? (
                                    <div className="py-20 text-center opacity-30 font-serif italic text-xl">
                                        The archive is empty. Begin your journey.
                                    </div>
                                ) : (
                                    readings.map((reading, index) => (
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

                {/* Quick View Drawer / Panel */}
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

                            {/* Right Side Drawer */}
                            <motion.aside
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-ink border-l border-ink/10 dark:border-white/10 z-[110] shadow-2xl flex flex-col"
                            >
                                <div className="p-8 lg:p-12 border-b border-ink/5 dark:border-white/5 flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-bold text-ink/40 dark:text-white/40 uppercase tracking-[0.3em] mb-3 block">Reading Archive</span>
                                        <h3 className="text-3xl lg:text-4xl text-ink dark:text-white font-serif italic leading-tight">
                                            {selectedReading?.inquiry}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="p-3 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink/40 dark:text-white/40 hover:text-ink dark:hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

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
                                                        <div className="text-6xl mb-4">
                                                            {/* Placeholder for hexagram visual or big text */}
                                                            # {selectedReading.details.primary_hex}
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
                                            <ReactMarkdown>
                                                {selectedReading?.interpretation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Dialogue History (collapsible) */}
                                    {selectedReading?.chat_history?.length > 0 && (
                                        <div className="space-y-6">
                                            <button
                                                onClick={() => setShowDialogue(v => !v)}
                                                className="flex items-center gap-4 group w-full"
                                            >
                                                <div className="h-px w-10 bg-ink/30 dark:bg-white/30 group-hover:bg-ink dark:group-hover:bg-white transition-colors" />
                                                <span className="text-[10px] uppercase tracking-[0.3em] text-ink/40 dark:text-white/40 group-hover:text-ink dark:group-hover:text-white transition-colors font-bold flex items-center gap-2">
                                                    <MessageSquare size={12} /> Dialogue
                                                    <span className="ml-auto text-[9px] opacity-40 normal-case tracking-normal">{showDialogue ? '↑ hide' : '↓ show'}</span>
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
                                                        {selectedReading.chat_history
                                                            .map((msg: any, i: number) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, y: 6 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: i * 0.04 }}
                                                                    className={`flex flex-col ${
                                                                        msg.role === 'user' ? 'items-end' : 'items-start'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`max-w-[85%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                                                                            msg.role === 'user'
                                                                                ? 'rounded-tr-none bg-ink dark:bg-white text-white dark:text-ink'
                                                                                : 'rounded-tl-none bg-paper dark:bg-white/5 border border-ink/8 dark:border-white/8 text-ink/80 dark:text-white/80 font-serif'
                                                                        }`}
                                                                    >
                                                                        <div className="markdown-body text-sm">
                                                                            <ReactMarkdown>
                                                                                {msg.text}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[8px] uppercase tracking-tighter opacity-30 mt-2 px-1">
                                                                        {msg.role === 'user' ? 'Seeker' : 'Oracle'}
                                                                    </span>
                                                                </motion.div>
                                                            ))
                                                        }
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

                                    <button className="zen-btn-primary w-full py-5 text-sm tracking-widest mt-8 shadow-lg">
                                        Full Wisdom Trace
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GrimorioPage;
