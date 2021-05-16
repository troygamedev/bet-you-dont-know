import dayjs from "dayjs";

export interface User {
  username: string;
  socketID: string;
  lobbyID: number;
  isReady?: boolean;
}

export interface ChatMessage {
  isServer?: boolean;
  user?: User;
  message: string;
  timestamp: dayjs.Dayjs;
}

export interface Lobby {
  name: string;
  id: number;
  users: Array<User>;
  chatMessages: Array<ChatMessage>;
}
