import { type AppType } from "next/app";
import { SessionProvider } from "next-auth/react";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }: any) => {
  return (
    <SessionProvider session={session}>
      <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default MyApp;
