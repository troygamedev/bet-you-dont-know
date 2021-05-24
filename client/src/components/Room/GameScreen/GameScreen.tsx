import styles from "./GameScreen.module.scss";
import { GameStage, Lobby, User } from "@shared/types";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameScreen: React.FC<Props> = (props) => {
  const countdownElem = props.lobby.game.gameStage === "Countdown" && (
    <div>Game starting in {props.lobby.game.timeLeft}</div>
  );
  let answeringElem: JSX.Element;
  if (props.lobby.game.gameStage === "Answering") {
    const currentQuestion = props.lobby.game.currentQuestion;
    answeringElem = (
      <div>
        <h3>{currentQuestion.question}</h3>
        {
          // render each question (randomized)
          currentQuestion.allChoicesRandomized.map((questionStr, idx) => {
            return <div key={idx}>{questionStr}</div>;
          })
        }
      </div>
    );
    // if it is this player's turn to answer
    if (props.lobby.game.currentAnswerer.socketID === props.me.socketID) {
    }
  }
  const num: GameStage = "Countdown";
  return (
    <div>
      {countdownElem}
      {answeringElem}
      {num}
    </div>
  );
};

export default GameScreen;
