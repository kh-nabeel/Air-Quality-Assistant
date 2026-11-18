import { useState, useCallback, useRef } from 'react';
import type {
  AqiData,
  ChatMessage,
  Language,
  PlanResponse,
  RankedAction,
  Result,
  RiskAssessment,
  UserLocation,
} from '@/domain/types';
import { generatePlan } from '@/services/gemini/generatePlan';
import { sendChatMessage } from '@/services/gemini/chat';
import { generateId } from '@/utils/format';

interface UseGeminiReturn {
  readonly plan: PlanResponse | null;
  readonly planLoading: boolean;
  readonly planError: string | null;
  readonly generateDailyPlan: (context: PlanContext) => Promise<void>;
  readonly chatMessages: readonly ChatMessage[];
  readonly sendMessage: (message: string, context: ChatContext) => Promise<void>;
  readonly chatLoading: boolean;
  readonly abortChat: () => void;
  readonly isFallback: boolean;
}

interface PlanContext {
  readonly location: UserLocation;
  readonly aqi: AqiData;
  readonly risk: RiskAssessment;
  readonly actions: readonly RankedAction[];
  readonly language: Language;
}

type ChatContext = PlanContext;

/**
 * Hook for Gemini-powered plan generation and chat.
 * Handles loading states, errors, streaming, and abort.
 */
export function useGemini(): UseGeminiReturn {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);

  const generateDailyPlan = useCallback(async (context: PlanContext) => {
    setPlanLoading(true);
    setPlanError(null);
    setIsFallback(false);

    const result: Result<PlanResponse> = await generatePlan(context);

    if (result.ok) {
      setPlan(result.value);
      // Check if this is a fallback (no Gemini-style language)
      if (!result.value.impactNarrative.includes('estimate')) {
        setIsFallback(true);
      }
    } else {
      setPlanError(result.error.message);
    }

    setPlanLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (message: string, context: ChatContext) => {
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setChatLoading(true);

      chatAbortRef.current?.abort();
      const controller = new AbortController();
      chatAbortRef.current = controller;

      const assistantId = generateId();
      let fullResponse = '';

      try {
        const stream = sendChatMessage(message, chatMessages, context, controller.signal);

        for await (const chunk of stream) {
          if (controller.signal.aborted) return;
          fullResponse += chunk;

          setChatMessages((prev) => {
            const existing = prev.find((m) => m.id === assistantId);
            if (existing) {
              return prev.map((m) =>
                m.id === assistantId ? { ...m, content: fullResponse } : m,
              );
            }
            return [
              ...prev,
              {
                id: assistantId,
                role: 'assistant' as const,
                content: fullResponse,
                timestamp: Date.now(),
              },
            ];
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant' as const,
              content:
                context.language === 'hi'
                  ? 'क्षमा करें, मैं अभी जवाब देने में असमर्थ हूं। कृपया बाद में पुनः प्रयास करें।'
                  : 'Sorry, I am unable to respond right now. Please try again later.',
              timestamp: Date.now(),
            },
          ]);
        }
      }

      setChatLoading(false);
    },
    [chatMessages],
  );

  const abortChat = useCallback(() => {
    chatAbortRef.current?.abort();
    setChatLoading(false);
  }, []);

  return {
    plan,
    planLoading,
    planError,
    generateDailyPlan,
    chatMessages,
    sendMessage,
    chatLoading,
    abortChat,
    isFallback,
  };
}
