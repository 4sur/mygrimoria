import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, MessageSquare, Bookmark, HelpCircle, History, ChevronRight, Circle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useOracleSession } from '../../hooks/useOracleSession';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { TarotDetail } from '../../components/TarotDetail';
import { type TarotCard } from '../../constants/tarot';
import { type TarotReading } from '../../types';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

import { drawTarotCards, interpretTarot, chatWithTarotReader, saveChatHistory } from '../../services/api';

const BG_PAST = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc3RQePzsUhegBJQq7lScP0e-egb02QPXWMavv2hbp9llqPjpCC9JMHz3-cwj604kFf7PoSieRYF8Rcx7cHUQ9pzyOR9VmMVexmA0ppXT-9bgI36nawFSyT8ZO2X4z03tcvEwoblOhp-yJrROt_wHUPVQ0QLjXsfUBhgFekSbcHSiqYoFXhQaeDEMCo2XTuwnyvuv54zTJVes482F9cp-GunCEqzOGC9OJmodVxLXcj2IRF4vVl5KRWYRNf8D9mpJH-D6UCktYmVQ';
const BG_PRESENT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXSQQqQ5uUGnXPW11B1F1BYV3vEwGq6p--UNYnaoUeOvv6TlI5_KxHYPTIJpKtKeOF1-ph-w_a_GuXVzqMfAkMpGd7yPZ37oEaAGlvPi3yLne7B0WW6IwUVemSZ4arXuDFFEqp7ehlb0wurLlPRWaBxqbpSuFZoJAub58DXoeFRCdmPg-7qhft1N6uyAbPRSyFBHcWiBa3Ox7hKCxVGb-5lMKlp-YQfwxmJ_d-QRU4RGr8qcaple4pmmFDn3V2HJzQrdVm28aDNBo';
const BG_FUTURE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvr-NQenVJkWyp-1zJDMynBV5cJQMgmeHWMr9BdIqNx2mhUtxk7zXXVfEXcBYhVBvG5qcsrKiNKLMboUFPqAY38MiGSK9-_8U4B96UwN4bMY3aXS0ityrSXY_TkGU3pV4-muqplG8ZizhIeocJtAGyFyINexVw4iyOIf9R-B5ztZKiUxMSXJr0zXKyFvY6H2qedDP6l_pAR8kWHqcgX-2g3w_FVjUrrihr_m5iq4qum4q0KWA6NJ4eDIASCPU1zAFIhSI0VHEUZyU';

