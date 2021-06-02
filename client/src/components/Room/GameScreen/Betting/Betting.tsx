import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useState, useEffect, useContext } from "react";
import styles from "./Betting.module.scss";
import { Button } from "react-bootstrap-buttons";
import "react-bootstrap-buttons/dist/react-bootstrap-buttons.css";
import InlineCoin from "@components/InlineCoin/InlineCoin";

interface Props {
  lobby: Lobby;
  me: User;
}

const Betting: React.FC<Props> = (props) => {
  const [betValue, setBetValue] = useState(0);
  const socket = useContext(SocketContext);

  const amCurrentlyAnswering =
    props.lobby.game.currentAnswerer?.socketID === props.me.socketID;

  // when this player is mad broke (into debt), make sure they cant bet anything
  useEffect(() => {
    if (props.me.money < 0) {
      setBetValue(0);
    }
  }, [props.me.money]);
  const handleBetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // if i was not the one who answered
  if (!amCurrentlyAnswering) {
    return (
      <div className={styles.bettingContainer}>
        <label htmlFor="bet" className={styles.betLabel}>
          How much do you want to bet that{" "}
          {props.lobby.game.currentAnswerer.displayName} answered incorrectly?
        </label>
        <div className={styles.currentBet}>
          Your current bet: {props.me.bet}{" "}
          <InlineCoin width="20px" sideMargins="0 5px" />
        </div>
        <div className={styles.betRow}>
          <InlineCoin width="40px" sideMargins="0 10px" />
          <input
            type="number"
            min={0}
            max={props.me.money}
            step={props.me.money / 10}
            value={betValue}
            onChange={(e) => {
              handleBetValueChange(e);
            }}
            className={styles.betInput}
          ></input>
          <div className={styles.betsPresetsButtons}>
            <Button
              btnStyle="success"
              onClick={() => {
                setBetValue(0);
              }}
            >
              Zero
            </Button>
            <Button
              btnStyle="success"
              onClick={() => {
                setBetValue(Math.max(0, props.me.money / 2));
              }}
            >
              Half
            </Button>
            <Button
              btnStyle="success"
              onClick={() => {
                setBetValue(Math.max(0, props.me.money));
              }}
            >
              All In
            </Button>
          </div>
        </div>
        <Button
          btnStyle="primary"
          onClick={() => submitBet()}
          className={styles.betButton}
        >
          Confirm Bet
        </Button>
      </div>
    );
  } else {
    return (
      <div>
        Other players are placing bets if you answered the question incorrectly.
      </div>
    );
  }
};

export default Betting;
