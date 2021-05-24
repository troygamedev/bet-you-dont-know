import styles from "./GameScreen.module.scss";
import { Lobby, User } from "@shared/types";

interface Props {
  lobby: Lobby;
  me: User;
}

const GameScreen: React.FC<Props> = (props) => {
  return <div>Game!</div>;
};

export default GameScreen;
