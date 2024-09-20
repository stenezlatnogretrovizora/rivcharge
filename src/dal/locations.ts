import { db } from "~/utils/db";

interface Location {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export async function getLocations(): Promise<Location[]> {
  return db.location.findMany();
}