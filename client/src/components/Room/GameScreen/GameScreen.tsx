import styles from "./GameScreen.module.scss";
import { Lobby, User } from "@shared/types";
import Scoreboard from "./Scoreboard/Scoreboard";
import Answering from "./Answering/Answering";
import Betting from "./Betting/Betting";
import TimeRemainingBar from "./TimeRemainingBar/TimeRemainingBar";
import Reveal from "./Reveal/Reveal";
import InlineCoin from "@components/InlineCoin/InlineCoin";
import SkipButton from "./SkipButton/SkipButton";
import GameOver from "./GameOver/GameOver";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameScreen: React.FC<Props> = (props) => {
  const countdownElem = props.lobby.game.gameStage === "Countdown" && (
    <div>Game starting in {props.lobby.game.timeLeft}</div>
  );

  const gameInfoElem = (
    <div className={styles.gameInfo}>
      <p>{props.lobby.game.gameStage} Phase</p>
      <p>
        Round {props.lobby.game.roundsCompleted + 1} /{" "}
        {props.lobby.game.totalRoundsUntilGameover}
      </p>
    </div>
  );
  const moneyElem = (
    <div className={styles.money}>
      Your balance: {props.me.money}{" "}
      <InlineCoin width="auto" sideMargins="0 5px" />{" "}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.upper}>
        {props.lobby.game.gameStage !== "GameOver" && (
          <div className={styles.scoreboard}>
            <Scoreboard lobby={props.lobby} me={props.me} />
          </div>
        )}
        <div className={styles.notScoreboard}>
          {gameInfoElem}
          {moneyElem}
        </div>
      </div>
      <div className={styles.lower}>
        <div className={styles.mid}>
          {props.lobby.game.gameStage === "Countdown" && countdownElem}
          {props.lobby.game.gameStage === "Answering" && (
            <Answering lobby={props.lobby} me={props.me} />
          )}
          {props.lobby.game.gameStage === "Betting" &&
            !props.me.isSpectator && (
              <Betting lobby={props.lobby} me={props.me} />
            )}
          {props.lobby.game.gameStage === "Reveal" && (
            <Reveal lobby={props.lobby} me={props.me} />
          )}
          {props.lobby.game.gameStage === "GameOver" && (
            <GameOver lobby={props.lobby} me={props.me} />
          )}
        </div>
        <div className={styles.bottom}>
          {props.lobby.isInGame && (
            <>
              <div className={styles.timeRemainingBar}>
                <TimeRemainingBar lobby={props.lobby} />
              </div>
              <div className={styles.skipButton}>
                <SkipButton lobby={props.lobby} me={props.me} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
