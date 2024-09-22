import type { NextApiRequest, NextApiResponse } from 'next';
import * as repo from "~/server/dal/locations";
import { LocationCoordinatesSchema, type LocationWithDistance } from "~/types/locations";
import { calculateDistance } from "~/server/services/locations";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { latitude, longitude } = LocationCoordinatesSchema.parse(req.body);
    const locations = await repo.getLocations();

    const locationsWithDistances: LocationWithDistance[] = locations.map(location => {
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

