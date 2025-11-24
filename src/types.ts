// API Types
export interface FlightSearchParams {
    date: string;
    airline: string;
    origin: string;
    destination: string;
    apiKey?: string;
}

export interface FlightResult {
    flightNumber: string;
    airline: string | null;
    origin: string | null;
    destination: string | null;
    departureEpoch?: number | null;
    departureTimeLocalISO?: string | null;
    departureTimeText?: string | null;
}

export type Provider = 'airlabs' | 'aviationstack' | 'flightapi' | 'custom' | 'demo';
