import { $ } from './modules/utils.js';
import {
    t,
    setLanguage,
    updateUILanguage,
    setKeyStatus,
    renderCriteria,
    setLoading,
    renderFlights,
    showInputSection,
    currentLang,
    STORAGE_KEY
} from './modules/ui.js';
import {
    fetchFlights,
    PROVIDER,
    setProvider
} from './modules/api.js';
import {
    AutocompleteField,
    searchAirports
} from './modules/autocomplete.js';
import {
    qs,
    parseRoute,
    todayISO
} from './modules/utils.js';

// ======== 이벤트 & 흐름 ========
let originField, destinationField;

async function main() {
    // API 키 초기화
    const storedKey = localStorage.getItem(STORAGE_KEY) || '';
    $('#apiKey').value = storedKey;
    setKeyStatus(!!storedKey);

    // 자동완성 필드 초기화
    originField = new AutocompleteField('#originInput', '#originList');
    destinationField = new AutocompleteField('#destinationInput', '#destinationList');

    // 쿼리 파라미터 파싱
    const date = (qs.get('date') || '').trim();
    const airline = (qs.get('airline') || '').toUpperCase().trim();
    const route = (qs.get('route') || '').toUpperCase().trim();
    const { origin, destination } = parseRoute(route);

    // 개별 파라미터도 체크
    const originParam = (qs.get('origin') || origin || '').toUpperCase().trim();
    const destParam = (qs.get('destination') || destination || '').toUpperCase().trim();

    // UI 초기값
    $('#dateInput').value = date || todayISO();
    // $('#airlineInput').value = airline || ''; // Removed as it's now a free text input
    if (originParam) originField.setCode(originParam);
    if (destParam) destinationField.setCode(destParam);

    const hasAllParams = !!(date && airline && originParam && destParam);

    showInputSection(true); // Always show input section
    renderCriteria({ date: date || $('#dateInput').value, airline: airline || $('#airlineInput').value, origin: originParam || '', destination: destParam || '' });

    if (hasAllParams) {
        await doSearch({ date, airline, origin: originParam, destination: destParam });
    } else {
        // 입력 대기 상태
        $('#resultArea').innerHTML = `<div class="muted">${t('waitingForInput')}</div>`;
    }

    // Initialize language selector
    $('#langSelect').value = currentLang;
    updateUILanguage();
}

async function doSearch({ date, airline, origin, destination, forceDemo = false }) {
    try {
        console.log('🔍 Search initiated:', { date, airline, origin, destination, forceDemo });
        setLoading(true);
        renderCriteria({ date, airline, origin, destination });

        const apiKey = localStorage.getItem(STORAGE_KEY) || '';
        const usingDemo = forceDemo || (!apiKey && PROVIDER !== 'custom');

        console.log('🔑 API Key status:', apiKey ? 'Present' : 'Not found');
        console.log('🎯 Using mode:', usingDemo ? 'DEMO' : PROVIDER);

        const prevProvider = PROVIDER;
        if (usingDemo) setProvider('demo');

        const flights = await fetchFlights({ date, airline, origin, destination, apiKey });
        renderFlights(flights);

        if (usingDemo) setProvider(prevProvider);
        console.log('✅ Search completed successfully');
    } catch (err) {
        console.error('❌ Search failed:', err);
        let msg = (err && err.message) || err;
        if (msg.includes('HTTP 401') || msg.includes('API 키')) {
            msg = t('alertNoKey');
        } else if (msg.includes('HTTP 429')) {
            msg = 'API Rate Limit Exceeded. Please try again later.';
        }
        $('#resultArea').innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${msg}
            </div>
        `;
    } finally {
        setLoading(false);
    }
}

// 이벤트 바인딩
$('#langSelect').addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

$('#saveKey').addEventListener('click', () => {
    const v = $('#apiKey').value.trim();
    if (!v) { alert(t('alertNoKey')); return; }
    localStorage.setItem(STORAGE_KEY, v);
    setKeyStatus(true);
});

$('#editKey').addEventListener('click', () => {
    $('#apiKeyInputArea').style.display = 'block';
    $('#apiKeySavedArea').style.display = 'none';
    const storedKey = localStorage.getItem(STORAGE_KEY) || '';
    $('#apiKey').value = storedKey;
    $('#apiKey').focus();
});

$('#clearKey').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    $('#apiKey').value = '';
    setKeyStatus(false);
});

$('#searchBtn').addEventListener('click', () => {
    const date = $('#dateInput').value;
    const airline = $('#airlineInput').value;
    const origin = originField.getCode();
    const destination = destinationField.getCode();

    if (!date || !airline || !origin || !destination) {
        alert(t('alertSelectAll'));
        return;
    }

    // 주소창 쿼리 동기화(옵션)
    const next = new URL(location.href);
    next.searchParams.set('date', date);
    next.searchParams.set('airline', airline);
    next.searchParams.set('origin', origin);
    next.searchParams.set('destination', destination);
    history.replaceState(null, '', next.toString());

    doSearch({ date, airline, origin, destination });
});

$('#demoBtn').addEventListener('click', () => {
    const date = $('#dateInput').value || todayISO();
    const airline = $('#airlineInput').value || 'KE';
    const origin = originField.getCode() || 'ICN';
    const destination = destinationField.getCode() || 'NRT';
    doSearch({ date, airline, origin, destination, forceDemo: true });
});

// 초기 실행
main();
