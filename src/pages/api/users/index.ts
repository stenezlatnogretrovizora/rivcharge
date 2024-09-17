import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, {})

      const data = await Promise.resolve();
      return res.status(200).json([{ id: "mica", name: "mecava" }]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
