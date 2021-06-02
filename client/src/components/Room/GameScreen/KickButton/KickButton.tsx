import SocketContext from "@context/SocketContext";
import { User } from "@shared/types";
import { useContext } from "react";
import styles from "./KickButton.module.scss";
import { Button } from "react-bootstrap-buttons";
import "react-bootstrap-buttons/dist/react-bootstrap-buttons.css";

interface Props {
  whoToKick: User;
}

const KickButton: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);
  const onKickClick = () => {
    socket.emit("kickPlayer", props.whoToKick);
  };

  return (
    <div className={styles.container}>
      <Button
        btnStyle="danger"
        sm
        onClick={() => onKickClick()}
        className={styles.button}
      >
        Kick
      </Button>
    </div>
  );
};

export default KickButton;
