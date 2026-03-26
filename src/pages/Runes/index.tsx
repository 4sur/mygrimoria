import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, History } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useOracleSession } from '../../hooks/useOracleSession';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { RuneDetail } from '../../components/RuneDetail';
import { type Rune } from '../../constants/runes';
import { type RuneReading } from '../../types';
import { useRunes } from '../../hooks/useRunes';
import { useOracleIntent } from '../../context/OracleIntentContext';
import { OracleChat, type ChatMessage } from '../../components/Oracle/OracleChat';
import { HistorySidebar } from '../../components/Oracle/HistorySidebar';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;

interface RuneHistoryItem extends RuneReading {
    session_id?: string;
}

export default function RunesPage() {
    const { intent, clearIntent } = useOracleIntent();
    const [question, setQuestion] = useState(intent?.question || '');
    const [inputValue, setInputValue] = useState('');
    const [selectedRune, setSelectedRune] = useState<{ rune: Rune; position: string } | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const {
        spread,
        drawnCount,
        isDrawing,
        interpretation,
        isInterpreting,
        messages,
        isLoading,
        history,
        handleDraw,
        sendMessage,
        reset,
        selectFromHistory,
        saveChat
    } = useRunes();

    const {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    } = useOracleSession();

    React.useEffect(() => {
        if (intent?.question) {
            setQuestion(intent.question);
            clearIntent();
        }
    }, [intent, clearIntent]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSaveChat = async () => {
        if (messages.length <= 1) return;
        const success = await saveChat(spread ? (messages[0] as any).session_id : null, messages);
        if (success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        await sendMessage(inputValue, messages);
        setInputValue('');
        startChat();
    };

    const historyItems: any[] = history;

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
                            onClick={() => {
                                reset();
                                resetSession();
                            }}
                            className="p-2 rounded-full transition-colors hover:opacity-60"
                            title="Recast Runes"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 lg:p-16 flex flex-col flex-1 items-center justify-start min-h-[50vh]"
                    style={{ borderBottom: '1px solid color-mix(in srgb, var(--fg) 6%, transparent)' }}
                >
                    {drawnCount === 0 && (
                        <div className="w-full max-w-md space-y-12 flex flex-col items-center mb-16">
                            <div className="text-center space-y-4">
                                <h2 className="font-serif text-3xl italic opacity-80">Cast the Sacred Stones</h2>
                                <p className="text-sm opacity-40 max-w-xs mx-auto text-balance">
                                    Ancient symbols for modern paths. Focus your question and let the stones fall.
                                </p>
                            </div>

                            {question && (
                                <div className="w-full text-center">
                                    <p className="font-serif italic text-lg opacity-60">"{question}"</p>
                                </div>
                            )}
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
                                onClick={() => handleDraw(question)}
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
                                </>
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
                        oracleType="runes"
                        chatLabel="Dialogue with the Runemaster"
                        saveLabel="Preserve Wisdom"
                    />
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

            <HistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                history={historyItems}
                onSelect={(item: any) => {
                    selectFromHistory(item);
                    resetSession();
                }}
                oracleType="runes"
                getItemTitle={(item) => item.present_rune?.name || 'Reading'}
                getItemSubtitle={(item) => {
                    const runes = [];
                    if (item.past_rune) runes.push(item.past_rune.name);
                    if (item.future_rune) runes.push(item.future_rune.name);
                    return runes.join(' • ');
                }}
            />
        </div>
    );
}
