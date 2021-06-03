import Room from "@components/Room/Room";
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

  return <Room slug={slug as string} />;
};

export default Lobby;
