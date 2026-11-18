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

interface ChatPanelProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

const SUGGESTED_QUESTIONS_EN = [
  'Is it safe to go for a walk right now?',
  'What mask should I use on bad AQI days?',
  'How can I protect my child from smog?',
  'When should I ventilate my home today?',
  'Are indoor plants effective for air quality?',
];

const SUGGESTED_QUESTIONS_HI = [
  'क्या अभी टहलने जाना सुरक्षित है?',
  'खराब AQI में कौन सा मास्क पहनें?',
  'बच्चों को स्मॉग से कैसे बचाएं?',
  'आज घर की हवा कब बदलें?',
  'क्या इनडोर पौधे हवा के लिए कारगर हैं?',
];

/** Chat panel with streaming AI responses, suggested questions, and medical disclaimer */
export function ChatPanel({ location, profile }: ChatPanelProps) {
  const { t, language } = useTranslation();
  const { data } = useAirQuality(location.latitude, location.longitude);
  const { chatMessages, sendMessage, chatLoading, abortChat } = useGemini();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const risk = data ? computeHouseholdRisk(profile, data) : null;
  const rankedActions = data ? rankActionsForProfile(ACTION_CATALOG as unknown as import('@/domain/types').Action[], profile, data) : [];
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
      <SectionHeader number="08" title={t.chat.title} subtitle={t.chat.subtitle} />

      <Banner variant="warning" style={{ marginBottom: 'var(--space-4)' }}>
        {t.chat.disclaimer}
      </Banner>

      <Card
        variant="default"
        padding="md"
        ariaLive="polite"
        ariaLabel={t.chat.title}
        style={{
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
        }}
      >
        {chatMessages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-2)' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '12px',
                borderRadius: '16px',
                background: '#FEF08A',
                border: '2px solid var(--color-bg-dark)',
                boxShadow: '2px 2px 0px var(--color-bg-dark)',
              }}
            >
              <Bot size={28} color="var(--color-bg-dark)" />
            </div>
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>
              {t.chat.suggestedTitle}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', maxWidth: '28rem' }}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedClick(q)}
                  disabled={chatLoading || !data}
                  style={{
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
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    transition: 'transform var(--transition-fast)',
                  }}
                >
                  <Sparkles size={14} color="var(--color-brand-secondary)" style={{ flexShrink: 0 }} />
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
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'flex-start',
              }}
            >
              {!isUser && (
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '6px',
                    borderRadius: '8px',
                    background: '#FEF08A',
                    border: '1.5px solid var(--color-bg-dark)',
                    color: 'var(--color-bg-dark)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Bot size={15} />
                </span>
              )}
              <div
                style={{
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
                }}
                aria-label={isUser ? 'Your message' : 'Saans response'}
              >
                {msg.content}
              </div>
              {isUser && (
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '6px',
                    borderRadius: '8px',
                    background: 'var(--color-brand-primary-light)',
                    border: '1.5px solid var(--color-bg-dark)',
                    color: 'var(--color-bg-dark)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <User size={15} />
                </span>
              )}
            </div>
          );
        })}

        {chatLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: '#ffffff', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--color-bg-dark)' }}>
            <Spinner size="sm" label={t.chat.thinking} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-bg-dark)', fontWeight: 700 }}>{t.chat.thinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chat.placeholder}
          maxLength={MAX_USER_INPUT_LENGTH}
          disabled={!data}
          aria-label={t.chat.placeholder}
          rows={1}
          style={{
            flex: 1,
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--color-bg-dark)',
            boxShadow: 'var(--shadow-sm)',
            background: '#ffffff',
            color: 'var(--color-text-primary)',
            minHeight: '48px',
            resize: 'none',
            outline: 'none',
          }}
        />
        {chatLoading ? (
          <Button variant="danger" icon={<Square size={14} />} onClick={abortChat} style={{ minHeight: '48px' }}>
            {t.chat.stop}
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!input.trim() || !data} icon={<Send size={15} />} style={{ minHeight: '48px' }}>
            {t.chat.send}
          </Button>
        )}
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        {t.attribution.gemini} · {t.attribution.privacy}
      </p>
    </Layout>
  );
}
