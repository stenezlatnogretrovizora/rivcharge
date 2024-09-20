import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "~/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const slots = await db.bookingRequest.findMany({
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      res.status(200).json(slots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch charging slots' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
