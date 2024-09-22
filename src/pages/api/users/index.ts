import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import type { Session } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const session: Session | null = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = session.user;
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
