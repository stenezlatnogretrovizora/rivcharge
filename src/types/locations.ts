import { z } from "zod";

export type Location = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface LocationWithDistance extends Location {
  distance: number;
}

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
}

export const LocationCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type LocationContextType = {
  location: LocationCoordinates;
  chargingLocations: Location[];
  getClosestLocation: () => Location | null;
}