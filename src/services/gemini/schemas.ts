import { z } from 'zod';

/**
 * Zod schema for the structured output returned by Gemini plan generation.
 *
 * Validates that the response contains a non-empty summary, an array of
 * action/rationale pairs, an impact narrative, and a language code.
 */
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

/** Inferred TypeScript type for a validated Gemini plan response. */
export type PlanResponseSchema = z.infer<typeof planResponseSchema>;
