import { Check, Lock } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  { label: 'Identity', num: 1 },
  { label: 'Personal Info', num: 2 },
  { label: 'Education', num: 3 },
  { label: 'Employment', num: 4 },
  { label: 'Review', num: 5 },
];

interface Props {
  currentStep: number;
  completedSteps: {
    identity: boolean;
    personalInfo: boolean;
    education: boolean;
    employment: boolean;
    review: boolean;
  };
}

export function OnboardingStepper({ currentStep, completedSteps }: Props) {
  const stepKeys = ['identity', 'personalInfo', 'education', 'employment', 'review'] as const;

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-6">
      {STEPS.map((step, i) => {
        const key = stepKeys[i];
        const isCompleted = completedSteps[key];
        const isCurrent = step.num === currentStep;
        const isLocked = !isCurrent && !isCompleted && step.num > currentStep;

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                  isCompleted && 'bg-teal-500 border-teal-500 text-white',
                  isCurrent && !isCompleted && 'border-teal-500 text-teal-500 bg-white',
                  isLocked && 'border-gray-300 text-gray-400 bg-white'
                )}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : isLocked ? (
                  <Lock size={14} />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={clsx(
                  'text-xs mt-1.5 font-medium whitespace-nowrap',
                  isCurrent && 'text-teal-600',
                  isCompleted && 'text-gray-500',
                  isLocked && 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 mt-[-14px]',
                  isCompleted ? 'bg-teal-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
