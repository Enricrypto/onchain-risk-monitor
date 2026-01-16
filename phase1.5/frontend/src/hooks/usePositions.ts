import { useQuery } from '@tanstack/react-query';
import { getMockPositions, getMockPosition } from '../services/mockData';
import type { Position, PositionsResponse } from '../types';

// Fetch all positions
export function usePositions() {
  return useQuery<PositionsResponse>({
    queryKey: ['positions'],
    queryFn: async () => {
      // In production, this would call the API
      // return getPositions();

      // For now, use mock data with simulated delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockPositions();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}

// Fetch a single position by ID or address
export function usePosition(idOrAddress: string | undefined) {
  return useQuery<Position | undefined>({
    queryKey: ['position', idOrAddress],
    queryFn: async () => {
      if (!idOrAddress) return undefined;

      // In production, this would call the API
      // return getPosition(idOrAddress);

      // For now, use mock data with simulated delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockPosition(idOrAddress);
    },
    enabled: !!idOrAddress,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 5000,
  });
}

// Get positions by risk level
export function usePositionsByRisk() {
  const { data, ...rest } = usePositions();

  const positions = data?.positions || [];

  const healthy = positions.filter((p) => p.healthFactor >= 2.0);
  const atRisk = positions.filter(
    (p) => p.healthFactor >= 1.2 && p.healthFactor < 2.0
  );
  const critical = positions.filter((p) => p.healthFactor < 1.2);

  return {
    ...rest,
    data: {
      healthy,
      atRisk,
      critical,
      all: positions,
    },
  };
}
