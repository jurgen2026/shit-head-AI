export type ConsoleCommands = "seeHand" | "seeFaceUps";

export type AvailableCommands = SingleKeyCommands & CardCommands;

export type SingleKeyCommands = "p" | "h" | "f"

export type CardCommands = number[];