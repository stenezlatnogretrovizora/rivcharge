import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextCharge from "~/components/NextCharge";
import RivCalendar from "~/components/RivCalendar";
import BookingSlotForm from "~/components/BookingSlotForm";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedRange, setSelectedRange] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1">
        <div className="flex flex-col lg:ml-6 lg:mt-0 mt-6">
          <NextCharge />
          {selectedRange && (
            <BookingSlotForm selectedRange={selectedRange}/>
          )}
        </div>
        <RivCalendar onSlotSelect={setSelectedRange}/>
      </div>
    </>
  );
}
