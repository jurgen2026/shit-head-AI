import * as readline from 'readline';
import { eventBus } from '../utils/eventBus.ts';
import type { EventHandlerMap, GameEvents } from '../types/eventTypes.ts';
import type { CardData, CardID, Rank, StackTopCard } from '../types/cardTypes.ts';
import type { PlayerInterface } from '../types/playerTypes.ts';
import type { PlayerAction, AvailableValues } from '../types/generalTypes.ts';
import { getCardStrings, getCardsByID, getCardIDs, } from '../data/cardData.ts';

import type { SingleKeyCommands } from '../types/consoleTypes.ts';
import delay from '../utils/delay.ts';

type InputAcceptanceCondition<T> = (userInput: T) => boolean;

type ConditionsList<T> = InputAcceptanceCondition<T>[]
type ParseFunction = (stringToParse: string) => string[] | undefined;

type ConsoleActions = "viewHand" | "viewFaceUps";

interface KeyCommandInterface {
    action: ConsoleActions | PlayerAction;
    actionType: "gameAction" | "consoleAction";
    condition?: (ctx: any) => boolean;
}

const keyCommands: Record<SingleKeyCommands, KeyCommandInterface>   = {
    p: {
        action: "pickUpStack",
        actionType: "gameAction",
        condition: (ctx) => { return ctx.availableActions.includes('pickUpStack') }
    },

    h: {
        action: "viewHand",
        actionType: "consoleAction",
    },

    f: {
        action: "viewFaceUps",
        actionType: "consoleAction",
    }
}

// ! Probably terrible coding and should be redone but oh well
function containsAllCards(
    inputList: string[],
    cardList: CardID[]
): boolean {

    return inputList.every(card => cardList.has(card));
}

async function canPlayCards(
    player: PlayerInterface,
    cards: CardID[],
): Promise<boolean> {

    const { payload } = await eventBus.executeAndWait(
        () => { eventBus.emit("VALIDATE_CARDS_REQUESTED", {
            player,
            cards: getCardsByID(cards),
        })},
        "CARD_VALIDATION_RESOLVED"
    )

    return (payload.cardValidationList[0] === true);
}

function isValidRank(value: string, availableValues: AvailableValues): value is Rank {
  return availableValues.includes(value as Rank);
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

    async handleActivePlayerActionDemanded(
        activePlayer: PlayerInterface, 
        activePlayerHand: CardID[], 
        availableActions: PlayerAction[],
        availableValues: AvailableValues,
        stackTopCard: StackTopCard,
    ) {


        const { selectedAction, selectedCards } = await this.resolveInput(
            `Type a card from your hand to play it (multiple not added yet)\n` +
            `You have hand ${activePlayerHand}\n` +
            `Top card of the stack is ${stackTopCard}\n` +
            `${availableActions.includes('pickUpStack') ? `Press P to pick up stack\n` : ''}`,
            activePlayerHand,
            availableActions,
            availableValues,
            this.parseCardInput,
        );

        console.log(`Action selected was ${selectedAction} ${selectedCards.length > 0 ? `with cards ${selectedCards}` : ''}`)
        eventBus.emit("ACTIVE_PLAYER_ACTION_SUBMITTED", {
            selectedAction,
            selectedCards: getCardsByID(selectedCards),
        })
    }

    async handleFaceUpsDemanded(player: PlayerInterface, playerHand: CardID[]) {

        const { selectedAction, selectedCards} = await this.resolveInput(
            `\n${player.name} select three cards from your hand to be your face ups (write cards like 2H, TS, QC etc.)\n` +
            `You have hand ${playerHand}\n`,
            playerHand,
            ['selectFaceUps'],
            [],
            this.parseCardInput,
        );

        console.log('Selected cards were: ', selectedCards);
        eventBus.emit("FACE_UPS_SUBMITTED", {
            player,
            playerHand: getCardsByID(playerHand),
            faceUpsSelected: getCardsByID(selectedCards),
        })
    }

    parseCardInput(cardString: string): string[] | undefined {

        if (cardString.length % 2 !== 0) { return undefined }
        const parsedCards = cardString.match(/.{1,2}/g)
        return parsedCards!;
    }

    async resolveInput(
        question: string, 
        playerHand: CardID[],
        availableActions: PlayerAction[],
        availableValues: AvailableValues,
        parseFunction: ParseFunction = this.parseCardInput,

    ): Promise<{
        selectedAction: PlayerAction,
        selectedCards: CardID[],
    }> {

        while (true) {
            try {
                let userInput = await this.askQuestion(question);

                if (availableActions.includes('pickUpStack')) {
                    if (userInput === 'p') {
                        return {
                            selectedAction: 'pickUpStack',
                            selectedCards: [],
                        }
                    }
                }

                if (availableActions.includes("playValues")) {
                    const parsedUserInput = parseFunction(userInput);
                    const inputValue = parsedUserInput![0][0]

                    if (parsedUserInput?.every(card => (card[0] === inputValue 
                        && isValidRank(inputValue, availableValues)
                        && playerHand.includes(card as CardID)
                    ))) {
                        return {
                            selectedAction: "playValues",
                            selectedCards: parsedUserInput as CardID[],
                        }
                    }
                }

                if (availableActions.includes("selectFaceUps")) {
                    const parsedUserInput = parseFunction(userInput);

                    if (parsedUserInput?.every(card => (playerHand.includes(card as CardID)))
                        && parsedUserInput.length === 3
                    ) {
                        return {
                            selectedAction: "selectFaceUps",
                            selectedCards: parsedUserInput as CardID[],
                        }
                    }
                }

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

            CARDS_DRAWN_RESOLVED: async (payload) => {
                const { player, playerHand, cardsDrawn } = payload;

                console.log(`${player.name} has drawn ${getCardStrings(cardsDrawn)}`)
                console.log(`${player.name} now has hand ${getCardStrings(playerHand)}`)
            },

            CARDS_PLAYED_RESOLVED: (payload) => {
                const { player, playerHand, cardsPlayed } = payload;

                console.log(`${player.name} has played ${getCardStrings(cardsPlayed)}`)
                console.log(`${player.name} now has hand ${getCardStrings(playerHand)}`)
            },

            FACE_UPS_DEMANDED: (payload) => {
                const { player, playerHand } = payload;
                this.handleFaceUpsDemanded(player, playerHand);
            },

            FACE_UPS_SELECTED_RESOLVED: (payload) => {
                const { player, faceUps, playerHand } = payload;

                console.log(player.name, " has selected ", getCardStrings(faceUps));
                console.log(player.name, " now has hand ", getCardStrings(playerHand));
            },

            ACTIVE_PLAYER_ACTION_DEMANDED: (payload) => {
                const { activePlayer, activePlayerHand, availableActions, availableValues, stackTopCard } = payload;
                this.handleActivePlayerActionDemanded(activePlayer, activePlayerHand, availableActions, availableValues, stackTopCard);
            },

            STACK_PICKED_UP: (payload) => {
                const { player, cardsPickedUp, playerHand } = payload;
                console.log(`${player.name} has picked up ${getCardStrings(cardsPickedUp)} and now has hand ${getCardStrings(playerHand)}\n`)
                console.log(`Stack is now empty`)
            }
        }

        eventBus.setUpEventListeners(eventHandlers, "gameConsole");
    }
}

export const gameConsole = new GameConsole;