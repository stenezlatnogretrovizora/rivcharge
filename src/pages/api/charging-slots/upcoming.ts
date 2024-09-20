import { NextApiRequest, NextApiResponse } from "next";
import { getUpcomingSlot } from "~/dal/slots";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions)

    try {
      const slot = await getUpcomingSlot({ email: session.user.email });

      if (!slot) {
        return res.status(404).json({ message: 'No upcoming slots found' });
      }

      if (new Date(slot.startTime) < new Date()) {
        return res.status(404).json({ message: 'No upcoming slots found' });
      }

      res.status(200).json(slot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch charging slots' });
    }
  }
}