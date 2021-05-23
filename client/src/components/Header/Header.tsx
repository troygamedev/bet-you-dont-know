import styles from "./Header.module.scss";

interface Props {
  headerText: string;
}

const Header: React.FC<Props> = (props) => {
  return <h1>{props.headerText}</h1>;
};

export default Header;
