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
        background: 'var(--color-bg-primary)',
      }}
    >
      <div style={{ maxWidth: '32rem', width: '100%' }}>
        {/* Welcome header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-brand-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {t.app.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            {t.app.tagline}
          </p>
        </div>

        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            justifyContent: 'center',
            marginBottom: 'var(--space-6)',
          }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Step ${step + 1} of 3`}
        >
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              style={{
                width: 'var(--space-10)',
                height: 4,
                borderRadius: 'var(--radius-full)',
                background: s <= step ? 'var(--color-brand-primary)' : 'var(--color-border)',
                transition: 'background var(--transition-normal)',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <Card variant="elevated" padding="lg">
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
              marginTop: 'var(--space-6)',
              gap: 'var(--space-3)',
            }}
          >
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
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
                >
                  {t.onboarding.next}
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={!location}>
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
