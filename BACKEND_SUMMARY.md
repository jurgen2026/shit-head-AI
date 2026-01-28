# RESPONSIBILITIES
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GAME ENGINE   │    │   GAME STATE     │    │   GAME LOGIC    │
│   (Orchestrator)│    │   (Data store)   │    │ (handles logic) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
(And logic for now)                            (To be added later)


## Game State Responsibilities

1) Data Storage: Store all game data (players, cards, zones, game progress)
2) Data Structure: Maintain normalised data collections and relationships
3) Data Integrity: Ensure consistent data format and relationships
4) Serialization: Handle saving/loading game state to/from JSON
5) Memory Management: Track game history and state snapshots

Owns:
```js
class GameState {
    // ✅ SOLE OWNER of this data (example data the actual game may be)
    players = {};           // Player objects by ID
    cards = {};             // Card objects by ID  
    zones = {};             // Card IDs in each zone
    currentPlayer = null;   // Current player ID
    turn = 1;               // Current turn number
    phase = 'setup';        // Current game phase
    history = [];           // Game action history
}
```
Provides:
```js
// Data access methods
getPlayerHand(playerId) {
    return this.zones[`${playerId}_hand`].map(id => this.cards[id]);
}

getCardsInZone(zoneName) {
    return this.zones[zoneName].map(id => this.cards[id]);
}

// Serialization
toJSON() { return { ...this }; }
static fromJSON(data) { return new GameState(data); }
```





