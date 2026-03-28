import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

interface LevelUpInfo {
    new_level: number;
    new_title: string;
    old_level: number;
    old_title: string;
}

interface LevelUpNotificationProps {
    levelUpInfo: LevelUpInfo | null;
    onClose: () => void;
}

export function LevelUpNotification({ levelUpInfo, onClose }: LevelUpNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (levelUpInfo) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 500);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [levelUpInfo, onClose]);

    if (!levelUpInfo) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-8 right-8 z-50 max-w-sm"
                >
                    <div className="relative bg-gradient-to-br from-amber-500/90 to-amber-700/90 dark:from-amber-400/90 dark:to-amber-600/90 text-white p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="animate-pulse" size={24} />
                            <span className="text-sm font-bold uppercase tracking-wider">Level Up!</span>
                        </div>

                        <div className="text-center py-2">
                            <div className="text-4xl font-serif font-bold mb-1">
                                {levelUpInfo.new_level}
                            </div>
                            <div className="text-lg font-serif italic opacity-90">
                                {levelUpInfo.new_title}
                            </div>
                        </div>

                        <div className="mt-4 text-center text-xs opacity-75">
                            Your journey advances...
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function useLevelUpNotification() {
    const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);

    const checkLevelUp = (xpResult: any) => {
        if (xpResult?.leveled_up && xpResult?.level_up_info) {
            setLevelUpInfo(xpResult.level_up_info);
        }
    };

    const clearLevelUp = () => {
        setLevelUpInfo(null);
    };

    return { levelUpInfo, checkLevelUp, clearLevelUp };
}
