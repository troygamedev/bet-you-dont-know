import ProgressBar from "@ramonak/react-progress-bar";
import { Lobby } from "@shared/types";
import styles from "./TimeRemainingBar.module.scss";

interface Props {
  lobby: Lobby;
}

const TimeRemainingBar: React.FC<Props> = (props) => {
  return (
    <div className={styles.timeRemainingContainer}>
      <div className={styles.timeBar}>
        <ProgressBar
          completed={
            (props.lobby.game.timeLeft / props.lobby.game.fullTimeDuration) *
            100
          }
          transitionDuration={"0.5s"}
          isLabelVisible={false}
          bgColor={"#db8acb"}
        />
      </div>
      <div className={styles.timeRemainingLabel}>
        Time remaining: {props.lobby.game.timeLeft}
      </div>
    </div>
  );
};

export default TimeRemainingBar;
