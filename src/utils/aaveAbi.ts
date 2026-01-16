// Aave V3 Pool ABI (relevant functions and events)
export const AAVE_POOL_ABI = [
  // View functions
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      {
        components: [
          { name: 'configuration', type: 'uint256' },
          { name: 'liquidityIndex', type: 'uint128' },
          { name: 'currentLiquidityRate', type: 'uint128' },
          { name: 'variableBorrowIndex', type: 'uint128' },
          { name: 'currentVariableBorrowRate', type: 'uint128' },
          { name: 'currentStableBorrowRate', type: 'uint128' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'id', type: 'uint16' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReservesList',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'target', type: 'address' },
      { indexed: false, name: 'initiator', type: 'address' },
      { indexed: true, name: 'asset', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'interestRateMode', type: 'uint8' },
      { indexed: false, name: 'premium', type: 'uint256' },
      { indexed: true, name: 'referralCode', type: 'uint16' },
    ],
    name: 'FlashLoan',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'collateralAsset', type: 'address' },
      { indexed: true, name: 'debtAsset', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'debtToCover', type: 'uint256' },
      { indexed: false, name: 'liquidatedCollateralAmount', type: 'uint256' },
      { indexed: false, name: 'liquidator', type: 'address' },
      { indexed: false, name: 'receiveAToken', type: 'bool' },
    ],
    name: 'LiquidationCall',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: false, name: 'user', type: 'address' },
      { indexed: true, name: 'onBehalfOf', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: true, name: 'referralCode', type: 'uint16' },
    ],
    name: 'Supply',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: false, name: 'user', type: 'address' },
      { indexed: true, name: 'onBehalfOf', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'interestRateMode', type: 'uint8' },
      { indexed: false, name: 'borrowRate', type: 'uint256' },
      { indexed: true, name: 'referralCode', type: 'uint16' },
    ],
    name: 'Borrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'reserve', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'repayer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'useATokens', type: 'bool' },
    ],
    name: 'Repay',
    type: 'event',
  },
] as const;

// Aave V3 Pool Data Provider ABI
export const AAVE_POOL_DATA_PROVIDER_ABI = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveTokensAddresses',
    outputs: [
      { name: 'aTokenAddress', type: 'address' },
      { name: 'stableDebtTokenAddress', type: 'address' },
      { name: 'variableDebtTokenAddress', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      { name: 'unbacked', type: 'uint256' },
      { name: 'accruedToTreasuryScaled', type: 'uint256' },
      { name: 'totalAToken', type: 'uint256' },
      { name: 'totalStableDebt', type: 'uint256' },
      { name: 'totalVariableDebt', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'variableBorrowRate', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'averageStableBorrowRate', type: 'uint256' },
      { name: 'liquidityIndex', type: 'uint256' },
      { name: 'variableBorrowIndex', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllReservesTokens',
    outputs: [
      {
        components: [
          { name: 'symbol', type: 'string' },
          { name: 'tokenAddress', type: 'address' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserReserveData',
    outputs: [
      { name: 'currentATokenBalance', type: 'uint256' },
      { name: 'currentStableDebt', type: 'uint256' },
      { name: 'currentVariableDebt', type: 'uint256' },
      { name: 'principalStableDebt', type: 'uint256' },
      { name: 'scaledVariableDebt', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'stableRateLastUpdated', type: 'uint40' },
      { name: 'usageAsCollateralEnabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI for token info
export const ERC20_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
