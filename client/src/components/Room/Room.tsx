import Layout from "@components/Layout/Layout";
import SocketContext from "@context/SocketContext";
import { Lobby, User } from "@shared/types";
import { useEffect, useState, useContext, useRef } from "react";
import swal from "sweetalert";
import ChatBox from "./ChatBox/ChatBox";
import GameScreen from "./GameScreen/GameScreen";
import WaitingScreen from "./WaitingScreen/WaitingScreen";
import styles from "./Room.module.scss";
import { useRouter } from "next/router";

const Room: React.FC = () => {
  const socket = useContext(SocketContext);
  const router = useRouter();

  const [lobby, setLobby] = useState<Lobby>();

  const [me, setMe] = useState<User>();
  useEffect(() => {
    socket.on("updateLobby", (newLobby: Lobby) => {
      setLobby(newLobby);
    });
    socket.on("joinLobbyError", (message: string) => {
      swal({
        title: "Error",
        text: message,
        icon: "error",
      }).then(() => {
        // redirect to homepage
        router.push("/");
      });
    });
    return () => {
      socket.emit("leaveLobby");
    };
  }, []);

  useEffect(() => {
    setMe(
      lobby &&
        lobby.users &&
        lobby.users.find((user) => user.socketID == socket.id)
    );
  }, [lobby]);

  const [usernameBox, setUsernameBox] = useState("");

  const setUsername = () => {
    if (usernameBox.trim() == "") {
      swal({
        title: "Invalid Username",
        text: "Please enter a valid username.",
        icon: "warning",
      });
    } else {
      socket.emit("setUsername", me, usernameBox);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setUsername();
    }
  };

  // alert the user when they try to leave the page
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      window.addEventListener("beforeunload", alertUser);
      return () => {
        window.removeEventListener("beforeunload", alertUser);
      };
    }
  }, []);

  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };

  const outputLinkRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const onClipboard = (e) => {
    outputLinkRef.current.select();
    document.execCommand("copy");
    e.target.focus();
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  if (lobby && me) {
    const namePickElem = me.hasSetName || (
      <div className={styles.namePickContainer}>
        <label className={styles.namePickLabel}>Enter your Nickname</label>
        <input
          type="text"
          name="username"
          className={styles.namePickInput}
          value={usernameBox}
          maxLength={20}
          onChange={(e) => {
            setUsernameBox(e.target.value);
          }}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
    );
    const screenElem = lobby.isInGame ? (
      <GameScreen lobby={lobby} me={me} />
    ) : (
      <WaitingScreen lobby={lobby} me={me} />
    );

    const rulesElem = (
      <div>
        <div>
          When it is your turn:
          <ul>
            <li>
              If you answer the trivia question correctly, you get $1000. You
              also receive money from all the bets that were placed against you.
            </li>
            <li>
              If you answer the trivia question incorrectly, you lose however
              much money your friends betted against you.
            </li>
          </ul>
        </div>
        <div>
          When it is someone else's turn:
          <ul>
            <li>
              You can place bets that your friend would answer the trivia
              question incorrectly.
            </li>
            <li>
              If your prediction was correct, the amount of money you bet will
              be taken from that player's balance and into yours.
            </li>
            <li>
              If your prediction was incorrect, you lose the amount of money you
              bet and will be given to the player.
            </li>
          </ul>
        </div>
      </div>
    );

    const linkShareElem = (
      <div className={styles.linkShareContainer}>
        <label className={styles.label}>Invite your friends by sharing:</label>
        <div className={styles.linkShareRow}>
          <input
            type="text"
            onFocus={(e) => e.target.select()}
            className={styles.outputLink}
            ref={outputLinkRef}
            value={window.location.href}
            readOnly
          />
          <div className={styles.clipboardAndAlert}>
            {isCopied && <div className={styles.copiedAlert}>Copied!</div>}
            <button
              className={styles.clipboardButton}
              onClick={(e) => onClipboard(e)}
            >
              <img src="../../img/clipboard.png"></img>
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <Layout title={lobby.name ? lobby.name : "Loading..."} alertLeave>
        {namePickElem}
        {me.hasSetName && (
          <>
            <div className={styles.container}>
              <div className={styles.screen}>{screenElem}</div>
              <div className={styles.chat}>
                {me.hasSetName && (
                  <ChatBox
                    sender={me}
                    lobbyID={lobby.id}
                    chatList={lobby.chatMessages}
                  />
                )}
              </div>
            </div>
            {linkShareElem}
            {rulesElem}
          </>
        )}
      </Layout>
    );
  }
  return <div>Loading...</div>;
};

export default Room;
