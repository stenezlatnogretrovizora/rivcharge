import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "~/utils/db";
import { getChargers } from "~/dal/chargers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      email,
      startDate,
      startTime,
      endDate,
      endTime,
      locationId,
    } = req.body;

    let __startTime: Date = new Date(`${startDate}T${startTime}`);
    let __endTime: Date = new Date(`${endDate}T${endTime}`);

    try {
      const slots = await db.bookingRequest.findMany({
        where: {
          charger: {
            locationId
          },
          OR: [
            {
              AND: [
                { startTime: { lte: __startTime } },
                { endTime: { gt: __startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: __endTime } },
                { endTime: { gte: __endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: __startTime } },
                { endTime: { lte: __endTime } }
              ]
            }
          ]
        },
      });
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

      const newSlot = await db.bookingRequest.create({
        data: {
          user: {
            connect: {
              email: email
            }
          },
          startTime: __startTime,
          endTime: __endTime,
          charger: {
            connect: {
              id: totalAvailableChargers[0]?.id as string
            }
          }
        },
      });

      return res.status(201).json({ slot: newSlot });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch charging slots' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function calculateOverlapCount (slots: Array<{ startTime: Date, endTime: Date }>, newStartTime: Date, newEndTime: Date)  {
  const timePoints = slots.flatMap(slot => [
    { time: slot.startTime, type: 'start' },
    { time: slot.endTime, type: 'end' }
  ]);
  timePoints.push({ time: newStartTime, type: 'start' });
  timePoints.push({ time: newEndTime, type: 'end' });

  // Sort the time points
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