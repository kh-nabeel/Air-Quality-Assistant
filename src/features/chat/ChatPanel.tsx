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
          height: '24rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {chatMessages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)' }}>
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
              {t.chat.suggestedTitle}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', maxWidth: '24rem' }}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedClick(q)}
                  disabled={chatLoading || !data}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--color-border)',
                    background: 'var(--color-bg-elevated)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    minHeight: '44px',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: msg.role === 'user'
                ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
              background: msg.role === 'user' ? 'var(--color-brand-primary)' : 'var(--color-bg-secondary)',
              color: msg.role === 'user' ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            aria-label={msg.role === 'user' ? 'Your message' : 'Saans response'}
          >
            {msg.content}
          </div>
        ))}

        {chatLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Spinner size="sm" label={t.chat.thinking} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t.chat.thinking}</span>
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
            border: '2px solid var(--color-border)',
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            minHeight: '44px',
            resize: 'none',
            outline: 'none',
          }}
        />
        {chatLoading ? (
          <Button variant="danger" onClick={abortChat}>{t.chat.stop}</Button>
        ) : (
          <Button onClick={handleSend} disabled={!input.trim() || !data}>{t.chat.send}</Button>
        )}
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        {t.attribution.gemini} · {t.attribution.privacy}
      </p>
    </Layout>
  );
}
