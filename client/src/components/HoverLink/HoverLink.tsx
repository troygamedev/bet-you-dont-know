import Link from "next/link";

interface Props {
  children;
  href: string;
}

const HoverLink: React.FC<Props> = (props) => {
  const myStyle = {
    cursor: "pointer",
  };
  return (
    <div style={myStyle}>
      <Link href={props.href}>{props.children}</Link>
    </div>
  );
};

export default HoverLink;
