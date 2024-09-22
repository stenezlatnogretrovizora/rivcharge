import { db } from "~/utils/db";

interface Charger {
  id: string;
  name: string;
  colour: string;
  locationId: string;
}

export function getChargers({
  locationId,
}: {
  locationId?: string;
}): Promise<Charger[]> {
  return db.charger.findMany({
    where: {
      locationId,
    },
  });
}
