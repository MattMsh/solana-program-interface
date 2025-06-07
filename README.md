# Solana Program Interface

A modern web application that provides a user-friendly interface to interact with Solana on-chain programs using Anchor IDL files. Built with React, TypeScript, and the Anchor framework.

## Features

- 🔗 **Wallet Integration**: Connect with popular Solana wallets (Phantom, Solflare, etc.)
- 📄 **IDL Support**: Upload and parse Anchor IDL files
- 📍 **Automatic PDA Calculation**: Calculate static and dynamic Program Derived Addresses from IDL definitions
- 🎯 **Dynamic UI**: Automatically generate forms based on program instructions
- 🌐 **Multi-Network**: Support for Mainnet, Devnet, Testnet, and Localhost
- 📊 **Instruction Explorer**: Browse and understand program instructions
- 🚀 **Execute Instructions**: Call program instructions with proper parameter validation
- 📈 **Transaction History**: Track and monitor transaction status
- 🔍 **Explorer Integration**: Direct links to Solana Explorer for transaction details
- 📚 **Example IDLs**: Load example IDL files including PDA demonstrations

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd solana-program-interface
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Connect Your Wallet

- Click the "Connect Wallet" button in the top right
- Select your preferred wallet and approve the connection

### 2. Select Network

- Choose your target network from the dropdown (Devnet, Mainnet, etc.)
- The app will connect to the appropriate Solana cluster

### 3. Upload IDL File

- Drag and drop or click to upload an Anchor IDL JSON file
- The app will validate and parse the IDL automatically
- See `src/examples/example-idl.json` for a sample IDL file

### 4. Explore Instructions

- Browse available program instructions in the left panel
- Expand instructions to see required accounts and arguments
- Click "Select" to configure an instruction

### 5. Execute Instructions

- Fill in required account addresses and arguments
- The form will automatically validate input types
- Click "Execute Instruction" to send the transaction

### 6. Monitor Transactions

- View transaction history in the right panel
- Click "View" to see transaction details on Solana Explorer

### 7. Automatic PDA Calculation

- PDAs defined in the IDL are automatically calculated and populated
- Static PDAs (constant seeds only) are calculated immediately
- Dynamic PDAs are calculated when dependencies (accounts/arguments) are provided
- Visual indicators show PDA accounts with bump seeds and seed information
- Use the "🔄 Recalculate PDAs" button to manually refresh PDA addresses

For detailed PDA usage instructions, see [PDA_USAGE.md](PDA_USAGE.md).

## Project Structure

```
src/
├── components/          # React components
│   ├── WalletButton.tsx      # Wallet connection
│   ├── NetworkSelector.tsx   # Network selection
│   ├── IdlUploader.tsx      # IDL file upload
│   ├── InstructionList.tsx  # Display instructions
│   ├── InstructionForm.tsx  # Execute instructions
│   └── TransactionHistory.tsx # Transaction tracking
├── contexts/           # React contexts
│   └── WalletContext.tsx    # Wallet adapter setup
├── types/              # TypeScript types
│   └── index.ts            # Type definitions
├── utils/              # Utility functions
│   └── solana.ts           # Solana/Anchor helpers
└── examples/           # Example files
    └── example-idl.json    # Sample IDL file
```

## Key Technologies

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Anchor Framework**: Solana program development framework
- **Solana Web3.js**: Solana JavaScript SDK
- **Wallet Adapter**: Standard wallet integration for Solana
- **Tailwind CSS**: Utility-first CSS framework
- **React Hot Toast**: Toast notifications

## IDL File Format

The application expects Anchor IDL files in JSON format. Here's the basic structure:

```json
{
  "address": "program-id",
  "metadata": {
    "name": "program-name",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "instruction-name",
      "discriminator": [1, 2, 3, 4, 5, 6, 7, 8],
      "accounts": [
        {
          "name": "account-name",
          "writable": true,
          "signer": false
        }
      ],
      "args": [
        {
          "name": "arg-name",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [...],
  "types": [...]
}
```

## Supported Data Types

The application supports all standard Anchor data types:

- **Primitives**: `bool`, `u8`, `u16`, `u32`, `u64`, `u128`, `i8`, `i16`, `i32`, `i64`, `i128`, `f32`, `f64`
- **Special**: `string`, `publicKey`, `bytes`
- **Containers**: `Option<T>`, `Vec<T>`, `[T; N]`
- **Custom Types**: Structs and enums defined in the IDL

## Development

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Configuration

The app uses environment variables for configuration. Create a `.env` file:

```env
REACT_APP_DEFAULT_NETWORK=devnet
REACT_APP_LOCALHOST_RPC=http://127.0.0.1:8899
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## Security Considerations

- Always verify program addresses before executing instructions
- Be cautious when connecting to Mainnet and using real funds
- Validate all input data before sending transactions
- Use Devnet for testing and development

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**

   - Ensure your wallet extension is installed and enabled
   - Try refreshing the page and reconnecting

2. **IDL Upload Failed**

   - Verify the IDL file is valid JSON
   - Check that required fields (address, instructions) are present

3. **Transaction Failed**

   - Ensure you have sufficient SOL for transaction fees
   - Verify all account addresses are correct
   - Check program is deployed on the selected network

4. **Type Errors**
   - Make sure argument values match the expected types
   - For large numbers (u64, u128), use string format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Documentation](https://github.com/anza-xyz/wallet-adapter)
