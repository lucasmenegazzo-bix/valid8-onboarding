import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, CreditCard, IdCard, Info, ShieldCheck, ChevronLeft, Lock, Eye, ScanFace, FileCheck2, Camera, Loader2, Fingerprint } from 'lucide-react';
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { ChatBubble } from '../components/ChatBubble';
import { PersonaVerification, PersonaFields } from '../components/PersonaVerification';
import { OnfidoVerification, OnfidoResult } from '../components/OnfidoVerification';
import { useOnboarding } from '../context/OnboardingContext';
import { IdType, IdentitySubStep, KycProvider } from '../types';

/* ── Persona config ─────────────────────────────────────────────── */
const PERSONA_TEMPLATE_ID = import.meta.env.VITE_PERSONA_TEMPLATE_ID ?? 'itmpl_your_template_id';
const PERSONA_ENV = (import.meta.env.VITE_PERSONA_ENV as 'sandbox' | 'production') ?? 'sandbox';

/* ── KYC provider choices ───────────────────────────────────────── */
const KYC_PROVIDERS: { id: KycProvider; name: string; logo: string; tagline: string }[] = [
  { id: 'persona', name: 'Persona', logo: '🟣', tagline: 'Document + Selfie verification' },
  { id: 'au10tix', name: 'Au10tix', logo: '🔵', tagline: 'AI-powered identity verification' },
  { id: 'onfido', name: 'Onfido', logo: '🟢', tagline: 'Real-time document & biometric checks' },
  { id: 'idme', name: 'ID.me', logo: '🟡', tagline: 'Government-grade identity proofing' },
];

/* ── ID type buttons ────────────────────────────────────────────── */
const ID_OPTIONS: { type: IdType; label: string; icon: React.ElementType }[] = [
  { type: 'us_passport', label: 'U.S. Passport', icon: Globe },
  { type: 'drivers_license', label: "Driver's License", icon: CreditCard },
  { type: 'real_id', label: 'Real ID', icon: IdCard },
  { type: 'foreign_passport', label: 'Foreign Passport', icon: Globe },
  { type: 'permanent_resident', label: 'Permanent Resident Card', icon: CreditCard },
];

/* ── Mock fallback data (used when Persona returns partial data) ── */
const MOCK_SCAN = {
  fullName: 'Lucas Menegazzo',
  birthdate: '01/15/1990',
  gender: 'Male',
  idType: 'U.S. Passport',
  idNumber: 'X12345678',
  expirationDate: '01/15/2030',
};

