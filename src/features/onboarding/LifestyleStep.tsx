import type { CommuteMode, CookingFuel, BudgetTier } from '@/domain/types';
import { useTranslation } from '@/i18n';

interface LifestyleStepProps {
  readonly commuteMode: CommuteMode;
  readonly cookingFuel: CookingFuel;
  readonly budgetTier: BudgetTier;
  readonly onCommuteModeChange: (mode: CommuteMode) => void;
  readonly onCookingFuelChange: (fuel: CookingFuel) => void;
  readonly onBudgetTierChange: (tier: BudgetTier) => void;
}

const COMMUTE_OPTIONS: CommuteMode[] = ['walk', 'cycle', 'publicTransport', 'car', 'wfh'];
const FUEL_OPTIONS: CookingFuel[] = ['electric', 'lpg', 'biomass', 'mixed'];
const BUDGET_OPTIONS: BudgetTier[] = ['free', 'low', 'investment'];

/** Step 3: Lifestyle preferences — commute, cooking, budget */
export function LifestyleStep({
  commuteMode, cookingFuel, budgetTier,
  onCommuteModeChange, onCookingFuelChange, onBudgetTierChange,
}: LifestyleStepProps) {
  const { t } = useTranslation();

  const radioStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: `2px solid ${isActive ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    minHeight: '44px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    background: isActive ? 'var(--color-brand-primary-light)' : 'var(--color-bg-elevated)',
    transition: 'border-color var(--transition-fast)',
  });

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step3Title}</h2>

      {/* Commute mode */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase' }}>
          {t.onboarding.commuteMode}
        </legend>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {COMMUTE_OPTIONS.map((mode) => (
            <label key={mode} style={radioStyle(commuteMode === mode)}>
              <input
                type="radio"
                name="commute"
                checked={commuteMode === mode}
                onChange={() => onCommuteModeChange(mode)}
                style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
              />
              {t.onboarding[mode]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Cooking fuel */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase' }}>
          {t.onboarding.cookingFuel}
        </legend>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {FUEL_OPTIONS.map((fuel) => (
            <label key={fuel} style={radioStyle(cookingFuel === fuel)}>
              <input
                type="radio"
                name="fuel"
                checked={cookingFuel === fuel}
                onChange={() => onCookingFuelChange(fuel)}
                style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
              />
              {t.onboarding[fuel]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Budget */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase' }}>
          {t.onboarding.budgetTier}
        </legend>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {BUDGET_OPTIONS.map((tier) => (
            <label key={tier} style={radioStyle(budgetTier === tier)}>
              <input
                type="radio"
                name="budget"
                checked={budgetTier === tier}
                onChange={() => onBudgetTierChange(tier)}
                style={{ width: 20, height: 20, accentColor: 'var(--color-brand-primary)' }}
              />
              {t.onboarding[tier]}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
