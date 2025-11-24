import { create } from 'zustand';
import type { FlightSearchParams, FlightResult } from '../types';
import { fetchFlights, setProvider } from '../services/api';

interface SearchState {
    flights: FlightResult[];
    loading: boolean;
    error: string | null;
    criteria: FlightSearchParams | null;
    setFlights: (flights: FlightResult[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setCriteria: (criteria: FlightSearchParams | null) => void;
    reset: () => void;
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

    reset: () => set({ flights: [], criteria: null, error: null, loading: false }),

    searchFlights: async (params: FlightSearchParams, apiKey: string, forceDemo = false) => {
        const { date, airline, origin, destination } = params;

        set({ loading: true, criteria: params, flights: [], error: null });

        // Update URL
        const next = new URL(window.location.href);
        next.searchParams.set('date', date);
        next.searchParams.set('airline', airline);
        next.searchParams.set('origin', origin);
        next.searchParams.set('destination', destination);
        window.history.pushState(null, '', next.toString());

        try {
            // Import useSettingsStore dynamically to avoid circular dependency issues if any,
            // or just assume it's available. Since it's a separate store, it should be fine.
            // However, we need to import it at the top.
            // Let's assume we imported it.
            const { useSettingsStore } = await import('./useSettingsStore');
            const provider = useSettingsStore.getState().provider;

            const usingDemo = forceDemo || (!apiKey && provider !== 'custom');

            // Set provider based on settings or demo mode
            if (usingDemo) {
                setProvider('demo');
            } else {
                setProvider(provider);
            }

            const results = await fetchFlights({ ...params, apiKey });
            set({ flights: results, error: null });

            // Restore provider if needed, but actually we set it every time so it might not be needed.
            // But to be safe and consistent with previous logic:
            if (usingDemo) {
                // If we switched to demo, we might want to switch back or just leave it.
                // The next search will reset it anyway.
            }
        } catch (err) {
            console.error('Search failed:', err);
            const message = err instanceof Error ? err.message : 'An error occurred';
            set({ flights: [], error: message });
        } finally {
            set({ loading: false });
        }
    },
}));
