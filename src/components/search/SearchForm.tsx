import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRightLeft, Search, RotateCcw, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ko, tr } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { FlightCombobox } from './FlightCombobox';
import { createSearchSchema, type SearchSchema } from '@/schemas/searchSchema';
import { useSearchStore } from '@/stores/useSearchStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { qs } from '@/utils/utils';

export default function SearchForm() {
    const { t, i18n } = useTranslation();
    const { apiKey } = useSettingsStore();
    const { searchFlights } = useSearchStore();

    const searchSchema = createSearchSchema(t);

    const form = useForm<SearchSchema>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            airline: '',
            origin: '',
            destination: '',
        },
    });

    // Initialize from URL
    useEffect(() => {
        const urlDate = qs.get('date');
        const urlAirline = qs.get('airline');
        const urlOrigin = qs.get('origin');
        const urlDestination = qs.get('destination');

        if (urlDate) form.setValue('date', urlDate);
        if (urlAirline) form.setValue('airline', urlAirline.toUpperCase());
        if (urlOrigin) form.setValue('origin', urlOrigin.toUpperCase());
        if (urlDestination) form.setValue('destination', urlDestination.toUpperCase());
    }, [form]);

    function onSubmit(data: SearchSchema) {
        searchFlights(data, apiKey);
    }

    const handleSwap = () => {
        const currentOrigin = form.getValues('origin');
        const currentDest = form.getValues('destination');
        form.setValue('origin', currentDest);
        form.setValue('destination', currentOrigin);
    };

    const handleDemo = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        form.setValue('date', today);
        form.setValue('airline', 'KE');
        form.setValue('origin', 'ICN');
        form.setValue('destination', 'NRT');

        // Trigger search manually or let user click search? 
        // Original behavior triggered search.
        searchFlights({
            date: today,
            airline: 'KE',
            origin: 'ICN',
            destination: 'NRT'
        }, apiKey, true);
    };

    const handleReset = () => {
        form.reset({
            date: format(new Date(), 'yyyy-MM-dd'),
            airline: '',
            origin: '',
            destination: '',
        });
        window.history.replaceState(null, '', window.location.pathname);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-xl border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Date */}
                    <div className="md:col-span-3">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col relative pb-6">
                                    <FormLabel>{t('dateLabel')}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP", {
                                                            locale: i18n.language.startsWith('ko') ? ko : i18n.language.startsWith('tr') ? tr : undefined
                                                        })
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                disabled={(date) => {
                                                    // Disable dates before today (allow today)
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today;
                                                }}
                                                initialFocus
                                                locale={i18n.language.startsWith('ko') ? ko : i18n.language.startsWith('tr') ? tr : undefined}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="absolute bottom-0 left-0 text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Airline */}
                    <div className="md:col-span-3">
                        <FormField
                            control={form.control}
                            name="airline"
                            render={({ field }) => (
                                <FormItem className="flex flex-col relative pb-6">
                                    <FormLabel>{t('airlineLabel')}</FormLabel>
                                    <FormControl>
                                        <FlightCombobox
                                            type="airline"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('airlineSelect')}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute bottom-0 left-0 text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Origin */}
                    <div className="md:col-span-3 relative">
                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem className="flex flex-col relative pb-6">
                                    <FormLabel>{t('originLabel')}</FormLabel>
                                    <FormControl>
                                        <FlightCombobox
                                            type="airport"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('originPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute bottom-0 left-0 text-xs" />
                                </FormItem>
                            )}
                        />
                        {/* Swap Button - Absolute positioned on desktop, relative on mobile */}
                        <div className="hidden md:flex absolute -right-6 top-8 z-10">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full border bg-background hover:bg-accent"
                                onClick={handleSwap}
                            >
                                <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-3">
                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem className="flex flex-col relative pb-6">
                                    <FormLabel>{t('destinationLabel')}</FormLabel>
                                    <FormControl>
                                        <FlightCombobox
                                            type="airport"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('destinationPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute bottom-0 left-0 text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Mobile Swap Button */}
                <div className="md:hidden flex justify-center -my-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={handleSwap}
                    >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Swap Origin & Destination
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" className="flex-1 md:flex-none">
                        <Search className="mr-2 h-4 w-4" />
                        {t('searchBtn')}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleDemo} title={t('demoBtn')}>
                        <Play className="mr-2 h-4 w-4" />
                        {t('demoBtn')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset} title={t('resetBtn')}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t('resetBtn')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
