import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  AnchorIdl,
  IdlType,
  IdlPda,
  IdlSeed,
  IdlInstruction,
  RpcConfig,
} from '../types';

export const NETWORK_OPTIONS = {
  mainnet: 'mainnet-beta',
  devnet: 'devnet',
  testnet: 'testnet',
  localhost: 'http://127.0.0.1:8899',
} as const;

const DEFAULT_RPCS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localhost: 'http://127.0.0.1:8899',
};

export function getConnection(
  network: WalletAdapterNetwork | 'localhost',
  rpcConfig?: RpcConfig
): Connection {
  // Map WalletAdapterNetwork to our internal network keys
  let networkKey: keyof typeof NETWORK_OPTIONS;

  switch (network) {
    case WalletAdapterNetwork.Mainnet:
      networkKey = 'mainnet';
      break;
    case WalletAdapterNetwork.Devnet:
      networkKey = 'devnet';
      break;
    case WalletAdapterNetwork.Testnet:
      networkKey = 'testnet';
      break;
    case 'localhost':
      networkKey = 'localhost';
      break;
    default:
      networkKey = 'devnet';
  }

  let endpoint: string;

  if (rpcConfig && rpcConfig[networkKey]) {
    // Use custom RPC if configured
    endpoint = rpcConfig[networkKey]!;
  } else if (networkKey === 'localhost') {
    endpoint = NETWORK_OPTIONS[networkKey];
  } else {
    // Use default Solana RPC endpoints
    endpoint = clusterApiUrl(NETWORK_OPTIONS[networkKey] as any);
  }

  return new Connection(endpoint, 'confirmed');
}

export function getRpcEndpoint(
  network: WalletAdapterNetwork | 'localhost',
  rpcConfig?: RpcConfig
): string {
  // Map WalletAdapterNetwork to our internal network keys
  let networkKey: keyof typeof NETWORK_OPTIONS;

  switch (network) {
    case WalletAdapterNetwork.Mainnet:
      networkKey = 'mainnet';
      break;
    case WalletAdapterNetwork.Devnet:
      networkKey = 'devnet';
      break;
    case WalletAdapterNetwork.Testnet:
      networkKey = 'testnet';
      break;
    case 'localhost':
      networkKey = 'localhost';
      break;
    default:
      networkKey = 'devnet';
  }

  if (rpcConfig && rpcConfig[networkKey]) {
    return rpcConfig[networkKey]!;
  }
  return DEFAULT_RPCS[networkKey];
}

export function saveRpcConfig(config: RpcConfig): void {
  localStorage.setItem('solana-rpc-config', JSON.stringify(config));
}

export function loadRpcConfig(): RpcConfig {
  try {
    const stored = localStorage.getItem('solana-rpc-config');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load RPC config from localStorage:', error);
    return {};
  }
}

export function createProgramFromIdl(
  idl: AnchorIdl,
  provider: AnchorProvider
): Program {
  // The newer Anchor versions expect just the IDL and provider since the program ID is in the IDL metadata
  return new Program(idl as any, provider);
}

/**
 * Converts an IDL seed to a Buffer for PDA calculation
 */
export function seedToBuffer(
  seed: IdlSeed,
  _programId: PublicKey,
  args?: Record<string, any>,
  accounts?: Record<string, PublicKey>
): Buffer {
  switch (seed.kind) {
    case 'const':
      if (typeof seed.value === 'string') {
        return Buffer.from(seed.value, 'utf8');
      } else if (Array.isArray(seed.value)) {
        return Buffer.from(seed.value);
      } else {
        throw new Error(
          `Unsupported const seed value type: ${typeof seed.value}`
        );
      }

    case 'arg':
      if (!args || !(seed.path! in args)) {
        throw new Error(`Argument '${seed.path}' not found in provided args`);
      }
      const argValue = args[seed.path!];
      return convertArgumentToBuffer(argValue, seed.type);

    case 'account':
      if (!accounts || !(seed.path! in accounts)) {
        throw new Error(
          `Account '${seed.path}' not found in provided accounts`
        );
      }
      const account = accounts[seed.path!];
      return account.toBuffer();

    default:
      throw new Error(`Unsupported seed kind: ${(seed as any).kind}`);
  }
}

