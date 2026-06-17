import { useState, useCallback, useRef } from 'react';

interface NFCState {
  supported: boolean;
  reading: boolean;
  error: string | null;
}

export function useNFC() {
  const [state, setState] = useState<NFCState>({
    supported: typeof window !== 'undefined' && 'NDEFReader' in window,
    reading: false,
    error: null,
  });
  const readerRef = useRef<any>(null);

  const read = useCallback(async (): Promise<string> => {
    if (!state.supported) throw new Error('NFC not supported');
    setState((s) => ({ ...s, reading: true, error: null }));
    return new Promise((resolve, reject) => {
      const reader = new (window as any).NDEFReader();
      readerRef.current = reader;
      reader.scan().then(() => {
        reader.onreading = ({ message }: any) => {
          const record = message.records[0];
          const text = new TextDecoder().decode(record.data);
          setState((s) => ({ ...s, reading: false }));
          resolve(text);
        };
        reader.onreadingerror = () => {
          setState((s) => ({ ...s, reading: false, error: 'NFC read error' }));
          reject(new Error('NFC read error'));
        };
      }).catch((err: Error) => {
        setState((s) => ({ ...s, reading: false, error: err.message }));
        reject(err);
      });
    });
  }, [state.supported]);

  const write = useCallback(async (data: string): Promise<void> => {
    if (!state.supported) throw new Error('NFC not supported');
    const writer = new (window as any).NDEFWriter();
    await writer.write({ records: [{ recordType: 'text', data }] });
  }, [state.supported]);

  const cancel = useCallback(() => {
    readerRef.current = null;
    setState((s) => ({ ...s, reading: false }));
  }, []);

  return { ...state, read, write, cancel };
}
