import { addHours, addWeeks, constructNow, startOfDay, startOfToday } from "date-fns";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timegrid';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocation } from "~/contexts/LocationContext";
import type { BookedSlot, OnSlotSelect } from "~/types/slots";
import { useChargingData } from "~/hooks/useChargingData";
import { type EventChangeArg, type EventClickArg } from "@fullcalendar/core";

export default function RivCalendar({ onSlotSelect }: OnSlotSelect) {
  const { bookedSlots, setBookedSlots, chargers } = useChargingData();
  const [isLoading, setIsLoading] = useState(true);
  const sessionData = useSession().data;
  const title = sessionData?.user?.name ?? "Unknown User";
  const [resourceId, setResourceId] = useState<string>();
  const [canDelete, setCanDelete] = useState(false);

  const { getClosestLocation } = useLocation();
  const closestLocation = getClosestLocation();

  useEffect(() => {
    if (bookedSlots) {
      setIsLoading(false);
    }
  }, [bookedSlots]);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setBookedSlots((prevSlots) =>
      prevSlots.filter((slot) => slot.id)
    );

    const clickedDate = startOfDay(arg.date);
    const oneWeekFromNow = addWeeks(startOfToday(), 1);
    if (arg.date < constructNow(new Date()) || clickedDate > oneWeekFromNow) {
      return;
    }

    let chargerId = chargers[0]?.id ?? '';
    if (arg.resource) {
      chargerId = arg.resource.id;
    }

    setResourceId(chargerId);

    const newEvent: BookedSlot = {
      title: title,
      start: arg.date,
      end: addHours(arg.date, 1),
      resourceId: chargerId,
      editable: true,
    };

    setBookedSlots((prevSlots) => [...prevSlots, newEvent]);
    onSlotSelect({
      start: arg.date,
      end: addHours(arg.date, 1),
      resourceId: chargerId,
      eventId: null,
      canDelete
    });
  }, [title, onSlotSelect, chargers, setBookedSlots, canDelete]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const resources = event.getResources();
    const resourceId = resources.length > 0 ? resources[0]!.id : null;
    if (resourceId) {
      setResourceId(resourceId);
    } else {
      // this should never happen
      console.error('No resource found for event')
      return;
    }

    if (event.id && event.start && event.start > constructNow(new Date())) {
      setCanDelete(true);
    }

    onSlotSelect({
      start: event.start!,
      end: event.end!,
      resourceId: resourceId,
      eventId: event.id,
      canDelete: !!event.id
    });
  }, [onSlotSelect, canDelete]);


  const handleEventChange = useCallback((info: EventChangeArg) => {
    if (!info.event.start ||
      !info.event.end ||
      !resourceId ||
      info.event.start < constructNow(new Date()) ||
      info.event.end < constructNow(new Date())) {
      return info.revert();
    }

    onSlotSelect({
      start: info.event.start,
      end: info.event.end,
      resourceId: resourceId,
      eventId: info.event.id,
      canDelete
    });
  }, [onSlotSelect, resourceId, canDelete]);

  const coloredSlots = useMemo(() => {
    if (bookedSlots.length === 0 || chargers.length === 0) return bookedSlots;

    return bookedSlots.map((slot) => ({
      ...slot,
      color: chargers.find((charger) => charger.id === slot.resourceId)?.colour
    }));
  }, [bookedSlots, chargers]);

  const resources = useMemo(() => {
    return chargers
    .filter((charger) => charger.locationId === closestLocation?.id)
    .map((charger) => ({
      id: charger.id,
      title: charger.name,
      color: charger.colour
    }));
  }, [chargers, closestLocation]);

  if (isLoading) return (<>Loading...</>);

  return (
    <div className={"w-2/3 bg-white"}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
        initialView="resourceTimeGridDay"
        eventMaxStack={chargers.length}
        nowIndicator={true}
        eventOverlap={false}
        slotEventOverlap={false}
        slotDuration={'00:30:00'}
        dateClick={handleDateClick}
        weekends={true}
        schedulerLicenseKey={'CC-Attribution-NonCommercial-NoDerivatives'}
        firstDay={1}
        buttonIcons={{
          prev: 'chevron-left',
          next: 'chevron-right',
          prevYear: 'chevrons-left', // double chevron
          nextYear: 'chevrons-right' // double chevron
        }}
        buttonText={{
          resourceTimeGridDay: "Chargers Schedule",
        }}
        resources={resources}
        headerToolbar={{
          left: 'prev,next resourceTimeGridDay',
          center: 'title',
          right: 'today,dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={coloredSlots}
        eventChange={handleEventChange}
        eventClick={handleEventClick}
      />
    </div>
  );
}