import { createContext } from "react";
import { Socket } from "socket.io-client";

const SocketContext = createContext<Socket>(null);

export default SocketContext;
