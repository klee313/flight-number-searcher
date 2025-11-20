import { create } from 'zustand';
import type { FlightSearchParams, FlightResult } from '../types';
import { fetchFlights, setProvider, PROVIDER } from '../services/api';

interface SearchState {
    flights: FlightResult[];
    loading: boolean;
    error: string | null;
    criteria: FlightSearchParams | null;
    setFlights: (flights: FlightResult[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setCriteria: (criteria: FlightSearchParams | null) => void;
    searchFlights: (params: FlightSearchParams, apiKey: string, forceDemo?: boolean) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
    flights: [],
    loading: false,
    error: null,
    criteria: null,
    setFlights: (flights) => set({ flights }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setCriteria: (criteria) => set({ criteria }),

    searchFlights: async (params: FlightSearchParams, apiKey: string, forceDemo = false) => {
        const { date, airline, origin, destination } = params;

        set({ loading: true, criteria: params, flights: [], error: null });

        // Update URL
        const next = new URL(window.location.href);
        next.searchParams.set('date', date);
        next.searchParams.set('airline', airline);
        next.searchParams.set('origin', origin);
        next.searchParams.set('destination', destination);
        window.history.replaceState(null, '', next.toString());

        try {
            const usingDemo = forceDemo || (!apiKey && PROVIDER !== 'custom');
            const prevProvider = PROVIDER;
            if (usingDemo) setProvider('demo');

            const results = await fetchFlights({ ...params, apiKey });
            set({ flights: results, error: null });

            if (usingDemo) setProvider(prevProvider);
        } catch (err) {
            console.error('Search failed:', err);
            const message = err instanceof Error ? err.message : 'An error occurred';
            set({ flights: [], error: message });
        } finally {
            set({ loading: false });
        }
    },
}));
