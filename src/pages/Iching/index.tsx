import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Send,
    RefreshCw,
    History,
    HelpCircle,
    ChevronRight,
    MessageSquare,
    Circle,
    Bookmark
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useOracle } from '../../hooks/useOracle';
import { HexagramLine } from '../../components/HexagramLine';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { HexagramDetail } from '../../components/HexagramDetail';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { interpretHexagram, chatWithMaster, saveChatHistory } from '../../services/api';
import { type Hexagram } from '../../constants/iching';
import { useOracleSession } from '../../hooks/useOracleSession';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/* 
 * CSS-var based style helpers.
 * These read from --bg / --fg / --surface which switch when html.dark is applied.
 * This guarantees dark mode works regardless of Tailwind variant resolution.
 */
const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;
const cssBorder = { borderColor: 'color-mix(in srgb, var(--fg) 8%, transparent)' } as const;

export default function IchingPage() {
    const {
        lines,
        isCasting,
        reading,
        messages,
        isLoading,
        history,
        question,
        setQuestion,
        castLine,
        sendMessage,
        reset,
        selectFromHistory
    } = useOracle();

    const [inputValue, setInputValue] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedHexagram, setSelectedHexagram] = useState<Hexagram | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveChat = async () => {
        if (!reading?.session_id || messages.length <= 1) return;
        try {
            await saveChatHistory(reading.session_id, messages.slice(1));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save chat:', err);
        }
    };

    const {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    } = useOracleSession();

    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        startChat();
        setInputValue('');
    };

    useEffect(() => {
        if (isChatting) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatting]);

    return (
        <div style={cssBg} className="flex flex-col font-sans min-h-[calc(100vh-80px)]">
            <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-0"
                style={{ borderLeft: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
            >
                {/* Header Tools */}
                <div className="p-4 flex justify-end space-x-4"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-2 rounded-full transition-colors hover:opacity-60"
                        title="History"
                    >
                        <History size={20} />
                    </button>
                    <button
                        onClick={() => {
                            resetSession();
                            reset();
                        }}
                        className="p-2 rounded-full transition-colors hover:opacity-60"
                        title="Reset"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Oracle Section */}
                <div className="p-8 lg:p-16 flex flex-col items-center justify-center min-h-[50vh]"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    {!reading ? (
                        <div className="w-full max-w-md space-y-12 flex flex-col items-center">
                            <div className="text-center space-y-4">
                                <h2 className="font-serif text-3xl italic opacity-80">Consult the Oracle</h2>
                                <p className="text-sm opacity-40 max-w-xs mx-auto">
                                    Focus on your question. Clear your mind. When ready, cast the lines.
                                </p>
                            </div>

                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="What is your question? (Optional)"
                                    style={{
                                        background: 'transparent',
                                        borderBottom: '1px solid color-mix(in srgb, var(--fg) 15%, transparent)',
                                        color: 'var(--fg)',
                                    }}
                                    className="w-full py-4 text-center focus:outline-none font-serif italic text-lg placeholder:opacity-30 w-full block"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col items-center space-y-12 w-full">
                                <div className="flex flex-col-reverse space-y-3 space-y-reverse w-48 min-h-[120px]">
                                    {lines.map((val, i) => (
                                        <HexagramLine key={i} value={val} isChanging={val === 6 || val === 9} index={i} />
                                    ))}
                                    {isCasting && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--fg) 10%, transparent)' }}
                                            className="h-3 w-full"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={castLine}
                                    disabled={isCasting || lines.length >= 6}
                                    className={cn(
                                        "group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                                        isCasting ? "scale-95 opacity-50" : "hover:scale-105"
                                    )}
                                >
                                    <div className="absolute inset-0 rounded-full overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-700 scale-125 group-hover:scale-150">
                                        <img src={logo} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs tracking-[0.2em] font-medium uppercase relative z-10">
                                        {lines.length === 0 ? "Begin" : `${lines.length}/6`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full flex flex-col items-center space-y-12"
                        >
                            <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16 pt-8">
                                <HexagramDisplay
                                    lines={reading.lines}
                                    title={reading.primaryHexagram.name}
                                    subtitle={reading.primaryHexagram.chineseName}
                                    onClick={() => setSelectedHexagram(reading.primaryHexagram)}
                                    showChangingMarks={true}
                                />

                                {reading.changingHexagram && (
                                    <>
                                        <div className="hidden md:flex items-center justify-center w-12 h-48 opacity-20">
                                            <ChevronRight size={32} strokeWidth={1} />
                                        </div>
                                        <HexagramDisplay
                                            lines={reading.lines.map(l => {
                                                if (l === 6) return 7;
                                                if (l === 9) return 8;
                                                return l === 7 ? 7 : 8;
                                            })}
                                            title={reading.changingHexagram.name}
                                            subtitle={reading.changingHexagram.chineseName}
                                            onClick={() => setSelectedHexagram(reading.changingHexagram!)}
                                        />
                                    </>
                                )}
                            </div>

                            {isLoading && messages.length === 0 ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingOracle type="iching" message="Consulting the ancient wisdom..." />
                                </div>
                            ) : messages.length > 0 && (
                                <div className="w-full flex flex-col items-center">
                                    <div className="max-w-[800px] border border-ink/10 dark:border-white/10 p-10 md:p-14 bg-paper/50 dark:bg-black/20 backdrop-blur-sm relative rounded-xl w-full">
                                        <span className="absolute top-4 left-4 material-symbols-outlined text-ink/10 dark:text-white/10 text-4xl">water_drop</span>
                                        <h2 className="font-serif text-2xl md:text-3xl text-center mb-8 leading-snug text-ink dark:text-white font-light">
                                            The Master's Insight
                                        </h2>
                                        <div className="space-y-6 text-lg md:text-xl leading-relaxed text-ink/80 dark:text-white/80 text-justify">
                                            <Typewriter text={messages[0].text} speed={15} onComplete={handleTypingComplete} />
                                        </div>
                                        <div className="mt-10 flex justify-center items-center gap-2 opacity-60">
                                            <span className="h-px w-8 bg-ink/30 dark:bg-white/30"></span>
                                            <span className="material-symbols-outlined text-sm">spa</span>
                                            <span className="h-px w-8 bg-ink/30 dark:bg-white/30"></span>
                                        </div>
                                    </div>

                                    {isTypingFinished && !isChatting && (
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mt-12">
                                            <button
                                                onClick={startChat}
                                                className="w-full sm:w-auto min-w-[200px] h-14 bg-ink dark:bg-white text-white dark:text-ink border border-ink dark:border-white text-xs px-8 font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-90 flex items-center justify-center gap-3 shadow-2xl shadow-ink/10 dark:shadow-white/10 rounded-full group"
                                            >
                                                <MessageSquare size={18} className="group-hover:animate-pulse" /> Clarify
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Chat / Interpretation Section */}
                {isChatting && (
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
                            <span className="text-[10px] uppercase tracking-widest font-bold">Dialogue with the Master</span>
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
                        {messages.length === 0 && !reading && (
                            <div className="py-24 flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                                <HelpCircle size={48} strokeWidth={1} />
                                <p className="font-serif italic">The silence is waiting to be filled.</p>
                            </div>
                        )}

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
                                <LoadingOracle type="iching" />
                            </div>
                        )}

                        {hasUserMessages(messages) && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center items-center w-full mt-8"
                            >
                                <button
                                    onClick={handleSaveChat}
                                    className={`w-full sm:w-auto min-w-[200px] h-14 border text-xs font-bold uppercase tracking-[0.2em] px-8 transition-all duration-300 flex items-center justify-center gap-3 rounded-full ${
                                        isSaved
                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default'
                                            : 'border-ink/20 dark:border-white/20 hover:border-ink dark:hover:border-white bg-transparent hover:bg-ink hover:text-white dark:hover:bg-white dark:hover:text-ink'
                                    }`}
                                >
                                    <Bookmark size={18} />
                                    {isSaved ? 'Reading Saved ✓' : 'Save Reading'}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-8 sticky bottom-0 z-40"
                        style={{
                            ...cssBg,
                            borderTop: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)'
                        }}
                    >
                        <form onSubmit={handleSendMessage} className="relative flex items-center max-w-2xl mx-auto">
                            <input
                                type="text"
                                disabled={!reading || isLoading}
                                placeholder={reading ? "Ask for deeper wisdom..." : "Cast the lines first..."}
                                style={{
                                    ...cssSurface,
                                    color: 'var(--fg)',
                                    borderColor: 'color-mix(in srgb, var(--fg) 10%, transparent)',
                                }}
                                className="w-full border rounded-full py-5 pl-8 pr-16 text-sm focus:outline-none transition-all disabled:opacity-50"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!reading || isLoading || !inputValue.trim()}
                                style={{ backgroundColor: 'var(--fg)', color: 'var(--bg)' }}
                                className="absolute right-3 p-3 rounded-full disabled:opacity-20 transition-opacity"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
                )}
            </main>

            {/* History Sidebar Overlay */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            style={{ backgroundColor: 'color-mix(in srgb, var(--fg) 20%, transparent)' }}
                            className="fixed inset-0 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ ...cssBg, borderLeft: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)' }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-[70] shadow-2xl flex flex-col"
                        >
                            <div className="p-8 flex justify-between items-center"
                                style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)' }}
                            >
                                <h2 className="font-serif text-xl">Past Readings</h2>
                                <button onClick={() => setShowHistory(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                                    <ChevronRight />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {history.length === 0 ? (
                                    <p className="text-center opacity-30 italic py-12">No history yet.</p>
                                ) : (
                                    history.map((h, i) => (
                                        <div
                                            key={i}
                                            style={{ borderColor: 'color-mix(in srgb, var(--fg) 10%, transparent)' }}
                                            className="p-4 border rounded-xl cursor-pointer transition-colors group hover:opacity-70"
                                            onClick={() => {
                                                selectFromHistory(h);
                                                setShowHistory(false);
                                                resetSession();
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] opacity-30">{new Date(h.timestamp).toLocaleDateString()}</span>
                                                <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {h.lines.slice(0, 3).map((_, j) => <Circle key={j} size={4} fill="currentColor" />)}
                                                </div>
                                            </div>
                                            <h4 className="font-serif text-sm font-bold">{h.primaryHexagram.name}</h4>
                                            <p className="text-[10px] opacity-40 mt-1">{h.primaryHexagram.chineseName}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hexagram Detail Modal */}
            <AnimatePresence>
                {selectedHexagram && (
                    <HexagramDetail
                        hexagram={selectedHexagram}
                        onClose={() => setSelectedHexagram(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
