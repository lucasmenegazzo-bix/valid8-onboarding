import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WelcomePage } from './pages/WelcomePage';
import { IdentityPage } from './pages/IdentityPage';
import { PersonalInfoPage } from './pages/PersonalInfoPage';
import { EducationPage } from './pages/EducationPage';
import { EmploymentPage } from './pages/EmploymentPage';
import { ReviewPage } from './pages/ReviewPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingRoutes() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="identity" element={<IdentityPage />} />
        <Route path="personal-info" element={<PersonalInfoPage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="employment" element={<EmploymentPage />} />
        <Route path="review" element={<ReviewPage />} />
      </Routes>
    </OnboardingProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/*"
        element={
          <ProtectedRoute>
            <OnboardingRoutes />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
