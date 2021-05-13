export interface User {
  username: string;
  socketID: string;
  lobbyID: number;
}

export interface ChatMessage {
  user: User;
  message: string;
}

export interface Lobby {
  name: string;
  id: number;
  users: Array<User>;
  chatMessages: Array<ChatMessage>;
}
