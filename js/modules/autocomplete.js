import { AIRPORTS } from '../data/airports.js';
import { $ } from './utils.js';
import { currentLang } from './ui.js';

// ======== 공항 검색 ========
function searchAirports(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return AIRPORTS.filter(ap => {
        return ap.code.toLowerCase().includes(q) ||
            ap.city.includes(query) ||
            ap.cityEn.toLowerCase().includes(q) ||
            ap.airport.includes(query);
    }).slice(0, 10); // 최대 10개
}

function getAirportByCode(code) {
    return AIRPORTS.find(ap => ap.code.toUpperCase() === code.toUpperCase());
}

// 자동완성 UI
export class AutocompleteField {
    constructor(inputId, listId) {
        this.input = $(inputId);
        this.list = $(listId);
        this.selectedCode = '';
        this.selectedIndex = -1;
        this.results = [];
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('focus', () => this.handleInput());
        this.input.addEventListener('blur', () => setTimeout(() => this.hide(), 200));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        // 외부 클릭시 닫기
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.list.contains(e.target)) {
                this.hide();
            }
        });
    }
    handleInput() {
        const query = this.input.value.trim();
        this.results = searchAirports(query);
        if (this.results.length > 0) {
            this.render();
            this.show();
        } else {
            this.hide();
        }
        // 정확히 코드만 입력한 경우 자동 선택
        const exact = getAirportByCode(query);
        if (exact) {
            this.selectedCode = exact.code;
        } else {
            this.selectedCode = '';
        }
    }
    handleKeydown(e) {
        if (!this.list.classList.contains('show')) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
            this.render();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
            this.render();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
                this.select(this.results[this.selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            this.hide();
        }
    }
    render() {
        this.list.innerHTML = '';
        this.results.forEach((ap, idx) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item' + (idx === this.selectedIndex ? ' selected' : '');
            const cityName = currentLang === 'en' ? ap.cityEn : ap.city;
            item.innerHTML = `
        <div>
          <span class="code">${ap.code}</span>
          <span class="info">${cityName} - ${ap.airport}</span>
        </div>
      `;
            item.addEventListener('click', () => this.select(ap));
            this.list.appendChild(item);
        });
    }
    select(airport) {
        this.selectedCode = airport.code;
        const cityName = currentLang === 'en' ? airport.cityEn : airport.city;
        this.input.value = `${airport.code} - ${cityName}`;
        this.hide();
    }
    show() {
        this.list.classList.add('show');
    }
    hide() {
        this.list.classList.remove('show');
        this.selectedIndex = -1;
    }
    getCode() {
        // 먼저 선택된 코드 반환
        if (this.selectedCode) return this.selectedCode;
        // 입력값에서 코드 추출 시도
        const val = this.input.value.trim();
        // "ICN - 인천" 형식
        const match = val.match(/^([A-Z]{3})\s*-/);
        if (match) return match[1];
        // 그냥 3글자 대문자 코드
        if (/^[A-Z]{3}$/.test(val)) {
            const ap = getAirportByCode(val);
            return ap ? ap.code : '';
        }
        // 도시명으로 검색해서 첫번째 결과
        const results = searchAirports(val);
        return results.length > 0 ? results[0].code : '';
    }
    setCode(code) {
        const ap = getAirportByCode(code);
        if (ap) {
            this.selectedCode = ap.code;
            const cityName = currentLang === 'en' ? ap.cityEn : ap.city;
            this.input.value = `${ap.code} - ${cityName}`;
        } else {
            this.input.value = code;
        }
    }
}
