import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

import { type Rune } from '../constants/runes';

interface RuneDetailProps {
    rune: Rune;
    position: string;
    onClose: () => void;
}

export const RuneDetail: React.FC<RuneDetailProps> = ({ rune, position, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-white/80 dark:bg-ink/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 text-center"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors opacity-40 hover:opacity-100"
                >
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold mb-4 block">
                        {position}
                    </span>
                    <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border border-ink/10 dark:border-white/10">
                        <span className="text-6xl font-serif text-ink dark:text-white">{rune.symbol}</span>
                    </div>
                    <h2 className="font-serif text-4xl mb-2 text-ink dark:text-white">
                        {rune.name}
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="h-px w-12 bg-ink/20 dark:bg-white/20 mx-auto"></div>
                    <p className="font-serif text-xl italic leading-relaxed text-ink/80 dark:text-white/80">
                        "{rune.meaning}"
                    </p>
                    <div className="h-px w-12 bg-ink/20 dark:bg-white/20 mx-auto"></div>
                </div>

                <div className="mt-12 text-[10px] uppercase tracking-widest opacity-30">
                    Ancient Rune of the Elder Futhark
                </div>
            </motion.div>
        </motion.div>
    );
};
