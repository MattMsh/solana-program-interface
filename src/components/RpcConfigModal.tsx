import React, { useState } from 'react';
import { RpcConfig } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';

interface RpcConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rpcConfig: RpcConfig;
  onSave: (config: RpcConfig) => void;
}

const DEFAULT_RPCS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localhost: 'http://127.0.0.1:8899',
};

const POPULAR_RPCS = {
  mainnet: [
    { name: 'Solana (Public)', url: 'https://api.mainnet-beta.solana.com' },
    { name: 'Helius', url: 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY' },
    {
      name: 'QuickNode',
      url: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/',
    },
    {
      name: 'Alchemy',
      url: 'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    },
    { name: 'GetBlock', url: 'https://sol.getblock.io/YOUR_API_KEY/mainnet/' },
  ],
  devnet: [
    { name: 'Solana (Public)', url: 'https://api.devnet.solana.com' },
    { name: 'Helius', url: 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY' },
    {
      name: 'QuickNode',
      url: 'https://YOUR_ENDPOINT.solana-devnet.quiknode.pro/YOUR_TOKEN/',
    },
  ],
  testnet: [{ name: 'Solana (Public)', url: 'https://api.testnet.solana.com' }],
};

export const RpcConfigModal: React.FC<RpcConfigModalProps> = ({
  isOpen,
  onClose,
  rpcConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<RpcConfig>(rpcConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    setConfig({});
  };

  const updateRpc = (network: keyof RpcConfig, url: string) => {
    setConfig((prev) => ({
      ...prev,
      [network]: url || undefined,
    }));
  };

  const getCurrentRpc = (network: keyof RpcConfig) => {
    return config[network] || DEFAULT_RPCS[network];
  };

  const renderNetworkConfig = (network: keyof RpcConfig, label: string) => {
    const popularRpcs =
      POPULAR_RPCS[network as keyof typeof POPULAR_RPCS] || [];

    return (
      <div key={network} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
          {config[network] && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateRpc(network, '')}
              className="text-xs text-red-600 hover:text-red-700 h-auto p-1"
            >
              Reset to default
            </Button>
          )}
        </div>

        <Input
          type="url"
          value={getCurrentRpc(network)}
          onChange={(e) => updateRpc(network, e.target.value)}
          placeholder={`Enter ${label} RPC URL`}
          className="text-sm"
        />

        {popularRpcs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Popular providers:</p>
            <div className="grid gap-2">
              {popularRpcs.map((rpc, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => updateRpc(network, rpc.url)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium text-gray-800">
                      {rpc.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {rpc.url}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RPC Configuration</DialogTitle>
          <DialogDescription>
            Configure custom RPC endpoints for each network. This is especially
            useful for mainnet to avoid rate limits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <div className="flex items-start">
                <div className="text-amber-600 mr-3">⚠️</div>
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important Notes:</p>
                  <ul className="mt-2 text-amber-700 space-y-1">
                    <li>
                      • Custom RPC endpoints can help avoid rate limiting on
                      mainnet
                    </li>
                    <li>• Some providers require API keys in the URL</li>
                    <li>• Test your endpoints before executing transactions</li>
                    <li>• Settings are saved locally in your browser</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {renderNetworkConfig('mainnet', 'Mainnet Beta')}
          {renderNetworkConfig('devnet', 'Devnet')}
          {renderNetworkConfig('testnet', 'Testnet')}
          {renderNetworkConfig('localhost', 'Localhost')}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800"
          >
            Reset All to Defaults
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
