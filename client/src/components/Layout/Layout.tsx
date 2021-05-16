import Footer from "@components/Footer/Footer";
import Header from "@components/Header/Header";
import Head from "next/head";
import { useEffect, useState, useContext } from "react";
import SocketContext from "@context/SocketContext";

interface Props {
  title: string;
}

const Layout: React.FC<Props> = (props) => {
  const socket = useContext(SocketContext);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (socket.active) {
      setIsConnected(true);
    }
    socket.on("connect", () => {
      setIsConnected(true);
    });
  }, []);
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Header />
      {isConnected ? props.children : "Loading..."}
      <Footer />
    </>
  );
};

export default Layout;
