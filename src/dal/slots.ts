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
          name: true
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