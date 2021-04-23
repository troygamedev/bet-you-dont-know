import type { AppProps } from "next/app";

import "@styles/globals.scss";
function Application({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default Application;
