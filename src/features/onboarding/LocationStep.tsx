import { useState, useCallback } from 'react';
import type { GeoLocation, UserLocation } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { useGeocoding } from '@/hooks/useGeocoding';
import { QUICK_PICK_CITIES } from '@/config/constants';
import { roundCoordinates } from '@/utils/format';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { MapPin, Navigation, Search } from 'lucide-react';

/** Icon size for the navigation button. */
const NAVIGATION_ICON_SIZE = 15;

/** Icon size for map pin quick-pick buttons. */
const MAP_PIN_SM_SIZE = 12;

/** Icon size for map pin in the current selection card. */
const MAP_PIN_MD_SIZE = 16;

/** Icon size for search result items. */
const SEARCH_ICON_SIZE = 14;

interface LocationStepProps {
  readonly onSelect: (location: UserLocation) => void;
  readonly currentLocation: UserLocation | null;
}

/** Component-scoped style definitions. */
const styles = {
  consentText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-4)',
    lineHeight: 'var(--leading-relaxed)',
  } satisfies React.CSSProperties,

  currentSelectionCard: {
    marginBottom: 'var(--space-4)',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    background: '#FEF08A',
  } satisfies React.CSSProperties,

  currentSelectionText: {
    margin: 0,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  resultsList: {
    listStyle: 'none',
    padding: 0,
    margin: 'var(--space-2) 0',
    border: '2px solid var(--color-bg-dark)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  } satisfies React.CSSProperties,

  resultButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-bg-elevated)',
    border: 'none',
    borderBottom: '1px solid var(--color-border-light)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    minHeight: '44px',
  } satisfies React.CSSProperties,

  geoButtonWrap: {
    marginTop: 'var(--space-4)',
  } satisfies React.CSSProperties,

  geoError: {
    color: 'var(--color-error)',
    fontSize: 'var(--text-sm)',
    marginTop: 'var(--space-2)',
  } satisfies React.CSSProperties,

  quickPicksWrap: {
    marginTop: 'var(--space-6)',
  } satisfies React.CSSProperties,

  quickPicksLabel: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 'var(--text-sm)',
    marginBottom: 'var(--space-2)',
    textTransform: 'lowercase',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  quickPicksGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,
} as const;

/** Step 1: Location selection via search, geolocation, or quick picks. */
export function LocationStep({ onSelect, currentLocation }: LocationStepProps): React.JSX.Element {
  const { t } = useTranslation();
  const { results, loading, search, clear } = useGeocoding();
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      search(e.target.value);
    },
    [search],
  );

  const handleSelectResult = useCallback(
    (result: GeoLocation) => {
      onSelect({
        name: result.name,
        latitude: roundCoordinates(result.latitude),
        longitude: roundCoordinates(result.longitude),
        country: result.country,
      });
      clear();
    },
    [onSelect, clear],
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelect({
          name: 'My Location',
          latitude: roundCoordinates(pos.coords.latitude),
          longitude: roundCoordinates(pos.coords.longitude),
          country: '',
        });
        setGeoLoading(false);
      },
      () => {
        setGeoError('Unable to get your location. Please search instead.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [onSelect]);

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step1Title}</h2>
      <p style={styles.consentText}>{t.onboarding.locationConsent}</p>

      {/* Current selection */}
      {currentLocation && (
        <Card variant="accent" padding="sm" style={styles.currentSelectionCard}>
          <p style={styles.currentSelectionText}>
            <MapPin size={MAP_PIN_MD_SIZE} color="var(--color-bg-dark)" />
            <span>
              {currentLocation.name}
              {currentLocation.country ? `, ${currentLocation.country}` : ''}
            </span>
          </p>
        </Card>
      )}

      {/* Search input */}
      <Input
        label={t.onboarding.searchPlaceholder}
        hideLabel
        placeholder={t.onboarding.searchPlaceholder}
        onChange={handleSearchChange}
        autoComplete="off"
      />

      {/* Search results */}
      {loading && <Spinner size="sm" />}
      {results.length > 0 && (
        <ul role="listbox" aria-label="Search results" style={styles.resultsList}>
          {results.map((r) => (
            <li key={`${r.latitude}-${r.longitude}`} role="option" aria-selected={false}>
              <button onClick={() => handleSelectResult(r)} style={styles.resultButton}>
                <Search size={SEARCH_ICON_SIZE} color="var(--color-text-muted)" />
                <span>
                  {r.name}
                  {r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Use my location */}
      <div style={styles.geoButtonWrap}>
        <Button
          variant="secondary"
          onClick={handleUseMyLocation}
          loading={geoLoading}
          icon={<Navigation size={NAVIGATION_ICON_SIZE} />}
        >
          {t.onboarding.useMyLocation}
        </Button>
        {geoError && (
          <p role="alert" style={styles.geoError}>
            {geoError}
          </p>
        )}
      </div>

      {/* Quick picks */}
      <div style={styles.quickPicksWrap}>
        <p style={styles.quickPicksLabel}>{t.onboarding.quickPicks}</p>
        <div style={styles.quickPicksGrid}>
          {QUICK_PICK_CITIES.map((city) => (
            <Button
              key={city.name}
              variant="ghost"
              size="sm"
              icon={<MapPin size={MAP_PIN_SM_SIZE} />}
              onClick={() => onSelect(city)}
            >
              {city.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
