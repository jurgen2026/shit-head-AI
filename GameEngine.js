// #region -- IMPORTS --

// The event bus is created before export so it's the same for both App.jsx and the game engine
import { eventBus } from "../event-system/eventBus.ts";
import { getRandomItem, getShuffledArray, generateUUID } from "../utils/getFunctions.ts";
import { suitOrder, unshuffledDeck } from "../data/cardData.ts";
import GameState  from "./GameState.js";

/*
import { convertCardsForFrontEnd } from "../data/cardData.ts";

import { useCardStore } from "../stores/cardStore.ts"
import { useGameBoardStore } from "../stores/gameBoardStore.ts";
import { useGameStore } from "../stores/gameStore.ts";
import { useLocalPlayerStore } from "../stores/localPlayerStore.ts";
import { usePlayerStore } from "../stores/playerStore.ts";
*/

//import { type Player } from "../types/playerTypes.js";
//import { type UIcardData } from "../types/cardTypes.js";

// #endregion

export default class GameEngine {
    static GAME_STORES = [] // static GAME_STORES = [useCardStore, useGameBoardStore, useGameStore, useLocalPlayerStore, usePlayerStore];
    static NAMES = ['Smeve', 'Smevlin', 'Smitticus', 'Ollies aborted feetus', 'Jamal']


    
    constructor() {
        this.id = generateUUID();
        this.gameState = new GameState;
    }

    setUpEventListeners() {

        const eventHandlers = {
            
            HAND_CLEARED_REQUESTED: (eventData) => {
                const { player } = eventData;
                this.clearHand(player);
            },

            DRAW_CARDS_REQUESTED: (eventData) => {
                let { player, amount } = eventData;
                console.log(`Draw request has been received with this data ${eventData}`);

                // -- VALIDATION CHECKS --
                //#region
                if (!this.gameState.getDeck()) {
                    console.log("Can't draw cards as no deck currently exists");
                    return;
                }

                if (!player) {
                    console.log("Requested player doesn't exist (maybe no local player is set)");
                    return;
                }

                if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
                    console.log(`Amount = ${amount} is an invalid card request`)
                    return;
                }
                //#endregion

                // Clamp amount to the length of the deck
                amount = Math.min(amount, this.gameState.getDeck().length);
                this.drawCards(player, amount);
            },

            PLAY_CARDS_REQUESTED: (eventData) => {
                const { player, cards } = eventData;

                console.log('Card received for play request were: ', cards);

                if (cards.length > 1) {
                    console.log('Too many cards played for now');
                    return;
                }

                this.playCards(player, cards);
            },

            VALIDATE_CARDS_REQUESTED: (eventData) => {
                const {player, cards} =  eventData;
                console.log(`Validate request has been received with this data ${eventData}`);

                // -- CHECK IF CARDS HAVE ACTUALLY BEEN SENT --

                if (!cards) {
                    console.log("Play request denied as no cards were sent in the data package")
                    return;
                }
                
                const cardValidationList = cards.map( (card) => {
                    return this.validateCard(card);
                })

                console.log('Validation list is: ', cardValidationList);

                eventBus.emit('CARD_VALIDATION_COMPLETE', {
                    cardValidationList
                })
            },

            PICK_UP_STACK_REQUESTED: (eventData) => {
                const { player } = eventData;
                this.pickUpStack(player);
            },
        };

