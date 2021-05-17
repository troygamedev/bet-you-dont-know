import SocketContext from "@context/SocketContext";
import { useState, useEffect, useContext } from "react";
import { Lobby } from "@shared/types";
import styles from "./LobbyList.module.scss";
import { useRouter } from "next/router";
import { create } from "node:domain";

const LobbyList: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobbyList, setLobbyList] = useState<Array<Lobby>>();

  useEffect(() => {
    socket.on("updatePublicLobbyList", (lobbies: Array<Lobby>) => {
      setLobbyList(lobbies);
    });

    socket.on("lobbyCreated", (newLobbyID: string) => {
      router.push("/lobby/" + newLobbyID);
    });

    socket.emit("refetchPublicLobbyList");
  }, []);

  const router = useRouter();

  const onJoinLobbyClick = (lobbyID: string) => {
    router.push("/lobby/" + lobbyID);
  };

  const onCreateLobbyClick = () => {
    socket.emit("createLobby");
  };

  return (
    <div>
      {lobbyList && (
        <>
          <div>
            <button onClick={() => onCreateLobbyClick()}>
              Create new lobby
            </button>
          </div>

          <div>
            {lobbyList.length > 0 && <p>Public Lobbies:</p>}
            {lobbyList.map((lobby: Lobby, idx) => {
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
        </>
      )}
    </div>
  );
};

export default LobbyList;
