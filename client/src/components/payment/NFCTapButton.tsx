import { useState } from 'react';
import { useNFC } from '../../hooks/useNFC';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface NFCTapButtonProps {
  jobId: string;
  onSuccess: (challenge: string) => void;
  disabled?: boolean;
}

export default function NFCTapButton({ jobId, onSuccess, disabled }: NFCTapButtonProps) {
  const { supported, reading, error, read, cancel } = useNFC();
  const [showFallback, setShowFallback] = useState(false);
  const [code, setCode] = useState('');
  const [nfcError, setNfcError] = useState<string | null>(null);

  const handleNFCTap = async () => {
    setNfcError(null);
    try {
      const challenge = await read();
      onSuccess(challenge);
    } catch (err: any) {
      setNfcError(err.message);
    }
  };

  const handleFallback = () => {
    if (code.length === 6) {
      onSuccess(code);
      setShowFallback(false);
      setCode('');
    }
  };

  return (
    <div className="space-y-2">
      {supported ? (
        <Button
          onClick={reading ? cancel : handleNFCTap}
          disabled={disabled}
          loading={reading}
          className="w-full"
          size="lg"
        >
          {reading ? 'Scanning NFC… (tap to cancel)' : '📱 Tap to Release Payment'}
        </Button>
      ) : (
        <Button
          onClick={() => setShowFallback(true)}
          disabled={disabled}
          className="w-full"
          size="lg"
        >
          🔢 Enter Release Code
        </Button>
      )}
      {(nfcError || error) && (
        <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <span>{nfcError || error}</span>
          <button onClick={() => setShowFallback(true)} className="underline ml-2">
            Use code instead
          </button>
        </div>
      )}
      <Modal open={showFallback} onClose={() => setShowFallback(false)} title="Enter Release Code">
        <p className="text-sm text-gray-600 mb-3">
          Ask the worker to show you the 6-digit code on their screen.
        </p>
        <input
          className="w-full text-center text-3xl tracking-widest font-mono border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-campus-primary"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          autoFocus
        />
        <Button onClick={handleFallback} disabled={code.length !== 6} className="w-full mt-4">
          Confirm Release
        </Button>
      </Modal>
    </div>
  );
}
