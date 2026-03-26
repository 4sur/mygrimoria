import { HexagramLine } from './HexagramLine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const HexagramDisplay = ({
    lines,
    title,
    subtitle,
    onClick,
    showChangingMarks = false
}: {
    lines: number[],
    title?: string,
    subtitle?: string,
    onClick?: () => void,
    showChangingMarks?: boolean
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center space-y-6 transition-all duration-300",
                onClick && "cursor-pointer hover:scale-105"
            )}
            onClick={onClick}
        >
            <div className="flex flex-col-reverse space-y-3 space-y-reverse w-48 relative">
                {lines.map((val, i) => (
                    <HexagramLine
                        key={i}
                        value={val}
                        isChanging={showChangingMarks && (val === 6 || val === 9)}
                        index={i}
                    />
                ))}
            </div>
            <div className="text-center min-h-[4rem] flex flex-col justify-start">
                {title && <h3 className="font-serif text-xl tracking-widest uppercase leading-tight">{title}</h3>}
                {subtitle && <p className="text-xs opacity-50 font-sans mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};
