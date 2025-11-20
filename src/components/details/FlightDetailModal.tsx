import Modal from '../ui/Modal';
import { t } from '../../data/locales';
import { useUIStore } from '../../stores/useUIStore';
import { AIRLINES } from '../../data/airlines';
import { AIRPORTS } from '../../data/airports';

export default function FlightDetailModal() {
    const { selectedFlight, clearSelectedFlight } = useUIStore();

    if (!selectedFlight) return null;

    const flightNumber = selectedFlight.flightNumber || '';
    const airlineCode = selectedFlight.airline || '';
    const originCode = selectedFlight.origin || '';
    const destinationCode = selectedFlight.destination || '';
    const departureTime = selectedFlight.departureTimeText || '-';

    // Get airline name
    const airline = AIRLINES.find(a => a.code === airlineCode);
    const airlineName = airline ? `${airline.name} (${airlineCode})` : airlineCode;

    // Get airport names
    const originAirport = AIRPORTS.find(a => a.code === originCode);
    const destinationAirport = AIRPORTS.find(a => a.code === destinationCode);

    const originName = originAirport
        ? `${originAirport.city} (${originCode}) - ${originAirport.airport}`
        : originCode;

    const destinationName = destinationAirport
        ? `${destinationAirport.city} (${destinationCode}) - ${destinationAirport.airport}`
        : destinationCode;

    return (
        <Modal isOpen={!!selectedFlight} onClose={clearSelectedFlight} title={t('flightDetailsTitle')}>
            <div className="detail-row">
                <span className="label">{t('flightNumber')}</span>
                <span className="value">{flightNumber}</span>
            </div>
            <div className="detail-row">
                <span className="label">{t('airlineLabel')}</span>
                <span className="value">{airlineName}</span>
            </div>
            <div className="detail-row">
                <span className="label">{t('originLabel')}</span>
                <span className="value">{originName}</span>
            </div>
            <div className="detail-row">
                <span className="label">{t('destinationLabel')}</span>
                <span className="value">{destinationName}</span>
            </div>
            <div className="detail-row">
                <span className="label">{t('departureLabel')}</span>
                <span className="value">{departureTime}</span>
            </div>
        </Modal>
    );
}
