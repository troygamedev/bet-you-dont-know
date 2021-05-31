import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useState, useContext, ChangeEvent, useEffect } from "react";
import Switch from "react-switch";
import styles from "./WaitingScreen.module.scss";

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

  const onStartPress = () => {
    socket.emit("startGame", props.lobby.id);
  };

  const playerList =
    props.lobby.users &&
    props.lobby.users.map((user, idx) => {
      return (
        <div>
          <p
            key={idx}
            style={{
              color:
                (user.isReady && "lime") || (user.isSpectator && "lightblue"),
            }}
          >
            {(user.isLeader ? "[LEADER] " : "") +
              user.displayName +
              (user.socketID == socket.id ? " (You) " : " ") +
              (user.isSpectator ? "[Spectator]" : "")}
          </p>
        </div>
      );
    });

  const [isSpectator, setIsSpectator] = useState(false);

  const handleSpectatorChange = () => {
    socket.emit("setIsSpectator", props.me, !isSpectator);
    setIsSpectator(!isSpectator);
  };
  const spectatorSwitch = (
    <label htmlFor="spectator or not spectator" className={styles.settingsRow}>
      <span>Spectator?</span>
      <Switch onChange={() => handleSpectatorChange()} checked={isSpectator} />
    </label>
  );

  const [isPublicLobby, setIsPublicLobby] = useState(false);

  const handlePublicChange = () => {
    if (props.me.isLeader) {
      socket.emit("setLobbyPublic", props.me.lobbyID, !isPublicLobby);
      setIsPublicLobby(!isPublicLobby);
    }
  };
  const publicSwitch = (
    <div>
      <label htmlFor="public or private lobby" className={styles.settingsRow}>
        <span>Make lobby public</span>
        <Switch onChange={() => handlePublicChange()} checked={isPublicLobby} />
      </label>
    </div>
  );

  const readyElem =
    props.lobby.players && props.lobby.players.length >= 2 ? (
      <button onClick={() => onReadyPress()}>Ready</button>
    ) : (
      <div>
        {2 - props.lobby.players.length} or more players are required to start
        this game
      </div>
    );

  const startElem = props.me.isLeader &&
    props.lobby.players &&
    props.lobby.players.length >= 2 &&
    !props.lobby.players.find((user) => !user.isReady) && (
      <button onClick={() => onStartPress()}>Start</button>
    );

  const [totalRounds, setTotalRounds] = useState(0);

  const trySetRounds = (num: number) => {
    try {
      // clamp the rounds between props.lobby.players.length and 10 x that number
      num = Math.min(
        Math.max(num, props.lobby.players.length),
        props.lobby.players.length * 10
      );

      setTotalRounds(num);

      socket.emit("setTotalRounds", props.lobby.id, num);
    } catch (err) {
      console.error(err);
    }
  };
  // when the lobby resizes, make sure to update the totalRounds setting
  useEffect(() => {
    if (props.lobby.players != undefined) {
      trySetRounds(props.lobby.players.length * 2);
    }
  }, [props.lobby.players]);

  const handleRoundsChange = (e: ChangeEvent<HTMLInputElement>) => {
    trySetRounds(parseInt(e.target.value));
  };

  const roundsElem = props.lobby.players && (
    <div className={styles.settingsRow}>
      <label htmlFor="rounds">Number of rounds in total</label>
      <input
        type="number"
        value={totalRounds}
        min={props.lobby.players.length}
        max={props.lobby.players.length * 10}
        onChange={(e) => handleRoundsChange(e)}
        readOnly={!props.me.isLeader}
      />
    </div>
  );

  // PURELY FOR TESTING PURPOSES
  const testingElem = (
    <div>
      {props.me.isLeader && (
        <button onClick={() => onStartPress()}>force start button</button>
      )}
    </div>
  );
  return (
    props.me.hasSetName && (
      <div className={styles.container}>
        <div>
          <h3>Players in {props.lobby.name} </h3>
          {playerList}
          {readyElem}
          {startElem}
        </div>
        <div className={styles.settings}>
          {props.me.isLeader && (
            <div className={styles.lobbySettings}>
              <div className={styles.label}>Lobby Settings:</div>
              {/* {testingElem} */}
              {publicSwitch}
              {roundsElem}
            </div>
          )}
          <div className={styles.userSettings}>
            <div className={styles.label}>User Settings:</div>
            {spectatorSwitch}
          </div>
        </div>
      </div>
    )
  );
};

export default WaitingScreen;
