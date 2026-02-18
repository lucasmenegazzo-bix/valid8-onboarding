import { useState } from 'react';
import { Logo } from '../components/Logo';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { ProfilePanel } from '../components/ProfilePanel';
import { Sidebar } from '../components/Sidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { Users } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  subtitle?: string;
  showStepper?: boolean;
}

export function OnboardingLayout({ children, subtitle, showStepper = true }: Props) {
  const { currentStep, progress, completionPercent, setProfilePanelOpen } = useOnboarding();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar — same as dashboard */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Right content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 py-4 text-center px-4">
          <Logo variant="light" size="lg" />
          {subtitle && <p className="text-sm text-gray-500 mt-1 hidden sm:block">{subtitle}</p>}
        </header>

        {/* Stepper + controls */}
        {showStepper && (
          <div className="bg-white border-b border-gray-100 pt-4 sm:pt-6 pb-2 px-3 sm:px-4">
            <div className="overflow-x-auto">
              <OnboardingStepper currentStep={currentStep} completedSteps={progress} />
            </div>
            <div className="flex items-center justify-between max-w-3xl mx-auto mt-2">
              <button
                onClick={() => setProfilePanelOpen(true)}
                disabled={!progress.identity}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  progress.identity
                    ? 'border-teal-500 text-teal-600 hover:bg-teal-50 cursor-pointer'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Users size={14} />
                Profile
              </button>
              <span className="text-xs font-semibold text-teal-500">{completionPercent}% Complete</span>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 flex flex-col items-center py-6 sm:py-8 px-3 sm:px-4">{children}</main>

        {/* Profile side panel */}
        <ProfilePanel />
      </div>
    </div>
  );
}