interface TarotSpread {
    past_card: TarotCard;
    present_card: TarotCard;
    future_card: TarotCard;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export default function TarotPage() {
    const [spread, setSpread] = useState<TarotSpread | null>(null);
    const [drawnCount, setDrawnCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);

    // UI states
    const [interpretation, setInterpretation] = useState('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedCard, setSelectedCard] = useState<{ card: TarotCard; position: string } | null>(null);

    const {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    } = useOracleSession();

    const [isChatWait, setIsChatWait] = useState(false);
    const [history, setHistory] = useState<TarotReading[]>([]);
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

    const fetchInterpretation = async (spreadData: TarotSpread) => {
        setIsInterpreting(true);
        try {
            const data = await interpretTarot(
                spreadData.past_card,
                spreadData.present_card,
                spreadData.future_card,
                question || "I seek guidance from the tarot cards."
            );

            const { text, session_id } = data;
            setInterpretation(text);
            const newReading: TarotReading & { session_id?: string } = {
                past_card: spreadData.past_card,
                present_card: spreadData.present_card,
                future_card: spreadData.future_card,
                interpretation: text,
                timestamp: Date.now(),
                session_id
            };
            setHistory(prev => [newReading, ...prev]);
            setMessages([{ role: 'model', text: text }]);
        } catch (error) {
            console.error(error);
            setInterpretation("*(Silence)* The connection was disturbed.");
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleDraw = async () => {
        setIsDrawing(true);

        if (drawnCount === 0) {
            try {
                const spreadData = await drawTarotCards();
                setSpread(spreadData);
                setDrawnCount(1);
                fetchInterpretation(spreadData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsDrawing(false);
            }
        } else if (drawnCount < 3) {
            // Artificial delay for next cards
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

            const data = await chatWithTarotReader(historyForApi);
            setMessages([...newMessages, { role: 'model', text: data.text }]);
        } catch (err) {
            console.error(err);
            setMessages([...newMessages, { role: 'model', text: "*(Silence)* Something disturbed the flow." }]);
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

    const selectFromHistory = (h: TarotReading) => {
        setSpread({
            past_card: h.past_card,
            present_card: h.present_card,
            future_card: h.future_card
        });
        setInterpretation(h.interpretation);
        setMessages([{ role: 'model', text: h.interpretation }]);
        setDrawnCount(3);
        resetSession();
    };

    const CardDisplay = ({ card, position, bgImage, onClick }: { card?: TarotCard, position: string, bgImage: string, onClick?: () => void }) => {
        if (!card) {
            return (
                <div className="flex flex-col items-center gap-6 group">
                    <div className="relative w-full aspect-[2/3] max-w-[280px] bg-paper dark:bg-zinc-900 border border-ink/5 dark:border-white/5 p-4 rounded-xl shadow-sm flex items-center justify-center transition-all duration-300">
                        <div className="w-16 h-16 border border-ink/10 dark:border-white/10 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                            <span className="material-symbols-outlined text-3xl">flare</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/20 dark:text-white/20">{position}</span>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-6 group cursor-pointer"
                onClick={onClick}
            >
                <div className="relative w-full aspect-[2/3] max-w-[280px] bg-white dark:bg-black border border-ink/10 dark:border-white/10 p-2 sm:p-4 transition-transform duration-700 ease-out group-hover:-translate-y-2 rounded-xl shadow-xl overflow-hidden">
                    <div
                        className="absolute inset-0 m-2 sm:m-4 border border-ink/5 dark:border-white/5 bg-black/20 dark:bg-black/50 grayscale contrast-125"
                        style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'luminosity' }}
                    />

                    {/* Overlay Text */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center bg-white/60 dark:bg-black/60 backdrop-blur-[2px] p-4 rounded-lg group-hover:bg-white/40 dark:group-hover:bg-black/40 transition-colors duration-500 border border-ink/5 dark:border-white/5">
                        <span className="font-serif text-5xl mb-6 text-ink dark:text-white drop-shadow-md">{card.numeral}</span>
                        <h3 className="font-serif text-2xl mb-2 text-ink dark:text-white drop-shadow-md leading-tight">{card.name}</h3>
                    </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-ink/70 dark:text-white/70 group-hover:text-ink dark:group-hover:text-white transition-colors drop-shadow-sm">
                    {position}
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
                    <h2 className="font-serif italic text-lg opacity-80 px-4">The Fools Journey</h2>
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
                            title="Reset Reading"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Tarot Generator Section */}
                <div className="p-8 lg:p-16 flex flex-col flex-1 items-center justify-start min-h-[50vh]"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    {/* Header and Input Area */}
                    {drawnCount === 0 && (
                        <div className="w-full max-w-md space-y-12 flex flex-col items-center mb-16">
                            <div className="text-center space-y-4">
                                <h2 className="font-serif text-3xl italic opacity-80">Consult the Arcana</h2>
                                <p className="text-sm opacity-40 max-w-xs mx-auto">
                                    Clear your mind. When ready, draw from the deck.
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

                    {/* The Spread Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 items-start justify-center w-full mb-16 mt-8">
                        <CardDisplay
                            card={drawnCount >= 1 ? spread?.past_card : undefined}
                            position="I. Past"
                            bgImage={BG_PAST}
                            onClick={drawnCount >= 1 ? () => setSelectedCard({ card: spread!.past_card, position: 'I. Past' }) : undefined}
                        />
                        <CardDisplay
                            card={drawnCount >= 2 ? spread?.present_card : undefined}
                            position="II. Present"
                            bgImage={BG_PRESENT}
                            onClick={drawnCount >= 2 ? () => setSelectedCard({ card: spread!.present_card, position: 'II. Present' }) : undefined}
                        />
                        <CardDisplay
                            card={drawnCount >= 3 ? spread?.future_card : undefined}
                            position="III. Future"
                            bgImage={BG_FUTURE}
                            onClick={drawnCount >= 3 ? () => setSelectedCard({ card: spread!.future_card, position: 'III. Future' }) : undefined}
                        />
                    </div>

                    {/* Draw Button Container */}
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

                    {/* Insight Section (Only when 3 cards drawn) */}
                    {drawnCount === 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="w-full relative mt-8 flex flex-col items-center justify-center"
                        >
                            {isInterpreting ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingOracle type="tarot" message="The reader is observing the signs..." />
                                </div>
                            ) : interpretation && (
                                <>
                                    <div className="max-w-[800px] border border-ink/10 dark:border-white/10 p-10 md:p-14 bg-paper/50 dark:bg-black/20 backdrop-blur-sm relative rounded-xl w-full">
                                        <span className="absolute top-4 left-4 material-symbols-outlined text-ink/10 dark:text-white/10 text-4xl">format_quote</span>
                                        <h2 className="font-serif text-2xl md:text-3xl text-center mb-8 leading-snug text-ink dark:text-white font-light">
                                            The Silent Observer
                                        </h2>
                                        <div className="space-y-6 text-lg md:text-xl leading-relaxed text-ink/80 dark:text-white/80 text-justify">
                                            <Typewriter text={interpretation} speed={15} onComplete={handleTypingComplete} />
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
                                </>
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
                                <span className="text-[10px] uppercase tracking-widest font-bold">Dialogue with the Reader</span>
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
                                            {msg.role === 'user' ? "Seeker" : "Reader"}
                                        </span>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </AnimatePresence>

                            {isChatWait && (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingOracle type="tarot" />
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
                                    disabled={!spread || isChatWait}
                                    placeholder={spread ? "Ask for deeper wisdom..." : "Cast the cards first..."}
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
                {selectedCard && (
                    <TarotDetail
                        card={selectedCard.card}
                        position={selectedCard.position}
                        onClose={() => setSelectedCard(null)}
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
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] opacity-30">{new Date(h.timestamp).toLocaleDateString()}</span>
                                                <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {[1, 2, 3].map((_, j) => <Circle key={j} size={4} fill="currentColor" />)}
                                                </div>
                                            </div>
                                            <h4 className="font-serif text-sm font-bold">{h.present_card.name}</h4>
                                            <p className="text-[10px] opacity-40 mt-1">{h.past_card.name} • {h.future_card.name}</p>
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
