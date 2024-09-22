/* eslint-disable */
import { useCallback, useEffect, useState } from 'react';
import { type BookedSlot, type SlotExtended } from "~/types/slots";
import { type Charger } from "~/types/chargers";
import { useSession } from "next-auth/react";

export function useChargingData() {
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const email = useSession().data?.user?.email;

  const fetchBookedSlots = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch('/api/charging-slots');
    const data = await response.json();

    const slots = data.map((slot: SlotExtended) => ({
      start: slot.startTime,
      end: slot.endTime,
      id: slot.id,
      resourceId: slot.chargerId,
      title: slot.user.name,
      editable: slot.user.email === email,
    }));

    setBookedSlots(slots);
    setIsLoading(false);
  }, []);

  const fetchChargers = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch('/api/chargers');
    const data = await response.json();
    setChargers(data);
    setIsLoading(false);
  }, []);


  useEffect(() => {
    fetchBookedSlots();
    fetchChargers();
  }, [fetchBookedSlots, fetchChargers]);

  return { bookedSlots, setBookedSlots, chargers, fetchBookedSlots, fetchChargers, isLoading };
}