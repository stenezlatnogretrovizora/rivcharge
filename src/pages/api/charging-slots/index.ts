// pages/api/charging-slots/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "~/server/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date, location, available } = req.query;

    try {
      const slots = await db.chargingSlot.findMany({
        where: {
          ...(date && { date: new Date(date as string) }),
          ...(location && { location: location as string }),
          ...(available && { available: available === 'true' }),
        },
      });

      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch charging slots' });
    }
  } else if (req.method === 'POST') {
    const { date, location } = req.body;

    try {
      const newSlot = await db.chargingSlot.create({
        data: {
          date: new Date(date),
          location,
        },
      });

      res.status(201).json(newSlot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create charging slot' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
