import type {
  PositionsResponse,
  AlertsResponse,
  SummaryResponse,
  Position,
  SimulationResult,
  PriceSimulation,
  OraclePrices,
} from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.statusText}`);
  }

  return response.json();
}

// Positions API
export async function getPositions(): Promise<PositionsResponse> {
  return fetchApi<PositionsResponse>('/positions');
}

export async function getPosition(address: string): Promise<Position> {
  return fetchApi<Position>(`/positions/${address}`);
}

// Alerts API
export async function getAlerts(limit?: number): Promise<AlertsResponse> {
  const params = limit ? `?limit=${limit}` : '';
  return fetchApi<AlertsResponse>(`/alerts${params}`);
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await fetchApi(`/alerts/${id}/acknowledge`, { method: 'POST' });
}

// Metrics API
export async function getSummary(): Promise<SummaryResponse> {
  return fetchApi<SummaryResponse>('/metrics/summary');
}

// Oracle API
export async function getOraclePrices(): Promise<OraclePrices> {
  return fetchApi<OraclePrices>('/oracle/prices');
}

// Simulation API
export async function simulatePriceDrop(
  positionId: string,
  simulation: PriceSimulation
): Promise<SimulationResult> {
  return fetchApi<SimulationResult>(`/simulate/price-drop`, {
    method: 'POST',
    body: JSON.stringify({ positionId, ...simulation }),
  });
}

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: number }> {
  return fetchApi('/health');
}
