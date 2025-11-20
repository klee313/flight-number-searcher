import { t } from 'i18next';
import { useSearchStore } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, AlertCircle } from 'lucide-react';

export default function FlightList() {
    const { flights, loading, error } = useSearchStore();
    const { selectFlight } = useUIStore();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">{t('searching')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                    <strong className="block font-semibold">Error</strong>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!flights || flights.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                {t('noResults')}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {flights.map((item, index) => {
                const flightNumber = item.flightNumber || '';
                const departureTimeText = item.departureTimeText;

                return (
                    <Card
                        key={index}
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-primary"
                        onClick={() => selectFlight(item)}
                    >
                        <CardContent className="flex items-center p-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Plane className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                                            {t('flightLabel')}
                                        </Badge>
                                        <span className="font-bold text-lg tracking-tight">{flightNumber}</span>
                                    </div>
                                    {departureTimeText && (
                                        <span className="text-sm text-muted-foreground mt-1">
                                            {departureTimeText}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
