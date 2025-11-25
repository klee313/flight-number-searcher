import { z } from 'zod';

export const createSearchSchema = (t: (key: string) => string) => z.object({
    date: z.string().min(1, { message: t('errDateRequired') }),
    airline: z.string().min(1, { message: t('errAirlineRequired') }),
    origin: z.string().optional(),
    destination: z.string().optional(),
}).refine(data => data.origin || data.destination, {
    message: t('errOriginOrDestRequired'),
    path: ["origin"],
});

export type SearchSchema = z.infer<ReturnType<typeof createSearchSchema>>;
