import SocketContext from "@context/SocketContext";
import { ChatMessage, Lobby, User } from "@shared/types";
import { useEffect, useState, useContext } from "react";
import styles from "./Game.module.scss";

const Game: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobby, setLobby] = useState<Lobby>();

  useEffect(() => {
    socket.on("updateLobby", (newLobby: Lobby) => {
      setLobby(newLobby);
    });
  }, []);

  return (
    <div>
      {lobby && (
        <>
          <div>{lobby.chatMessages}</div>
          <div>
            <h3>Players in Lobby: </h3>
            {lobby.users &&
              lobby.users.map((user, idx) => {
                if (user.socketID == socket.id) {
                  return <p key={idx}>{user.username + " (You)"}</p>;
                }
                return <p key={idx}>{user.username}</p>;
              })}
          </div>
          {lobby.users && lobby.users.length >= 2 ? (
            <button>Ready</button>
          ) : (
            <div>Waiting for 1 more player to join...</div>
          )}
        </>
      )}
    </div>
  );
};

export default Game;
