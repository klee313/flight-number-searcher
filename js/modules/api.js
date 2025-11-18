import { sleep } from './utils.js';

// 제공자 선택: 'aviationstack' | 'airlabs' | 'custom' | 'demo'
export let PROVIDER = 'aviationstack';

export function setProvider(p) {
    PROVIDER = p;
}

/**
 * 표준화된 입력으로 항공편명 배열 반환
 * @param {{date:string, airline:string, origin:string, destination:string, apiKey?:string}} p
 * @returns {Promise<string[]>} ex) ["KE701","KE703"]
 */
export async function fetchFlights(p) {
    const { date, airline, origin, destination, apiKey } = p;
    if (PROVIDER === 'demo') {
        // --- DEMO 모드: 실제 호출 없이 예시 데이터 반환 ---
        console.log('🎭 DEMO Mode: Using sample data');
        console.log('📝 Query:', { date, airline, origin, destination });
        await sleep(500);
        const demoMap = {
            'KE:ICN-NRT': ['KE701', 'KE703', 'KE705'],
            'OZ:ICN-NRT': ['OZ102', 'OZ104'],
            'JL:ICN-HND': ['JL090', 'JL092'],
            'NH:ICN-HND': ['NH862', 'NH864'],
            'SQ:ICN-SIN': ['SQ605', 'SQ607'],
            'DL:ICN-LAX': ['DL200', 'DL202'],
            'KE:LAX-ICN': ['KE012', 'KE018'],
        };
        const key = `${airline}:${origin}-${destination}`;
        const base = demoMap[key] || ['XX100', 'XX102'];
        // 날짜에 따라 약간 다르게
        const salt = Number(date.replaceAll('-', '')) % 2;
        const result = salt ? base : base.slice(0, Math.max(1, base.length - 1));
        console.log('✈️ DEMO Flight Numbers:', result);
        return result;
    }
    if (PROVIDER === 'aviationstack') {
        if (!apiKey) throw new Error('API 키가 필요합니다.');
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
            .map(item => item?.flight?.iata || (item?.airline?.iata && item?.flight?.number ? `${item.airline.iata}${item.flight.number}` : null))
            .filter(Boolean);
        console.log('✈️ Parsed Flight Numbers:', flights);
        const uniqueFlights = Array.from(new Set(flights)).sort();
        console.log('📋 Final Flight List:', uniqueFlights);
        return uniqueFlights;
    }
    if (PROVIDER === 'airlabs') {
        if (!apiKey) throw new Error('API 키가 필요합니다.');
        // 참고: Airlabs API
        // endpoint: [https://airlabs.co/api/v9/schedules](https://airlabs.co/api/v9/schedules)
        // params: api_key, dep_iata, arr_iata, airline_iata
        // Note: Returns schedules from current time + 10 hours (no date parameter needed)
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
        // 방어적 파싱 - Airlabs API response structure
        const flights = (data?.response || [])
            .map(item => item?.flight_iata || item?.flight_number || null)
            .filter(Boolean);
        console.log('✈️ Parsed Flight Numbers:', flights);
        // 중복 제거 + 정렬
        const uniqueFlights = Array.from(new Set(flights)).sort();
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
