import { db } from "~/utils/db";
import type { Location } from "~/types/locations";

export async function getLocations(): Promise<Location[]> {
  return db.location.findMany();
}