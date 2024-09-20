import { NextApiRequest, NextApiResponse } from 'next';
import * as repo from "~/dal/locations";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const locations = await repo.getLocations();

    const locationsWithDistances = locations.map(location => {
      return {
        ...location,
        distance: calculateDistance(latitude, longitude, location.latitude, location.longitude),
      };
    });

    // it's okay to iterate through the list twice since the list is tiny
    locationsWithDistances.sort((a, b) => a.distance - b.distance);

    res.status(200).json(locationsWithDistances);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}