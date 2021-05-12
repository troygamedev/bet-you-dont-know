import io from "socket.io-client";
import Head from "next/head";
import { useEffect, useState } from "react";

import { Lobby } from "@shared/types";

const SOCKET_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000";

const socket = io(SOCKET_URL);

const Home: React.FC = () => {
  const [messageBox, setMessageBox] = useState<string>("Loading...");
  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();
  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessageBox(message);
      console.log(message);
    });

    socket.on("lobbies", (lobbies: Array<Lobby>) => {
      setLobbyList(lobbies);
    });
  }, []);

  interface SocketEvent {
    eventName: string;
    param: any;
  }
  const [socketEvent, setSocketEvent] = useState<SocketEvent>();
  useEffect(() => {
    if (socketEvent) {
      switch (socketEvent.eventName) {
        case "joinLobby":
          const lobby = socketEvent.param as Lobby;
          socket.emit("joinLobby", lobby);
          break;
      }
    }
  }, [socketEvent]);

  return (
    <div>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <div>{messageBox}</div>
      <div>
        {lobbyList &&
          lobbyList.map((lobby, idx) => {
            return (
              <div
                key={idx}
                onClick={() => {
                  setSocketEvent({ eventName: "joinLobby", param: lobby });
                }}
              >
                {lobby.name}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
