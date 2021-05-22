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
}
