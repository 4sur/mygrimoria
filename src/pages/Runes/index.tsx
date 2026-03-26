import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, MessageSquare, Bookmark, History, ChevronRight, Circle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useOracleSession } from '../../hooks/useOracleSession';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { RuneDetail } from '../../components/RuneDetail';
import { type Rune } from '../../constants/runes';
import { type RuneReading } from '../../types';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

import { drawRunes, interpretRunes, chatWithRunemaster, saveChatHistory } from '../../services/api';

interface RuneSpread {
    past_rune: Rune;
    present_rune: Rune;
    future_rune: Rune;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export default function RunesPage() {
    const [spread, setSpread] = useState<RuneSpread | null>(null);
    const [drawnCount, setDrawnCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);

    // UI states
    const [interpretation, setInterpretation] = useState('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedRune, setSelectedRune] = useState<{ rune: Rune, position: string } | null>(null);

    const {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    } = useOracleSession();

    const [isChatWait, setIsChatWait] = useState(false);
    const [history, setHistory] = useState<RuneReading[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [question, setQuestion] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveChat = async () => {
        if (messages.length <= 1) return;
        try {
            await saveChatHistory(null, messages.slice(1));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save chat:', err);
        }
    };

    useEffect(() => {
        if (isChatting) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatting]);

    const fetchInterpretation = async (spreadData: RuneSpread) => {
        setIsInterpreting(true);
        try {
            const data = await interpretRunes(
                spreadData.past_rune,
                spreadData.present_rune,
                spreadData.future_rune,
                question || "I seek guidance from the ancient runes."
            );

            const { text, session_id } = data;
            setInterpretation(text);
            const newReading: RuneReading & { session_id?: string } = {
                past_rune: spreadData.past_rune,
                present_rune: spreadData.present_rune,
                future_rune: spreadData.future_rune,
                interpretation: text,
                timestamp: Date.now(),
                session_id
            };
            setHistory(prev => [newReading, ...prev]);
            setMessages([{ role: 'model', text: text }]);
        } catch (error) {
            console.error(error);
            setInterpretation("*(Silence)* The stones keep their secrets for now.");
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleDraw = async () => {
        setIsDrawing(true);

        if (drawnCount === 0) {
            try {
                const spreadData = await drawRunes();
                setSpread(spreadData);
                setDrawnCount(1);
                await fetchInterpretation(spreadData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsDrawing(false);
            }
        } else if (drawnCount < 3) {
            setTimeout(() => {
                setDrawnCount(c => c + 1);
                setIsDrawing(false);
            }, 800);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || !spread) return;

        const userText = inputValue.trim();
        setInputValue('');

        const newMessages = [...messages, { role: 'user' as const, text: userText }];
        setMessages(newMessages);
        startChat();
        setIsChatWait(true);

        try {
            const historyForApi = newMessages.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.text
            }));

            const data = await chatWithRunemaster(historyForApi);
            setMessages([...newMessages, { role: 'model', text: data.text }]);
        } catch (err) {
            console.error(err);
            setMessages([...newMessages, { role: 'model', text: "*(The runes grow cold)* Something disturbed the path." }]);
        } finally {
            setIsChatWait(false);
        }
    };

    const reset = () => {
        setSpread(null);
        setDrawnCount(0);
        setInterpretation('');
        setMessages([]);
        resetSession();
        setIsDrawing(false);
    };

    const selectFromHistory = (h: RuneReading) => {
        setSpread({
            past_rune: h.past_rune,
            present_rune: h.present_rune,
            future_rune: h.future_rune
        });
        setInterpretation(h.interpretation);
        setMessages([{ role: 'model', text: h.interpretation }]);
        setDrawnCount(3);
        resetSession();
    };

    const RuneDisplay = ({ rune, position, onClick }: { rune?: Rune, position: string, onClick?: () => void }) => {
        if (!rune) {
            return (
                <div className="flex flex-col items-center gap-6 group">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-paper dark:bg-zinc-900 border border-ink/5 dark:border-white/5 rounded-full shadow-sm flex items-center justify-center transition-all duration-300">
                        <div className="w-12 h-12 border border-ink/10 dark:border-white/10 rounded-full flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                            <span className="material-symbols-outlined text-3xl">flare</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/20 dark:text-white/20">{position}</span>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="flex flex-col items-center gap-6 group cursor-pointer"
                onClick={onClick}
            >
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-black border border-ink/10 dark:border-white/10 flex items-center justify-center transition-transform duration-700 ease-out group-hover:-translate-y-2 rounded-full shadow-xl overflow-hidden shadow-ink/5 dark:shadow-white/5">
                    <span className="font-serif text-5xl md:text-6xl text-ink dark:text-white drop-shadow-md z-10">{rune.symbol}</span>
                    <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(circle,_var(--fg)_1px,_transparent_1px)] bg-[size:10px_10px] font-serif"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/70 dark:text-white/70 group-hover:text-ink dark:group-hover:text-white transition-colors">
                    {position} • {rune.name}
                </span>
            </motion.div>
        );
    };

    return (
        <div style={cssBg} className="flex flex-col font-sans min-h-[calc(100vh-80px)]">
            <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-0"
                style={{ borderLeft: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
            >
                {/* Header Tools */}
                <div className="p-4 flex justify-between items-center"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    <h2 className="font-serif italic text-lg opacity-80 px-4">Whispers of the Futhark</h2>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 rounded-full transition-colors hover:opacity-60"
                            title="History"
                        >
                            <History size={20} />
                        </button>
                        <button
                            onClick={reset}
                            className="p-2 rounded-full transition-colors hover:opacity-60"
                            title="Recast Runes"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Generator Section */}
                <div className="p-8 lg:p-16 flex flex-col flex-1 items-center justify-start min-h-[50vh]"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    {/* Header and Input Area */}
                    {drawnCount === 0 && (
                        <div className="w-full max-w-md space-y-12 flex flex-col items-center mb-16">
                            <div className="text-center space-y-4">
                                <h2 className="font-serif text-3xl italic opacity-80">Cast the Sacred Stones</h2>
                                <p className="text-sm opacity-40 max-w-xs mx-auto text-balance">
                                    Ancient symbols for modern paths. Focus your question and let the stones fall.
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
                                    className="w-full py-4 text-center focus:outline-none font-serif italic text-lg placeholder:opacity-30 block"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 items-start justify-center w-full mb-16 mt-8">
                        <RuneDisplay
                            rune={drawnCount >= 1 ? spread?.past_rune : undefined}
                            position="Urd (Past)"
                            onClick={drawnCount >= 1 ? () => setSelectedRune({ rune: spread!.past_rune, position: 'Urd (Past)' }) : undefined}
                        />
                        <RuneDisplay
                            rune={drawnCount >= 2 ? spread?.present_rune : undefined}
                            position="Verdandi (Present)"
                            onClick={drawnCount >= 2 ? () => setSelectedRune({ rune: spread!.present_rune, position: 'Verdandi (Present)' }) : undefined}
                        />
                        <RuneDisplay
                            rune={drawnCount >= 3 ? spread?.future_rune : undefined}
                            position="Skuld (Future)"
                            onClick={drawnCount >= 3 ? () => setSelectedRune({ rune: spread!.future_rune, position: 'Skuld (Future)' }) : undefined}
                        />
                    </div>

                    {drawnCount < 3 && (
                        <div className="flex flex-col items-center space-y-12 w-full mt-12">
                            <button
                                onClick={handleDraw}
                                disabled={isDrawing || drawnCount >= 3}
                                className={cn(
                                    "group relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                                    isDrawing ? "scale-95 opacity-50" : "hover:scale-105"
                                )}
                            >
                                <div className="absolute inset-0 rounded-full overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-700 scale-125 group-hover:scale-150">
                                    <img src={logo} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm tracking-[0.2em] font-medium uppercase relative z-10 drop-shadow-md">
                                    {drawnCount === 0 ? "Begin" : `${drawnCount}/3`}
                                </span>
                            </button>
                        </div>
                    )}

                    {drawnCount === 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="w-full relative mt-8 flex flex-col items-center justify-center"
                        >
                            {isInterpreting ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingOracle type="runes" message="The Runemaster is reading the alignment..." />
                                </div>
                            ) : interpretation && (
                                <>
                                    <div className="max-w-[800px] border border-ink/10 dark:border-white/10 p-10 md:p-14 bg-paper/50 dark:bg-black/20 backdrop-blur-sm relative rounded-xl w-full">
                                        <span className="absolute top-4 left-4 material-symbols-outlined text-ink/10 dark:text-white/10 text-4xl">water_drop</span>
                                        <h2 className="font-serif text-2xl md:text-3xl text-center mb-8 leading-snug text-ink dark:text-white font-light">
                                            The Woven Thread
                                        </h2>
                                        <div className="space-y-6 text-lg md:text-xl leading-relaxed text-ink/80 dark:text-white/80 text-justify">
                                            <Typewriter text={interpretation} speed={15} onComplete={handleTypingComplete} />
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
                                </>
                            )}
                        </motion.div>
                    )}
                </div>

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
                                <span className="text-[10px] uppercase tracking-widest font-bold">Dialogue with the Runemaster</span>
                            </div>
                            {isChatWait && (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="ml-4">
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
                                            {msg.role === 'user' ? "Seeker" : "Runemaster"}
                                        </span>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </AnimatePresence>

                            {isChatWait && (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingOracle type="runes" />
                                </div>
                            )}

                            {hasUserMessages(messages) && !isChatWait && (
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
                                        {isSaved ? 'Wisdom Preserved ✓' : 'Preserve Wisdom'}
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
                            <form onSubmit={handleSendMessage} className="relative flex items-center max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    disabled={!spread || isChatWait}
                                    placeholder={spread ? "Ask for deeper wisdom..." : "Cast the stones first..."}
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
                                    disabled={!spread || isChatWait || !inputValue.trim()}
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

            <AnimatePresence>
                {selectedRune && (
                    <RuneDetail
                        rune={selectedRune.rune}
                        position={selectedRune.position}
                        onClose={() => setSelectedRune(null)}
                    />
                )}
            </AnimatePresence>

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
                                <h2 className="font-serif text-xl">Past Casts</h2>
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
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] opacity-30">{new Date(h.timestamp).toLocaleDateString()}</span>
                                                <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {[1, 2, 3].map((_, j) => <Circle key={j} size={4} fill="currentColor" />)}
                                                </div>
                                            </div>
                                            <h4 className="font-serif text-sm font-bold">{h.present_rune.name}</h4>
                                            <p className="text-[10px] opacity-40 mt-1">{h.past_rune.name} • {h.future_rune.name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
