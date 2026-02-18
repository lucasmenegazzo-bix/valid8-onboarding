import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { User, HelpCircle, MessageSquare, Settings } from 'lucide-react';

const CARDS = [
  { icon: User, title: 'Account information', desc: 'Email, password and other settings', to: '/dashboard/settings' },
  { icon: User, title: 'My Profile', desc: 'View or share your profile', to: '/dashboard/profile' },
  { icon: HelpCircle, title: 'Seek Help', desc: 'Help and FAQ', to: '/dashboard/help' },
  { icon: MessageSquare, title: 'Provide Feedback', desc: 'Contact and Feedback', to: '/dashboard/contact' },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-5xl">
        {/* Banner */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Your profile is almost ready for validation.</h1>
          <p className="text-gray-700 mb-5">A quick review will ensure everything is accurate and complete.</p>
          <button
            onClick={() => navigate('/onboarding/welcome')}
            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Review My Profile
          </button>
        </div>

        {/* Cards */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">What would you like to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CARDS.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.to)}
              className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-left"
            >
              <div className="mt-0.5">
                {card.title === 'Account information' ? (
                  <Settings size={20} className="text-gray-600" />
                ) : (
                  <card.icon size={20} className="text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
