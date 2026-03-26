import { useState, useCallback, useEffect } from 'react';
import { type TarotCard } from '../constants/tarot';
import { drawTarotCards, interpretTarot, chatWithTarotReader, saveChatHistory, getHistory } from '../services/api';
import { type TarotReading } from '../types';

export const useTarot = () => {
    const [spread, setSpread] = useState<{
        past_card: TarotCard;
        present_card: TarotCard;
        future_card: TarotCard;
    } | null>(null);
    const [drawnCount, setDrawnCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [interpretation, setInterpretation] = useState('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<(TarotReading & { session_id?: string })[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory();
                if (data && data.readings) {
                    setHistory(data.readings.filter((r: any) => r.oracle_type === 'tarot'));
                }
            } catch (err) {
                console.error('Failed to load history:', err);
            }
        };
        loadHistory();
    }, []);

    const drawCards = useCallback(async (question: string) => {
        setIsDrawing(true);
        try {
            const spreadData = await drawTarotCards();
            setSpread(spreadData);
            setDrawnCount(1);
            await fetchInterpretation(spreadData, question);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDrawing(false);
        }
    }, []);

    const fetchInterpretation = useCallback(async (
        spreadData: { past_card: TarotCard; present_card: TarotCard; future_card: TarotCard },
        question: string
    ) => {
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
    }, []);

    const handleDraw = useCallback(async (question: string) => {
        setIsDrawing(true);

        if (drawnCount === 0) {
            try {
                const spreadData = await drawTarotCards();
                setSpread(spreadData);
                setDrawnCount(1);
                await fetchInterpretation(spreadData, question);
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

            const data = await chatWithTarotReader(historyForApi);
            setMessages([...newMessages, { role: 'model', text: data.text }]);
        } catch (err) {
            console.error(err);
            setMessages([...newMessages, { role: 'model', text: "*(Silence)* Something disturbed the flow." }]);
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

    const selectFromHistory = useCallback((h: TarotReading) => {
        setSpread({
            past_card: h.past_card,
            present_card: h.present_card,
            future_card: h.future_card
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
