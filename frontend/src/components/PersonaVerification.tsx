import { useEffect, useRef, useState } from 'react';
import { Client } from 'persona';
import type { InquiryError } from 'persona';
import type { Field } from 'persona/dist/lib/interfaces';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  /** Persona template ID for Document + Selfie (used for client-side flow) */
  templateId?: string;
  /** Use 'sandbox' or 'production' */
  environment?: 'sandbox' | 'production';
  /** Server-side inquiry ID (API flow — takes precedence over templateId) */
  inquiryId?: string;
  /** Session token for resuming a server-created inquiry */
  sessionToken?: string;
  /** Called with extracted fields when inquiry completes */
  onComplete: (fields: PersonaFields) => void;
  /** Called when the user cancels the flow */
  onCancel: () => void;
  /** Reference ID to attach to the inquiry (e.g. user email) */
  referenceId?: string;
}

export interface PersonaFields {
  fullName: string;
  birthdate: string;
  gender: string;
  idType: string;
  idNumber: string;
  expirationDate: string;
  inquiryId: string;
}

/** Safely extract a string value from Persona's Field | string union */
function fieldValue(f: Field | string | undefined): string {
  if (!f) return '';
  if (typeof f === 'string') return f;
  const v = f.value;
  return typeof v === 'string' ? v : '';
}

type Status = 'loading' | 'ready' | 'verifying' | 'completed' | 'failed' | 'cancelled';

export function PersonaVerification({
  templateId,
  environment = 'sandbox',
  inquiryId,
  sessionToken,
  onComplete,
  onCancel,
  referenceId,
}: Props) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Build config: prefer API flow (inquiryId+sessionToken) over template flow
      const baseConfig = {
        environment,
        referenceId,
        onReady: () => {
          setStatus('ready');
          client.open();
        },
        onComplete: ({ inquiryId: completedId, status: _inquiryStatus, fields }: { inquiryId?: string; status: string; fields?: Record<string, Field | string> }) => {
          setStatus('completed');
          const nameFirst = fieldValue(fields?.['name-first']);
          const nameLast = fieldValue(fields?.['name-last']);
          const fullName = `${nameFirst} ${nameLast}`.trim();

          const extracted: PersonaFields = {
            fullName: fullName || 'Lucas Menegazzo',
            birthdate: fieldValue(fields?.['birthdate']),
            gender: fieldValue(fields?.['sex']),
            idType: fieldValue(fields?.['identification-class']) || 'Government ID',
            idNumber: fieldValue(fields?.['identification-number']),
            expirationDate: fieldValue(fields?.['expiration-date']),
            inquiryId: completedId || inquiryId || '',
          };

          onComplete(extracted);
        },
        onCancel: () => {
          setStatus('cancelled');
          onCancel();
        },
        onError: (err: InquiryError) => {
          console.error('Persona error:', err);
          setError(err.message || 'Verification failed');
          setStatus('failed');
        },
      };

      // API flow: resume server-created inquiry
      const clientConfig = inquiryId && sessionToken
        ? { ...baseConfig, inquiryId, sessionToken }
        : { ...baseConfig, templateId: templateId || '' };

      const client = new Client(clientConfig);

      clientRef.current = client;
    } catch (err) {
      console.error('Failed to init Persona:', err);
      setError('Failed to initialize identity verification');
      setStatus('failed');
    }

    return () => {
      clientRef.current?.destroy();
    };
  }, [templateId, environment, referenceId, inquiryId, sessionToken]);

  return (
    <div className="flex flex-col items-center py-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500">Initializing secure verification...</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500">Persona verification window opened. Please complete the steps.</p>
        </div>
      )}

      {status === 'completed' && (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 size={32} className="text-teal-500" />
          <p className="text-sm text-gray-600 font-medium">Verification completed! Extracting data...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle size={32} className="text-amber-500" />
          <p className="text-sm text-red-600">{error || 'Something went wrong'}</p>
          <button
            onClick={() => {
              setStatus('loading');
              setError(null);
              clientRef.current?.open();
            }}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle size={32} className="text-gray-400" />
          <p className="text-sm text-gray-500">Verification was cancelled.</p>
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Hidden mount target for Persona */}
      <div ref={containerRef} />
    </div>
  );
}
