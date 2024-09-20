import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useLocation } from "~/contexts/LocationContext";
import { useEffect, useState } from "react";
import { constructNow, differenceInMinutes } from "date-fns";

type ChargerSlot = {
  id: string;
  userId: string;
  chargerId: string;
  startTime: string; // ISO date format (string representation of a date)
  endTime: string;   // ISO date format (string representation of a date)
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING'; // Assuming these are the possible statuses
  createdAt: string; // ISO date format (string representation of a date)
  user: {
    name: string;
  };
  charger: {
    id: string;
    name: string;
    colour: string;
    locationId: string;
    location: {
      city: string;
      country: string;
    };
  };
};

export default function NextCharge() {
  const session = useSession().data as Session & { user: { id: string } };
  const { getClosestLocation } = useLocation();
  let [upcomingCharge, setUpcomingCharge] = useState<ChargerSlot>();

  useEffect(() => {
    const fetchUpcomingCharge = async () => {
      const response = await fetch('/api/charging-slots/upcoming');
      const data = await response.json();
      setUpcomingCharge(data);
    };

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

    let startTime = new Date(upcomingCharge?.startTime).toUTCString();
    let endTime = new Date(upcomingCharge?.endTime).toUTCString();
    let location = upcomingCharge.charger.location.city + ', ' +
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
    <div className="flex justify-center items-center p-12">
      <div className="bg-white shadow-lg rounded-md p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-[#07074D] mb-4">
          Hello {session?.user?.name}
        </h2>
        {component}
      </div>
    </div>
  );
}
