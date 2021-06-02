import InlineCoin from "@components/InlineCoin/InlineCoin";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useContext } from "react";
import styles from "./Reveal.module.scss";

interface Props {
  lobby: Lobby;
  me: User;
}

const Reveal: React.FC<Props> = (props) => {
  const currentQuestion = props.lobby.game.currentQuestion;
  const currentAnswerer = props.lobby.game.currentAnswerer;
  let guessedChoice: string;
  // the answerer didnt make a guess
  if (currentAnswerer.guessIndex === -1) {
    guessedChoice = "(did not make a guess)";
  } else {
    guessedChoice =
      currentQuestion.allChoicesRandomized[currentAnswerer.guessIndex];
  }

  const wasCorrect =
    currentQuestion.correctAnswerIndex === currentAnswerer.guessIndex;

  return (
    <div className={styles.container}>
      <div className={styles.question}>
        The question: {currentQuestion.question}
      </div>
      <div className={styles.guess}>
        {currentAnswerer.displayName} guessed: {guessedChoice} and was
        <div
          style={{
            color: wasCorrect ? "lime" : "red",
            display: "inline",
          }}
        >
          {wasCorrect ? " correct!" : " incorrect!"}
        </div>
      </div>
      <div className={styles.explanation}>
        {wasCorrect
          ? `${currentAnswerer.displayName} earns $1000 for answering correctly and also receives everyone's incorrect bets!`
          : `The answer was ${currentQuestion.answer}. ${currentAnswerer.displayName} must pay everyone who betted against them for answering incorrectly!`}
      </div>
      <div className={styles.revealListContainer}>
        {props.lobby.game.revealResults.length === 0 ? (
          <div className={styles.revealListLabel}>
            Nobody placed any bets, so no gains or losses were made.
          </div>
        ) : (
          <>
            <div className={styles.revealListLabel}>Gains and Losses:</div>
            <div className={styles.scrollable}>
              {props.lobby.game.revealResults.map((result, idx) => {
                return (
                  <div
                    className={`${styles.row} ${
                      idx % 2 == 0 ? styles.evenRow : styles.oddRow
                    }`}
                    key={idx}
                  >
                    {result.who.displayName}:
                    <div className={styles.numberWrapper}>
                      <div
                        className={styles.number}
                        style={{
                          color: result.netGain > 0 ? "lime" : "red",
                        }}
                      >
                        {(result.netGain > 0 && "+") + result.netGain}
                        <InlineCoin width="15px" sideMargins="0 4px" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reveal;