/**
 * Converts an argument value to Buffer based on its type
 */
export function convertArgumentToBuffer(value: any, type?: IdlType): Buffer {
  if (!type || typeof type === 'string') {
    const typeStr = (type as string) || 'bytes';

    switch (typeStr) {
      case 'string':
        return Buffer.from(value, 'utf8');
      case 'publicKey':
        return new PublicKey(value).toBuffer();
      case 'u8':
      case 'u16':
      case 'u32':
        const num = parseInt(value);
        const buffer = Buffer.allocUnsafe(
          typeStr === 'u8' ? 1 : typeStr === 'u16' ? 2 : 4
        );
        if (typeStr === 'u8') buffer.writeUInt8(num, 0);
        else if (typeStr === 'u16') buffer.writeUInt16LE(num, 0);
        else buffer.writeUInt32LE(num, 0);
        return buffer;
      case 'u64':
      case 'i64':
        const bn = new BN(value);
        return Buffer.from(bn.toArray('le', 8));
      case 'bytes':
        if (Buffer.isBuffer(value)) return value;
        if (typeof value === 'string') return Buffer.from(value, 'hex');
        if (Array.isArray(value)) return Buffer.from(value);
        return Buffer.from(String(value), 'utf8');
      default:
        // For unknown types, try to convert to string and then to buffer
        return Buffer.from(String(value), 'utf8');
    }
  }

  // Handle complex types
  if (typeof type === 'object') {
    if ('vec' in type || 'array' in type || 'option' in type) {
      // For complex types, serialize as JSON string
      return Buffer.from(JSON.stringify(value), 'utf8');
    }
  }

  return Buffer.from(String(value), 'utf8');
}

/**
 * Calculate PDA from IDL PDA definition
 */
export function calculatePdaFromIdl(
  pdaDefinition: IdlPda,
  programId: PublicKey,
  args?: Record<string, any>,
  accounts?: Record<string, PublicKey>
): [PublicKey, number] {
  const seeds: Buffer[] = [];

  // Convert each seed to Buffer
  for (const seed of pdaDefinition.seeds) {
    try {
      const seedBuffer = seedToBuffer(seed, programId, args, accounts);
      seeds.push(seedBuffer);
    } catch (error) {
      console.warn(`Failed to convert seed:`, seed, error);
      // Skip seeds that can't be converted (might be dynamic)
      continue;
    }
  }

  // Use the program from the PDA definition if specified, otherwise use the provided programId
  const deriveProgramId = pdaDefinition.program
    ? new PublicKey(
        seedToBuffer(pdaDefinition.program, programId, args, accounts)
      )
    : programId;

  try {
    return PublicKey.findProgramAddressSync(seeds, deriveProgramId);
  } catch (error) {
    throw new Error(`Failed to derive PDA: ${error}`);
  }
}

/**
 * Check if a PDA can be statically calculated (no dynamic seeds)
 */
export function canCalculateStaticPda(pdaDefinition: IdlPda): boolean {
  return pdaDefinition.seeds.every((seed) => seed.kind === 'const');
}

/**
 * Get all static PDAs from an instruction
 */
export function getStaticPdas(
  instruction: IdlInstruction,
  programId: PublicKey
): Record<string, { address: PublicKey; bump: number; seeds?: string[] }> {
  const staticPdas: Record<
    string,
    { address: PublicKey; bump: number; seeds?: string[] }
  > = {};

  for (const account of instruction.accounts) {
    if (account.pda && canCalculateStaticPda(account.pda)) {
      try {
        const [address, bump] = calculatePdaFromIdl(account.pda, programId);
        const seedDescriptions = account.pda.seeds.map((seed) =>
          formatSeedForDisplay(seed)
        );
        staticPdas[account.name] = { address, bump, seeds: seedDescriptions };
      } catch (error) {
        console.warn(
          `Failed to calculate static PDA for ${account.name}:`,
          error
        );
      }
    }
  }

  return staticPdas;
}

