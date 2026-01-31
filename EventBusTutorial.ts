import type { EventHandlerMap, GameEvents } from "../types/eventTypes";
import { eventBus } from "../utils/eventBus";

class ExampleClass {

    setUpEventListeners() {

        const eventHandlers: EventHandlerMap<GameEvents> = {
            "FACE_UPS_DEMANDED": (payload) => {
                const { player, playerHand } = payload;
                this.
            },

            "ACTIVE_PLAYER_ACTION_DEMANDED"
        }
        
        eventBus.setUpEventListeners(eventHandlers);
    }

    emitEvent() {
        
    }
}

"_DEMANDED - GameEngine requesting input from the user (or AI)"