export function IdentityPage() {
  const [subStep, setSubStep] = useState<IdentitySubStep>('provider-select');
  const [provider, setProvider] = useState<KycProvider | null>(null);
  const [selectedId, setSelectedId] = useState<IdType | null>(null);
  const [scanResult, setScanResult] = useState(MOCK_SCAN);
  const [onfidoSdkToken, setOnfidoSdkToken] = useState<string | null>(null);

  /* API-based Persona flow state */
  const [personaInquiryId, setPersonaInquiryId] = useState<string | null>(null);
  const [personaSessionToken, setPersonaSessionToken] = useState<string | null>(null);
  const [creatingInquiry, setCreatingInquiry] = useState(false);

  const navigate = useNavigate();
  const { setIdType, setIdScan, setProgress, setCurrentStep } = useOnboarding();

  /* ── Provider selection ── */
  const handleProviderSelect = (p: KycProvider) => {
    setProvider(p);
  };

  const handleProviderContinue = () => {
    if (!provider) return;
    setSubStep('select-id');
  };

  /* ── ID type selection ── */
  const handleSelectId = (type: IdType) => {
    setSelectedId(type);
    setIdType(type);
    if (provider === 'persona') {
      setSubStep('verify-intro');
    } else if (provider === 'onfido') {
      setSubStep('verify-intro');
    } else {
      // For other providers: show review with mock data
      setSubStep('review');
    }
  };

  /* ── Begin Persona verification via API ── */
  const handleBeginPersonaVerification = async () => {
    setCreatingInquiry(true);
    try {
      const res = await fetch('/api/kyc/persona/create-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_id: 'lucas.menegazzo@bix-tech.com' }),
      });
      const data = await res.json();
      if (data.inquiry_id && data.session_token) {
        setPersonaInquiryId(data.inquiry_id);
        setPersonaSessionToken(data.session_token);
      }
      // Either way, move to verification step (component handles both flows)
      setSubStep('verification');
    } catch (err) {
      console.error('Failed to create Persona inquiry:', err);
      // Fallback to template-based flow
      setSubStep('verification');
    } finally {
      setCreatingInquiry(false);
    }
  };

  /* ── Begin Onfido verification via API ── */
  const handleBeginOnfidoVerification = async () => {
    setCreatingInquiry(true);
    try {
      const res = await fetch('/api/kyc/onfido/sdk-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: 'Lucas', last_name: 'Menegazzo' }),
      });
      const data = await res.json();
      setOnfidoSdkToken(data.sdk_token);
      setSubStep('verification');
    } catch (err) {
      console.error('Failed to get Onfido token:', err);
      setSubStep('verification');
    } finally {
      setCreatingInquiry(false);
    }
  };

  /* ── Persona callbacks ── */
  const handlePersonaComplete = (fields: PersonaFields) => {
    // Merge Persona-extracted data with fallbacks
    setScanResult({
      fullName: fields.fullName || MOCK_SCAN.fullName,
      birthdate: fields.birthdate || MOCK_SCAN.birthdate,
      gender: fields.gender || MOCK_SCAN.gender,
      idType: fields.idType || MOCK_SCAN.idType,
      idNumber: fields.idNumber || MOCK_SCAN.idNumber,
      expirationDate: fields.expirationDate || MOCK_SCAN.expirationDate,
    });
    setSubStep('review');
  };

  const handlePersonaCancel = () => {
    setPersonaInquiryId(null);
    setPersonaSessionToken(null);
    setSubStep('verify-intro');
  };

  /* ── Onfido callbacks ── */
  const handleOnfidoComplete = (_result: OnfidoResult) => {
    // Onfido doesn't return OCR fields client-side — extraction happens
    // server-side via check creation.  Use mock data for now; in production
    // you'd poll /api/kyc/onfido/check/:id for extracted fields.
    setScanResult(MOCK_SCAN);
    setSubStep('review');
  };

  const handleOnfidoCancel = () => {
    setOnfidoSdkToken(null);
    setSubStep('verify-intro');
  };

  /* ── Review actions ── */
  const handleContinue = () => {
    setIdScan(scanResult);
    setProgress({ identity: true });
    setCurrentStep(2);
    navigate('/onboarding/personal-info');
  };

  const handleRedoScan = () => {
    if (provider === 'persona') {
      setPersonaInquiryId(null);
      setPersonaSessionToken(null);
      setSubStep('verify-intro');
    } else if (provider === 'onfido') {
      setOnfidoSdkToken(null);
      setSubStep('verify-intro');
    } else {
      setSubStep('select-id');
    }
  };

  const handleUseDifferentId = () => {
    setSelectedId(null);
    setSubStep('select-id');
  };

  return (
    <OnboardingLayout subtitle="Secure identity verification to protect your information">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Identity Verification</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <Info size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Secure verification using your government-issued ID</p>

          {/* ──────────────────────────────────────────────────────
               Step 0 — Provider Selection  (internal only)
             ────────────────────────────────────────────────────── */}
          {subStep === 'provider-select' && (
            <>
              <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Eye size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Internal only</span> — This provider selection screen is not visible
                  to end-users. The selected KYC provider will be applied behind the scenes.
                </p>
              </div>

              <ChatBubble>Select the KYC verification provider for this onboarding flow.</ChatBubble>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {KYC_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSelect(p.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 text-left transition-all ${
                      provider === p.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{p.logo}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>

              {provider && (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-teal-600" />
                    <span className="text-xs font-semibold text-teal-700">
                      {provider === 'persona' && 'Persona — Document + Selfie flow will be used'}
                      {provider === 'au10tix' && 'Au10tix — Not yet integrated (mock data will be used)'}
                      {provider === 'onfido' && 'Onfido — Document + Selfie flow will be used'}
                      {provider === 'idme' && 'ID.me — Not yet integrated (mock data will be used)'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => navigate('/onboarding/welcome')}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={handleProviderContinue}
                  disabled={!provider}
                  className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────
               Step 1 — Select ID type
             ────────────────────────────────────────────────────── */}
          {subStep === 'select-id' && (
            <>
              <ChatBubble>
                Hi Lucas Menegazzo, let's verify your identity. Please select the type of government-issued ID you'll be
                using below.
              </ChatBubble>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {ID_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleSelectId(opt.type)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      selectedId === opt.type
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-teal-200 text-teal-600 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <opt.icon size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setSubStep('provider-select')}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock size={12} />
                  256-bit encrypted
                </p>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────
               Step 1b — Verify Intro (pre-verification screen)
             ────────────────────────────────────────────────────── */}
          {subStep === 'verify-intro' && (
            <>
              <ChatBubble>
                Great choice! We'll now securely verify your identity using{' '}
                {provider === 'persona' ? 'Persona' : provider === 'onfido' ? 'Onfido' : 'our verification partner'}.
                Here's what to expect.
              </ChatBubble>

              {/* Hero card */}
              <div className="mt-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                  <Fingerprint size={32} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Identity Verification</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  We use bank-grade encryption to verify your government-issued ID. Your data is processed securely and
                  never stored unencrypted.
                </p>

                {/* Steps preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <FileCheck2 size={20} className="text-teal-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">1. Scan Document</p>
                    <p className="text-xs text-gray-400">Front & back of your ID</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <ScanFace size={20} className="text-teal-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">2. Take a Selfie</p>
                    <p className="text-xs text-gray-400">Quick liveness check</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} className="text-teal-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">3. Get Verified</p>
                    <p className="text-xs text-gray-400">Instant AI-powered review</p>
                  </div>
                </div>

                {/* Begin verification button */}
                <button
                  onClick={provider === 'persona' ? handleBeginPersonaVerification : handleBeginOnfidoVerification}
                  disabled={creatingInquiry}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
                >
                  {creatingInquiry ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Preparing verification…
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Begin Secure Verification
                    </>
                  )}
                </button>
              </div>

              {/* Security badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock size={12} /> 256-bit encrypted
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <ShieldCheck size={12} /> SOC 2 compliant
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye size={12} /> GDPR ready
                </span>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setSubStep('select-id')}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Change ID Type
                </button>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────
               Step 2 — Persona Document + Selfie verification
             ────────────────────────────────────────────────────── */}
          {subStep === 'verification' && provider === 'persona' && (
            <>
              <ChatBubble>
                We're launching Persona's secure verification. You'll be asked to scan your document and take a selfie.
              </ChatBubble>
              <PersonaVerification
                templateId={PERSONA_TEMPLATE_ID}
                environment={PERSONA_ENV}
                inquiryId={personaInquiryId ?? undefined}
                sessionToken={personaSessionToken ?? undefined}
                referenceId="lucas.menegazzo@bix-tech.com"
                onComplete={handlePersonaComplete}
                onCancel={handlePersonaCancel}
              />
              <div className="flex justify-start mt-4">
                <button
                  onClick={() => {
                    setPersonaInquiryId(null);
                    setPersonaSessionToken(null);
                    setSubStep('verify-intro');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────
               Step 2b — Onfido Document + Selfie verification
             ────────────────────────────────────────────────────── */}
          {subStep === 'verification' && provider === 'onfido' && (
            <>
              <ChatBubble>
                We're launching Onfido's secure verification. You'll be asked to upload your document and take a selfie.
              </ChatBubble>
              <OnfidoVerification
                sdkToken={onfidoSdkToken}
                onComplete={handleOnfidoComplete}
                onCancel={handleOnfidoCancel}
              />
              <div className="flex justify-start mt-4">
                <button
                  onClick={() => {
                    setOnfidoSdkToken(null);
                    setSubStep('verify-intro');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────
               Step 3 — Review extracted data
             ────────────────────────────────────────────────────── */}
          {subStep === 'review' && (
            <>
              <ChatBubble>
                We've pulled the details from your ID. Please review them carefully, and if everything looks correct,
                click Continue to confirm your identity and finish building your profile.
              </ChatBubble>

              <div className="mt-6 border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{scanResult.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Birthdate</p>
                    <p className="text-sm font-semibold text-teal-600">{scanResult.birthdate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                    <p className="text-sm font-semibold text-gray-900">{scanResult.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Type of ID</p>
                    <p className="text-sm font-semibold text-gray-900">{scanResult.idType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">ID Number</p>
                    <p className="text-sm font-semibold text-gray-900">{scanResult.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Expiration Date</p>
                    <p className="text-sm font-semibold text-teal-600">{scanResult.expirationDate}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleRedoScan}
                    className="px-4 py-2 border border-teal-300 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
                  >
                    Redo Scan
                  </button>
                  <button
                    onClick={handleUseDifferentId}
                    className="px-4 py-2 border border-teal-300 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
                  >
                    Use Different ID
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handleUseDifferentId}
                  className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
