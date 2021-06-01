import styles from "./InlineCoin.module.scss";
interface Props {
  width: string;
  sideMargins: string;
}
const InlineCoin: React.FC<Props> = (props) => {
  return (
    <div className={styles.container} style={{ margin: props.sideMargins }}>
      <div className={styles.wrapper} style={{ width: props.width }}>
        <img src="/img/logo.svg" alt="coin" className={styles.image} />
      </div>
    </div>
  );
};

export default InlineCoin;
