import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface TypewriterProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    animate?: boolean;
}

export const Typewriter = ({ text, speed = 10, onComplete, animate = true }: TypewriterProps) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);
    const [index, setIndex] = useState(animate ? 0 : text.length);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            setIndex(text.length);
            if (onComplete) onComplete();
            return;
        }

        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, speed, onComplete, animate]);

    // Reset if text changes (e.g. new message)
    useEffect(() => {
        if (animate) {
            setDisplayedText('');
            setIndex(0);
        } else {
            setDisplayedText(text);
            setIndex(text.length);
        }
    }, [text, animate]);

    return (
        <div className="markdown-body">
            <Markdown>{displayedText}</Markdown>
        </div>
    );
};
