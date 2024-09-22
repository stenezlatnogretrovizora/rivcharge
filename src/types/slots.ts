import { z } from "zod";

export type BookedSlot = {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  editable: boolean;
};

export type SlotExtended = {
  id: string;
  userId: string;
  chargerId: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  charger: {
    id: string;
    name: string;
    colour: string;
    locationId: string;
    location: {
      city: string;
      country: string;
    };
  };
};

export const BookingDetailsSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  locationId: z.string(),
  resourceId: z.string(),
  eventId: z.string().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type BookingDetails = z.infer<typeof BookingDetailsSchema>;

export const UpdateBookingSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
});

export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;

export type OnSlotSelect = {
  onSlotSelect: (slot: { start: Date; end: Date; resourceId: string, eventId: string | null, canDelete: boolean }) => void;
}

export const SelectedSlotSchema = z.object({
  start: z.date(),
  end: z.date(),
  resourceId: z.string(),
  eventId: z.string().nullable(),
  canDelete: z.boolean(),
});

export type SelectedSlot = z.infer<typeof SelectedSlotSchema>;


export const DeleteBookingSchema = z.object({
  eventId: z.string(),
});