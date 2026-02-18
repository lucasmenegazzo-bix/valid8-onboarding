import { createContext, useContext, useState, ReactNode } from 'react';
import {
  OnboardingProgress,
  IdScanResult,
  PersonalInfo,
  EducationEntry,
  EmploymentEntry,
  IdType,
} from '../types';

interface OnboardingState {
  progress: OnboardingProgress;
  currentStep: number;
  idType: IdType | null;
  idScan: IdScanResult | null;
  personalInfo: PersonalInfo | null;
  education: EducationEntry[];
  employment: EmploymentEntry[];
  profilePanelOpen: boolean;
  setProgress: (p: Partial<OnboardingProgress>) => void;
  setCurrentStep: (step: number) => void;
  setIdType: (t: IdType) => void;
  setIdScan: (scan: IdScanResult) => void;
  setPersonalInfo: (info: PersonalInfo) => void;
  addEducation: (entry: EducationEntry) => void;
  addEmployment: (entry: EmploymentEntry) => void;
  setProfilePanelOpen: (open: boolean) => void;
  completionPercent: number;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgressState] = useState<OnboardingProgress>({
    identity: false,
    personalInfo: false,
    education: false,
    employment: false,
    review: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [idType, setIdType] = useState<IdType | null>(null);
  const [idScan, setIdScan] = useState<IdScanResult | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [employment, setEmployment] = useState<EmploymentEntry[]>([]);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  const setProgress = (p: Partial<OnboardingProgress>) => {
    setProgressState((prev) => ({ ...prev, ...p }));
  };

  const addEducation = (entry: EducationEntry) => {
    setEducation((prev) => [...prev, entry]);
  };

  const addEmployment = (entry: EmploymentEntry) => {
    setEmployment((prev) => [...prev, entry]);
  };

  const completionPercent = (() => {
    let done = 0;
    if (progress.identity) done++;
    if (progress.personalInfo) done++;
    if (progress.education) done++;
    if (progress.employment) done++;
    if (progress.review) done++;
    return Math.round((done / 5) * 100);
  })();

  return (
    <OnboardingContext.Provider
      value={{
        progress,
        currentStep,
        idType,
        idScan,
        personalInfo,
        education,
        employment,
        profilePanelOpen,
        setProgress,
        setCurrentStep,
        setIdType,
        setIdScan,
        setPersonalInfo,
        addEducation,
        addEmployment,
        setProfilePanelOpen,
        completionPercent,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
