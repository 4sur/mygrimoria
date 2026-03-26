import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, History } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useOracleSession } from '../../hooks/useOracleSession';
import { Typewriter } from '../../components/Typewriter';
import { LoadingOracle } from '../../components/LoadingOracle';
import { TarotDetail } from '../../components/TarotDetail';
import { type TarotCard } from '../../constants/tarot';
import { type TarotReading } from '../../types';
import { useTarot } from '../../hooks/useTarot';
import { useOracleIntent } from '../../context/OracleIntentContext';
import { OracleChat, type ChatMessage } from '../../components/Oracle/OracleChat';
import { HistorySidebar } from '../../components/Oracle/HistorySidebar';
import logo from '../../assets/logo.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;

const BG_PAST = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc3RQePzsUhegBJQq7lScP0e-egb02QPXWMavv2hbp9llqPjpCC9JMHz3-cwj604kFf7PoSieRYF8Rcx7cHUQ9pzyOR9VmMVexmA0ppXT-9bgI36nawFSyT8ZO2X4z03tcvEwoblOhp-yJrROt_wHUPVQ0QLjXsfUBhgFekSbcHSiqYoFXhQaeDEMCo2XTuwnyvuv54zTJVes482F9cp-GunCEqzOGC9OJmodVxLXcj2IRF4vVl5KRWYRNf8D9mpJH-D6UCktYmVQ';
const BG_PRESENT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXSQQqQ5uUGnXPW11B1F1BYV3vEwGq6p--UNYnaoUeOvv6TlI5_KxHYPTIJpKtKeOF1-ph-w_a_GuXVzqMfAkMpGd7yPZ37oEaAGlvPi3yLne7B0WW6IwUVemSZ4arXuDFFEqp7ehlb0wurLlPRWaBxqbpSuFZoJAub58DXoeFRCdmPg-7qhft1N6uyAbPRSyFBHcWiBa3Ox7hKCxVGb-5lMKlp-YQfwxmJ_d-QRU4RGr8qcaple4pmmFDn3V2HJzQrdVm28aDNBo';
const BG_FUTURE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvr-NQenVJkWyp-1zJDMynBV5cJQMgmeHWMr9BdIqNx2mhUtxk7zXXVfEXcBYhVBvG5qcsrKiNKLMboUFPqAY38MiGSK9-_8U4B96UwN4bMY3aXS0ityrSXY_TkGU3pV4-muqplG8ZizhIeocJtAGyFyINexVw4iyOIf9R-B5ztZKiUxMSXJr0zXKyFvY6H2qedDP6l_pAR8kWHqcgX-2g3w_FVjUrrihr_m5iq4qum4q0KWA6NJ4eDIASCPU1zAFIhSI0VHEUZyU';

interface TarotHistoryItem extends TarotReading {
    session_id?: string;
}

export default function TarotPage() {
    const { intent, clearIntent } = useOracleIntent();
    const [question, setQuestion] = useState(intent?.question || '');
    const [inputValue, setInputValue] = useState('');
    const [selectedCard, setSelectedCard] = useState<{ card: TarotCard; position: string } | null>(null);
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
    } = useTarot();

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
                            onClick={() => {
                                reset();
                                resetSession();
                            }}
                            className="p-2 rounded-full transition-colors hover:opacity-60"
                            title="Reset Reading"
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
                                <h2 className="font-serif text-3xl italic opacity-80">Consult the Arcana</h2>
                                <p className="text-sm opacity-40 max-w-xs mx-auto">
                                    Clear your mind. When ready, draw from the deck.
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
                        oracleType="tarot"
                        chatLabel="Dialogue with the Reader"
                        saveLabel="Save Reading"
                    />
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

            <HistorySidebar
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                history={historyItems}
                onSelect={(item: any) => {
                    selectFromHistory(item);
                    resetSession();
                }}
                oracleType="tarot"
                getItemTitle={(item) => item.present_card?.name || 'Reading'}
                getItemSubtitle={(item) => {
                    const cards = [];
                    if (item.past_card) cards.push(item.past_card.name);
                    if (item.future_card) cards.push(item.future_card.name);
                    return cards.join(' • ');
                }}
            />
        </div>
    );
}
