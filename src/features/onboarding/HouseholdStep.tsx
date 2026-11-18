import { useCallback } from 'react';
import type { SensitivityFlag, HomeType } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Heart, Wind, Activity, Shield, Fan, Snowflake } from 'lucide-react';
import type { ReactNode } from 'react';

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

const SENSITIVITY_ICONS: Record<SensitivityFlag, ReactNode> = {
  children: <Shield size={16} />,
  elderly: <Activity size={16} />,
  respiratory: <Wind size={16} />,
  cardiac: <Heart size={16} />,
  pregnancy: <Shield size={16} />,
};

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
    border: '2px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    minHeight: '48px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    background: '#ffffff',
    color: 'var(--color-bg-dark)',
    transition: 'all var(--transition-fast)',
  };

  const activeCheckboxStyle: React.CSSProperties = {
    ...checkboxStyle,
    background: '#FEF08A',
    boxShadow: '3px 3px 0px var(--color-bg-dark)',
    transform: 'translate(-1px, -1px)',
  };

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step2Title}</h2>

      {/* Sensitivities */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
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
                  style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
                />
                <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
                  {SENSITIVITY_ICONS[flag]}
                </span>
                <span>{t.onboarding[flag]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Home type */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
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
                  style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
                />
                <span>{t.onboarding[ht]}</span>
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
            style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
          />
          <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
            <Fan size={16} />
          </span>
          <span>{t.onboarding.hasPurifier}</span>
        </label>
        <label style={hasAc ? activeCheckboxStyle : checkboxStyle}>
          <input
            type="checkbox"
            checked={hasAc}
            onChange={(e) => onAcChange(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
          />
          <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
            <Snowflake size={16} />
          </span>
          <span>{t.onboarding.hasAc}</span>
        </label>
      </div>
    </div>
  );
}
