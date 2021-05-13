import SocketContext from "@context/SocketContext";
import { useState, useEffect, useContext } from "react";
import { Lobby } from "@shared/types";
import styles from "./LobbyList.module.scss";

const LobbyList: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();
  const [showLobbies, setShowLobbies] = useState(true);
  useEffect(() => {
    socket.on("updateLobbyList", (lobbies: Array<Lobby>) => {
      setLobbyList(lobbies);
    });

    socket.on("lobbyJoined", (lobby: Lobby) => {
      setShowLobbies(false);
    });
  }, []);

  const onJoinLobbyClick = (lobbyID: number) => {
    socket.emit("joinLobby", lobbyID);
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
