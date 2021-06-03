import { Lobby } from "@shared/types";
import { useState } from "react";
import swal from "sweetalert";
import JSONTree from "react-json-tree";

const Admin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const onPasswordSubmit = async () => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    });
    const code = response.status;
    if (code == 200) {
      setIsLoggedIn(true);
      fetchAllLobbies();
    } else {
      swal("Wrong password");
    }
  };

  const [lobbies, setLobbies] = useState<Array<Lobby>>([]);
  const fetchAllLobbies = async () => {
    const response = await fetch("/api/admin/lobbies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setLobbies(data.lobbies);
  };

  const shutdownLobby = async (id: string) => {
    const response = await fetch("/api/admin/shutdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    });

    fetchAllLobbies();
  };
  return (
    <div>
      <input
        type="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        value={password}
      />
      <button onClick={() => onPasswordSubmit()}>Submit</button>
      <button onClick={() => fetchAllLobbies()}>Refetch</button>

      {isLoggedIn && lobbies !== undefined && (
        <div>
          {lobbies.map((lobby) => {
            return (
              <div>
                <JSONTree data={lobby} />
                <button onClick={() => shutdownLobby(lobby.id)}>
                  Shut down
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Admin;
