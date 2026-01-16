import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMockAlerts } from '../services/mockData';
import type { AlertsResponse } from '../types';

// Fetch alerts
export function useAlerts(limit?: number) {
  return useQuery<AlertsResponse>({
    queryKey: ['alerts', limit],
    queryFn: async () => {
      // In production, this would call the API
      // return getAlerts(limit);

      // For now, use mock data with simulated delay
      await new Promise((resolve) => setTimeout(resolve, 400));
      return getMockAlerts(limit);
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 5000,
  });
}

// Acknowledge an alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      // In production, this would call the API
      // return acknowledgeAlert(alertId);

      // For now, simulate the action
      await new Promise((resolve) => setTimeout(resolve, 200));
      return alertId;
    },
    onSuccess: (alertId) => {
      // Optimistically update the alerts cache
      queryClient.setQueryData<AlertsResponse>(['alerts', undefined], (old) => {
        if (!old) return old;
        return {
          ...old,
          alerts: old.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
        };
      });
    },
  });
}

// Get active alerts count
export function useActiveAlertsCount() {
  const { data } = useAlerts();

  const activeCount =
    data?.alerts.filter((alert) => !alert.acknowledged).length || 0;
  const criticalCount =
    data?.alerts.filter(
      (alert) => alert.severity === 'critical' && !alert.acknowledged
    ).length || 0;

  return {
    activeCount,
    criticalCount,
    hasActiveAlerts: activeCount > 0,
    hasCriticalAlerts: criticalCount > 0,
  };
}
