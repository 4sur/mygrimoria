import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, MessageSquare, Bookmark } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Typewriter } from '../Typewriter';
import { LoadingOracle } from '../LoadingOracle';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface OracleChatProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isChatting: boolean;
    isTypingFinished: boolean;
    hasUserMessages: boolean;
    inputValue: string;
    onInputChange: (value: string) => void;
    onSendMessage: (e?: React.FormEvent) => void;
    onStartChat: () => void;
    onSaveChat: () => void;
    isSaved: boolean;
    oracleType: 'iching' | 'tarot' | 'runes';
    chatLabel?: string;
    saveLabel?: string;
    placeholder?: string;
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

export function OracleChat({
    messages,
    isLoading,
    isChatting,
    isTypingFinished,
    hasUserMessages,
    inputValue,
    onInputChange,
    onSendMessage,
    onStartChat,
    onSaveChat,
    isSaved,
    oracleType,
    chatLabel = 'Dialogue with the Master',
    saveLabel = 'Save Reading',
    placeholder = 'Ask for deeper wisdom...'
}: OracleChatProps) {
    const chatEndRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col flex-1" style={cssSurface}>
            <div className="p-6 flex items-center justify-center sticky top-0 backdrop-blur-md z-40"
                style={{
                    ...cssSurface,
                    borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)',
                    opacity: 0.95
                }}
            >
                <div className="flex items-center space-x-2 opacity-60">
                    <MessageSquare size={16} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{chatLabel}</span>
                </div>
                {isLoading && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="ml-4"
                    >
                        <RefreshCw size={14} className="opacity-30" />
                    </motion.div>
                )}
            </div>

            <div className="flex-1 p-8 space-y-12 max-w-3xl mx-auto w-full">
                <AnimatePresence mode="popLayout">
                    {messages.slice(1).map((msg, i) => (
                        <motion.div
                            key={i + 1}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn(
                                "flex flex-col",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}
                        >
                            <div
                                style={msg.role === 'user'
                                    ? { backgroundColor: 'var(--fg)', color: 'var(--bg)' }
                                    : { backgroundColor: 'var(--bg)', border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)' }
                                }
                                className={cn(
                                    "max-w-[90%] md:max-w-[80%] p-8 rounded-3xl",
                                    msg.role === 'user' ? "rounded-tr-none" : "rounded-tl-none shadow-sm"
                                )}
                            >
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 1 }}
                                    className={cn(
                                        "text-base leading-relaxed",
                                        msg.role === 'model' ? "markdown-body" : "font-sans"
                                    )}
                                >
                                    {msg.role === 'model' ? (
                                        <Typewriter text={msg.text} animate={true} />
                                    ) : (
                                        msg.text
                                    )}
                                </motion.div>
                            </div>
                            <span className="text-[8px] uppercase tracking-tighter opacity-30 mt-3 px-1">
                                {msg.role === 'user' ? "Seeker" : "Master"}
                            </span>
                        </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                </AnimatePresence>

                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <LoadingOracle type={oracleType} />
                    </div>
                )}

                {hasUserMessages && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center items-center w-full mt-8"
                    >
                        <button
                            onClick={onSaveChat}
                            className={cn(
                                "w-full sm:w-auto min-w-[200px] h-14 border text-xs font-bold uppercase tracking-[0.2em] px-8 transition-all duration-300 flex items-center justify-center gap-3 rounded-full",
                                isSaved
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default'
                                    : 'border-ink/20 dark:border-white/20 hover:border-ink dark:hover:border-white bg-transparent hover:bg-ink hover:text-white dark:hover:bg-white dark:hover:text-ink'
                            )}
                        >
                            <Bookmark size={18} />
                            {isSaved ? 'Reading Saved ✓' : saveLabel}
                        </button>
                    </motion.div>
                )}
            </div>

            <div className="p-8 sticky bottom-0 z-40"
                style={{
                    ...cssBg,
                    borderTop: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)'
                }}
            >
                <form onSubmit={onSendMessage} className="relative flex items-center max-w-2xl mx-auto">
                    <input
                        type="text"
                        disabled={isLoading}
                        placeholder={placeholder}
                        style={{
                            ...cssSurface,
                            color: 'var(--fg)',
                            borderColor: 'color-mix(in srgb, var(--fg) 10%, transparent)',
                        }}
                        className="w-full border rounded-full py-5 pl-8 pr-16 text-sm focus:outline-none transition-all disabled:opacity-50"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        style={{ backgroundColor: 'var(--fg)', color: 'var(--bg)' }}
                        className="absolute right-3 p-3 rounded-full disabled:opacity-20 transition-opacity"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
