import { useState, useCallback } from 'react';
import type {
  BudgetTier,
  CommuteMode,
  CookingFuel,
  HomeType,
  HouseholdProfile,
  SensitivityFlag,
  UserLocation,
} from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LocationStep } from './LocationStep';
import { HouseholdStep } from './HouseholdStep';
import { LifestyleStep } from './LifestyleStep';
import { Wind, ArrowRight, ArrowLeft, Check } from 'lucide-react';

/** Total number of onboarding steps. */
const TOTAL_STEPS = 3;

/** Icon size for the brand logo. */
const BRAND_ICON_SIZE = 26;

/** Icon size for navigation button icons. */
const NAV_ICON_SIZE = 16;

/** Step indicator icon size for the check mark. */
const CHECK_ICON_SIZE = 12;

/** Labels for each onboarding step. */
const STEP_LABELS = ['Location', 'Household', 'Lifestyle'] as const;

interface OnboardingFlowProps {
  readonly onComplete: (location: UserLocation, profile: HouseholdProfile) => void;
  readonly initialLocation: UserLocation | null;
  readonly initialProfile: HouseholdProfile | null;
}

/** Component-scoped style definitions. */
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
    background: '#FAF9F5',
  } satisfies React.CSSProperties,

  contentWrapper: {
    maxWidth: '34rem',
    width: '100%',
  } satisfies React.CSSProperties,

  headerCenter: {
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
  } satisfies React.CSSProperties,

  brandRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  } satisfies React.CSSProperties,

  brandIconWrap: {
    display: 'inline-flex',
    padding: '8px',
    borderRadius: '12px',
    background: 'var(--color-brand-primary)',
    color: '#ffffff',
    border: '2px solid var(--color-bg-dark)',
    boxShadow: '2px 2px 0px var(--color-bg-dark)',
  } satisfies React.CSSProperties,

  appTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: 'var(--text-4xl)',
    color: 'var(--color-bg-dark)',
    letterSpacing: '-0.04em',
    margin: 0,
  } satisfies React.CSSProperties,

  tagline: {
    fontFamily: 'var(--font-heading)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    margin: 0,
  } satisfies React.CSSProperties,

  stepIndicatorRow: {
    display: 'flex',
    gap: 'var(--space-3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 'var(--space-6)',
  } satisfies React.CSSProperties,

  stepMonoFont: {
    fontFamily: 'var(--font-mono)',
  } satisfies React.CSSProperties,

  stepCard: {
    border: '2.5px solid var(--color-bg-dark)',
    boxShadow: 'var(--shadow-lg)',
    background: '#ffffff',
  } satisfies React.CSSProperties,

  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-8)',
    gap: 'var(--space-3)',
    paddingTop: 'var(--space-4)',
    borderTop: '1.5px solid var(--color-border-light)',
  } satisfies React.CSSProperties,

  navButtonGroup: {
    display: 'flex',
    gap: 'var(--space-2)',
  } satisfies React.CSSProperties,
} as const;

/**
 * Builds the step indicator badge style based on current progress.
 * @param isCurrent - Whether the badge represents the current step.
 * @param isDone - Whether the badge represents a completed step.
 * @returns CSS properties for the step indicator badge.
 */
function stepBadgeStyle(isCurrent: boolean, isDone: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1.5px solid var(--color-bg-dark)',
    background: isCurrent ? '#FEF08A' : isDone ? '#D1FAE5' : '#ffffff',
    boxShadow: isCurrent ? '2px 2px 0px var(--color-bg-dark)' : 'none',
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    color: 'var(--color-bg-dark)',
    transition: 'all var(--transition-fast)',
  };
}

