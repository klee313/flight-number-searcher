import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Clock, Hash } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { AIRLINES } from '../../data/airlines';
import { AIRPORTS } from '../../data/airports';

export default function FlightDetailModal() {
    const { t } = useTranslation();
    const { selectedFlight, clearSelectedFlight } = useUIStore();

    if (!selectedFlight) return null;

    const flightNumber = selectedFlight.flightNumber || '';
    const airlineCode = selectedFlight.airline || '';
    const originCode = selectedFlight.origin || '';
    const destinationCode = selectedFlight.destination || '';
    const departureTime = selectedFlight.departureTimeText || '-';

    // Get airline name
    const airline = AIRLINES.find(a => a.code === airlineCode);
    const airlineName = airline ? airline.name : airlineCode;

    // Get airport names
    const originAirport = AIRPORTS.find(a => a.code === originCode);
    const destinationAirport = AIRPORTS.find(a => a.code === destinationCode);

    return (
        <Dialog open={!!selectedFlight} onOpenChange={(open) => !open && clearSelectedFlight()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Plane className="h-5 w-5 text-primary" />
                        {t('flightDetailsTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('flightLabel')} <span className="font-bold text-foreground">{flightNumber}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Airline Info */}
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">{t('airlineLabel')}</span>
                            <span className="font-semibold text-lg">{airlineName}</span>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                            {airlineCode}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Origin */}
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {t('originLabel')}
                            </span>
                            <span className="text-2xl font-bold text-primary">{originCode}</span>
                            <span className="text-sm text-muted-foreground truncate max-w-[120px]" title={originAirport?.airport}>
                                {originAirport?.city || originCode}
                            </span>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center justify-center px-2">
                            <Plane className="h-6 w-6 text-muted-foreground rotate-90" />
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col gap-1 text-right items-end">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                {t('destinationLabel')} <MapPin className="h-3 w-3" />
                            </span>
                            <span className="text-2xl font-bold text-primary">{destinationCode}</span>
                            <span className="text-sm text-muted-foreground truncate max-w-[120px]" title={destinationAirport?.airport}>
                                {destinationAirport?.city || destinationCode}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Time & Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 p-3 rounded-md border bg-card">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {t('departureLabel')}
                            </span>
                            <span className="font-mono font-medium">{departureTime}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-md border bg-card">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" /> {t('flightNumber')}
                            </span>
                            <span className="font-mono font-medium">{flightNumber}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
