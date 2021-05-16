import Game from "@components/Game/Game";
import SocketContext from "@context/SocketContext";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

const Lobby: React.FC = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    socket.emit("joinLobby", slug);
  }, [slug]);
  return <Game />;
};

export default Lobby;
