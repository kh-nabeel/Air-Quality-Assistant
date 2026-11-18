import { z } from 'zod';

/** Zod schema for Gemini plan generation output */
export const planResponseSchema = z.object({
  summary: z.string().min(1),
  actions: z.array(
    z.object({
      actionId: z.string(),
      rationale: z.string(),
    }),
  ),
  impactNarrative: z.string(),
  language: z.string(),
});

export type PlanResponseSchema = z.infer<typeof planResponseSchema>;
