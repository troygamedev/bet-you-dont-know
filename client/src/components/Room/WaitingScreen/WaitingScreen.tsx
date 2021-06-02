import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useState, useContext, ChangeEvent, useEffect } from "react";
import Switch from "react-switch";
import styles from "./WaitingScreen.module.scss";
import { Button } from "react-bootstrap-buttons";
import "react-bootstrap-buttons/dist/react-bootstrap-buttons.css";

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

  const playerList = props.lobby.users && (
    <div className={styles.playerListContainer}>
      <div className={styles.playerListLabel}>
        Players: {props.lobby.players.length}
      </div>
      <div className={styles.scrollable}>
        {props.lobby.users.map((user, idx) => {
          return (
            <div
              className={`${styles.row} ${
                idx % 2 == 0 ? styles.evenRow : styles.oddRow
              }`}
              key={idx}
              style={{
                color:
                  (user.isReady && "#24e046") ||
                  (user.isSpectator && "lightblue"),
              }}
            >
              {(user.isLeader ? "[LEADER] " : "") +
                user.displayName +
                (user.socketID == socket.id ? " (You) " : " ") +
                (user.isSpectator ? "[Spectator]" : "")}
            </div>
          );
        })}
      </div>
    </div>
  );

  const [isSpectator, setIsSpectator] = useState(false);

  const handleSpectatorChange = () => {
    socket.emit("setIsSpectator", props.me, !isSpectator);
    setIsSpectator(!isSpectator);
  };

  useEffect(() => {
    if (props.me.isSpectator) {
      setIsSpectator(props.me.isSpectator);
    }
  }, [props.me.isSpectator]);
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

  const everyoneHasReadied =
    props.lobby.players &&
    props.lobby.players.length >= 2 &&
    !props.lobby.players.find((user) => !user.isReady);

  const readyElem = (
    <div className={styles.readyContainer}>
      {props.lobby.players && props.lobby.players.length >= 2 ? (
        <div>
          {!props.me.isSpectator && (
            <Button
              btnStyle={isReady ? "danger" : "primary"}
              onClick={() => onReadyPress()}
            >
              {isReady ? "Click to Unready" : "Click to Ready"}
            </Button>
          )}

          <div className={styles.waitingFor}>
            {everyoneHasReadied ? (
              <div style={{ color: "orangered" }}>
                Waiting for lobby leader to start the game...
              </div>
            ) : (
              <div style={{ color: "orange" }}>
                Waiting for all players to ready up...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          Waiting for {2 - props.lobby.players.length} more players to join
        </div>
      )}
    </div>
  );

  const startElem = props.me.isLeader && everyoneHasReadied && (
    <Button
      btnStyle="primary"
      className={styles.startButton}
      onClick={() => onStartPress()}
    >
      Start Game!
    </Button>
  );

  const [totalRounds, setTotalRounds] = useState(0);

  const trySetRounds = (num: number) => {
    try {
      // clamp the rounds between props.lobby.players.length and 10 x that number
      let newNum = Math.min(
        Math.max(num, props.lobby.players.length),
        props.lobby.players.length * 10
      );

      setTotalRounds(newNum);

      socket.emit("setTotalRounds", props.lobby.id, newNum);
    } catch (err) {
      console.error(err);
    }
  };
  // when the lobby resizes, make sure to update the totalRounds setting
  useEffect(() => {
    if (props.lobby.players != undefined) {
      trySetRounds(props.lobby.players.length * 2);
    }
  }, [props.lobby.players.length]);

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

  return (
    props.me.hasSetName && (
      <div className={styles.container}>
        <h2>{props.lobby.name}</h2>
        {playerList}
        {readyElem}
        {startElem}
        <div className={styles.settings}>
          {props.me.isLeader && (
            <div className={styles.lobbySettings}>
              <div className={styles.label}>Lobby Settings:</div>
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
