import { type Hexagram } from '../constants/iching';

export type LineValue = 6 | 7 | 8 | 9;

export interface Reading {
    lines: LineValue[];
    primaryHexagram: Hexagram;
    changingHexagram?: Hexagram;
    timestamp: number;
}

export interface Message {
    role: 'user' | 'model';
    text: string;
}
import { type TarotCard } from '../constants/tarot';
import { type Rune } from '../constants/runes';

export interface TarotReading {
    past_card: TarotCard;
    present_card: TarotCard;
    future_card: TarotCard;
    interpretation: string;
    timestamp: number;
}

export interface RuneReading {
    past_rune: Rune;
    present_rune: Rune;
    future_rune: Rune;
    interpretation: string;
    timestamp: number;
}
