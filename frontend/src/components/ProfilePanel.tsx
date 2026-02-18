import { X, ShieldCheck, MapPin, GraduationCap, Briefcase, User } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

export function ProfilePanel() {
  const { profilePanelOpen, setProfilePanelOpen, progress, idScan, idType, personalInfo, education, employment } =
    useOnboarding();

  if (!profilePanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setProfilePanelOpen(false)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="bg-teal-500 text-white px-5 py-3 text-sm font-medium flex items-center gap-2">
          <ShieldCheck size={16} />
          This is how employers and verifiers see your profile
        </div>

        <button
          onClick={() => setProfilePanelOpen(false)}
          className="absolute top-3 right-3 text-white hover:text-gray-200 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Name */}
          <h2 className="text-xl font-bold text-gray-900">{idScan?.fullName || 'Your Name'}</h2>

          {/* Identity badge */}
          {progress.identity && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <ShieldCheck size={12} /> Identity Verified
              </span>
              <span className="text-xs text-gray-500">via {idType?.replace('_', ' ')}</span>
            </div>
          )}

          {/* Avatar placeholder */}
          <div className="flex justify-center my-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={40} className="text-gray-300" />
            </div>
          </div>

          {/* Incomplete message or sections */}
          {!progress.personalInfo && !progress.education && !progress.employment && (
            <p className="text-sm text-gray-500 text-center">Complete the onboarding steps to fill your profile.</p>
          )}

          {/* Personal Info section */}
          {progress.personalInfo && personalInfo && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-sm">
                <User size={16} className="text-teal-500" />
                Personal Information
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-800">{personalInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-800">{personalInfo.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Address History */}
          {progress.personalInfo && personalInfo && personalInfo.addresses.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-sm">
                <MapPin size={16} className="text-teal-500" />
                Address History
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {personalInfo.addresses.map((addr, i) => (
                  <div key={i} className="text-sm border-l-2 border-teal-400 pl-3">
                    <p className="font-medium text-gray-800">{addr.street}</p>
                    <p className="text-gray-600">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {addr.startDate} – {addr.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {progress.education && education.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-sm">
                <GraduationCap size={16} className="text-teal-500" />
                Education
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="text-sm border-l-2 border-teal-400 pl-3">
                    <p className="font-medium text-gray-800">{edu.institution}</p>
                    <p className="text-gray-600">
                      {edu.level} – {edu.fieldOfStudy}
                    </p>
                    <p className="text-gray-400 text-xs">{edu.graduationYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employment */}
          {progress.employment && employment.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3 text-sm">
                <Briefcase size={16} className="text-teal-500" />
                Employment
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {employment.map((emp, i) => (
                  <div key={i} className="text-sm border-l-2 border-teal-400 pl-3">
                    <p className="font-medium text-gray-800">{emp.employer}</p>
                    <p className="text-gray-600">{emp.title}</p>
                    <p className="text-gray-400 text-xs">
                      {emp.startDate} – {emp.current ? 'Present' : emp.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
