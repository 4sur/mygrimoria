import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const HexagramLine = ({ value, isChanging, index }: { value: number; isChanging?: boolean; index?: number }) => {
    const isYang = value === 7 || value === 9;

    return (
        <div className="relative h-3 w-full flex items-center justify-center group">
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: index !== undefined ? index * 0.1 : 0
                }}
                style={{ transformOrigin: "center" }}
                className="h-full w-full flex items-center justify-center"
            >
                {isYang ? (
                    <div className={cn(
                        "h-full w-full bg-ink dark:bg-white transition-all duration-500",
                        isChanging && "opacity-60"
                    )} />
                ) : (
                    <div className="h-full w-full flex justify-between">
                        <div className={cn("h-full w-[45%] bg-ink dark:bg-white transition-all duration-500", isChanging && "opacity-60")} />
                        <div className={cn("h-full w-[45%] bg-ink dark:bg-white transition-all duration-500", isChanging && "opacity-60")} />
                    </div>
                )}

            </motion.div>
            {isChanging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: (index !== undefined ? index * 0.1 : 0) + 0.3 }}
                    className="absolute -right-10 text-[14px] font-mono flex items-center justify-center h-full"
                >
                    {value === 6 ? "×" : "○"}
                </motion.div>
            )}
        </div>
    );
};
