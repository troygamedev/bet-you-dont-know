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
  chatMessages: Array<ChatMessage>;
  isPublic: boolean;
  isInGame: boolean;
  game: Game;
}

export enum GameStage {
  Countdown = 0,
  Answering = 1,
  Betting = 2,
  Paying = 3,
  GameOver = 4,
}

export interface Game {
  timeLeft: number;
  currentQuestion: TriviaQuestion;
  currentAnswerer: User;
  gameStage: GameStage;
}

export interface TriviaQuestion {
  question: string;
  wrongChoices: Array<string>;
  answer: string;
  allChoicesRandomized: Array<string>;
}
