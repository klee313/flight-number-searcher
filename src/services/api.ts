import { sleep } from '../utils/utils.js';
import type { FlightSearchParams, FlightResult, Provider } from '../types';
import i18n from '../i18n';

// 제공자 선택: 'airlabs' | 'aviationstack' | 'custom' | 'demo'
export let PROVIDER: Provider = 'airlabs';

export function setProvider(p: Provider): void {
    PROVIDER = p;
}

/**
 * 표준화된 입력으로 항공편명 배열 반환
 * @param {{date:string, airline:string, origin:string, destination:string, apiKey?:string}} p
 * @returns {Promise<string[]>} ex) ["KE701","KE703"]
 */
export async function fetchFlights(p: FlightSearchParams): Promise<FlightResult[]> {
    const { date, airline, origin, destination } = p;

    // 1. 캐시 키 생성
    const cacheKey = `flight_cache_${PROVIDER}_${date}_${airline}_${origin}_${destination}`;

    // 2. 캐시 확인
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            // 1시간(3600000ms) 유효기간
            if (Date.now() - timestamp < 3600 * 1000) {
                console.log('📦 Using cached data for:', cacheKey);
                return data;
            } else {
                console.log('⌛ Cache expired for:', cacheKey);
                localStorage.removeItem(cacheKey);
            }
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }

    // 3. 실제 데이터 요청 (내부 함수로 분리하거나 기존 로직 실행)
    const result = await fetchFlightsFromProvider(p);

    // 4. 캐시 저장
    if (result && result.length > 0) {
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: result
            }));
            console.log('💾 Data cached:', cacheKey);
        } catch (e) {
            console.warn('Cache write error (quota exceeded?):', e);
        }
    }

    return result;
}

