import styles from "./ChatBox.module.scss";
import SocketContext from "@context/SocketContext";
import { ChatMessage, User } from "@shared/types";
import dayjs from "dayjs";
import React, { useState, useContext, useEffect } from "react";

interface Props {
  sender: User;
  lobbyID: string;
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

  const [timeOfJoin, setTimeOfJoin] = useState(dayjs());
  useEffect(() => {
    setTimeOfJoin(timeOfJoin);
  }, []);

  return (
    <div className={styles.container}>
      {props.chatList.map((msg, idx) => {
        // first check if the message is sent after the user joined (prevent them from seeing past messages)
        // users can see past 10 seconds of messages
        if (dayjs(msg.timestamp).isAfter(timeOfJoin.subtract(10, "seconds"))) {
          if (msg.isServer) {
            return (
              <div key={idx}>
                <strong>{msg.message}</strong>
              </div>
            );
          }
          return (
            <div key={idx}>
              {(msg.user.isLeader ? "[LEADER] " : "") +
                msg.user.displayName +
                (props.sender.socketID == socket.id && " (You)") +
                ": " +
                msg.message}
            </div>
          );
        }
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
