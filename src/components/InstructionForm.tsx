import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PlayIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  IdlInstruction,
  AnchorIdl,
  InstructionFormValues,
  AccountInput,
} from '../types';
import {
  parseIdlType,
  convertFormValueToAnchorType,
  getDefaultValueForType,
  validatePublicKey,
  createProgramFromIdl,
  populatePdaAddresses,
  getStaticPdas,
  convertToCamelCase,
} from '../utils/solana';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';

interface InstructionFormProps {
  instruction: IdlInstruction;
  idl: AnchorIdl;
  onTransactionSuccess?: (signature: string) => void;
}

export const InstructionForm: React.FC<InstructionFormProps> = ({
  instruction,
  idl,
  onTransactionSuccess,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [formValues, setFormValues] = useState<InstructionFormValues>({});
  const [accountInputs, setAccountInputs] = useState<AccountInput[]>([]);

  // Initialize form values
  useEffect(() => {
    const initialValues: InstructionFormValues = {};

    // Initialize argument values
    instruction.args.forEach((arg) => {
      initialValues[arg.name] = getDefaultValueForType(arg.type);
    });

    // Initialize account inputs
    const accounts: AccountInput[] = instruction.accounts.map((account) => ({
      name: account.name,
      value: account.address || '',
      required: !account.optional,
      description: `${account.writable ? 'Writable' : 'Read-only'}${
        account.signer ? ', Signer' : ''
      }${account.optional ? ', Optional' : ''}${account.pda ? ', PDA' : ''}`,
      isPda: !!account.pda,
    }));

    // Calculate static PDAs and populate them automatically
    if (idl.address) {
      try {
        const programId = new PublicKey(idl.address);
        const staticPdas = getStaticPdas(instruction, programId);

        accounts.forEach((account) => {
          if (account.isPda && staticPdas[account.name] && !account.value) {
            account.value = staticPdas[account.name].address.toBase58();
            account.pdaInfo = {
              bump: staticPdas[account.name].bump,
              seeds: staticPdas[account.name].seeds || [],
            };
          }
        });
      } catch (error) {
        console.warn('Failed to calculate static PDAs:', error);
      }
    }

    setFormValues(initialValues);
    setAccountInputs(accounts);
  }, [instruction, idl.address]);

  const handleArgChange = useCallback(
    (argName: string, value: any) => {
      // Immediately update form values
      setFormValues((prev) => {
        const newValues = {
          ...prev,
          [argName]: value,
        };

        // Recalculate dynamic PDAs when arguments change
        if (idl.address) {
          try {
            const programId = new PublicKey(idl.address);
            const updatedInputs = populatePdaAddresses(
              instruction,
              programId,
              accountInputs,
              newValues
            );

            // Update account inputs if PDAs changed
            const hasChanges = updatedInputs.some((updated, index) => {
              const current = accountInputs[index];
              return (
                updated.value !== current.value ||
                updated.isPda !== current.isPda
              );
            });

            if (hasChanges) {
              setAccountInputs(updatedInputs);
            }
          } catch (error) {
            console.warn('Failed to recalculate PDAs:', error);
          }
        }

        return newValues;
      });
    },
    [idl.address, instruction, accountInputs]
  );

  const handleAccountChange = useCallback(
    (accountName: string, value: string) => {
      setAccountInputs((prev) =>
        prev.map((account) =>
          account.name === accountName ? { ...account, value } : account
        )
      );
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    // Validate required accounts
    for (const account of accountInputs) {
      if (account.required && !account.value.trim()) {
        toast.error(`Account "${account.name}" is required`);
        return false;
      }

      if (account.value.trim() && !validatePublicKey(account.value)) {
        toast.error(`Invalid public key for account "${account.name}"`);
        return false;
      }
    }

    return true;
  }, [accountInputs]);

  const executeInstruction = useCallback(async () => {
    if (!publicKey || !sendTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Check if this is an example/demo IDL
    const isExampleIdl =
      idl.address === 'DemoProgram1111111111111111111111111111111' ||
      idl.address === '6khKp4BeJpCjBY1Eh39ybiqbfRnrn2UzWeUARjQLXYRC';

    if (isExampleIdl) {
      toast.error(
        '⚠️ This is an example IDL for demonstration purposes only. To execute real transactions, please upload an IDL from a deployed program.',
        { duration: 5000 }
      );
      return;
    }

    setIsExecuting(true);

    // For custom IDLs, validate the program exists on the network
    try {
      const programId = new PublicKey(idl.address);
      const accountInfo = await connection.getAccountInfo(programId);

      if (!accountInfo) {
        setIsExecuting(false);
        toast.error(
          `Program ${idl.address.slice(0, 8)}...${idl.address.slice(
            -8
          )} not found on the selected network. Please check:\n• The program is deployed\n• You're on the correct network\n• The program address is correct`,
          { duration: 8000 }
        );
        return;
      }

      if (!accountInfo.executable) {
        setIsExecuting(false);
        toast.error(
          'The provided address is not an executable program account.',
          { duration: 5000 }
        );
        return;
      }
    } catch (addressError) {
      setIsExecuting(false);
      toast.error(
        'Invalid program address format. Please check the IDL address.',
        { duration: 5000 }
      );
      return;
    }

    try {
      // Create provider and program
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: async (tx) => {
            // This is a placeholder - the actual signing will be handled by sendTransaction
            return tx;
          },
          signAllTransactions: async (txs) => {
            // This is a placeholder - the actual signing will be handled by sendTransaction
            return txs;
          },
        },
        { commitment: 'confirmed' }
      );

      const program = createProgramFromIdl(idl, provider);

      // Convert snake_case instruction name to camelCase for method lookup
      // Anchor automatically converts snake_case to camelCase in the JavaScript SDK
      const camelCaseMethodName = convertToCamelCase(instruction.name);

      // Check if the method exists on the program (try both original and camelCase)
      const methodName =
        program.methods && (program.methods as any)[camelCaseMethodName]
          ? camelCaseMethodName
          : instruction.name;

      if (!program.methods || !(program.methods as any)[methodName]) {
        const availableMethods = program.methods
          ? Object.keys(program.methods).join(', ')
          : 'None';
        throw new Error(
          `Method '${instruction.name}' (${camelCaseMethodName}) not found on program.\n\nAvailable methods: ${availableMethods}\n\nThis might indicate:\n` +
            '• The program is not deployed to the current network\n' +
            "• The IDL doesn't match the deployed program\n" +
            '• The method name is incorrect'
        );
      }

      // Prepare arguments
      const args = instruction.args.map((arg) => {
        const value = formValues[arg.name];
        return convertFormValueToAnchorType(value, arg.type);
      });

      // Prepare accounts
      const accounts: { [key: string]: PublicKey } = {};
      accountInputs.forEach((account) => {
        if (account.value.trim()) {
          accounts[account.name] = new PublicKey(account.value);
        }
      });

      // Add system program if not specified
      if (!accounts.systemProgram && !accounts.system_program) {
        accounts.systemProgram = SystemProgram.programId;
      }

      // Build the instruction using the correct method name (camelCase)
      const instructionBuilder = (program.methods as any)[methodName](...args);

      // Add accounts
      const transaction = await instructionBuilder
        .accounts(accounts)
        .transaction();

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success(
        `Transaction successful! Signature: ${signature.slice(0, 8)}...`
      );
      onTransactionSuccess?.(signature);
    } catch (error) {
      console.error('Transaction failed:', error);
      let message = 'Transaction failed';

      if (error instanceof Error) {
        if (error.message.includes('not found on program')) {
          message = error.message;
        } else if (error.message.includes('Invalid character')) {
          message =
            'Invalid input detected. Please check all fields for correct format (e.g., whole numbers for u64, valid public keys for accounts).';
        } else if (error.message.includes('PublicKey')) {
          message =
            'Invalid public key format. Please check account addresses.';
        } else if (error.message.includes('Invalid input')) {
          message =
            'Invalid input values. Please check argument types and values.';
        } else if (error.message.includes('is not a function')) {
          message = `Method '${instruction.name}' not found on program. Please verify the IDL matches the deployed program.`;
        } else if (error.message.includes('Insufficient funds')) {
          message =
            'Insufficient SOL balance to complete the transaction. Please add funds to your wallet.';
        } else if (error.message.includes('Simulation failed')) {
          message =
            'Transaction simulation failed. This could indicate:\n• Incorrect account permissions\n• Missing required accounts\n• Program logic rejection\n• Invalid argument values';
        } else if (error.message.includes('Blockhash not found')) {
          message = 'Transaction expired. Please try again.';
        } else if (error.message.includes('Transaction too large')) {
          message =
            'Transaction size exceeds limits. Try reducing the number of operations.';
        } else {
          message = error.message;
        }
      }

      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  }, [
    publicKey,
    sendTransaction,
    connection,
    validateForm,
    idl,
    instruction,
    formValues,
    accountInputs,
    onTransactionSuccess,
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const recalculatePdas = useCallback(() => {
    if (!idl.address) return;

    try {
      const programId = new PublicKey(idl.address);
      const updatedInputs = populatePdaAddresses(
        instruction,
        programId,
        accountInputs,
        formValues
      );
      setAccountInputs(updatedInputs);
      toast.success('PDAs recalculated successfully');
    } catch (error) {
      console.error('Failed to recalculate PDAs:', error);
      toast.error('Failed to recalculate PDAs');
    }
  }, [idl.address, instruction, accountInputs, formValues]);

  const renderArgInput = (arg: any, index: number) => {
    const argType = parseIdlType(arg.type);
    const value = formValues[arg.name] || '';

    switch (argType) {
      case 'string':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleArgChange(arg.name, e.target.value)}
            placeholder={`Enter ${arg.name}`}
            className="min-h-[80px]"
          />
        );

      case 'bool':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${arg.name}-${index}`}
                value="true"
                checked={value === true}
                onChange={() => handleArgChange(arg.name, true)}
                className="mr-2"
              />
              True
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${arg.name}-${index}`}
                value="false"
                checked={value === false}
                onChange={() => handleArgChange(arg.name, false)}
                className="mr-2"
              />
              False
            </label>
          </div>
        );

      case 'publicKey':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleArgChange(arg.name, e.target.value)}
            placeholder="Enter public key"
            className={`font-mono ${
              value && !validatePublicKey(value)
                ? 'border-red-300 bg-red-50'
                : ''
            }`}
          />
        );

      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
      case 'u128':
      case 'i8':
      case 'i16':
      case 'i32':
      case 'i64':
      case 'i128':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const numValue = e.target.value;
              // Allow empty string or valid decimal numbers
              if (numValue === '' || /^\d*\.?\d*$/.test(numValue)) {
                handleArgChange(arg.name, numValue);
              }
            }}
            placeholder={`Enter ${argType} value`}
            min="0"
            step={argType.includes('u') ? '1' : 'any'}
          />
        );

      case 'f32':
      case 'f64':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleArgChange(arg.name, e.target.value)}
            placeholder={`Enter ${argType} value`}
            step="any"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleArgChange(arg.name, e.target.value)}
            placeholder={`Enter ${arg.name} (${argType})`}
          />
        );
    }
  };

  const isExampleIdl =
    idl.address === 'DemoProgram1111111111111111111111111111111' ||
    idl.address === '6khKp4BeJpCjBY1Eh39ybiqbfRnrn2UzWeUARjQLXYRC';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">
            Execute: {instruction.name}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copyToClipboard(JSON.stringify(instruction, null, 2))
            }
            className="text-gray-600 hover:text-gray-800"
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Program validation banner */}
        {isExampleIdl ? (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              ⚠️ <strong>Demo IDL</strong> - This is for demonstration only and
              cannot execute real transactions.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✅ <strong>Custom IDL</strong> - Ready for Execution | Program:{' '}
              {idl.address?.slice(0, 8)}...{idl.address?.slice(-8)} | This IDL
              can execute real transactions.
            </AlertDescription>
          </Alert>
        )}

        {/* Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Accounts</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={recalculatePdas}
              className="text-blue-600 hover:text-blue-800"
            >
              🔄 Recalculate PDAs
            </Button>
          </div>

          <div className="space-y-3">
            {accountInputs.map((account) => (
              <div key={account.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {account.name}
                  {account.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  <span className="text-gray-500 ml-2">
                    ({account.description})
                  </span>
                </label>

                <Input
                  type="text"
                  value={account.value}
                  onChange={(e) =>
                    handleAccountChange(account.name, e.target.value)
                  }
                  placeholder={`Enter ${account.name} public key`}
                  className={`font-mono text-sm ${
                    account.value && !validatePublicKey(account.value)
                      ? 'border-red-300 bg-red-50'
                      : account.isPda
                      ? 'border-blue-300 bg-blue-50'
                      : ''
                  }`}
                />

                {account.isPda && account.pdaInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        📍 PDA Account (Bump: {account.pdaInfo.bump})
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-700">
                      <strong>Seeds:</strong>
                      <div className="mt-1 space-y-1">
                        {account.pdaInfo.seeds.map((seed, idx) => (
                          <div
                            key={idx}
                            className="font-mono text-xs bg-blue-100 px-2 py-1 rounded border inline-block mr-1"
                          >
                            {seed}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arguments Section */}
        {instruction.args.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Arguments</h3>
            <div className="space-y-3">
              {instruction.args.map((arg, index) => (
                <div key={arg.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {arg.name}
                    <span className="text-gray-500 ml-2">
                      ({parseIdlType(arg.type)})
                    </span>
                  </label>
                  {renderArgInput(arg, index)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={executeInstruction}
            disabled={isExecuting || !publicKey}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Executing...</span>
              </div>
            ) : idl.address === 'DemoProgram1111111111111111111111111111111' ||
              idl.address === '6khKp4BeJpCjBY1Eh39ybiqbfRnrn2UzWeUARjQLXYRC' ? (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                View Demo (No Transaction)
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                Execute Instruction
              </>
            )}
          </Button>

          {!publicKey && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please connect your wallet to execute instructions
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
