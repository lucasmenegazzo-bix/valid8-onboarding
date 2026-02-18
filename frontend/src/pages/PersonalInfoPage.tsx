import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { ChatBubble } from '../components/ChatBubble';
import { useOnboarding } from '../context/OnboardingContext';

type SubStep = 'aliases' | 'address' | 'contact';

export function PersonalInfoPage() {
  const [subStep, setSubStep] = useState<SubStep>('aliases');
  const [hasAliases, setHasAliases] = useState<boolean | null>(null);
  const [aliasInput, setAliasInput] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);

  // Address form
  const [street, setStreet] = useState('123 Main Street');
  const [city, setCity] = useState('Los Angeles');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('90001');
  const [addrStart, setAddrStart] = useState('Jan 2014');
  const [addrEnd, setAddrEnd] = useState('Present');

  // Contact form
  const [phone, setPhone] = useState('+1 (555) 555-5555');
  const [email, setEmail] = useState('lucas.menegazzo@bix-tech.com');

  const navigate = useNavigate();
  const { setPersonalInfo, setProgress, setCurrentStep } = useOnboarding();

  const handleAliasResponse = (answer: boolean) => {
    setHasAliases(answer);
    if (!answer) {
      setSubStep('address');
    }
  };

  const addAlias = () => {
    if (aliasInput.trim()) {
      setAliases((prev) => [...prev, aliasInput.trim()]);
      setAliasInput('');
    }
  };

  const handleAddressSubmit = () => {
    setSubStep('contact');
  };

  const handleSave = async () => {
    setPersonalInfo({
      email,
      phone,
      aliases,
      addresses: [
        {
          street,
          city,
          state,
          zip,
          startDate: addrStart,
          endDate: addrEnd,
        },
      ],
    });
    setProgress({ personalInfo: true });
    setCurrentStep(3);
    navigate('/onboarding/education');
  };

  const handleSkip = () => {
    setPersonalInfo({
      email: 'lucas.menegazzo@bix-tech.com',
      phone: '+1 (555) 555-5555',
      aliases: [],
      addresses: [
        {
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          startDate: 'Jan 2014',
          endDate: 'Present',
        },
      ],
    });
    setProgress({ personalInfo: true });
    setCurrentStep(3);
    navigate('/onboarding/education');
  };

  return (
    <OnboardingLayout subtitle="Building your comprehensive professional profile">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Personal Information</h2>
          <p className="text-sm text-gray-500 mb-6">
            Providing all your legal names or aliases (such as maiden names, nicknames, or former names) ensures a
            complete and accurate background check.
          </p>

          {/* Aliases sub-step */}
          {subStep === 'aliases' && (
            <>
              <ChatBubble>Do you have any other legal names or aliases to report?</ChatBubble>

              {hasAliases === true && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      placeholder="Enter alias name"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                    <button
                      onClick={addAlias}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                  {aliases.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {aliases.map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setSubStep('address')}
                    className="text-sm text-teal-600 font-medium hover:underline"
                  >
                    Done adding aliases →
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => navigate('/onboarding/identity')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAliasResponse(false)}
                    className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleAliasResponse(true)}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold"
                  >
                    Yes
                  </button>
                </div>
              </div>
              <p
                onClick={handleSkip}
                className="text-center text-xs text-gray-400 mt-4 cursor-pointer hover:text-teal-500"
              >
                Skip to Education
              </p>
            </>
          )}

          {/* Address sub-step */}
          {subStep === 'address' && (
            <>
              <ChatBubble>Please provide your current address and address history for the past 10 years.</ChatBubble>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="text"
                      value={addrStart}
                      onChange={(e) => setAddrStart(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="text"
                      value={addrEnd}
                      onChange={(e) => setAddrEnd(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setSubStep('aliases')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleAddressSubmit}
                  className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Contact sub-step */}
          {subStep === 'contact' && (
            <>
              <ChatBubble>Please confirm your contact information.</ChatBubble>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setSubStep('address')}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold"
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
