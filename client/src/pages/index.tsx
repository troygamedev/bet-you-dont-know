import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const Home: React.FC = () => {
  const [response, setResponse] = useState("Connecting...");

  useEffect(() => {
    const socket = socketIOClient("http://localhost:5000");
    socket.on("connect", () => {
      setResponse("CONNECTED!");
    });
  }, []);

  return <div>{response}</div>;
};

export default Home;
