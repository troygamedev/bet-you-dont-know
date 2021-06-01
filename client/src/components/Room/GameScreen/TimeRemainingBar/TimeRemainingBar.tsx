import ProgressBar from "@ramonak/react-progress-bar";
import { Lobby } from "@shared/types";
import styles from "./TimeRemainingBar.module.scss";

interface Props {
  lobby: Lobby;
}

const TimeRemainingBar: React.FC<Props> = (props) => {
  // how much time is remaining from 1 to 0
  const percentRemaining =
    props.lobby.game.timeLeft / props.lobby.game.fullTimeDuration;
  return (
    <div className={styles.timeRemainingContainer}>
      <div className={styles.timeBar}>
        <ProgressBar
          completed={percentRemaining * 100}
          transitionDuration={"0.5s"}
          isLabelVisible={false}
          // bgColor={percentRemaining < 0.2 ? "red" : "#db8acb"}
          bgColor={percentRemaining < 0.3 ? "red" : "#dbb35c"}
          height="100%"
        />
      </div>
      <div className={styles.timeRemainingLabel}>
        Time remaining: {props.lobby.game.timeLeft}
      </div>
    </div>
  );
};

export default TimeRemainingBar;
