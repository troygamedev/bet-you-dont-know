import Head from "next/head";

import LobbyList from "@components/LobbyList/LobbyList";
import Layout from "@components/Layout/Layout";

const Home: React.FC = () => {
  return (
    <>
      <Layout title="Chess Clock Trivia">
        <LobbyList />
      </Layout>
    </>
  );
};

export default Home;
