import type { CardData, CardID } from "../types/cardTypes";



export const suitOrder: Array<CardData['suit']> = ['spades', 'hearts', 'clubs', 'diamonds'];

export const unshuffledDeck: CardData[] = [
  // Hearts
  { suit: 'hearts', rank: 'A', value: 14, effect: 'none', ID: 'AH' },
  { suit: 'hearts', rank: '2', value: 2, effect: 'reset', ID: '2H' },
  { suit: 'hearts', rank: '3', value: 3, effect: 'reset', ID: '3H' },
  { suit: 'hearts', rank: '4', value: 4, effect: 'ignore', ID: '4H' },
  { suit: 'hearts', rank: '5', value: 5, effect: 'none', ID: '5H' },
  { suit: 'hearts', rank: '6', value: 6, effect: 'none', ID: '6H' },
  { suit: 'hearts', rank: '7', value: 7, effect: 'goLower', ID: '7H' },
  { suit: 'hearts', rank: '8', value: 8, effect: 'skip', ID: '8H' },
  { suit: 'hearts', rank: '9', value: 9, effect: 'none', ID: '9H' },
  { suit: 'hearts', rank: 'T', value: 10, effect: 'reverse', ID: 'TH' },
  { suit: 'hearts', rank: 'J', value: 11, effect: 'none', ID: 'JH' },
  { suit: 'hearts', rank: 'Q', value: 12, effect: 'none', ID: 'QH' },
  { suit: 'hearts', rank: 'K', value: 13, effect: 'none', ID: 'KH' },

  // Diamonds
  { suit: 'diamonds', rank: 'A', value: 14, effect: 'none', ID: 'AD' },
  { suit: 'diamonds', rank: '2', value: 2, effect: 'reset', ID: '2D' },
  { suit: 'diamonds', rank: '3', value: 3, effect: 'reset', ID: '3D' },
  { suit: 'diamonds', rank: '4', value: 4, effect: 'ignore', ID: '4D' },
  { suit: 'diamonds', rank: '5', value: 5, effect: 'none', ID: '5D' },
  { suit: 'diamonds', rank: '6', value: 6, effect: 'none', ID: '6D' },
  { suit: 'diamonds', rank: '7', value: 7, effect: 'goLower', ID: '7D' },
  { suit: 'diamonds', rank: '8', value: 8, effect: 'skip', ID: '8D' },
  { suit: 'diamonds', rank: '9', value: 9, effect: 'none', ID: '9D' },
  { suit: 'diamonds', rank: 'T', value: 10, effect: 'reverse', ID: 'TD' },
  { suit: 'diamonds', rank: 'J', value: 11, effect: 'none', ID: 'JD' },
  { suit: 'diamonds', rank: 'Q', value: 12, effect: 'none', ID: 'QD' },
  { suit: 'diamonds', rank: 'K', value: 13, effect: 'none', ID: 'KD' },

  // Clubs
  { suit: 'clubs', rank: 'A', value: 14, effect: 'none', ID: 'AC' },
  { suit: 'clubs', rank: '2', value: 2, effect: 'reset', ID: '2C' },
  { suit: 'clubs', rank: '3', value: 3, effect: 'reset', ID: '3C' },
  { suit: 'clubs', rank: '4', value: 4, effect: 'ignore', ID: '4C' },
  { suit: 'clubs', rank: '5', value: 5, effect: 'none', ID: '5C' },
  { suit: 'clubs', rank: '6', value: 6, effect: 'none', ID: '6C' },
  { suit: 'clubs', rank: '7', value: 7, effect: 'goLower', ID: '7C' },
  { suit: 'clubs', rank: '8', value: 8, effect: 'skip', ID: '8C' },
  { suit: 'clubs', rank: '9', value: 9, effect: 'none', ID: '9C' },
  { suit: 'clubs', rank: 'T', value: 10, effect: 'reverse', ID: 'TC' },
  { suit: 'clubs', rank: 'J', value: 11, effect: 'none', ID: 'JC' },
  { suit: 'clubs', rank: 'Q', value: 12, effect: 'none', ID: 'QC' },
  { suit: 'clubs', rank: 'K', value: 13, effect: 'none', ID: 'KC' },

  // Spades
  { suit: 'spades', rank: 'A', value: 14, effect: 'none', ID: 'AS' },
  { suit: 'spades', rank: '2', value: 2, effect: 'reset', ID: '2S' },
  { suit: 'spades', rank: '3', value: 3, effect: 'reset', ID: '3S' },
  { suit: 'spades', rank: '4', value: 4, effect: 'ignore', ID: '4S' },
  { suit: 'spades', rank: '5', value: 5, effect: 'none', ID: '5S' },
  { suit: 'spades', rank: '6', value: 6, effect: 'none', ID: '6S' },
  { suit: 'spades', rank: '7', value: 7, effect: 'goLower', ID: '7S' },
  { suit: 'spades', rank: '8', value: 8, effect: 'skip', ID: '8S' },
  { suit: 'spades', rank: '9', value: 9, effect: 'none', ID: '9S' },
  { suit: 'spades', rank: 'T', value: 10, effect: 'reverse', ID: 'TS' },
  { suit: 'spades', rank: 'J', value: 11, effect: 'none', ID: 'JS' },
  { suit: 'spades', rank: 'Q', value: 12, effect: 'none', ID: 'QS' },
  { suit: 'spades', rank: 'K', value: 13, effect: 'none', ID: 'KS' }
];

export function getCardIDs(cardList: CardData[]): CardID[] {
    return cardList.map((card) => {
        return card.ID;
    })
}

export function getCardsByID(cardIDs: CardID[]): CardData[] {
    // Create a lookup map for O(1) access
    const cardMap = new Map(unshuffledDeck.map(card => [card.ID, card]));
    
    // Filter out any ID values that don't exist
    return cardIDs
        .map(ID => cardMap.get(ID))
        .filter((card): card is CardData => card !== undefined);
}

export function getCardStrings(cardIDs: CardID[]): string[] {

    return cardIDs.map((card) => {
        const suitSymbol = {
            'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠'
        }[card[1]] || '?';

        return `${card[0]}${suitSymbol}`;
    })
}