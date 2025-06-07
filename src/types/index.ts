// Types for Solana Program Interface
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface IdlInstruction {
  name: string;
  discriminator: number[];
  accounts: IdlAccountItem[];
  args: IdlField[];
}

export interface IdlAccountItem {
  name: string;
  writable?: boolean;
  signer?: boolean;
  optional?: boolean;
  address?: string;
  pda?: IdlPda;
}

export interface IdlField {
  name: string;
  type: IdlType;
}

export interface IdlPda {
  seeds: IdlSeed[];
  program?: IdlSeed;
}

export interface IdlSeed {
  kind: 'const' | 'arg' | 'account';
  value?: any;
  type?: IdlType;
  path?: string;
}

export type IdlType =
  | string
  | { defined: string }
  | { option: IdlType }
  | { vec: IdlType }
  | { array: [IdlType, number] }
  | { coption: IdlType };

export interface IdlAccount {
  name: string;
  discriminator: number[];
}

export interface IdlTypeDefinition {
  name: string;
  type: {
    kind: 'struct' | 'enum';
    fields?: IdlField[];
    variants?: IdlEnumVariant[];
  };
}

export interface IdlEnumVariant {
  name: string;
  fields?: IdlField[];
}

export interface AnchorIdl {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description?: string;
  };
  instructions: IdlInstruction[];
  accounts?: IdlAccount[];
  types?: IdlTypeDefinition[];
  events?: any[];
  errors?: any[];
  constants?: any[];
}

export interface InstructionFormValues {
  [key: string]: any;
}

export interface AccountInput {
  name: string;
  value: string;
  required: boolean;
  description?: string;
  isPda?: boolean;
  pdaInfo?: { bump: number; seeds: string[] };
}

export interface TransactionResult {
  signature: string;
  slot?: number;
  confirmationStatus?: string;
  err?: any;
}

export interface RpcConfig {
  mainnet?: string;
  devnet?: string;
  testnet?: string;
  localhost?: string;
}

export interface NetworkConfig {
  selectedNetwork: WalletAdapterNetwork | 'localhost';
  rpcConfig: RpcConfig;
}
