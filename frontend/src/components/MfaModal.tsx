import { useState, useRef, KeyboardEvent } from 'react';
import { X, KeyRound } from 'lucide-react';

interface Props {
  onSubmit: (code: string) => void;
  onClose: () => void;
}

export function MfaModal({ onSubmit, onClose }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center mb-5">
            <KeyRound size={28} className="text-teal-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-1">Multi-factor authentication challenge</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please enter the 6-digit code that you have in your authenticator app.
          </p>

          {/* Digit inputs */}
          <div className="flex items-center gap-2 mb-8">
            {digits.map((digit, i) => (
              <div key={i} className="flex items-center">
                <input
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
                {i === 2 && <span className="text-gray-400 text-2xl mx-1">·</span>}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={digits.some((d) => !d)}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
