import { useQuery } from '@tanstack/react-query';
import { fetchFlights } from '../services/api';
import type { FlightSearchParams, FlightResult } from '../types';

export function useFlightSearch(params: Partial<FlightSearchParams>) {
    const isEnabled = !!(
        params.date &&
        params.airline &&
        params.origin &&
        params.destination &&
        (params.apiKey || true) // Demo mode might not need key, but let service handle validation
    );

    return useQuery<FlightResult[], Error>({
        queryKey: ['flights', params],
        queryFn: () => fetchFlights(params as FlightSearchParams),
        enabled: isEnabled,
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 1,
    });
}
