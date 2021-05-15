import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import Footer from "@components/Footer/Footer";

import Header from "@components/Header/Header";
import Game from "@components/Game/Game";
import LobbyList from "@components/LobbyList/LobbyList";
import SocketContext from "@context/SocketContext";

const Home: React.FC = () => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("lobbyJoined", () => {
      setHasJoinedLobby(true);
    });
  }, []);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
  return (
    <>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <Header />
      {hasJoinedLobby ? <Game /> : <LobbyList />}
      <Footer />
    </>
  );
};

export default Home;
