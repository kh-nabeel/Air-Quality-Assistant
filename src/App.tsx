import { Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from '@/i18n';
import { SkipLink } from '@/components/SkipLink';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Spinner } from '@/components/Spinner';
import { OnboardingFlow } from '@/features/onboarding';

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.Dashboard })),
);
const DailyPlan = lazy(() => import('@/features/plan').then((m) => ({ default: m.DailyPlan })));
const IndoorHacks = lazy(() =>
  import('@/features/indoor').then((m) => ({ default: m.IndoorHacks })),
);
const Alternatives = lazy(() =>
  import('@/features/alternatives').then((m) => ({ default: m.Alternatives })),
);
const ImpactExplainer = lazy(() =>
  import('@/features/impact').then((m) => ({ default: m.ImpactExplainer })),
);
const ChatPanel = lazy(() => import('@/features/chat').then((m) => ({ default: m.ChatPanel })));
const CommunityKit = lazy(() =>
  import('@/features/community').then((m) => ({ default: m.CommunityKit })),
);

const RouteSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}
  >
    <Spinner size="lg" label="Loading page…" />
  </div>
);

function AppRoutes() {
  const { profile, location, setProfile, setLocation, clearAll, hasLocation } = useProfile();
  const { t } = useTranslation();

  const handleOnboardingComplete = useCallback(
    (
      loc: import('@/domain/types').UserLocation,
      prof: import('@/domain/types').HouseholdProfile,
    ) => {
      setLocation(loc);
      setProfile(prof);
    },
    [setLocation, setProfile],
  );

  const handleForgetMe = useCallback(() => {
    if (window.confirm(t.onboarding.forgetConfirm)) {
      clearAll();
    }
  }, [clearAll, t.onboarding.forgetConfirm]);

  // Show onboarding if no location
  if (!hasLocation || !location) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        initialLocation={location}
        initialProfile={profile}
      />
    );
  }

  // Use default profile if skipped
  const resolvedProfile = profile ?? {
    sensitivities: [],
    commuteMode: 'car' as const,
    homeType: 'moderate' as const,
    hasPurifier: false,
    hasAc: false,
    cookingFuel: 'lpg' as const,
    budgetTier: 'low' as const,
  };

  return (
    <>
      <SkipLink />
      <Navigation onForgetMe={handleForgetMe} />
      <ErrorBoundary>
        <Suspense fallback={<RouteSpinner />}>
          <Routes>
            <Route path="/" element={<Dashboard location={location} profile={resolvedProfile} />} />
            <Route
              path="/plan"
              element={<DailyPlan location={location} profile={resolvedProfile} />}
            />
            <Route
              path="/indoor"
              element={<IndoorHacks location={location} profile={resolvedProfile} />}
            />
            <Route
              path="/alternatives"
              element={<Alternatives location={location} profile={resolvedProfile} />}
            />
            <Route
              path="/impact"
              element={<ImpactExplainer location={location} profile={resolvedProfile} />}
            />
            <Route
              path="/chat"
              element={<ChatPanel location={location} profile={resolvedProfile} />}
            />
            <Route
              path="/community"
              element={<CommunityKit location={location} profile={resolvedProfile} />}
            />
            {/* Fallback: redirect to dashboard */}
            <Route path="*" element={<Dashboard location={location} profile={resolvedProfile} />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

/** Root application component with router and error boundary */
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
