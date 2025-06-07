import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress } from '../utils/solana';
import { Badge } from './ui/badge';

export const WalletButton: React.FC = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <WalletMultiButton className="!bg-solana-600 hover:!bg-solana-700 !transition-colors" />
      {connected && publicKey && (
        <Badge
          variant="secondary"
          className="hidden md:flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono">
            {shortenAddress(publicKey.toBase58())}
          </span>
        </Badge>
      )}
    </div>
  );
};
