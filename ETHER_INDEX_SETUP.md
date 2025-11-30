# Ether Index Frontend Setup

This document describes the Ether Index frontend implementation built on Scaffold-ETH 2.

## Overview

Ether Index is a decentralized platform on Ethereum where:
- Creators can create ERC-20-based crypto index funds (vaults) with custom weights
- Investors deposit ETH to buy vault tokens for diversified exposure
- Manual rebalancing initiated by creators
- ETI token required for fund creation and rebalancing

## Pages Implemented

### 1. Home Page (`/`)
- Hero section with call-to-action buttons
- Feature cards explaining the platform
- "How It Works" section with 3 steps

### 2. Funds Listing (`/funds`)
- Browse all created index funds
- Displays fund name, symbol, TVL, and total shares
- Links to individual fund detail pages

### 3. Fund Detail (`/funds/[vaultAddress]`)
- View fund information (name, symbol, creator, fund value)
- Display fund components (tokens and weights)
- Invest form: deposit ETH to receive fund shares
- Redeem form: burn shares to withdraw ETH
- Creator actions section (for fund owners):
  - Shows ETI balance
  - Link to fund management interface

### 4. Create Fund (`/create`)
- Multi-step form:
  - Step 1: Fund metadata (name, symbol)
  - Step 2: Add ERC-20 tokens and weights (must total 100%)
  - Step 3: Review and create (requires ETI approval)
- Validates all inputs before submission
- Supports adding/removing multiple token components

## Contract Integrations

The frontend integrates with these smart contracts:

### FundFactory
- `getTotalFunds()`: Get total number of funds
- `etherIndexFunds(index)`: Get fund address by index
- `createFund()`: Create new index fund
- `creationFee()`: Get ETI fee for fund creation

### EtherIndexFund (individual vault)
- `fundName()`: Get fund name
- `fundTicker()`: Get fund symbol
- `creator()`: Get fund creator address
- `getCurrentFundValue()`: Get total fund value in ETH
- `getUnderlyingTokens()`: Get array of component tokens
- `targetProportions(token)`: Get weight % for token
- `fundTokenBalanceOf(address)`: Get user's share balance
- `buy()`: Deposit ETH to receive shares (payable)
- `sell(shares)`: Redeem shares for ETH
- `totalSupply()`: Get total fund token supply

### ETIToken
- `balanceOf(address)`: Get ETI token balance
- `approve(spender, amount)`: Approve ETI spending

## Scaffold-ETH Patterns Used

- `useScaffoldReadContract`: Read contract state
- `useScaffoldWriteContract`: Execute contract transactions
- Automatic ABI loading from `deployedContracts.ts`
- Built-in transaction notifications
- Wallet connection via RainbowKit

## Next Steps

1. **Update Contract Addresses**:
   - The current implementation assumes contracts are deployed
   - Update addresses in `deployedContracts.ts` after deployment

2. **Add Fund Management Page** (`/funds/[vaultAddress]/manage`):
   - Rebalancing interface for creators
   - Edit token weights
   - Execute rebalance transaction

3. **MetaMask Embedded Wallet Integration**:
   - Configure social login (Gmail)
   - Update wagmi connector configuration

4. **Enhanced Features**:
   - Search and filter funds
   - Portfolio dashboard for user holdings
   - Historical performance charts
   - Token price displays using price oracles

5. **Fix Dependency Issue**:
   - Updated `next-themes` to v0.4.4 for React 19 compatibility
   - Run `yarn install` to install dependencies

## Development

```bash
# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts (in another terminal)
yarn deploy

# Start frontend (in another terminal)
yarn start
```

Visit `http://localhost:3000` to see the Ether Index UI.

## Notes

- All pages use Scaffold-ETH 2's existing components and hooks
- TailwindCSS + DaisyUI for styling
- Responsive design for mobile and desktop
- Error handling with user-friendly notifications
- Form validation on all input pages
