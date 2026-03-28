import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface XpGainToastProps {
    xpGained: number;
    totalXp: number;
    onComplete: () => void;
}

export function XpGainToast({ xpGained, totalXp, onComplete }: XpGainToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/90 dark:bg-amber-400/90 text-white dark:text-ink rounded-full shadow-lg backdrop-blur-sm">
                        <Sparkles size={18} className="animate-pulse" />
                        <span className="font-bold">+{xpGained} XP</span>
                        <span className="opacity-60 text-sm">({totalXp} total)</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function useXpGain() {
    const [xpGain, setXpGain] = useState<{ gained: number; total: number } | null>(null);

    const showXpGain = (xpResult: any) => {
        if (xpResult?.xp_gained) {
            setXpGain({ gained: xpResult.xp_gained, total: xpResult.total_xp });
        }
    };

    const clearXpGain = () => {
        setXpGain(null);
    };

    return { xpGain, showXpGain, clearXpGain };
}
