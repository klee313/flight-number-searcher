import { create } from 'zustand';
import type { FlightResult } from '../types';

interface UIState {
    isSettingsOpen: boolean;
    selectedFlight: FlightResult | null;
    openSettings: () => void;
    closeSettings: () => void;
    selectFlight: (flight: FlightResult) => void;
    clearSelectedFlight: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsOpen: false,
    selectedFlight: null,
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    selectFlight: (flight) => set({ selectedFlight: flight }),
    clearSelectedFlight: () => set({ selectedFlight: null }),
}));
