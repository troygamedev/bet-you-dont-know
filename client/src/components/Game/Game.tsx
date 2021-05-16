import ChatBox from "@components/ChatBox/ChatBox";
import Layout from "@components/Layout/Layout";
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

  const me = lobby && lobby.users.find((user) => user.socketID == socket.id);

  return (
    <Layout title={lobby && lobby.name}>
      {lobby && (
        <>
          <ChatBox
            sender={me}
            lobbyID={lobby.id}
            chatList={lobby.chatMessages}
          />
          <div>
            <h3>Players in {lobby.name} </h3>
            {lobby.users &&
              lobby.users.map((user, idx) => {
                if (user == me) {
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
    </Layout>
  );
};

export default Game;
