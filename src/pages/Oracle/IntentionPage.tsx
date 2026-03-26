import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useOracleIntent, type OracleType } from '../../context/OracleIntentContext';

const IntentionPage: React.FC = () => {
    const [oracleType, setOracleType] = useState<OracleType>('iching');
    const [isInvoking, setIsInvoking] = useState(false);
    const [question, setQuestion] = useState('');
    const { setIntent } = useOracleIntent();
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleConsult = () => {
        setIsInvoking(true);
        setIntent({ oracleType, question });
        setTimeout(() => {
            navigate(`/oracle/${oracleType}`);
        }, 2000);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative w-full max-w-4xl mx-auto px-6 py-20">
            {/* Question Input - Now in IntentionPage */}
            <div className="w-full max-w-md mb-16">
                <textarea
                    ref={textareaRef}
                    placeholder="What guides your spirit today? (Optional)"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-b border-ink/15 dark:border-white/15 py-4 text-center focus:outline-none font-serif italic text-lg placeholder:opacity-30 text-ink dark:text-white resize-none"
                    style={{ color: 'var(--fg)' }}
                />
            </div>

            {/* Oracle Selector */}
            <div className="w-full flex justify-center mb-24">
                <div className="flex gap-16 md:gap-24 items-center">
                    {/* Tarot Option */}
                    <label className="cursor-pointer group flex flex-col items-center gap-3">
                        <input
                            type="radio"
                            name="oracle_type"
                            value="tarot"
                            className="sr-only peer"
                            checked={oracleType === 'tarot'}
                            onChange={(e) => setOracleType(e.target.value as OracleType)}
                        />
                        <div className={`text-ink/20 dark:text-white/20 peer-checked:text-ink dark:peer-checked:text-white transition-all duration-500 pb-2 ${oracleType === 'tarot' ? 'breathing-underline' : ''}`}>
                            <span className="material-symbols-outlined text-[32px] font-light">style</span>
                        </div>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-ink/40 dark:text-white/40 peer-checked:text-ink dark:peer-checked:text-white font-bold transition-colors">Tarot</span>
                    </label>

                    {/* Runes Option */}
                    <label className="cursor-pointer group flex flex-col items-center gap-3">
                        <input
                            type="radio"
                            name="oracle_type"
                            value="runes"
                            className="sr-only peer"
                            checked={oracleType === 'runes'}
                            onChange={(e) => setOracleType(e.target.value as OracleType)}
                        />
                        <div className={`text-ink/20 dark:text-white/20 peer-checked:text-ink dark:peer-checked:text-white transition-all duration-500 pb-2 ${oracleType === 'runes' ? 'breathing-underline' : ''}`}>
                            <span className="material-symbols-outlined text-[32px] font-light">change_history</span>
                        </div>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-ink/40 dark:text-white/40 peer-checked:text-ink dark:peer-checked:text-white font-bold transition-colors">Runes</span>
                    </label>

                    {/* I Ching Option */}
                    <label className="cursor-pointer group flex flex-col items-center gap-3">
                        <input
                            type="radio"
                            name="oracle_type"
                            value="iching"
                            className="sr-only peer"
                            checked={oracleType === 'iching'}
                            onChange={(e) => setOracleType(e.target.value as OracleType)}
                        />
                        <div className={`text-ink/20 dark:text-white/20 peer-checked:text-ink dark:peer-checked:text-white transition-all duration-500 pb-2 ${oracleType === 'iching' ? 'breathing-underline' : ''}`}>
                            <span className="material-symbols-outlined text-[32px] font-light">menu</span>
                        </div>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-ink/40 dark:text-white/40 peer-checked:text-ink dark:peer-checked:text-white font-bold transition-colors">I Ching</span>
                    </label>
                </div>
            </div>

            {/* Launch Button */}
            <div className="fixed bottom-12 left-0 right-0 flex justify-center">
                <button
                    onClick={handleConsult}
                    className="group relative flex items-center gap-4 bg-ink dark:bg-white text-white dark:text-ink h-16 pl-8 pr-10 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out"
                >
                    <Sparkles className="animate-pulse" size={20} />
                    <span className="text-sm font-bold tracking-widest uppercase font-sans">Consult the Void</span>
                    <div className="absolute inset-0 rounded-full bg-ink dark:bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                </button>
            </div>

            {/* Invocation Overlay */}
            <AnimatePresence>
                {isInvoking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/90 dark:bg-ink/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm"
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 border border-ink/10 dark:border-white/10 rounded-full scale-50 animate-ping" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-0 border border-ink/10 dark:border-white/10 rounded-full scale-75 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                            <div className="loading-particle"></div>
                        </div>
                        <p className="mt-8 text-xs tracking-[0.3em] uppercase text-ink/40 dark:text-white/40 animate-pulse">Invoking</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IntentionPage;
