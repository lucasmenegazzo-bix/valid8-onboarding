import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from '../components/Logo';
import { MfaModal } from '../components/MfaModal';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('lucasmenegazzo');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) setShowMfa(true);
  };

  const handleMfa = async (code: string) => {
    const ok = await verifyMfa(code);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-navy-800 border-b border-navy-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Logo variant="dark" size="md" />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#" className="text-teal-400 hover:text-teal-300 font-medium">Home</a>
            <a href="#" className="text-gray-300 hover:text-white">About</a>
            <a href="#" className="text-gray-300 hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Fingerprint image */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-[420px] h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-navy-800 via-purple-500/30 to-teal-400/40 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-900/80 to-transparent" />
              <div className="relative z-10 text-center">
                <div className="w-48 h-48 mx-auto mb-4 rounded-full border-4 border-teal-400/30 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-4 border-purple-400/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-teal-400/20 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-purple-400/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-teal-400/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login form */}
          <div className="flex-1 w-full max-w-md">
            <h1 className="text-3xl font-bold text-teal-500 mb-8 text-center">Member Login</h1>

            <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email/Username<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-colors text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password<span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-colors text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <a href="#" className="text-sm text-gray-600 hover:text-teal-500 underline">
                  Forgot password
                </a>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <a href="#" className="text-teal-500 hover:text-teal-600 font-medium">
                  Create Account
                </a>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-800 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <Logo variant="dark" size="sm" />
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white"><Facebook size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Twitter size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Instagram size={18} /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={18} /></a>
          </div>
        </div>
      </footer>

      {/* MFA Modal */}
      {showMfa && <MfaModal onSubmit={handleMfa} onClose={() => setShowMfa(false)} />}
    </div>
  );
}
