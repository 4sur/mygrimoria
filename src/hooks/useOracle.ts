import { useState, useCallback, useEffect } from 'react';
import { type LineValue, type Reading, type Message } from '../types';
import { getHexagramByBinary, type Hexagram } from '../constants/iching';
import { interpretHexagram, chatWithMaster, getHistory } from '../services/api';
import { useOracleIntent } from '../context/OracleIntentContext';
import { trackReadingCreated } from '../services/analytics';

export const useOracle = () => {
    const [lines, setLines] = useState<LineValue[]>([]);
    const [isCasting, setIsCasting] = useState(false);
    const [reading, setReading] = useState<(Reading & { session_id?: string }) | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<(Reading & { session_id?: string })[]>([]);
    const [question, setQuestion] = useState('');
    const { intent, clearIntent } = useOracleIntent();

    useEffect(() => {
        if (intent?.question) {
            setQuestion(intent.question);
            clearIntent();
        }
    }, [intent, clearIntent]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getHistory();
                if (data && data.readings) {
                    setHistory(data.readings.filter((r: any) => r.oracle_type === 'iching'));
                }
            } catch (err) {
                console.error('Failed to load history:', err);
            }
        };
        loadHistory();
    }, []);

    const castLine = useCallback(() => {
        if (lines.length >= 6) return;

        setIsCasting(true);
        setTimeout(() => {
            const coins = [Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2];
            const sum = coins.reduce((a, b) => a + b, 0) as LineValue;
            const newLines = [...lines, sum];
            setLines(newLines);
            setIsCasting(false);

            if (newLines.length === 6) {
                completeReading(newLines);
            }
        }, 600);
    }, [lines]);

    const completeReading = useCallback(async (finalLines: LineValue[]) => {
        const primaryBinary = finalLines.map(l => (l === 7 || l === 9 ? '1' : '0')).join('');
        const primaryHex = getHexagramByBinary(primaryBinary);

        if (!primaryHex) return;

        let changingHex: Hexagram | undefined;
        const hasChanging = finalLines.some(l => l === 6 || l === 9);

        if (hasChanging) {
            const changingBinary = finalLines.map(l => {
                if (l === 6) return '1';
                if (l === 9) return '0';
                return l === 7 ? '1' : '0';
            }).join('');
            changingHex = getHexagramByBinary(changingBinary);
        }

        const newReading: Reading = {
            lines: finalLines,
            primaryHexagram: primaryHex,
            changingHexagram: changingHex,
            timestamp: Date.now(),
        };

        setReading(newReading);
        setHistory(prev => [newReading, ...prev]);

        setIsLoading(true);
        try {
            const hexagramData = {
                number: primaryHex.number,
                name: primaryHex.name,
                chineseName: primaryHex.chineseName,
                meaning: primaryHex.meaning
            };
            const resultantHexagramData = changingHex ? {
                number: changingHex.number,
                name: changingHex.name,
                chineseName: changingHex.chineseName,
                meaning: changingHex.meaning
            } : undefined;
            
            const data = await interpretHexagram(hexagramData, finalLines, question, resultantHexagramData);
            const { text, session_id } = data;

            const enrichedReading = { ...newReading, session_id };
            setReading(enrichedReading);
            setMessages([{ role: 'model', text }]);
            setHistory(prev => [enrichedReading, ...prev.slice(1)]);
            
            trackReadingCreated('iching', primaryHex.name);
        } catch (error) {
            console.error(error);
            setMessages([{ role: 'model', text: "The oracle is silent. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    }, [question]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg = text.trim();
        const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const chatHistory = newMessages.map(m => ({
                role: m.role,
                content: m.text
            }));

            const data = await chatWithMaster(chatHistory);
            setMessages(prev => [...prev, { role: 'model', text: data.text || "" }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "I cannot find the words right now." }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading]);

    const reset = useCallback(() => {
        setLines([]);
        setReading(null);
        setMessages([]);
    }, []);

    const selectFromHistory = useCallback((reading: Reading) => {
        setReading(reading);
        setMessages([]);
    }, []);

    return {
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
    };
};
