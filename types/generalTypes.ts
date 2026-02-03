import type { PlayerInterface } from "./playerTypes";
import type { CardData, CardID, StackEffect, Rank } from "./cardTypes";
import type { SimpleGameRules, TraditionalGameRules } from "../game/GameRules";

export interface GameStateSnapshot {
    deck: ZoneType;
    stack: ZoneType;
    stackEffect: StackEffect | null;
    stackValue: number | null;
    players: PlayerInterface[];
    playerHands: Record<string, CardData[]>;
    playerFaceUps: Record<string, CardData[]>;
    playerBlinds: Record<string, CardData[]>;
    turnIndex: number;
}

export type GameRulesType = "simple" | "traditional";

export type GameRulesClassType = SimpleGameRules | TraditionalGameRules;

export type ZoneType = CardData[];

export type UI_GameType = "text" | "react";

export type GamePlayType = "goldfishing" | "human-AI" | "AI-AI";
