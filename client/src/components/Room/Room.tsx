import Layout from "@components/Layout/Layout";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useEffect, useState, useContext } from "react";
import swal from "sweetalert";
import ChatBox from "./ChatBox/ChatBox";
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
      <GameScreen lobby={lobby} me={me} />
    ) : (
      <WaitingScreen lobby={lobby} me={me} />
    );

    const rulesElem = (
      <div>
        <div>
          When it is your turn:
          <ul>
            <li>
              If you answer the trivia question correctly, you get $1000. You
              also receive money from all the bets that were placed against you.
            </li>
            <li>
              If you answer the trivia question incorrectly, you lose however
              much money your friends betted against you.
            </li>
          </ul>
        </div>
        <div>
          When it is someone else's turn:
          <ul>
            <li>
              You can place bets that your friend would answer the trivia
              question incorrectly.
            </li>
            <li>
              If your prediction was correct, the amount of money you bet will
              be taken from that player's balance and into yours.
            </li>
            <li>
              If your prediction was incorrect, you lose the amount of money you
              bet and will be given to the player.
            </li>
          </ul>
        </div>
      </div>
    );

    return (
      <Layout title={lobby.name ? lobby.name : "Loading..."}>
        {me.hasSetName && (
          <ChatBox
            sender={me}
            lobbyID={lobby.id}
            chatList={lobby.chatMessages}
          />
        )}
        {namePickElem}
        {screenElem}
        {rulesElem}
      </Layout>
    );
  }
  return <div>Loading...</div>;
};

export default Room;
