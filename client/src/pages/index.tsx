import LobbyList from "@components/LobbyList/LobbyList";
import Layout from "@components/Layout/Layout";

const Home: React.FC = () => {
  return (
    <>
      <Layout title="Bet You Don't Know" url={window.location.href}>
        <LobbyList />
      </Layout>
    </>
  );
};

export default Home;