// 기존 fetchFlights 로직을 이 함수로 이동
export async function fetchFlightsFromProvider(p: FlightSearchParams): Promise<FlightResult[]> {
    const { date, airline, origin, destination, apiKey } = p;

    if (PROVIDER === 'demo') {
        // --- DEMO 모드: 실제 호출 없이 예시 데이터 반환 ---
        console.log('🎭 DEMO Mode: Using sample data');
        console.log('📝 Query:', { date, airline, origin, destination });
        await sleep(500);
        const demoMap = {
            'KE:ICN-NRT': [
                { fn: 'KE701', time: '09:00' },
                { fn: 'KE703', time: '10:10' },
                { fn: 'KE705', time: '14:30' }
            ],
            'OZ:ICN-NRT': [
                { fn: 'OZ102', time: '09:00' },
                { fn: 'OZ104', time: '12:20' }
            ],
            'JL:ICN-HND': [
                { fn: 'JL090', time: '08:00' },
                { fn: 'JL092', time: '12:05' }
            ],
            'NH:ICN-HND': [
                { fn: 'NH862', time: '07:45' },
                { fn: 'NH864', time: '12:30' }
            ],
            'SQ:ICN-SIN': [
                { fn: 'SQ605', time: '23:15' },
                { fn: 'SQ607', time: '09:00' }
            ],
            'DL:ICN-LAX': [
                { fn: 'DL200', time: '20:40' },
                { fn: 'DL202', time: '14:30' }
            ],
            'KE:LAX-ICN': [
                { fn: 'KE012', time: '23:50' },
                { fn: 'KE018', time: '11:30' }
            ],
        };
        const key = `${airline}:${origin}-${destination}`;
        const base = (demoMap as Record<string, Array<{ fn: string; time: string }>>)[key] || [{ fn: 'XX100', time: '10:00' }, { fn: 'XX102', time: '14:00' }];
        // 날짜에 따라 약간 다르게
        const salt = Number(date.replaceAll('-', '')) % 2;
        const list = salt ? base : base.slice(0, Math.max(1, base.length - 1));

        const result = list.map((item: { fn: string; time: string }) => ({
            flightNumber: item.fn,
            airline: airline || 'XX',
            origin: origin || 'ORG',
            destination: destination || 'DES',
            departureTimeText: item.time
        }));

        // Sort by time
        result.sort((a, b) => {
            if (!a.departureTimeText) return 1;
            if (!b.departureTimeText) return -1;
            return a.departureTimeText.localeCompare(b.departureTimeText);
        });

        console.log('✈️ DEMO Flight Numbers:', result);
        return result;
    }


    if (PROVIDER === 'flightapi') {
        if (!apiKey) throw new Error(i18n.t('errApiKeyRequired'));
        // FlightAPI.io Schedule API
        // endpoint: https://api.flightapi.io/schedule/{API_KEY}
        // params: mode=departures, day=YYYY-MM-DD, iata=ORIGIN_IATA

        const url = new URL(`https://api.flightapi.io/schedule/${apiKey}`);

        // Determine mode based on available parameters
        // If we have origin, we look for departures from there.
        // If we only have destination, we look for arrivals there.
        if (origin) {
            url.searchParams.set('mode', 'departures');
            url.searchParams.set('iata', origin);
        } else if (destination) {
            url.searchParams.set('mode', 'arrivals');
            url.searchParams.set('iata', destination);
        } else {
            throw new Error(i18n.t('errOriginOrDestRequired'));
        }

        if (date) url.searchParams.set('day', date);

        console.log('🛫 FlightAPI Request:', url.toString());
        const res = await fetch(url.toString());

        if (!res.ok) {
            console.error('❌ API Error:', res.status, res.statusText);
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ FlightAPI Response:', data);

        // FlightAPI response mapping
        // Structure: [ { airport: { pluginData: { schedule: { departures: { data: [...] } } } } } ]
        // or sometimes directly data array depending on endpoint version, but based on previous implementation:
        // The previous implementation used a specific parsing logic. Let's assume standard structure.
        // Actually, based on documentation or common usage:
        // It usually returns a list of flights.

        // Let's try to map safely.
        // FlightAPI response structure can vary based on mode
        // Departures: airport.pluginData.schedule.departures.data
        // Arrivals: airport.pluginData.schedule.arrivals.data
        const schedule = data?.[0]?.airport?.pluginData?.schedule;
        const list = (origin ? schedule?.departures?.data : schedule?.arrivals?.data) || [];

        const flights: FlightResult[] = list
            .map((item: any) => {
                // Filter by airline if specified
                const airlineCode = item.flight?.airline?.iata;
                if (airline && airlineCode !== airline) return null;

                // Filter by destination if specified
                const destCode = item.flight?.arrival?.iata;
                if (destination && destCode !== destination) return null;

                const flightNumber = item.flight?.airline?.iata && item.flight?.number
                    ? `${item.flight.airline.iata}${item.flight.number}`
                    : null;

                if (!flightNumber) return null;

                return {
                    flightNumber: flightNumber,
                    airline: airlineCode || null,
                    origin: origin || null, // We queried by origin, so it matches
                    destination: destCode || null,
                    departureTimeText: item.flight?.departure?.scheduled?.time || null
                };
            })
            .filter((f: FlightResult | null) => f !== null);

        // Sort by time
        flights.sort((a, b) => {
            if (!a.departureTimeText) return 1;
            if (!b.departureTimeText) return -1;
            return a.departureTimeText.localeCompare(b.departureTimeText);
        });

        console.log('✈️ Parsed Flight Results:', flights);
        return flights;
    }

    if (PROVIDER === 'aviationstack') {
        if (!apiKey) throw new Error(i18n.t('errApiKeyRequired'));
        // Aviationstack Flights API
        // endpoint: http://api.aviationstack.com/v1/flights
        // params: access_key, dep_iata, arr_iata, airline_iata, flight_date (YYYY-MM-DD), flight_status
        // Use HTTPS to avoid mixed content when site is served over HTTPS (e.g., GitHub Pages)
        const url = new URL('https://api.aviationstack.com/v1/flights');
        url.searchParams.set('access_key', apiKey);
        if (origin) url.searchParams.set('dep_iata', origin);
        if (destination) url.searchParams.set('arr_iata', destination);
        if (airline) url.searchParams.set('airline_iata', airline);
        if (date) url.searchParams.set('flight_date', date);
        // Use scheduled by default as per example
        url.searchParams.set('flight_status', 'scheduled');
        console.log('🛫 Aviationstack API Request:', url.toString());
        const res = await fetch(url.toString());
        if (!res.ok) {
            console.error('❌ API Error:', res.status, res.statusText);
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('✅ Aviationstack API Response:', data);
        // Handle Aviationstack error payloads that still return 200
        if (data && data.error) {
            const type = data.error.type || '';
            const info = data.error.info || 'API error';
            if (type === 'https_access_restricted') {
                throw new Error('Aviationstack HTTPS access is restricted on your plan. Use a proxy, serve this page over HTTP, or upgrade your plan.');
            }
            throw new Error(info);
        }
        // Aviationstack response structure: { data: [ { flight: { iata, number }, ... } ] }
        const flights = (data?.data || [])
            .map((item: any) => item?.flight?.iata || (item?.airline?.iata && item?.flight?.number ? `${item.airline.iata}${item.flight.number}` : null))
            .filter(Boolean) as string[];
        console.log('✈️ Parsed Flight Numbers:', flights);
        const uniqueFlights = Array.from(new Set(flights)).sort();
        console.log('📋 Final Flight List:', uniqueFlights);
        return uniqueFlights.map(fn => ({ flightNumber: fn, airline: null, origin: null, destination: null }));
    }
    if (PROVIDER === 'airlabs') {
        if (!apiKey) throw new Error(i18n.t('errApiKeyRequired'));
        // Airlabs API
        // endpoint: https://airlabs.co/api/v9/schedules
        // params: api_key, dep_iata, arr_iata, airline_iata
        const url = new URL('https://airlabs.co/api/v9/schedules');
        url.searchParams.set('api_key', apiKey);
        if (origin) url.searchParams.set('dep_iata', origin);
        if (destination) url.searchParams.set('arr_iata', destination);
        if (airline) url.searchParams.set('airline_iata', airline);

        console.log('🛫 Airlabs API Request:', url.toString());
        const res = await fetch(url.toString());

        if (!res.ok) {
            console.error('❌ API Error:', res.status, res.statusText);
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ Airlabs API Response:', data);

        // AirLabs response mapping
        const flights: FlightResult[] = (data?.response || [])
            .map((item: any) => {
                const flightNumber = item.flight_iata || (item.airline_iata && item.flight_number ? `${item.airline_iata}${item.flight_number}` : null);
                if (!flightNumber) return null;

                // dep_time example: "2025-11-23 23:40"
                const depTimeStr = item.dep_time || '';
                let departureTimeText = null;
                if (depTimeStr && depTimeStr.length >= 16) {
                    // Extract HH:MM from "YYYY-MM-DD HH:MM"
                    departureTimeText = depTimeStr.slice(11, 16);
                }

                return {
                    flightNumber: flightNumber,
                    airline: item.airline_iata || null,
                    origin: item.dep_iata || null,
                    destination: item.arr_iata || null,
                    departureEpoch: item.dep_time_ts || null,
                    departureTimeLocalISO: item.dep_time || null, // Keeping original format "YYYY-MM-DD HH:MM" as it's close enough to ISO for display or can be parsed
                    departureTimeText: departureTimeText
                };
            })
            .filter((f: FlightResult | null) => f !== null) as FlightResult[];

        console.log('✈️ Parsed Flight Results:', flights);

        // 중복 제거 (flightNumber + departureTimeText 기준)
        const seen = new Set();
        const uniqueFlights = flights.filter((item) => {
            const key = `${item.flightNumber}|${item.departureTimeText || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // 시간순 정렬 (departureEpoch 기준)
        uniqueFlights.sort((a, b) => {
            const t1 = a.departureEpoch || 0;
            const t2 = b.departureEpoch || 0;
            return t1 - t2;
        });

        console.log('📋 Final Flight List:', uniqueFlights);
        return uniqueFlights;
    }
    if (PROVIDER === 'custom') {
        // 사내/다른 API에 맞게 수정
        // const res = await fetch('/your-endpoint?date=...&airline=...&origin=...&destination=...');
        // const data = await res.json();
        // return data.flightNumbers; // ["KE701", ...]
        throw new Error('custom 제공자는 구현 필요');
    }
    throw new Error('알 수 없는 제공자');
}
