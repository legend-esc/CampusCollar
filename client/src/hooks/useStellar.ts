import { useState, useCallback } from 'react';

interface StellarState {
  pubkey: string | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

declare global {
  interface Window {
    freighter?: {
      getPublicKey(): Promise<string>;
      isConnected(): Promise<boolean>;
      signTransaction(xdr: string, opts?: { network: string }): Promise<string>;
    };
    albedo?: {
      publicKey(opts?: object): Promise<{ pubkey: string }>;
      tx(opts: { xdr: string; network: string }): Promise<{ signed_envelope_xdr: string }>;
    };
  }
}

export function useStellar() {
  const [state, setState] = useState<StellarState>({
    pubkey: null,
    balance: null,
    connected: false,
    connecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      let pubkey: string;

      if (window.freighter) {
        pubkey = await window.freighter.getPublicKey();
      } else if (window.albedo) {
        const res = await window.albedo.publicKey();
        pubkey = res.pubkey;
      } else {
        throw new Error('No Stellar wallet found. Install Freighter or Albedo.');
      }

      // Fetch balance from our backend
      const res = await fetch(`/api/stellar/balance/${pubkey}`);
      const data = res.ok ? await res.json() : null;

      setState({
        pubkey,
        balance: data?.balance ?? null,
        connected: true,
        connecting: false,
        error: null,
      });
    } catch (err: any) {
      setState((s) => ({ ...s, connecting: false, error: err.message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ pubkey: null, balance: null, connected: false, connecting: false, error: null });
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (window.freighter) {
      return window.freighter.signTransaction(xdr, { network: 'TESTNET' });
    }
    if (window.albedo) {
      const res = await window.albedo.tx({ xdr, network: 'testnet' });
      return res.signed_envelope_xdr;
    }
    throw new Error('No wallet connected');
  }, []);

  return { ...state, connect, disconnect, signTransaction };
}
