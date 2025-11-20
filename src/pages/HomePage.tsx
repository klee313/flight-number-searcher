import { useTranslation } from 'react-i18next';
import SearchForm from '@/components/search/SearchForm';
import FlightList from '@/components/results/FlightList';
import FlightDetailModal from '@/components/details/FlightDetailModal';
import { useSearchStore } from '@/stores/useSearchStore';
import { PROVIDER } from '@/services/api';

export default function HomePage() {
    const { t } = useTranslation();
    const { criteria } = useSearchStore();

    return (
        <div className="space-y-8">
            <SearchForm />

            <section id="result-section" className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {criteria && (
                            <>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                    {t('datePrefix')}: {criteria.date}
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {t('airlinePrefix')}: {criteria.airline}
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {t('routePrefix')}: {criteria.origin}→{criteria.destination}
                                </span>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-muted text-muted-foreground hover:bg-muted/80">
                                    {t('providerPrefix')}: {PROVIDER}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <FlightList />
                </div>
            </section>

            <FlightDetailModal />
        </div>
    );
}
