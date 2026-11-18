import { useCallback } from 'react';
import type { SensitivityFlag, HomeType } from '@/domain/types';
import { useTranslation } from '@/i18n';

interface HouseholdStepProps {
  readonly sensitivities: readonly SensitivityFlag[];
  readonly homeType: HomeType;
  readonly hasPurifier: boolean;
  readonly hasAc: boolean;
  readonly onSensitivitiesChange: (sensitivities: SensitivityFlag[]) => void;
  readonly onHomeTypeChange: (homeType: HomeType) => void;
  readonly onPurifierChange: (val: boolean) => void;
  readonly onAcChange: (val: boolean) => void;
}

const SENSITIVITY_OPTIONS: SensitivityFlag[] = ['children', 'elderly', 'respiratory', 'cardiac', 'pregnancy'];
const HOME_TYPE_OPTIONS: HomeType[] = ['sealed', 'moderate', 'leaky'];

/** Step 2: Household composition and home environment */
export function HouseholdStep({
  sensitivities, homeType, hasPurifier, hasAc,
  onSensitivitiesChange, onHomeTypeChange, onPurifierChange, onAcChange,
}: HouseholdStepProps) {
  const { t } = useTranslation();

  const toggleSensitivity = useCallback(
    (flag: SensitivityFlag) => {
      const next = sensitivities.includes(flag)
        ? sensitivities.filter((s) => s !== flag)
        : [...sensitivities, flag];
      onSensitivitiesChange(next);
    },
    [sensitivities, onSensitivitiesChange],
  );

  const checkboxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-border)',
    cursor: 'pointer',
    minHeight: '44px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    background: 'var(--color-bg-elevated)',
    transition: 'border-color var(--transition-fast)',
  };

  const activeCheckboxStyle: React.CSSProperties = {
    ...checkboxStyle,
    borderColor: 'var(--color-brand-primary)',
    background: 'var(--color-brand-primary-light)',
  };

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step2Title}</h2>

      {/* Sensitivities */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase' }}>
          {t.onboarding.sensitivities}
        </legend>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {SENSITIVITY_OPTIONS.map((flag) => {
            const isActive = sensitivities.includes(flag);
            return (
              <label key={flag} style={isActive ? activeCheckboxStyle : checkboxStyle}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleSensitivity(flag)}
                  style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
                />
                {t.onboarding[flag]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Home type */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase' }}>
          {t.onboarding.homeType}
        </legend>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {HOME_TYPE_OPTIONS.map((ht) => {
            const isActive = homeType === ht;
            return (
              <label key={ht} style={isActive ? activeCheckboxStyle : checkboxStyle}>
                <input
                  type="radio"
                  name="homeType"
                  checked={isActive}
                  onChange={() => onHomeTypeChange(ht)}
                  style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
                />
                {t.onboarding[ht]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Equipment */}
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <label style={hasPurifier ? activeCheckboxStyle : checkboxStyle}>
          <input
            type="checkbox"
            checked={hasPurifier}
            onChange={(e) => onPurifierChange(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
          />
          {t.onboarding.hasPurifier}
        </label>
        <label style={hasAc ? activeCheckboxStyle : checkboxStyle}>
          <input
            type="checkbox"
            checked={hasAc}
            onChange={(e) => onAcChange(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
          />
          {t.onboarding.hasAc}
        </label>
      </div>
    </div>
  );
}
