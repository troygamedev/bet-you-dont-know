import ChatBox from "@components/ChatBox/ChatBox";
import Layout from "@components/Layout/Layout";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useEffect, useState, useContext } from "react";
import styles from "./Game.module.scss";

const Game: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobby, setLobby] = useState<Lobby>();

  const [me, setMe] = useState<User>();
  useEffect(() => {
    socket.on("updateLobby", (newLobby: Lobby) => {
      setLobby(newLobby);
    });
    return () => {
      socket.emit("leaveParty");
    };
  }, []);

  useEffect(() => {
    setMe(lobby && lobby.users.find((user) => user.socketID == socket.id));
    console.log(me);
  }, [lobby]);

  const [usernameBox, setUsernameBox] = useState("");

  const setUsername = () => {
    socket.emit("setUsername", me, usernameBox);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setUsername();
    }
  };

  const [isReady, setIsReady] = useState(false);
  const onReadyPress = () => {
    setIsReady(!isReady);
    socket.emit("setReady", me, isReady);
  };
  return (
    <Layout title={lobby && lobby.name}>
      {(me && me.hasSetName) || (
        <div>
          <div>Enter your Username</div>
          <input
            type="text"
            name="username"
            value={usernameBox}
            onChange={(e) => {
              setUsernameBox(e.target.value);
            }}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
      )}
      {lobby && me && me.hasSetName && (
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
                return (
                  <div>
                    <p key={idx} style={{ color: user.isReady && "lime" }}>
                      {user.displayName +
                        (user.socketID == socket.id ? " (You)" : "")}
                    </p>
                  </div>
                );
              })}
          </div>
          {lobby.users && lobby.users.length >= 2 ? (
            <button onClick={() => onReadyPress()}>Ready</button>
          ) : (
            <div>Waiting for 1 more player to join...</div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Game;
