import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Circle } from 'lucide-react';

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;

interface HistoryItem {
    timestamp: number;
    [key: string]: any;
}

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    oracleType: 'iching' | 'tarot' | 'runes';
    title?: string;
    getItemTitle: (item: HistoryItem) => string;
    getItemSubtitle: (item: HistoryItem) => string;
}

export function HistorySidebar({
    isOpen,
    onClose,
    history,
    onSelect,
    oracleType,
    title = 'Past Readings',
    getItemTitle,
    getItemSubtitle
}: HistorySidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ backgroundColor: 'color-mix(in srgb, var(--fg) 20%, transparent)' }}
                        className="fixed inset-0 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ ...cssBg, borderLeft: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)' }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-8 flex justify-between items-center"
                            style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)' }}
                        >
                            <h2 className="font-serif text-xl">{title}</h2>
                            <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
                                <ChevronRight />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {history.length === 0 ? (
                                <p className="text-center opacity-30 italic py-12">No history yet.</p>
                            ) : (
                                history.map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ borderColor: 'color-mix(in srgb, var(--fg) 10%, transparent)' }}
                                        className="p-4 border rounded-xl cursor-pointer transition-colors group hover:opacity-70"
                                        onClick={() => {
                                            onSelect(h);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] opacity-30">{new Date(h.timestamp).toLocaleDateString()}</span>
                                            <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {[0, 1, 2].map((_, j) => <React.Fragment key={j}><Circle size={4} fill="currentColor" /></React.Fragment>)}
                                            </div>
                                        </div>
                                        <h4 className="font-serif text-sm font-bold">{getItemTitle(h)}</h4>
                                        <p className="text-[10px] opacity-40 mt-1">{getItemSubtitle(h)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
