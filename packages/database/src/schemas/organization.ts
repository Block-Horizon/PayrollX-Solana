import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  config: z.record(z.unknown()).nullable(),
  authorizedSigners: z.array(z.string()),
  onboardingCompleted: z.boolean(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Organization = z.infer<typeof organizationSchema>;