/** Multi-step onboarding wizard (3 skippable steps). */
export function OnboardingFlow({
  onComplete,
  initialLocation,
  initialProfile,
}: OnboardingFlowProps): React.JSX.Element {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState<UserLocation | null>(initialLocation);

  // Profile fields
  const [sensitivities, setSensitivities] = useState<SensitivityFlag[]>(
    initialProfile ? [...initialProfile.sensitivities] : [],
  );
  const [homeType, setHomeType] = useState<HomeType>(initialProfile?.homeType ?? 'moderate');
  const [hasPurifier, setHasPurifier] = useState(initialProfile?.hasPurifier ?? false);
  const [hasAc, setHasAc] = useState(initialProfile?.hasAc ?? false);
  const [commuteMode, setCommuteMode] = useState<CommuteMode>(initialProfile?.commuteMode ?? 'car');
  const [cookingFuel, setCookingFuel] = useState<CookingFuel>(initialProfile?.cookingFuel ?? 'lpg');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(initialProfile?.budgetTier ?? 'low');

  const handleFinish = useCallback(() => {
    if (!location) return;
    const profile: HouseholdProfile = {
      sensitivities,
      commuteMode,
      homeType,
      hasPurifier,
      hasAc,
      cookingFuel,
      budgetTier,
    };
    onComplete(location, profile);
  }, [
    location,
    sensitivities,
    commuteMode,
    homeType,
    hasPurifier,
    hasAc,
    cookingFuel,
    budgetTier,
    onComplete,
  ]);

  const canProceedFromStep0 = location !== null;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.contentWrapper}>
        {/* Welcome header */}
        <div style={styles.headerCenter}>
          <div style={styles.brandRow}>
            <span style={styles.brandIconWrap}>
              <Wind size={BRAND_ICON_SIZE} strokeWidth={2.5} />
            </span>
            <h1 style={styles.appTitle}>{t.app.name}</h1>
          </div>
          <p style={styles.tagline}>{t.app.tagline}</p>
        </div>

        {/* Step indicator badges */}
        <div
          style={styles.stepIndicatorRow}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          {STEP_LABELS.map((label, s) => {
            const isDone = s < step;
            const isCurrent = s === step;
            return (
              <div key={label} style={stepBadgeStyle(isCurrent, isDone)}>
                <span style={styles.stepMonoFont}>
                  {isDone ? <Check size={CHECK_ICON_SIZE} strokeWidth={3} /> : `0${s + 1}`}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Step content Card */}
        <Card variant="elevated" padding="lg" style={styles.stepCard}>
          {step === 0 && <LocationStep onSelect={setLocation} currentLocation={location} />}
          {step === 1 && (
            <HouseholdStep
              sensitivities={sensitivities}
              homeType={homeType}
              hasPurifier={hasPurifier}
              hasAc={hasAc}
              onSensitivitiesChange={setSensitivities}
              onHomeTypeChange={setHomeType}
              onPurifierChange={setHasPurifier}
              onAcChange={setHasAc}
            />
          )}
          {step === 2 && (
            <LifestyleStep
              commuteMode={commuteMode}
              cookingFuel={cookingFuel}
              budgetTier={budgetTier}
              onCommuteModeChange={setCommuteMode}
              onCookingFuelChange={setCookingFuel}
              onBudgetTierChange={setBudgetTier}
            />
          )}

          {/* Navigation buttons */}
          <div style={styles.navBar}>
            {step > 0 ? (
              <Button
                variant="ghost"
                icon={<ArrowLeft size={NAV_ICON_SIZE} />}
                onClick={() => setStep(step - 1)}
              >
                {t.onboarding.back}
              </Button>
            ) : (
              <div />
            )}

            <div style={styles.navButtonGroup}>
              {step > 0 && step < 2 && (
                <Button variant="ghost" onClick={() => setStep(step + 1)}>
                  {t.onboarding.skip}
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && !canProceedFromStep0}
                  icon={<ArrowRight size={NAV_ICON_SIZE} />}
                >
                  {t.onboarding.next}
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!location}
                  icon={<Check size={NAV_ICON_SIZE} />}
                >
                  {t.onboarding.finish}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
