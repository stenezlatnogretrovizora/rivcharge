import { db } from '~/utils/db';
import { addHours, startOfToday } from "date-fns";

const userNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Martinez', 'Jack Anderson', 'Karen White', 'Liam Harris', 'Mia Clark', 'Noah Robinson', 'Olivia Scott', 'Peter Young', 'Quinn Adams', 'Rachel Turner']

export async function main() {
  const users = userNames.map((name, index) => {
    const image = 'https://randomuser.me/api/portraits/' + ((index % 2 === 0) ? "women" : "men") + "/" + index + ".jpg";

    return {
      id: (index + 1).toString(),
      name: name,
      email: name.replace(' ', '.').toLowerCase() + '@rivian.com',
      image
    }
  })

  await db.user.createMany({
    data: users
  })

  await db.location.createMany({
    data: [
      {
        city: 'Belgrade',
        country: 'Serbia',
        latitude: 44.7866,
        longitude: 20.4489,
      },
      {
        city: 'Palo Alto',
        country: 'United States',
        latitude: 37.4419,
        longitude: -122.1430,
      },
      {
        city: 'Irvine',
        country: 'United States',
        latitude: 33.6846,
        longitude: -117.8265,
      },
      {
        city: 'Carson',
        country: 'United States',
        latitude: 33.8317,
        longitude: -118.2820,
      },
      {
        city: 'Wittmann',
        country: 'United States',
        latitude: 33.7789,
        longitude: -112.5282,
      },
      {
        city: 'Normal',
        country: 'United States',
        latitude: 40.5142,
        longitude: -88.9906,
      },
      {
        city: 'Plymouth',
        country: 'United States',
        latitude: 42.3714,
        longitude: -83.4702,
      },
      {
        city: 'Vancouver',
        country: 'Canada',
        latitude: 49.2827,
        longitude: -123.1207,
      },
      {
        city: 'Woking',
        country: 'United Kingdom',
        latitude: 51.3190,
        longitude: -0.5576,
      },
      {
        city: 'Amsterdam',
        country: 'Netherlands',
        latitude: 52.3676,
        longitude: 4.9041,
      }
    ],
  });

  const allLocations = await db.location.findMany();

  // Nice shades of blue
  const colours = ["#89CFF0", "#7393B3", "#5F9EA0", "#6495ED", "#0096FF", "#0047AB", "#6495ED"];

  // Create chargers for each location
  for (const location of allLocations) {
    const numChargers = Math.floor(Math.random() * 5) + 3; // Random number of chargers between 3 and 7
    const chargers = Array.from({ length: numChargers }, (_, i) => ({
      name: `${location.city} Charger ${i + 1}`,
      colour: colours[i]!,
      locationId: location.id,
    }));

    await db.charger.createMany({
      data: chargers,
    });
  }

  const slots = [
    { start: addHours(startOfToday(), 9), end: addHours(startOfToday(), 12) },
    { start: addHours(startOfToday(), 13), end: addHours(startOfToday(), 16) },
    { start: addHours(startOfToday(), 17), end: addHours(startOfToday(), 20) },
    { start: addHours(startOfToday(), 8), end: addHours(startOfToday(), 11) },
    { start: addHours(startOfToday(), 12), end: addHours(startOfToday(), 15) },
    { start: addHours(startOfToday(), 16), end: addHours(startOfToday(), 19) },
    { start: addHours(startOfToday(), -14), end: addHours(startOfToday(), -11) },
    { start: addHours(startOfToday(), -10), end: addHours(startOfToday(), -7) },
    { start: addHours(startOfToday(), 34), end: addHours(startOfToday(), 37) },
    { start: addHours(startOfToday(), 38), end: addHours(startOfToday(), 41) },
    { start: addHours(startOfToday(), 42), end: addHours(startOfToday(), 45) },
    { start: addHours(startOfToday(), 46), end: addHours(startOfToday(), 49) },
    { start: addHours(startOfToday(), -38), end: addHours(startOfToday(), -35) },
    { start: addHours(startOfToday(), -34), end: addHours(startOfToday(), -31) },
    { start: addHours(startOfToday(), 58), end: addHours(startOfToday(), 61) },
    { start: addHours(startOfToday(), 62), end: addHours(startOfToday(), 65) },
    { start: addHours(startOfToday(), 66), end: addHours(startOfToday(), 69) },
    { start: addHours(startOfToday(), 70), end: addHours(startOfToday(), 73) },
    { start: addHours(startOfToday(), 74), end: addHours(startOfToday(), 77) }
  ]

  const dbUserIds = await db.user.findMany({ select: { id: true } });
  const userIds = dbUserIds.map(user => user.id);

  const dbChargerIds = await db.charger.findMany({ select: { id: true }, where: { location: { city: "Belgrade" } } });
  const chargerIds = dbChargerIds.map(charger => charger.id);

  for (const slot of slots) {
    await db.bookingRequest.create({
      data: {
        status: 'CONFIRMED',
        userId: userIds[Math.floor(Math.random() * userIds.length)]!,
        chargerId: chargerIds[Math.floor(Math.random() * chargerIds.length)]!,
        startTime: slot.start,
        endTime: slot.end,
      },
    })
  }

  console.log('Seed data inserted successfully');
}
