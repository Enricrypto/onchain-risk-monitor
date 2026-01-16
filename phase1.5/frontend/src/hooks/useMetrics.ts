import { useQuery } from '@tanstack/react-query';
import { getMockSummary } from '../services/mockData';
import type { SummaryResponse } from '../types';

// Fetch metrics summary
export function useMetricsSummary() {
  return useQuery<SummaryResponse>({
    queryKey: ['metrics', 'summary'],
    queryFn: async () => {
      // In production, this would call the API
      // return getSummary();

      // For now, use mock data with simulated delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockSummary();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });
}

// Get oracle prices
export function useOraclePrices() {
  const { data, ...rest } = useMetricsSummary();

  return {
    ...rest,
    data: data?.oraclePrices,
  };
}
