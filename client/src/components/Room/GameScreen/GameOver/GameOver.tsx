import { Lobby, User } from "@shared/types";
import Scoreboard from "../Scoreboard/Scoreboard";
import styles from "./Gameover.module.scss";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameOver: React.FC<Props> = (props) => {
  // add winner(s) (there might be multiple for tied money)
  const playersSorted = props.lobby.players.sort((a, b) => b.money - a.money);
  let winners: Array<User> = [];
  let winnerIndex = 0;
  do {
    winners.push(playersSorted[winnerIndex]);
    winnerIndex++;
  } while (
    winnerIndex < playersSorted.length &&
    winners[winnerIndex - 1] == winners[winnerIndex]
  );

  return (
    <div className={styles.container}>
      <div className={styles.gameoverTitle}>Game Over!</div>
      {winners.length === 1 ? (
        <div className={styles.winner}>Winner: {winners[0].displayName}</div>
      ) : (
        <div className={styles.winner}>
          Winners:{" "}
          {winners.forEach((winner) => {
            <div>{winner.displayName}</div>;
          })}
        </div>
      )}
      <div className={styles.scoreboard}>
        <Scoreboard lobby={props.lobby} me={props.me} />
      </div>
    </div>
  );
};

export default GameOver;
