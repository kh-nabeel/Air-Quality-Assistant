import type { AqiData, ChatMessage, Language, RankedAction, RiskAssessment, UserLocation } from '@/domain/types';
import { GEMINI_TEMPERATURE, MAX_CHAT_HISTORY, MAX_OUTPUT_TOKENS } from '@/config/constants';
import { sanitizeForPrompt } from '@/utils/sanitize';
import { getGeminiModel } from './client';
import { buildContextBlock, SYSTEM_INSTRUCTION_CHAT } from './prompts';

interface ChatContext {
  readonly location: UserLocation;
  readonly aqi: AqiData;
  readonly risk: RiskAssessment;
  readonly actions: readonly RankedAction[];
  readonly language: Language;
}

/**
 * Send a message in the Saans chat and stream the response.
 * Returns an async generator that yields text chunks.
 *
 * @param userMessage - The user's message (will be sanitized)
 * @param history - Previous chat messages (trimmed to MAX_CHAT_HISTORY)
 * @param context - Current AQI and profile context for grounding
 * @param signal - AbortSignal for cancellation
 */
export async function* sendChatMessage(
  userMessage: string,
  history: readonly ChatMessage[],
  context: ChatContext,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const sanitized = sanitizeForPrompt(userMessage);
  if (!sanitized) return;

  const contextBlock = buildContextBlock(context);
  const trimmedHistory = history.slice(-MAX_CHAT_HISTORY);

  // Build conversation history for Gemini
  const contents = [
    ...trimmedHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [
        {
          type: 'text' as const,
          text:
            msg.role === 'user'
              ? `<user_data>${msg.content}</user_data>`
              : msg.content,
        },
      ],
    })),
    {
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: `${contextBlock}\n\n<user_data>${sanitized}</user_data>` }],
    },
  ];

  try {
    const model = getGeminiModel();
    const result = await model.generateContentStream({
      contents,
      systemInstruction: { role: 'system', parts: [{ type: 'text' as const, text: SYSTEM_INSTRUCTION_CHAT }] },
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });

    for await (const chunk of result.stream) {
      if (signal?.aborted) return;
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    throw error;
  }
}

/** Get suggested questions based on current context */
export function getSuggestedQuestions(language: Language): readonly string[] {
  if (language === 'hi') {
    return [
      'क्या आज बाहर व्यायाम करना सुरक्षित है?',
      'मैं अपने बच्चों को कैसे बचा सकता/सकती हूं?',
      'घर की हवा साफ करने का सबसे सस्ता तरीका क्या है?',
      'मास्क कब पहनना चाहिए?',
      'हमारा समुदाय प्रदूषण कम करने के लिए क्या कर सकता है?',
    ];
  }

  return [
    'Is it safe to exercise outside today?',
    'How can I protect my children from smog?',
    'What is the cheapest way to improve indoor air?',
    'When should I wear a mask outside?',
    'What can our community do to reduce pollution?',
  ];
}
