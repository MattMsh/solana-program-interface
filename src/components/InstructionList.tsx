import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { IdlInstruction, AnchorIdl } from '../types';
import { parseIdlType } from '../utils/solana';

interface InstructionListProps {
  idl: AnchorIdl;
  onInstructionSelect: (instruction: IdlInstruction) => void;
  selectedInstruction?: IdlInstruction | null;
}

export const InstructionList: React.FC<InstructionListProps> = ({
  idl,
  onInstructionSelect,
  selectedInstruction,
}) => {
  const [expandedInstructions, setExpandedInstructions] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (instructionName: string) => {
    const newExpanded = new Set(expandedInstructions);
    if (newExpanded.has(instructionName)) {
      newExpanded.delete(instructionName);
    } else {
      newExpanded.add(instructionName);
    }
    setExpandedInstructions(newExpanded);
  };

  if (!idl.instructions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No instructions found in the IDL
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Available Instructions ({idl.instructions.length})
      </h3>

      {idl.instructions.map((instruction) => {
        const isExpanded = expandedInstructions.has(instruction.name);
        const isSelected = selectedInstruction?.name === instruction.name;

        return (
          <div
            key={instruction.name}
            className={`border rounded-lg transition-colors ${
              isSelected
                ? 'border-solana-500 bg-solana-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleExpanded(instruction.name)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {instruction.name}
                    </h4>
                    <div className="text-sm text-gray-500">
                      {instruction.accounts.length} accounts,{' '}
                      {instruction.args.length} arguments
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onInstructionSelect(instruction)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${
                      isSelected
                        ? 'bg-solana-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Select</span>
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Accounts */}
                  {instruction.accounts.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Accounts:
                      </h5>
                      <div className="space-y-2">
                        {instruction.accounts.map((account, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {account.name}
                              </span>
                              <div className="flex space-x-2 text-xs">
                                {account.writable && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Writable
                                  </span>
                                )}
                                {account.signer && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                    Signer
                                  </span>
                                )}
                                {account.optional && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    Optional
                                  </span>
                                )}
                              </div>
                            </div>
                            {account.address && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                Fixed: {account.address}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Arguments */}
                  {instruction.args.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Arguments:
                      </h5>
                      <div className="space-y-2">
                        {instruction.args.map((arg, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {arg.name}
                              </span>
                              <span className="text-xs text-gray-600 font-mono">
                                {parseIdlType(arg.type)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discriminator */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Discriminator:
                    </h5>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="text-xs font-mono text-gray-600">
                        [{instruction.discriminator.join(', ')}]
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
