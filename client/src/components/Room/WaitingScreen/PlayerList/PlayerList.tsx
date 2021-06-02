import KickButton from "@components/Room/GameScreen/KickButton/KickButton";
import { Lobby, User } from "@shared/types";
import { useState } from "react";
import styles from "./PlayerList.module.scss";

interface Props {
  lobby: Lobby;
  me: User;
}

const PlayerList: React.FC<Props> = (props) => {
  const [isHoveringOver, setIsHoveringOver] = useState(-1);

  return (
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
              onMouseEnter={() => {
                setIsHoveringOver(idx);
              }}
              onMouseLeave={() => {
                setIsHoveringOver(-1);
              }}
            >
              {(user.isLeader ? "[LEADER] " : "") +
                user.displayName +
                (user.socketID == props.me.socketID ? " (You) " : " ") +
                (user.isSpectator ? "[Spectator]" : "")}
              {props.me.isLeader &&
                isHoveringOver === idx &&
                user.socketID !== props.me.socketID && (
                  <KickButton whoToKick={user} />
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;
