import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useContext } from "react";
import { Button } from "react-bootstrap-buttons";
import "react-bootstrap-buttons/dist/react-bootstrap-buttons.css";

interface Props {
  lobby: Lobby;
  me: User;
}

const SkipButton: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);
  const countWantSkip = props.lobby.players.filter((p) => p.wantsToSkip).length;
  const totalPlayers = props.lobby.players.length;

  const onSkipClick = () => {
    if (!props.me.wantsToSkip) {
      socket.emit("wantSkip", props.me);
    }
  };
  return (
    <div>
      {!props.me.wantsToSkip ? (
        <Button btnStyle="primary" onClick={() => onSkipClick()}>
          Skip
        </Button>
      ) : (
        <Button btnStyle="success">Voted</Button>
      )}
      <div>
        {countWantSkip}/{totalPlayers}
      </div>
    </div>
  );
};

export default SkipButton;
