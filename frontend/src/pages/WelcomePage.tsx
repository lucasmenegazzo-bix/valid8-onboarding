import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Sidebar } from '../components/Sidebar';
import { IdCard, FileText, GraduationCap, Briefcase, MapPin, Lock, Settings } from 'lucide-react';

const CHECKLIST = [
  { icon: IdCard, title: 'Government-issued photo ID', desc: "Driver's license, passport, or Real ID" },
  { icon: FileText, title: 'Resume / CV or background check report', desc: 'Optional · Digital CV or recent background check report speeds up your profile creation' },
  { icon: GraduationCap, title: 'Education', desc: "Diplomas, transcripts, and any current credentials you've achieved" },
  { icon: Briefcase, title: 'Employment history', desc: 'Employer names, dates, and job titles' },
  { icon: MapPin, title: 'Address history', desc: '10 years of your primary home address history' },
];

export function WelcomePage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 py-5 text-center px-4">
          <Logo variant="light" size="lg" />
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">Your professional profile. Verification made simple</p>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full p-5 sm:p-8">
          {/* Welcome */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Settings size={20} className="text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Lucas!</h1>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Let's build your verified professional profile. This takes about 15-20 minutes, and you can save your
            progress and come back anytime. Here's what you'll need:
          </p>

          {/* Checklist */}
          <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">HAVE THESE READY</p>
          <div className="space-y-3 mb-8">
            {CHECKLIST.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-lg border border-teal-200 bg-teal-50/30"
              >
                <div className="mt-0.5 text-teal-500">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/onboarding/identity')}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            Let's Get Started
            <span>›</span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
            <Lock size={12} />
            Your info is encrypted and secure
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}
