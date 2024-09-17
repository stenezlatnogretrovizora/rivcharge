import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../server/db/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await db.user.findFirst({
        where: {
          id: req.body.id,
        },
      })

      return res.status(200).json([{ id: "mica", firstName: "Mica", lastName: "Mecava", nextCharge: new Date().toUTCString() }]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const data = await db.user.update({
        where: {
          id: req.body.id,
        },
        data: {
          name: req.body.name,
        },
      })

      return res.status(200).json({ data: data });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
