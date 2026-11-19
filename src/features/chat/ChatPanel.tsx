import { useState, useRef, useEffect, useCallback } from 'react';
import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { computeHouseholdRisk } from '@/domain/computeHouseholdRisk';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { useGemini } from '@/hooks/useGemini';
import { sanitizeUserInput } from '@/utils/sanitize';
import { MAX_USER_INPUT_LENGTH } from '@/config/constants';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Banner } from '@/components/Banner';
import { Sparkles, Send, Bot, User, Square } from 'lucide-react';

/** Section number displayed in the header. */
const SECTION_NUMBER = '08';

/** Minimum height for action buttons (accessibility). */
const MIN_TOUCH_TARGET = '44px';

/** Minimum height for the text input and send button. */
const INPUT_MIN_HEIGHT = '48px';

/** Maximum chat bubble width as percentage of the container. */
const MAX_BUBBLE_WIDTH = '85%';

/** Maximum width for the suggested-questions column. */
const MAX_SUGGESTIONS_WIDTH = '28rem';

interface ChatPanelProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

/** Suggested questions in English. */
const SUGGESTED_QUESTIONS_EN: readonly string[] = [
  'Is it safe to go for a walk right now?',
  'What mask should I use on bad AQI days?',
  'How can I protect my child from smog?',
  'When should I ventilate my home today?',
  'Are indoor plants effective for air quality?',
];

/** Suggested questions in Hindi. */
const SUGGESTED_QUESTIONS_HI: readonly string[] = [
  'क्या अभी टहलने जाना सुरक्षित है?',
  'खराब AQI में कौन सा मास्क पहनें?',
  'बच्चों को स्मॉग से कैसे बचाएं?',
  'आज घर की हवा कब बदलें?',
  'क्या इनडोर पौधे हवा के लिए कारगर हैं?',
];

/** Component-scoped style definitions. */
const styles = {
  disclaimerBanner: {
    marginBottom: 'var(--space-4)',
  } satisfies React.CSSProperties,

  chatCard: {
    minHeight: '26rem',
    maxHeight: '34rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-md)',
    background: '#FAF9F5',
  } satisfies React.CSSProperties,

  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-6) var(--space-2)',
  } satisfies React.CSSProperties,

  botIconCircle: {
    display: 'inline-flex',
    padding: '12px',
    borderRadius: '16px',
    background: '#FEF08A',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  suggestedTitle: {
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    margin: 0,
  } satisfies React.CSSProperties,

  suggestedColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    width: '100%',
    maxWidth: MAX_SUGGESTIONS_WIDTH,
  } satisfies React.CSSProperties,

  suggestedButton: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--color-bg-dark)',
    background: '#ffffff',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-bg-dark)',
    minHeight: MIN_TOUCH_TARGET,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    transition: 'transform var(--transition-fast)',
  } satisfies React.CSSProperties,

  sparkleIcon: {
    flexShrink: 0,
  } satisfies React.CSSProperties,

  messageRow: {
    maxWidth: MAX_BUBBLE_WIDTH,
    display: 'flex',
    gap: 'var(--space-2)',
    alignItems: 'flex-start',
  } satisfies React.CSSProperties,

  botAvatar: {
    display: 'inline-flex',
    padding: '6px',
    borderRadius: '8px',
    background: '#FEF08A',
    border: '1.5px solid var(--color-bg-dark)',
    color: 'var(--color-bg-dark)',
    flexShrink: 0,
    marginTop: '2px',
  } satisfies React.CSSProperties,

  userAvatar: {
    display: 'inline-flex',
    padding: '6px',
    borderRadius: '8px',
    background: 'var(--color-brand-primary-light)',
    border: '1.5px solid var(--color-bg-dark)',
    color: 'var(--color-bg-dark)',
    flexShrink: 0,
    marginTop: '2px',
  } satisfies React.CSSProperties,

  loadingIndicator: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    background: '#ffffff',
    borderRadius: 'var(--radius-full)',
    border: '1.5px solid var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  loadingText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-bg-dark)',
    fontWeight: 700,
  } satisfies React.CSSProperties,

  inputRow: {
    display: 'flex',
    gap: 'var(--space-2)',
    alignItems: 'flex-end',
  } satisfies React.CSSProperties,

  textarea: {
    flex: 1,
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-xl)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    background: '#ffffff',
    color: 'var(--color-text-primary)',
    minHeight: INPUT_MIN_HEIGHT,
    resize: 'none',
    outline: 'none',
  } satisfies React.CSSProperties,

  actionButton: {
    minHeight: INPUT_MIN_HEIGHT,
  } satisfies React.CSSProperties,

  attribution: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: 'var(--space-4)',
  } satisfies React.CSSProperties,
} as const;

