import { db } from '~/utils/db';
import { addHours, startOfToday } from "date-fns";

let userNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Martinez', 'Jack Anderson', 'Karen White', 'Liam Harris', 'Mia Clark', 'Noah Robinson', 'Olivia Scott', 'Peter Young', 'Quinn Adams', 'Rachel Turner']

export async function main() {
  let users = userNames.map((name, index) => {
    let image = 'https://randomuser.me/api/portraits/' + ((index % 2 === 0) ? "women" : "men") + "/" + index + ".jpg";

    return {
      id: (index + 1).toString(),
      name: name,
      email: name.replace(' ', '.').toLowerCase() + '@rivian.com',
      image
    }
  })

  users.unshift({ id: 'uros', name: 'Uros Radovanovic', email: 'radovanovic.uros92@gmail.com', image: "" })

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
        city: 'San Francisco',
        country: 'United States',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      {
        city: 'Los Angeles',
        country: 'United States',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      {
        city: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
      },
      {
        city: "Amsterdam",
        country: "Netherlands",
        latitude: 52.3676,
        longitude: 4.9041
      },
      {
        city: 'Berlin',
        country: 'Germany',
        latitude: 52.5200,
        longitude: 13.4050,
      },
      {
        city: 'Tokyo',
        country: 'Japan',
        latitude: 35.6895,
        longitude: 139.6917,
      },
      {
        city: 'Sydney',
        country: 'Australia',
        latitude: -33.8688,
        longitude: 151.2093,
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
      colour: colours[i] as string,
      locationId: location.id,
    }));

    await db.charger.createMany({
      data: chargers,
    });
  }

  const slots = [
    { title: 'Alice Johnson', start: addHours(startOfToday(), 9), end: addHours(startOfToday(), 12), editable: false },
    { title: 'Bob Smith', start: addHours(startOfToday(), 13), end: addHours(startOfToday(), 16), editable: false },
    { title: 'Carol Davis', start: addHours(startOfToday(), 17), end: addHours(startOfToday(), 20), editable: false },
    { title: 'David Wilson', start: addHours(startOfToday(), 8), end: addHours(startOfToday(), 11), editable: false },
    { title: 'Emma Brown', start: addHours(startOfToday(), 12), end: addHours(startOfToday(), 15), editable: false },
    { title: 'Frank Miller', start: addHours(startOfToday(), 16), end: addHours(startOfToday(), 19), editable: false },
    { title: 'Grace Lee', start: addHours(startOfToday(), -14), end: addHours(startOfToday(), -11), editable: false },
    { title: 'Henry Taylor', start: addHours(startOfToday(), -10), end: addHours(startOfToday(), -7), editable: false },
    { title: 'Ivy Martinez', start: addHours(startOfToday(), 34), end: addHours(startOfToday(), 37), editable: false },
    { title: 'Jack Anderson', start: addHours(startOfToday(), 38), end: addHours(startOfToday(), 41), editable: false },
    { title: 'Karen White', start: addHours(startOfToday(), 42), end: addHours(startOfToday(), 45), editable: false },
    { title: 'Liam Harris', start: addHours(startOfToday(), 46), end: addHours(startOfToday(), 49), editable: false },
    { title: 'Mia Clark', start: addHours(startOfToday(), -38), end: addHours(startOfToday(), -35), editable: false },
    {
      title: 'Noah Robinson',
      start: addHours(startOfToday(), -34),
      end: addHours(startOfToday(), -31),
      editable: false
    },
    { title: 'Olivia Scott', start: addHours(startOfToday(), 58), end: addHours(startOfToday(), 61), editable: false },
    { title: 'Peter Young', start: addHours(startOfToday(), 62), end: addHours(startOfToday(), 65), editable: false },
    { title: 'Quinn Adams', start: addHours(startOfToday(), 66), end: addHours(startOfToday(), 69), editable: false },
    { title: 'Rachel Turner', start: addHours(startOfToday(), 70), end: addHours(startOfToday(), 73), editable: false },
    {
      title: "Uros Radovanovic",
      start: addHours(startOfToday(), 74),
      end: addHours(startOfToday(), 77),
      editable: false
    }
  ]

  // get one charger id
  const charger = await db.charger.findMany({ where: { location: allLocations[0] } });
  for (const slot of slots) {
    await db.bookingRequest.create({
      data: {
        status: 'CONFIRMED',
        userId: users[Math.floor(Math.random() * users.length)]?.id as string,
        // random charger between the chargers
        chargerId: charger[Math.floor(Math.random() * charger.length)]?.id as string,
        startTime: slot.start,
        endTime: slot.end,
      },
    })
  }

  console.log('Seed data inserted successfully');
}
