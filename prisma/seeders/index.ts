import { main as locationsAndChargers } from './20240919201559_locations_and_chargers';
import { db } from "~/utils/db";

locationsAndChargers().then(async () => {
  await db.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})