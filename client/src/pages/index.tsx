import LobbyList from "@components/LobbyList/LobbyList";
import Layout from "@components/Layout/Layout";
import UsernameBox from "@components/UsernameBox/UsernameBox";

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
