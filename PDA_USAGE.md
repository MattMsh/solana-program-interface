# Automatic PDA Calculation

This Solana Program Interface now supports automatic calculation of Program Derived Addresses (PDAs) from IDL files. This feature helps developers quickly populate PDA account addresses without manual calculation.

## Features

### 1. Static PDA Calculation

PDAs that use only constant seeds are automatically calculated when the IDL is loaded.

**Example:**

```json
{
  "name": "global_pool_config",
  "pda": {
    "seeds": [
      {
        "kind": "const",
        "value": "global_pool_config"
      }
    ]
  }
}
```

This PDA will be automatically populated with the calculated address.

### 2. Dynamic PDA Calculation

PDAs that depend on arguments or other accounts are calculated when those dependencies are provided.

**Example:**

```json
{
  "name": "user_vault",
  "pda": {
    "seeds": [
      {
        "kind": "const",
        "value": "user_vault"
      },
      {
        "kind": "account",
        "path": "user"
      },
      {
        "kind": "arg",
        "path": "vault_id",
        "type": "u64"
      }
    ]
  }
}
```

This PDA will be calculated when:

- The `user` account address is provided
- The `vault_id` argument is entered

### 3. Supported Seed Types

#### Constant Seeds (`const`)

- String values: `"global_config"`
- Byte arrays: `[1, 2, 3, 4]`

#### Argument Seeds (`arg`)

- References instruction arguments by path
- Supports all Anchor data types: `u8`, `u16`, `u32`, `u64`, `string`, `publicKey`, etc.

#### Account Seeds (`account`)

- References other accounts by their name
- Uses the account's public key as the seed

## UI Features

### Visual Indicators

- PDA accounts are marked with a 📍 icon
- Shows the bump seed value
- Displays the seeds used for calculation
- Indicates when PDAs will be calculated automatically

### Manual Recalculation

- Click "🔄 Recalculate PDAs" button to manually refresh all PDA addresses
- Useful when account addresses or arguments change

### Auto-Population

- Static PDAs are populated immediately when the IDL is loaded
- Dynamic PDAs are populated as dependencies become available
- Changes to arguments automatically trigger PDA recalculation

## Example IDL Structure

```json
{
  "instructions": [
    {
      "name": "create_user_vault",
      "accounts": [
        {
          "name": "user_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": "user_vault"
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "vault_id",
                "type": "u64"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "vault_id",
          "type": "u64"
        }
      ]
    }
  ]
}
```

## Best Practices

1. **Use descriptive seed values**: Choose meaningful constant strings for easier identification
2. **Consistent naming**: Use consistent patterns for account and argument names
3. **Type safety**: Ensure argument types in seeds match the instruction argument types
4. **Testing**: Use the example IDL files to test PDA calculations

## Troubleshooting

### Common Issues

1. **PDA not calculating**: Check that all required dependencies (accounts/args) are provided
2. **Invalid seeds**: Ensure seed types match the expected format
3. **Wrong program ID**: Verify the IDL program address is correct

### Debug Information

The interface provides detailed information about:

- Which seeds are being used
- The calculated bump seed
- Any errors during PDA derivation

Check the browser console for detailed error messages if PDAs aren't calculating correctly.
