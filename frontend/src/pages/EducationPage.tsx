import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { ChatBubble } from '../components/ChatBubble';
import { useOnboarding } from '../context/OnboardingContext';
import { EducationLevel } from '../types';
import { ChevronDown } from 'lucide-react';

const LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'high_school', label: 'High school diploma or equivalent' },
  { value: 'associate', label: 'Associate degree' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctoral', label: 'Doctoral Degree' },
  { value: 'professional_license', label: 'Professional License or Certificate' },
  { value: 'no_degree', label: 'I do not have a degree' },
];

type SubStep = 'level' | 'details';

export function EducationPage() {
  const [subStep, setSubStep] = useState<SubStep>('level');
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [institution, setInstitution] = useState('UCLA');
  const [field, setField] = useState('Computer Science');
  const [gradYear, setGradYear] = useState('2012');
  const navigate = useNavigate();
  const { addEducation, setProgress, setCurrentStep } = useOnboarding();

  const handleSelectLevel = (level: EducationLevel) => {
    setSelectedLevel(level);
  };

  const handleContinueToDetails = () => {
    if (selectedLevel === 'no_degree') {
      // Skip details
      addEducation({
        level: 'No degree',
        institution: '',
        fieldOfStudy: '',
        graduationYear: '',
      });
      setProgress({ education: true });
      setCurrentStep(4);
      navigate('/onboarding/employment');
      return;
    }
    setSubStep('details');
  };

  const handleSave = () => {
    const levelLabel = LEVELS.find((l) => l.value === selectedLevel)?.label || '';
    addEducation({
      level: levelLabel,
      institution,
      fieldOfStudy: field,
      graduationYear: gradYear,
    });
    setProgress({ education: true });
    setCurrentStep(4);
    navigate('/onboarding/employment');
  };

  return (
    <OnboardingLayout subtitle="Your educational background and qualifications">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Education</h2>
          <p className="text-sm text-gray-500 mb-6">
            Verifying your education helps confirm your qualifications and builds trust with employers.
          </p>

          {subStep === 'level' && (
            <>
              <ChatBubble>Please select your highest level of education.</ChatBubble>

              <div className="mt-6 space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                      selectedLevel === level.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="education-level"
                      checked={selectedLevel === level.value}
                      onChange={() => handleSelectLevel(level.value)}
                      className="accent-teal-500"
                    />
                    <span className="text-sm text-gray-700">{level.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-center mt-2 text-gray-400">
                <ChevronDown size={16} />
                <span className="text-xs ml-1">Scroll for more</span>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => navigate('/onboarding/personal-info')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleContinueToDetails}
                  disabled={!selectedLevel}
                  className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {subStep === 'details' && (
            <>
              <ChatBubble>
                Great! Please provide the details about your{' '}
                {LEVELS.find((l) => l.value === selectedLevel)?.label.toLowerCase()}.
              </ChatBubble>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setSubStep('level')}
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
            </>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
