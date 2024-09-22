import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/utils/db';
import { getSession } from "next-auth/react";
import { Session, User } from "next-auth";
import { getSlots } from "~/server/dal/slots";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req }) as Session & { user: User } | null;

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const bookings = await getSlots();
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(500).json({ error: 'Failed to fetch slots' });
    }
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
