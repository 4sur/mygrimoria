import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function SkeletonBase({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse bg-[var(--fg)]/10 dark:bg-white/10 rounded", className)} />
    );
}

export function SkeletonHexagram() {
    return (
        <div className="flex flex-col items-center gap-3">
            {[...Array(6)].map((_, i) => (
                <SkeletonBase key={i} className="h-4 w-32" />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="w-32 h-48 md:w-40 md:h-56 rounded-xl overflow-hidden">
            <SkeletonBase className="w-full h-full" />
        </div>
    );
}

export function SkeletonRune() {
    return (
        <div className="flex flex-col items-center gap-2">
            <SkeletonBase className="w-16 h-16 rounded-full" />
            <SkeletonBase className="h-3 w-8" />
        </div>
    );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-3 w-full", className)}>
            {[...Array(lines)].map((_, i) => (
                <SkeletonBase 
                    key={i} 
                    className={cn(
                        "h-4",
                        i === lines - 1 ? "w-3/4" : "w-full"
                    )} 
                />
            ))}
        </div>
    );
}

export function SkeletonChat() {
    return (
        <div className="space-y-4 w-full max-w-[800px]">
            <div className="flex gap-3">
                <SkeletonBase className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-20" />
                    <SkeletonBase className="h-4 w-full" />
                    <SkeletonBase className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonOraclePage({ type }: { type: 'iching' | 'tarot' | 'runes' }) {
    if (type === 'iching') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-12">
                <SkeletonHexagram />
                <SkeletonText lines={4} />
            </div>
        );
    }
    
    if (type === 'tarot') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-12">
                <div className="flex gap-4 md:gap-8 justify-center">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <SkeletonText lines={4} />
            </div>
        );
    }
    
    if (type === 'runes') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-12">
                <div className="flex gap-8 justify-center">
                    <SkeletonRune />
                    <SkeletonRune />
                    <SkeletonRune />
                </div>
                <SkeletonText lines={4} />
            </div>
        );
    }
    
    return null;
}
