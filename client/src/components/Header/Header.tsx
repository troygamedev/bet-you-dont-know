import styles from "./Header.module.scss";

interface Props {
  headerText: string;
}

const Header: React.FC<Props> = (props) => {
  return (
    <>
      <h1>{props.headerText}</h1>
      <img src="/img/logo.svg" alt="logo" className={styles.logoImg} />
    </>
  );
};

export default Header;
