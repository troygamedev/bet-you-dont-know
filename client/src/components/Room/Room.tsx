import Layout from "@components/Layout/Layout";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useEffect, useState, useContext } from "react";
import swal from "sweetalert";
import GameScreen from "./GameScreen/GameScreen";
import WaitingScreen from "./WaitingScreen/WaitingScreen";

const Room: React.FC = () => {
  const socket = useContext(SocketContext);

  const [lobby, setLobby] = useState<Lobby>();

  const [me, setMe] = useState<User>();
  useEffect(() => {
    socket.on("updateLobby", (newLobby: Lobby) => {
      setLobby(newLobby);
    });
    socket.on("joinLobbyError", (message: string) => {
      swal({
        title: "Error",
        text: message,
        icon: "error",
      });
    });
    return () => {
      socket.emit("leaveLobby");
    };
  }, []);

  useEffect(() => {
    setMe(
      lobby &&
        lobby.users &&
        lobby.users.find((user) => user.socketID == socket.id)
    );
  }, [lobby]);

  const [usernameBox, setUsernameBox] = useState("");

  const setUsername = () => {
    socket.emit("setUsername", me, usernameBox);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setUsername();
    }
  };
  if (lobby && me) {
    const namePickElem = me.hasSetName || (
      <div>
        <div>Enter your Username</div>
        <input
          type="text"
          name="username"
          value={usernameBox}
          onChange={(e) => {
            setUsernameBox(e.target.value);
          }}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
    );
    const screenElem = lobby.isInGame ? (
      <GameScreen />
    ) : (
      <WaitingScreen lobby={lobby} me={me} />
    );

    return (
      <Layout title={lobby.name ? lobby.name : "Loading..."}>
        {namePickElem}
        {screenElem}
      </Layout>
    );
  }
  return <div>Loading...</div>;
};

export default Room;
