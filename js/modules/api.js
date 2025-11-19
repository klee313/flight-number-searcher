import { sleep } from './utils.js';

// 제공자 선택: 'flightapi' | 'aviationstack' | 'airlabs' | 'custom' | 'demo'
export let PROVIDER = 'flightapi';

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
    if (PROVIDER === 'flightapi') {
        if (!apiKey) throw new Error('API 키가 필요합니다.');
        if (!origin) throw new Error('출발지 공항 IATA 코드가 필요합니다.');

        // FlightAPI.io Schedule API
        // Example:
        //   https://api.flightapi.io/schedule/{API_KEY}?mode=departures&iata=TBS&day=1
        //
        // - mode: departures (출발편 기준 조회)
        // - iata: 공항 IATA 코드 (여기서는 origin)
        // - day: 오늘을 기준으로 한 날짜 오프셋 (대략적인 매핑)
        const url = new URL(`https://api.flightapi.io/schedule/${encodeURIComponent(apiKey)}`);

        // 항상 출발편 기준으로 조회
        const mode = 'departures';
        url.searchParams.set('mode', mode);
        url.searchParams.set('iata', origin);

        // date(YYYY-MM-DD)를 오늘 기준 상대 일수로 변환해서 day 파라미터로 사용
        // FlightAPI.io 요구사항: day 최소값은 1 (오늘).
        if (date) {
            const today = new Date();
            const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const target = new Date(date + 'T00:00:00');
            const diffDays = Math.round((target.getTime() - todayLocal.getTime()) / 86400000);
            // 오늘 = 1, 내일 = 2 ... 과 같이 매핑하고,
            // 과거 날짜는 최소값 1로 클램프한다.
            const dayParam = Math.max(1, diffDays + 1);
            url.searchParams.set('day', String(dayParam));
        }

        console.log('🛫 FlightAPI.io Schedule Request:', url.toString());
        const res = await fetch(url.toString());
        if (!res.ok) {
            console.error('❌ FlightAPI.io HTTP Error:', res.status, res.statusText);
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('✅ FlightAPI.io Schedule Response:', data);

        // 방어적 파싱: departures 리스트
        const scheduleItems =
            data?.airport?.pluginData?.schedule?.[mode]?.data ||
            data?.airport?.pluginData?.schedule?.departures?.data ||
            [];
        console.log('📊 FlightAPI.io schedule items (raw count):', Array.isArray(scheduleItems) ? scheduleItems.length : 0);

        // 항공편명 리스트 추출 + 조건 필터링
        const flights = scheduleItems
            .map(item => item?.flight)
            .filter(Boolean)
            .filter(f => {
                // 항공사 필터
                if (airline) {
                    const code = f.airline?.code?.iata || f.owner?.code?.iata;
                    if (!code || code.toUpperCase() !== airline.toUpperCase()) return false;
                }
                // 도착 공항 필터
                if (destination) {
                    const destCode = f.airport?.destination?.code?.iata;
                    if (!destCode || destCode.toUpperCase() !== destination.toUpperCase()) return false;
                }
                // 날짜 필터 (스케줄 출발 시각 기준, YYYY-MM-DD 매칭)
                if (date) {
                    const flightId =
                        f.identification?.number?.default ||
                        `${(f.airline?.code?.iata || f.owner?.code?.iata || '??').toUpperCase()}?`;
                    const ts =
                        f.time?.scheduled?.departure ??
                        f.time?.estimated?.departure ??
                        f.time?.real?.departure ??
                        null;
                    if (!ts) {
                        console.log('⏱️ [FlightAPI.io] 날짜 필터: 출발시각 없음으로 제외', {
                            flight: flightId,
                            airline: f.airline?.code?.iata || f.owner?.code?.iata || null,
                            rawTime: f.time || null,
                            targetDate: date,
                        });
                        return false;
                    }
                    const depDateObj = new Date(ts * 1000);
                    const flightDate = depDateObj.toISOString().slice(0, 10);
                    if (flightDate !== date) {
                        console.log('📆 [FlightAPI.io] 날짜 필터: 날짜 불일치로 제외', {
                            flight: flightId,
                            airline: f.airline?.code?.iata || f.owner?.code?.iata || null,
                            scheduledDepartureEpoch: ts,
                            scheduledDepartureLocal: depDateObj.toString(),
                            scheduledDepartureISO: depDateObj.toISOString(),
                            targetDate: date,
                            flightDate,
                        });
                        return false;
                    }
                }
                return true;
            })
            .map(f => {
                const primary = f.identification?.number?.default;
                if (primary) return String(primary).toUpperCase();
                const airlineCode = (f.airline?.code?.iata || f.owner?.code?.iata || '').toUpperCase();
                const altNum = f.identification?.number?.alternative;
                if (airlineCode && altNum) return airlineCode + String(altNum);
                return null;
            })
            .filter(Boolean);

        console.log('✈️ Parsed Flight Numbers (FlightAPI.io):', flights);
        const uniqueFlights = Array.from(new Set(flights)).sort();
        console.log('📋 Final Flight List (FlightAPI.io):', uniqueFlights);
        return uniqueFlights;
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
