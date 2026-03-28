import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    RefreshCw,
    History,
    ChevronRight,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useOracle } from '../../hooks/useOracle';
import { HexagramLine } from '../../components/HexagramLine';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { HexagramDetail } from '../../components/HexagramDetail';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { XpGainToast, useXpGain } from '../../components/XpGainToast';
import { interpretHexagram, chatWithMaster, saveChatHistory } from '../../services/api';
import { type Hexagram } from '../../constants/iching';
import { type Reading } from '../../types';
import { useOracleSession } from '../../hooks/useOracleSession';
import { OracleChat, type ChatMessage } from '../../components/Oracle/OracleChat';
import { HistorySidebar } from '../../components/Oracle/HistorySidebar';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

interface IchingHistoryItem extends Reading {
    session_id?: string;
}

export default function IchingPage() {
    const {
        lines,
        isCasting,
        reading,
        messages,
        isLoading,
        history,
        question,
        castLine,
        sendMessage,
        reset,
        selectFromHistory,
        setOnXpGain
    } = useOracle();

    const [inputValue, setInputValue] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedHexagram, setSelectedHexagram] = useState<Hexagram | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    const { xpGain, showXpGain, clearXpGain } = useXpGain();
    
    useEffect(() => {
        setOnXpGain(showXpGain);
    }, [showXpGain, setOnXpGain]);

    const {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    } = useOracleSession();

    const chatEndRef = useRef<HTMLDivElement>(null);

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

    const historyItems: any[] = history.map(h => ({
        lines: h.lines,
        primaryHexagram: h.primaryHexagram,
        changingHexagram: h.changingHexagram,
        timestamp: h.timestamp,
        session_id: (h as any).session_id
    }));

    return (
        <div style={cssBg} className="flex flex-col font-sans min-h-[calc(100vh-80px)]">
            {xpGain && (
                <XpGainToast 
                    xpGained={xpGain.gained} 
                    totalXp={xpGain.total} 
                    onComplete={clearXpGain} 
                />
            )}
            <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-0"
                style={{ borderLeft: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)', borderRight: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
            >
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

                            {question && (
                                <div className="w-full text-center">
                                    <p className="font-serif italic text-lg opacity-60">"{question}"</p>
                                </div>
                            )}

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
                                                Clarify
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {isChatting && (
                    <OracleChat
                        messages={messages as ChatMessage[]}
                        isLoading={isLoading}
                        isChatting={isChatting}
                        isTypingFinished={isTypingFinished}
                        hasUserMessages={hasUserMessages(messages)}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onSendMessage={handleSendMessage}
                        onStartChat={startChat}
                        onSaveChat={handleSaveChat}
                        isSaved={isSaved}
                        oracleType="iching"
                        chatLabel="Dialogue with the Master"
                        saveLabel="Save Reading"
                    />
                )}
            </main>

            <HistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                history={historyItems}
                onSelect={(item: any) => {
                    selectFromHistory(item);
                    resetSession();
                }}
                oracleType="iching"
                getItemTitle={(item) => item.primaryHexagram?.name || 'Reading'}
                getItemSubtitle={(item) => item.primaryHexagram?.chineseName || ''}
            />

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
