import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "~/server/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, chargingSlotId, date, location } = req.body;

    try {
      const slot = await db.chargingSlot.findUnique({
        where: { id: chargingSlotId },
        include: { booking: true },
      });

      if (slot && slot.available) {
        // Slot is available, confirm booking
        const booking = await db.bookingRequest.create({
          data: {
            userId,
            chargingSlotId,
            status: 'CONFIRMED',
            date,
            location,
          },
        });

        await db.chargingSlot.update({
          where: { id: chargingSlotId },
          data: { available: false },
        });

        res.status(201).json(booking);
      } else {
        const queueEntry = await db.queue.create({
          data: {
            userId,
            chargingSlotId,
          },
        });

        res.status(200).json({ message: 'Added to queue', queueEntry });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to book charging slot' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
