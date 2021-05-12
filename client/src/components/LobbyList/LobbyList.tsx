import SocketContext from "@context/SocketContext";
import { useState, useEffect, useContext } from "react";
import { Lobby } from "@shared/types";
import styles from "./LobbyList.module.scss";
import GameContext from "@context/GameContext";

const LobbyList: React.FC = () => {
  const socket = useContext(SocketContext);
  const [gameData, setGameData] = useContext(GameContext);

  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();
  const [showLobbies, setShowLobbies] = useState(true);
  useEffect(() => {
    socket.on("loadLobbies", (lobbies: Array<Lobby>) => {
      setLobbyList(lobbies);
      console.log(lobbies);
    });

    socket.on("lobbyJoined", (lobby: Lobby) => {
      setShowLobbies(false);
    });
  }, []);

  const onJoinLobbyClick = (lobbyID: number) => {
    socket.emit("joinLobby", lobbyID);
    setGameData({ isInLobby: true });
  };
  return (
    <div>
      {showLobbies &&
        lobbyList &&
        lobbyList.map((lobby: Lobby, idx) => {
          return (
            <div
              key={idx}
              onClick={() => {
                onJoinLobbyClick(lobby.id);
              }}
            >
              <div>{lobby.name}</div>
              <div>{"Players: " + lobby.users.length}</div>
              <br />
            </div>
          );
        })}
    </div>
  );
};

export default LobbyList;
