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

/** Size in pixels for checkbox/radio input controls. */
const INPUT_CONTROL_SIZE = 18;

const SENSITIVITY_OPTIONS: SensitivityFlag[] = [
  'children',
  'elderly',
  'respiratory',
  'cardiac',
  'pregnancy',
];
const HOME_TYPE_OPTIONS: HomeType[] = ['sealed', 'moderate', 'leaky'];

const SENSITIVITY_ICONS: Record<SensitivityFlag, ReactNode> = {
  children: <Shield size={16} />,
  elderly: <Activity size={16} />,
  respiratory: <Wind size={16} />,
  cardiac: <Heart size={16} />,
  pregnancy: <Shield size={16} />,
};

/** Component-scoped style definitions. */
const styles = {
  fieldset: {
    border: 'none',
    padding: 0,
    margin: '0 0 var(--space-6) 0',
  } satisfies React.CSSProperties,

  legend: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-sm)',
    marginBottom: 'var(--space-3)',
    textTransform: 'lowercase',
    color: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  optionGrid: {
    display: 'grid',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,

  inputControl: {
    width: INPUT_CONTROL_SIZE,
    height: INPUT_CONTROL_SIZE,
    accentColor: 'var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  iconWrap: {
    display: 'inline-flex',
    color: 'var(--color-text-secondary)',
  } satisfies React.CSSProperties,
} as const;

/** Base style for an unselected checkbox/radio label. */
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

/** Active/selected variant of the checkbox/radio label. */
const activeCheckboxStyle: React.CSSProperties = {
  ...checkboxStyle,
  background: '#FEF08A',
  boxShadow: '3px 3px 0px var(--color-bg-dark)',
  transform: 'translate(-1px, -1px)',
};

/** Step 2: Household composition and home environment. */
export function HouseholdStep({
  sensitivities,
  homeType,
  hasPurifier,
  hasAc,
  onSensitivitiesChange,
  onHomeTypeChange,
  onPurifierChange,
  onAcChange,
}: HouseholdStepProps): React.JSX.Element {
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

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step2Title}</h2>

      {/* Sensitivities */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{t.onboarding.sensitivities}</legend>
        <div style={styles.optionGrid}>
          {SENSITIVITY_OPTIONS.map((flag) => {
            const isActive = sensitivities.includes(flag);
            return (
              <label key={flag} style={isActive ? activeCheckboxStyle : checkboxStyle}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleSensitivity(flag)}
                  style={styles.inputControl}
                />
                <span style={styles.iconWrap}>{SENSITIVITY_ICONS[flag]}</span>
                <span>{t.onboarding[flag]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Home type */}
      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>{t.onboarding.homeType}</legend>
        <div style={styles.optionGrid}>
          {HOME_TYPE_OPTIONS.map((ht) => {
            const isActive = homeType === ht;
            return (
              <label key={ht} style={isActive ? activeCheckboxStyle : checkboxStyle}>
                <input
                  type="radio"
                  name="homeType"
                  checked={isActive}
                  onChange={() => onHomeTypeChange(ht)}
                  style={styles.inputControl}
                />
                <span>{t.onboarding[ht]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Equipment */}
      <div style={styles.optionGrid}>
        <label style={hasPurifier ? activeCheckboxStyle : checkboxStyle}>
          <input
            type="checkbox"
            checked={hasPurifier}
            onChange={(e) => onPurifierChange(e.target.checked)}
            style={styles.inputControl}
          />
          <span style={styles.iconWrap}>
            <Fan size={16} />
          </span>
          <span>{t.onboarding.hasPurifier}</span>
        </label>
        <label style={hasAc ? activeCheckboxStyle : checkboxStyle}>
          <input
            type="checkbox"
            checked={hasAc}
            onChange={(e) => onAcChange(e.target.checked)}
            style={styles.inputControl}
          />
          <span style={styles.iconWrap}>
            <Snowflake size={16} />
          </span>
          <span>{t.onboarding.hasAc}</span>
        </label>
      </div>
    </div>
  );
}
