export const $ = sel => document.querySelector(sel);
export const qs = new URLSearchParams(location.search);

export function parseRoute(routeStr) {
    if (!routeStr) return { origin: '', destination: '' };
    const [origin, destination] = routeStr.split('-').map(s => (s || '').toUpperCase().trim());
    return { origin, destination };
}

export function todayISO() {
    const d = new Date();
    const tzOff = d.getTimezoneOffset();
    const d2 = new Date(d.getTime() - tzOff * 60000);
    return d2.toISOString().slice(0, 10);
}

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
