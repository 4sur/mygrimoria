import React from 'react';
import { motion } from 'motion/react';
import { type Hexagram } from '../constants/iching';

interface LoadingOracleProps {
    type: 'iching' | 'tarot' | 'runes';
    message?: string;
}

const TAROT_SUITS = ['♠', '♣', '♥', '♦'];
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];
const ICHING_TRIGRAMS = ['☰', '☷', '☳', '☵', '☶', '☴', '☲', '☱'];

export const LoadingOracle = ({ type, message }: LoadingOracleProps) => {
    const symbols = type === 'tarot' ? TAROT_SUITS : type === 'runes' ? RUNES : ICHING_TRIGRAMS;

    return (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-8">
            <div className="flex space-x-4 items-center justify-center">
                {symbols.slice(0, 4).map((symbol, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0.1, scale: 0.8 }}
                        animate={{
                            opacity: [0.1, 0.8, 0.1],
                            scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                        className="text-3xl md:text-4xl font-serif text-ink dark:text-white"
                    >
                        {symbol}
                    </motion.span>
                ))}
            </div>

            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="font-serif italic text-lg tracking-widest opacity-60 max-w-xs mx-auto text-balance"
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
};
