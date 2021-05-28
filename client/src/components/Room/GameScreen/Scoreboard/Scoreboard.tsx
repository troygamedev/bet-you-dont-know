import { Lobby, User } from "@shared/types";

interface Props {
  lobby: Lobby;
  me: User;
}

const Scoreboard: React.FC<Props> = (props) => {
  // copy the players array
  const rankings = [...props.lobby.players];
  // sort the players by money
  rankings.sort((a, b) => a.money - b.money);

  return (
    <div>
      <div>Scoreboard</div>
      {rankings.map((player, idx) => {
        return (
          <div key={idx}>
            {idx + 1}. {player.displayName}: ${player.money}
          </div>
        );
      })}
    </div>
  );
};

export default Scoreboard;
