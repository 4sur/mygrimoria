import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

import { type TarotCard } from '../constants/tarot';

export const TarotDetail = ({ card, position, onClose }: { card: TarotCard; position: string; onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 dark:bg-ink/90 backdrop-blur-xl"
        >
            <div className="max-w-2xl w-full bg-white dark:bg-ink text-ink dark:text-white border border-ink/10 dark:border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-ink/5 rounded-full transition-colors"
                >
                    <RefreshCw className="rotate-45" size={24} />
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-serif font-bold opacity-10 mb-4">{card.numeral}</span>
                        <div className="text-[10px] tracking-widest uppercase opacity-40 font-bold">{position}</div>
                    </div>

                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="font-serif text-4xl tracking-tight mb-2">{card.name}</h2>
                            <p className="text-xl font-serif italic opacity-40">Major Arcana</p>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-ink/5 dark:border-white/5">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-3">Upright Meaning</h4>
                                <p className="font-serif text-xl leading-relaxed">{card.meaning_upright}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
