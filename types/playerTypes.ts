import type { Rank } from "./cardTypes";

export type PlayerType = "human" | "AI_Stupid" | "AI_rules" | "AI_machineLearning";

export interface PlayerInterface {
    id: string;
    playerType: PlayerType;
    name: string;
    index: number;
}

export type PlayerAction = "pickUpStack" | "playCards" | "playFaceUps" | "playBlinds" | "selectFaceUps";
export type AvailableValues = Rank[] | "1";

export type PlayerZoneType = "hand" | "faceUps" | "blinds";

