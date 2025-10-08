import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RouteTransition } from "./RouteTransition";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Eagerly load critical routes
import ComingSoon from "@/pages/ComingSoon";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Lazy load other routes
const Home = lazy(() => import("@/pages/Home"));
const CharityBrowser = lazy(() => import("@/pages/CharityBrowser"));
const SentryTest = lazy(() => import("@/pages/SentryTest"));
const GlobalWaterFoundation = lazy(
  () => import("@/pages/charities/GlobalWaterFoundation"),
);
const EducationForAll = lazy(() => import("@/pages/charities/EducationForAll"));
const ClimateActionNow = lazy(
  () => import("@/pages/charities/ClimateActionNow"),
);
const EnvironmentPortfolioDetail = lazy(
  () => import("@/pages/portfolio/EnvironmentPortfolioDetail"),
);
const EducationPortfolioDetail = lazy(
  () => import("@/pages/portfolio/EducationPortfolioDetail"),
);
const PovertyPortfolioDetail = lazy(
  () => import("@/pages/portfolio/PovertyPortfolioDetail"),
);
const ContributionTracker = lazy(() => import("@/pages/ContributionTracker"));
const VolunteerOpportunities = lazy(
  () => import("@/pages/VolunteerOpportunities"),
);
const About = lazy(() => import("@/pages/About"));
const Legal = lazy(() => import("@/pages/Legal"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Governance = lazy(() => import("@/pages/Governance"));
const GiveDashboard = lazy(() => import("@/pages/GiveDashboard"));
const CharityPortal = lazy(() => import("@/pages/CharityPortal"));
const CreateOpportunity = lazy(
  () => import("@/pages/charity/CreateOpportunity"),
);
const NotFound = lazy(() => import("@/pages/NotFound"));
const VerifyContribution = lazy(
  () => import("@/pages/volunteer/VerifyContribution"),
);
const ScheduledDonationsPage = lazy(
  () => import("@/pages/donor/ScheduledDonationsPage"),
);
const Documentation = lazy(() => import("@/pages/Documentation"));

// Admin routes
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

// Lazy load cause pages
const CleanWaterInitiative = lazy(
  () => import("@/pages/causes/CleanWaterInitiative"),
);
const EducationAccessProgram = lazy(
  () => import("@/pages/causes/EducationAccessProgram"),
);
const ReforestationProject = lazy(
  () => import("@/pages/causes/ReforestationProject"),
);

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * Main application routing component that defines all routes and navigation.
 * Handles lazy loading, route protection, and transitions between pages.
 *
 * @function AppRoutes
 * @returns {JSX.Element} The complete application routing structure
 * @example
 * ```typescript
 * // Used in App.tsx as the main router
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Layout>
 *         <AppRoutes />
 *       </Layout>
 *     </BrowserRouter>
 *   );
 * }
 * ```
 */
export function AppRoutes() {
  const { user: _user } = useAuth(); // Prefixed as unused

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <RouteTransition>
              <ComingSoon />
            </RouteTransition>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />

        {/* Cause Routes */}
        <Route
          path="/causes/clean-water-initiative"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <CleanWaterInitiative />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/causes/education-access-program"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EducationAccessProgram />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/causes/reforestation-project"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <ReforestationProject />
              </Suspense>
            </RouteTransition>
          }
        />

        {/* Charity Routes */}
        <Route
          path="/charity/global-water-foundation"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <GlobalWaterFoundation />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/charity/education-for-all"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EducationForAll />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/charity/climate-action-now"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <ClimateActionNow />
              </Suspense>
            </RouteTransition>
          }
        />

        {/* Portfolio Routes */}
        <Route
          path="/portfolio/environmental"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EnvironmentPortfolioDetail />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/portfolio/education"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EducationPortfolioDetail />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/portfolio/poverty"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <PovertyPortfolioDetail />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/portfolio/poverty-relief"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <PovertyPortfolioDetail />
              </Suspense>
            </RouteTransition>
          }
        />

        {/* Volunteer Verification Routes */}
        <Route
          path="/verify/:hash"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <VerifyContribution />
              </Suspense>
            </RouteTransition>
          }
        />

        {/* Charity Management Routes */}
        <Route
          path="/charity-portal/create-opportunity"
          element={
            <ProtectedRoute requiredRoles={["charity"]}>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <CreateOpportunity />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />

        {/* Donor Routes */}
        <Route
          path="/scheduled-donations"
          element={
            <ProtectedRoute requiredRoles={["donor"]}>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <ScheduledDonationsPage />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />

        {/* Other Routes */}
        <Route
          path="/privacy"
          element={
            <RouteTransition>
              <Privacy />
            </RouteTransition>
          }
        />
        <Route
          path="/sentry-test"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <SentryTest />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/app"
          element={
            <RouteTransition>
              <Home />
            </RouteTransition>
          }
        />
        <Route
          path="/give-dashboard/*"
          element={
            <ProtectedRoute allowWalletOnly>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <GiveDashboard />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor-portal"
          element={
            <ProtectedRoute requiredRoles={["donor"]}>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <Navigate to="/give-dashboard" replace />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/charity-portal/*"
          element={
            <ProtectedRoute requiredRoles={["charity"]}>
              <RouteTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <CharityPortal />
                </Suspense>
              </RouteTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <CharityBrowser />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/opportunities"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <VolunteerOpportunities />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/contributions"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <ContributionTracker />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/governance"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <Governance />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/about"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <About />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/docs"
          element={<Navigate to="/documentation" replace />}
        />
        <Route
          path="/documentation"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <Documentation />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route
          path="/legal"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <Legal />
              </Suspense>
            </RouteTransition>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={
            <RouteTransition>
              <Suspense fallback={<LoadingFallback />}>
                <NotFound />
              </Suspense>
            </RouteTransition>
          }
        />
      </Routes>
    </Suspense>
  );
}
