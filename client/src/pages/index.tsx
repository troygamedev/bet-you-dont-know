import { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [state, setState] = useState();
  useEffect(() => {
    const fetchAPI = async () => {
      const response = await fetch("/api");
      const json = await response.json();
      setState(json.message);
    };
    fetchAPI();
  }, []);

  return <div>{state}</div>;
};

export default Home;
