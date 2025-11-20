import { sleep } from '../utils/utils.js';
import type { FlightSearchParams, FlightResult, Provider } from '../types';

// 제공자 선택: 'flightapi' | 'aviationstack' | 'airlabs' | 'custom' | 'demo'
export let PROVIDER: Provider = 'flightapi';

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
async function fetchFlightsFromProvider(p: FlightSearchParams): Promise<FlightResult[]> {
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

        console.log('🛫 FlightAPI.io Schedule Request (Page 1):', url.toString());
        const res = await fetch(url.toString());
        if (!res.ok) {
            console.error('❌ FlightAPI.io HTTP Error:', res.status, res.statusText);
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('✅ FlightAPI.io Schedule Response (Page 1):', data);

        // 데이터 위치
        // data.airport.pluginData.schedule.departures.data
        // data.airport.pluginData.schedule.departures.page
        const scheduleData = data?.airport?.pluginData?.schedule?.[mode] || {};
        let scheduleItems = scheduleData.data || [];

        // 페이지네이션 처리
        const pageInfo = scheduleData.page || {};
        const totalPages = pageInfo.total || 1;

        if (totalPages > 1) {
            console.log(`📚 Total pages found: ${totalPages}. Fetching remaining pages...`);
            const promises = [];
            for (let p = 2; p <= totalPages; p++) {
                const nextUrl = new URL(url.toString());
                nextUrl.searchParams.set('page', String(p));
                promises.push(
                    fetch(nextUrl.toString())
                        .then(r => {
                            if (!r.ok) throw new Error(`Page ${p} HTTP ${r.status}`);
                            return r.json();
                        })
                        .then(d => {
                            const items = d?.airport?.pluginData?.schedule?.[mode]?.data || [];
                            console.log(`✅ Page ${p} fetched: ${items.length} items`);
                            return items;
                        })
                        .catch(e => {
                            console.error(`❌ Failed to fetch page ${p}:`, e);
                            return [];
                        })
                );
            }

            const results = await Promise.all(promises);
            results.forEach(items => {
                scheduleItems = scheduleItems.concat(items);
            });
        }

        console.log('📊 FlightAPI.io schedule items (Total):', Array.isArray(scheduleItems) ? scheduleItems.length : 0);

        // 항공편명 리스트 추출 + 조건 필터링
        const filteredFlights = scheduleItems
            .map((item: any) => item?.flight)
            .filter(Boolean)
            .filter((f: any) => {
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
            });

        const enriched = filteredFlights
            .map((f: any) => {
                const primary = f.identification?.number?.default;
                const airlineCode = (f.airline?.code?.iata || f.owner?.code?.iata || '').toUpperCase();
                if (!primary && !airlineCode) return null;

                const ts =
                    f.time?.scheduled?.departure ??
                    f.time?.estimated?.departure ??
                    f.time?.real?.departure ??
                    null;

                let departureTimeText = null;
                let departureTimeLocalISO = null;
                if (ts) {
                    // 출발 공항 타임존(offset 초)을 사용해 로컬 출발 시각 계산
                    const offsetSec = f.airport?.origin?.timezone?.offset;
                    const offsetMs = typeof offsetSec === 'number' ? offsetSec * 1000 : 0;
                    const originDate = new Date(ts * 1000 + offsetMs);
                    const h = String(originDate.getUTCHours()).padStart(2, '0');
                    const m = String(originDate.getUTCMinutes()).padStart(2, '0');
                    departureTimeText = `${h}:${m}`;
                    departureTimeLocalISO = originDate.toISOString();
                }

                const flightNumber = String(
                    primary ||
                    (airlineCode && f.identification?.number?.alternative
                        ? airlineCode + String(f.identification.number.alternative)
                        : primary || '')
                ).toUpperCase();

                if (!flightNumber) return null;

                return {
                    flightNumber,
                    airline: airlineCode || null,
                    origin: origin || null,
                    destination: (f.airport?.destination?.code?.iata || '').toUpperCase() || null,
                    departureEpoch: ts,
                    departureTimeLocalISO,
                    departureTimeText,
                };
            })
            .filter(Boolean);

        // flightNumber + 출발시각 기준으로 중복 제거
        const seen = new Set();
        const uniqueFlights = enriched.filter((item: FlightResult) => {
            const key = `${item.flightNumber}|${item.departureTimeText || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        console.log('✈️ Parsed Flights with time (FlightAPI.io):', uniqueFlights);
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
            .map((item: any) => item?.flight?.iata || (item?.airline?.iata && item?.flight?.number ? `${item.airline.iata}${item.flight.number}` : null))
            .filter(Boolean) as string[];
        console.log('✈️ Parsed Flight Numbers:', flights);
        const uniqueFlights = Array.from(new Set(flights)).sort();
        console.log('📋 Final Flight List:', uniqueFlights);
        return uniqueFlights.map(fn => ({ flightNumber: fn, airline: null, origin: null, destination: null }));
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
            .map((item: any) => item?.flight_iata || item?.flight_number || null)
            .filter(Boolean) as string[];
        console.log('✈️ Parsed Flight Numbers:', flights);
        // 중복 제거 + 정렬
        const uniqueFlights = Array.from(new Set(flights)).sort();
        console.log('📋 Final Flight List:', uniqueFlights);
        return uniqueFlights.map(fn => ({ flightNumber: fn, airline: null, origin: null, destination: null }));
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
