import SocketContext from "@context/SocketContext";
import { useState, useEffect, useContext } from "react";
import { Lobby } from "@shared/types";
import styles from "./LobbyList.module.scss";
import { useRouter } from "next/router";

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
    <>
      {lobbyList && (
        <div className={styles.container}>
          <div className={styles.lobbyCountLabel}>
            Public Lobbies: {lobbyList.length}
          </div>
          {lobbyList.length > 0 && (
            <div className={styles.publicLobbyList}>
              <div className={styles.labelRow}>
                <div className={styles.lobbyNameLabel}>Lobby Name:</div>
                <div className={styles.playerCountLabel}>Players in lobby:</div>
                <div></div>
              </div>
              {lobbyList.map((lobby: Lobby, idx) => {
                return (
                  <div key={idx} className={styles.lobbyItem}>
                    <div className={styles.lobbyName}>{lobby.name}</div>
                    <div className={styles.playerCount}>
                      {lobby.users.length}
                    </div>
                    <button
                      onClick={() => {
                        onJoinLobbyClick(lobby.id);
                      }}
                    >
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <button
            className={styles.createLobbyButton}
            onClick={() => onCreateLobbyClick()}
          >
            Create new lobby
          </button>
        </div>
      )}
    </>
  );
};

export default LobbyList;
