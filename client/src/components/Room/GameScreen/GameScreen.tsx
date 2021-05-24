import styles from "./GameScreen.module.scss";
import { GameStage, Lobby, User } from "@shared/types";
import { useContext } from "react";
import SocketContext from "@context/SocketContext";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameScreen: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);

  const countdownElem = props.lobby.game.gameStage === "Countdown" && (
    <div>Game starting in {props.lobby.game.timeLeft}</div>
  );
  let answeringElem: JSX.Element;

  const onQuestionClick = () => {
    // socket.emit();
  };

  if (props.lobby.game.gameStage === "Answering") {
    const currentQuestion = props.lobby.game.currentQuestion;
    // if it is this player's turn to answer
    if (props.lobby.game.currentAnswerer.socketID === props.me.socketID) {
      answeringElem = (
        <div>
          <h3>{currentQuestion.question}</h3>
          {
            // render each question (randomized)
            currentQuestion.allChoicesRandomized.map((questionStr, idx) => {
              return (
                <div key={idx} onClick={() => onQuestionClick()}>
                  {questionStr}
                </div>
              );
            })
          }
        </div>
      );
    } else {
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
    }
  }
  return (
    <div>
      {countdownElem}
      {answeringElem}
    </div>
  );
};

export default GameScreen;
