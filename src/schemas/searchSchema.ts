import { z } from 'zod';

export const searchSchema = z.object({
    date: z.string().min(1, { message: "Date is required" }),
    airline: z.string().min(1, { message: "Airline is required" }),
    origin: z.string().min(1, { message: "Origin is required" }),
    destination: z.string().min(1, { message: "Destination is required" }),
});

export type SearchSchema = z.infer<typeof searchSchema>;
