import GameContext from "@context/GameContext";
import { useContext } from "react";
import styles from "./Game.module.scss";

const Game: React.FC = () => {
  const [gameData, setGameData] = useContext(GameContext);
  return <div>{gameData.isInLobby ? "IN LOBBY" : "NOT IN LOBBY"}</div>;
};

export default Game;
