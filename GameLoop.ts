// node GameLoop.ts

import GameEngine from "./GameEngine.js";
import { gameConsole } from "./GameConsole.ts";
import { timeDelays } from "../data/timeDelays.ts";
import { eventBus } from "../event-system/eventBus.ts";
import delay from "../utils/delay.ts";

type UI_GameType = "text" | "react";
type GamePlayType = "goldfishing" | "human-AI" | "AI-AI"; // Goldfishing official term for playing as everyone

export default class GameLoop {

    readonly ui_GameType: UI_GameType;
    readonly gamePlayType: GamePlayType;

    private gameEngine: GameEngine;

    constructor(ui_GameType: UI_GameType, gamePlayType: GamePlayType) {
        this.gameEngine = new GameEngine
        this.ui_GameType = ui_GameType;
        this.gamePlayType = gamePlayType;
    }

    async runGame() {

        this.initialiseGamePhase();
        // todo: ensure the game initialises successfully

        await delay(timeDelays.phaseTransitionDelays.playerInitilisationToCardDeal);

        this.dealCardsPhase();
    }

    async initialiseGamePhase() {

        this.gameEngine.setUpEventListeners();
        
        if (this.ui_GameType === "react") {
            this.gameEngine.setUpStoreEventListeners();
        } else if (this.ui_GameType === "text") {
            gameConsole.setUpEventListeners();
        }

        this.gameEngine.initialisePlayers();
        this.gameEngine.initialiseCards();

    }

    async dealCardsPhase() {

        this.gameEngine.dealBlinds()
        await delay(timeDelays.cardDealDelays.blindsToHand);
        this.gameEngine.dealHands()
        // should add another delay at some point however I can't be bothered for now

        await this.gameEngine.setFaceUps();
    }
}

const gameLoop = new GameLoop("text", "goldfishing");
gameLoop.runGame();