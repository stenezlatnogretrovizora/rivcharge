import { db } from "~/utils/db";

export function getUpcomingSlot({ email }: { email: string }) {
  return db.bookingRequest.findFirst({
    orderBy: {
      startTime: 'asc'
    },
    where: {
      startTime: {
        gt: new Date()
      },
      user: {
        email: email
      }
    },
    include: {
      user: {
        select: {
          name: true,
        }
      },
      charger: {
        include: {
          location: {
            select: {
              city: true,
              country: true
            }
          }
        }
      }
    }
  });
}

export async function getSlots({ includeUser = true, includeCharger = true, includeLocation = true } = {}) {
  return db.bookingRequest.findMany({
    include: {
      user: includeUser,
      charger: includeCharger
        ? {
          include: {
            location: includeLocation,
          },
        }
        : false,
    },
  });
}

export async function getOverlappingSlots(locationId: string, startTime: Date, endTime: Date) {
  return db.bookingRequest.findMany({
    where: {
      charger: { locationId },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
      ]
    },
  });
}

export async function createBookingRequest(email: string, startTime: Date, endTime: Date, chargerId: string) {
  return db.bookingRequest.create({
    data: {
      user: { connect: { email } },
      startTime,
      endTime,
      charger: { connect: { id: chargerId } }
    },
  });
}
