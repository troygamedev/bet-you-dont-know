import styles from "./Header.module.scss";
import HoverLink from "@components/HoverLink/HoverLink";

interface Props {
  headerText: string;
}

const Header: React.FC<Props> = (props) => {
  return (
    <HoverLink href={"/"}>
      <div className={styles.container}>
        <img src="/img/logo.svg" alt="logo" className={styles.logoImg} />
        <div className={styles.text}>
          <h1>{props.headerText}</h1>
          <h2>a simple multiplayer game of wits, deception, and bets!</h2>
        </div>
      </div>
    </HoverLink>
  );
};

export default Header;
