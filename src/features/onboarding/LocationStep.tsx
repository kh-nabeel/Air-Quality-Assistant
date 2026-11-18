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

interface LocationStepProps {
  readonly onSelect: (location: UserLocation) => void;
  readonly currentLocation: UserLocation | null;
}

/** Step 1: Location selection via search, geolocation, or quick picks */
export function LocationStep({ onSelect, currentLocation }: LocationStepProps) {
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
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        {t.onboarding.locationConsent}
      </p>

      {/* Current selection */}
      {currentLocation && (
        <Card variant="accent" padding="sm" style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            📍 {currentLocation.name}{currentLocation.country ? `, ${currentLocation.country}` : ''}
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
        <ul
          role="listbox"
          aria-label="Search results"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 'var(--space-2) 0',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {results.map((r) => (
            <li key={`${r.latitude}-${r.longitude}`} role="option" aria-selected={false}>
              <button
                onClick={() => handleSelectResult(r)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-bg-elevated)',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  minHeight: '44px',
                }}
              >
                {r.name}{r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Use my location */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <Button variant="secondary" onClick={handleUseMyLocation} loading={geoLoading}>
          {t.onboarding.useMyLocation}
        </Button>
        {geoError && (
          <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            {geoError}
          </p>
        )}
      </div>

      {/* Quick picks */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', textTransform: 'lowercase' }}>
          {t.onboarding.quickPicks}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {QUICK_PICK_CITIES.map((city) => (
            <Button
              key={city.name}
              variant="ghost"
              size="sm"
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
