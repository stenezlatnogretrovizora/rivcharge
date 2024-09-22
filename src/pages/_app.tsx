import { type AppType } from "next/app";
import { SessionProvider } from "next-auth/react";

import "~/styles/globals.css";
import { LocationProvider } from "~/contexts/LocationContext";
import SidebarComponent from "~/components/Sidebar";
import { type Session } from "next-auth";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <LocationProvider>
        <div
          className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <main className="flex flex-col lg:flex-row min-h-screen">
            <SidebarComponent/>
            <Component {...pageProps} />
          </main>
        </div>
      </LocationProvider>
    </SessionProvider>
  );
};

export default MyApp;
