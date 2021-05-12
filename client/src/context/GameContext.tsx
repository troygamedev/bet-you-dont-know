import { createContext, Dispatch, SetStateAction } from "react";
import { GameData } from "@shared/types";

const GameContext =
  createContext<[GameData, Dispatch<SetStateAction<GameData>>]>(null);

export default GameContext;
