import type { NextApiRequest, NextApiResponse } from 'next';
import { createBookingRequest, getOverlappingSlots, getSlots } from "~/server/dal/slots";
import { db } from "~/utils/db";
import { BookingDetailsSchema, DeleteBookingSchema } from "~/types/slots";
import { getChargers } from "~/server/dal/chargers";
import { z } from "zod";
import {
  calculateOverlapCount,
  getUserBookedHoursForDay,
  MAX_HOURS_PER_DAY,
  updateBookingRequest
} from "~/server/services/charging-slots";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies['next-auth.session-token'];
  const session = await db.session.findFirst({ where: { sessionToken } });
  const user = await db.user.findFirst({ where: { id: session?.userId } });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const slots = await getSlots();
      res.status(200).json(slots);
    } catch (error) {
      console.error('Error getting charging slots:', error);
      res.status(500).json({ error: 'Failed to fetch charging slots' });
    }
  } else if (req.method === 'POST') {
    try {
      const bookingRequest = BookingDetailsSchema.parse(req.body);
      const {
        email,
        startDate,
        startTime,
        endDate,
        endTime,
        locationId,
        resourceId: chargerId,
      } = bookingRequest;

      const __startTime: Date = new Date(`${startDate}T${startTime}`);
      const __endTime: Date = new Date(`${endDate}T${endTime}`);

      if (__endTime <= __startTime) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      const slots = await getOverlappingSlots(locationId, __startTime, __endTime);
      const userBookedHours = await getUserBookedHoursForDay(user.email, __startTime);
      const newBookingDuration = (__endTime.getTime() - __startTime.getTime()) / (1000 * 60 * 60);
      const userAttemptedHours = userBookedHours + newBookingDuration;

      if (userAttemptedHours > MAX_HOURS_PER_DAY) {
        return res.status(400).json({ error: `Exceeded maximum book time by ${userAttemptedHours - MAX_HOURS_PER_DAY} hours` });
      }

      const totalChargers = await getChargers({ locationId });

      const overlapCount = calculateOverlapCount(
        slots.map(slot => ({ startTime: slot.startTime, endTime: slot.endTime })),
        __startTime,
        __endTime
      );

      if (overlapCount >= totalChargers.length) {
        return res.status(400).json({ error: 'No available chargers' });
      }

      const totalAvailableChargers = totalChargers.filter(charger => {
        return !slots.some(slot => {
          return slot.chargerId === charger.id;
        });
      });

      if (totalAvailableChargers.length === 0 || !totalAvailableChargers[0]?.id) {
        return res.status(400).json({ error: 'No available chargers' });
      }

      const targetChargerId = totalAvailableChargers.find(charger => charger.id === chargerId)?.id ?? totalAvailableChargers[0].id;

      const newSlot = await createBookingRequest(email, __startTime, __endTime, targetChargerId);

      return res.status(201).json({ slot: newSlot });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Failed to process booking request' });
    }

  } else if (req.method === 'PUT') {
    try {
      const updateRequest = BookingDetailsSchema.parse(req.body);
      const {
        eventId,
        startDate,
        startTime,
        endDate,
        endTime,
      } = updateRequest;

      const __startTime: Date = new Date(`${startDate}T${startTime}`);
      const __endTime: Date = new Date(`${endDate}T${endTime}`);

      if (__endTime <= __startTime) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // Fetch the existing booking
      const existingBooking = await db.bookingRequest.findUniqueOrThrow({
        where: { id: eventId, user: { id: user.id } },
        include: { user: true, charger: true },
      });

      if (!existingBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check for overlapping slots
      const slots = await getOverlappingSlots(existingBooking.charger.locationId, __startTime, __endTime);
      const overlappingSlots = slots.filter(slot => slot.id !== eventId);

      const totalChargers = await getChargers({ locationId: existingBooking.charger.locationId });

      const overlapCount = calculateOverlapCount(
        overlappingSlots.map(slot => ({ startTime: slot.startTime, endTime: slot.endTime })),
        __startTime,
        __endTime
      );

      if (overlapCount >= totalChargers.length) {
        return res.status(400).json({ error: 'No available chargers for the updated time' });
      }

      // Check user's total booked hours for the day
      const userBookedHours = await getUserBookedHoursForDay(existingBooking.user.email, __startTime);
      const newBookingDuration = (__endTime.getTime() - __startTime.getTime()) / (1000 * 60 * 60);
      const existingBookingDuration = (existingBooking.endTime.getTime() - existingBooking.startTime.getTime()) / (1000 * 60 * 60);
      const userAttemptedHours = userBookedHours - existingBookingDuration + newBookingDuration;

      if (userAttemptedHours > MAX_HOURS_PER_DAY) {
        return res.status(400).json({ error: `Exceeded maximum book time by ${userAttemptedHours - MAX_HOURS_PER_DAY} hours` });
      }

      // Update the booking
      const updatedBooking = await updateBookingRequest(eventId, __startTime, __endTime);

      return res.status(200).json({ slot: updatedBooking });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Failed to process booking update request' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { eventId } = DeleteBookingSchema.parse(req.body);

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      await db.bookingRequest.delete({ where: { id: eventId, userId: user.id } });

      return res.status(200).json({ message: 'Slot deleted successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
