import styles from "./Header.module.scss";
import HoverLink from "@components/HoverLink/HoverLink";
import swal from "sweetalert";
import { useRouter } from "next/router";

interface Props {
  headerText: string;
  alertLeave?: boolean;
}

const Header: React.FC<Props> = (props) => {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (props.alertLeave) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        title: "Leave Warning",
        text: "Are you sure you want to leave the lobby - you will lose all your progress!",
        icon: "warning",
        buttons: {
          leave: {
            text: "Leave",
            value: "leave",
          },
          cancel: true,
        },
      }).then((buttonVal: string) => {
        switch (buttonVal) {
          case "leave":
            router.push(window.location.origin);
            break;
          case "cancel":
            break;
        }
      });
    }
  };
  return (
    <div onClick={(e) => handleClick(e)}>
      <HoverLink href={"/"} active={!props.alertLeave}>
        <div className={styles.container}>
          <img src="/img/logo.svg" alt="logo" className={styles.logoImg} />
          <div className={styles.text}>
            <h1>{props.headerText}</h1>
            <h2>a simple multiplayer game of wits, deception, and bets!</h2>
          </div>
        </div>
      </HoverLink>
    </div>
  );
};

export default Header;
