import type { HouseholdProfile, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { classifyAqi } from '@/domain/classifyAqi';
import { rankActionsForProfile } from '@/domain/helpers';
import { ACTION_CATALOG } from '@/domain/actionCatalog';
import { useAirQuality } from '@/hooks/useAirQuality';
import { Layout, SectionHeader } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Banner } from '@/components/Banner';
import { Spinner } from '@/components/Spinner';
import { formatDate } from '@/utils/format';
import { Printer, School, Home, Building2, Wind } from 'lucide-react';
import type { ReactNode } from 'react';

interface CommunityKitProps {
  readonly location: UserLocation;
  readonly profile: HouseholdProfile;
}

const AUDIENCE_ICONS: readonly ReactNode[] = [
  <School size={16} key="school" />,
  <Home size={16} key="home" />,
  <Building2 size={16} key="bldg" />,
];

/** Printable community advisory for schools, RWAs, and workplaces */
export function CommunityKit({ location, profile }: CommunityKitProps) {
  const { t, language } = useTranslation();
  const { data, loading } = useAirQuality(location.latitude, location.longitude);

  if (loading || !data) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" label={t.common.loading} />
        </div>
      </Layout>
    );
  }

  const classification = classifyAqi(data.usAqi);
  const allRanked = rankActionsForProfile(ACTION_CATALOG as unknown as import('@/domain/types').Action[], profile, data);
  const topActions = allRanked.slice(0, 6);

  const handlePrint = () => { window.print(); };

  return (
    <Layout>
      <SectionHeader number="09" title={t.community.title} subtitle={t.community.subtitle} />

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Button onClick={handlePrint} icon={<Printer size={16} />}>
          {t.community.print}
        </Button>
      </div>

      <Card
        variant="elevated"
        padding="lg"
        ariaLabel="Community advisory"
        style={{
          maxWidth: 'var(--max-width-narrow)',
          margin: '0 auto',
          border: '2.5px solid var(--color-bg-dark)',
          boxShadow: 'var(--shadow-md)',
          background: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '6px',
                borderRadius: '8px',
                background: 'var(--color-brand-primary)',
                color: '#ffffff',
                border: '1.5px solid var(--color-bg-dark)',
              }}
            >
              <Wind size={20} />
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-3xl)', color: 'var(--color-bg-dark)', margin: 0 }}>
              {t.app.name}
            </h2>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
            COMMUNITY ADVISORY · {location.name.toUpperCase()} · {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-bg-dark)' }}>
          <Badge variant="aqi" aqiCategory={classification.category} style={{ fontSize: 'var(--text-base)', padding: 'var(--space-2) var(--space-6)' }}>
            AQI {Math.round(data.usAqi)} — {classification.label}
          </Badge>
          <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, margin: '8px 0 0' }}>
            {classification.description}
          </p>
        </div>

        {(['forSchools', 'forRwa', 'forWorkplaces'] as const).map((key, i) => (
          <div key={key} style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '4px',
                  borderRadius: '6px',
                  background: 'var(--color-bg-secondary)',
                  border: '1.5px solid var(--color-bg-dark)',
                  color: 'var(--color-bg-dark)',
                }}
              >
                {AUDIENCE_ICONS[i]}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-base)', margin: 0, textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
                {t.community[key]}
              </h3>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {topActions.slice(0, 3).map((ranked) => (
                <div
                  key={ranked.action.id}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-bg-dark)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-normal)',
                  }}
                >
                  <strong>{ranked.action.title[language]}</strong> — {ranked.action.description[language]}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Banner variant="error">{t.community.emergencyContacts}</Banner>

        <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          <p>{t.medical.disclaimer}</p>
          <p style={{ marginTop: 'var(--space-2)' }}>{t.attribution.openMeteo} · {t.attribution.gemini}</p>
        </div>
      </Card>
    </Layout>
  );
}
