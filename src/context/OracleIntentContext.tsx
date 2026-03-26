import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type OracleType = 'iching' | 'tarot' | 'runes';

interface OracleIntent {
    oracleType: OracleType;
    question: string;
}

interface OracleContextType {
    intent: OracleIntent | null;
    setIntent: (intent: OracleIntent) => void;
    clearIntent: () => void;
}

const OracleContext = createContext<OracleContextType | undefined>(undefined);

export function OracleProvider({ children }: { children: ReactNode }) {
    const [intent, setIntentState] = useState<OracleIntent | null>(null);

    const setIntent = useCallback((intent: OracleIntent) => {
        setIntentState(intent);
    }, []);

    const clearIntent = useCallback(() => {
        setIntentState(null);
    }, []);

    return (
        <OracleContext.Provider value={{ intent, setIntent, clearIntent }}>
            {children}
        </OracleContext.Provider>
    );
}

export function useOracleIntent() {
    const context = useContext(OracleContext);
    if (!context) {
        throw new Error('useOracleIntent must be used within OracleProvider');
    }
    return context;
}
