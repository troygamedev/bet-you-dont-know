import Footer from "@components/Footer/Footer";
import Header from "@components/Header/Header";
import Head from "next/head";

interface Props {
  children;
  title: string;
}

const Layout: React.FC<Props> = (props) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Header />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
