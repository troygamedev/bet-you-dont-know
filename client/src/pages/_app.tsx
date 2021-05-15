import type { AppProps } from "next/app";
import io from "socket.io-client";
import "@styles/globals.scss";
import SocketContext from "@context/SocketContext";
const SOCKET_URL =
  process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000";

const socket = io(SOCKET_URL);

function Application({ Component, pageProps }: AppProps) {
  return (
    <SocketContext.Provider value={socket}>
      <Component {...pageProps} />
    </SocketContext.Provider>
  );
}

export default Application;
