import { endOfHour, addHours } from "date-fns";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useEffect, useState } from "react";

const now = new Date()
const start = endOfHour(now)
const end = addHours(start, 2)

const RivCalendar = ({ onSlotSelect }: any) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const fetchBookedSlots = async () => {
    const response = await fetch('/api/charging-slots?available=false');
    const data = await response.json();
    setBookedSlots(data);
  };

  useEffect(() => {
    fetchBookedSlots();
  }, []);

  const handleDateClick = (arg: any) => {
    onSlotSelect(arg.date);
  };

  const handleEventDragStart = (info) => {
    // Extract the new date and time
    const newStart = info.event.start;
    const newEnd = info.event.end;

    // Update your form with the new time slot information
    // updateFormWithNewTimeSlot(newStart, newEnd);

    console.log("heyo1")
  }

  const handleEventDragStop = (info) => {
    // Extract the new date and time
    const newStart = info.event.start;
    const newEnd = info.event.end;

    // Update your form with the new time slot information
    // updateFormWithNewTimeSlot(newStart, newEnd);

    console.log("heyo2")
  }

    return (
    <div className={"w-2/3 bg-white"}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        eventMaxStack={3}
        nowIndicator={true}
        slotDuration={'00:30:00'}
        dateClick={handleDateClick}
        weekends={false}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={[...bookedSlots]}
      />
    </div>
  );
}


export default RivCalendar;