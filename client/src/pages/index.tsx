import io from "socket.io-client";
import Head from "next/head";
import { useEffect, useState } from "react";
import SocketContext from "@context/SocketContext";
import Footer from "@components/Footer/Footer";

import Header from "@components/Header/Header";
import Game from "@components/Game/Game";
import LobbyList from "@components/LobbyList/LobbyList";
import GameContext from "@context/GameContext";

import { GameData } from "@shared/types";

const SOCKET_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000";

const socket = io(SOCKET_URL);

const Home: React.FC = () => {
  const [messageBox, setMessageBox] = useState<string>("Loading...");
  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessageBox(message);
      console.log(message);
    });
  }, []);
  const [gameData, setGameData] = useState<GameData>({ isInLobby: false });
  return (
    <div>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <Header />
      <SocketContext.Provider value={socket}>
        <GameContext.Provider value={[gameData, setGameData]}>
          <div>{messageBox}</div>
          <LobbyList />
          <Game />
        </GameContext.Provider>
      </SocketContext.Provider>
      <Footer />
    </div>
  );
};

export default Home;
