import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { type Hexagram, TRIGRAMS } from '../constants/iching';

export const HexagramDetail = ({ hexagram, onClose }: { hexagram: Hexagram; onClose: () => void }) => {
    const upperTrigram = hexagram.binary.slice(3);
    const lowerTrigram = hexagram.binary.slice(0, 3);

    const upper = TRIGRAMS[upperTrigram];
    const lower = TRIGRAMS[lowerTrigram];

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
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="flex flex-col-reverse space-y-2 w-32 mb-6">
                            {hexagram.binary.split('').map((b, i) => (
                                <div key={i} className="h-2 w-full flex justify-between">
                                    {b === '1' ? (
                                        <div className="h-full w-full bg-ink dark:bg-white" />
                                    ) : (
                                        <>
                                            <div className="h-full w-[45%] bg-ink dark:bg-white" />
                                            <div className="h-full w-[45%] bg-ink dark:bg-white" />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <span className="text-4xl font-serif font-bold opacity-10">#{hexagram.number}</span>
                    </div>

                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="font-serif text-4xl tracking-tight mb-2">{hexagram.name}</h2>
                            <p className="text-xl font-serif italic opacity-40">{hexagram.chineseName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-ink/5 dark:border-white/5">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-2">Upper Trigram</p>
                                <p className="font-serif text-lg">{upper?.name} ({upper?.element})</p>
                                <p className="text-xs opacity-50 italic">{upper?.attribute}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-2">Lower Trigram</p>
                                <p className="font-serif text-lg">{lower?.name} ({lower?.element})</p>
                                <p className="text-xs opacity-50 italic">{lower?.attribute}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-3">The Judgment</h4>
                                <p className="font-serif text-lg leading-relaxed">{hexagram.judgment || hexagram.meaning}</p>
                            </div>
                            {hexagram.image && (
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest opacity-30 font-bold mb-3">The Image</h4>
                                    <p className="font-serif text-lg leading-relaxed italic opacity-80">{hexagram.image}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
