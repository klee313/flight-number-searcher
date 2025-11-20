// export const $ = sel => document.querySelector(sel);
export const qs = new URLSearchParams(location.search);

export function parseRoute(routeStr: string): { origin: string; destination: string } {
    if (!routeStr) return { origin: '', destination: '' };
    const [origin, destination] = routeStr.split('-').map((s: string) => (s || '').toUpperCase().trim());
    return { origin, destination };
}

export function todayISO(): string {
    const d = new Date();
    const tzOff = d.getTimezoneOffset();
    const d2 = new Date(d.getTime() - tzOff * 60000);
    return d2.toISOString().slice(0, 10);
}

export function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
