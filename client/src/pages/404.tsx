import Layout from "@components/Layout/Layout";

const FourOhFour: React.FC = () => {
  return (
    <Layout title={"Page Not Found"}>
      <h2>404 - Page Not Found :(</h2>
      <a href="../">Click me to go to home page</a>
    </Layout>
  );
};
export default FourOhFour;
