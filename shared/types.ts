export interface User {
  username: string;
  socketID: string;
  lobbyID: number;
}

export interface ChatMessage {
  isServer?: boolean;
  user?: User;
  message: string;
  timestamp: Date;
}

export interface Lobby {
  name: string;
  id: number;
  users: Array<User>;
  chatMessages: Array<ChatMessage>;
}
