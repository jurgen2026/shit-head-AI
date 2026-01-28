import { unshuffledDeck } from "../data/cardData.ts";

export default class GameState {

    constructor() {
       this.playing = true,

        // ! Once players can be properly added these need to be changed to reflect that
        this.playerNumber = 2;
        this.playerList = []
        this.turnIndex = 0;

        this.zones = {
            deck: [],
            stack: []
        }

        this.stackValue = null;
        this.stackEffect = null;

        // Make customisable
        this.startingBlinds = 3;
        this.startingFaceUps = 3;
        this.minCards = 3;
    }

    getBlinds(player) {
        return this.zones[`${player.id}_blinds`] || [];
    }

    setBlinds(player, cards) {
        this.zones[`${player.id}_blinds`] = cards;
    }

    getDeck() {
        return this.zones.deck || null;
    }

    setDeck(newDeck) {
        this.zones.deck = newDeck;
    }

    getFaceUps(player) {
        return this.zones[`${player.id}_faceUps`] || [];
    }

    setFaceUps(player, cards) {
        this.zones[`${player.id}_faceUps`] = cards;
    }

    getHand(player) {
        return this.zones[`${player.id}_hand`] || [];
    }

    setHand(player, cards) {
        this.zones[`${player.id}_hand`] = cards;
    }
    
    getStack() {
        return this.zones.stack;
    }

    setStack(cards) {
        this.zones.stack = cards;
    }

    getStartingHandSize() {
        return this.startingFaceUps + this.minCards;
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