        eventBus.setUpEventListeners(eventHandlers, 'gameEngine');
    }

    setUpStoreEventListeners() {
        GameEngine.GAME_STORES.forEach((store) => {
            store.getState().setUpStoreEventListeners();
        });
    }

    advanceTurn() {
        // Reset turn index if everyone's had their turn
        const nextTurnIndex = (this.gameState.turnIndex + 1) % this.gameState.playerList.length;
        this.gameState.turnIndex = nextTurnIndex;

        eventBus.emit("INITIALISE_NEW_TURN", {
            turnIndex: nextTurnIndex,
            player: this.gameState.playerList[this.gameState.turnIndex]
        })
    }

    initialiseCards() {
        let cards = unshuffledDeck;
        cards = getShuffledArray(cards);
        this.gameState.setDeck(cards);

        eventBus.emit("CARDS_INITIALISED", {
            deck: this.gameState.getDeck(),
        })
    }

    shuffleDeck() {
       const shuffledDeck = getShuffledArray(this.gameState.getDeck());
       this.gameState.setDeck(shuffledDeck);
    }

    initialisePlayers() {

        for (let i = 0; i < this.gameState.playerNumber; i++) {

            const name = getRandomItem(GameEngine.NAMES);
            
            const player = {
                id: generateUUID(),
                name,
                index: this.gameState.playerList.length

                // Additional data we may want to have
            };

            this.gameState.playerList.push(player);
            
            this.gameState.zones[`${player.id}_hand`] = [];
            this.gameState.zones[`${player.id}_faceUps`] = [];
            this.gameState.zones[`${player.id}_blinds`] = [];

            eventBus.emit("PLAYER_INITIALISED", { player });
        }

        console.log('Player list before event: ', this.gameState.playerList)

        eventBus.emit("PLAYER_INITIALISATION_RESOLVED", {
            playerList: this.gameState.playerList
        });
    }

    // This can be way more efficient this is shocking (abysmal coding)

    dealBlinds() {
        this.gameState.playerList.forEach( (player) => {
            this.drawBlinds(player, this.gameState.startingBlinds);
        })
    }

    dealHands() {
        this.gameState.playerList.forEach( (player) => {
            console.log('Testing starting hand size before draw cards is called ', this.gameState.getStartingHandSize())
            this.drawCards(player, this.gameState.getStartingHandSize());
        })
    }

    drawBlinds(player, amount) {
        for (let i = 0; i < amount; i++) {
            const newCard = this.gameState.getDeck().shift();
            this.gameState.getBlinds(player).push(newCard);
        }

        const playerBlinds = this.gameState.getBlinds(player);

        console.log("Log before blinds event is emitted")
        eventBus.emit("BLINDS_DRAWN_RESOLVED", {
            player,
            blindsDrawn: playerBlinds,
        })
    }

    drawCards(player, amount) {
        console.log("Amount to draw is ", amount)
        let cardsDrawn = []

        for (let i = 0; i < amount; i++) {
            const newCard = this.gameState.getDeck().shift();
            cardsDrawn.push(newCard);
        }

        const playerHand = this.gameState.getHand(player);
        playerHand.push(...cardsDrawn);

        this.gameState.setHand(player, this.sortCards(playerHand));

        eventBus.emit("CARDS_DRAWN_RESOLVED", {
            player,
            cardsDrawn,
            playerHand: this.gameState.getHand(player),
        })
    }

    playCards(player, cardsPlayed) {

        // Set the stack to include the new cards
        const stack = this.gameState.getStack();

        this.gameState.setStack([...stack, ...cards]);
        this.gameState.stackValue = this.setStackValue(cardsPlayed[0]);
        this.gameState.stackEffect = this.setStackEffect(cardsPlayed[0]);

        console.log('Stack is now: ',  this.gameState.getStack());
        console.log('Stack value is now: ', this.gameState.stackValue)
        console.log('Cards received was ', cards);

        // Remove them from the players hand
        const newPlayerHand = this.gameState.getHand(player).filter(card => !cardsPlayed.includes(card));
        this.gameState.setHand(player, this.sortCards(newPlayerHand));

        eventBus.emit("CARDS_PLAYED", {
            player,
            playerHand: this.gameState.getHand(player),
            cardsPlayed,
        })
    }

    pickUpStack(player) {
        const stack = this.gameState.getStack();
        const newPlayerHand = [
            ...this.gameState.getHand(player),
            ...stack
        ];

        this.gameState.setHand(player, this.sortCards(newPlayerHand));

        this.gameState.setStack([]);
        this.gameState.stackValue = null;

        eventBus.emit('STACK_PICKED_UP', {
            player,
            cardsPickedUp: stack,
            playerHand: cthis.gameState.getHand(player),
        });
    }

    clearHand(player) {
        this.gameState.setHand(player, []);
        eventBus.emit('HAND_CLEARED', { player });
    }

    clearZone(zoneKey) {
        if (this.gameState.zones[zoneKey]) {
            this.gameState.zones[zoneKey] = [];
            console.log(`Cleared zone: ${zoneKey}`);
            eventBus.emit("ZONE_CLEARED", { zoneKey });
        }
    }

    async resolveTurn(player) {
        const playerHand = this.gameState.getHand(player);
        // ! Return true condition once turn mechanics are implemented
        const isInInitialPhase = false//(this.gameState.getDeck.length > 0);
        const playerBelowMinCards = (playerHand.length < this.gameState.minCards );

        if (isInInitialPhase && playerBelowMinCards) {
            const cardsToDraw = playerHand.length - this.gameState.minCards;

            // The aim is the the turn ended event is emitted until the draw card animation is over
            await eventBus.executeAndWait(
                () => { this.drawCards(player, cardsToDraw) },
                "CARDS_DRAWN_ANIMATION_COMPLETE"
            );
        }

        eventBus.emit("TURN_ENDED")
    }

    async setFaceUps() {
        // This will need to be done much differently for the actual thing but this'll do for now

        for (let i=0; i<this.gameState.playerNumber; i++) {

            const player = this.gameState.playerList[i];

            const { payload } = await eventBus.executeAndWait(
                () => { eventBus.emit("FACE_UPS_DEMANDED", { 
                    player,
                    playerHand: this.gameState.getHand(player),
                })},
                "FACE_UPS_SUBMITTED",
                /*
                {
                    condition: (payload.player === player)
                }*/ // todo: add condition and even figure out how conditions work for execute and await
            )

            const faceUpsSelected = payload.faceUpsSelected;
            this.gameState.setFaceUps(faceUpsSelected);

            const newPlayerHand = this.gameState.getHand(player).filter(card => !faceUpsSelected.includes(card));
            this.gameState.setHand(player, this.sortCards(newPlayerHand));

            eventBus.emit("FACE_UPS_SELECTED_RESOLVED", {
                player,
                faceUps: faceUpsSelected,
                playerHand: this.gameState.getHand(player)
            })
        }
    }

    setStackValue(topCard) {
        if (topCard.effect === 'reset') {
            return 0;
        }

        if (topCard.effect === 'ignore') {
            return this.gameState.stackValue; // keeps the old stack value
        }

        return topCard.value;
    }

    setStackEffect(topCard) {
        if (topCard.effect === 'ignore') {
            return this.gameState.stackEffect;
        }

        if (topCard.effect === 'goLower') {
            return 'goLower';

        } else {
            return null;
        }
    }

    sortCards(cards) {
        return [...cards].sort((a, b) => {
            // 1️⃣ Sort by value (low → high)
            if (a.value !== b.value) {
                return a.value - b.value;
            }

            // 2️⃣ Sort by suit order (high → low)
            return (suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit));
        });
    }

    validateCard(card) {
        console.log('Stack value is currently: ', this.gameState.stackValue);

        if (!this.gameState.stackValue) {
            return true;
        }

        if (card.effect === 'reset' || card.effect === 'ignore') {
            return true;
        }

        if (this.gameState.stackEffect === 'goLower') {
            return card.value <= this.gameState.stackValue;
        }

        return card.value >= this.gameState.stackValue;
    }
}
