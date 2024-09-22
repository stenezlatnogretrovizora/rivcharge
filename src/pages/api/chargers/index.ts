import { type NextApiRequest, type NextApiResponse } from "next";
import { getChargers } from "~/server/dal/chargers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let { locationId } = req.query;

      if (Array.isArray(locationId)) {
        locationId = locationId[0];
      }

      const chargers = await getChargers({ locationId });
      res.status(200).json(chargers);
    } catch (error) {
      console.error('Error getting charging locations:', error);
    }

  } else if (req.method === 'POST') {
    // Handle POST request
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}