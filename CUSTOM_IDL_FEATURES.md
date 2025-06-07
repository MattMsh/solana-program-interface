# Custom IDL Execution Features

This document outlines the newly implemented features for executing instructions from custom loaded IDLs in the Solana Program Interface.

## Key Features Implemented

### 1. Automatic PDA Calculation ✅

- **Static PDAs**: Automatically calculated for accounts with constant seeds (e.g., `global_pool_config`)
- **Dynamic PDAs**: Calculated based on instruction arguments and account inputs
- **Visual Indicators**: Shows bump seeds and seed information for each PDA
- **Recalculation**: Manual "🔄 Recalculate PDAs" button to refresh addresses when inputs change

### 2. Demo vs Custom IDL Detection ✅

- **Example IDLs**: Demo programs with addresses like `DemoProgram1111111111111111111111111111111`
- **Demo Mode Warning**: Amber banner prevents accidental transaction attempts
- **Custom IDL Indicator**: Green banner shows when a real program IDL is loaded
- **Program Address Display**: Shows truncated program address for verification

### 3. Network Validation ✅

- **Program Existence Check**: Validates that the program exists on the selected network before execution
- **Network Status Indicator**: Shows current network (Mainnet/Devnet/Testnet/Localhost) with color coding
- **Address Validation**: Confirms the program address is valid and executable
- **Clear Error Messages**: Provides specific guidance when programs aren't found

### 6. Custom RPC Configuration ✅

- **RPC Settings Modal**: Configure custom RPC endpoints for each network
- **Popular Provider Templates**: Pre-filled URLs for Helius, QuickNode, Alchemy, and GetBlock
- **Rate Limit Bypass**: Use custom mainnet RPC to avoid 403 errors from public endpoints
- **Persistent Storage**: Settings saved locally in browser localStorage
- **Visual Indicator**: RPC settings button accessible from the header

### 4. Enhanced Error Handling ✅

- **Input Validation**: Prevents invalid characters in numeric fields
- **Transaction Specific Errors**:
  - Insufficient funds detection
  - Simulation failure analysis
  - Blockhash expiration handling
  - Transaction size limit warnings
- **Method Validation**: Checks if instruction methods exist on the program
- **User-Friendly Messages**: Converts technical errors into actionable guidance

### 5. Visual UI Improvements ✅

- **Network Status Badge**: Color-coded indicator showing current network
- **IDL Type Indicators**:
  - ⚠️ Example IDL - Demo Mode (Amber)
  - ✅ Custom IDL - Ready for Execution (Green)
- **Button State Changes**:
  - "View Demo (No Transaction)" for examples
  - "Execute Instruction" for real programs
- **PDA Metadata Display**: Shows seed composition and bump values

## How to Use Custom IDLs

### 1. Upload Your IDL

- Click "Upload IDL File" or "Choose Different IDL"
- Select a JSON file from a deployed Anchor program
- The app will automatically detect if it's a demo or real program

### 2. Network Verification

- Ensure you're connected to the correct network where your program is deployed
- The network status indicator shows your current connection
- The app will validate program existence before allowing execution
- If you encounter 403 errors on mainnet, configure a custom RPC endpoint

### 2a. Configure Custom RPC (If Needed)

- Click the "RPC" settings button in the header
- Select from popular providers or enter your own endpoint
- Especially important for mainnet to avoid rate limiting
- Settings are saved automatically and persist between sessions

### 3. Configure Instructions

- Select an instruction from the loaded IDL
- Fill in required arguments (automatic type validation)
- PDA accounts are automatically populated when possible
- Use the recalculate button if you change inputs

### 4. Execute Transactions

- Connect your wallet to the correct network
- Ensure sufficient SOL balance for transaction fees
- Click "Execute Instruction" to send the transaction
- Monitor transaction status in the Transaction History panel

## Error Prevention

The app includes multiple layers of validation:

1. **IDL Validation**: Ensures the uploaded file is a valid Anchor IDL
2. **Network Validation**: Confirms the program exists on the selected network
3. **Input Validation**: Prevents malformed data from being submitted
4. **Method Validation**: Verifies instruction methods exist on the program
5. **Account Validation**: Checks that all required accounts are provided

## Technical Implementation

### Key Components Modified:

- `InstructionForm.tsx`: Core execution logic and validation
- `NetworkStatus.tsx`: Network indicator component
- `utils/solana.ts`: PDA calculation utilities
- Enhanced error handling and user feedback

### Validation Flow:

1. Check if IDL is example/demo (block execution)
2. Validate program exists on network
3. Confirm program is executable
4. Verify instruction method exists
5. Execute transaction with comprehensive error handling

## Benefits

- **Safety**: Prevents accidental transactions with demo programs
- **Clarity**: Clear indicators of what type of IDL is loaded
- **Reliability**: Validates program deployment before execution
- **User Experience**: Informative error messages and visual feedback
- **Efficiency**: Automatic PDA calculation reduces manual work
- **Mainnet Ready**: Custom RPC support eliminates rate limiting issues

## Recommended RPC Providers for Mainnet

If you're experiencing 403 errors on mainnet, these providers offer reliable service:

### Free Tiers Available:

- **Helius**: `https://rpc.helius.xyz/?api-key=YOUR_API_KEY`
- **QuickNode**: `https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/`
- **Alchemy**: `https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

### Enterprise Options:

- **GetBlock**: `https://sol.getblock.io/YOUR_API_KEY/mainnet/`
- **GenesysGo**: Custom endpoints available

Most providers offer generous free tiers perfect for development and testing. Simply sign up, get your API key, and configure it in the RPC settings modal.

This implementation ensures a smooth and safe experience when working with both example IDLs for learning and real deployed programs for actual transactions.
