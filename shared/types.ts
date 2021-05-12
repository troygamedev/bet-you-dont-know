export interface User {
  username: string;
  socketID: string;
  lobbyID: number;
}

export interface Lobby {
  name: string;
  id: number;
  users: Array<User>;
}

export interface GameData {
  isInLobby: boolean;
}
