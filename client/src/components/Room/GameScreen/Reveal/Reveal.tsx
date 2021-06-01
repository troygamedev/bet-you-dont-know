import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useContext, useEffect } from "react";

interface Props {
  lobby: Lobby;
  me: User;
}

const Reveal: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);
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
    <div>
      <div>The question: {currentQuestion.question}</div>
      <div>
        {currentAnswerer.displayName} guessed: {guessedChoice}
      </div>
      <div>
        {currentAnswerer.displayName} was{" "}
        {wasCorrect ? "correct!" : "incorrect!"}
      </div>
      <div>
        {props.lobby.game.revealResults.map((result) => {
          return (
            <div>
              {result.who.displayName}: {result.netGain}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reveal;
