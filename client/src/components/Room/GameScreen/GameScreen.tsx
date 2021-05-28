import styles from "./GameScreen.module.scss";
import { Lobby, User } from "@shared/types";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import SocketContext from "@context/SocketContext";
import Scoreboard from "./Scoreboard/Scoreboard";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameScreen: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);

  const countdownElem =
    props.lobby.game.gameStage === "Countdown" ? (
      <div>Game starting in {props.lobby.game.timeLeft}</div>
    ) : (
      <div>Time remaining: {props.lobby.game.timeLeft}</div>
    );

  let answeringElem: JSX.Element;

  const onQuestionClick = (idx: number) => {
    socket.emit("guessAnswer", props.me, idx);
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
                <div
                  key={idx}
                  onClick={() => onQuestionClick(idx)}
                  style={{ color: props.me.guessIndex === idx && "orange" }} // mark choice as orange if selected by user
                >
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
  let bettingElem = <></>;
  const [betValue, setBetValue] = useState(0);

  // when this player is mad broke (into debt), make sure they cant bet anything
  useEffect(() => {
    if (props.me.money < 0) {
      setBetValue(0);
    }
  }, [props.me.money]);
  const handleBetValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      let num = parseInt(e.target.value);

      // clamp this value between 0 and this player's current balance
      num = Math.max(0, Math.min(num, props.me.money));

      setBetValue(num);
    } catch (err) {
      console.error(err);
    }
  };
  const submitBet = () => {
    socket.emit("placeBet", props.me, betValue);
  };

  if (props.lobby.game.gameStage === "Betting") {
    // if i was not the one who answered
    if (props.lobby.game.currentAnswerer.socketID !== props.me.socketID) {
      bettingElem = (
        <>
          <label htmlFor="bet">
            How much do you bet that{" "}
            {props.lobby.game.currentAnswerer.displayName} answered incorrectly?
          </label>
          <input
            type="number"
            min={0}
            max={props.me.money}
            step={props.me.money / 10}
            value={betValue}
            onChange={(e) => {
              handleBetValueChange(e);
            }}
          ></input>
          <button onClick={() => submitBet()}>Confirm bet</button>
          <p>Your current bet: {props.me.bet}</p>
        </>
      );
    }
  }

  const gameInfoElem = props.lobby.game.gameStage != "Countdown" && (
    <div>
      <p>{props.lobby.game.gameStage} Phase</p>
      <p>
        Round {props.lobby.game.roundsCompleted + 1} /{" "}
        {props.lobby.game.totalRoundsUntilGameover}
      </p>
      <p>
        Currently Answering: {props.lobby.game.currentAnswerer.displayName}{" "}
      </p>
    </div>
  );
  const moneyElem = <div>Your balance: ${props.me.money}</div>;
  return (
    <div>
      <Scoreboard lobby={props.lobby} me={props.me} />
      {gameInfoElem}
      {countdownElem}
      {moneyElem}
      {answeringElem}
      {bettingElem}
    </div>
  );
};

export default GameScreen;
