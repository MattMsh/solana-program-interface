import React from 'react';
import { AnchorIdl } from '../types';

const BASIC_EXAMPLE_IDL: AnchorIdl = {
  address: '6khKp4BeJpCjBY1Eh39ybiqbfRnrn2UzWeUARjQLXYRC',
  metadata: {
    name: 'example',
    version: '0.1.0',
    spec: '0.1.0',
    description:
      'Example Anchor program for testing the Solana Program Interface',
  },
  instructions: [
    {
      name: 'increment',
      discriminator: [11, 18, 104, 9, 104, 174, 59, 33],
      accounts: [{ name: 'counter', writable: true }],
      args: [],
    },
    {
      name: 'initialize',
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        { name: 'payer', writable: true, signer: true },
        { name: 'counter', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [],
    },
  ],
  accounts: [
    { name: 'Counter', discriminator: [255, 176, 4, 245, 188, 253, 124, 25] },
  ],
  types: [
    {
      name: 'Counter',
      type: {
        kind: 'struct' as const,
        fields: [{ name: 'count', type: 'u64' }],
      },
    },
  ],
};

const PDA_EXAMPLE_IDL: AnchorIdl = {
  address: 'DemoProgram1111111111111111111111111111111',
  metadata: {
    name: 'demo_program',
    version: '0.1.0',
    spec: '0.1.0',
    description: 'Demo program with PDA examples for Solana Program Interface',
  },
  instructions: [
    {
      name: 'set_create_pool_fee',
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        { name: 'signer', writable: true, signer: true },
        {
          name: 'global_pool_config',
          writable: true,
          pda: {
            seeds: [{ kind: 'const' as const, value: 'global_pool_config' }],
          },
        },
      ],
      args: [{ name: 'fee', type: 'u64' }],
    },
    {
      name: 'initialize_global_config',
      discriminator: [176, 176, 110, 32, 14, 153, 156, 238],
      accounts: [
        {
          name: 'global_pool_config',
          writable: true,
          pda: {
            seeds: [{ kind: 'const' as const, value: 'global_pool_config' }],
          },
        },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'fee_rate', type: 'u16' }],
    },
    {
      name: 'create_user_profile',
      discriminator: [11, 18, 104, 9, 104, 174, 59, 33],
      accounts: [
        {
          name: 'user_profile',
          writable: true,
          pda: {
            seeds: [
              { kind: 'const' as const, value: 'user_profile' },
              { kind: 'account' as const, path: 'user' },
            ],
          },
        },
        { name: 'user', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'username', type: 'string' }],
    },
    {
      name: 'create_user_vault',
      discriminator: [22, 35, 108, 19, 108, 175, 69, 44],
      accounts: [
        {
          name: 'user_vault',
          writable: true,
          pda: {
            seeds: [
              { kind: 'const' as const, value: 'user_vault' },
              { kind: 'account' as const, path: 'user' },
              { kind: 'arg' as const, path: 'vault_id', type: 'u64' },
            ],
          },
        },
        { name: 'user', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'vault_id', type: 'u64' },
        { name: 'initial_amount', type: 'u64' },
      ],
    },
  ],
  accounts: [
    {
      name: 'GlobalPoolConfig',
      discriminator: [255, 176, 4, 245, 188, 253, 124, 25],
    },
    {
      name: 'UserProfile',
      discriminator: [123, 45, 67, 89, 101, 112, 131, 145],
    },
    { name: 'UserVault', discriminator: [201, 134, 167, 200, 233, 12, 45, 78] },
  ],
  types: [
    {
      name: 'GlobalPoolConfig',
      type: {
        kind: 'struct' as const,
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'fee_rate', type: 'u16' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'UserProfile',
      type: {
        kind: 'struct' as const,
        fields: [
          { name: 'user', type: 'publicKey' },
          { name: 'username', type: 'string' },
          { name: 'created_at', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'UserVault',
      type: {
        kind: 'struct' as const,
        fields: [
          { name: 'user', type: 'publicKey' },
          { name: 'vault_id', type: 'u64' },
          { name: 'amount', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
};

interface ExampleIdlSelectorProps {
  onIdlLoaded: (idl: AnchorIdl) => void;
}

const EXAMPLE_IDLS = [
  {
    name: 'Basic Counter Example',
    description: 'Simple counter program without PDAs',
    file: 'example-idl.json',
  },
  {
    name: 'PDA Examples',
    description: 'Demonstrates static and dynamic PDA calculations',
    file: 'example-with-pdas.json',
  },
];

export const ExampleIdlSelector: React.FC<ExampleIdlSelectorProps> = ({
  onIdlLoaded,
}) => {
  const loadExampleIdl = async (filename: string) => {
    try {
      // Try to load from public folder
      const response = await fetch(`/examples/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const idl = await response.json();
      onIdlLoaded(idl);
    } catch (error) {
      console.error('Failed to load example IDL:', error);
      // Fallback: load hardcoded examples
      if (filename === 'example-idl.json') {
        onIdlLoaded(BASIC_EXAMPLE_IDL);
      } else if (filename === 'example-with-pdas.json') {
        onIdlLoaded(PDA_EXAMPLE_IDL);
      }
    }
  };

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-gray-700">Load Example IDL</h5>
      <div className="space-y-2">
        {EXAMPLE_IDLS.map((example) => (
          <button
            key={example.file}
            onClick={() => loadExampleIdl(example.file)}
            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
          >
            <div className="font-medium text-sm text-gray-900">
              {example.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {example.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
