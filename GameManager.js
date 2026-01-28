// This controls what phase the game is in e.g. loading, player turn, end game
// It does more stuff that we'll learn about along the way

import { eventBus } from "../utils/eventBus.js";

export default class GameManager {
    static GAME_PHASES = [
        "loading",
        "initialising",
        "setup"
    ]

    constructor() {
        this.currentPhase = "loading"
        this.eventBus = eventBus;
        this.setUpEventListeners();
    }

    setUpEventListeners() {
        eventBus.on("UI_READY", () => {
            console.log("🎯 GameManager received UI_READY event");
            this.transitionTo("setup");
        });
        
        eventBus.on("GAME_STARTED", () => {
            console.log("🎯 GameManager received GAME_STARTED event");
            this.transitionTo("select-face-ups");
    });
}
    transitionTo(newPhase) {
        console.log(`Transitioning from ${this.currentPhase} to ${newPhase}`);
        this.currentPhase = newPhase;
        this.onPhaseEnter(newPhase);
    }

    onPhaseEnter(phase) {
        switch(phase) {
            case "setup":
                this.eventBus.emit("INITIALISE_GAME", null);
                break;
            case "select-face-ups":
                this.eventBus.emit("SELECT_FACE_UPS", null)
                break;
        }
    }
}