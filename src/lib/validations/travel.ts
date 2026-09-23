import { z } from "zod";

export const flightSearchSchema = z.object({
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(9).optional(),
  cabinClass: z.string().trim().max(40).optional(),
  tripType: z.enum(["roundtrip", "oneway", "multicity"]).default("roundtrip"),
  baggage: z.string().trim().max(80).optional(),
  currency: z.string().trim().length(3).optional(),
});

export const hotelSearchSchema = z.object({
  destination: z.string().trim().min(1).max(160),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.coerce.number().int().min(1).max(16).default(2),
  rooms: z.coerce.number().int().min(1).max(8).default(1),
  preferences: z.string().trim().max(240).optional(),
  currency: z.string().trim().length(3).optional(),
});

export const packageSearchSchema = z.object({
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(160),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.coerce.number().int().min(1).max(9).default(2),
  rooms: z.coerce.number().int().min(1).max(8).default(1),
  cabinClass: z.string().trim().max(40).optional(),
  hotelPreferences: z.string().trim().max(240).optional(),
  currency: z.string().trim().length(3).optional(),
});

export const carSearchSchema = z.object({
  pickupLocation: z.string().trim().min(1).max(160),
  dropoffLocation: z.string().trim().max(160).optional().nullable(),
  pickupAt: z.string().min(1),
  dropoffAt: z.string().min(1),
  driverAge: z.coerce.number().int().min(18).max(99).optional(),
  currency: z.string().trim().length(3).optional(),
});

export const compareHotelsSchema = z.object({
  items: z
    .array(
      z.object({
        externalId: z.string().min(1),
        snapshot: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .min(2)
    .max(6),
});

export const tripCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  destination: z.string().trim().max(160).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const tripItemSchema = z.object({
  type: z.enum(["FLIGHT", "HOTEL", "CAR", "ACTIVITY", "CUSTOM"]),
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).optional(),
  draftPayload: z.record(z.string(), z.unknown()).optional(),
});

export const bookingStartSchema = z.object({
  kind: z.enum(["flight", "hotel", "car"]),
  externalId: z.string().min(1),
  confirmedByUser: z.literal(true),
  expectedAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

export const aiChatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(20)
    .optional(),
});

export const airportQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
});
