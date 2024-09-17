import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "~/server/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const slot = await db.chargingSlot.findUnique({
        where: { id: id as string },
      });

      if (slot) {
        res.status(200).json(slot);
      } else {
        res.status(404).json({ error: 'Charging slot not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch charging slot' });
    }
  } else if (req.method === 'PUT') {
    const { date, location, available } = req.body;

    try {
      const updatedSlot = await db.chargingSlot.update({
        where: { id: id as string },
        data: {
          ...(date && { date: new Date(date) }),
          ...(location && { location }),
          ...(available !== undefined && { available }),
        },
      });

      res.status(200).json(updatedSlot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update charging slot' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
