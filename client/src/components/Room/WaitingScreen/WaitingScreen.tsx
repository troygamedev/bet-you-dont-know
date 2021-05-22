import Layout from "@components/Layout/Layout";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useState, useContext } from "react";
import ChatBox from "../ChatBox/ChatBox";
import Switch from "react-switch";

interface Props {
  me: User;
  lobby: Lobby;
}
const WaitingScreen: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);

  const [isReady, setIsReady] = useState(false);
  const onReadyPress = () => {
    socket.emit("setReady", props.me, !isReady);
    setIsReady(!isReady);
  };

  const [publicLobby, setPublicLobby] = useState(false);

  const handlePublicChange = () => {
    socket.emit("setLobbyPublic", props.me.lobbyID, !publicLobby);
    setPublicLobby(!publicLobby);
  };

  const onStartPress = () => {};

  const playerList =
    props.lobby.users &&
    props.lobby.users.map((user, idx) => {
      return (
        <div>
          <p key={idx} style={{ color: user.isReady && "lime" }}>
            {(user.isLeader ? "[LEADER] " : "") +
              user.displayName +
              (user.socketID == socket.id ? " (You)" : "")}
          </p>
        </div>
      );
    });

  const publicSwitch = (
    <div>
      {props.me.isLeader && (
        <div>
          <label htmlFor="public or private lobby">
            <span>Make lobby public</span>
            <Switch
              onChange={() => handlePublicChange()}
              checked={publicLobby}
            />
          </label>
        </div>
      )}
    </div>
  );

  const readyElem =
    props.lobby.users && props.lobby.users.length >= 2 ? (
      <button onClick={() => onReadyPress()}>Ready</button>
    ) : (
      <div>Waiting for 1 more player to join...</div>
    );

  const startElem = props.lobby.users &&
    !props.lobby.users.find((user) => !user.isReady) && (
      <button onClick={() => onStartPress()}>Start</button>
    );

  return (
    props.me.hasSetName && (
      <>
        <ChatBox
          sender={props.me}
          lobbyID={props.lobby.id}
          chatList={props.lobby.chatMessages}
        />
        {publicSwitch}
        <div>
          <h3>Players in {props.lobby.name} </h3>
          {playerList}
          {readyElem}
          {startElem}
        </div>
      </>
    )
  );
};

export default WaitingScreen;
