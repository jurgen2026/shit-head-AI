import * as readline from 'readline';
import { eventBus } from '../event-system/eventBus.ts';
import type { EventHandlerMap, GameEvents, CardData } from '../event-system/eventTypes.ts';
import { getCardStrings } from '../data/cardData.ts';

interface InputCondition {
    condition: Condition<string[]>, 
    errorMessage: string,
}

type Condition<T> = (item: T) => boolean;
type ConditionsList<T> = Condition<T>[]
type ParseFunction = (stringToParse: string) => any;

// ! Probably terrible coding and should be redone but oh well
function containsAllCards(
    simplifiedList: string[],
    cardList: CardData[]
): boolean {

    const cardSet = new Set(cardList.map(card => card.simplified));
    return simplifiedList.every(card => cardSet.has(card));
}

class GameConsole {

    private rl: readline.Interface;
  
    constructor() {
        this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
        });
    }
    
    askQuestion(question: string): Promise<string> {
        return new Promise((resolve) => {
        this.rl.question(question, resolve);
        });
    }
    
    close(): void {
        this.rl.close();
    }

    parseCardInput(cardString: string): string[] | undefined {

        if (cardString.length % 2 !== 0) { return undefined }
        const parsedCards = cardString.match(/.{1,2}/g)
        return parsedCards!;
    }

    async resolveInput(
        question: string, 
        inputConditions: ConditionsList<InputCondition>,
        parseFunction: ParseFunction = this.parseCardInput,

    ): Promise<string> {

        while (true) {
            try {
                let userInput = await this.askQuestion(question);
                userInput = parseFunction(userInput);
                
                inputConditions.forEach((condition) => {

                });

            } catch (error) {
                console.log(`Error: ${error}`);
            }
        }
    }

    async setUpEventListeners() {

        const eventHandlers: EventHandlerMap<GameEvents> = {

            PLAYER_INITIALISATION_RESOLVED: (payload) => {
                const { playerList } = payload;

                playerList.forEach( (player) => {
                    console.log(player.name + " is in the game");
                })
            },

            BLINDS_DRAWN_RESOLVED: (payload) => {
                const { player, blindsDrawn } = payload;
                console.log(`${player.name} has drawn ${getCardStrings(blindsDrawn)} as their blinds`)
            },

            CARDS_DRAWN_RESOLVED: (payload) => {
                const { player, playerHand, cardsDrawn } = payload;

                console.log(`${player.name} has drawn ${getCardStrings(cardsDrawn)}`)
                console.log(`${player.name} now has hand ${getCardStrings(playerHand)}`)
            },

            FACE_UPS_DEMANDED: (payload) => {
                const { player, playerHand } = payload;

                const selectedCards:  = this.resolveInput(
                    "Select three cards from your hand to be your face ups (write cards like 2H, TS, QC etc.)",
                    [
                        {
                            condition: (userInput: string[]) => { return (userInput.length === 3) },
                            error
                        }
                        (userInput: string[]) => {
                            return containsAllCards(
                                userInput,
                                playerHand
                            )
                        }
                    ],
                )

                console.log(selectedCards);
            }
        }

        eventBus.setUpEventListeners(eventHandlers, "gameConsole");
    }
}

export const gameConsole = new GameConsole;