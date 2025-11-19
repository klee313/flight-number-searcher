import { i18n } from '../data/locales.js';
import { $ } from './utils.js';
import { PROVIDER } from './api.js';

export const LANG_KEY = 'FLIGHT_LANG';
export let currentLang = localStorage.getItem(LANG_KEY) || 'en';

export function t(key) {
    return i18n[currentLang]?.[key] || i18n.en[key] || key;
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    updateUILanguage();
}

export function updateUILanguage() {
    // Update all UI text elements
    document.title = t('title');
    const h1 = $('header h1');
    // Find text node after the span
    for (let i = 0; i < h1.childNodes.length; i++) {
        if (h1.childNodes[i].nodeType === Node.TEXT_NODE) {
            h1.childNodes[i].textContent = ' ' + t('title');
            break;
        }
    }
    $('label[for="apiKey"]').textContent = t('apiKeyLabel');
    $('#apiKey').placeholder = t('apiKeyPlaceholder');
    $('#saveKey').textContent = t('saveBtn');
    $('#editKey').textContent = t('editBtn');
    $('#clearKey').textContent = t('clearBtn');
    $('#apiKeyInputArea .help').innerHTML = t('apiKeyHelp');
    $('#apiKeySavedArea .help').innerHTML = t('apiKeySavedHelp');
    $('label[for="dateInput"]').textContent = t('dateLabel');
    $('label[for="airlineInput"]').textContent = t('airlineLabel');
    $('label[for="originInput"]').textContent = t('originLabel');
    $('#originInput').placeholder = t('originPlaceholder');
    $('label[for="destinationInput"]').textContent = t('destinationLabel');
    $('#destinationInput').placeholder = t('destinationPlaceholder');
    $('#searchBtn').textContent = t('searchBtn');
    $('#demoBtn').textContent = t('demoBtn');
    $('#demoBtn').title = t('demoBtn');
    $('#inputHint').textContent = t('inputHint');
    $('footer small').textContent = t('footerText');
    // Update airline select options
    const airlineSelect = $('#airlineInput');
    airlineSelect.options[0].textContent = t('airlineSelect');
    // Update status if needed
    const storedKey = localStorage.getItem(STORAGE_KEY) || '';
    setKeyStatus(!!storedKey);
}

export const STORAGE_KEY = 'FLIGHT_API_KEY';

export function renderCriteria({ date, airline, origin, destination }) {
    const wrap = $('#criteria');
    wrap.innerHTML = '';
    const add = (label, value) => {
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = `${label}: ${value || '-'}`;
        wrap.appendChild(el);
    };
    add(t('datePrefix'), date || '-');
    add(t('airlinePrefix'), airline || '-');
    add(t('routePrefix'), origin && destination ? `${origin}→${destination}` : '-');
    const providerChip = document.createElement('span');
    providerChip.className = 'chip';
    providerChip.textContent = `${t('providerPrefix')}: ${PROVIDER}`;
    wrap.appendChild(providerChip);
}

export function renderFlights(list) {
    const area = $('#resultArea');
    area.innerHTML = '';
    if (!list?.length) {
        area.innerHTML = `<div class="muted">${t('noResults')}</div>`;
        return;
    }
    list.forEach(item => {
        if (!item) return;
        const isObj = typeof item === 'object';
        const flightNumber = isObj ? (item.flightNumber || item.number || item.fn || '') : item;
        const departureTimeText = isObj ? item.departureTimeText : null;

        const row = document.createElement('div');
        row.className = 'flight';
        row.innerHTML = `
      <div class="left">
        <span class="badge">${t('flightLabel')}</span>
        <strong style="letter-spacing:.4px">${flightNumber}</strong>
        ${departureTimeText ? `<span class="muted" style="margin-left:6px;">(${departureTimeText})</span>` : ''}
      </div>
    `;
        row.addEventListener('click', () => showFlightDetail(item));
        area.appendChild(row);
    });
}

export function setLoading(on, msg) {
    const host = $('#loadState');
    if (on) {
        const loadMsg = msg || t('searching');
        host.innerHTML = `<div class="row"><div class="spinner"></div><span class="muted">${loadMsg}</span></div>`;
    } else {
        host.innerHTML = '';
    }
}

export function showInputSection(show) {
    $('#input-section').hidden = !show;
}

export function setKeyStatus(exists) {
    const node = $('#keyStatus');
    node.textContent = exists ? t('statusActive') : t('statusInactive');
    node.style.borderColor = exists ? 'rgba(46,196,182,.35)' : 'var(--border)';
    node.style.background = exists ? 'rgba(46,196,182,.1)' : 'var(--pill)';
    node.style.color = exists ? 'var(--ok)' : 'var(--muted)';
    // Toggle UI based on key existence
    if (exists) {
        $('#apiKeyInputArea').style.display = 'none';
        $('#apiKeySavedArea').style.display = 'block';
    } else {
        $('#apiKeyInputArea').style.display = 'block';
        $('#apiKeySavedArea').style.display = 'none';
    }
}

// Modal Logic
const modal = $('#flightModal');
const closeModalBtn = $('#closeModal');

if (modal) {
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.hidden = true, 200);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.hidden = true, 200);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            setTimeout(() => modal.hidden = true, 200);
        }
    });
}

function showFlightDetail(flightData) {
    if (!modal) return;

    const isObj = typeof flightData === 'object';
    const flightNumber = isObj ? (flightData.flightNumber || flightData.number || flightData.fn || '') : flightData;
    const airline = isObj ? (flightData.airline || '-') : '-';
    const origin = isObj ? (flightData.origin || '-') : '-';
    const destination = isObj ? (flightData.destination || '-') : '-';
    const departureTime = isObj ? (flightData.departureTimeText || '-') : '-';

    $('#modalFlight').textContent = flightNumber;
    $('#modalAirline').textContent = airline;
    $('#modalRoute').textContent = `${origin} → ${destination}`;
    $('#modalTime').textContent = departureTime;

    modal.hidden = false;
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => modal.classList.add('show'), 10);
}
