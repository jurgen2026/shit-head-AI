// #region -- IMPORTS --

// The event bus is created before export so it's the same for both App.jsx and the game engine
import { eventBus } from "../utils/eventBus.ts";
import { getRandomItem, getShuffledArray, generateUUID } from "../utils/getFunctions.ts";
import { suitOrder, unshuffledDeck, getCardIDs } from "../data/cardData.ts";
import GameState  from "./GameState.ts";
import AI_Stupid from "./AI_Stupid.ts";

import type { EventHandlerMap, GameEvents } from "../types/eventTypes.ts";
import type { PlayerInterface } from "../types/playerTypes.ts"; 
import type { PlayerAction, AvailableValues, ZoneType } from "../types/generalTypes.ts";
import type { CardData, Rank, StackTopCard } from "../types/cardTypes.ts";

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

    public readonly id: string;
    private gameState: GameState;
    readonly playing: boolean
    
    constructor() {
        this.id = generateUUID();
        this.gameState = new GameState;
        this.playing = this.gameState.playing;
    }

    setUpEventListeners() {

        const eventHandlers: EventHandlerMap<GameEvents> = {
            
            HAND_CLEARED_REQUESTED: (eventData) => {
                const { player } = eventData;
                this.clearHand(player);
            },

            DRAW_CARDS_REQUESTED: (eventData) => {
                let { player, amount } = eventData;

                // -- VALIDATION CHECKS --
                //#region
                if (!this.gameState.getDeck()) {
                    return;
                }

                if (!player) {

                    return;
                }

                if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
                    return;
                }
                //#endregion

                // Clamp amount to the length of the deck
                amount = Math.min(amount, this.gameState.getDeck().length);
                this.drawCards(player, amount);
            },

            PLAY_CARDS_REQUESTED: (eventData) => {
                const { player, cards } = eventData;



                if (cards.length > 1) {
                    return;
                }

                this.playCards(player, cards);
            },

            VALIDATE_CARDS_REQUESTED: (eventData) => {
                const {player, cards} =  eventData;

                // -- CHECK IF CARDS HAVE ACTUALLY BEEN SENT --

                if (!cards) {
                    return;
                }
                
                const cardValidationList = cards.map( (card) => {
                    return this.validateCard(card);
                })


                eventBus.emit('CARD_VALIDATION_RESOLVED', {
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
            // store.getState().setUpStoreEventListeners();
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

        eventBus.emit("CARDS_INITIALISED_RESOLVED", {
            deck: getCardIDs(this.gameState.getDeck()),
        })
    }

    shuffleDeck() {
       const shuffledDeck = getShuffledArray(this.gameState.getDeck());
       this.gameState.setDeck(shuffledDeck);
    }

    initialisePlayers() {

        for (let i = 0; i < this.gameState.playerNumber; i++) {

            const name = getRandomItem(GameEngine.NAMES) || "Smoblin";
            
            const playerType = (i === 0) ? "human" : "AI_Stupid";

            const player: PlayerInterface = {
                id: generateUUID(),
                playerType,
                name,
                index: this.gameState.playerList.length

                // Additional data we may want to have
            };

            this.gameState.playerList.push(player);

            if (player.playerType === "AI_Stupid") {
                const ai_Stupid = new AI_Stupid(player.index);
                ai_Stupid.setUpEventListeners();
                this.gameState.AIs.push(ai_Stupid);
            }
            
            this.gameState.zones[`${player.id}_hand`] = [];
            this.gameState.zones[`${player.id}_faceUps`] = [];
            this.gameState.zones[`${player.id}_blinds`] = [];

            eventBus.emit("PLAYER_INITIALISED", { player });
        }


        eventBus.emit("PLAYER_INITIALISATION_RESOLVED", {
            playerList: this.gameState.playerList
        });
    }

    clearHand(player: PlayerInterface) {
        this.gameState.setHand(player, []);
        eventBus.emit('HAND_CLEARED_RESOLVED', { player });
    }

    clearZone(zoneKey: string) {
        if (this.gameState.zones[zoneKey]) {
            this.gameState.zones[zoneKey] = [];
            //eventBus.emit("ZONE_CLEARED_RESOLVED", { zoneKey });
        }
    }

    checkIfCanPlay(player: PlayerInterface) {
        const playerHand = this.gameState.getHand(player);

        const cardValidationList = playerHand.map((card) => {
            return this.validateCard(card)
        })

        return (cardValidationList.every(item => item === false));
    }

    // This can be way more efficient this is shocking (abysmal coding)

    dealBlinds() {
        this.gameState.playerList.forEach( (player) => {
            this.drawBlinds(player, this.gameState.startingBlinds);
        })
    }

    dealHands() {
        this.gameState.playerList.forEach( (player) => {
            this.drawCards(player, this.gameState.startingHandSize);
        })
    }

    determineActions(player: PlayerInterface): { availableActions: PlayerAction[], availableValues: AvailableValues } {
        let availableActions = [];
        let availableCards;
        let availableValues: Rank[] = [];
        
        if (this.gameState.getDeck().length > 0) {
            availableCards = this.gameState.getHand(player);
            availableActions.push("playValues");

        } else if (this.gameState.getHand(player).length === 0 && this.gameState.getFaceUps(player).length > 0) {
            availableCards = this.gameState.getFaceUps(player);
            availableActions.push("playFaceUps");

        } else {

            for (let i=1; i<=this.gameState.getBlinds(player).length; i++) {
                availableValues.push((i as string) as Rank);
            }

            return {
                availableActions: ["playBlinds"],
                availableValues,
            }
        }

        const cardValidationList = this.validateZone(availableCards);

        if (cardValidationList.every(item => (item === false))) {
            return {
                availableActions: ['pickUpStack'], 
                availableValues: [],
            }
        }

        if (this.gameState.getStack().length > 0) {
            availableActions.push("pickUpStack")
        }


        for (let i=0; i < availableCards.length; i++) {
            if (cardValidationList[i] && !availableValues.includes(availableCards[i].rank)) {
                availableValues.push(availableCards[i].rank);
            }
        }

        return {
            availableActions,
            availableValues
        }
    }

    drawBlinds(player: PlayerInterface, amount: number) {
        for (let i = 0; i < amount; i++) {
            const newCard = this.gameState.getDeck().shift();
            this.gameState.getBlinds(player).push(newCard!);
        }

        const playerBlinds = this.gameState.getBlinds(player);

        eventBus.emit("BLINDS_DRAWN_RESOLVED", {
            player,
            blindsDrawn: getCardIDs(playerBlinds),
        })
    }

    drawCards(player: PlayerInterface, amount: number) {
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
            cardsDrawn: getCardIDs(cardsDrawn),
            playerHand: getCardIDs(this.gameState.getHand(player)),
        })
    }

    playCards(player: PlayerInterface, cardsPlayed: CardData[]) {

        // Set the stack to include the new cards
        const stack = this.gameState.getStack();

        this.gameState.setStack([...stack, ...cardsPlayed]);
        this.gameState.stackValue = this.setStackValue(cardsPlayed[0]);
        this.gameState.stackEffect = this.setStackEffect(cardsPlayed[0]);

        // Remove them from the players hand
        const newPlayerHand = this.gameState.getHand(player).filter(card => !cardsPlayed.includes(card));
        this.gameState.setHand(player, this.sortCards(newPlayerHand));

        eventBus.emit("CARDS_PLAYED_RESOLVED", {
            player,
            playerHand: getCardIDs(this.gameState.getHand(player)),
            cardsPlayed: getCardIDs(cardsPlayed),
            stack: getCardIDs(this.gameState.getStack())
        })
    }

    pickUpStack(player: PlayerInterface) {
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
            cardsPickedUp: getCardIDs(stack),
            playerHand: getCardIDs(this.gameState.getHand(player)),
        });
    }

    async resolveTurn() {
        const activePlayer = this.gameState.activePlayer;
        const playerHand = this.gameState.getHand(activePlayer!);

        const isInInitialPhase = (this.gameState.getDeck().length > 0);
        const playerBelowMinCards = (playerHand.length < this.gameState.getMinCards());


        if (isInInitialPhase && playerBelowMinCards) {
            const cardsToDraw = this.gameState.getMinCards()- playerHand.length;
            this.drawCards(activePlayer!, cardsToDraw);
        }

        return true;
    }

    async runTurn() {
        const activePlayer = this.gameState.playerList[this.gameState.turnIndex]
        this.gameState.activePlayer = activePlayer;

        const { availableActions, availableValues } = this.determineActions(activePlayer);

        const activePlayerHand = getCardIDs(this.gameState.getHand(activePlayer));

        const stackTopCard = this.gameState.getStackTopCard();
        const stackTopCardID = stackTopCard ? stackTopCard.ID : null;

        const { payload } = await eventBus.executeAndWait(
            () => {
                eventBus.emit("ACTIVE_PLAYER_ACTION_DEMANDED",{
                    activePlayer,
                    activePlayerHand,
                    availableActions,
                    availableValues,
                    stackTopCard: stackTopCardID,
                })
            },
            "ACTIVE_PLAYER_ACTION_SUBMITTED"
        )

        const { selectedAction, selectedCards } = payload;

        switch(selectedAction) {
            case "playValues":
                console.log('Before playCards()')
                this.playCards(activePlayer, selectedCards!);
                break;

            case "pickUpStack":
                this.pickUpStack(activePlayer);
                break;
        }

        return true;
    }

    async setFaceUps() {
        // This will need to be done much differently for the actual thing but this'll do for now

        for (let i=0; i<this.gameState.playerNumber; i++) {

            const player = this.gameState.playerList[i];

            const { payload } = await eventBus.executeAndWait(
                () => { eventBus.emit("FACE_UPS_DEMANDED", { 
                    player,
                    playerHand: getCardIDs(this.gameState.getHand(player)),
                })},
                "FACE_UPS_SUBMITTED",
                /*
                {
                    condition: (payload.player === player)
                }*/ // todo: add condition and even figure out how conditions work for execute and await
            )

            const faceUpsSelected = payload.faceUpsSelected;
            this.gameState.setFaceUps(player, faceUpsSelected);

            const newPlayerHand = this.gameState.getHand(player).filter(card => !faceUpsSelected.includes(card));
            this.gameState.setHand(player, this.sortCards(newPlayerHand));

            eventBus.emit("FACE_UPS_SELECTED_RESOLVED", {
                player,
                faceUps: getCardIDs(faceUpsSelected),
                playerHand: getCardIDs(this.gameState.getHand(player))
            })
        }

        return true;
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

    validateCard(card: CardData) {

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

    validateZone(zone: ZoneType): boolean[] {
        return zone.map((card) => {
            return this.validateCard(card);
        })
    }
}
