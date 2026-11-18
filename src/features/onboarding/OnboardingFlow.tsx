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

interface OnboardingFlowProps {
  readonly onComplete: (location: UserLocation, profile: HouseholdProfile) => void;
  readonly initialLocation: UserLocation | null;
  readonly initialProfile: HouseholdProfile | null;
}

/** Multi-step onboarding wizard (3 skippable steps) */
export function OnboardingFlow({ onComplete, initialLocation, initialProfile }: OnboardingFlowProps) {
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
  }, [location, sensitivities, commuteMode, homeType, hasPurifier, hasAc, cookingFuel, budgetTier, onComplete]);

  const canProceedFromStep0 = location !== null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: '#FAF9F5',
      }}
    >
      <div style={{ maxWidth: '34rem', width: '100%' }}>
        {/* Welcome header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '8px',
                borderRadius: '12px',
                background: 'var(--color-brand-primary)',
                color: '#ffffff',
                border: '2px solid var(--color-bg-dark)',
                boxShadow: '2px 2px 0px var(--color-bg-dark)',
              }}
            >
              <Wind size={26} strokeWidth={2.5} />
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'var(--text-4xl)',
                color: 'var(--color-bg-dark)',
                letterSpacing: '-0.04em',
                margin: 0,
              }}
            >
              {t.app.name}
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
            {t.app.tagline}
          </p>
        </div>

        {/* Step indicator badges */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Step ${step + 1} of 3`}
        >
          {['Location', 'Household', 'Lifestyle'].map((label, s) => {
            const isDone = s < step;
            const isCurrent = s === step;
            return (
              <div
                key={label}
                style={{
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
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {isDone ? <Check size={12} strokeWidth={3} /> : `0${s + 1}`}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Step content Card */}
        <Card
          variant="elevated"
          padding="lg"
          style={{
            border: '2.5px solid var(--color-bg-dark)',
            boxShadow: 'var(--shadow-lg)',
            background: '#ffffff',
          }}
        >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-8)',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-4)',
              borderTop: '1.5px solid var(--color-border-light)',
            }}
          >
            {step > 0 ? (
              <Button
                variant="ghost"
                icon={<ArrowLeft size={16} />}
                onClick={() => setStep(step - 1)}
              >
                {t.onboarding.back}
              </Button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {step > 0 && step < 2 && (
                <Button variant="ghost" onClick={() => setStep(step + 1)}>
                  {t.onboarding.skip}
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && !canProceedFromStep0}
                  icon={<ArrowRight size={16} />}
                >
                  {t.onboarding.next}
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!location}
                  icon={<Check size={16} />}
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
