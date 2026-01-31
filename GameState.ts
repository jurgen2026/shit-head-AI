import { unshuffledDeck } from "../data/cardData.ts";
import type { ZoneType } from "../types/generalTypes.ts";
import type { PlayerInterface } from "../types/playerTypes.ts";
import type { CardData, CardID, StackEffect } from "../types/cardTypes.ts";
import type AI_Stupid from "./AI_Stupid.ts";

export default class GameState {

    public activePlayer: PlayerInterface | undefined;
    public AIs: AI_Stupid[];
    public playerList: PlayerInterface[];
    public playerNumber: number;
    public playing: boolean;
    public stackEffect: StackEffect | null;
    public stackValue: number | null;
    public startingBlinds: number;
    public startingHandSize: number;
    public turnIndex: number;
    public zones: Record<string, ZoneType>;

    constructor() {
       this.playing = true,

        // ! Once players can be properly added these need to be changed to reflect that
        this.playerNumber = 2;
        this.playerList = []
        this.turnIndex = 0;
        this.activePlayer = undefined

        this.AIs = [];

        this.zones = {
            deck: [],
            stack: []
        }

        this.stackEffect = null;
        this.stackValue = null;

        // Make customisable
        this.startingBlinds = 3;
        this.startingHandSize = 6;
    }

    getBlinds(player: PlayerInterface): ZoneType {
        return this.zones[`${player.id}_blinds`] || [];
    }

    setBlinds(player: PlayerInterface, cards: ZoneType) {
        this.zones[`${player.id}_blinds`] = cards;
    }

    getDeck(): ZoneType {
        return this.zones.deck || null;
    }

    setDeck(newDeck: ZoneType) {
        this.zones.deck = newDeck;
    }

    getFaceUps(player: PlayerInterface): ZoneType {
        return this.zones[`${player.id}_faceUps`] || [];
    }

    setFaceUps(player: PlayerInterface, cards: ZoneType) {
        this.zones[`${player.id}_faceUps`] = cards;
    }

    getHand(player: PlayerInterface): ZoneType {
        return this.zones[`${player.id}_hand`] || [];
    }

    setHand(player: PlayerInterface, cards: ZoneType) {
        this.zones[`${player.id}_hand`] = cards;
    }
    
    getMinCards(): number {
        return this.startingHandSize - this.startingBlinds;
    }

    getStack(): ZoneType {
        return this.zones.stack;
    }

    setStack(cards: ZoneType) {
        this.zones.stack = cards;
    }

    getStackTopCard(): CardData | null {
        const stack = this.getStack();
        return (stack.length > 0 ? stack[stack.length - 1] : null)
    }

    // Debugging method
    logGameState() {
        console.log('🃏 CURRENT GAME STATE:');
        console.log('Players:', this.playerList.length);
        this.playerList.forEach(player => {
            console.log(`  ${player.name} (${player.id}):`);
            console.log(`    Hand: ${this.zones[`${player.id}_hand`]?.length || 0} cards`);
            console.log(`    Blinds: ${this.zones[`${player.id}_blinds`]?.length || 0} cards`);
            console.log(`    Faceups: ${this.zones[`${player.id}_faceUps`]?.length || 0} cards`);
        });
        console.log('Deck:', this.getDeck().length, 'cards remaining');
        console.log('Zones:', Object.keys(this.zones));
    }
}
