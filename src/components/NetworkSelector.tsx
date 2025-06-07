import React, { useState, useRef, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface NetworkSelectorProps {
  selectedNetwork: WalletAdapterNetwork | 'localhost';
  onNetworkChange: (network: WalletAdapterNetwork | 'localhost') => void;
}

const NETWORK_OPTIONS = [
  {
    value: WalletAdapterNetwork.Mainnet,
    label: 'Mainnet Beta',
    description: 'Production network',
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  {
    value: WalletAdapterNetwork.Devnet,
    label: 'Devnet',
    description: 'Development network',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    value: WalletAdapterNetwork.Testnet,
    label: 'Testnet',
    description: 'Testing network',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  {
    value: 'localhost' as const,
    label: 'Localhost',
    description: 'Local development',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
];

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = NETWORK_OPTIONS.find(
    (option) => option.value === selectedNetwork
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSelect = (network: WalletAdapterNetwork | 'localhost') => {
    onNetworkChange(network);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${
            selectedOption
              ? `${selectedOption.lightColor} ${selectedOption.borderColor}`
              : 'bg-gray-100 border-gray-200'
          }
          ${isOpen ? 'shadow-lg' : 'shadow-sm'}
        `}
      >
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              selectedOption?.color || 'bg-gray-400'
            } shadow-sm`}
          ></div>
          <div className="flex flex-col items-start">
            <span
              className={`text-sm font-semibold ${
                selectedOption?.textColor || 'text-gray-700'
              }`}
            >
              {selectedOption?.label || 'Select Network'}
            </span>
            <span className="text-xs text-gray-500">
              {selectedOption?.description || 'Choose network'}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            {NETWORK_OPTIONS.map((option) => {
              const isSelected = option.value === selectedNetwork;

              return (
                <button
                  key={option.value}
                  onClick={() => handleNetworkSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150
                    hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                    ${isSelected ? `${option.lightColor}` : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {/* Network Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full ${option.color} shadow-sm`}
                    ></div>

                    {/* Network Info */}
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? option.textColor : 'text-gray-900'
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <CheckIcon className={`w-5 h-5 ${option.textColor}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
