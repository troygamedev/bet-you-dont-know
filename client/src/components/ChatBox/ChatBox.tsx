import styles from "./ChatBox.module.scss";
import SocketContext from "@context/SocketContext";
import { ChatMessage, User } from "@shared/types";
import React, { useState, useContext } from "react";

interface Props {
  sender: User;
  lobbyID: number;
  chatList: Array<ChatMessage>;
}

const ChatBox: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);

  const [messageText, setMessageText] = useState("");

  const sendMessage = () => {
    socket.emit("sendMessage", props.lobbyID, messageText, props.sender);
    setMessageText("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };
  return (
    <div className={styles.container}>
      {props.chatList.map((msg, idx) => {
        return <div key={idx}>{msg.user.username + ": " + msg.message}</div>;
      })}
      <div>
        <input
          type="text"
          name="chat"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
    </div>
  );
};

export default ChatBox;
