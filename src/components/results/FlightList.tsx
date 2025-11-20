import { t } from '../../data/locales';
import { useSearchStore } from '../../stores/useSearchStore';
import { useUIStore } from '../../stores/useUIStore';

export default function FlightList() {
    const { flights, loading, error } = useSearchStore();
    const { selectFlight } = useUIStore();

    if (loading) {
        return (
            <div className="row">
                <div className="spinner"></div>
                <span className="muted">{t('searching')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--error, #ef4444)'
            }}>
                <strong>⚠️ Error</strong>
                <p style={{ marginTop: '8px', marginBottom: 0 }}>{error}</p>
            </div>
        );
    }

    if (!flights || flights.length === 0) {
        return <div className="muted">{t('noResults')}</div>;
    }

    return (
        <div className="list">
            {flights.map((item, index) => {
                const flightNumber = item.flightNumber || '';
                const departureTimeText = item.departureTimeText;

                return (
                    <div key={index} className="flight" onClick={() => selectFlight(item)}>
                        <div className="left">
                            <span className="badge">{t('flightLabel')}</span>
                            <strong style={{ letterSpacing: '.4px' }}>{flightNumber}</strong>
                            {departureTimeText && (
                                <span className="muted" style={{ marginLeft: '6px' }}>
                                    ({departureTimeText})
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
