import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useContext } from "react";
import styles from "./Answering.module.scss";
interface Props {
  lobby: Lobby;
  me: User;
}

const Answering: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);
  const currentQuestion = props.lobby.game.currentQuestion;
  const amCurrentlyAnswering =
    props.lobby.game.currentAnswerer?.socketID === props.me.socketID;
  const onQuestionClick = (idx: number) => {
    // if it is this player's turn to answer
    if (amCurrentlyAnswering) {
      socket.emit("guessAnswer", props.me, idx);
    }
  };
  return (
    <div className={styles.answeringContainer}>
      <div className={styles.question}>{currentQuestion.question}</div>
      <div
        className={`${styles.currentlyAnsweringIndicator} ${
          amCurrentlyAnswering && styles.currentlyAnswering
        }`}
      >
        Currently Answering:{" "}
        {amCurrentlyAnswering
          ? "YOU"
          : props.lobby.game.currentAnswerer.displayName}
      </div>
      <div className={styles.choices}>
        {
          // render each question (randomized)
          currentQuestion.allChoicesRandomized.map((questionStr, idx) => {
            return (
              <div
                key={idx}
                className={`${styles.choice} ${
                  amCurrentlyAnswering && styles.answering
                }`}
                onClick={() => onQuestionClick(idx)}
                style={{
                  color:
                    amCurrentlyAnswering &&
                    props.me.guessIndex === idx &&
                    "orange",
                }} // mark choice as orange if selected by user
              >
                {questionStr}
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default Answering;
