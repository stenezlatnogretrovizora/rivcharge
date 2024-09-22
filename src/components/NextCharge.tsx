/* eslint-disable */
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { constructNow, differenceInMinutes } from "date-fns";
import type { SlotExtended } from "~/types/slots";

export default function NextCharge() {
  const session = useSession().data as Session & { user: { id: string } };
  const [upcomingCharge, setUpcomingCharge] = useState<SlotExtended>();

  useEffect(() => {
    const fetchUpcomingCharge = async () => {
      const response = await fetch('/api/charging-slots/upcoming');
      const data = await response.json();

      if (response.ok) {
        setUpcomingCharge(data);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchUpcomingCharge();
  }, []);


  let component: React.JSX.Element = <div>Loading...</div>;

  if (!upcomingCharge) {
    component = (<div className="text-base text-[#6B7280] mb-6">
      You have no upcoming charges
    </div>)
  } else {
    const timeToCharge = differenceInMinutes(new Date(upcomingCharge?.startTime), constructNow(new Date()));
    let timeToChargeString = '';

    if (timeToCharge < 1) {
      timeToChargeString = 'less than a minute.';
    } else if (timeToCharge < 60) {
      timeToChargeString = `${timeToCharge} minutes.`;
    } else if (timeToCharge < 1440) {
      timeToChargeString = `${Math.floor(timeToCharge / 60)} hours and ${timeToCharge % 60} minutes.`;
    } else {
      timeToChargeString = `${Math.floor(timeToCharge / 1440)} days, ${Math.floor((timeToCharge % 1440) / 60)} hours and ${timeToCharge % 60} minutes.`;
    }

    const startTime = new Date(upcomingCharge?.startTime).toUTCString();
    const endTime = new Date(upcomingCharge?.endTime).toUTCString();
    const location = upcomingCharge.charger.location.city + ', ' +
      upcomingCharge.charger.location.country;

    component = (
      <>
        <div className="text-base text-[#6B7280] mb-6">
          You have an upcoming charge in {timeToChargeString}
        </div>
        <div className="flex flex-col justify-between">
          <div className="text-sm text-[#6A64F1] font-medium">
            Location: {location}
          </div>
          <div className="text-sm text-[#6A64F1] font-medium">
            Charger: {upcomingCharge.charger.name}
          </div>
          <div className="text-sm text-[#6A64F1] font-medium">
            Start Time: {startTime}
          </div>
          <div className="text-sm text-[#6A64F1] font-medium">
            End Time: {endTime}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="flex justify-center items-center p-10">
      <div className="bg-white shadow-lg rounded-md p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-[#07074D] mb-4">
          Hello {session?.user?.name}
        </h2>
        {component}
      </div>
    </div>
  );
}
