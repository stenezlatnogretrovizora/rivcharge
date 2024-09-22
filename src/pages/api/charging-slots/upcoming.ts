import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { getUpcomingSlot } from "~/server/dal/slots";
import { authOptions } from "../auth/[...nextauth]"
import { z } from "zod";

const SessionSchema = z.object({
  user: z.object({
    email: z.string(),
  })
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const session = SessionSchema.parse(await getServerSession(req, res, authOptions));
    const slot = await getUpcomingSlot({ email: session.user.email });

    if (!slot) {
      return res.status(404).json({ message: 'No upcoming slots found' });
    }

    if (new Date(slot.startTime) < new Date()) {
      return res.status(404).json({ message: 'No upcoming slots found' });
    }

    res.status(200).json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }

    console.error("Error getting charging slots:", error);
    res.status(500).json({ error: "Failed to fetch charging slots" });
  }
}