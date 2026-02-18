import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { ChatBubble } from '../components/ChatBubble';
import { useOnboarding } from '../context/OnboardingContext';
import { Plus, Trash2 } from 'lucide-react';

interface LocalEntry {
  employer: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export function EmploymentPage() {
  const [entries, setEntries] = useState<LocalEntry[]>([
    { employer: 'BIX Technology', title: 'Senior Software Engineer', startDate: 'Mar 2020', endDate: '', current: true },
  ]);
  const navigate = useNavigate();
  const { addEmployment, setProgress, setCurrentStep } = useOnboarding();

  const updateEntry = (index: number, field: keyof LocalEntry, value: string | boolean) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { employer: '', title: '', startDate: '', endDate: '', current: false }]);
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    entries.forEach((entry) => {
      addEmployment({
        employer: entry.employer,
        title: entry.title,
        startDate: entry.startDate,
        endDate: entry.endDate,
        current: entry.current,
      });
    });
    setProgress({ employment: true });
    setCurrentStep(5);
    navigate('/onboarding/review');
  };

  return (
    <OnboardingLayout subtitle="Your professional work experience">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Employment History</h2>
          <p className="text-sm text-gray-500 mb-6">
            Add your employment history to build a comprehensive professional profile.
          </p>

          <ChatBubble>Let's add your work experience. Please enter your current or most recent position first.</ChatBubble>

          <div className="mt-6 space-y-6">
            {entries.map((entry, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 relative">
                {entries.length > 1 && (
                  <button
                    onClick={() => removeEntry(idx)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <p className="text-xs font-semibold text-gray-400 mb-3">POSITION {idx + 1}</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Employer</label>
                    <input
                      type="text"
                      value={entry.employer}
                      onChange={(e) => updateEntry(idx, 'employer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={entry.startDate}
                        onChange={(e) => updateEntry(idx, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input
                        type="text"
                        value={entry.current ? 'Present' : entry.endDate}
                        onChange={(e) => updateEntry(idx, 'endDate', e.target.value)}
                        disabled={entry.current}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={entry.current}
                      onChange={(e) => updateEntry(idx, 'current', e.target.checked)}
                      className="accent-teal-500"
                    />
                    I currently work here
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addEntry}
            className="flex items-center gap-2 text-sm text-teal-600 font-medium mt-4 hover:text-teal-700"
          >
            <Plus size={16} /> Add another position
          </button>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate('/onboarding/education')}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
