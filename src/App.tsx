import { useState, useCallback, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Toaster } from 'react-hot-toast';
import { WalletContextProvider } from './contexts/WalletContext';
import { WalletButton } from './components/WalletButton';
import { NetworkSelector } from './components/NetworkSelector';
import { IdlUploader } from './components/IdlUploader';
import { InstructionList } from './components/InstructionList';
import { InstructionForm } from './components/InstructionForm';
import { TransactionHistory } from './components/TransactionHistory';

import { RpcConfigModal } from './components/RpcConfigModal';
import {
  AnchorIdl,
  IdlInstruction,
  TransactionResult,
  RpcConfig,
} from './types';
import {
  NETWORK_OPTIONS,
  getRpcEndpoint,
  loadRpcConfig,
  saveRpcConfig,
} from './utils/solana';

function App() {
  const [selectedNetwork, setSelectedNetwork] = useState<
    WalletAdapterNetwork | 'localhost'
  >(WalletAdapterNetwork.Devnet);
  const [currentIdl, setCurrentIdl] = useState<AnchorIdl | null>(null);
  const [selectedInstruction, setSelectedInstruction] =
    useState<IdlInstruction | null>(null);
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);
  const [rpcConfig, setRpcConfig] = useState<RpcConfig>(loadRpcConfig());
  const [isRpcModalOpen, setIsRpcModalOpen] = useState(false);

  const networkEndpoint = useMemo(() => {
    return getRpcEndpoint(selectedNetwork, rpcConfig);
  }, [selectedNetwork, rpcConfig]);

  const handleIdlLoaded = useCallback((idl: AnchorIdl) => {
    setCurrentIdl(idl);
    setSelectedInstruction(null); // Reset selected instruction when new IDL is loaded
  }, []);

  const handleInstructionSelect = useCallback((instruction: IdlInstruction) => {
    setSelectedInstruction(instruction);
  }, []);

  const handleTransactionSuccess = useCallback((signature: string) => {
    const newTransaction: TransactionResult = {
      signature,
      confirmationStatus: 'confirmed',
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const handleNetworkChange = useCallback(
    (network: WalletAdapterNetwork | 'localhost') => {
      setSelectedNetwork(network);
      // Reset state when network changes
      setCurrentIdl(null);
      setSelectedInstruction(null);
      setTransactions([]);
    },
    []
  );

  const handleRpcConfigSave = useCallback((config: RpcConfig) => {
    setRpcConfig(config);
    saveRpcConfig(config);
  }, []);

  const openRpcModal = useCallback(() => {
    setIsRpcModalOpen(true);
  }, []);

  const closeRpcModal = useCallback(() => {
    setIsRpcModalOpen(false);
  }, []);

  return (
    <WalletContextProvider
      network={
        selectedNetwork === 'localhost'
          ? WalletAdapterNetwork.Devnet
          : (selectedNetwork as WalletAdapterNetwork)
      }
      endpoint={networkEndpoint}
    >
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 py-3">
              <div className="flex items-center space-x-6 flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  Solana Program Interface
                </h1>
                <div className="hidden md:block w-px h-8 bg-gray-300"></div>

                <div className="flex items-center space-x-4">
                  <NetworkSelector
                    selectedNetwork={selectedNetwork}
                    onNetworkChange={handleNetworkChange}
                  />
                  <button
                    onClick={openRpcModal}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150"
                    title="Configure RPC Endpoints"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">RPC Config</span>
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - IDL Upload and Instructions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Program Setup
                </h2>
                <IdlUploader
                  onIdlLoaded={handleIdlLoaded}
                  currentIdl={currentIdl}
                />
              </div>

              {currentIdl && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <InstructionList
                    idl={currentIdl}
                    onInstructionSelect={handleInstructionSelect}
                    selectedInstruction={selectedInstruction}
                  />
                </div>
              )}
            </div>

            {/* Middle Column - Instruction Form */}
            <div className="lg:col-span-1">
              {selectedInstruction && currentIdl ? (
                <InstructionForm
                  instruction={selectedInstruction}
                  idl={currentIdl}
                  onTransactionSuccess={handleTransactionSuccess}
                />
              ) : currentIdl ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">
                      Select an Instruction
                    </div>
                    <div className="text-sm">
                      Choose an instruction from the list to configure and
                      execute it
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">
                      Upload an IDL File
                    </div>
                    <div className="text-sm">
                      Upload an Anchor IDL file to start interacting with a
                      Solana program
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Transaction History */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <TransactionHistory
                  transactions={transactions}
                  network={
                    selectedNetwork === 'localhost'
                      ? 'localhost'
                      : NETWORK_OPTIONS[
                          selectedNetwork as keyof typeof NETWORK_OPTIONS
                        ]
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>
                Built with{' '}
                <a
                  href="https://www.anchor-lang.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-solana-600 hover:text-solana-700"
                >
                  Anchor Framework
                </a>{' '}
                and{' '}
                <a
                  href="https://solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-solana-600 hover:text-solana-700"
                >
                  Solana
                </a>
              </p>
              <p className="mt-2">
                Connect your wallet and upload an Anchor IDL file to interact
                with Solana programs
              </p>
            </div>
          </div>
        </main>

        <RpcConfigModal
          isOpen={isRpcModalOpen}
          onClose={closeRpcModal}
          rpcConfig={rpcConfig}
          onSave={handleRpcConfigSave}
        />
      </div>
    </WalletContextProvider>
  );
}

export default App;
