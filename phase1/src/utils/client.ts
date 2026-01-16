import { createPublicClient, http, type PublicClient, type Address } from 'viem';
import { sepolia } from 'viem/chains';
import { config } from './config';
import { AAVE_POOL_ABI, AAVE_POOL_DATA_PROVIDER_ABI, ERC20_ABI } from './aaveAbi';
import { logger } from './logger';

let publicClient: PublicClient | null = null;

export function getClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(config.rpcUrl, {
        retryCount: 3,
        retryDelay: 1000,
        timeout: 30000,
      }),
    });
    logger.info('Viem client initialized', { rpcUrl: config.rpcUrl.substring(0, 50) + '...' });
  }
  return publicClient;
}

export function getAavePoolContract() {
  const client = getClient();
  return {
    address: config.aavePoolAddress as Address,
    abi: AAVE_POOL_ABI,
    client,
  };
}

export function getAaveDataProviderContract() {
  const client = getClient();
  return {
    address: config.aavePoolDataProvider as Address,
    abi: AAVE_POOL_DATA_PROVIDER_ABI,
    client,
  };
}

export async function getBlockNumber(): Promise<bigint> {
  const client = getClient();
  return client.getBlockNumber();
}

export async function getBlock(blockNumber: bigint) {
  const client = getClient();
  return client.getBlock({ blockNumber });
}

export async function getReservesList(): Promise<Address[]> {
  const client = getClient();
  const pool = getAavePoolContract();

  const reserves = await client.readContract({
    address: pool.address,
    abi: pool.abi,
    functionName: 'getReservesList',
  });

  return reserves as Address[];
}

export async function getAllReservesTokens(): Promise<Array<{ symbol: string; tokenAddress: Address }>> {
  const client = getClient();
  const dataProvider = getAaveDataProviderContract();

  const tokens = await client.readContract({
    address: dataProvider.address,
    abi: dataProvider.abi,
    functionName: 'getAllReservesTokens',
  });

  return tokens as Array<{ symbol: string; tokenAddress: Address }>;
}

export async function getReserveData(asset: Address) {
  const client = getClient();
  const dataProvider = getAaveDataProviderContract();

  return client.readContract({
    address: dataProvider.address,
    abi: dataProvider.abi,
    functionName: 'getReserveData',
    args: [asset],
  });
}

export async function getUserAccountData(user: Address) {
  const client = getClient();
  const pool = getAavePoolContract();

  return client.readContract({
    address: pool.address,
    abi: pool.abi,
    functionName: 'getUserAccountData',
    args: [user],
  });
}

export async function getTokenInfo(tokenAddress: Address): Promise<{ symbol: string; decimals: number }> {
  const client = getClient();

  const [symbol, decimals] = await Promise.all([
    client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol',
    }),
    client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }),
  ]);

  return { symbol: symbol as string, decimals: decimals as number };
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getClient();
    const blockNumber = await client.getBlockNumber();
    logger.info('RPC connection test successful', { blockNumber: blockNumber.toString() });
    return true;
  } catch (error) {
    logger.error('RPC connection test failed', { error });
    return false;
  }
}
