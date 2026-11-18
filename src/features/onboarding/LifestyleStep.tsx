import type { CommuteMode, CookingFuel, BudgetTier } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { Footprints, Bike, Bus, Car, Laptop, Zap, Flame, TreePine, Layers, BadgePercent, Coins, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

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

const COMMUTE_ICONS: Record<CommuteMode, ReactNode> = {
  walk: <Footprints size={16} />,
  cycle: <Bike size={16} />,
  publicTransport: <Bus size={16} />,
  car: <Car size={16} />,
  wfh: <Laptop size={16} />,
};

const FUEL_ICONS: Record<CookingFuel, ReactNode> = {
  electric: <Zap size={16} />,
  lpg: <Flame size={16} />,
  biomass: <TreePine size={16} />,
  mixed: <Layers size={16} />,
};

const BUDGET_ICONS: Record<BudgetTier, ReactNode> = {
  free: <BadgePercent size={16} />,
  low: <Coins size={16} />,
  investment: <TrendingUp size={16} />,
};

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
    border: '2px solid var(--color-bg-dark)',
    boxShadow: isActive ? '3px 3px 0px var(--color-bg-dark)' : 'var(--shadow-sm)',
    transform: isActive ? 'translate(-1px, -1px)' : 'none',
    cursor: 'pointer',
    minHeight: '48px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    background: isActive ? '#FEF08A' : '#ffffff',
    color: 'var(--color-bg-dark)',
    transition: 'all var(--transition-fast)',
  });

  return (
    <div>
      <h2 className="section-title">{t.onboarding.step3Title}</h2>

      {/* Commute mode */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
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
                style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
              />
              <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
                {COMMUTE_ICONS[mode]}
              </span>
              <span>{t.onboarding[mode]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Cooking fuel */}
      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6) 0' }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
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
                style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
              />
              <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
                {FUEL_ICONS[fuel]}
              </span>
              <span>{t.onboarding[fuel]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Budget */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textTransform: 'lowercase', color: 'var(--color-bg-dark)' }}>
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
                style={{ width: 18, height: 18, accentColor: 'var(--color-bg-dark)' }}
              />
              <span style={{ display: 'inline-flex', color: 'var(--color-text-secondary)' }}>
                {BUDGET_ICONS[tier]}
              </span>
              <span>{t.onboarding[tier]}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