/**
 * Calculate dynamic PDA with provided arguments and accounts
 */
export function calculateDynamicPda(
  pdaDefinition: IdlPda,
  programId: PublicKey,
  args: Record<string, any> = {},
  accounts: Record<string, PublicKey> = {}
): [PublicKey, number] | null {
  try {
    return calculatePdaFromIdl(pdaDefinition, programId, args, accounts);
  } catch (error) {
    console.warn('Failed to calculate dynamic PDA:', error);
    return null;
  }
}

/**
 * Format a seed for human-readable display
 */
export function formatSeedForDisplay(
  seed: IdlSeed,
  seedBuffer?: Buffer,
  args?: Record<string, any>,
  accounts?: Record<string, PublicKey>
): string {
  switch (seed.kind) {
    case 'const':
      if (typeof seed.value === 'string') {
        return `"${seed.value}"`;
      } else if (Array.isArray(seed.value)) {
        // Try to convert byte array to string if possible
        try {
          const str = Buffer.from(seed.value).toString('utf8');
          // Check if it's a valid UTF-8 string (no control characters except common ones)
          if (str.length > 0 && !/[\x00-\x08\x0E-\x1F\x7F]/.test(str)) {
            return `"${str}"`;
          }
        } catch (e) {
          // Fall through to hex display
        }
        return `[${seed.value.slice(0, 8).join(', ')}${
          seed.value.length > 8 ? '...' : ''
        }]`;
      }
      return String(seed.value);

    case 'arg':
      const argValue = args?.[seed.path!];
      if (argValue !== undefined) {
        return `${seed.path}="${argValue}"`;
      }
      return `${seed.path}=<arg>`;

    case 'account':
      const account = accounts?.[seed.path!];
      if (account) {
        return `${seed.path}=${account.toBase58().slice(0, 8)}...`;
      }
      return `${seed.path}=<account>`;

    default:
      return 'unknown';
  }
}

/**
 * Auto-populate PDA addresses in account inputs
 */
export function populatePdaAddresses(
  instruction: IdlInstruction,
  programId: PublicKey,
  accountInputs: Array<{
    name: string;
    value: string;
    required: boolean;
    description?: string;
  }>,
  args: Record<string, any> = {}
): Array<{
  name: string;
  value: string;
  required: boolean;
  description?: string;
  isPda?: boolean;
  pdaInfo?: { bump: number; seeds: string[] };
}> {
  const currentAccounts: Record<string, PublicKey> = {};

  // First pass: collect already filled accounts
  accountInputs.forEach((input) => {
    if (input.value.trim()) {
      try {
        currentAccounts[input.name] = new PublicKey(input.value);
      } catch {
        // Invalid public key, skip
      }
    }
  });

  // Second pass: calculate PDAs and populate empty fields
  return accountInputs.map((input) => {
    const account = instruction.accounts.find((acc) => acc.name === input.name);

    if (account?.pda) {
      try {
        const result = calculateDynamicPda(
          account.pda,
          programId,
          args,
          currentAccounts
        );
        if (result) {
          const [address, bump] = result;
          // Generate human-readable seed descriptions
          const seedDescriptions = account.pda.seeds.map((seed) =>
            formatSeedForDisplay(seed, undefined, args, currentAccounts)
          );

          return {
            ...input,
            value: input.value || address.toBase58(), // Don't overwrite if user has entered a value
            isPda: true,
            pdaInfo: { bump, seeds: seedDescriptions },
          };
        }
      } catch (error) {
        console.warn(`Failed to calculate PDA for ${input.name}:`, error);
      }
    }

    // Check if this account has PDA info but no calculated address (static PDA)
    if (account?.pda && input.value) {
      const seedDescriptions = account.pda.seeds.map((seed) =>
        formatSeedForDisplay(seed, undefined, args, currentAccounts)
      );

      return {
        ...input,
        isPda: true,
        pdaInfo: {
          bump: 255, // Default bump for static PDAs where we don't know the actual bump
          seeds: seedDescriptions,
        },
      };
    }

    return input;
  });
}

