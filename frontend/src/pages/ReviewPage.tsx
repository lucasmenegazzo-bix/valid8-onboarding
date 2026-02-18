import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { useOnboarding } from '../context/OnboardingContext';
import { ShieldCheck, User, MapPin, GraduationCap, Briefcase, Check, PartyPopper } from 'lucide-react';
import { useState } from 'react';

export function ReviewPage() {
  const { idScan, idType, personalInfo, education, employment, setProgress } = useOnboarding();
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setProgress({ review: true });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <OnboardingLayout subtitle="Profile submitted successfully">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper size={40} className="text-teal-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Submitted!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your verified professional profile has been submitted successfully. We'll notify you once your profile is fully validated.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout subtitle="Review and submit your profile">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Review Your Profile</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please review all the information below before submitting your profile for verification.
          </p>

          {/* Identity */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-teal-500" />
              <h3 className="font-semibold text-gray-900">Identity</h3>
              <Check size={14} className="text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs">Full Name</span>
                <p className="font-medium text-gray-800">{idScan?.fullName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">ID Type</span>
                <p className="font-medium text-gray-800">{idType?.replace('_', ' ') || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">ID Number</span>
                <p className="font-medium text-gray-800">{idScan?.idNumber || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Birthdate</span>
                <p className="font-medium text-gray-800">{idScan?.birthdate || '—'}</p>
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-teal-500" />
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <Check size={14} className="text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="font-medium text-gray-800">{personalInfo?.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium text-gray-800">{personalInfo?.phone || '—'}</span>
              </div>
              {personalInfo?.addresses.map((addr, i) => (
                <div key={i} className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin size={12} className="text-teal-400" />
                    <span className="text-xs text-gray-400">Address</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-xs text-gray-400">
                    {addr.startDate} – {addr.endDate}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-teal-500" />
              <h3 className="font-semibold text-gray-900">Education</h3>
              <Check size={14} className="text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-medium text-gray-800">{edu.institution || 'No degree'}</p>
                    {edu.fieldOfStudy && <p className="text-gray-600">{edu.level} – {edu.fieldOfStudy}</p>}
                    {edu.graduationYear && <p className="text-xs text-gray-400">Class of {edu.graduationYear}</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No education entries</p>
              )}
            </div>
          </section>

          {/* Employment */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} className="text-teal-500" />
              <h3 className="font-semibold text-gray-900">Employment</h3>
              <Check size={14} className="text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
              {employment.length > 0 ? (
                employment.map((emp, i) => (
                  <div key={i}>
                    <p className="font-medium text-gray-800">{emp.employer}</p>
                    <p className="text-gray-600">{emp.title}</p>
                    <p className="text-xs text-gray-400">
                      {emp.startDate} – {emp.current ? 'Present' : emp.endDate}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No employment entries</p>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate('/onboarding/employment')}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Submit Profile
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
