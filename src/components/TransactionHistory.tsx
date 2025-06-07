import React from 'react';
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { TransactionResult } from '../types';
import { shortenAddress } from '../utils/solana';

interface TransactionHistoryProps {
  transactions: TransactionResult[];
  network: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  network,
}) => {
  const getExplorerUrl = (signature: string) => {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${signature}${cluster}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No transactions yet</div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transaction History ({transactions.length})
      </h3>

      {transactions.map((tx, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-mono text-sm text-gray-900">
                  {shortenAddress(tx.signature, 8)}
                </div>
                <div className="text-xs text-gray-500">
                  {tx.confirmationStatus && (
                    <span className="capitalize">{tx.confirmationStatus}</span>
                  )}
                  {tx.slot && <span className="ml-2">Slot: {tx.slot}</span>}
                </div>
              </div>
            </div>

            <a
              href={getExplorerUrl(tx.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-solana-600 hover:text-solana-700 text-sm"
            >
              <span>View</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>

          {tx.err && (
            <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              Error: {JSON.stringify(tx.err)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
