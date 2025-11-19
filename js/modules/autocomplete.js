import { AIRPORTS } from '../data/airports.js';
import { AIRLINES } from '../data/airlines.js';
import { $ } from './utils.js';
import { currentLang } from './ui.js';

// ======== 공항 검색 ========
export function searchAirports(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return AIRPORTS.filter(ap => {
        return ap.code.toLowerCase().includes(q) ||
            ap.city.includes(query) ||
            ap.cityEn.toLowerCase().includes(q) ||
            ap.airport.includes(query);
    }).slice(0, 10); // 최대 10개
}

export function getAirportByCode(code) {
    return AIRPORTS.find(ap => ap.code.toUpperCase() === code.toUpperCase());
}

// ======== 항공사 검색 ========
export function searchAirlines(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return AIRLINES.filter(al => {
        return al.code.toLowerCase().includes(q) ||
            al.name.toLowerCase().includes(q);
    }).slice(0, 10); // 최대 10개
}

export function getAirlineByCode(code) {
    return AIRLINES.find(al => al.code.toUpperCase() === code.toUpperCase());
}


// 자동완성 UI
export class AutocompleteField {
    constructor(inputId, listId, type = 'airport') {
        this.input = $(inputId);
        this.list = $(listId);
        this.type = type;
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
        this.results = this.type === 'airport' ? searchAirports(query) : searchAirlines(query);

        if (this.results.length > 0) {
            this.render();
            this.show();
        } else {
            this.hide();
        }

        // 정확히 코드만 입력한 경우 자동 선택
        const exact = this.type === 'airport' ? getAirportByCode(query) : getAirlineByCode(query);
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
        if (this.type === 'airport') {
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
        } else { // airline
            this.results.forEach((al, idx) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item' + (idx === this.selectedIndex ? ' selected' : '');
                item.innerHTML = `
            <div>
              <span class="code">${al.code}</span>
              <span class="info">${al.name}</span>
            </div>
          `;
                item.addEventListener('click', () => this.select(al));
                this.list.appendChild(item);
            });
        }
    }
    select(item) {
        this.selectedCode = item.code;
        if (this.type === 'airport') {
            const cityName = currentLang === 'en' ? item.cityEn : item.city;
            this.input.value = `${item.code} - ${cityName}`;
        } else { // airline
            this.input.value = `${item.code} - ${item.name}`;
        }
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
        // "XXX - " 형식 (IATA 코드 추출)
        const match = val.match(/^([A-Z0-9]{2,3})\s*-/);
        if (match) return match[1];

        // 그냥 2~3글자 대문자 코드 (공항/항공사 목록에 없는 코드도 허용)
        if (/^[A-Z0-9]{2,3}$/.test(val)) {
            return val; // 유효성 검사 없이 직접 반환
        }

        // 이름으로 검색해서 첫번째 결과
        const results = this.type === 'airport' ? searchAirports(val) : searchAirlines(val);
        if (results.length > 0) {
            return results[0].code;
        }
        // 선택된 코드가 없고, 파싱이나 검색 결과도 없으면 raw input을 반환
        return val;
    }
    setCode(code) {
        const item = this.type === 'airport' ? getAirportByCode(code) : getAirlineByCode(code);
        if (item) {
            this.selectedCode = item.code;
            if (this.type === 'airport') {
                const cityName = currentLang === 'en' ? item.cityEn : item.city;
                this.input.value = `${item.code} - ${cityName}`;
            } else {
                this.input.value = `${item.code} - ${item.name}`;
            }
        } else {
            this.input.value = code;
        }
    }
}
