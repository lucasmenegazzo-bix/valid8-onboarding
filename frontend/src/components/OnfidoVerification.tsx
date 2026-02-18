import { useEffect, useRef, useState, useCallback } from 'react';
import { Onfido } from 'onfido-sdk-ui';
import type { Handle } from 'onfido-sdk-ui';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  /** SDK token generated server-side via POST /api/kyc/onfido/sdk-token */
  sdkToken: string | null;
  /** Called when document + selfie capture is complete */
  onComplete: (data: OnfidoResult) => void;
  /** Called when user exits / cancels */
  onCancel: () => void;
}

export interface OnfidoResult {
  /** The completion payload from the SDK (capture IDs, etc.) */
  captureData: Record<string, unknown>;
}

type Status = 'loading-token' | 'initializing' | 'active' | 'completed' | 'failed' | 'cancelled';

export function OnfidoVerification({ sdkToken, onComplete, onCancel }: Props) {
  const [status, setStatus] = useState<Status>(sdkToken ? 'initializing' : 'loading-token');
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<Handle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const teardown = useCallback(async () => {
    if (handleRef.current) {
      try {
        await handleRef.current.tearDown();
      } catch {
        // teardown may fail if already torn down
      }
      handleRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sdkToken) {
      setStatus('loading-token');
      return;
    }
    if (initRef.current) return;
    initRef.current = true;

    setStatus('initializing');

    // Small delay to ensure the DOM container is mounted
    const timer = setTimeout(() => {
      try {
        const handle = Onfido.init({
          token: sdkToken,
          containerId: 'onfido-mount',
          steps: [
            {
              type: 'document',
              options: {
                documentTypes: {
                  passport: true,
                  driving_licence: true,
                  national_identity_card: true,
                },
              },
            },
            {
              type: 'face',
              options: {
                requestedVariant: 'photo',
              },
            },
          ],
          onComplete: (data) => {
            setStatus('completed');
            onComplete({ captureData: data });
          },
          onError: (err) => {
            console.error('Onfido error:', err);
            setError(err.message || 'Verification failed');
            setStatus('failed');
          },
          onUserExit: () => {
            setStatus('cancelled');
            onCancel();
          },
        });

        handleRef.current = handle;
        setStatus('active');
      } catch (err) {
        console.error('Failed to init Onfido:', err);
        setError('Failed to initialize identity verification');
        setStatus('failed');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      teardown();
    };
  }, [sdkToken, onComplete, onCancel, teardown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  return (
    <div className="flex flex-col items-center py-4">
      {status === 'loading-token' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={32} className="text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500">Generating secure token...</p>
        </div>
      )}

      {status === 'initializing' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={32} className="text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500">Initializing Onfido verification...</p>
        </div>
      )}

      {/* Onfido mounts its UI into this div */}
      <div
        id="onfido-mount"
        ref={containerRef}
        className={`w-full min-h-[420px] ${status === 'active' ? '' : 'hidden'}`}
      />

      {status === 'completed' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <CheckCircle2 size={32} className="text-teal-500" />
          <p className="text-sm text-gray-600 font-medium">Document & selfie captured! Processing...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <AlertTriangle size={32} className="text-amber-500" />
          <p className="text-sm text-red-600">{error || 'Something went wrong'}</p>
          <button
            onClick={() => {
              initRef.current = false;
              setStatus('initializing');
              setError(null);
            }}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex flex-col items-center gap-3 py-8">
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
    </div>
  );
}
