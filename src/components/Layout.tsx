import { Outlet, Link } from 'react-router-dom';
import { Settings, Plane } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function Layout() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <Plane className="h-5 w-5 text-primary" />
                        {t('title')}
                    </Link>
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/settings" title={t('settingsTitle')}>
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">{t('settingsTitle')}</span>
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto py-6 px-4">
                <Outlet />
            </main>

            <footer className="border-t py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    {t('footerText')}
                </div>
            </footer>
        </div>
    );
}
