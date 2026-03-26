import { useState, useCallback } from 'react';
import { type Message } from '../types';

export const useOracleSession = () => {
    const [isTypingFinished, setIsTypingFinished] = useState(false);
    const [isChatting, setIsChatting] = useState(false);

    const handleTypingComplete = useCallback(() => {
        setIsTypingFinished(true);
    }, []);

    const startChat = useCallback(() => {
        setIsChatting(true);
    }, []);

    const resetSession = useCallback(() => {
        setIsTypingFinished(false);
        setIsChatting(false);
    }, []);

    const hasUserMessages = useCallback((messages: Message[] | { role: string; text: string }[]) => {
        return messages.some(m => m.role === 'user');
    }, []);

    return {
        isTypingFinished,
        isChatting,
        handleTypingComplete,
        startChat,
        resetSession,
        hasUserMessages
    };
};
