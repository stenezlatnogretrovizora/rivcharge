import { addHours, addWeeks, constructNow, endOfHour, startOfDay, startOfToday } from "date-fns";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timegrid'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocation } from "~/contexts/LocationContext";

type BookedSlot = {
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  editable: boolean;
};

type Charger = {
  id: string;
  name: string;
  colour: string;
  locationId: string;
}

const now = constructNow(new Date())
const start = endOfHour(now)

export default function RivCalendar({ onSlotSelect }: any) {
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const sessionData = useSession().data;
  const title = sessionData?.user?.name || "Unknown User";
  const [chargers, setChargers] = useState<Charger[]>([]);

  const { getClosestLocation } = useLocation();
  const closestLocation = getClosestLocation();

  const fetchBookedSlots = async () => {
    const response = await fetch('/api/charging-slots');
    const data: BookedSlot[] = await response.json();

    let slots = data.map((slot: any) => {
      return {
        start: slot.startTime,
        end: slot.endTime,
        id: slot.id,
        resourceId: slot.chargerId,
        title: slot.user.name,
        editable: false // todo@urk make this editable for active user
      };
    })

    setBookedSlots(slots);
  };

  useEffect(() => {
    if (bookedSlots.length === 0) return;
    if (chargers.length === 0) return;

    const newSlots = bookedSlots.map((slot) => {
      return {
        ...slot,
        color: chargers.find((charger) => charger.id === slot.resourceId)?.colour
      }
    });

    setBookedSlots(newSlots);
  }, [chargers]);

  const fetchChargers = async () => {
    const response = await fetch('/api/chargers');
    const data = await response.json();

    setChargers(data)
  }

  useEffect(() => {
    fetchBookedSlots();
    fetchChargers();
  }, []);

  const handleDateClick = (arg: any) => {
    // remove any previous unsaved events
    setBookedSlots((prevSlots) =>
      prevSlots.filter((slot) => !slot.editable)
    );

    const clickedDate = startOfDay(arg.date);
    const oneWeekFromNow = addWeeks(startOfToday(), 1);
    if (arg.date < start || clickedDate > oneWeekFromNow) {
      return;
    }

    const newEvent: BookedSlot = {
      title: title,
      start: arg.date,
      end: addHours(arg.date, 1),
      resourceId: arg.resource.id,
      editable: true,
    };

    setBookedSlots((prevSlots) => [...prevSlots, newEvent]);
    onSlotSelect({ start: arg.date, end: addHours(arg.date, 1) });
  };

  const handleEventChange = (info: any) => {
    onSlotSelect({ start: info.event.start, end: info.event.end })
  }

  const resources = chargers.filter((charger: any) => {
    return charger.locationId === closestLocation?.id;
  }).map((charger: any) => {
    return {
      id: charger.id,
      title: charger.name,
      color: charger.colour
    }
  });

  return (
    <div className={"w-2/3 bg-white"}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
        initialView="resourceTimeGridDay"
        eventMaxStack={chargers.length}
        nowIndicator={true}
        slotDuration={'00:30:00'}
        dateClick={handleDateClick} // Handle date clicks to create events
        weekends={true}
        schedulerLicenseKey={'CC-Attribution-NonCommercial-NoDerivatives'}
        resources={resources}
        headerToolbar={{
          left: 'prev,next today resourceTimelineWeek',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={bookedSlots}
        eventChange={handleEventChange}
      />
    </div>
  );
};