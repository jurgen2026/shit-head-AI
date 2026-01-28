// GameInstance.js
import GameEngine from "./GameEngine.js";

console.log("🔄 GameInstance module loading...");

export const gameEngine = new GameEngine();
console.log("✅ GameEngine instance created:", gameEngine);

gameEngine.setUpEventListeners();
gameEngine.initialiseGame();
