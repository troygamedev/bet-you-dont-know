import dayjs from "dayjs";

export interface User {
  username: string;
  displayName: string;
  socketID: string;
  lobbyID: string;
  usernameConflictIndex: number;
  hasSetName: boolean;
  isReady: boolean;
  isLeader: boolean;
  isSpectator: boolean;
}

export interface ChatMessage {
  isServer?: boolean;
  user?: User;
  message: string;
  timestamp: dayjs.Dayjs;
}

export interface Lobby {
  name: string;
  id: string;
  users: Array<User>;
  players: Array<User>; // players are any user that isnt a spectator
  chatMessages: Array<ChatMessage>;
  isPublic: boolean;
  isInGame: boolean;
  game: Game;
}

export type GameStage =
  | "Countdown"
  | "Answering"
  | "Betting"
  | "Paying"
  | "GameOver";

export interface Game {
  timeLeft: number;
  currentQuestion: TriviaQuestion;
  currentAnswerer: User;
  gameStage: GameStage;
  roundsCompleted: number;
}

export interface TriviaQuestion {
  question: string;
  wrongChoices: Array<string>;
  answer: string;
  allChoicesRandomized: Array<string>;
}
