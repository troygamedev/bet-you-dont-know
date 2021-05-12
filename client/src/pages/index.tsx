import io from "socket.io-client";
import Head from "next/head";
import { useEffect, useState } from "react";
import SocketContext from "@context/SocketContext";

import { Lobby } from "@shared/types";

const SOCKET_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000";

const socket = io(SOCKET_URL);

const Home: React.FC = () => {
  const [messageBox, setMessageBox] = useState<string>("Loading...");
  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();
  const [showLobbies, setShowLobbies] = useState(true);
  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessageBox(message);
      console.log(message);
    });

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
  };
  return (
    <div>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <SocketContext.Provider value={socket}>
        <div>{messageBox}</div>
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
      </SocketContext.Provider>
    </div>
  );
};

export default Home;
