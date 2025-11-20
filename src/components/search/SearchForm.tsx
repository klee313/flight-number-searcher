import { useState, useEffect } from 'react';
import Autocomplete from './Autocomplete';
import { t } from '../../data/locales';
import { ArrowRightLeft } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useSearchStore } from '../../stores/useSearchStore';
import { qs } from '../../utils/utils';
import { AIRLINES } from '../../data/airlines';
import { AIRPORTS } from '../../data/airports';

// Helper function to get local date in YYYY-MM-DD format
const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Constants
const INPUT_WIDTH = '80px';
const INPUT_GAP = '12px';

// Shared styles
const detailTextStyle = {
    flex: 1,
    fontSize: '13px',
    color: 'var(--muted)',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
};

// Helper component for displaying detail text next to input
interface DetailDisplayProps {
    code: string;
    type: 'airline' | 'airport';
    alignBottom?: boolean;
}

function DetailDisplay({ code, type, alignBottom = false }: DetailDisplayProps) {
    if (!code) return null;

    const upperCode = code.toUpperCase();
    let displayText = '';

    if (type === 'airline') {
        const airline = AIRLINES.find(a => a.code === upperCode);
        displayText = airline?.name || '';
    } else {
        const airport = AIRPORTS.find(a => a.code === upperCode);
        displayText = airport ? `${airport.cityEn} (${airport.city})` : '';
    }

    if (!displayText) return null;

    return (
        <div style={{
            ...detailTextStyle,
            paddingBottom: alignBottom ? '12px' : '0'
        }}>
            {displayText}
        </div>
    );
}

export default function SearchForm() {
    const { apiKey } = useSettingsStore();
    const { searchFlights } = useSearchStore();
    const [date, setDate] = useState(getLocalDateString());
    const [airline, setAirline] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');

    // Initialize form fields from URL query parameters
    useEffect(() => {
        const urlDate = qs.get('date');
        const urlAirline = qs.get('airline');
        const urlOrigin = qs.get('origin');
        const urlDestination = qs.get('destination');

        if (urlDate) setDate(urlDate);
        if (urlAirline) setAirline(urlAirline);
        if (urlOrigin) setOrigin(urlOrigin);
        if (urlDestination) setDestination(urlDestination);
    }, []);

    const handleSwap = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    const handleSearch = () => {
        if (!date || !airline || !origin || !destination) {
            alert(t('alertSelectAll'));
            return;
        }
        searchFlights({ date, airline, origin, destination }, apiKey);
    };

    const handleDemo = () => {
        const today = new Date().toISOString().slice(0, 10);
        searchFlights({
            date: date || today,
            airline: airline || 'KE',
            origin: origin || 'ICN',
            destination: destination || 'NRT'
        }, apiKey, true);
    };

    const handleReset = () => {
        setDate(getLocalDateString());
        setAirline('');
        setOrigin('');
        setDestination('');
        window.history.replaceState(null, '', window.location.pathname);
    };

    return (
        <section className="panel">
            <div className="grid">
                {/* First Row: Date, Spacer, Airline */}
                <div className="col-12">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Date Input */}
                        <div style={{ flex: 1 }}>
                            <label>{t('dateLabel')}</label>
                            <input
                                type="date"
                                value={date}
                                min={getLocalDateString()}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        {/* Spacer to align with swap button */}
                        <div style={{ width: '36px', paddingTop: '32px' }}></div>

                        {/* Airline Input */}
                        <div style={{ flex: 1 }}>
                            <label>{t('airlineLabel')}</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: INPUT_GAP }}>
                                <div style={{ width: INPUT_WIDTH }}>
                                    <Autocomplete
                                        value={airline}
                                        onChange={setAirline}
                                        type="airline"
                                        placeholder="KE"
                                    />
                                </div>
                                <DetailDisplay code={airline} type="airline" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Origin and Destination */}
                <div className="col-12">
                    <div className="row align-center" style={{ gap: '10px' }}>
                        {/* Origin */}
                        <div style={{ flex: 1 }}>
                            <label>{t('originLabel')}</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: INPUT_GAP }}>
                                <div style={{ width: INPUT_WIDTH }}>
                                    <Autocomplete
                                        value={origin}
                                        onChange={setOrigin}
                                        type="airport"
                                        placeholder="ICN"
                                    />
                                </div>
                                <DetailDisplay code={origin} type="airport" />
                            </div>
                        </div>

                        {/* Swap Button */}
                        <div style={{ paddingTop: '24px' }}>
                            <button
                                className="icon-btn"
                                title="Swap Origin and Destination"
                                onClick={handleSwap}
                                style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ArrowRightLeft size={16} />
                            </button>
                        </div>

                        {/* Destination */}
                        <div style={{ flex: 1 }}>
                            <label>{t('destinationLabel')}</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: INPUT_GAP }}>
                                <div style={{ width: INPUT_WIDTH }}>
                                    <Autocomplete
                                        value={destination}
                                        onChange={setDestination}
                                        type="airport"
                                        placeholder="NRT"
                                    />
                                </div>
                                <DetailDisplay code={destination} type="airport" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="col-12 row">
                    <button className="btn" onClick={handleSearch}>{t('searchBtn')}</button>
                    <button className="btn secondary" onClick={handleDemo} title={t('demoBtn')}>
                        {t('demoBtn')}
                    </button>
                    <button className="btn secondary" onClick={handleReset} title={t('resetBtn')}>
                        {t('resetBtn')}
                    </button>
                </div>
            </div>
        </section>
    );
}
