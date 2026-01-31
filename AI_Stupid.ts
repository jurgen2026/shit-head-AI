import type { PlayerAction, AvailableValues } from "../types/generalTypes";
import type { EventHandlerMap, GameEvents } from "../types/eventTypes.ts";
import type { Rank, CardID } from "../types/cardTypes.ts";
import type { PlayerInterface } from "../types/playerTypes.ts";
import { moveItem } from "../utils/moveItem.ts";
import { getCardsByID } from "../data/cardData.ts";

import { getRandomNumber, getRandomItem } from "../utils/getFunctions.ts";
import { eventBus } from "../utils/eventBus.ts";

export default class AI_Stupid {

    private index: number;

    constructor(index: number) {
        this.index = index;
    }

    generateRandomMove(activePlayer: PlayerInterface, availableActions: PlayerAction[], availableCards: CardID[], availableValues: AvailableValues) {
        // PLAY NORMAL CARDS
        if (availableActions.includes("playValues")) {
            const chosenMoveValue = getRandomItem(availableValues);
            
            for(let i=0; i<availableCards.length-1; i++)
                if (availableCards[i][0] === chosenMoveValue) {
                    return availableCards[i]
            }
        // PLAY FACE UPS 
        else if (availableActions.includes("playFaceUps") === true) {
            //Check which Face ups are available
            const chosenMoveValue = getRandomItem(availableValues)

            //Choose a random one
            for(let i=0; i<availableCards.length-1; i++)
                if (availableCards[i][0] === chosenMoveValue) {
                    return availableCards[i]
            }
        }} /*
        // PLAY BLIND
        else if (availableActions.includes("PlayBlinds") === true) {

            if (PlayerBlinds[0] != null) {
                return PlayerBlinds[0]
            }
            else if (PlayerBlinds[1] != null) {
                return PlayerBlinds[1]
            }
            else {
                return PlayerBlinds[2]
            }
        }
        //NO OTHER OPTIONS - YOU SUCK
        else {
            return {
                actionSelected: "pickUpStack",
                cardSelected: []
            }
        }
            */
    }

    chooseFaceUps(playerHand: CardID[]) {
        const cardValues: Record<string, number> = {
            //Only Uses the first digit of the card in hand
            "4" : 1,
            "2" : 0.9,
            "3" : 0.9,
            "A" : 0.8,
            "K" : 0.7,
            "Q" : 0.6,
            "J" : 0.5,
            "T" : 0.4,
            "9" : 0.3,
            "7" : 0.2,
            "8" : 0.1,
            "5" : 0.09,
            "6" : 0.08,
        }
        
        const handCharacters = playerHand.map((str: string) => {
            return str[0]
        })

        const handValue = handCharacters.map((char: string) => {
            const value = cardValues[char]
            return value
        })
        
        console.log(handValue)

        let chosenValues: Rank[] = [];
        for (let i=0; i<3; i++) {
            const maxValue = Math.max(handValue);
            moveItem(handValue, chosenValues, maxValue)
        }

        return chosenValues;
        
        // use an algorithm to find the greatest combination of cards using the dictionary

    }

    setUpEventListeners() {
    
        const eventHandlers: EventHandlerMap<GameEvents> = {

            "FACE_UPS_DEMANDED": (payload) => {
                const { player, playerHand } = payload;
                if (player.index === this.index) {
                    const chosenValues = this.chooseFaceUps(playerHand);

                    eventBus.emit("FACE_UPS_SUBMITTED", {
                        player,
                        faceUpsSelected: chosenValues,
                        playerHand: getCardsByID(playerHand),
                    })
                }
            },

            "ACTIVE_PLAYER_ACTION_DEMANDED": (payload) => {
                const { activePlayer, activePlayerHand, availableActions, availableValues, stackTopCard } = payload
                const selectedCard = this.generateRandomMove(activePlayer, activePlayerHand, availableActions, availableValues);
            }
        }

        eventBus.setUpEventListeners(eventHandlers);
    }
}

/*
Level 1: simple random number generation type shit
Level 2: statistical sampling: any human move
Level 3: statistical sampling: any winning human move
Level 4: min-max algorithm
Level 5: adding a neural element

*/