/**
 * Returns the message bubble style for user or bot messages.
 * @param isUser - Whether the message was sent by the user.
 * @returns Bubble-specific CSS properties.
 */
function getBubbleStyle(isUser: boolean): React.CSSProperties {
  return {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: isUser
      ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
      : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
    background: isUser ? '#FEF08A' : '#ffffff',
    color: 'var(--color-bg-dark)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-relaxed)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontWeight: 500,
  };
}

/** Chat panel with streaming AI responses, suggested questions, and medical disclaimer. */
export function ChatPanel({ location, profile }: ChatPanelProps): React.JSX.Element {
  const { t, language } = useTranslation();
  const { data } = useAirQuality(location.latitude, location.longitude);
  const { chatMessages, sendMessage, chatLoading, abortChat } = useGemini();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const risk = data ? computeHouseholdRisk(profile, data) : null;
  const rankedActions = data
    ? rankActionsForProfile(
        ACTION_CATALOG as unknown as import('@/domain/types').Action[],
        profile,
        data,
      )
    : [];
  const suggestedQuestions = language === 'hi' ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !data || !risk) return;
    const sanitized = sanitizeUserInput(input.slice(0, MAX_USER_INPUT_LENGTH));
    if (!sanitized) return;
    void sendMessage(sanitized, { location, aqi: data, risk, actions: rankedActions, language });
    setInput('');
  }, [input, data, risk, rankedActions, sendMessage, location, language]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleSuggestedClick = useCallback(
    (q: string) => {
      if (!data || !risk) return;
      void sendMessage(q, { location, aqi: data, risk, actions: rankedActions, language });
    },
    [data, risk, rankedActions, sendMessage, location, language],
  );

  return (
    <Layout>
      <SectionHeader number={SECTION_NUMBER} title={t.chat.title} subtitle={t.chat.subtitle} />

      <Banner variant="warning" style={styles.disclaimerBanner}>
        {t.chat.disclaimer}
      </Banner>

      <Card
        variant="default"
        padding="md"
        ariaLive="polite"
        ariaLabel={t.chat.title}
        style={styles.chatCard}
      >
        {chatMessages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.botIconCircle}>
              <Bot size={28} color="var(--color-bg-dark)" />
            </div>
            <p style={styles.suggestedTitle}>{t.chat.suggestedTitle}</p>
            <div style={styles.suggestedColumn}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedClick(q)}
                  disabled={chatLoading || !data}
                  style={styles.suggestedButton}
                >
                  <Sparkles
                    size={14}
                    color="var(--color-brand-secondary)"
                    style={styles.sparkleIcon}
                  />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                alignSelf: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              {!isUser && (
                <span style={styles.botAvatar}>
                  <Bot size={15} />
                </span>
              )}
              <div
                style={getBubbleStyle(isUser)}
                aria-label={isUser ? 'Your message' : 'Saans response'}
              >
                {msg.content}
              </div>
              {isUser && (
                <span style={styles.userAvatar}>
                  <User size={15} />
                </span>
              )}
            </div>
          );
        })}

        {chatLoading && (
          <div style={styles.loadingIndicator}>
            <Spinner size="sm" label={t.chat.thinking} />
            <span style={styles.loadingText}>{t.chat.thinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          maxLength={MAX_USER_INPUT_LENGTH}
          disabled={!data}
          aria-label={t.chat.placeholder}
          rows={1}
          style={styles.textarea}
        />
        {chatLoading ? (
          <Button
            variant="danger"
            icon={<Square size={14} />}
            onClick={abortChat}
            style={styles.actionButton}
          >
            {t.chat.stop}
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !data}
            icon={<Send size={15} />}
            style={styles.actionButton}
          >
            {t.chat.send}
          </Button>
        )}
      </div>

      <p style={styles.attribution}>
        {t.attribution.gemini} · {t.attribution.privacy}
      </p>
    </Layout>
  );
}
