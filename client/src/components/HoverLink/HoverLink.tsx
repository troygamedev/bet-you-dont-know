import Link from "next/link";

interface Props {
  children;
  href: string;
  active?: boolean;
}

const HoverLink: React.FC<Props> = (props) => {
  const myStyle = {
    cursor: "pointer",
  };
  return (
    <div style={myStyle}>
      {props.active ? (
        <Link href={props.href}>{props.children}</Link>
      ) : (
        props.children
      )}
    </div>
  );
};

export default HoverLink;
