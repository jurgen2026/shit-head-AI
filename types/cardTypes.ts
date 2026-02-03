export interface CardData {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
    value: number;
    effect: StackEffect;
    ID: CardID;
}

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
export type Suit = 'H' | 'D' | 'C' | 'S';

export type CardID = `${Rank}${Suit}`;

export type StackEffect = 'none' | 'skip' | 'reverse' | 'ignore' | 'reset' | 'goLower';
export type StackTopCard = CardData | null;
export type StackTopCardID = CardID | null;