import io from "socket.io-client";
import Head from "next/head";
import { useEffect, useState } from "react";
import SocketContext from "@context/SocketContext";
import Footer from "@components/Footer/Footer";

import Header from "@components/Header/Header";
import Game from "@components/Game/Game";
import LobbyList from "@components/LobbyList/LobbyList";

const SOCKET_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000";

const socket = io(SOCKET_URL);

const Home: React.FC = () => {
  useEffect(() => {
    socket.on("lobbyJoined", () => {
      setHasJoinedLobby(true);
    });
  }, []);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
  return (
    <div>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <Header />
      <SocketContext.Provider value={socket}>
        {hasJoinedLobby ? <Game /> : <LobbyList />}
      </SocketContext.Provider>
      <Footer />
    </div>
  );
};

export default Home;
