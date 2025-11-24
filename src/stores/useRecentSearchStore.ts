import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentSearchState {
    recentAirlines: string[];
    recentAirports: string[];
    addRecentAirline: (code: string) => void;
    addRecentAirport: (code: string) => void;
}

export const useRecentSearchStore = create<RecentSearchState>()(
    persist(
        (set) => ({
            recentAirlines: [],
            recentAirports: [],
            addRecentAirline: (code) => set((state) => {
                const filtered = state.recentAirlines.filter(c => c !== code);
                return { recentAirlines: [code, ...filtered].slice(0, 5) };
            }),
            addRecentAirport: (code) => set((state) => {
                const filtered = state.recentAirports.filter(c => c !== code);
                return { recentAirports: [code, ...filtered].slice(0, 5) };
            }),
        }),
        {
            name: 'flight-recent-searches',
        }
    )
);