export function parseIdlType(type: IdlType): string {
  if (typeof type === 'string') {
    return type;
  }

  if ('defined' in type) {
    return type.defined;
  }

  if ('option' in type) {
    return `Option<${parseIdlType(type.option)}>`;
  }

  if ('vec' in type) {
    return `Vec<${parseIdlType(type.vec)}>`;
  }

  if ('array' in type) {
    return `[${parseIdlType(type.array[0])}; ${type.array[1]}]`;
  }

  if ('coption' in type) {
    return `COption<${parseIdlType(type.coption)}>`;
  }

  return 'unknown';
}

export function convertFormValueToAnchorType(value: any, type: IdlType): any {
  if (typeof type === 'string') {
    switch (type) {
      case 'bool':
        return Boolean(value);
      case 'u8':
      case 'u16':
      case 'u32':
      case 'i8':
      case 'i16':
      case 'i32':
        return parseInt(value) || 0;
      case 'u64':
      case 'u128':
      case 'i64':
      case 'i128':
        // Handle decimal inputs by taking the integer part
        const numStr = String(value || '0');
        // If value is empty string, default to '0'
        if (numStr.trim() === '') {
          return new BN('0');
        }
        const integerPart = parseFloat(numStr).toString().split('.')[0];
        return new BN(integerPart || '0');
      case 'f32':
      case 'f64':
        return parseFloat(value) || 0;
      case 'string':
        return String(value || '');
      case 'publicKey':
        // Handle empty or invalid public keys more gracefully
        if (!value || String(value).trim() === '') {
          return PublicKey.default;
        }
        try {
          return new PublicKey(value);
        } catch (error) {
          console.warn('Invalid public key provided:', value, 'Using default');
          return PublicKey.default;
        }
      case 'bytes':
        try {
          return Buffer.from(value || '', 'hex');
        } catch (error) {
          console.warn(
            'Invalid hex string for bytes:',
            value,
            'Using empty buffer'
          );
          return Buffer.alloc(0);
        }
      default:
        return value;
    }
  }

  if ('option' in type) {
    return value ? convertFormValueToAnchorType(value, type.option) : null;
  }

  if ('vec' in type) {
    if (Array.isArray(value)) {
      return value.map((v) => convertFormValueToAnchorType(v, type.vec));
    }
    return [];
  }

  return value;
}

export function getDefaultValueForType(type: IdlType): any {
  if (typeof type === 'string') {
    switch (type) {
      case 'bool':
        return false;
      case 'u8':
      case 'u16':
      case 'u32':
      case 'i8':
      case 'i16':
      case 'i32':
      case 'f32':
      case 'f64':
        return 0;
      case 'u64':
      case 'u128':
      case 'i64':
      case 'i128':
        return '0';
      case 'string':
        return '';
      case 'publicKey':
        return '';
      case 'bytes':
        return '';
      default:
        return '';
    }
  }

  if ('option' in type) {
    return null;
  }

  if ('vec' in type) {
    return [];
  }

  if ('array' in type) {
    return Array(type.array[1]).fill(getDefaultValueForType(type.array[0]));
  }

  return '';
}

export function validatePublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Converts snake_case instruction names to camelCase method names
 * This is necessary because Anchor automatically converts instruction names in the JavaScript SDK
 */
export function convertToCamelCase(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
