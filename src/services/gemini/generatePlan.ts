import type {
  AqiData,
  Language,
  PlanResponse,
  RankedAction,
  Result,
  RiskAssessment,
  UserLocation,
} from '@/domain/types';
import { GEMINI_TEMPERATURE, GEMINI_TIMEOUT_MS, MAX_OUTPUT_TOKENS } from '@/config/constants';
import { ok, err } from '@/utils/result';
import { getGeminiModel } from './client';
import { buildContextBlock, SYSTEM_INSTRUCTION_PLAN } from './prompts';
import { planResponseSchema } from './schemas';

interface GeneratePlanInput {
  readonly location: UserLocation;
  readonly aqi: AqiData;
  readonly risk: RiskAssessment;
  readonly actions: readonly RankedAction[];
  readonly language: Language;
}

/**
 * Generate a personalized daily plan using Gemini.
 * Retries once on failure, then falls back to a deterministic plan.
 *
 * @param context - Current location, AQI, risk assessment, and ranked actions
 * @returns Personalized plan response or deterministic fallback
 */
export async function generatePlan(context: GeneratePlanInput): Promise<Result<PlanResponse>> {
  const contextBlock = buildContextBlock(context);
  const languageInstruction =
    context.language === 'hi'
      ? 'Respond entirely in Hindi (Devanagari script).'
      : 'Respond in English.';

  const prompt = `${contextBlock}

Based on the air quality data and household risk assessment above, generate a personalized daily plan.

${languageInstruction}

Respond ONLY with valid JSON matching this structure:
{
  "summary": "A warm, personalized 2-3 sentence summary of today's air quality situation for this household",
  "actions": [
    { "actionId": "action-id-from-context", "rationale": "Why this action matters for this specific household" }
  ],
  "impactNarrative": "A paragraph explaining the combined impact of these actions, using the ranges from context. Label all numbers as estimates.",
  "language": "${context.language}"
}`;

  // Attempt with primary model
  const result = await attemptGeneration(prompt, false);
  if (result.ok) return result;

  // Retry with fallback model
  const fallbackResult = await attemptGeneration(prompt, true);
  if (fallbackResult.ok) return fallbackResult;

  // Deterministic fallback
  return ok(buildFallbackPlan(context));
}

async function attemptGeneration(
  prompt: string,
  useFallback: boolean,
): Promise<Result<PlanResponse>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const model = getGeminiModel(useFallback);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ type: 'text' as const, text: prompt }] }],
      systemInstruction: {
        role: 'system',
        parts: [{ type: 'text' as const, text: SYSTEM_INSTRUCTION_PLAN }],
      },
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
      },
    });

    clearTimeout(timeout);

    const text = result.response.text();
    const json: unknown = JSON.parse(text);
    const parsed = planResponseSchema.safeParse(json);

    if (!parsed.success) {
      return err(new Error(`Invalid plan response: ${parsed.error.message}`));
    }

    return ok(parsed.data);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('Plan generation failed'));
  }
}

function buildFallbackPlan(context: GeneratePlanInput): PlanResponse {
  const { aqi, actions, language } = context;
  const isHindi = language === 'hi';

  const topActions = actions.slice(0, 5);

  return {
    summary: isHindi
      ? `आज AQI ${aqi.usAqi} है। कृपया सावधानी बरतें और नीचे दिए गए सुझावों का पालन करें।`
      : `Today's AQI is ${aqi.usAqi}. Please take precautions and follow the recommendations below.`,
    actions: topActions.map((a) => ({
      actionId: a.action.id,
      rationale: a.action.description[language],
    })),
    impactNarrative: isHindi
      ? 'ये सुझाव प्रकाशित शोध के आधार पर आपके प्रदूषण संपर्क को कम करने में मदद कर सकते हैं। सभी अनुमान अनुमानित सीमाओं पर आधारित हैं।'
      : 'These recommendations can help reduce your pollution exposure based on published guidance. All estimates are approximate ranges and individual results may vary.',
    language,
  };
}
