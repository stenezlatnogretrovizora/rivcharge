/* eslint-disable */

import VoiceAssistant from "~/components/VoiceAssistant";
import { type BookedSlot, type SelectedSlot } from "~/types/slots";
import { useChargingData } from "~/hooks/useChargingData";
import { useState } from "react";

export default function Voice() {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const { bookedSlots, setBookedSlots } = useChargingData();

  const handleSlotSelect = (slot: SelectedSlot | null) => {
    setSelectedSlot(slot);
  };

  const handleDeleteSuccess = (eventId: string | null) => {
    if (eventId) {
      setBookedSlots(prevSlots => prevSlots.filter(slot => slot.id !== eventId));
    }
    setSelectedSlot(null);
  };

  const handleBookingSuccess = (updatedSlot: BookedSlot) => {
    setBookedSlots(prevSlots => [...prevSlots, updatedSlot]);
    setSelectedSlot(null);
  };

  const handleVoiceBookingRequest = (bookingDetails: any) => {
    // Create a new SelectedSlot object based on the voice booking request
    const newSelectedSlot: SelectedSlot = {
      start: new Date(`${bookingDetails.startDate}T${bookingDetails.startTime}`),
      end: new Date(`${bookingDetails.endDate}T${bookingDetails.endTime}`),
      resourceId: '', // You may need to determine this based on availability
      eventId: null,
      canDelete: false,
    };
    setSelectedSlot(newSelectedSlot);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1">
        <VoiceAssistant onBookingRequest={handleVoiceBookingRequest}/>
      </div>
    </>
  );
}


