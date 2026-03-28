import { useState, useCallback, useEffect } from 'react';
import { type Rune } from '../constants/runes';
import { drawRunes, interpretRunes, chatWithRunemaster, saveChatHistory, getHistory } from '../services/api';
import { type RuneReading } from '../types';

export const useRunes = () => {
    const [spread, setSpread] = useState<{
        past_rune: Rune;
        present_rune: Rune;
        future_rune: Rune;
    } | null>(null);
    const [drawnCount, setDrawnCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [interpretation, setInterpretation] = useState('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<(RuneReading & { session_id?: string })[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory();
                if (data && data.readings) {
                    setHistory(data.readings.filter((r: any) => r.oracle_type === 'runes'));
                }
            } catch (err) {
                console.error('Failed to load history:', err);
            }
        };
        loadHistory();
    }, []);

    const fetchInterpretation = useCallback(async (
        spreadData: { past_rune: Rune; present_rune: Rune; future_rune: Rune },
        question: string
    ) => {
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
    }, []);

    const handleDraw = useCallback(async (question: string) => {
        if (drawnCount === 0) {
            setIsDrawing(true);
            try {
                const spreadData = await drawRunes();
                setSpread(spreadData);
                setDrawnCount(1);
                setIsDrawing(false);
                await fetchInterpretation(spreadData, question);
            } catch (err) {
                console.error(err);
                setIsDrawing(false);
            }
        } else if (drawnCount < 3) {
            setIsDrawing(true);
            setTimeout(() => {
                setDrawnCount(c => c + 1);
                setIsDrawing(false);
            }, 800);
        }
    }, [drawnCount, fetchInterpretation]);

    const sendMessage = useCallback(async (text: string, currentMessages: { role: 'user' | 'model'; text: string }[]) => {
        if (!text.trim() || isLoading) return;

        const userText = text.trim();
        const newMessages = [...currentMessages, { role: 'user' as const, text: userText }];
        setMessages(newMessages);
        setIsLoading(true);

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
            setIsLoading(false);
        }
    }, [isLoading]);

    const reset = useCallback(() => {
        setSpread(null);
        setDrawnCount(0);
        setInterpretation('');
        setMessages([]);
        setIsDrawing(false);
    }, []);

    const selectFromHistory = useCallback((h: RuneReading) => {
        setSpread({
            past_rune: h.past_rune,
            present_rune: h.present_rune,
            future_rune: h.future_rune
        });
        setInterpretation(h.interpretation);
        setMessages([{ role: 'model', text: h.interpretation }]);
        setDrawnCount(3);
    }, []);

    const saveChat = useCallback(async (sessionId: string | null, msgs: { role: 'user' | 'model'; text: string }[]) => {
        if (msgs.length <= 1) return;
        try {
            await saveChatHistory(sessionId, msgs.slice(1));
            return true;
        } catch (err) {
            console.error('Failed to save chat:', err);
            return false;
        }
    }, []);

    return {
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
    };
};
