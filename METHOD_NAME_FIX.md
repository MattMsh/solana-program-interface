# Method Name Conversion Fix

## Problem

When trying to execute instructions from custom IDLs, users encountered the error:

```
Method 'set_create_pool_fee' not found on program
```

Even though the method existed in the IDL, it wasn't found in the program's methods object.

## Root Cause

**Anchor automatically converts snake_case instruction names to camelCase method names in the JavaScript SDK.**

- IDL instruction name: `set_create_pool_fee` (snake_case)
- Program method name: `setCreatePoolFee` (camelCase)

## Solution

### 1. Method Name Conversion

Added automatic conversion from snake_case to camelCase:

```typescript
// New utility function in src/utils/solana.ts
export function convertToCamelCase(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
```

### 2. Intelligent Method Lookup

Updated InstructionForm to try both naming conventions:

```typescript
// Convert instruction name to camelCase
const camelCaseMethodName = convertToCamelCase(instruction.name);

// Try camelCase first, fall back to original
const methodName =
  program.methods && (program.methods as any)[camelCaseMethodName]
    ? camelCaseMethodName
    : instruction.name;

// Use the correct method name for the instruction
const instructionBuilder = (program.methods as any)[methodName](...args);
```

### 3. Enhanced Error Messages

Now shows both the original and converted method names for better debugging:

```
Method 'set_create_pool_fee' (setCreatePoolFee) not found on program.

Available methods: addRewardToken, claimReward, createGlobalPool, setCreatePoolFee, ...
```

## Examples of Conversions

| IDL Name (snake_case)   | Program Method (camelCase) |
| ----------------------- | -------------------------- |
| `set_create_pool_fee`   | `setCreatePoolFee`         |
| `add_reward_token`      | `addRewardToken`           |
| `claim_reward_global`   | `claimRewardGlobal`        |
| `create_global_pool`    | `createGlobalPool`         |
| `set_minimum_stake_fee` | `setMinimumStakeFee`       |
| `stake_global`          | `stakeGlobal`              |
| `withdraw_global`       | `withdrawGlobal`           |

## Impact

✅ **Fixed**: All snake_case instruction names from IDLs now work correctly  
✅ **Backward Compatible**: Still supports instructions that are already in camelCase  
✅ **Better Debugging**: Clear error messages showing both naming conventions  
✅ **Future Proof**: Handles any snake_case to camelCase conversion automatically

## Technical Details

- **Location**: `src/components/InstructionForm.tsx` and `src/utils/solana.ts`
- **Method**: Uses regex replacement `/_([a-z])/g` to convert `_x` to `X`
- **Fallback**: If camelCase method doesn't exist, tries original name
- **Error Handling**: Shows available methods for easier debugging

This fix ensures that users can now successfully execute instructions from any custom IDL, regardless of whether the instruction names are in snake_case or camelCase format.
