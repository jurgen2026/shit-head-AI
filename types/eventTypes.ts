import type { CardData, CardID, Rank, StackTopCard, StackTopCardID } from "../types/cardTypes";
import type { PlayerInterface, PlayerType, PlayerZoneType, PlayerAction, AvailableValues } from "../types/playerTypes";
import type { GameStateSnapshot } from "./generalTypes";

export type EventHandler<T> = (payload: T) => void;

export type EventHandlerMap<E extends Record<string, any>> = {
  [K in keyof E]?: (payload: E[K]) => void;
};

export interface GameEvents {
    // Initialisations
    DECK_INITIALISED_RESOLVED: DeckInitialisedResolvedEvent;
    PLAYER_INITIALISED: PlayerInitialisedEvent;
    PLAYER_INITIALISATION_RESOLVED: PlayerInitialisationResolvedEvent;

    // Game Engine demands to user
    FACE_UPS_DEMANDED: FaceUpsDemandedEvent;
    ACTIVE_PLAYER_ACTION_DEMANDED: ActivePlayerActionDemandedEvent;

    // User submissions to game engine
    ACTIVE_PLAYER_ACTION_SUBMITTED: ActivePlayerActionSubmittedEvent;
    FACE_UPS_SUBMITTED: FaceUpsSubmittedEvent;

    // User submissions received
    ACTIVE_PLAYER_ACTION_RECEIVED: ActivePlayerActionReceivedEvent;

    // Requests to the game engine

    // Resolution to the user
    FACE_UPS_SELECTED_RESOLVED: FaceUpsSelectedResolvedEvent;

    // General resolutions
    CARDS_DEALT_RESOLVED: CardsDealtResolvedEvent;
    STACK_KILL_RESOLVED: StackKillResolvedEvent;

    // todo: organise

    CARDS_DRAWN_RESOLVED: CardsDrawnResolvedEvent;
    CARDS_PLAYED_RESOLVED: CardsPlayedResolvedEvent;
    CARD_SELECTED: CardSelectedEvent;
    CARD_VALIDATION_RESOLVED: CardValidationResolvedEvent;
    DRAW_CARDS_REQUESTED: DrawCardsRequestedEvent;
    INITIALISE_NEW_TURN: InitialiseNewTurnEvent;
    PICK_UP_STACK_REQUESTED: PickUpStackRequestedEvent;
    PLAY_CARDS_REQUESTED: PlayCardsRequestedEvent;
    STACK_PICKED_UP: StackPickedUpEvent;

    VALIDATE_CARDS_REQUESTED: ValidateCardsRequestedEvent;
    CARDS_DRAWN_ANIMATION_COMPLETE: CardsDrawnAnimationCompleteEvent;
    HAND_CLEARED_RESOLVED: HandClearedResolvedEvent;
    HAND_CLEARED_REQUESTED: HandClearedRequestedEvent;
    TURN_ENDED: TurnEndedEvent;
}

export interface ActivePlayerActionDemandedEvent {
    availableActions: PlayerAction[];
    availableCardIndexes: number[];
    stateSnapshot: GameStateSnapshot;
}

export interface ActivePlayerActionReceivedEvent {
    selectedAction: PlayerAction;
    selectedCards: CardData[] | null;
    selectedIndex?: number;
}

export interface ActivePlayerActionSubmittedEvent {
    selectedAction: PlayerAction;
    selectedCards: CardData[] | null;
    selectedIndex?: number;
}

export interface CardsDealtResolvedEvent {
    toZone: PlayerZoneType;
    dealtCards: Record<string, CardID[]>;
}

export interface CardsDrawnResolvedEvent {
    player: PlayerInterface;
    cardsDrawn: CardID[];
    playerHand: CardID[];
}

export interface CardsDrawnAnimationCompleteEvent {
    player: PlayerInterface | null;
}

export interface CardsPlayedResolvedEvent {
    player: PlayerInterface;
    playerHand: CardID[];
    cardsPlayed: CardID[];
    stack: CardID[];
}

export interface DeckInitialisedResolvedEvent {
    deck: CardID[];
}

export interface CardSelectedEvent {
    card: CardData;
}

export interface CardValidationResolvedEvent {
    cardValidationList: boolean[];
}

export interface DrawCardsRequestedEvent {
    player: PlayerInterface,
    amount: number,
}

export interface FaceUpsDemandedEvent {
    player: PlayerInterface,
    playerHand: CardID[],
}

export interface FaceUpsSelectedResolvedEvent {
    player: PlayerInterface,
    faceUps: CardID[];
    playerHand: CardID[];
}

export interface FaceUpsSubmittedEvent {
    player: PlayerInterface,
    faceUpsSelected: CardData[],
    playerHand: CardData[],
}

export interface HandClearedResolvedEvent {
    player: PlayerInterface;
}

export interface HandClearedRequestedEvent {
    player: PlayerInterface;
}

export interface InitialiseNewTurnEvent {
    turnIndex: number;
    player: PlayerInterface;
}

export interface PickUpStackRequestedEvent {
    player: PlayerInterface,
}

export interface PlayCardsRequestedEvent {
    player: PlayerInterface;
    cards: CardData[];
}

export interface PlayerInitialisedEvent {
    player: PlayerInterface;
}

export interface PlayerInitialisationResolvedEvent {
    playerList: PlayerInterface[];
}

export interface TurnEndedEvent {
    player: PlayerInterface;
}

export interface StackKillResolvedEvent {
    oldStack: CardID[];
}

export interface StackPickedUpEvent {
    player: PlayerInterface;
    cardsPickedUp: CardID[];
    playerHand: CardID[];
}

export interface ValidateCardsRequestedEvent {
    player: PlayerInterface;
    cards: CardData[];
}