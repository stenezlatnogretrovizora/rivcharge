import { db } from "~/utils/db";

export const MAX_HOURS_PER_DAY = 4;

export function calculateOverlapCount(slots: Array<{
  startTime: Date,
  endTime: Date
}>, newStartTime: Date, newEndTime: Date) {
  const timePoints = slots.flatMap(slot => [
    { time: slot.startTime, type: 'start' },
    { time: slot.endTime, type: 'end' }
  ]);
  timePoints.push({ time: newStartTime, type: 'start' });
  timePoints.push({ time: newEndTime, type: 'end' });

  timePoints.sort((a, b) => a.time.getTime() - b.time.getTime());

  let currentOverlap = 0;
  let maxOverlap = 0;
  let newSlotActive = false;

  for (const point of timePoints) {
    if (point.type === 'start') {
      currentOverlap++;
      if (point.time.getTime() === newStartTime.getTime()) newSlotActive = true;
    } else {
      currentOverlap--;
      if (point.time.getTime() === newEndTime.getTime()) newSlotActive = false;
    }

    if (newSlotActive && currentOverlap > maxOverlap) {
      maxOverlap = currentOverlap;
    }
  }

  // Subtract 1 to not count the new slot itself
  return Math.max(0, maxOverlap - 1);
}

export async function getUserBookedHoursForDay(email: string, date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const userBookings = await db.bookingRequest.findMany({
    where: {
      user: { email },
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay }
    },
    select: { startTime: true, endTime: true }
  });

  const totalMinutes = userBookings.reduce((total, booking) => {
    const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60);
    return total + duration;
  }, 0);

  return totalMinutes / 60;
}

export async function updateBookingRequest(id: string, startTime: Date, endTime: Date) {
  return db.bookingRequest.update({
    where: { id },
    data: {
      startTime,
      endTime,
    },
  });
}