import SocketContext from "@context/SocketContext";
import { useState, useEffect, useContext } from "react";
import { Lobby } from "@shared/types";
import styles from "./LobbyList.module.scss";
import { useRouter } from "next/router";

const LobbyList: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();

  useEffect(() => {
    socket.on("updateLobbyList", (lobbies: Array<Lobby>) => {
      setLobbyList(lobbies);
    });

    socket.emit("refetchLobbyList");
  }, []);

  const router = useRouter();

  const onJoinLobbyClick = (lobbyID: number) => {
    router.push("/lobby/" + lobbyID);
  };
  return (
    <div>
      {lobbyList &&
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
  );
};

export default LobbyList;
