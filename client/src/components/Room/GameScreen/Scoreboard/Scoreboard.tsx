import InlineCoin from "@components/InlineCoin/InlineCoin";
import { Lobby, User } from "@shared/types";
import styles from "./Scoreboard.module.scss";

interface Props {
  lobby: Lobby;
  me: User;
}

const Scoreboard: React.FC<Props> = (props) => {
  // copy the players array
  const rankings = [...props.lobby.players];
  // sort the players by money
  rankings.sort((a, b) => b.money - a.money);

  return (
    <div className={styles.container}>
      <div className={styles.label}>Scoreboard</div>
      <div className={styles.list}>
        {rankings.map((player, idx) => {
          return (
            <div
              key={idx}
              className={`${styles.row} ${
                idx % 2 == 0 ? styles.evenRow : styles.oddRow
              }`}
            >
              <div className={styles.wrapper}>
                <div className={styles.name}>
                  {idx + 1}. {player.displayName}:
                </div>
                <div className={styles.numberWrapper}>
                  <div className={styles.number}>
                    {player.money}
                    <InlineCoin width="15px" sideMargins="0 4px" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;
