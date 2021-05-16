import Head from "next/head";
import Footer from "@components/Footer/Footer";

import Header from "@components/Header/Header";
import LobbyList from "@components/LobbyList/LobbyList";

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Chess Clock Trivia</title>
      </Head>
      <Header />
      <LobbyList />
      <Footer />
    </>
  );
};

export default Home;
